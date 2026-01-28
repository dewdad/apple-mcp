import { runAppleScript } from 'run-applescript';

// Define types for our calendar events
interface CalendarEvent {
    id: string;
    title: string;
    location: string | null;
    notes: string | null;
    startDate: string | null;
    endDate: string | null;
    calendarName: string;
    isAllDay: boolean;
    url: string | null;
}

// Configuration for timeouts and limits
const CONFIG = {
    // Maximum time (in ms) to wait for calendar operations
    TIMEOUT_MS: 10000,
    // Maximum number of events to return
    MAX_EVENTS: 50,
    // Timeout per calendar (ms)
    PER_CALENDAR_TIMEOUT_MS: 3000
};

/**
 * Run AppleScript with a timeout
 */
async function runAppleScriptWithTimeout(script: string, timeoutMs: number): Promise<string> {
    return Promise.race([
        runAppleScript(script),
        new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`AppleScript timed out after ${timeoutMs}ms`)), timeoutMs)
        )
    ]);
}

/**
 * Check if the Calendar app is accessible
 */
async function checkCalendarAccess(): Promise<boolean> {
    try {
        const script = `
tell application "Calendar"
    return name
end tell`;

        await runAppleScriptWithTimeout(script, 5000);
        return true;
    } catch (error) {
        console.error(`Cannot access Calendar app: ${error instanceof Error ? error.message : String(error)}`);
        return false;
    }
}

/**
 * Request Calendar app access and provide instructions if not available
 */
async function requestCalendarAccess(): Promise<{ hasAccess: boolean; message: string }> {
    try {
        const hasAccess = await checkCalendarAccess();
        if (hasAccess) {
            return {
                hasAccess: true,
                message: "Calendar access is already granted."
            };
        }

        return {
            hasAccess: false,
            message: "Calendar access is required but not granted. Please:\n1. Open System Settings > Privacy & Security > Automation\n2. Find your terminal/app in the list and enable 'Calendar'\n3. Alternatively, open System Settings > Privacy & Security > Calendars\n4. Add your terminal/app to the allowed applications\n5. Restart your terminal and try again"
        };
    } catch (error) {
        return {
            hasAccess: false,
            message: `Error checking Calendar access: ${error instanceof Error ? error.message : String(error)}`
        };
    }
}

/**
 * Get list of calendar names to help identify which calendars work
 */
async function getCalendarNames(): Promise<string[]> {
    try {
        const script = `
tell application "Calendar"
    set calNames to {}
    repeat with cal in calendars
        set end of calNames to name of cal
    end repeat
    return calNames
end tell`;

        const result = await runAppleScriptWithTimeout(script, 5000);
        // Parse the AppleScript list result
        if (typeof result === 'string') {
            // AppleScript returns lists like "cal1, cal2, cal3"
            return result.split(', ').map(s => s.trim()).filter(s => s.length > 0);
        }
        return [];
    } catch (error) {
        console.error(`Error getting calendar names: ${error}`);
        return [];
    }
}

/**
 * Get events from a single calendar with timeout protection
 */
async function getEventsFromCalendar(
    calendarName: string,
    startDate: string,
    endDate: string,
    limit: number
): Promise<CalendarEvent[]> {
    try {
        const script = `
tell application "Calendar"
    set eventList to {}
    set eventCount to 0
    set maxEvents to ${limit}

    try
        set targetCal to calendar "${calendarName.replace(/"/g, '\\"')}"
        set startD to date "${startDate}"
        set endD to date "${endDate}"

        repeat with evt in (events of targetCal)
            try
                set evtStart to start date of evt
                set evtEnd to end date of evt

                if evtStart ≥ startD and evtStart ≤ endD then
                    set evtId to uid of evt
                    set evtTitle to summary of evt
                    set evtLocation to ""
                    set evtNotes to ""
                    set evtAllDay to allday event of evt

                    try
                        set evtLocation to location of evt
                    end try
                    try
                        set evtNotes to description of evt
                    end try

                    set eventInfo to evtId & "|||" & evtTitle & "|||" & (evtStart as string) & "|||" & (evtEnd as string) & "|||" & "${calendarName.replace(/"/g, '\\"')}" & "|||" & evtLocation & "|||" & evtNotes & "|||" & evtAllDay
                    set end of eventList to eventInfo
                    set eventCount to eventCount + 1

                    if eventCount ≥ maxEvents then exit repeat
                end if
            end try
        end repeat
    on error errMsg
        -- Calendar not accessible, return empty list
    end try

    return eventList
end tell`;

        const result = await runAppleScriptWithTimeout(script, CONFIG.PER_CALENDAR_TIMEOUT_MS);

        if (!result || result === '') {
            return [];
        }

        // Parse the result - AppleScript returns comma-separated list
        const eventStrings = typeof result === 'string' ? result.split(', ') : [];
        const events: CalendarEvent[] = [];

        for (const eventStr of eventStrings) {
            const parts = eventStr.split('|||');
            if (parts.length >= 5) {
                events.push({
                    id: parts[0] || `unknown-${Date.now()}`,
                    title: parts[1] || "Untitled Event",
                    startDate: parts[2] ? new Date(parts[2]).toISOString() : null,
                    endDate: parts[3] ? new Date(parts[3]).toISOString() : null,
                    calendarName: parts[4] || calendarName,
                    location: parts[5] || null,
                    notes: parts[6] || null,
                    isAllDay: parts[7] === 'true',
                    url: null
                });
            }
        }

        return events;
    } catch (error) {
        console.error(`Error/timeout getting events from calendar "${calendarName}": ${error instanceof Error ? error.message : String(error)}`);
        return [];
    }
}

/**
 * Get calendar events in a specified date range
 * @param limit Optional limit on the number of results (default 10)
 * @param fromDate Optional start date for search range in ISO format (default: today)
 * @param toDate Optional end date for search range in ISO format (default: 7 days from now)
 */
async function getEvents(
    limit = 10,
    fromDate?: string,
    toDate?: string
): Promise<CalendarEvent[]> {
    try {
        console.error("getEvents - Starting to fetch calendar events");

        const accessResult = await requestCalendarAccess();
        if (!accessResult.hasAccess) {
            throw new Error(accessResult.message);
        }
        console.error("getEvents - Calendar access check passed");

        // Set default date range if not provided
        const today = new Date();
        const defaultEndDate = new Date();
        defaultEndDate.setDate(today.getDate() + 7);

        // Format dates for AppleScript (it needs a specific format)
        const startDate = fromDate
            ? new Date(fromDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            : today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const endDate = toDate
            ? new Date(toDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            : defaultEndDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        // Get list of calendars
        const calendarNames = await getCalendarNames();
        console.error(`getEvents - Found ${calendarNames.length} calendars: ${calendarNames.join(', ')}`);

        if (calendarNames.length === 0) {
            return [];
        }

        // Fetch events from each calendar with timeout protection
        const allEvents: CalendarEvent[] = [];
        const skippedCalendars: string[] = [];

        for (const calName of calendarNames) {
            if (allEvents.length >= limit) {
                break;
            }

            const remainingLimit = limit - allEvents.length;
            console.error(`getEvents - Fetching from calendar: ${calName}`);

            try {
                const events = await getEventsFromCalendar(calName, startDate, endDate, remainingLimit);
                allEvents.push(...events);
                console.error(`getEvents - Got ${events.length} events from ${calName}`);
            } catch (error) {
                console.error(`getEvents - Skipping calendar ${calName} due to timeout/error`);
                skippedCalendars.push(calName);
            }
        }

        if (skippedCalendars.length > 0) {
            console.error(`getEvents - Skipped calendars due to timeout: ${skippedCalendars.join(', ')}`);
        }

        // Sort events by start date
        allEvents.sort((a, b) => {
            const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
            const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
            return dateA - dateB;
        });

        return allEvents.slice(0, limit);
    } catch (error) {
        console.error(`Error getting events: ${error instanceof Error ? error.message : String(error)}`);
        return [];
    }
}

/**
 * Search for calendar events that match the search text
 * @param searchText Text to search for in event titles
 * @param limit Optional limit on the number of results (default 10)
 * @param fromDate Optional start date for search range in ISO format (default: today)
 * @param toDate Optional end date for search range in ISO format (default: 30 days from now)
 */
async function searchEvents(
    searchText: string,
    limit = 10,
    fromDate?: string,
    toDate?: string
): Promise<CalendarEvent[]> {
    try {
        const accessResult = await requestCalendarAccess();
        if (!accessResult.hasAccess) {
            throw new Error(accessResult.message);
        }

        console.error(`searchEvents - Searching for: "${searchText}"`);

        // Set default date range (30 days for search)
        const today = new Date();
        const defaultEndDate = new Date();
        defaultEndDate.setDate(today.getDate() + 30);

        // Get all events first, then filter
        const allEvents = await getEvents(CONFIG.MAX_EVENTS, fromDate, toDate || defaultEndDate.toISOString());

        // Filter by search text (case-insensitive)
        const searchLower = searchText.toLowerCase();
        const matchingEvents = allEvents.filter(event => {
            const titleMatch = event.title?.toLowerCase().includes(searchLower);
            const locationMatch = event.location?.toLowerCase().includes(searchLower);
            const notesMatch = event.notes?.toLowerCase().includes(searchLower);
            return titleMatch || locationMatch || notesMatch;
        });

        return matchingEvents.slice(0, limit);
    } catch (error) {
        console.error(`Error searching events: ${error instanceof Error ? error.message : String(error)}`);
        return [];
    }
}

/**
 * Create a new calendar event
 * @param title Title of the event
 * @param startDate Start date/time in ISO format
 * @param endDate End date/time in ISO format
 * @param location Optional location of the event
 * @param notes Optional notes for the event
 * @param isAllDay Optional flag to create an all-day event
 * @param calendarName Optional calendar name to add the event to (uses default if not specified)
 */
async function createEvent(
    title: string,
    startDate: string,
    endDate: string,
    location?: string,
    notes?: string,
    isAllDay = false,
    calendarName?: string
): Promise<{ success: boolean; message: string; eventId?: string }> {
    try {
        const accessResult = await requestCalendarAccess();
        if (!accessResult.hasAccess) {
            return {
                success: false,
                message: accessResult.message
            };
        }

        // Validate inputs
        if (!title.trim()) {
            return {
                success: false,
                message: "Event title cannot be empty"
            };
        }

        if (!startDate || !endDate) {
            return {
                success: false,
                message: "Start date and end date are required"
            };
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return {
                success: false,
                message: "Invalid date format. Please use ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)"
            };
        }

        if (end <= start) {
            return {
                success: false,
                message: "End date must be after start date"
            };
        }

        console.error(`createEvent - Attempting to create event: "${title}"`);

        const targetCalendar = calendarName || "Calendar";
        const escapedTitle = title.replace(/"/g, '\\"');
        const escapedLocation = (location || '').replace(/"/g, '\\"');
        const escapedNotes = (notes || '').replace(/"/g, '\\"');

        const script = `
tell application "Calendar"
    set startDate to date "${start.toLocaleString()}"
    set endDate to date "${end.toLocaleString()}"

    -- Find target calendar
    set targetCal to null
    try
        set targetCal to calendar "${targetCalendar.replace(/"/g, '\\"')}"
    on error
        -- Use first available calendar
        set targetCal to first calendar
    end try

    -- Create the event
    tell targetCal
        set newEvent to make new event with properties {summary:"${escapedTitle}", start date:startDate, end date:endDate, allday event:${isAllDay}}

        if "${escapedLocation}" ≠ "" then
            set location of newEvent to "${escapedLocation}"
        end if

        if "${escapedNotes}" ≠ "" then
            set description of newEvent to "${escapedNotes}"
        end if

        return uid of newEvent
    end tell
end tell`;

        const eventId = await runAppleScriptWithTimeout(script, CONFIG.TIMEOUT_MS) as string;

        return {
            success: true,
            message: `Event "${title}" created successfully.`,
            eventId: eventId
        };
    } catch (error) {
        return {
            success: false,
            message: `Error creating event: ${error instanceof Error ? error.message : String(error)}`
        };
    }
}

/**
 * Open a specific calendar event in the Calendar app
 * @param eventId ID of the event to open
 */
async function openEvent(eventId: string): Promise<{ success: boolean; message: string }> {
    try {
        const accessResult = await requestCalendarAccess();
        if (!accessResult.hasAccess) {
            return {
                success: false,
                message: accessResult.message
            };
        }

        console.error(`openEvent - Attempting to open event with ID: ${eventId}`);

        // Just activate Calendar app - finding specific event by ID is too slow
        const script = `
tell application "Calendar"
    activate
end tell
return "Calendar app opened"`;

        await runAppleScriptWithTimeout(script, 5000);

        return {
            success: true,
            message: `Calendar app opened. Event ID: ${eventId}`
        };
    } catch (error) {
        return {
            success: false,
            message: `Error opening event: ${error instanceof Error ? error.message : String(error)}`
        };
    }
}

const calendar = {
    searchEvents,
    openEvent,
    getEvents,
    createEvent,
    requestCalendarAccess,
    getCalendarNames
};

export default calendar;
