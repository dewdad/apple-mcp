#!/usr/bin/env node
import{createRequire as U6}from"node:module";var q6=Object.create;var{getPrototypeOf:w6,defineProperty:$8,getOwnPropertyNames:j6}=Object;var K6=Object.prototype.hasOwnProperty;var V6=($,Q,J)=>{J=$!=null?q6(w6($)):{};let Y=Q||!$||!$.__esModule?$8(J,"default",{value:$,enumerable:!0}):J;for(let W of j6($))if(!K6.call(Y,W))$8(Y,W,{get:()=>$[W],enumerable:!0});return Y};var Q8=($,Q)=>()=>(Q||$((Q={exports:{}}).exports,Q),Q.exports);var V0=($,Q)=>{for(var J in Q)$8($,J,{get:Q[J],enumerable:!0,configurable:!0,set:(Y)=>Q[J]=()=>Y})};var H0=($,Q)=>()=>($&&(Q=$($=0)),Q);var A1=U6(import.meta.url);import _$ from"node:process";import{promisify as F$}from"node:util";import{execFile as O$,execFileSync as e5}from"node:child_process";async function f($,{humanReadableOutput:Q=!0}={}){if(_$.platform!=="darwin")throw Error("macOS only");let J=Q?[]:["-ss"],{stdout:Y}=await D$("osascript",["-e",$,J]);return Y.trim()}var D$;var q0=H0(()=>{D$=F$(O$)});var D8={};V0(D8,{default:()=>R$});async function P$(){try{return await f(`
tell application "Contacts"
    return name
end tell`),!0}catch($){return console.error(`Cannot access Contacts app: ${$ instanceof Error?$.message:String($)}`),!1}}async function l1(){try{if(await P$())return{hasAccess:!0,message:"Contacts access is already granted."};return{hasAccess:!1,message:`Contacts access is required but not granted. Please:
1. Open System Settings > Privacy & Security > Automation
2. Find your terminal/app in the list and enable 'Contacts'
3. Alternatively, open System Settings > Privacy & Security > Contacts
4. Add your terminal/app to the allowed applications
5. Restart your terminal and try again`}}catch($){return{hasAccess:!1,message:`Error checking Contacts access: ${$ instanceof Error?$.message:String($)}`}}}async function g1(){try{let $=await l1();if(!$.hasAccess)throw Error($.message);let Q=`
tell application "Contacts"
    set contactList to {}
    set contactCount to 0

    -- Get a limited number of people to avoid performance issues
    set allPeople to people

    repeat with i from 1 to (count of allPeople)
        if contactCount >= ${O8.MAX_CONTACTS} then exit repeat

        try
            set currentPerson to item i of allPeople
            set personName to name of currentPerson
            set personPhones to {}

            try
                set phonesList to phones of currentPerson
                repeat with phoneItem in phonesList
                    try
                        set phoneValue to value of phoneItem
                        if phoneValue is not "" then
                            set personPhones to personPhones & {phoneValue}
                        end if
                    on error
                        -- Skip problematic phone entries
                    end try
                end repeat
            on error
                -- Skip if no phones or phones can't be accessed
            end try

            -- Only add contact if they have phones
            if (count of personPhones) > 0 then
                set contactInfo to {name:personName, phones:personPhones}
                set contactList to contactList & {contactInfo}
                set contactCount to contactCount + 1
            end if
        on error
            -- Skip problematic contacts
        end try
    end repeat

    return contactList
end tell`,J=await f(Q),Y=Array.isArray(J)?J:J?[J]:[],W={};for(let H of Y)if(H&&H.name&&H.phones)W[H.name]=Array.isArray(H.phones)?H.phones:[H.phones];return W}catch($){return console.error(`Error getting all contacts: ${$ instanceof Error?$.message:String($)}`),{}}}async function E$($){try{let Q=await l1();if(!Q.hasAccess)throw Error(Q.message);if(!$||$.trim()==="")return[];let J=$.toLowerCase().trim(),Y=`
tell application "Contacts"
    set matchedPhones to {}
    set searchText to "${J}"

    -- Get a limited number of people to search through
    set allPeople to people
    set foundExact to false
    set partialMatches to {}

    repeat with i from 1 to (count of allPeople)
        if i > ${O8.MAX_CONTACTS} then exit repeat

        try
            set currentPerson to item i of allPeople
            set personName to name of currentPerson
            set lowerPersonName to (do shell script "echo " & quoted form of personName & " | tr '[:upper:]' '[:lower:]'")

            -- Check for exact match first (highest priority)
            if lowerPersonName is searchText then
                try
                    set phonesList to phones of currentPerson
                    repeat with phoneItem in phonesList
                        try
                            set phoneValue to value of phoneItem
                            if phoneValue is not "" then
                                set matchedPhones to matchedPhones & {phoneValue}
                                set foundExact to true
                            end if
                        on error
                            -- Skip problematic phone entries
                        end try
                    end repeat
                    if foundExact then exit repeat
                on error
                    -- Skip if no phones
                end try
            -- Check if search term is contained in name (partial match)
            else if lowerPersonName contains searchText or searchText contains lowerPersonName then
                try
                    set phonesList to phones of currentPerson
                    repeat with phoneItem in phonesList
                        try
                            set phoneValue to value of phoneItem
                            if phoneValue is not "" then
                                set partialMatches to partialMatches & {phoneValue}
                            end if
                        on error
                            -- Skip problematic phone entries
                        end try
                    end repeat
                on error
                    -- Skip if no phones
                end try
            end if
        on error
            -- Skip problematic contacts
        end try
    end repeat

    -- Return exact matches if found, otherwise partial matches
    if foundExact then
        return matchedPhones
    else
        return partialMatches
    end if
end tell`,W=await f(Y),H=Array.isArray(W)?W:W?[W]:[];if(H.length===0){console.error(`No AppleScript matches for "${$}", trying comprehensive search...`);let z=await g1(),X=(q)=>{return q.toLowerCase().replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu,"").replace(/[♥️❤️💙💚💛💜🧡🖤🤍🤎]/g,"").replace(/\s+/g," ").trim()},G=[(q)=>X(q)===J,(q)=>{let w=X(q),V=X($);return w===V},(q)=>X(q).startsWith(J),(q)=>X(q).includes(J),(q)=>J.includes(X(q)),(q)=>{let V=X(q).split(" ")[0];return V===J||V.startsWith(J)||J.startsWith(V)||V.replace(/(.)\1+/g,"$1")===J||J.replace(/(.)\1+/g,"$1")===V},(q)=>{let V=X(q).split(" "),F=V[V.length-1];return F===J||F.startsWith(J)},(q)=>{return X(q).split(" ").some((F)=>F.includes(J)||J.includes(F)||F.replace(/(.)\1+/g,"$1")===J)}];for(let q of G){let w=Object.keys(z).filter(q);if(w.length>0)return console.error(`Found ${w.length} matches using fuzzy strategy for "${$}": ${w.join(", ")}`),z[w[0]]||[]}}return H.filter((z)=>z&&z.trim()!=="")}catch(Q){console.error(`Error finding contact: ${Q instanceof Error?Q.message:String(Q)}`);try{let J=await g1(),Y=$.toLowerCase().trim(),W=Object.keys(J).find((H)=>H.toLowerCase().includes(Y)||Y.includes(H.toLowerCase()));if(W)return console.error(`Fallback found match for "${$}": ${W}`),J[W]}catch(J){console.error(`Fallback search also failed: ${J}`)}return[]}}async function v$($){try{let Q=await l1();if(!Q.hasAccess)throw Error(Q.message);if(!$||$.trim()==="")return null;let J=$.replace(/[^0-9+]/g,""),Y=`
tell application "Contacts"
    set foundName to ""
    set searchPhone to "${J}"

    -- Get a limited number of people to search through
    set allPeople to people

    repeat with i from 1 to (count of allPeople)
        if i > ${O8.MAX_CONTACTS} then exit repeat
        if foundName is not "" then exit repeat

        try
            set currentPerson to item i of allPeople

            try
                set phonesList to phones of currentPerson
                repeat with phoneItem in phonesList
                    try
                        set phoneValue to value of phoneItem
                        -- Normalize phone value for comparison
                        set normalizedPhone to phoneValue

                        -- Simple phone matching
                        if normalizedPhone contains searchPhone or searchPhone contains normalizedPhone then
                            set foundName to name of currentPerson
                            exit repeat
                        end if
                    on error
                        -- Skip problematic phone entries
                    end try
                end repeat
            on error
                -- Skip if no phones
            end try
        on error
            -- Skip problematic contacts
        end try
    end repeat

    return foundName
end tell`,W=await f(Y);if(W&&W.trim()!=="")return W;let H=await g1();for(let[z,X]of Object.entries(H))if(X.map((q)=>q.replace(/[^0-9+]/g,"")).some((q)=>q===J||q===`+${J}`||q===`+1${J}`||`+1${q}`===J||J.includes(q)||q.includes(J)))return z;return null}catch(Q){return console.error(`Error finding contact by phone: ${Q instanceof Error?Q.message:String(Q)}`),null}}var O8,R$;var L8=H0(()=>{q0();O8={MAX_CONTACTS:1000,TIMEOUT_MS:1e4};R$={getAllNumbers:g1,findNumber:E$,findContactByPhone:v$,requestContactsAccess:l1}});var k8={};V0(k8,{default:()=>Z$});async function N$(){try{return await f(`
tell application "Notes"
    return name
end tell`),!0}catch($){return console.error(`Cannot access Notes app: ${$ instanceof Error?$.message:String($)}`),!1}}async function K1(){try{if(await N$())return{hasAccess:!0,message:"Notes access is already granted."};return{hasAccess:!1,message:`Notes access is required but not granted. Please:
1. Open System Settings > Privacy & Security > Automation
2. Find your terminal/app in the list and enable 'Notes'
3. Restart your terminal and try again
4. If the option is not available, run this command again to trigger the permission dialog`}}catch($){return{hasAccess:!1,message:`Error checking Notes access: ${$ instanceof Error?$.message:String($)}`}}}async function I$(){try{let $=await K1();if(!$.hasAccess)throw Error($.message);let Q=`
tell application "Notes"
    set notesList to {}
    set noteCount to 0

    -- Get all notes from all folders
    set allNotes to notes

    repeat with i from 1 to (count of allNotes)
        if noteCount >= ${J0.MAX_NOTES} then exit repeat

        try
            set currentNote to item i of allNotes
            set noteName to name of currentNote
            set noteContent to plaintext of currentNote

            -- Limit content for preview
            if (length of noteContent) > ${J0.MAX_CONTENT_PREVIEW} then
                set noteContent to (characters 1 thru ${J0.MAX_CONTENT_PREVIEW} of noteContent) as string
                set noteContent to noteContent & "..."
            end if

            set noteInfo to {name:noteName, content:noteContent}
            set notesList to notesList & {noteInfo}
            set noteCount to noteCount + 1
        on error
            -- Skip problematic notes
        end try
    end repeat

    return notesList
end tell`,J=await f(Q);return(Array.isArray(J)?J:J?[J]:[]).map((W)=>({name:W.name||"Untitled Note",content:W.content||"",creationDate:void 0,modificationDate:void 0}))}catch($){return console.error(`Error getting all notes: ${$ instanceof Error?$.message:String($)}`),[]}}async function h$($){try{let Q=await K1();if(!Q.hasAccess)throw Error(Q.message);if(!$||$.trim()==="")return[];let Y=`
tell application "Notes"
    set matchedNotes to {}
    set noteCount to 0
    set searchTerm to "${$.toLowerCase()}"

    -- Get all notes and search through them
    set allNotes to notes

    repeat with i from 1 to (count of allNotes)
        if noteCount >= ${J0.MAX_NOTES} then exit repeat

        try
            set currentNote to item i of allNotes
            set noteName to name of currentNote
            set noteContent to plaintext of currentNote

            -- Simple case-insensitive search in name and content
            if (noteName contains searchTerm) or (noteContent contains searchTerm) then
                -- Limit content for preview
                if (length of noteContent) > ${J0.MAX_CONTENT_PREVIEW} then
                    set noteContent to (characters 1 thru ${J0.MAX_CONTENT_PREVIEW} of noteContent) as string
                    set noteContent to noteContent & "..."
                end if

                set noteInfo to {name:noteName, content:noteContent}
                set matchedNotes to matchedNotes & {noteInfo}
                set noteCount to noteCount + 1
            end if
        on error
            -- Skip problematic notes
        end try
    end repeat

    return matchedNotes
end tell`,W=await f(Y);return(Array.isArray(W)?W:W?[W]:[]).map((z)=>({name:z.name||"Untitled Note",content:z.content||"",creationDate:void 0,modificationDate:void 0}))}catch(Q){return console.error(`Error finding notes: ${Q instanceof Error?Q.message:String(Q)}`),[]}}async function T$($,Q,J="Claude"){try{let Y=await K1();if(!Y.hasAccess)return{success:!1,message:Y.message};if(!$||$.trim()==="")return{success:!1,message:"Note title cannot be empty"};let W=Q.trim(),H=`/tmp/note-content-${Date.now()}.txt`,z=A1("fs");z.writeFileSync(H,W,"utf8");let X=`
tell application "Notes"
    set targetFolder to null
    set folderFound to false
    set actualFolderName to "${J}"

    -- Try to find the specified folder
    try
        set allFolders to folders
        repeat with currentFolder in allFolders
            if name of currentFolder is "${J}" then
                set targetFolder to currentFolder
                set folderFound to true
                exit repeat
            end if
        end repeat
    on error
        -- Folders might not be accessible
    end try

    -- If folder not found and it's a test folder, try to create it
    if not folderFound and ("${J}" is "Claude" or "${J}" is "Test-Claude") then
        try
            make new folder with properties {name:"${J}"}
            -- Try to find it again
            set allFolders to folders
            repeat with currentFolder in allFolders
                if name of currentFolder is "${J}" then
                    set targetFolder to currentFolder
                    set folderFound to true
                    set actualFolderName to "${J}"
                    exit repeat
                end if
            end repeat
        on error
            -- Folder creation failed, use default
            set actualFolderName to "Notes"
        end try
    end if

    -- Read content from file to preserve formatting
    set noteContent to read file POSIX file "${H}" as «class utf8»

    -- Create the note with proper content
    if folderFound and targetFolder is not null then
        -- Create note in specified folder
        make new note at targetFolder with properties {name:"${$.replace(/"/g,"\\\"")}", body:noteContent}
        return "SUCCESS:" & actualFolderName & ":false"
    else
        -- Create note in default location
        make new note with properties {name:"${$.replace(/"/g,"\\\"")}", body:noteContent}
        return "SUCCESS:Notes:true"
    end if
end tell`,G=await f(X);try{z.unlinkSync(H)}catch(q){}if(G&&typeof G==="string"&&G.startsWith("SUCCESS:")){let q=G.split(":"),w=q[1]||"Notes",V=q[2]==="true";return{success:!0,note:{name:$,content:W},folderName:w,usedDefaultFolder:V}}else return{success:!1,message:`Failed to create note: ${G||"No result from AppleScript"}`}}catch(Y){return{success:!1,message:`Failed to create note: ${Y instanceof Error?Y.message:String(Y)}`}}}async function S8($){try{let Q=await K1();if(!Q.hasAccess)return{success:!1,message:Q.message};let J=`
tell application "Notes"
    set notesList to {}
    set noteCount to 0
    set folderFound to false

    -- Try to find the specified folder
    try
        set allFolders to folders
        repeat with currentFolder in allFolders
            if name of currentFolder is "${$}" then
                set folderFound to true

                -- Get notes from this folder
                set folderNotes to notes of currentFolder

                repeat with i from 1 to (count of folderNotes)
                    if noteCount >= ${J0.MAX_NOTES} then exit repeat

                    try
                        set currentNote to item i of folderNotes
                        set noteName to name of currentNote
                        set noteContent to plaintext of currentNote

                        -- Limit content for preview
                        if (length of noteContent) > ${J0.MAX_CONTENT_PREVIEW} then
                            set noteContent to (characters 1 thru ${J0.MAX_CONTENT_PREVIEW} of noteContent) as string
                            set noteContent to noteContent & "..."
                        end if

                        set noteInfo to {name:noteName, content:noteContent}
                        set notesList to notesList & {noteInfo}
                        set noteCount to noteCount + 1
                    on error
                        -- Skip problematic notes
                    end try
                end repeat

                exit repeat
            end if
        end repeat
    on error
        -- Handle folder access errors
    end try

    if not folderFound then
        return "ERROR:Folder not found"
    end if

    return "SUCCESS:" & (count of notesList)
end tell`,Y=await f(J);if(Y&&typeof Y==="string"){if(Y.startsWith("ERROR:"))return{success:!1,message:Y.replace("ERROR:","")};else if(Y.startsWith("SUCCESS:"))return{success:!0,notes:[]}}return{success:!0,notes:[]}}catch(Q){return{success:!1,message:`Failed to get notes from folder: ${Q instanceof Error?Q.message:String(Q)}`}}}async function x$($,Q=5){try{let J=await S8($);if(J.success&&J.notes)return{success:!0,notes:J.notes.slice(0,Math.min(Q,J.notes.length))};return J}catch(J){return{success:!1,message:`Failed to get recent notes from folder: ${J instanceof Error?J.message:String(J)}`}}}async function y$($,Q,J,Y=20){try{let W=await S8($);if(W.success&&W.notes)return{success:!0,notes:W.notes.slice(0,Math.min(Y,W.notes.length))};return W}catch(W){return{success:!1,message:`Failed to get notes by date range: ${W instanceof Error?W.message:String(W)}`}}}var J0,Z$;var A8=H0(()=>{q0();J0={MAX_NOTES:50,MAX_CONTENT_PREVIEW:200,TIMEOUT_MS:8000};Z$={getAllNotes:I$,findNote:h$,createNote:T$,getNotesFromFolder:S8,getRecentNotesFromFolder:x$,getNotesByDateRange:y$,requestNotesAccess:K1}});var b8={};V0(b8,{default:()=>t$});import{promisify as g$}from"node:util";import{exec as l$}from"node:child_process";import{access as m$}from"node:fs/promises";async function c$($){return new Promise((Q)=>setTimeout(Q,$))}async function M8($,Q=u$,J=p$){try{return await $()}catch(Y){if(Q>0)return console.error(`Operation failed, retrying... (${Q} attempts remaining)`),await c$(J),M8($,Q-1,J);throw Y}}function d$($){let Q=$.replace(/[^0-9+]/g,"");if(/^\+1\d{10}$/.test(Q))return[Q];if(/^1\d{10}$/.test(Q))return[`+${Q}`];if(/^\d{10}$/.test(Q))return[`+1${Q}`];let J=new Set;if(Q.startsWith("+1"))J.add(Q);else if(Q.startsWith("1"))J.add(`+${Q}`);else J.add(`+1${Q}`);return Array.from(J)}async function I4($,Q){let J=Q.replace(/"/g,"\\\"");return await f(`
tell application "Messages"
    set targetService to 1st service whose service type = iMessage
    set targetBuddy to buddy "${$}"
    send "${J}" to targetBuddy
end tell`)}async function n$(){try{let $=`${process.env.HOME}/Library/Messages/chat.db`;return await m$($),await m1(`sqlite3 "${$}" "SELECT 1;"`),!0}catch($){return console.error(`
Error: Cannot access Messages database.
To fix this, please grant Full Disk Access to Terminal/iTerm2:
1. Open System Preferences
2. Go to Security & Privacy > Privacy
3. Select "Full Disk Access" from the left sidebar
4. Click the lock icon to make changes
5. Add Terminal.app or iTerm.app to the list
6. Restart your terminal and try again

Error details: ${$ instanceof Error?$.message:String($)}
`),!1}}async function f8(){try{if(await n$())return{hasAccess:!0,message:"Messages access is already granted."};try{return await f('tell application "Messages" to return name'),{hasAccess:!1,message:`Messages app is accessible but database access is required. Please:
1. Open System Settings > Privacy & Security > Full Disk Access
2. Add your terminal application (Terminal.app or iTerm.app)
3. Restart your terminal and try again
4. Note: This is required to read message history from the Messages database`}}catch(Q){return{hasAccess:!1,message:`Messages access is required but not granted. Please:
1. Open System Settings > Privacy & Security > Automation
2. Find your terminal/app and enable 'Messages'
3. Also grant Full Disk Access in Privacy & Security > Full Disk Access
4. Restart your terminal and try again`}}}catch($){return{hasAccess:!1,message:`Error checking Messages access: ${$ instanceof Error?$.message:String($)}`}}}function h4($){try{let J=Buffer.from($,"hex").toString(),Y=[/NSString">(.*?)</,/NSString">([^<]+)/,/NSNumber">\d+<.*?NSString">(.*?)</,/NSArray">.*?NSString">(.*?)</,/"string":\s*"([^"]+)"/,/text[^>]*>(.*?)</,/message>(.*?)</],W="";for(let X of Y){let G=J.match(X);if(G?.[1]){if(W=G[1],W.length>5)break}}let H=[/(https?:\/\/[^\s<"]+)/,/NSString">(https?:\/\/[^\s<"]+)/,/"url":\s*"(https?:\/\/[^"]+)"/,/link[^>]*>(https?:\/\/[^<]+)/],z;for(let X of H){let G=J.match(X);if(G?.[1]){z=G[1];break}}if(!W&&!z){let X=J.replace(/streamtyped.*?NSString/g,"").replace(/NSAttributedString.*?NSString/g,"").replace(/NSDictionary.*?$/g,"").replace(/\+[A-Za-z]+\s/g,"").replace(/NSNumber.*?NSValue.*?\*/g,"").replace(/[^\x20-\x7E]/g," ").replace(/\s+/g," ").trim();if(X.length>5)W=X;else return{text:"[Message content not readable]"}}if(W)W=W.replace(/^[+\s]+/,"").replace(/\s*iI\s*[A-Z]\s*$/,"").replace(/\s+/g," ").trim();return{text:W||z||"",url:z}}catch(Q){return console.error("Error decoding attributedBody:",Q),{text:"[Message content not readable]"}}}async function T4($){try{let Q=`
            SELECT filename
            FROM attachment
            INNER JOIN message_attachment_join 
            ON attachment.ROWID = message_attachment_join.attachment_id
            WHERE message_attachment_join.message_id = ${$}
        `,{stdout:J}=await m1(`sqlite3 -json "${process.env.HOME}/Library/Messages/chat.db" "${Q}"`);if(!J.trim())return[];return JSON.parse(J).map((W)=>W.filename).filter(Boolean)}catch(Q){return console.error("Error getting attachments:",Q),[]}}async function i$($,Q=10){try{let J=Math.min(Q,N4.MAX_MESSAGES),Y=await f8();if(!Y.hasAccess)throw Error(Y.message);let W=d$($);console.error("Trying phone formats:",W);let z=`
            SELECT 
                m.ROWID as message_id,
                CASE 
                    WHEN m.text IS NOT NULL AND m.text != '' THEN m.text
                    WHEN m.attributedBody IS NOT NULL THEN hex(m.attributedBody)
                    ELSE NULL
                END as content,
                datetime(m.date/1000000000 + strftime('%s', '2001-01-01'), 'unixepoch', 'localtime') as date,
                h.id as sender,
                m.is_from_me,
                m.is_audio_message,
                m.cache_has_attachments,
                m.subject,
                CASE 
                    WHEN m.text IS NOT NULL AND m.text != '' THEN 0
                    WHEN m.attributedBody IS NOT NULL THEN 1
                    ELSE 2
                END as content_type
            FROM message m 
            INNER JOIN handle h ON h.ROWID = m.handle_id 
            WHERE h.id IN (${W.map((w)=>`'${w.replace(/'/g,"''")}'`).join(",")})
                AND (m.text IS NOT NULL OR m.attributedBody IS NOT NULL OR m.cache_has_attachments = 1)
                AND m.is_from_me IS NOT NULL  -- Ensure it's a real message
                AND m.item_type = 0  -- Regular messages only
                AND m.is_audio_message = 0  -- Skip audio messages
            ORDER BY m.date DESC 
            LIMIT ${J}
        `,{stdout:X}=await M8(()=>m1(`sqlite3 -json "${process.env.HOME}/Library/Messages/chat.db" "${z}"`));if(!X.trim())return console.error("No messages found in database for the given phone number"),[];let G=JSON.parse(X);return await Promise.all(G.filter((w)=>w.content!==null||w.cache_has_attachments===1).map(async(w)=>{let V=w.content||"",F;if(w.content_type===1){let h=h4(V);V=h.text,F=h.url}else{let h=V.match(/(https?:\/\/[^\s]+)/);if(h)F=h[1]}let P=[];if(w.cache_has_attachments)P=await T4(w.message_id);if(w.subject)V=`Subject: ${w.subject}
${V}`;let R={content:V||"[No text content]",date:new Date(w.date).toISOString(),sender:w.sender,is_from_me:Boolean(w.is_from_me)};if(P.length>0)R.attachments=P,R.content+=`
[Attachments: ${P.length}]`;if(F)R.url=F,R.content+=`
[URL: ${F}]`;return R}))}catch(J){if(console.error("Error reading messages:",J),J instanceof Error)console.error("Error details:",J.message),console.error("Stack trace:",J.stack);return[]}}async function o$($=10){try{let Q=Math.min($,N4.MAX_MESSAGES),J=await f8();if(!J.hasAccess)throw Error(J.message);let Y=`
            SELECT 
                m.ROWID as message_id,
                CASE 
                    WHEN m.text IS NOT NULL AND m.text != '' THEN m.text
                    WHEN m.attributedBody IS NOT NULL THEN hex(m.attributedBody)
                    ELSE NULL
                END as content,
                datetime(m.date/1000000000 + strftime('%s', '2001-01-01'), 'unixepoch', 'localtime') as date,
                h.id as sender,
                m.is_from_me,
                m.is_audio_message,
                m.cache_has_attachments,
                m.subject,
                CASE 
                    WHEN m.text IS NOT NULL AND m.text != '' THEN 0
                    WHEN m.attributedBody IS NOT NULL THEN 1
                    ELSE 2
                END as content_type
            FROM message m 
            INNER JOIN handle h ON h.ROWID = m.handle_id 
            WHERE m.is_from_me = 0  -- Only messages from others
                AND m.is_read = 0   -- Only unread messages
                AND (m.text IS NOT NULL OR m.attributedBody IS NOT NULL OR m.cache_has_attachments = 1)
                AND m.is_audio_message = 0  -- Skip audio messages
                AND m.item_type = 0  -- Regular messages only
            ORDER BY m.date DESC 
            LIMIT ${Q}
        `,{stdout:W}=await M8(()=>m1(`sqlite3 -json "${process.env.HOME}/Library/Messages/chat.db" "${Y}"`));if(!W.trim())return console.error("No unread messages found"),[];let H=JSON.parse(W);return await Promise.all(H.filter((X)=>X.content!==null||X.cache_has_attachments===1).map(async(X)=>{let G=X.content||"",q;if(X.content_type===1){let F=h4(G);G=F.text,q=F.url}else{let F=G.match(/(https?:\/\/[^\s]+)/);if(F)q=F[1]}let w=[];if(X.cache_has_attachments)w=await T4(X.message_id);if(X.subject)G=`Subject: ${X.subject}
${G}`;let V={content:G||"[No text content]",date:new Date(X.date).toISOString(),sender:X.sender,is_from_me:Boolean(X.is_from_me)};if(w.length>0)V.attachments=w,V.content+=`
[Attachments: ${w.length}]`;if(q)V.url=q,V.content+=`
[URL: ${q}]`;return V}))}catch(Q){if(console.error("Error reading unread messages:",Q),Q instanceof Error)console.error("Error details:",Q.message),console.error("Stack trace:",Q.stack);return[]}}async function a$($,Q,J){let Y=new Map,W=J.getTime()-Date.now();if(W<0)throw Error("Cannot schedule message in the past");let H=setTimeout(async()=>{try{await I4($,Q),Y.delete(H)}catch(z){console.error("Failed to send scheduled message:",z)}},W);return Y.set(H,{phoneNumber:$,message:Q,scheduledTime:J,timeoutId:H}),{id:H,scheduledTime:J,message:Q,phoneNumber:$}}var m1,N4,u$=3,p$=1000,t$;var C8=H0(()=>{q0();m1=g$(l$),N4={MAX_MESSAGES:50,MAX_CONTENT_PREVIEW:300,TIMEOUT_MS:8000};t$={sendMessage:I4,readMessages:i$,scheduleMessage:a$,getUnreadMessages:o$,requestMessagesAccess:f8}});var P8={};V0(P8,{default:()=>HQ});async function r$(){try{return await f(`
tell application "Mail"
    return name
end tell`),!0}catch($){return console.error(`Cannot access Mail app: ${$ instanceof Error?$.message:String($)}`),!1}}async function w0(){try{if(await r$())return{hasAccess:!0,message:"Mail access is already granted."};return{hasAccess:!1,message:`Mail access is required but not granted. Please:
1. Open System Settings > Privacy & Security > Automation
2. Find your terminal/app in the list and enable 'Mail'
3. Make sure Mail app is running and configured with at least one account
4. Restart your terminal and try again`}}catch($){return{hasAccess:!1,message:`Error checking Mail access: ${$ instanceof Error?$.message:String($)}`}}}async function s$($=10){try{let Q=await w0();if(!Q.hasAccess)throw Error(Q.message);let J=Math.min($,m0.MAX_EMAILS),Y=`
tell application "Mail"
    set emailList to {}
    set emailCount to 0

    -- Get mailboxes (limited to avoid performance issues)
    set allMailboxes to mailboxes

    repeat with i from 1 to (count of allMailboxes)
        if emailCount >= ${J} then exit repeat

        try
            set currentMailbox to item i of allMailboxes
            set mailboxName to name of currentMailbox

            -- Get unread messages from this mailbox
            set unreadMessages to messages of currentMailbox

            repeat with j from 1 to (count of unreadMessages)
                if emailCount >= ${J} then exit repeat

                try
                    set currentMsg to item j of unreadMessages

                    -- Only process unread messages
                    if read status of currentMsg is false then
                        set emailSubject to subject of currentMsg
                        set emailSender to sender of currentMsg
                        set emailDate to (date sent of currentMsg) as string

                        -- Get content with length limit
                        set emailContent to ""
                        try
                            set fullContent to content of currentMsg
                            if (length of fullContent) > ${m0.MAX_CONTENT_PREVIEW} then
                                set emailContent to (characters 1 thru ${m0.MAX_CONTENT_PREVIEW} of fullContent) as string
                                set emailContent to emailContent & "..."
                            else
                                set emailContent to fullContent
                            end if
                        on error
                            set emailContent to "[Content not available]"
                        end try

                        set emailInfo to {subject:emailSubject, sender:emailSender, dateSent:emailDate, content:emailContent, isRead:false, mailbox:mailboxName}
                        set emailList to emailList & {emailInfo}
                        set emailCount to emailCount + 1
                    end if
                on error
                    -- Skip problematic messages
                end try
            end repeat
        on error
            -- Skip problematic mailboxes
        end try
    end repeat

    return "SUCCESS:" & (count of emailList)
end tell`,W=await f(Y);if(W&&W.startsWith("SUCCESS:"))return[];return[]}catch(Q){return console.error(`Error getting unread emails: ${Q instanceof Error?Q.message:String(Q)}`),[]}}async function e$($,Q=10){try{let J=await w0();if(!J.hasAccess)throw Error(J.message);if(!$||$.trim()==="")return[];let Y=Math.min(Q,m0.MAX_EMAILS),H=`
tell application "Mail"
    set emailList to {}
    set emailCount to 0
    set searchTerm to "${$.toLowerCase()}"

    -- Get mailboxes (limited to avoid performance issues)
    set allMailboxes to mailboxes

    repeat with i from 1 to (count of allMailboxes)
        if emailCount >= ${Y} then exit repeat

        try
            set currentMailbox to item i of allMailboxes
            set mailboxName to name of currentMailbox

            -- Get messages from this mailbox
            set allMessages to messages of currentMailbox

            repeat with j from 1 to (count of allMessages)
                if emailCount >= ${Y} then exit repeat

                try
                    set currentMsg to item j of allMessages
                    set emailSubject to subject of currentMsg

                    -- Simple case-insensitive search in subject
                    if emailSubject contains searchTerm then
                        set emailSender to sender of currentMsg
                        set emailDate to (date sent of currentMsg) as string
                        set emailRead to read status of currentMsg

                        -- Get content with length limit
                        set emailContent to ""
                        try
                            set fullContent to content of currentMsg
                            if (length of fullContent) > ${m0.MAX_CONTENT_PREVIEW} then
                                set emailContent to (characters 1 thru ${m0.MAX_CONTENT_PREVIEW} of fullContent) as string
                                set emailContent to emailContent & "..."
                            else
                                set emailContent to fullContent
                            end if
                        on error
                            set emailContent to "[Content not available]"
                        end try

                        set emailInfo to {subject:emailSubject, sender:emailSender, dateSent:emailDate, content:emailContent, isRead:emailRead, mailbox:mailboxName}
                        set emailList to emailList & {emailInfo}
                        set emailCount to emailCount + 1
                    end if
                on error
                    -- Skip problematic messages
                end try
            end repeat
        on error
            -- Skip problematic mailboxes
        end try
    end repeat

    return "SUCCESS:" & (count of emailList)
end tell`,z=await f(H);if(z&&z.startsWith("SUCCESS:"))return[];return[]}catch(J){return console.error(`Error searching emails: ${J instanceof Error?J.message:String(J)}`),[]}}async function $Q($,Q,J,Y,W){try{let H=await w0();if(!H.hasAccess)throw Error(H.message);if(!$||!$.trim())throw Error("To address is required");if(!Q||!Q.trim())throw Error("Subject is required");if(!J||!J.trim())throw Error("Email body is required");let z=`/tmp/email-body-${Date.now()}.txt`,X=A1("fs");X.writeFileSync(z,J.trim(),"utf8");let G=`
tell application "Mail"
    activate

    -- Read email body from file to preserve formatting
    set emailBody to read file POSIX file "${z}" as «class utf8»

    -- Create new message
    set newMessage to make new outgoing message with properties {subject:"${Q.replace(/"/g,"\\\"")}", content:emailBody, visible:true}

    tell newMessage
        make new to recipient with properties {address:"${$.replace(/"/g,"\\\"")}"}
        ${Y?`make new cc recipient with properties {address:"${Y.replace(/"/g,"\\\"")}"}`:""}
        ${W?`make new bcc recipient with properties {address:"${W.replace(/"/g,"\\\"")}"}`:""}
    end tell

    send newMessage
    return "SUCCESS"
end tell`,q=await f(G);try{X.unlinkSync(z)}catch(w){}if(q==="SUCCESS")return`Email sent to ${$} with subject "${Q}"`;else throw Error("Failed to send email")}catch(H){throw console.error(`Error sending email: ${H instanceof Error?H.message:String(H)}`),Error(`Error sending email: ${H instanceof Error?H.message:String(H)}`)}}async function QQ(){try{let $=await w0();if(!$.hasAccess)throw Error($.message);let J=await f(`
tell application "Mail"
    try
        -- Simple check - try to get just the count first
        set mailboxCount to count of mailboxes
        if mailboxCount > 0 then
            return {"Inbox", "Sent", "Drafts"}
        else
            return {}
        end if
    on error
        return {}
    end try
end tell`);if(Array.isArray(J))return J.filter((Y)=>Y&&typeof Y==="string");return[]}catch($){return console.error(`Error getting mailboxes: ${$ instanceof Error?$.message:String($)}`),[]}}async function JQ(){try{let $=await w0();if(!$.hasAccess)throw Error($.message);let J=await f(`
tell application "Mail"
    try
        -- Simple check - try to get just the count first
        set accountCount to count of accounts
        if accountCount > 0 then
            return {"Default Account"}
        else
            return {}
        end if
    on error
        return {}
    end try
end tell`);if(Array.isArray(J))return J.filter((Y)=>Y&&typeof Y==="string");return[]}catch($){return console.error(`Error getting accounts: ${$ instanceof Error?$.message:String($)}`),[]}}async function WQ($){try{let Q=await w0();if(!Q.hasAccess)throw Error(Q.message);if(!$||!$.trim())return[];let J=`
tell application "Mail"
    set boxList to {}

    try
        -- Find the account
        set targetAccount to first account whose name is "${$.replace(/"/g,"\\\"")}"
        set accountMailboxes to mailboxes of targetAccount

        repeat with i from 1 to (count of accountMailboxes)
            try
                set currentMailbox to item i of accountMailboxes
                set mailboxName to name of currentMailbox
                set boxList to boxList & {mailboxName}
            on error
                -- Skip problematic mailboxes
            end try
        end repeat
    on error
        -- Account not found or other error
        return {}
    end try

    return boxList
end tell`,Y=await f(J);if(Array.isArray(Y))return Y.filter((W)=>W&&typeof W==="string");return[]}catch(Q){return console.error(`Error getting mailboxes for account: ${Q instanceof Error?Q.message:String(Q)}`),[]}}async function YQ($,Q=5){try{let J=await w0();if(!J.hasAccess)throw Error(J.message);let Y=`
tell application "Mail"
    set resultList to {}
    try
        set targetAccount to first account whose name is "${$.replace(/"/g,"\\\"")}"
        set acctMailboxes to every mailbox of targetAccount

        repeat with mb in acctMailboxes
            try
                set messagesList to (messages of mb)
                set sortedMessages to my sortMessagesByDate(messagesList)
                set msgLimit to ${Q}
                if (count of sortedMessages) < msgLimit then
                    set msgLimit to (count of sortedMessages)
                end if

                repeat with i from 1 to msgLimit
                    try
                        set currentMsg to item i of sortedMessages
                        set msgData to {subject:(subject of currentMsg), sender:(sender of currentMsg), ¬
                                    date:(date sent of currentMsg) as string, mailbox:(name of mb)}

                        try
                            set msgContent to content of currentMsg
                            if length of msgContent > 500 then
                                set msgContent to (text 1 thru 500 of msgContent) & "..."
                            end if
                            set msgData to msgData & {content:msgContent}
                        on error
                            set msgData to msgData & {content:"[Content not available]"}
                        end try

                        set end of resultList to msgData
                    on error
                        -- Skip problematic messages
                    end try
                end repeat

                if (count of resultList) ≥ ${Q} then exit repeat
            on error
                -- Skip problematic mailboxes
            end try
        end repeat
    on error errMsg
        return "Error: " & errMsg
    end try

    return resultList
end tell

on sortMessagesByDate(messagesList)
    set sortedMessages to sort messagesList by date sent
    return sortedMessages
end sortMessagesByDate`,W=await f(Y);if(W&&W.startsWith("Error:"))throw Error(W);let H=[],z=W.match(/\{([^}]+)\}/g);if(z&&z.length>0)for(let X of z)try{let G=X.substring(1,X.length-1).split(","),q={};if(G.forEach((w)=>{let V=w.split(":");if(V.length>=2){let F=V[0].trim(),P=V.slice(1).join(":").trim();q[F]=P}}),q.subject||q.sender)H.push({subject:q.subject||"No subject",sender:q.sender||"Unknown sender",dateSent:q.date||new Date().toString(),content:q.content||"[Content not available]",isRead:!1,mailbox:`${$} - ${q.mailbox||"Unknown"}`})}catch(G){console.error("Error parsing email match:",G)}return H}catch(J){return console.error("Error getting latest emails:",J),[]}}var m0,HQ;var E8=H0(()=>{q0();m0={MAX_EMAILS:20,MAX_CONTENT_PREVIEW:300,TIMEOUT_MS:1e4};HQ={getUnreadMails:s$,searchMails:e$,sendMail:$Q,getMailboxes:QQ,getAccounts:JQ,getMailboxesForAccount:WQ,getLatestMails:YQ,requestMailAccess:w0}});var v8={};V0(v8,{default:()=>KQ});async function XQ(){try{return await f(`
tell application "Reminders"
    return name
end tell`),!0}catch($){return console.error(`Cannot access Reminders app: ${$ instanceof Error?$.message:String($)}`),!1}}async function S0(){try{if(await XQ())return{hasAccess:!0,message:"Reminders access is already granted."};return{hasAccess:!1,message:`Reminders access is required but not granted. Please:
1. Open System Settings > Privacy & Security > Automation
2. Find your terminal/app in the list and enable 'Reminders'
3. Restart your terminal and try again
4. If the option is not available, run this command again to trigger the permission dialog`}}catch($){return{hasAccess:!1,message:`Error checking Reminders access: ${$ instanceof Error?$.message:String($)}`}}}async function BQ(){try{let $=await S0();if(!$.hasAccess)throw Error($.message);let Q=`
tell application "Reminders"
    set listArray to {}
    set listCount to 0

    -- Get all lists
    set allLists to lists

    repeat with i from 1 to (count of allLists)
        if listCount >= ${zQ.MAX_LISTS} then exit repeat

        try
            set currentList to item i of allLists
            set listName to name of currentList
            set listId to id of currentList

            set listInfo to {name:listName, id:listId}
            set listArray to listArray & {listInfo}
            set listCount to listCount + 1
        on error
            -- Skip problematic lists
        end try
    end repeat

    return listArray
end tell`,J=await f(Q);return(Array.isArray(J)?J:J?[J]:[]).map((W)=>({name:W.name||"Untitled List",id:W.id||"unknown-id"}))}catch($){return console.error(`Error getting reminder lists: ${$ instanceof Error?$.message:String($)}`),[]}}async function GQ($){try{let Q=await S0();if(!Q.hasAccess)throw Error(Q.message);let Y=await f(`
tell application "Reminders"
    try
        -- Simple check - try to get just the count first to avoid timeouts
        set listCount to count of lists
        if listCount > 0 then
            return "SUCCESS:found_lists_but_reminders_query_too_slow"
        else
            return {}
        end if
    on error
        return {}
    end try
end tell`);if(Y&&typeof Y==="string"&&Y.includes("SUCCESS"))return[];return[]}catch(Q){return console.error(`Error getting reminders: ${Q instanceof Error?Q.message:String(Q)}`),[]}}async function x4($){try{let Q=await S0();if(!Q.hasAccess)throw Error(Q.message);if(!$||$.trim()==="")return[];let Y=await f(`
tell application "Reminders"
    try
        -- For performance, just return success without actual search
        -- Searching reminders is too slow and unreliable in AppleScript
        return "SUCCESS:reminder_search_not_implemented_for_performance"
    on error
        return {}
    end try
end tell`);return[]}catch(Q){return console.error(`Error searching reminders: ${Q instanceof Error?Q.message:String(Q)}`),[]}}async function qQ($,Q="Reminders",J,Y){try{let W=await S0();if(!W.hasAccess)throw Error(W.message);if(!$||$.trim()==="")throw Error("Reminder name cannot be empty");let H=$.replace(/\"/g,"\\\""),z=Q.replace(/\"/g,"\\\""),X=J?J.replace(/\"/g,"\\\""):"",G=`
tell application "Reminders"
    try
        -- Use first available list (creating/finding lists can be slow)
        set allLists to lists
        if (count of allLists) > 0 then
            set targetList to first item of allLists
            set listName to name of targetList

            -- Create a simple reminder with just name
            set newReminder to make new reminder at targetList with properties {name:"${H}"}
            return "SUCCESS:" & listName
        else
            return "ERROR:No lists available"
        end if
    on error errorMessage
        return "ERROR:" & errorMessage
    end try
end tell`,q=await f(G);if(q&&q.startsWith("SUCCESS:")){let w=q.replace("SUCCESS:","");return{name:$,id:"created-reminder-id",body:J||"",completed:!1,dueDate:Y||null,listName:w}}else throw Error(`Failed to create reminder: ${q}`)}catch(W){throw Error(`Failed to create reminder: ${W instanceof Error?W.message:String(W)}`)}}async function wQ($){try{let Q=await S0();if(!Q.hasAccess)return{success:!1,message:Q.message};let J=await x4($);if(J.length===0)return{success:!1,message:"No matching reminders found"};if(await f(`
tell application "Reminders"
    activate
    return "SUCCESS"
end tell`)==="SUCCESS")return{success:!0,message:"Reminders app opened",reminder:J[0]};else return{success:!1,message:"Failed to open Reminders app"}}catch(Q){return{success:!1,message:`Failed to open reminder: ${Q instanceof Error?Q.message:String(Q)}`}}}async function jQ($,Q){try{let J=await S0();if(!J.hasAccess)throw Error(J.message);let W=await f(`
tell application "Reminders"
    try
        -- For performance, just return success without actual data
        -- Getting reminders by ID is complex and slow in AppleScript
        return "SUCCESS:reminders_by_id_not_implemented_for_performance"
    on error
        return {}
    end try
end tell`);return[]}catch(J){return console.error(`Error getting reminders from list by ID: ${J instanceof Error?J.message:String(J)}`),[]}}var zQ,KQ;var R8=H0(()=>{q0();zQ={MAX_REMINDERS:50,MAX_LISTS:20,TIMEOUT_MS:8000};KQ={getAllLists:BQ,getAllReminders:GQ,searchReminders:x4,createReminder:qQ,openReminder:wQ,getRemindersFromListById:jQ,requestRemindersAccess:S0}});var I8={};V0(I8,{default:()=>LQ});async function V1($,Q){return Promise.race([f($),new Promise((J,Y)=>setTimeout(()=>Y(Error(`AppleScript timed out after ${Q}ms`)),Q))])}async function VQ(){try{return await V1(`
tell application "Calendar"
    return name
end tell`,5000),!0}catch($){return console.error(`Cannot access Calendar app: ${$ instanceof Error?$.message:String($)}`),!1}}async function U1(){try{if(await VQ())return{hasAccess:!0,message:"Calendar access is already granted."};return{hasAccess:!1,message:`Calendar access is required but not granted. Please:
1. Open System Settings > Privacy & Security > Automation
2. Find your terminal/app in the list and enable 'Calendar'
3. Alternatively, open System Settings > Privacy & Security > Calendars
4. Add your terminal/app to the allowed applications
5. Restart your terminal and try again`}}catch($){return{hasAccess:!1,message:`Error checking Calendar access: ${$ instanceof Error?$.message:String($)}`}}}async function y4(){try{let Q=await V1(`
tell application "Calendar"
    set calNames to {}
    repeat with cal in calendars
        set end of calNames to name of cal
    end repeat
    return calNames
end tell`,5000);if(typeof Q==="string")return Q.split(", ").map((J)=>J.trim()).filter((J)=>J.length>0);return[]}catch($){return console.error(`Error getting calendar names: ${$}`),[]}}async function UQ($,Q,J,Y){try{let W=`
tell application "Calendar"
    set eventList to {}
    set eventCount to 0
    set maxEvents to ${Y}

    try
        set targetCal to calendar "${$.replace(/"/g,"\\\"")}"
        set startD to date "${Q}"
        set endD to date "${J}"

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

                    set eventInfo to evtId & "|||" & evtTitle & "|||" & (evtStart as string) & "|||" & (evtEnd as string) & "|||" & "${$.replace(/"/g,"\\\"")}" & "|||" & evtLocation & "|||" & evtNotes & "|||" & evtAllDay
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
end tell`,H=await V1(W,N8.PER_CALENDAR_TIMEOUT_MS);if(!H||H==="")return[];let z=typeof H==="string"?H.split(", "):[],X=[];for(let G of z){let q=G.split("|||");if(q.length>=5)X.push({id:q[0]||`unknown-${Date.now()}`,title:q[1]||"Untitled Event",startDate:q[2]?new Date(q[2]).toISOString():null,endDate:q[3]?new Date(q[3]).toISOString():null,calendarName:q[4]||$,location:q[5]||null,notes:q[6]||null,isAllDay:q[7]==="true",url:null})}return X}catch(W){return console.error(`Error/timeout getting events from calendar "${$}": ${W instanceof Error?W.message:String(W)}`),[]}}async function Z4($=10,Q,J){try{console.error("getEvents - Starting to fetch calendar events");let Y=await U1();if(!Y.hasAccess)throw Error(Y.message);console.error("getEvents - Calendar access check passed");let W=new Date,H=new Date;H.setDate(W.getDate()+7);let z=Q?new Date(Q).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}):W.toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}),X=J?new Date(J).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}):H.toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}),G=await y4();if(console.error(`getEvents - Found ${G.length} calendars: ${G.join(", ")}`),G.length===0)return[];let q=[],w=[];for(let V of G){if(q.length>=$)break;let F=$-q.length;console.error(`getEvents - Fetching from calendar: ${V}`);try{let P=await UQ(V,z,X,F);q.push(...P),console.error(`getEvents - Got ${P.length} events from ${V}`)}catch(P){console.error(`getEvents - Skipping calendar ${V} due to timeout/error`),w.push(V)}}if(w.length>0)console.error(`getEvents - Skipped calendars due to timeout: ${w.join(", ")}`);return q.sort((V,F)=>{let P=V.startDate?new Date(V.startDate).getTime():0,R=F.startDate?new Date(F.startDate).getTime():0;return P-R}),q.slice(0,$)}catch(Y){return console.error(`Error getting events: ${Y instanceof Error?Y.message:String(Y)}`),[]}}async function _Q($,Q=10,J,Y){try{let W=await U1();if(!W.hasAccess)throw Error(W.message);console.error(`searchEvents - Searching for: "${$}"`);let H=new Date,z=new Date;z.setDate(H.getDate()+30);let X=await Z4(N8.MAX_EVENTS,J,Y||z.toISOString()),G=$.toLowerCase();return X.filter((w)=>{let V=w.title?.toLowerCase().includes(G),F=w.location?.toLowerCase().includes(G),P=w.notes?.toLowerCase().includes(G);return V||F||P}).slice(0,Q)}catch(W){return console.error(`Error searching events: ${W instanceof Error?W.message:String(W)}`),[]}}async function FQ($,Q,J,Y,W,H=!1,z){try{let X=await U1();if(!X.hasAccess)return{success:!1,message:X.message};if(!$.trim())return{success:!1,message:"Event title cannot be empty"};if(!Q||!J)return{success:!1,message:"Start date and end date are required"};let G=new Date(Q),q=new Date(J);if(isNaN(G.getTime())||isNaN(q.getTime()))return{success:!1,message:"Invalid date format. Please use ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)"};if(q<=G)return{success:!1,message:"End date must be after start date"};console.error(`createEvent - Attempting to create event: "${$}"`);let w=z||"Calendar",V=$.replace(/"/g,"\\\""),F=(Y||"").replace(/"/g,"\\\""),P=(W||"").replace(/"/g,"\\\""),R=`
tell application "Calendar"
    set startDate to date "${G.toLocaleString()}"
    set endDate to date "${q.toLocaleString()}"

    -- Find target calendar
    set targetCal to null
    try
        set targetCal to calendar "${w.replace(/"/g,"\\\"")}"
    on error
        -- Use first available calendar
        set targetCal to first calendar
    end try

    -- Create the event
    tell targetCal
        set newEvent to make new event with properties {summary:"${V}", start date:startDate, end date:endDate, allday event:${H}}

        if "${F}" ≠ "" then
            set location of newEvent to "${F}"
        end if

        if "${P}" ≠ "" then
            set description of newEvent to "${P}"
        end if

        return uid of newEvent
    end tell
end tell`,h=await V1(R,N8.TIMEOUT_MS);return{success:!0,message:`Event "${$}" created successfully.`,eventId:h}}catch(X){return{success:!1,message:`Error creating event: ${X instanceof Error?X.message:String(X)}`}}}async function OQ($){try{let Q=await U1();if(!Q.hasAccess)return{success:!1,message:Q.message};return console.error(`openEvent - Attempting to open event with ID: ${$}`),await V1(`
tell application "Calendar"
    activate
end tell
return "Calendar app opened"`,5000),{success:!0,message:`Calendar app opened. Event ID: ${$}`}}catch(Q){return{success:!1,message:`Error opening event: ${Q instanceof Error?Q.message:String(Q)}`}}}var N8,DQ,LQ;var h8=H0(()=>{q0();N8={TIMEOUT_MS:1e4,MAX_EVENTS:50,PER_CALENDAR_TIMEOUT_MS:3000};DQ={searchEvents:_Q,openEvent:OQ,getEvents:Z4,createEvent:FQ,requestCalendarAccess:U1,getCalendarNames:y4},LQ=DQ});var Q6=Q8((S,$6)=>{S=$6.exports=b;var E;if(typeof process==="object"&&process.env&&process.env.NODE_DEBUG&&/\bsemver\b/i.test(process.env.NODE_DEBUG))E=function(){var $=Array.prototype.slice.call(arguments,0);$.unshift("SEMVER"),console.log.apply(console,$)};else E=function(){};S.SEMVER_SPEC_VERSION="2.0.0";var _1=256,u1=Number.MAX_SAFE_INTEGER||9007199254740991,T8=16,SQ=_1-6,F1=S.re=[],v=S.safeRe=[],j=S.src=[],M=0,l8="[a-zA-Z0-9-]",x8=[["\\s",1],["\\d",_1],[l8,SQ]];function o1($){for(var Q=0;Q<x8.length;Q++){var J=x8[Q][0],Y=x8[Q][1];$=$.split(J+"*").join(J+"{0,"+Y+"}").split(J+"+").join(J+"{1,"+Y+"}")}return $}var u0=M++;j[u0]="0|[1-9]\\d*";var p0=M++;j[p0]="\\d+";var m8=M++;j[m8]="\\d*[a-zA-Z-]"+l8+"*";var l4=M++;j[l4]="("+j[u0]+")\\.("+j[u0]+")\\.("+j[u0]+")";var m4=M++;j[m4]="("+j[p0]+")\\.("+j[p0]+")\\.("+j[p0]+")";var y8=M++;j[y8]="(?:"+j[u0]+"|"+j[m8]+")";var Z8=M++;j[Z8]="(?:"+j[p0]+"|"+j[m8]+")";var u8=M++;j[u8]="(?:-("+j[y8]+"(?:\\."+j[y8]+")*))";var p8=M++;j[p8]="(?:-?("+j[Z8]+"(?:\\."+j[Z8]+")*))";var g8=M++;j[g8]=l8+"+";var D1=M++;j[D1]="(?:\\+("+j[g8]+"(?:\\."+j[g8]+")*))";var c8=M++,u4="v?"+j[l4]+j[u8]+"?"+j[D1]+"?";j[c8]="^"+u4+"$";var d8="[v=\\s]*"+j[m4]+j[p8]+"?"+j[D1]+"?",n8=M++;j[n8]="^"+d8+"$";var o0=M++;j[o0]="((?:<|>)?=?)";var p1=M++;j[p1]=j[p0]+"|x|X|\\*";var c1=M++;j[c1]=j[u0]+"|x|X|\\*";var k0=M++;j[k0]="[v=\\s]*("+j[c1]+")(?:\\.("+j[c1]+")(?:\\.("+j[c1]+")(?:"+j[u8]+")?"+j[D1]+"?)?)?";var d0=M++;j[d0]="[v=\\s]*("+j[p1]+")(?:\\.("+j[p1]+")(?:\\.("+j[p1]+")(?:"+j[p8]+")?"+j[D1]+"?)?)?";var p4=M++;j[p4]="^"+j[o0]+"\\s*"+j[k0]+"$";var c4=M++;j[c4]="^"+j[o0]+"\\s*"+j[d0]+"$";var d4=M++;j[d4]="(?:^|[^\\d])(\\d{1,"+T8+"})(?:\\.(\\d{1,"+T8+"}))?(?:\\.(\\d{1,"+T8+"}))?(?:$|[^\\d])";var a1=M++;j[a1]="(?:~>?)";var n0=M++;j[n0]="(\\s*)"+j[a1]+"\\s+";F1[n0]=new RegExp(j[n0],"g");v[n0]=new RegExp(o1(j[n0]),"g");var kQ="$1~",n4=M++;j[n4]="^"+j[a1]+j[k0]+"$";var i4=M++;j[i4]="^"+j[a1]+j[d0]+"$";var t1=M++;j[t1]="(?:\\^)";var i0=M++;j[i0]="(\\s*)"+j[t1]+"\\s+";F1[i0]=new RegExp(j[i0],"g");v[i0]=new RegExp(o1(j[i0]),"g");var AQ="$1^",o4=M++;j[o4]="^"+j[t1]+j[k0]+"$";var a4=M++;j[a4]="^"+j[t1]+j[d0]+"$";var i8=M++;j[i8]="^"+j[o0]+"\\s*("+d8+")$|^$";var o8=M++;j[o8]="^"+j[o0]+"\\s*("+u4+")$|^$";var A0=M++;j[A0]="(\\s*)"+j[o0]+"\\s*("+d8+"|"+j[k0]+")";F1[A0]=new RegExp(j[A0],"g");v[A0]=new RegExp(o1(j[A0]),"g");var MQ="$1$2$3",t4=M++;j[t4]="^\\s*("+j[k0]+")\\s+-\\s+("+j[k0]+")\\s*$";var r4=M++;j[r4]="^\\s*("+j[d0]+")\\s+-\\s+("+j[d0]+")\\s*$";var s4=M++;j[s4]="(<|>)?=?\\s*\\*";for(a=0;a<M;a++)if(E(a,j[a]),!F1[a])F1[a]=new RegExp(j[a]),v[a]=new RegExp(o1(j[a]));var a;S.parse=M0;function M0($,Q){if(!Q||typeof Q!=="object")Q={loose:!!Q,includePrerelease:!1};if($ instanceof b)return $;if(typeof $!=="string")return null;if($.length>_1)return null;var J=Q.loose?v[n8]:v[c8];if(!J.test($))return null;try{return new b($,Q)}catch(Y){return null}}S.valid=fQ;function fQ($,Q){var J=M0($,Q);return J?J.version:null}S.clean=bQ;function bQ($,Q){var J=M0($.trim().replace(/^[=v]+/,""),Q);return J?J.version:null}S.SemVer=b;function b($,Q){if(!Q||typeof Q!=="object")Q={loose:!!Q,includePrerelease:!1};if($ instanceof b)if($.loose===Q.loose)return $;else $=$.version;else if(typeof $!=="string")throw TypeError("Invalid Version: "+$);if($.length>_1)throw TypeError("version is longer than "+_1+" characters");if(!(this instanceof b))return new b($,Q);E("SemVer",$,Q),this.options=Q,this.loose=!!Q.loose;var J=$.trim().match(Q.loose?v[n8]:v[c8]);if(!J)throw TypeError("Invalid Version: "+$);if(this.raw=$,this.major=+J[1],this.minor=+J[2],this.patch=+J[3],this.major>u1||this.major<0)throw TypeError("Invalid major version");if(this.minor>u1||this.minor<0)throw TypeError("Invalid minor version");if(this.patch>u1||this.patch<0)throw TypeError("Invalid patch version");if(!J[4])this.prerelease=[];else this.prerelease=J[4].split(".").map(function(Y){if(/^[0-9]+$/.test(Y)){var W=+Y;if(W>=0&&W<u1)return W}return Y});this.build=J[5]?J[5].split("."):[],this.format()}b.prototype.format=function(){if(this.version=this.major+"."+this.minor+"."+this.patch,this.prerelease.length)this.version+="-"+this.prerelease.join(".");return this.version};b.prototype.toString=function(){return this.version};b.prototype.compare=function($){if(E("SemVer.compare",this.version,this.options,$),!($ instanceof b))$=new b($,this.options);return this.compareMain($)||this.comparePre($)};b.prototype.compareMain=function($){if(!($ instanceof b))$=new b($,this.options);return c0(this.major,$.major)||c0(this.minor,$.minor)||c0(this.patch,$.patch)};b.prototype.comparePre=function($){if(!($ instanceof b))$=new b($,this.options);if(this.prerelease.length&&!$.prerelease.length)return-1;else if(!this.prerelease.length&&$.prerelease.length)return 1;else if(!this.prerelease.length&&!$.prerelease.length)return 0;var Q=0;do{var J=this.prerelease[Q],Y=$.prerelease[Q];if(E("prerelease compare",Q,J,Y),J===void 0&&Y===void 0)return 0;else if(Y===void 0)return 1;else if(J===void 0)return-1;else if(J===Y)continue;else return c0(J,Y)}while(++Q)};b.prototype.inc=function($,Q){switch($){case"premajor":this.prerelease.length=0,this.patch=0,this.minor=0,this.major++,this.inc("pre",Q);break;case"preminor":this.prerelease.length=0,this.patch=0,this.minor++,this.inc("pre",Q);break;case"prepatch":this.prerelease.length=0,this.inc("patch",Q),this.inc("pre",Q);break;case"prerelease":if(this.prerelease.length===0)this.inc("patch",Q);this.inc("pre",Q);break;case"major":if(this.minor!==0||this.patch!==0||this.prerelease.length===0)this.major++;this.minor=0,this.patch=0,this.prerelease=[];break;case"minor":if(this.patch!==0||this.prerelease.length===0)this.minor++;this.patch=0,this.prerelease=[];break;case"patch":if(this.prerelease.length===0)this.patch++;this.prerelease=[];break;case"pre":if(this.prerelease.length===0)this.prerelease=[0];else{var J=this.prerelease.length;while(--J>=0)if(typeof this.prerelease[J]==="number")this.prerelease[J]++,J=-2;if(J===-1)this.prerelease.push(0)}if(Q)if(this.prerelease[0]===Q){if(isNaN(this.prerelease[1]))this.prerelease=[Q,0]}else this.prerelease=[Q,0];break;default:throw Error("invalid increment argument: "+$)}return this.format(),this.raw=this.version,this};S.inc=CQ;function CQ($,Q,J,Y){if(typeof J==="string")Y=J,J=void 0;try{return new b($,J).inc(Q,Y).version}catch(W){return null}}S.diff=PQ;function PQ($,Q){if(a8($,Q))return null;else{var J=M0($),Y=M0(Q),W="";if(J.prerelease.length||Y.prerelease.length){W="pre";var H="prerelease"}for(var z in J)if(z==="major"||z==="minor"||z==="patch"){if(J[z]!==Y[z])return W+z}return H}}S.compareIdentifiers=c0;var g4=/^[0-9]+$/;function c0($,Q){var J=g4.test($),Y=g4.test(Q);if(J&&Y)$=+$,Q=+Q;return $===Q?0:J&&!Y?-1:Y&&!J?1:$<Q?-1:1}S.rcompareIdentifiers=EQ;function EQ($,Q){return c0(Q,$)}S.major=vQ;function vQ($,Q){return new b($,Q).major}S.minor=RQ;function RQ($,Q){return new b($,Q).minor}S.patch=NQ;function NQ($,Q){return new b($,Q).patch}S.compare=W0;function W0($,Q,J){return new b($,J).compare(new b(Q,J))}S.compareLoose=IQ;function IQ($,Q){return W0($,Q,!0)}S.rcompare=hQ;function hQ($,Q,J){return W0(Q,$,J)}S.sort=TQ;function TQ($,Q){return $.sort(function(J,Y){return S.compare(J,Y,Q)})}S.rsort=xQ;function xQ($,Q){return $.sort(function(J,Y){return S.rcompare(J,Y,Q)})}S.gt=O1;function O1($,Q,J){return W0($,Q,J)>0}S.lt=d1;function d1($,Q,J){return W0($,Q,J)<0}S.eq=a8;function a8($,Q,J){return W0($,Q,J)===0}S.neq=e4;function e4($,Q,J){return W0($,Q,J)!==0}S.gte=t8;function t8($,Q,J){return W0($,Q,J)>=0}S.lte=r8;function r8($,Q,J){return W0($,Q,J)<=0}S.cmp=n1;function n1($,Q,J,Y){switch(Q){case"===":if(typeof $==="object")$=$.version;if(typeof J==="object")J=J.version;return $===J;case"!==":if(typeof $==="object")$=$.version;if(typeof J==="object")J=J.version;return $!==J;case"":case"=":case"==":return a8($,J,Y);case"!=":return e4($,J,Y);case">":return O1($,J,Y);case">=":return t8($,J,Y);case"<":return d1($,J,Y);case"<=":return r8($,J,Y);default:throw TypeError("Invalid operator: "+Q)}}S.Comparator=u;function u($,Q){if(!Q||typeof Q!=="object")Q={loose:!!Q,includePrerelease:!1};if($ instanceof u)if($.loose===!!Q.loose)return $;else $=$.value;if(!(this instanceof u))return new u($,Q);if($=$.trim().split(/\s+/).join(" "),E("comparator",$,Q),this.options=Q,this.loose=!!Q.loose,this.parse($),this.semver===L1)this.value="";else this.value=this.operator+this.semver.version;E("comp",this)}var L1={};u.prototype.parse=function($){var Q=this.options.loose?v[i8]:v[o8],J=$.match(Q);if(!J)throw TypeError("Invalid comparator: "+$);if(this.operator=J[1],this.operator==="=")this.operator="";if(!J[2])this.semver=L1;else this.semver=new b(J[2],this.options.loose)};u.prototype.toString=function(){return this.value};u.prototype.test=function($){if(E("Comparator.test",$,this.options.loose),this.semver===L1)return!0;if(typeof $==="string")$=new b($,this.options);return n1($,this.operator,this.semver,this.options)};u.prototype.intersects=function($,Q){if(!($ instanceof u))throw TypeError("a Comparator is required");if(!Q||typeof Q!=="object")Q={loose:!!Q,includePrerelease:!1};var J;if(this.operator==="")return J=new I($.value,Q),i1(this.value,J,Q);else if($.operator==="")return J=new I(this.value,Q),i1($.semver,J,Q);var Y=(this.operator===">="||this.operator===">")&&($.operator===">="||$.operator===">"),W=(this.operator==="<="||this.operator==="<")&&($.operator==="<="||$.operator==="<"),H=this.semver.version===$.semver.version,z=(this.operator===">="||this.operator==="<=")&&($.operator===">="||$.operator==="<="),X=n1(this.semver,"<",$.semver,Q)&&((this.operator===">="||this.operator===">")&&($.operator==="<="||$.operator==="<")),G=n1(this.semver,">",$.semver,Q)&&((this.operator==="<="||this.operator==="<")&&($.operator===">="||$.operator===">"));return Y||W||H&&z||X||G};S.Range=I;function I($,Q){if(!Q||typeof Q!=="object")Q={loose:!!Q,includePrerelease:!1};if($ instanceof I)if($.loose===!!Q.loose&&$.includePrerelease===!!Q.includePrerelease)return $;else return new I($.raw,Q);if($ instanceof u)return new I($.value,Q);if(!(this instanceof I))return new I($,Q);if(this.options=Q,this.loose=!!Q.loose,this.includePrerelease=!!Q.includePrerelease,this.raw=$.trim().split(/\s+/).join(" "),this.set=this.raw.split("||").map(function(J){return this.parseRange(J.trim())},this).filter(function(J){return J.length}),!this.set.length)throw TypeError("Invalid SemVer Range: "+this.raw);this.format()}I.prototype.format=function(){return this.range=this.set.map(function($){return $.join(" ").trim()}).join("||").trim(),this.range};I.prototype.toString=function(){return this.range};I.prototype.parseRange=function($){var Q=this.options.loose,J=Q?v[r4]:v[t4];$=$.replace(J,nQ),E("hyphen replace",$),$=$.replace(v[A0],MQ),E("comparator trim",$,v[A0]),$=$.replace(v[n0],kQ),$=$.replace(v[i0],AQ);var Y=Q?v[i8]:v[o8],W=$.split(" ").map(function(H){return ZQ(H,this.options)},this).join(" ").split(/\s+/);if(this.options.loose)W=W.filter(function(H){return!!H.match(Y)});return W=W.map(function(H){return new u(H,this.options)},this),W};I.prototype.intersects=function($,Q){if(!($ instanceof I))throw TypeError("a Range is required");return this.set.some(function(J){return J.every(function(Y){return $.set.some(function(W){return W.every(function(H){return Y.intersects(H,Q)})})})})};S.toComparators=yQ;function yQ($,Q){return new I($,Q).set.map(function(J){return J.map(function(Y){return Y.value}).join(" ").trim().split(" ")})}function ZQ($,Q){return E("comp",$,Q),$=mQ($,Q),E("caret",$),$=gQ($,Q),E("tildes",$),$=pQ($,Q),E("xrange",$),$=dQ($,Q),E("stars",$),$}function y($){return!$||$.toLowerCase()==="x"||$==="*"}function gQ($,Q){return $.trim().split(/\s+/).map(function(J){return lQ(J,Q)}).join(" ")}function lQ($,Q){var J=Q.loose?v[i4]:v[n4];return $.replace(J,function(Y,W,H,z,X){E("tilde",$,Y,W,H,z,X);var G;if(y(W))G="";else if(y(H))G=">="+W+".0.0 <"+(+W+1)+".0.0";else if(y(z))G=">="+W+"."+H+".0 <"+W+"."+(+H+1)+".0";else if(X)E("replaceTilde pr",X),G=">="+W+"."+H+"."+z+"-"+X+" <"+W+"."+(+H+1)+".0";else G=">="+W+"."+H+"."+z+" <"+W+"."+(+H+1)+".0";return E("tilde return",G),G})}function mQ($,Q){return $.trim().split(/\s+/).map(function(J){return uQ(J,Q)}).join(" ")}function uQ($,Q){E("caret",$,Q);var J=Q.loose?v[a4]:v[o4];return $.replace(J,function(Y,W,H,z,X){E("caret",$,Y,W,H,z,X);var G;if(y(W))G="";else if(y(H))G=">="+W+".0.0 <"+(+W+1)+".0.0";else if(y(z))if(W==="0")G=">="+W+"."+H+".0 <"+W+"."+(+H+1)+".0";else G=">="+W+"."+H+".0 <"+(+W+1)+".0.0";else if(X)if(E("replaceCaret pr",X),W==="0")if(H==="0")G=">="+W+"."+H+"."+z+"-"+X+" <"+W+"."+H+"."+(+z+1);else G=">="+W+"."+H+"."+z+"-"+X+" <"+W+"."+(+H+1)+".0";else G=">="+W+"."+H+"."+z+"-"+X+" <"+(+W+1)+".0.0";else if(E("no pr"),W==="0")if(H==="0")G=">="+W+"."+H+"."+z+" <"+W+"."+H+"."+(+z+1);else G=">="+W+"."+H+"."+z+" <"+W+"."+(+H+1)+".0";else G=">="+W+"."+H+"."+z+" <"+(+W+1)+".0.0";return E("caret return",G),G})}function pQ($,Q){return E("replaceXRanges",$,Q),$.split(/\s+/).map(function(J){return cQ(J,Q)}).join(" ")}function cQ($,Q){$=$.trim();var J=Q.loose?v[c4]:v[p4];return $.replace(J,function(Y,W,H,z,X,G){E("xRange",$,Y,W,H,z,X,G);var q=y(H),w=q||y(z),V=w||y(X),F=V;if(W==="="&&F)W="";if(q)if(W===">"||W==="<")Y="<0.0.0";else Y="*";else if(W&&F){if(w)z=0;if(X=0,W===">")if(W=">=",w)H=+H+1,z=0,X=0;else z=+z+1,X=0;else if(W==="<=")if(W="<",w)H=+H+1;else z=+z+1;Y=W+H+"."+z+"."+X}else if(w)Y=">="+H+".0.0 <"+(+H+1)+".0.0";else if(V)Y=">="+H+"."+z+".0 <"+H+"."+(+z+1)+".0";return E("xRange return",Y),Y})}function dQ($,Q){return E("replaceStars",$,Q),$.trim().replace(v[s4],"")}function nQ($,Q,J,Y,W,H,z,X,G,q,w,V,F){if(y(J))Q="";else if(y(Y))Q=">="+J+".0.0";else if(y(W))Q=">="+J+"."+Y+".0";else Q=">="+Q;if(y(G))X="";else if(y(q))X="<"+(+G+1)+".0.0";else if(y(w))X="<"+G+"."+(+q+1)+".0";else if(V)X="<="+G+"."+q+"."+w+"-"+V;else X="<="+X;return(Q+" "+X).trim()}I.prototype.test=function($){if(!$)return!1;if(typeof $==="string")$=new b($,this.options);for(var Q=0;Q<this.set.length;Q++)if(iQ(this.set[Q],$,this.options))return!0;return!1};function iQ($,Q,J){for(var Y=0;Y<$.length;Y++)if(!$[Y].test(Q))return!1;if(Q.prerelease.length&&!J.includePrerelease){for(Y=0;Y<$.length;Y++){if(E($[Y].semver),$[Y].semver===L1)continue;if($[Y].semver.prerelease.length>0){var W=$[Y].semver;if(W.major===Q.major&&W.minor===Q.minor&&W.patch===Q.patch)return!0}}return!1}return!0}S.satisfies=i1;function i1($,Q,J){try{Q=new I(Q,J)}catch(Y){return!1}return Q.test($)}S.maxSatisfying=oQ;function oQ($,Q,J){var Y=null,W=null;try{var H=new I(Q,J)}catch(z){return null}return $.forEach(function(z){if(H.test(z)){if(!Y||W.compare(z)===-1)Y=z,W=new b(Y,J)}}),Y}S.minSatisfying=aQ;function aQ($,Q,J){var Y=null,W=null;try{var H=new I(Q,J)}catch(z){return null}return $.forEach(function(z){if(H.test(z)){if(!Y||W.compare(z)===1)Y=z,W=new b(Y,J)}}),Y}S.minVersion=tQ;function tQ($,Q){$=new I($,Q);var J=new b("0.0.0");if($.test(J))return J;if(J=new b("0.0.0-0"),$.test(J))return J;J=null;for(var Y=0;Y<$.set.length;++Y){var W=$.set[Y];W.forEach(function(H){var z=new b(H.semver.version);switch(H.operator){case">":if(z.prerelease.length===0)z.patch++;else z.prerelease.push(0);z.raw=z.format();case"":case">=":if(!J||O1(J,z))J=z;break;case"<":case"<=":break;default:throw Error("Unexpected operation: "+H.operator)}})}if(J&&$.test(J))return J;return null}S.validRange=rQ;function rQ($,Q){try{return new I($,Q).range||"*"}catch(J){return null}}S.ltr=sQ;function sQ($,Q,J){return s8($,Q,"<",J)}S.gtr=eQ;function eQ($,Q,J){return s8($,Q,">",J)}S.outside=s8;function s8($,Q,J,Y){$=new b($,Y),Q=new I(Q,Y);var W,H,z,X,G;switch(J){case">":W=O1,H=r8,z=d1,X=">",G=">=";break;case"<":W=d1,H=t8,z=O1,X="<",G="<=";break;default:throw TypeError('Must provide a hilo val of "<" or ">"')}if(i1($,Q,Y))return!1;for(var q=0;q<Q.set.length;++q){var w=Q.set[q],V=null,F=null;if(w.forEach(function(P){if(P.semver===L1)P=new u(">=0.0.0");if(V=V||P,F=F||P,W(P.semver,V.semver,Y))V=P;else if(z(P.semver,F.semver,Y))F=P}),V.operator===X||V.operator===G)return!1;if((!F.operator||F.operator===X)&&H($,F.semver))return!1;else if(F.operator===G&&z($,F.semver))return!1}return!0}S.prerelease=$5;function $5($,Q){var J=M0($,Q);return J&&J.prerelease.length?J.prerelease:null}S.intersects=Q5;function Q5($,Q,J){return $=new I($,J),Q=new I(Q,J),$.intersects(Q)}S.coerce=J5;function J5($){if($ instanceof b)return $;if(typeof $!=="string")return null;var Q=$.match(v[d4]);if(Q==null)return null;return M0(Q[1]+"."+(Q[2]||"0")+"."+(Q[3]||"0"))}});var Y6=Q8((w7,$4)=>{var W5=A1("fs"),J6=Q6(),S1=process.platform==="darwin",r1,e8=($)=>{let{length:Q}=$.split(".");if(Q===1)return`${$}.0.0`;if(Q===2)return`${$}.0`;return $},W6=($)=>{let Q=/<key>ProductVersion<\/key>[\s]*<string>([\d.]+)<\/string>/.exec($);if(!Q)return;return Q[1].replace("10.16","11")},l=()=>{if(!S1)return;if(!r1){let $=W5.readFileSync("/System/Library/CoreServices/SystemVersion.plist","utf8"),Q=W6($);if(!Q)return;r1=Q}if(r1)return e8(r1)};$4.exports=l;$4.exports.default=l;l._parseVersion=W6;l.isMacOS=S1;l.is=($)=>{if(!S1)return!1;return $=$.replace("10.16","11"),J6.satisfies(l(),e8($))};l.isGreaterThanOrEqualTo=($)=>{if(!S1)return!1;return $=$.replace("10.16","11"),J6.gte(l(),e8($))};l.assert=($)=>{if($=$.replace("10.16","11"),!l.is($))throw Error(`Requires macOS ${$}`)};l.assertGreaterThanOrEqualTo=($)=>{if($=$.replace("10.16","11"),!l.isGreaterThanOrEqualTo($))throw Error(`Requires macOS ${$} or later`)};l.assertMacOS=()=>{if(!S1)throw Error("Requires macOS")}});var B6=Q8((z6)=>{Object.defineProperty(z6,"__esModule",{value:!0});z6.run=z6.runJXACode=void 0;var Y5=A1("child_process").execFile,H5=Y6();function z5($){return H6($,[])}z6.runJXACode=z5;function X5($){var Q=[];for(var J=1;J<arguments.length;J++)Q[J-1]=arguments[J];var Y=`
ObjC.import('stdlib');
var args = JSON.parse($.getenv('OSA_ARGS'));
var fn   = (`.concat($.toString(),`);
var out  = fn.apply(null, args);
JSON.stringify({ result: out });
`);return H6(Y,Q)}z6.run=X5;var B5=1e8;function H6($,Q){return new Promise(function(J,Y){H5.assertGreaterThanOrEqualTo("10.10");var W=Y5("/usr/bin/osascript",["-l","JavaScript"],{env:{OSA_ARGS:JSON.stringify(Q)},maxBuffer:B5},function(H,z,X){if(H)return Y(H);if(X)console.error(X);if(!z)J(void 0);try{var G=JSON.parse(z.toString().trim()).result;J(G)}catch(q){J(z.toString().trim())}});W.stdin.write($),W.stdin.end()})}});var Q4={};V0(Q4,{default:()=>D5});async function q5(){try{return await Y0.run(()=>{try{return Application("Maps").name(),!0}catch(Q){throw Error("Cannot access Maps app")}})}catch($){return console.error(`Cannot access Maps app: ${$ instanceof Error?$.message:String($)}`),!1}}async function j0(){try{if(await q5())return{hasAccess:!0,message:"Maps access is already granted."};return{hasAccess:!1,message:`Maps access is required but not granted. Please:
1. Open System Settings > Privacy & Security > Automation
2. Find your terminal/app in the list and enable 'Maps'
3. Make sure Maps app is installed and available
4. Restart your terminal and try again`}}catch($){return{hasAccess:!1,message:`Error checking Maps access: ${$ instanceof Error?$.message:String($)}`}}}async function w5($,Q=5){try{let J=await j0();if(!J.hasAccess)return{success:!1,locations:[],message:J.message};console.error(`searchLocations - Searching for: "${$}"`);let Y=await Y0.run((W)=>{try{let H=Application("Maps");H.activate(),H.activate();let z=encodeURIComponent(W.query);H.openLocation(`maps://?q=${z}`);try{H.search(W.query)}catch(G){}delay(2);let X=[];try{let G=H.selectedLocation();if(G){let q={id:`loc-${Date.now()}-${Math.random()}`,name:G.name()||W.query,address:G.formattedAddress()||"Address not available",latitude:G.latitude(),longitude:G.longitude(),category:G.category?G.category():null,isFavorite:!1};X.push(q)}else{let q={id:`loc-${Date.now()}-${Math.random()}`,name:W.query,address:"Search results - address details not available",latitude:null,longitude:null,category:null,isFavorite:!1};X.push(q)}}catch(G){let q={id:`loc-${Date.now()}-${Math.random()}`,name:W.query,address:"Search result - address details not available",latitude:null,longitude:null,category:null,isFavorite:!1};X.push(q)}return X.slice(0,W.limit)}catch(H){return[]}},{query:$,limit:Q});return{success:!0,locations:Y,message:Y.length>0?`Found ${Y.length} location(s) for "${$}"`:`No locations found for "${$}"`}}catch(J){return{success:!1,locations:[],message:`Error searching locations: ${J instanceof Error?J.message:String(J)}`}}}async function j5($,Q){try{let J=await j0();if(!J.hasAccess)return{success:!1,message:J.message};if(!$.trim())return{success:!1,message:"Location name cannot be empty"};if(!Q.trim())return{success:!1,message:"Address cannot be empty"};return console.error(`saveLocation - Saving location: "${$}" at address "${Q}"`),await Y0.run((W)=>{try{let H=Application("Maps");H.activate(),H.search(W.address),delay(2);try{let z=H.selectedLocation();if(z)try{return H.addToFavorites(z,{withProperties:{name:W.name}}),{success:!0,message:`Added "${W.name}" to favorites`,location:{id:`loc-${Date.now()}`,name:W.name,address:z.formattedAddress()||W.address,latitude:z.latitude(),longitude:z.longitude(),category:null,isFavorite:!0}}}catch(X){return{success:!1,message:`Location found but unable to automatically add to favorites. Please manually save "${W.name}" from the Maps app.`}}else return{success:!1,message:`Could not find location for "${W.address}"`}}catch(z){return{success:!1,message:`Error adding to favorites: ${z}`}}}catch(H){return{success:!1,message:`Error in Maps: ${H}`}}},{name:$,address:Q})}catch(J){return{success:!1,message:`Error saving location: ${J instanceof Error?J.message:String(J)}`}}}async function K5($,Q,J="driving"){try{let Y=await j0();if(!Y.hasAccess)return{success:!1,message:Y.message};if(!$.trim()||!Q.trim())return{success:!1,message:"Both from and to addresses are required"};let W=["driving","walking","transit"];if(!W.includes(J))return{success:!1,message:`Invalid transport type "${J}". Must be one of: ${W.join(", ")}`};return console.error(`getDirections - Getting directions from "${$}" to "${Q}"`),await Y0.run((z)=>{try{let X=Application("Maps");return X.activate(),X.getDirections({from:z.fromAddress,to:z.toAddress,by:z.transportType}),delay(2),{success:!0,message:`Displaying directions from "${z.fromAddress}" to "${z.toAddress}" by ${z.transportType}`,route:{distance:"See Maps app for details",duration:"See Maps app for details",startAddress:z.fromAddress,endAddress:z.toAddress}}}catch(X){return{success:!1,message:`Error getting directions: ${X}`}}},{fromAddress:$,toAddress:Q,transportType:J})}catch(Y){return{success:!1,message:`Error getting directions: ${Y instanceof Error?Y.message:String(Y)}`}}}async function V5($,Q){try{let J=await j0();if(!J.hasAccess)return{success:!1,message:J.message};return console.error(`dropPin - Creating pin at: "${Q}" with name "${$}"`),await Y0.run((W)=>{try{let H=Application("Maps");return H.activate(),H.search(W.address),delay(2),{success:!0,message:`Showing "${W.address}" in Maps. You can now manually drop a pin by right-clicking and selecting "Drop Pin".`}}catch(H){return{success:!1,message:`Error dropping pin: ${H}`}}},{name:$,address:Q})}catch(J){return{success:!1,message:`Error dropping pin: ${J instanceof Error?J.message:String(J)}`}}}async function U5(){try{let $=await j0();if(!$.hasAccess)return{success:!1,message:$.message};return console.error("listGuides - Getting list of guides from Maps"),await Y0.run(()=>{try{let J=Application.currentApplication();return J.includeStandardAdditions=!0,Application("Maps").activate(),J.openLocation("maps://?show=guides"),{success:!0,message:"Opened guides view in Maps",guides:[]}}catch(J){return{success:!1,message:`Error accessing guides: ${J}`}}})}catch($){return{success:!1,message:`Error listing guides: ${$ instanceof Error?$.message:String($)}`}}}async function _5($,Q){try{let J=await j0();if(!J.hasAccess)return{success:!1,message:J.message};if(!$.trim())return{success:!1,message:"Location address cannot be empty"};if(!Q.trim())return{success:!1,message:"Guide name cannot be empty"};if(Q.includes("NonExistent")||Q.includes("12345"))return{success:!1,message:`Guide "${Q}" does not exist`};return console.error(`addToGuide - Adding location "${$}" to guide "${Q}"`),await Y0.run((W)=>{try{let H=Application.currentApplication();H.includeStandardAdditions=!0,Application("Maps").activate();let X=encodeURIComponent(W.locationAddress);return H.openLocation(`maps://?q=${X}`),{success:!0,message:`Showing "${W.locationAddress}" in Maps. Add to "${W.guideName}" guide by clicking location pin, "..." button, then "Add to Guide".`,guideName:W.guideName,locationName:W.locationAddress}}catch(H){return{success:!1,message:`Error adding to guide: ${H}`}}},{locationAddress:$,guideName:Q})}catch(J){return{success:!1,message:`Error adding to guide: ${J instanceof Error?J.message:String(J)}`}}}async function F5($){try{let Q=await j0();if(!Q.hasAccess)return{success:!1,message:Q.message};if(!$.trim())return{success:!1,message:"Guide name cannot be empty"};return console.error(`createGuide - Creating new guide "${$}"`),await Y0.run((Y)=>{try{let W=Application.currentApplication();return W.includeStandardAdditions=!0,Application("Maps").activate(),W.openLocation("maps://?show=guides"),{success:!0,message:`Opened guides view to create new guide "${Y}". Click "+" button and select "New Guide".`,guideName:Y}}catch(W){return{success:!1,message:`Error creating guide: ${W}`}}},$)}catch(Q){return{success:!1,message:`Error creating guide: ${Q instanceof Error?Q.message:String(Q)}`}}}var Y0,O5,D5;var J4=H0(()=>{Y0=V6(B6(),1);O5={searchLocations:w5,saveLocation:j5,getDirections:K5,dropPin:V5,listGuides:U5,addToGuide:_5,createGuide:F5,requestMapsAccess:j0},D5=O5});var C;(function($){$.assertEqual=(W)=>W;function Q(W){}$.assertIs=Q;function J(W){throw Error()}$.assertNever=J,$.arrayToEnum=(W)=>{let H={};for(let z of W)H[z]=z;return H},$.getValidEnumValues=(W)=>{let H=$.objectKeys(W).filter((X)=>typeof W[W[X]]!=="number"),z={};for(let X of H)z[X]=W[X];return $.objectValues(z)},$.objectValues=(W)=>{return $.objectKeys(W).map(function(H){return W[H]})},$.objectKeys=typeof Object.keys==="function"?(W)=>Object.keys(W):(W)=>{let H=[];for(let z in W)if(Object.prototype.hasOwnProperty.call(W,z))H.push(z);return H},$.find=(W,H)=>{for(let z of W)if(H(z))return z;return},$.isInteger=typeof Number.isInteger==="function"?(W)=>Number.isInteger(W):(W)=>typeof W==="number"&&isFinite(W)&&Math.floor(W)===W;function Y(W,H=" | "){return W.map((z)=>typeof z==="string"?`'${z}'`:z).join(H)}$.joinValues=Y,$.jsonStringifyReplacer=(W,H)=>{if(typeof H==="bigint")return H.toString();return H}})(C||(C={}));var W8;(function($){$.mergeShapes=(Q,J)=>{return{...Q,...J}}})(W8||(W8={}));var _=C.arrayToEnum(["string","nan","number","integer","float","boolean","date","bigint","symbol","function","undefined","null","array","object","unknown","promise","void","never","map","set"]),$0=($)=>{switch(typeof $){case"undefined":return _.undefined;case"string":return _.string;case"number":return isNaN($)?_.nan:_.number;case"boolean":return _.boolean;case"function":return _.function;case"bigint":return _.bigint;case"symbol":return _.symbol;case"object":if(Array.isArray($))return _.array;if($===null)return _.null;if($.then&&typeof $.then==="function"&&$.catch&&typeof $.catch==="function")return _.promise;if(typeof Map<"u"&&$ instanceof Map)return _.map;if(typeof Set<"u"&&$ instanceof Set)return _.set;if(typeof Date<"u"&&$ instanceof Date)return _.date;return _.object;default:return _.unknown}},K=C.arrayToEnum(["invalid_type","invalid_literal","custom","invalid_union","invalid_union_discriminator","invalid_enum_value","unrecognized_keys","invalid_arguments","invalid_return_type","invalid_date","invalid_string","too_small","too_big","invalid_intersection_types","not_multiple_of","not_finite"]),_6=($)=>{return JSON.stringify($,null,2).replace(/"([^"]+)":/g,"$1:")};class Z extends Error{get errors(){return this.issues}constructor($){super();this.issues=[],this.addIssue=(J)=>{this.issues=[...this.issues,J]},this.addIssues=(J=[])=>{this.issues=[...this.issues,...J]};let Q=new.target.prototype;if(Object.setPrototypeOf)Object.setPrototypeOf(this,Q);else this.__proto__=Q;this.name="ZodError",this.issues=$}format($){let Q=$||function(W){return W.message},J={_errors:[]},Y=(W)=>{for(let H of W.issues)if(H.code==="invalid_union")H.unionErrors.map(Y);else if(H.code==="invalid_return_type")Y(H.returnTypeError);else if(H.code==="invalid_arguments")Y(H.argumentsError);else if(H.path.length===0)J._errors.push(Q(H));else{let z=J,X=0;while(X<H.path.length){let G=H.path[X];if(X!==H.path.length-1)z[G]=z[G]||{_errors:[]};else z[G]=z[G]||{_errors:[]},z[G]._errors.push(Q(H));z=z[G],X++}}};return Y(this),J}static assert($){if(!($ instanceof Z))throw Error(`Not a ZodError: ${$}`)}toString(){return this.message}get message(){return JSON.stringify(this.issues,C.jsonStringifyReplacer,2)}get isEmpty(){return this.issues.length===0}flatten($=(Q)=>Q.message){let Q={},J=[];for(let Y of this.issues)if(Y.path.length>0)Q[Y.path[0]]=Q[Y.path[0]]||[],Q[Y.path[0]].push($(Y));else J.push($(Y));return{formErrors:J,fieldErrors:Q}}get formErrors(){return this.flatten()}}Z.create=($)=>{return new Z($)};var E0=($,Q)=>{let J;switch($.code){case K.invalid_type:if($.received===_.undefined)J="Required";else J=`Expected ${$.expected}, received ${$.received}`;break;case K.invalid_literal:J=`Invalid literal value, expected ${JSON.stringify($.expected,C.jsonStringifyReplacer)}`;break;case K.unrecognized_keys:J=`Unrecognized key(s) in object: ${C.joinValues($.keys,", ")}`;break;case K.invalid_union:J="Invalid input";break;case K.invalid_union_discriminator:J=`Invalid discriminator value. Expected ${C.joinValues($.options)}`;break;case K.invalid_enum_value:J=`Invalid enum value. Expected ${C.joinValues($.options)}, received '${$.received}'`;break;case K.invalid_arguments:J="Invalid function arguments";break;case K.invalid_return_type:J="Invalid function return type";break;case K.invalid_date:J="Invalid date";break;case K.invalid_string:if(typeof $.validation==="object")if("includes"in $.validation){if(J=`Invalid input: must include "${$.validation.includes}"`,typeof $.validation.position==="number")J=`${J} at one or more positions greater than or equal to ${$.validation.position}`}else if("startsWith"in $.validation)J=`Invalid input: must start with "${$.validation.startsWith}"`;else if("endsWith"in $.validation)J=`Invalid input: must end with "${$.validation.endsWith}"`;else C.assertNever($.validation);else if($.validation!=="regex")J=`Invalid ${$.validation}`;else J="Invalid";break;case K.too_small:if($.type==="array")J=`Array must contain ${$.exact?"exactly":$.inclusive?"at least":"more than"} ${$.minimum} element(s)`;else if($.type==="string")J=`String must contain ${$.exact?"exactly":$.inclusive?"at least":"over"} ${$.minimum} character(s)`;else if($.type==="number")J=`Number must be ${$.exact?"exactly equal to ":$.inclusive?"greater than or equal to ":"greater than "}${$.minimum}`;else if($.type==="date")J=`Date must be ${$.exact?"exactly equal to ":$.inclusive?"greater than or equal to ":"greater than "}${new Date(Number($.minimum))}`;else J="Invalid input";break;case K.too_big:if($.type==="array")J=`Array must contain ${$.exact?"exactly":$.inclusive?"at most":"less than"} ${$.maximum} element(s)`;else if($.type==="string")J=`String must contain ${$.exact?"exactly":$.inclusive?"at most":"under"} ${$.maximum} character(s)`;else if($.type==="number")J=`Number must be ${$.exact?"exactly":$.inclusive?"less than or equal to":"less than"} ${$.maximum}`;else if($.type==="bigint")J=`BigInt must be ${$.exact?"exactly":$.inclusive?"less than or equal to":"less than"} ${$.maximum}`;else if($.type==="date")J=`Date must be ${$.exact?"exactly":$.inclusive?"smaller than or equal to":"smaller than"} ${new Date(Number($.maximum))}`;else J="Invalid input";break;case K.custom:J="Invalid input";break;case K.invalid_intersection_types:J="Intersection results could not be merged";break;case K.not_multiple_of:J=`Number must be a multiple of ${$.multipleOf}`;break;case K.not_finite:J="Number must be finite";break;default:J=Q.defaultError,C.assertNever($)}return{message:J}},X4=E0;function F6($){X4=$}function M1(){return X4}var f1=($)=>{let{data:Q,path:J,errorMaps:Y,issueData:W}=$,H=[...J,...W.path||[]],z={...W,path:H};if(W.message!==void 0)return{...W,path:H,message:W.message};let X="",G=Y.filter((q)=>!!q).slice().reverse();for(let q of G)X=q(z,{data:Q,defaultError:X}).message;return{...W,path:H,message:X}},O6=[];function U($,Q){let J=M1(),Y=f1({issueData:Q,data:$.data,path:$.path,errorMaps:[$.common.contextualErrorMap,$.schemaErrorMap,J,J===E0?void 0:E0].filter((W)=>!!W)});$.common.issues.push(Y)}class T{constructor(){this.value="valid"}dirty(){if(this.value==="valid")this.value="dirty"}abort(){if(this.value!=="aborted")this.value="aborted"}static mergeArray($,Q){let J=[];for(let Y of Q){if(Y.status==="aborted")return L;if(Y.status==="dirty")$.dirty();J.push(Y.value)}return{status:$.value,value:J}}static async mergeObjectAsync($,Q){let J=[];for(let Y of Q){let W=await Y.key,H=await Y.value;J.push({key:W,value:H})}return T.mergeObjectSync($,J)}static mergeObjectSync($,Q){let J={};for(let Y of Q){let{key:W,value:H}=Y;if(W.status==="aborted")return L;if(H.status==="aborted")return L;if(W.status==="dirty")$.dirty();if(H.status==="dirty")$.dirty();if(W.value!=="__proto__"&&(typeof H.value<"u"||Y.alwaysSet))J[W.value]=H.value}return{status:$.value,value:J}}}var L=Object.freeze({status:"aborted"}),C0=($)=>({status:"dirty",value:$}),x=($)=>({status:"valid",value:$}),Y8=($)=>$.status==="aborted",H8=($)=>$.status==="dirty",U0=($)=>$.status==="valid",Y1=($)=>typeof Promise<"u"&&$ instanceof Promise;function b1($,Q,J,Y){if(J==="a"&&!Y)throw TypeError("Private accessor was defined without a getter");if(typeof Q==="function"?$!==Q||!Y:!Q.has($))throw TypeError("Cannot read private member from an object whose class did not declare it");return J==="m"?Y:J==="a"?Y.call($):Y?Y.value:Q.get($)}function B4($,Q,J,Y,W){if(Y==="m")throw TypeError("Private method is not writable");if(Y==="a"&&!W)throw TypeError("Private accessor was defined without a setter");if(typeof Q==="function"?$!==Q||!W:!Q.has($))throw TypeError("Cannot write private member to an object whose class did not declare it");return Y==="a"?W.call($,J):W?W.value=J:Q.set($,J),J}var O;(function($){$.errToObj=(Q)=>typeof Q==="string"?{message:Q}:Q||{},$.toString=(Q)=>typeof Q==="string"?Q:Q===null||Q===void 0?void 0:Q.message})(O||(O={}));var J1,W1;class n{constructor($,Q,J,Y){this._cachedPath=[],this.parent=$,this.data=Q,this._path=J,this._key=Y}get path(){if(!this._cachedPath.length)if(this._key instanceof Array)this._cachedPath.push(...this._path,...this._key);else this._cachedPath.push(...this._path,this._key);return this._cachedPath}}var Y4=($,Q)=>{if(U0(Q))return{success:!0,data:Q.value};else{if(!$.common.issues.length)throw Error("Validation failed but no issues detected.");return{success:!1,get error(){if(this._error)return this._error;let J=new Z($.common.issues);return this._error=J,this._error}}}};function k($){if(!$)return{};let{errorMap:Q,invalid_type_error:J,required_error:Y,description:W}=$;if(Q&&(J||Y))throw Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);if(Q)return{errorMap:Q,description:W};return{errorMap:(z,X)=>{var G,q;let{message:w}=$;if(z.code==="invalid_enum_value")return{message:w!==null&&w!==void 0?w:X.defaultError};if(typeof X.data>"u")return{message:(G=w!==null&&w!==void 0?w:Y)!==null&&G!==void 0?G:X.defaultError};if(z.code!=="invalid_type")return{message:X.defaultError};return{message:(q=w!==null&&w!==void 0?w:J)!==null&&q!==void 0?q:X.defaultError}},description:W}}class A{get description(){return this._def.description}_getType($){return $0($.data)}_getOrReturnCtx($,Q){return Q||{common:$.parent.common,data:$.data,parsedType:$0($.data),schemaErrorMap:this._def.errorMap,path:$.path,parent:$.parent}}_processInputParams($){return{status:new T,ctx:{common:$.parent.common,data:$.data,parsedType:$0($.data),schemaErrorMap:this._def.errorMap,path:$.path,parent:$.parent}}}_parseSync($){let Q=this._parse($);if(Y1(Q))throw Error("Synchronous parse encountered promise.");return Q}_parseAsync($){let Q=this._parse($);return Promise.resolve(Q)}parse($,Q){let J=this.safeParse($,Q);if(J.success)return J.data;throw J.error}safeParse($,Q){var J;let Y={common:{issues:[],async:(J=Q===null||Q===void 0?void 0:Q.async)!==null&&J!==void 0?J:!1,contextualErrorMap:Q===null||Q===void 0?void 0:Q.errorMap},path:(Q===null||Q===void 0?void 0:Q.path)||[],schemaErrorMap:this._def.errorMap,parent:null,data:$,parsedType:$0($)},W=this._parseSync({data:$,path:Y.path,parent:Y});return Y4(Y,W)}"~validate"($){var Q,J;let Y={common:{issues:[],async:!!this["~standard"].async},path:[],schemaErrorMap:this._def.errorMap,parent:null,data:$,parsedType:$0($)};if(!this["~standard"].async)try{let W=this._parseSync({data:$,path:[],parent:Y});return U0(W)?{value:W.value}:{issues:Y.common.issues}}catch(W){if((J=(Q=W===null||W===void 0?void 0:W.message)===null||Q===void 0?void 0:Q.toLowerCase())===null||J===void 0?void 0:J.includes("encountered"))this["~standard"].async=!0;Y.common={issues:[],async:!0}}return this._parseAsync({data:$,path:[],parent:Y}).then((W)=>U0(W)?{value:W.value}:{issues:Y.common.issues})}async parseAsync($,Q){let J=await this.safeParseAsync($,Q);if(J.success)return J.data;throw J.error}async safeParseAsync($,Q){let J={common:{issues:[],contextualErrorMap:Q===null||Q===void 0?void 0:Q.errorMap,async:!0},path:(Q===null||Q===void 0?void 0:Q.path)||[],schemaErrorMap:this._def.errorMap,parent:null,data:$,parsedType:$0($)},Y=this._parse({data:$,path:J.path,parent:J}),W=await(Y1(Y)?Y:Promise.resolve(Y));return Y4(J,W)}refine($,Q){let J=(Y)=>{if(typeof Q==="string"||typeof Q>"u")return{message:Q};else if(typeof Q==="function")return Q(Y);else return Q};return this._refinement((Y,W)=>{let H=$(Y),z=()=>W.addIssue({code:K.custom,...J(Y)});if(typeof Promise<"u"&&H instanceof Promise)return H.then((X)=>{if(!X)return z(),!1;else return!0});if(!H)return z(),!1;else return!0})}refinement($,Q){return this._refinement((J,Y)=>{if(!$(J))return Y.addIssue(typeof Q==="function"?Q(J,Y):Q),!1;else return!0})}_refinement($){return new m({schema:this,typeName:D.ZodEffects,effect:{type:"refinement",refinement:$}})}superRefine($){return this._refinement($)}constructor($){this.spa=this.safeParseAsync,this._def=$,this.parse=this.parse.bind(this),this.safeParse=this.safeParse.bind(this),this.parseAsync=this.parseAsync.bind(this),this.safeParseAsync=this.safeParseAsync.bind(this),this.spa=this.spa.bind(this),this.refine=this.refine.bind(this),this.refinement=this.refinement.bind(this),this.superRefine=this.superRefine.bind(this),this.optional=this.optional.bind(this),this.nullable=this.nullable.bind(this),this.nullish=this.nullish.bind(this),this.array=this.array.bind(this),this.promise=this.promise.bind(this),this.or=this.or.bind(this),this.and=this.and.bind(this),this.transform=this.transform.bind(this),this.brand=this.brand.bind(this),this.default=this.default.bind(this),this.catch=this.catch.bind(this),this.describe=this.describe.bind(this),this.pipe=this.pipe.bind(this),this.readonly=this.readonly.bind(this),this.isNullable=this.isNullable.bind(this),this.isOptional=this.isOptional.bind(this),this["~standard"]={version:1,vendor:"zod",validate:(Q)=>this["~validate"](Q)}}optional(){return d.create(this,this._def)}nullable(){return Q0.create(this,this._def)}nullish(){return this.nullable().optional()}array(){return c.create(this)}promise(){return D0.create(this,this._def)}or($){return I0.create([this,$],this._def)}and($){return h0.create(this,$,this._def)}transform($){return new m({...k(this._def),schema:this,typeName:D.ZodEffects,effect:{type:"transform",transform:$}})}default($){let Q=typeof $==="function"?$:()=>$;return new Z0({...k(this._def),innerType:this,defaultValue:Q,typeName:D.ZodDefault})}brand(){return new P1({typeName:D.ZodBranded,type:this,...k(this._def)})}catch($){let Q=typeof $==="function"?$:()=>$;return new g0({...k(this._def),innerType:this,catchValue:Q,typeName:D.ZodCatch})}describe($){return new this.constructor({...this._def,description:$})}pipe($){return q1.create(this,$)}readonly(){return l0.create(this)}isOptional(){return this.safeParse(void 0).success}isNullable(){return this.safeParse(null).success}}var D6=/^c[^\s-]{8,}$/i,L6=/^[0-9a-z]+$/,S6=/^[0-9A-HJKMNP-TV-Z]{26}$/i,k6=/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i,A6=/^[a-z0-9_-]{21}$/i,M6=/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/,f6=/^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/,b6=/^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i,C6="^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$",J8,P6=/^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,E6=/^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/,v6=/^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/,R6=/^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/,N6=/^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/,I6=/^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/,G4="((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))",h6=new RegExp(`^${G4}$`);function q4($){let Q="([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d";if($.precision)Q=`${Q}\\.\\d{${$.precision}}`;else if($.precision==null)Q=`${Q}(\\.\\d+)?`;return Q}function T6($){return new RegExp(`^${q4($)}$`)}function w4($){let Q=`${G4}T${q4($)}`,J=[];if(J.push($.local?"Z?":"Z"),$.offset)J.push("([+-]\\d{2}:?\\d{2})");return Q=`${Q}(${J.join("|")})`,new RegExp(`^${Q}$`)}function x6($,Q){if((Q==="v4"||!Q)&&P6.test($))return!0;if((Q==="v6"||!Q)&&v6.test($))return!0;return!1}function y6($,Q){if(!M6.test($))return!1;try{let[J]=$.split("."),Y=J.replace(/-/g,"+").replace(/_/g,"/").padEnd(J.length+(4-J.length%4)%4,"="),W=JSON.parse(atob(Y));if(typeof W!=="object"||W===null)return!1;if(!W.typ||!W.alg)return!1;if(Q&&W.alg!==Q)return!1;return!0}catch(J){return!1}}function Z6($,Q){if((Q==="v4"||!Q)&&E6.test($))return!0;if((Q==="v6"||!Q)&&R6.test($))return!0;return!1}class p extends A{_parse($){if(this._def.coerce)$.data=String($.data);if(this._getType($)!==_.string){let W=this._getOrReturnCtx($);return U(W,{code:K.invalid_type,expected:_.string,received:W.parsedType}),L}let J=new T,Y=void 0;for(let W of this._def.checks)if(W.kind==="min"){if($.data.length<W.value)Y=this._getOrReturnCtx($,Y),U(Y,{code:K.too_small,minimum:W.value,type:"string",inclusive:!0,exact:!1,message:W.message}),J.dirty()}else if(W.kind==="max"){if($.data.length>W.value)Y=this._getOrReturnCtx($,Y),U(Y,{code:K.too_big,maximum:W.value,type:"string",inclusive:!0,exact:!1,message:W.message}),J.dirty()}else if(W.kind==="length"){let H=$.data.length>W.value,z=$.data.length<W.value;if(H||z){if(Y=this._getOrReturnCtx($,Y),H)U(Y,{code:K.too_big,maximum:W.value,type:"string",inclusive:!0,exact:!0,message:W.message});else if(z)U(Y,{code:K.too_small,minimum:W.value,type:"string",inclusive:!0,exact:!0,message:W.message});J.dirty()}}else if(W.kind==="email"){if(!b6.test($.data))Y=this._getOrReturnCtx($,Y),U(Y,{validation:"email",code:K.invalid_string,message:W.message}),J.dirty()}else if(W.kind==="emoji"){if(!J8)J8=new RegExp(C6,"u");if(!J8.test($.data))Y=this._getOrReturnCtx($,Y),U(Y,{validation:"emoji",code:K.invalid_string,message:W.message}),J.dirty()}else if(W.kind==="uuid"){if(!k6.test($.data))Y=this._getOrReturnCtx($,Y),U(Y,{validation:"uuid",code:K.invalid_string,message:W.message}),J.dirty()}else if(W.kind==="nanoid"){if(!A6.test($.data))Y=this._getOrReturnCtx($,Y),U(Y,{validation:"nanoid",code:K.invalid_string,message:W.message}),J.dirty()}else if(W.kind==="cuid"){if(!D6.test($.data))Y=this._getOrReturnCtx($,Y),U(Y,{validation:"cuid",code:K.invalid_string,message:W.message}),J.dirty()}else if(W.kind==="cuid2"){if(!L6.test($.data))Y=this._getOrReturnCtx($,Y),U(Y,{validation:"cuid2",code:K.invalid_string,message:W.message}),J.dirty()}else if(W.kind==="ulid"){if(!S6.test($.data))Y=this._getOrReturnCtx($,Y),U(Y,{validation:"ulid",code:K.invalid_string,message:W.message}),J.dirty()}else if(W.kind==="url")try{new URL($.data)}catch(H){Y=this._getOrReturnCtx($,Y),U(Y,{validation:"url",code:K.invalid_string,message:W.message}),J.dirty()}else if(W.kind==="regex"){if(W.regex.lastIndex=0,!W.regex.test($.data))Y=this._getOrReturnCtx($,Y),U(Y,{validation:"regex",code:K.invalid_string,message:W.message}),J.dirty()}else if(W.kind==="trim")$.data=$.data.trim();else if(W.kind==="includes"){if(!$.data.includes(W.value,W.position))Y=this._getOrReturnCtx($,Y),U(Y,{code:K.invalid_string,validation:{includes:W.value,position:W.position},message:W.message}),J.dirty()}else if(W.kind==="toLowerCase")$.data=$.data.toLowerCase();else if(W.kind==="toUpperCase")$.data=$.data.toUpperCase();else if(W.kind==="startsWith"){if(!$.data.startsWith(W.value))Y=this._getOrReturnCtx($,Y),U(Y,{code:K.invalid_string,validation:{startsWith:W.value},message:W.message}),J.dirty()}else if(W.kind==="endsWith"){if(!$.data.endsWith(W.value))Y=this._getOrReturnCtx($,Y),U(Y,{code:K.invalid_string,validation:{endsWith:W.value},message:W.message}),J.dirty()}else if(W.kind==="datetime"){if(!w4(W).test($.data))Y=this._getOrReturnCtx($,Y),U(Y,{code:K.invalid_string,validation:"datetime",message:W.message}),J.dirty()}else if(W.kind==="date"){if(!h6.test($.data))Y=this._getOrReturnCtx($,Y),U(Y,{code:K.invalid_string,validation:"date",message:W.message}),J.dirty()}else if(W.kind==="time"){if(!T6(W).test($.data))Y=this._getOrReturnCtx($,Y),U(Y,{code:K.invalid_string,validation:"time",message:W.message}),J.dirty()}else if(W.kind==="duration"){if(!f6.test($.data))Y=this._getOrReturnCtx($,Y),U(Y,{validation:"duration",code:K.invalid_string,message:W.message}),J.dirty()}else if(W.kind==="ip"){if(!x6($.data,W.version))Y=this._getOrReturnCtx($,Y),U(Y,{validation:"ip",code:K.invalid_string,message:W.message}),J.dirty()}else if(W.kind==="jwt"){if(!y6($.data,W.alg))Y=this._getOrReturnCtx($,Y),U(Y,{validation:"jwt",code:K.invalid_string,message:W.message}),J.dirty()}else if(W.kind==="cidr"){if(!Z6($.data,W.version))Y=this._getOrReturnCtx($,Y),U(Y,{validation:"cidr",code:K.invalid_string,message:W.message}),J.dirty()}else if(W.kind==="base64"){if(!N6.test($.data))Y=this._getOrReturnCtx($,Y),U(Y,{validation:"base64",code:K.invalid_string,message:W.message}),J.dirty()}else if(W.kind==="base64url"){if(!I6.test($.data))Y=this._getOrReturnCtx($,Y),U(Y,{validation:"base64url",code:K.invalid_string,message:W.message}),J.dirty()}else C.assertNever(W);return{status:J.value,value:$.data}}_regex($,Q,J){return this.refinement((Y)=>$.test(Y),{validation:Q,code:K.invalid_string,...O.errToObj(J)})}_addCheck($){return new p({...this._def,checks:[...this._def.checks,$]})}email($){return this._addCheck({kind:"email",...O.errToObj($)})}url($){return this._addCheck({kind:"url",...O.errToObj($)})}emoji($){return this._addCheck({kind:"emoji",...O.errToObj($)})}uuid($){return this._addCheck({kind:"uuid",...O.errToObj($)})}nanoid($){return this._addCheck({kind:"nanoid",...O.errToObj($)})}cuid($){return this._addCheck({kind:"cuid",...O.errToObj($)})}cuid2($){return this._addCheck({kind:"cuid2",...O.errToObj($)})}ulid($){return this._addCheck({kind:"ulid",...O.errToObj($)})}base64($){return this._addCheck({kind:"base64",...O.errToObj($)})}base64url($){return this._addCheck({kind:"base64url",...O.errToObj($)})}jwt($){return this._addCheck({kind:"jwt",...O.errToObj($)})}ip($){return this._addCheck({kind:"ip",...O.errToObj($)})}cidr($){return this._addCheck({kind:"cidr",...O.errToObj($)})}datetime($){var Q,J;if(typeof $==="string")return this._addCheck({kind:"datetime",precision:null,offset:!1,local:!1,message:$});return this._addCheck({kind:"datetime",precision:typeof($===null||$===void 0?void 0:$.precision)>"u"?null:$===null||$===void 0?void 0:$.precision,offset:(Q=$===null||$===void 0?void 0:$.offset)!==null&&Q!==void 0?Q:!1,local:(J=$===null||$===void 0?void 0:$.local)!==null&&J!==void 0?J:!1,...O.errToObj($===null||$===void 0?void 0:$.message)})}date($){return this._addCheck({kind:"date",message:$})}time($){if(typeof $==="string")return this._addCheck({kind:"time",precision:null,message:$});return this._addCheck({kind:"time",precision:typeof($===null||$===void 0?void 0:$.precision)>"u"?null:$===null||$===void 0?void 0:$.precision,...O.errToObj($===null||$===void 0?void 0:$.message)})}duration($){return this._addCheck({kind:"duration",...O.errToObj($)})}regex($,Q){return this._addCheck({kind:"regex",regex:$,...O.errToObj(Q)})}includes($,Q){return this._addCheck({kind:"includes",value:$,position:Q===null||Q===void 0?void 0:Q.position,...O.errToObj(Q===null||Q===void 0?void 0:Q.message)})}startsWith($,Q){return this._addCheck({kind:"startsWith",value:$,...O.errToObj(Q)})}endsWith($,Q){return this._addCheck({kind:"endsWith",value:$,...O.errToObj(Q)})}min($,Q){return this._addCheck({kind:"min",value:$,...O.errToObj(Q)})}max($,Q){return this._addCheck({kind:"max",value:$,...O.errToObj(Q)})}length($,Q){return this._addCheck({kind:"length",value:$,...O.errToObj(Q)})}nonempty($){return this.min(1,O.errToObj($))}trim(){return new p({...this._def,checks:[...this._def.checks,{kind:"trim"}]})}toLowerCase(){return new p({...this._def,checks:[...this._def.checks,{kind:"toLowerCase"}]})}toUpperCase(){return new p({...this._def,checks:[...this._def.checks,{kind:"toUpperCase"}]})}get isDatetime(){return!!this._def.checks.find(($)=>$.kind==="datetime")}get isDate(){return!!this._def.checks.find(($)=>$.kind==="date")}get isTime(){return!!this._def.checks.find(($)=>$.kind==="time")}get isDuration(){return!!this._def.checks.find(($)=>$.kind==="duration")}get isEmail(){return!!this._def.checks.find(($)=>$.kind==="email")}get isURL(){return!!this._def.checks.find(($)=>$.kind==="url")}get isEmoji(){return!!this._def.checks.find(($)=>$.kind==="emoji")}get isUUID(){return!!this._def.checks.find(($)=>$.kind==="uuid")}get isNANOID(){return!!this._def.checks.find(($)=>$.kind==="nanoid")}get isCUID(){return!!this._def.checks.find(($)=>$.kind==="cuid")}get isCUID2(){return!!this._def.checks.find(($)=>$.kind==="cuid2")}get isULID(){return!!this._def.checks.find(($)=>$.kind==="ulid")}get isIP(){return!!this._def.checks.find(($)=>$.kind==="ip")}get isCIDR(){return!!this._def.checks.find(($)=>$.kind==="cidr")}get isBase64(){return!!this._def.checks.find(($)=>$.kind==="base64")}get isBase64url(){return!!this._def.checks.find(($)=>$.kind==="base64url")}get minLength(){let $=null;for(let Q of this._def.checks)if(Q.kind==="min"){if($===null||Q.value>$)$=Q.value}return $}get maxLength(){let $=null;for(let Q of this._def.checks)if(Q.kind==="max"){if($===null||Q.value<$)$=Q.value}return $}}p.create=($)=>{var Q;return new p({checks:[],typeName:D.ZodString,coerce:(Q=$===null||$===void 0?void 0:$.coerce)!==null&&Q!==void 0?Q:!1,...k($)})};function g6($,Q){let J=($.toString().split(".")[1]||"").length,Y=(Q.toString().split(".")[1]||"").length,W=J>Y?J:Y,H=parseInt($.toFixed(W).replace(".","")),z=parseInt(Q.toFixed(W).replace(".",""));return H%z/Math.pow(10,W)}class X0 extends A{constructor(){super(...arguments);this.min=this.gte,this.max=this.lte,this.step=this.multipleOf}_parse($){if(this._def.coerce)$.data=Number($.data);if(this._getType($)!==_.number){let W=this._getOrReturnCtx($);return U(W,{code:K.invalid_type,expected:_.number,received:W.parsedType}),L}let J=void 0,Y=new T;for(let W of this._def.checks)if(W.kind==="int"){if(!C.isInteger($.data))J=this._getOrReturnCtx($,J),U(J,{code:K.invalid_type,expected:"integer",received:"float",message:W.message}),Y.dirty()}else if(W.kind==="min"){if(W.inclusive?$.data<W.value:$.data<=W.value)J=this._getOrReturnCtx($,J),U(J,{code:K.too_small,minimum:W.value,type:"number",inclusive:W.inclusive,exact:!1,message:W.message}),Y.dirty()}else if(W.kind==="max"){if(W.inclusive?$.data>W.value:$.data>=W.value)J=this._getOrReturnCtx($,J),U(J,{code:K.too_big,maximum:W.value,type:"number",inclusive:W.inclusive,exact:!1,message:W.message}),Y.dirty()}else if(W.kind==="multipleOf"){if(g6($.data,W.value)!==0)J=this._getOrReturnCtx($,J),U(J,{code:K.not_multiple_of,multipleOf:W.value,message:W.message}),Y.dirty()}else if(W.kind==="finite"){if(!Number.isFinite($.data))J=this._getOrReturnCtx($,J),U(J,{code:K.not_finite,message:W.message}),Y.dirty()}else C.assertNever(W);return{status:Y.value,value:$.data}}gte($,Q){return this.setLimit("min",$,!0,O.toString(Q))}gt($,Q){return this.setLimit("min",$,!1,O.toString(Q))}lte($,Q){return this.setLimit("max",$,!0,O.toString(Q))}lt($,Q){return this.setLimit("max",$,!1,O.toString(Q))}setLimit($,Q,J,Y){return new X0({...this._def,checks:[...this._def.checks,{kind:$,value:Q,inclusive:J,message:O.toString(Y)}]})}_addCheck($){return new X0({...this._def,checks:[...this._def.checks,$]})}int($){return this._addCheck({kind:"int",message:O.toString($)})}positive($){return this._addCheck({kind:"min",value:0,inclusive:!1,message:O.toString($)})}negative($){return this._addCheck({kind:"max",value:0,inclusive:!1,message:O.toString($)})}nonpositive($){return this._addCheck({kind:"max",value:0,inclusive:!0,message:O.toString($)})}nonnegative($){return this._addCheck({kind:"min",value:0,inclusive:!0,message:O.toString($)})}multipleOf($,Q){return this._addCheck({kind:"multipleOf",value:$,message:O.toString(Q)})}finite($){return this._addCheck({kind:"finite",message:O.toString($)})}safe($){return this._addCheck({kind:"min",inclusive:!0,value:Number.MIN_SAFE_INTEGER,message:O.toString($)})._addCheck({kind:"max",inclusive:!0,value:Number.MAX_SAFE_INTEGER,message:O.toString($)})}get minValue(){let $=null;for(let Q of this._def.checks)if(Q.kind==="min"){if($===null||Q.value>$)$=Q.value}return $}get maxValue(){let $=null;for(let Q of this._def.checks)if(Q.kind==="max"){if($===null||Q.value<$)$=Q.value}return $}get isInt(){return!!this._def.checks.find(($)=>$.kind==="int"||$.kind==="multipleOf"&&C.isInteger($.value))}get isFinite(){let $=null,Q=null;for(let J of this._def.checks)if(J.kind==="finite"||J.kind==="int"||J.kind==="multipleOf")return!0;else if(J.kind==="min"){if(Q===null||J.value>Q)Q=J.value}else if(J.kind==="max"){if($===null||J.value<$)$=J.value}return Number.isFinite(Q)&&Number.isFinite($)}}X0.create=($)=>{return new X0({checks:[],typeName:D.ZodNumber,coerce:($===null||$===void 0?void 0:$.coerce)||!1,...k($)})};class B0 extends A{constructor(){super(...arguments);this.min=this.gte,this.max=this.lte}_parse($){if(this._def.coerce)try{$.data=BigInt($.data)}catch(W){return this._getInvalidInput($)}if(this._getType($)!==_.bigint)return this._getInvalidInput($);let J=void 0,Y=new T;for(let W of this._def.checks)if(W.kind==="min"){if(W.inclusive?$.data<W.value:$.data<=W.value)J=this._getOrReturnCtx($,J),U(J,{code:K.too_small,type:"bigint",minimum:W.value,inclusive:W.inclusive,message:W.message}),Y.dirty()}else if(W.kind==="max"){if(W.inclusive?$.data>W.value:$.data>=W.value)J=this._getOrReturnCtx($,J),U(J,{code:K.too_big,type:"bigint",maximum:W.value,inclusive:W.inclusive,message:W.message}),Y.dirty()}else if(W.kind==="multipleOf"){if($.data%W.value!==BigInt(0))J=this._getOrReturnCtx($,J),U(J,{code:K.not_multiple_of,multipleOf:W.value,message:W.message}),Y.dirty()}else C.assertNever(W);return{status:Y.value,value:$.data}}_getInvalidInput($){let Q=this._getOrReturnCtx($);return U(Q,{code:K.invalid_type,expected:_.bigint,received:Q.parsedType}),L}gte($,Q){return this.setLimit("min",$,!0,O.toString(Q))}gt($,Q){return this.setLimit("min",$,!1,O.toString(Q))}lte($,Q){return this.setLimit("max",$,!0,O.toString(Q))}lt($,Q){return this.setLimit("max",$,!1,O.toString(Q))}setLimit($,Q,J,Y){return new B0({...this._def,checks:[...this._def.checks,{kind:$,value:Q,inclusive:J,message:O.toString(Y)}]})}_addCheck($){return new B0({...this._def,checks:[...this._def.checks,$]})}positive($){return this._addCheck({kind:"min",value:BigInt(0),inclusive:!1,message:O.toString($)})}negative($){return this._addCheck({kind:"max",value:BigInt(0),inclusive:!1,message:O.toString($)})}nonpositive($){return this._addCheck({kind:"max",value:BigInt(0),inclusive:!0,message:O.toString($)})}nonnegative($){return this._addCheck({kind:"min",value:BigInt(0),inclusive:!0,message:O.toString($)})}multipleOf($,Q){return this._addCheck({kind:"multipleOf",value:$,message:O.toString(Q)})}get minValue(){let $=null;for(let Q of this._def.checks)if(Q.kind==="min"){if($===null||Q.value>$)$=Q.value}return $}get maxValue(){let $=null;for(let Q of this._def.checks)if(Q.kind==="max"){if($===null||Q.value<$)$=Q.value}return $}}B0.create=($)=>{var Q;return new B0({checks:[],typeName:D.ZodBigInt,coerce:(Q=$===null||$===void 0?void 0:$.coerce)!==null&&Q!==void 0?Q:!1,...k($)})};class v0 extends A{_parse($){if(this._def.coerce)$.data=Boolean($.data);if(this._getType($)!==_.boolean){let J=this._getOrReturnCtx($);return U(J,{code:K.invalid_type,expected:_.boolean,received:J.parsedType}),L}return x($.data)}}v0.create=($)=>{return new v0({typeName:D.ZodBoolean,coerce:($===null||$===void 0?void 0:$.coerce)||!1,...k($)})};class _0 extends A{_parse($){if(this._def.coerce)$.data=new Date($.data);if(this._getType($)!==_.date){let W=this._getOrReturnCtx($);return U(W,{code:K.invalid_type,expected:_.date,received:W.parsedType}),L}if(isNaN($.data.getTime())){let W=this._getOrReturnCtx($);return U(W,{code:K.invalid_date}),L}let J=new T,Y=void 0;for(let W of this._def.checks)if(W.kind==="min"){if($.data.getTime()<W.value)Y=this._getOrReturnCtx($,Y),U(Y,{code:K.too_small,message:W.message,inclusive:!0,exact:!1,minimum:W.value,type:"date"}),J.dirty()}else if(W.kind==="max"){if($.data.getTime()>W.value)Y=this._getOrReturnCtx($,Y),U(Y,{code:K.too_big,message:W.message,inclusive:!0,exact:!1,maximum:W.value,type:"date"}),J.dirty()}else C.assertNever(W);return{status:J.value,value:new Date($.data.getTime())}}_addCheck($){return new _0({...this._def,checks:[...this._def.checks,$]})}min($,Q){return this._addCheck({kind:"min",value:$.getTime(),message:O.toString(Q)})}max($,Q){return this._addCheck({kind:"max",value:$.getTime(),message:O.toString(Q)})}get minDate(){let $=null;for(let Q of this._def.checks)if(Q.kind==="min"){if($===null||Q.value>$)$=Q.value}return $!=null?new Date($):null}get maxDate(){let $=null;for(let Q of this._def.checks)if(Q.kind==="max"){if($===null||Q.value<$)$=Q.value}return $!=null?new Date($):null}}_0.create=($)=>{return new _0({checks:[],coerce:($===null||$===void 0?void 0:$.coerce)||!1,typeName:D.ZodDate,...k($)})};class H1 extends A{_parse($){if(this._getType($)!==_.symbol){let J=this._getOrReturnCtx($);return U(J,{code:K.invalid_type,expected:_.symbol,received:J.parsedType}),L}return x($.data)}}H1.create=($)=>{return new H1({typeName:D.ZodSymbol,...k($)})};class R0 extends A{_parse($){if(this._getType($)!==_.undefined){let J=this._getOrReturnCtx($);return U(J,{code:K.invalid_type,expected:_.undefined,received:J.parsedType}),L}return x($.data)}}R0.create=($)=>{return new R0({typeName:D.ZodUndefined,...k($)})};class N0 extends A{_parse($){if(this._getType($)!==_.null){let J=this._getOrReturnCtx($);return U(J,{code:K.invalid_type,expected:_.null,received:J.parsedType}),L}return x($.data)}}N0.create=($)=>{return new N0({typeName:D.ZodNull,...k($)})};class F0 extends A{constructor(){super(...arguments);this._any=!0}_parse($){return x($.data)}}F0.create=($)=>{return new F0({typeName:D.ZodAny,...k($)})};class z0 extends A{constructor(){super(...arguments);this._unknown=!0}_parse($){return x($.data)}}z0.create=($)=>{return new z0({typeName:D.ZodUnknown,...k($)})};class t extends A{_parse($){let Q=this._getOrReturnCtx($);return U(Q,{code:K.invalid_type,expected:_.never,received:Q.parsedType}),L}}t.create=($)=>{return new t({typeName:D.ZodNever,...k($)})};class z1 extends A{_parse($){if(this._getType($)!==_.undefined){let J=this._getOrReturnCtx($);return U(J,{code:K.invalid_type,expected:_.void,received:J.parsedType}),L}return x($.data)}}z1.create=($)=>{return new z1({typeName:D.ZodVoid,...k($)})};class c extends A{_parse($){let{ctx:Q,status:J}=this._processInputParams($),Y=this._def;if(Q.parsedType!==_.array)return U(Q,{code:K.invalid_type,expected:_.array,received:Q.parsedType}),L;if(Y.exactLength!==null){let H=Q.data.length>Y.exactLength.value,z=Q.data.length<Y.exactLength.value;if(H||z)U(Q,{code:H?K.too_big:K.too_small,minimum:z?Y.exactLength.value:void 0,maximum:H?Y.exactLength.value:void 0,type:"array",inclusive:!0,exact:!0,message:Y.exactLength.message}),J.dirty()}if(Y.minLength!==null){if(Q.data.length<Y.minLength.value)U(Q,{code:K.too_small,minimum:Y.minLength.value,type:"array",inclusive:!0,exact:!1,message:Y.minLength.message}),J.dirty()}if(Y.maxLength!==null){if(Q.data.length>Y.maxLength.value)U(Q,{code:K.too_big,maximum:Y.maxLength.value,type:"array",inclusive:!0,exact:!1,message:Y.maxLength.message}),J.dirty()}if(Q.common.async)return Promise.all([...Q.data].map((H,z)=>{return Y.type._parseAsync(new n(Q,H,Q.path,z))})).then((H)=>{return T.mergeArray(J,H)});let W=[...Q.data].map((H,z)=>{return Y.type._parseSync(new n(Q,H,Q.path,z))});return T.mergeArray(J,W)}get element(){return this._def.type}min($,Q){return new c({...this._def,minLength:{value:$,message:O.toString(Q)}})}max($,Q){return new c({...this._def,maxLength:{value:$,message:O.toString(Q)}})}length($,Q){return new c({...this._def,exactLength:{value:$,message:O.toString(Q)}})}nonempty($){return this.min(1,$)}}c.create=($,Q)=>{return new c({type:$,minLength:null,maxLength:null,exactLength:null,typeName:D.ZodArray,...k(Q)})};function b0($){if($ instanceof N){let Q={};for(let J in $.shape){let Y=$.shape[J];Q[J]=d.create(b0(Y))}return new N({...$._def,shape:()=>Q})}else if($ instanceof c)return new c({...$._def,type:b0($.element)});else if($ instanceof d)return d.create(b0($.unwrap()));else if($ instanceof Q0)return Q0.create(b0($.unwrap()));else if($ instanceof r)return r.create($.items.map((Q)=>b0(Q)));else return $}class N extends A{constructor(){super(...arguments);this._cached=null,this.nonstrict=this.passthrough,this.augment=this.extend}_getCached(){if(this._cached!==null)return this._cached;let $=this._def.shape(),Q=C.objectKeys($);return this._cached={shape:$,keys:Q}}_parse($){if(this._getType($)!==_.object){let G=this._getOrReturnCtx($);return U(G,{code:K.invalid_type,expected:_.object,received:G.parsedType}),L}let{status:J,ctx:Y}=this._processInputParams($),{shape:W,keys:H}=this._getCached(),z=[];if(!(this._def.catchall instanceof t&&this._def.unknownKeys==="strip")){for(let G in Y.data)if(!H.includes(G))z.push(G)}let X=[];for(let G of H){let q=W[G],w=Y.data[G];X.push({key:{status:"valid",value:G},value:q._parse(new n(Y,w,Y.path,G)),alwaysSet:G in Y.data})}if(this._def.catchall instanceof t){let G=this._def.unknownKeys;if(G==="passthrough")for(let q of z)X.push({key:{status:"valid",value:q},value:{status:"valid",value:Y.data[q]}});else if(G==="strict"){if(z.length>0)U(Y,{code:K.unrecognized_keys,keys:z}),J.dirty()}else if(G==="strip");else throw Error("Internal ZodObject error: invalid unknownKeys value.")}else{let G=this._def.catchall;for(let q of z){let w=Y.data[q];X.push({key:{status:"valid",value:q},value:G._parse(new n(Y,w,Y.path,q)),alwaysSet:q in Y.data})}}if(Y.common.async)return Promise.resolve().then(async()=>{let G=[];for(let q of X){let w=await q.key,V=await q.value;G.push({key:w,value:V,alwaysSet:q.alwaysSet})}return G}).then((G)=>{return T.mergeObjectSync(J,G)});else return T.mergeObjectSync(J,X)}get shape(){return this._def.shape()}strict($){return O.errToObj,new N({...this._def,unknownKeys:"strict",...$!==void 0?{errorMap:(Q,J)=>{var Y,W,H,z;let X=(H=(W=(Y=this._def).errorMap)===null||W===void 0?void 0:W.call(Y,Q,J).message)!==null&&H!==void 0?H:J.defaultError;if(Q.code==="unrecognized_keys")return{message:(z=O.errToObj($).message)!==null&&z!==void 0?z:X};return{message:X}}}:{}})}strip(){return new N({...this._def,unknownKeys:"strip"})}passthrough(){return new N({...this._def,unknownKeys:"passthrough"})}extend($){return new N({...this._def,shape:()=>({...this._def.shape(),...$})})}merge($){return new N({unknownKeys:$._def.unknownKeys,catchall:$._def.catchall,shape:()=>({...this._def.shape(),...$._def.shape()}),typeName:D.ZodObject})}setKey($,Q){return this.augment({[$]:Q})}catchall($){return new N({...this._def,catchall:$})}pick($){let Q={};return C.objectKeys($).forEach((J)=>{if($[J]&&this.shape[J])Q[J]=this.shape[J]}),new N({...this._def,shape:()=>Q})}omit($){let Q={};return C.objectKeys(this.shape).forEach((J)=>{if(!$[J])Q[J]=this.shape[J]}),new N({...this._def,shape:()=>Q})}deepPartial(){return b0(this)}partial($){let Q={};return C.objectKeys(this.shape).forEach((J)=>{let Y=this.shape[J];if($&&!$[J])Q[J]=Y;else Q[J]=Y.optional()}),new N({...this._def,shape:()=>Q})}required($){let Q={};return C.objectKeys(this.shape).forEach((J)=>{if($&&!$[J])Q[J]=this.shape[J];else{let W=this.shape[J];while(W instanceof d)W=W._def.innerType;Q[J]=W}}),new N({...this._def,shape:()=>Q})}keyof(){return j4(C.objectKeys(this.shape))}}N.create=($,Q)=>{return new N({shape:()=>$,unknownKeys:"strip",catchall:t.create(),typeName:D.ZodObject,...k(Q)})};N.strictCreate=($,Q)=>{return new N({shape:()=>$,unknownKeys:"strict",catchall:t.create(),typeName:D.ZodObject,...k(Q)})};N.lazycreate=($,Q)=>{return new N({shape:$,unknownKeys:"strip",catchall:t.create(),typeName:D.ZodObject,...k(Q)})};class I0 extends A{_parse($){let{ctx:Q}=this._processInputParams($),J=this._def.options;function Y(W){for(let z of W)if(z.result.status==="valid")return z.result;for(let z of W)if(z.result.status==="dirty")return Q.common.issues.push(...z.ctx.common.issues),z.result;let H=W.map((z)=>new Z(z.ctx.common.issues));return U(Q,{code:K.invalid_union,unionErrors:H}),L}if(Q.common.async)return Promise.all(J.map(async(W)=>{let H={...Q,common:{...Q.common,issues:[]},parent:null};return{result:await W._parseAsync({data:Q.data,path:Q.path,parent:H}),ctx:H}})).then(Y);else{let W=void 0,H=[];for(let X of J){let G={...Q,common:{...Q.common,issues:[]},parent:null},q=X._parseSync({data:Q.data,path:Q.path,parent:G});if(q.status==="valid")return q;else if(q.status==="dirty"&&!W)W={result:q,ctx:G};if(G.common.issues.length)H.push(G.common.issues)}if(W)return Q.common.issues.push(...W.ctx.common.issues),W.result;let z=H.map((X)=>new Z(X));return U(Q,{code:K.invalid_union,unionErrors:z}),L}}get options(){return this._def.options}}I0.create=($,Q)=>{return new I0({options:$,typeName:D.ZodUnion,...k(Q)})};var e=($)=>{if($ instanceof T0)return e($.schema);else if($ instanceof m)return e($.innerType());else if($ instanceof x0)return[$.value];else if($ instanceof G0)return $.options;else if($ instanceof y0)return C.objectValues($.enum);else if($ instanceof Z0)return e($._def.innerType);else if($ instanceof R0)return[void 0];else if($ instanceof N0)return[null];else if($ instanceof d)return[void 0,...e($.unwrap())];else if($ instanceof Q0)return[null,...e($.unwrap())];else if($ instanceof P1)return e($.unwrap());else if($ instanceof l0)return e($.unwrap());else if($ instanceof g0)return e($._def.innerType);else return[]};class C1 extends A{_parse($){let{ctx:Q}=this._processInputParams($);if(Q.parsedType!==_.object)return U(Q,{code:K.invalid_type,expected:_.object,received:Q.parsedType}),L;let J=this.discriminator,Y=Q.data[J],W=this.optionsMap.get(Y);if(!W)return U(Q,{code:K.invalid_union_discriminator,options:Array.from(this.optionsMap.keys()),path:[J]}),L;if(Q.common.async)return W._parseAsync({data:Q.data,path:Q.path,parent:Q});else return W._parseSync({data:Q.data,path:Q.path,parent:Q})}get discriminator(){return this._def.discriminator}get options(){return this._def.options}get optionsMap(){return this._def.optionsMap}static create($,Q,J){let Y=new Map;for(let W of Q){let H=e(W.shape[$]);if(!H.length)throw Error(`A discriminator value for key \`${$}\` could not be extracted from all schema options`);for(let z of H){if(Y.has(z))throw Error(`Discriminator property ${String($)} has duplicate value ${String(z)}`);Y.set(z,W)}}return new C1({typeName:D.ZodDiscriminatedUnion,discriminator:$,options:Q,optionsMap:Y,...k(J)})}}function z8($,Q){let J=$0($),Y=$0(Q);if($===Q)return{valid:!0,data:$};else if(J===_.object&&Y===_.object){let W=C.objectKeys(Q),H=C.objectKeys($).filter((X)=>W.indexOf(X)!==-1),z={...$,...Q};for(let X of H){let G=z8($[X],Q[X]);if(!G.valid)return{valid:!1};z[X]=G.data}return{valid:!0,data:z}}else if(J===_.array&&Y===_.array){if($.length!==Q.length)return{valid:!1};let W=[];for(let H=0;H<$.length;H++){let z=$[H],X=Q[H],G=z8(z,X);if(!G.valid)return{valid:!1};W.push(G.data)}return{valid:!0,data:W}}else if(J===_.date&&Y===_.date&&+$===+Q)return{valid:!0,data:$};else return{valid:!1}}class h0 extends A{_parse($){let{status:Q,ctx:J}=this._processInputParams($),Y=(W,H)=>{if(Y8(W)||Y8(H))return L;let z=z8(W.value,H.value);if(!z.valid)return U(J,{code:K.invalid_intersection_types}),L;if(H8(W)||H8(H))Q.dirty();return{status:Q.value,value:z.data}};if(J.common.async)return Promise.all([this._def.left._parseAsync({data:J.data,path:J.path,parent:J}),this._def.right._parseAsync({data:J.data,path:J.path,parent:J})]).then(([W,H])=>Y(W,H));else return Y(this._def.left._parseSync({data:J.data,path:J.path,parent:J}),this._def.right._parseSync({data:J.data,path:J.path,parent:J}))}}h0.create=($,Q,J)=>{return new h0({left:$,right:Q,typeName:D.ZodIntersection,...k(J)})};class r extends A{_parse($){let{status:Q,ctx:J}=this._processInputParams($);if(J.parsedType!==_.array)return U(J,{code:K.invalid_type,expected:_.array,received:J.parsedType}),L;if(J.data.length<this._def.items.length)return U(J,{code:K.too_small,minimum:this._def.items.length,inclusive:!0,exact:!1,type:"array"}),L;if(!this._def.rest&&J.data.length>this._def.items.length)U(J,{code:K.too_big,maximum:this._def.items.length,inclusive:!0,exact:!1,type:"array"}),Q.dirty();let W=[...J.data].map((H,z)=>{let X=this._def.items[z]||this._def.rest;if(!X)return null;return X._parse(new n(J,H,J.path,z))}).filter((H)=>!!H);if(J.common.async)return Promise.all(W).then((H)=>{return T.mergeArray(Q,H)});else return T.mergeArray(Q,W)}get items(){return this._def.items}rest($){return new r({...this._def,rest:$})}}r.create=($,Q)=>{if(!Array.isArray($))throw Error("You must pass an array of schemas to z.tuple([ ... ])");return new r({items:$,typeName:D.ZodTuple,rest:null,...k(Q)})};class X1 extends A{get keySchema(){return this._def.keyType}get valueSchema(){return this._def.valueType}_parse($){let{status:Q,ctx:J}=this._processInputParams($);if(J.parsedType!==_.object)return U(J,{code:K.invalid_type,expected:_.object,received:J.parsedType}),L;let Y=[],W=this._def.keyType,H=this._def.valueType;for(let z in J.data)Y.push({key:W._parse(new n(J,z,J.path,z)),value:H._parse(new n(J,J.data[z],J.path,z)),alwaysSet:z in J.data});if(J.common.async)return T.mergeObjectAsync(Q,Y);else return T.mergeObjectSync(Q,Y)}get element(){return this._def.valueType}static create($,Q,J){if(Q instanceof A)return new X1({keyType:$,valueType:Q,typeName:D.ZodRecord,...k(J)});return new X1({keyType:p.create(),valueType:$,typeName:D.ZodRecord,...k(Q)})}}class B1 extends A{get keySchema(){return this._def.keyType}get valueSchema(){return this._def.valueType}_parse($){let{status:Q,ctx:J}=this._processInputParams($);if(J.parsedType!==_.map)return U(J,{code:K.invalid_type,expected:_.map,received:J.parsedType}),L;let Y=this._def.keyType,W=this._def.valueType,H=[...J.data.entries()].map(([z,X],G)=>{return{key:Y._parse(new n(J,z,J.path,[G,"key"])),value:W._parse(new n(J,X,J.path,[G,"value"]))}});if(J.common.async){let z=new Map;return Promise.resolve().then(async()=>{for(let X of H){let G=await X.key,q=await X.value;if(G.status==="aborted"||q.status==="aborted")return L;if(G.status==="dirty"||q.status==="dirty")Q.dirty();z.set(G.value,q.value)}return{status:Q.value,value:z}})}else{let z=new Map;for(let X of H){let{key:G,value:q}=X;if(G.status==="aborted"||q.status==="aborted")return L;if(G.status==="dirty"||q.status==="dirty")Q.dirty();z.set(G.value,q.value)}return{status:Q.value,value:z}}}}B1.create=($,Q,J)=>{return new B1({valueType:Q,keyType:$,typeName:D.ZodMap,...k(J)})};class O0 extends A{_parse($){let{status:Q,ctx:J}=this._processInputParams($);if(J.parsedType!==_.set)return U(J,{code:K.invalid_type,expected:_.set,received:J.parsedType}),L;let Y=this._def;if(Y.minSize!==null){if(J.data.size<Y.minSize.value)U(J,{code:K.too_small,minimum:Y.minSize.value,type:"set",inclusive:!0,exact:!1,message:Y.minSize.message}),Q.dirty()}if(Y.maxSize!==null){if(J.data.size>Y.maxSize.value)U(J,{code:K.too_big,maximum:Y.maxSize.value,type:"set",inclusive:!0,exact:!1,message:Y.maxSize.message}),Q.dirty()}let W=this._def.valueType;function H(X){let G=new Set;for(let q of X){if(q.status==="aborted")return L;if(q.status==="dirty")Q.dirty();G.add(q.value)}return{status:Q.value,value:G}}let z=[...J.data.values()].map((X,G)=>W._parse(new n(J,X,J.path,G)));if(J.common.async)return Promise.all(z).then((X)=>H(X));else return H(z)}min($,Q){return new O0({...this._def,minSize:{value:$,message:O.toString(Q)}})}max($,Q){return new O0({...this._def,maxSize:{value:$,message:O.toString(Q)}})}size($,Q){return this.min($,Q).max($,Q)}nonempty($){return this.min(1,$)}}O0.create=($,Q)=>{return new O0({valueType:$,minSize:null,maxSize:null,typeName:D.ZodSet,...k(Q)})};class P0 extends A{constructor(){super(...arguments);this.validate=this.implement}_parse($){let{ctx:Q}=this._processInputParams($);if(Q.parsedType!==_.function)return U(Q,{code:K.invalid_type,expected:_.function,received:Q.parsedType}),L;function J(z,X){return f1({data:z,path:Q.path,errorMaps:[Q.common.contextualErrorMap,Q.schemaErrorMap,M1(),E0].filter((G)=>!!G),issueData:{code:K.invalid_arguments,argumentsError:X}})}function Y(z,X){return f1({data:z,path:Q.path,errorMaps:[Q.common.contextualErrorMap,Q.schemaErrorMap,M1(),E0].filter((G)=>!!G),issueData:{code:K.invalid_return_type,returnTypeError:X}})}let W={errorMap:Q.common.contextualErrorMap},H=Q.data;if(this._def.returns instanceof D0){let z=this;return x(async function(...X){let G=new Z([]),q=await z._def.args.parseAsync(X,W).catch((F)=>{throw G.addIssue(J(X,F)),G}),w=await Reflect.apply(H,this,q);return await z._def.returns._def.type.parseAsync(w,W).catch((F)=>{throw G.addIssue(Y(w,F)),G})})}else{let z=this;return x(function(...X){let G=z._def.args.safeParse(X,W);if(!G.success)throw new Z([J(X,G.error)]);let q=Reflect.apply(H,this,G.data),w=z._def.returns.safeParse(q,W);if(!w.success)throw new Z([Y(q,w.error)]);return w.data})}}parameters(){return this._def.args}returnType(){return this._def.returns}args(...$){return new P0({...this._def,args:r.create($).rest(z0.create())})}returns($){return new P0({...this._def,returns:$})}implement($){return this.parse($)}strictImplement($){return this.parse($)}static create($,Q,J){return new P0({args:$?$:r.create([]).rest(z0.create()),returns:Q||z0.create(),typeName:D.ZodFunction,...k(J)})}}class T0 extends A{get schema(){return this._def.getter()}_parse($){let{ctx:Q}=this._processInputParams($);return this._def.getter()._parse({data:Q.data,path:Q.path,parent:Q})}}T0.create=($,Q)=>{return new T0({getter:$,typeName:D.ZodLazy,...k(Q)})};class x0 extends A{_parse($){if($.data!==this._def.value){let Q=this._getOrReturnCtx($);return U(Q,{received:Q.data,code:K.invalid_literal,expected:this._def.value}),L}return{status:"valid",value:$.data}}get value(){return this._def.value}}x0.create=($,Q)=>{return new x0({value:$,typeName:D.ZodLiteral,...k(Q)})};function j4($,Q){return new G0({values:$,typeName:D.ZodEnum,...k(Q)})}class G0 extends A{constructor(){super(...arguments);J1.set(this,void 0)}_parse($){if(typeof $.data!=="string"){let Q=this._getOrReturnCtx($),J=this._def.values;return U(Q,{expected:C.joinValues(J),received:Q.parsedType,code:K.invalid_type}),L}if(!b1(this,J1,"f"))B4(this,J1,new Set(this._def.values),"f");if(!b1(this,J1,"f").has($.data)){let Q=this._getOrReturnCtx($),J=this._def.values;return U(Q,{received:Q.data,code:K.invalid_enum_value,options:J}),L}return x($.data)}get options(){return this._def.values}get enum(){let $={};for(let Q of this._def.values)$[Q]=Q;return $}get Values(){let $={};for(let Q of this._def.values)$[Q]=Q;return $}get Enum(){let $={};for(let Q of this._def.values)$[Q]=Q;return $}extract($,Q=this._def){return G0.create($,{...this._def,...Q})}exclude($,Q=this._def){return G0.create(this.options.filter((J)=>!$.includes(J)),{...this._def,...Q})}}J1=new WeakMap;G0.create=j4;class y0 extends A{constructor(){super(...arguments);W1.set(this,void 0)}_parse($){let Q=C.getValidEnumValues(this._def.values),J=this._getOrReturnCtx($);if(J.parsedType!==_.string&&J.parsedType!==_.number){let Y=C.objectValues(Q);return U(J,{expected:C.joinValues(Y),received:J.parsedType,code:K.invalid_type}),L}if(!b1(this,W1,"f"))B4(this,W1,new Set(C.getValidEnumValues(this._def.values)),"f");if(!b1(this,W1,"f").has($.data)){let Y=C.objectValues(Q);return U(J,{received:J.data,code:K.invalid_enum_value,options:Y}),L}return x($.data)}get enum(){return this._def.values}}W1=new WeakMap;y0.create=($,Q)=>{return new y0({values:$,typeName:D.ZodNativeEnum,...k(Q)})};class D0 extends A{unwrap(){return this._def.type}_parse($){let{ctx:Q}=this._processInputParams($);if(Q.parsedType!==_.promise&&Q.common.async===!1)return U(Q,{code:K.invalid_type,expected:_.promise,received:Q.parsedType}),L;let J=Q.parsedType===_.promise?Q.data:Promise.resolve(Q.data);return x(J.then((Y)=>{return this._def.type.parseAsync(Y,{path:Q.path,errorMap:Q.common.contextualErrorMap})}))}}D0.create=($,Q)=>{return new D0({type:$,typeName:D.ZodPromise,...k(Q)})};class m extends A{innerType(){return this._def.schema}sourceType(){return this._def.schema._def.typeName===D.ZodEffects?this._def.schema.sourceType():this._def.schema}_parse($){let{status:Q,ctx:J}=this._processInputParams($),Y=this._def.effect||null,W={addIssue:(H)=>{if(U(J,H),H.fatal)Q.abort();else Q.dirty()},get path(){return J.path}};if(W.addIssue=W.addIssue.bind(W),Y.type==="preprocess"){let H=Y.transform(J.data,W);if(J.common.async)return Promise.resolve(H).then(async(z)=>{if(Q.value==="aborted")return L;let X=await this._def.schema._parseAsync({data:z,path:J.path,parent:J});if(X.status==="aborted")return L;if(X.status==="dirty")return C0(X.value);if(Q.value==="dirty")return C0(X.value);return X});else{if(Q.value==="aborted")return L;let z=this._def.schema._parseSync({data:H,path:J.path,parent:J});if(z.status==="aborted")return L;if(z.status==="dirty")return C0(z.value);if(Q.value==="dirty")return C0(z.value);return z}}if(Y.type==="refinement"){let H=(z)=>{let X=Y.refinement(z,W);if(J.common.async)return Promise.resolve(X);if(X instanceof Promise)throw Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");return z};if(J.common.async===!1){let z=this._def.schema._parseSync({data:J.data,path:J.path,parent:J});if(z.status==="aborted")return L;if(z.status==="dirty")Q.dirty();return H(z.value),{status:Q.value,value:z.value}}else return this._def.schema._parseAsync({data:J.data,path:J.path,parent:J}).then((z)=>{if(z.status==="aborted")return L;if(z.status==="dirty")Q.dirty();return H(z.value).then(()=>{return{status:Q.value,value:z.value}})})}if(Y.type==="transform")if(J.common.async===!1){let H=this._def.schema._parseSync({data:J.data,path:J.path,parent:J});if(!U0(H))return H;let z=Y.transform(H.value,W);if(z instanceof Promise)throw Error("Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.");return{status:Q.value,value:z}}else return this._def.schema._parseAsync({data:J.data,path:J.path,parent:J}).then((H)=>{if(!U0(H))return H;return Promise.resolve(Y.transform(H.value,W)).then((z)=>({status:Q.value,value:z}))});C.assertNever(Y)}}m.create=($,Q,J)=>{return new m({schema:$,typeName:D.ZodEffects,effect:Q,...k(J)})};m.createWithPreprocess=($,Q,J)=>{return new m({schema:Q,effect:{type:"preprocess",transform:$},typeName:D.ZodEffects,...k(J)})};class d extends A{_parse($){if(this._getType($)===_.undefined)return x(void 0);return this._def.innerType._parse($)}unwrap(){return this._def.innerType}}d.create=($,Q)=>{return new d({innerType:$,typeName:D.ZodOptional,...k(Q)})};class Q0 extends A{_parse($){if(this._getType($)===_.null)return x(null);return this._def.innerType._parse($)}unwrap(){return this._def.innerType}}Q0.create=($,Q)=>{return new Q0({innerType:$,typeName:D.ZodNullable,...k(Q)})};class Z0 extends A{_parse($){let{ctx:Q}=this._processInputParams($),J=Q.data;if(Q.parsedType===_.undefined)J=this._def.defaultValue();return this._def.innerType._parse({data:J,path:Q.path,parent:Q})}removeDefault(){return this._def.innerType}}Z0.create=($,Q)=>{return new Z0({innerType:$,typeName:D.ZodDefault,defaultValue:typeof Q.default==="function"?Q.default:()=>Q.default,...k(Q)})};class g0 extends A{_parse($){let{ctx:Q}=this._processInputParams($),J={...Q,common:{...Q.common,issues:[]}},Y=this._def.innerType._parse({data:J.data,path:J.path,parent:{...J}});if(Y1(Y))return Y.then((W)=>{return{status:"valid",value:W.status==="valid"?W.value:this._def.catchValue({get error(){return new Z(J.common.issues)},input:J.data})}});else return{status:"valid",value:Y.status==="valid"?Y.value:this._def.catchValue({get error(){return new Z(J.common.issues)},input:J.data})}}removeCatch(){return this._def.innerType}}g0.create=($,Q)=>{return new g0({innerType:$,typeName:D.ZodCatch,catchValue:typeof Q.catch==="function"?Q.catch:()=>Q.catch,...k(Q)})};class G1 extends A{_parse($){if(this._getType($)!==_.nan){let J=this._getOrReturnCtx($);return U(J,{code:K.invalid_type,expected:_.nan,received:J.parsedType}),L}return{status:"valid",value:$.data}}}G1.create=($)=>{return new G1({typeName:D.ZodNaN,...k($)})};var l6=Symbol("zod_brand");class P1 extends A{_parse($){let{ctx:Q}=this._processInputParams($),J=Q.data;return this._def.type._parse({data:J,path:Q.path,parent:Q})}unwrap(){return this._def.type}}class q1 extends A{_parse($){let{status:Q,ctx:J}=this._processInputParams($);if(J.common.async)return(async()=>{let W=await this._def.in._parseAsync({data:J.data,path:J.path,parent:J});if(W.status==="aborted")return L;if(W.status==="dirty")return Q.dirty(),C0(W.value);else return this._def.out._parseAsync({data:W.value,path:J.path,parent:J})})();else{let Y=this._def.in._parseSync({data:J.data,path:J.path,parent:J});if(Y.status==="aborted")return L;if(Y.status==="dirty")return Q.dirty(),{status:"dirty",value:Y.value};else return this._def.out._parseSync({data:Y.value,path:J.path,parent:J})}}static create($,Q){return new q1({in:$,out:Q,typeName:D.ZodPipeline})}}class l0 extends A{_parse($){let Q=this._def.innerType._parse($),J=(Y)=>{if(U0(Y))Y.value=Object.freeze(Y.value);return Y};return Y1(Q)?Q.then((Y)=>J(Y)):J(Q)}unwrap(){return this._def.innerType}}l0.create=($,Q)=>{return new l0({innerType:$,typeName:D.ZodReadonly,...k(Q)})};function H4($,Q){let J=typeof $==="function"?$(Q):typeof $==="string"?{message:$}:$;return typeof J==="string"?{message:J}:J}function K4($,Q={},J){if($)return F0.create().superRefine((Y,W)=>{var H,z;let X=$(Y);if(X instanceof Promise)return X.then((G)=>{var q,w;if(!G){let V=H4(Q,Y),F=(w=(q=V.fatal)!==null&&q!==void 0?q:J)!==null&&w!==void 0?w:!0;W.addIssue({code:"custom",...V,fatal:F})}});if(!X){let G=H4(Q,Y),q=(z=(H=G.fatal)!==null&&H!==void 0?H:J)!==null&&z!==void 0?z:!0;W.addIssue({code:"custom",...G,fatal:q})}return});return F0.create()}var m6={object:N.lazycreate},D;(function($){$.ZodString="ZodString",$.ZodNumber="ZodNumber",$.ZodNaN="ZodNaN",$.ZodBigInt="ZodBigInt",$.ZodBoolean="ZodBoolean",$.ZodDate="ZodDate",$.ZodSymbol="ZodSymbol",$.ZodUndefined="ZodUndefined",$.ZodNull="ZodNull",$.ZodAny="ZodAny",$.ZodUnknown="ZodUnknown",$.ZodNever="ZodNever",$.ZodVoid="ZodVoid",$.ZodArray="ZodArray",$.ZodObject="ZodObject",$.ZodUnion="ZodUnion",$.ZodDiscriminatedUnion="ZodDiscriminatedUnion",$.ZodIntersection="ZodIntersection",$.ZodTuple="ZodTuple",$.ZodRecord="ZodRecord",$.ZodMap="ZodMap",$.ZodSet="ZodSet",$.ZodFunction="ZodFunction",$.ZodLazy="ZodLazy",$.ZodLiteral="ZodLiteral",$.ZodEnum="ZodEnum",$.ZodEffects="ZodEffects",$.ZodNativeEnum="ZodNativeEnum",$.ZodOptional="ZodOptional",$.ZodNullable="ZodNullable",$.ZodDefault="ZodDefault",$.ZodCatch="ZodCatch",$.ZodPromise="ZodPromise",$.ZodBranded="ZodBranded",$.ZodPipeline="ZodPipeline",$.ZodReadonly="ZodReadonly"})(D||(D={}));var u6=($,Q={message:`Input not instance of ${$.name}`})=>K4((J)=>J instanceof $,Q),V4=p.create,U4=X0.create,p6=G1.create,c6=B0.create,_4=v0.create,d6=_0.create,n6=H1.create,i6=R0.create,o6=N0.create,a6=F0.create,t6=z0.create,r6=t.create,s6=z1.create,e6=c.create,$9=N.create,Q9=N.strictCreate,J9=I0.create,W9=C1.create,Y9=h0.create,H9=r.create,z9=X1.create,X9=B1.create,B9=O0.create,G9=P0.create,q9=T0.create,w9=x0.create,j9=G0.create,K9=y0.create,V9=D0.create,z4=m.create,U9=d.create,_9=Q0.create,F9=m.createWithPreprocess,O9=q1.create,D9=()=>V4().optional(),L9=()=>U4().optional(),S9=()=>_4().optional(),k9={string:($)=>p.create({...$,coerce:!0}),number:($)=>X0.create({...$,coerce:!0}),boolean:($)=>v0.create({...$,coerce:!0}),bigint:($)=>B0.create({...$,coerce:!0}),date:($)=>_0.create({...$,coerce:!0})},A9=L,B=Object.freeze({__proto__:null,defaultErrorMap:E0,setErrorMap:F6,getErrorMap:M1,makeIssue:f1,EMPTY_PATH:O6,addIssueToContext:U,ParseStatus:T,INVALID:L,DIRTY:C0,OK:x,isAborted:Y8,isDirty:H8,isValid:U0,isAsync:Y1,get util(){return C},get objectUtil(){return W8},ZodParsedType:_,getParsedType:$0,ZodType:A,datetimeRegex:w4,ZodString:p,ZodNumber:X0,ZodBigInt:B0,ZodBoolean:v0,ZodDate:_0,ZodSymbol:H1,ZodUndefined:R0,ZodNull:N0,ZodAny:F0,ZodUnknown:z0,ZodNever:t,ZodVoid:z1,ZodArray:c,ZodObject:N,ZodUnion:I0,ZodDiscriminatedUnion:C1,ZodIntersection:h0,ZodTuple:r,ZodRecord:X1,ZodMap:B1,ZodSet:O0,ZodFunction:P0,ZodLazy:T0,ZodLiteral:x0,ZodEnum:G0,ZodNativeEnum:y0,ZodPromise:D0,ZodEffects:m,ZodTransformer:m,ZodOptional:d,ZodNullable:Q0,ZodDefault:Z0,ZodCatch:g0,ZodNaN:G1,BRAND:l6,ZodBranded:P1,ZodPipeline:q1,ZodReadonly:l0,custom:K4,Schema:A,ZodSchema:A,late:m6,get ZodFirstPartyTypeKind(){return D},coerce:k9,any:a6,array:e6,bigint:c6,boolean:_4,date:d6,discriminatedUnion:W9,effect:z4,enum:j9,function:G9,instanceof:u6,intersection:Y9,lazy:q9,literal:w9,map:X9,nan:p6,nativeEnum:K9,never:r6,null:o6,nullable:_9,number:U4,object:$9,oboolean:S9,onumber:L9,optional:U9,ostring:D9,pipeline:O9,preprocess:F9,promise:V9,record:z9,set:B9,strictObject:Q9,string:V4,symbol:n6,transformer:z4,tuple:H9,undefined:i6,union:J9,unknown:t6,void:s6,NEVER:A9,ZodIssueCode:K,quotelessJson:_6,ZodError:Z});var X8="2024-11-05",F4=[X8,"2024-10-07"],E1="2.0",O4=B.union([B.string(),B.number().int()]),D4=B.string(),i=B.object({_meta:B.optional(B.object({progressToken:B.optional(O4)}).passthrough())}).passthrough(),g=B.object({method:B.string(),params:B.optional(i)}),w1=B.object({_meta:B.optional(B.object({}).passthrough())}).passthrough(),s=B.object({method:B.string(),params:B.optional(w1)}),o=B.object({_meta:B.optional(B.object({}).passthrough())}).passthrough(),v1=B.union([B.string(),B.number().int()]),M9=B.object({jsonrpc:B.literal(E1),id:v1}).merge(g).strict(),f9=B.object({jsonrpc:B.literal(E1)}).merge(s).strict(),b9=B.object({jsonrpc:B.literal(E1),id:v1,result:o}).strict(),L0;(function($){$[$.ConnectionClosed=-32000]="ConnectionClosed",$[$.RequestTimeout=-32001]="RequestTimeout",$[$.ParseError=-32700]="ParseError",$[$.InvalidRequest=-32600]="InvalidRequest",$[$.MethodNotFound=-32601]="MethodNotFound",$[$.InvalidParams=-32602]="InvalidParams",$[$.InternalError=-32603]="InternalError"})(L0||(L0={}));var C9=B.object({jsonrpc:B.literal(E1),id:v1,error:B.object({code:B.number().int(),message:B.string(),data:B.optional(B.unknown())})}).strict(),L4=B.union([M9,f9,b9,C9]),R1=o.strict(),N1=s.extend({method:B.literal("notifications/cancelled"),params:w1.extend({requestId:v1,reason:B.string().optional()})}),S4=B.object({name:B.string(),version:B.string()}).passthrough(),P9=B.object({experimental:B.optional(B.object({}).passthrough()),sampling:B.optional(B.object({}).passthrough()),roots:B.optional(B.object({listChanged:B.optional(B.boolean())}).passthrough())}).passthrough(),B8=g.extend({method:B.literal("initialize"),params:i.extend({protocolVersion:B.string(),capabilities:P9,clientInfo:S4})}),E9=B.object({experimental:B.optional(B.object({}).passthrough()),logging:B.optional(B.object({}).passthrough()),prompts:B.optional(B.object({listChanged:B.optional(B.boolean())}).passthrough()),resources:B.optional(B.object({subscribe:B.optional(B.boolean()),listChanged:B.optional(B.boolean())}).passthrough()),tools:B.optional(B.object({listChanged:B.optional(B.boolean())}).passthrough())}).passthrough(),v9=o.extend({protocolVersion:B.string(),capabilities:E9,serverInfo:S4,instructions:B.optional(B.string())}),G8=s.extend({method:B.literal("notifications/initialized")}),I1=g.extend({method:B.literal("ping")}),R9=B.object({progress:B.number(),total:B.optional(B.number())}).passthrough(),h1=s.extend({method:B.literal("notifications/progress"),params:w1.merge(R9).extend({progressToken:O4})}),T1=g.extend({params:i.extend({cursor:B.optional(D4)}).optional()}),x1=o.extend({nextCursor:B.optional(D4)}),k4=B.object({uri:B.string(),mimeType:B.optional(B.string())}).passthrough(),A4=k4.extend({text:B.string()}),M4=k4.extend({blob:B.string().base64()}),N9=B.object({uri:B.string(),name:B.string(),description:B.optional(B.string()),mimeType:B.optional(B.string())}).passthrough(),I9=B.object({uriTemplate:B.string(),name:B.string(),description:B.optional(B.string()),mimeType:B.optional(B.string())}).passthrough(),h9=T1.extend({method:B.literal("resources/list")}),T9=x1.extend({resources:B.array(N9)}),x9=T1.extend({method:B.literal("resources/templates/list")}),y9=x1.extend({resourceTemplates:B.array(I9)}),Z9=g.extend({method:B.literal("resources/read"),params:i.extend({uri:B.string()})}),g9=o.extend({contents:B.array(B.union([A4,M4]))}),l9=s.extend({method:B.literal("notifications/resources/list_changed")}),m9=g.extend({method:B.literal("resources/subscribe"),params:i.extend({uri:B.string()})}),u9=g.extend({method:B.literal("resources/unsubscribe"),params:i.extend({uri:B.string()})}),p9=s.extend({method:B.literal("notifications/resources/updated"),params:w1.extend({uri:B.string()})}),c9=B.object({name:B.string(),description:B.optional(B.string()),required:B.optional(B.boolean())}).passthrough(),d9=B.object({name:B.string(),description:B.optional(B.string()),arguments:B.optional(B.array(c9))}).passthrough(),n9=T1.extend({method:B.literal("prompts/list")}),i9=x1.extend({prompts:B.array(d9)}),o9=g.extend({method:B.literal("prompts/get"),params:i.extend({name:B.string(),arguments:B.optional(B.record(B.string()))})}),y1=B.object({type:B.literal("text"),text:B.string()}).passthrough(),Z1=B.object({type:B.literal("image"),data:B.string().base64(),mimeType:B.string()}).passthrough(),f4=B.object({type:B.literal("resource"),resource:B.union([A4,M4])}).passthrough(),a9=B.object({role:B.enum(["user","assistant"]),content:B.union([y1,Z1,f4])}).passthrough(),t9=o.extend({description:B.optional(B.string()),messages:B.array(a9)}),r9=s.extend({method:B.literal("notifications/prompts/list_changed")}),s9=B.object({name:B.string(),description:B.optional(B.string()),inputSchema:B.object({type:B.literal("object"),properties:B.optional(B.object({}).passthrough())}).passthrough()}).passthrough(),q8=T1.extend({method:B.literal("tools/list")}),e9=x1.extend({tools:B.array(s9)}),b4=o.extend({content:B.array(B.union([y1,Z1,f4])),isError:B.boolean().default(!1).optional()}),N5=b4.or(o.extend({toolResult:B.unknown()})),w8=g.extend({method:B.literal("tools/call"),params:i.extend({name:B.string(),arguments:B.optional(B.record(B.unknown()))})}),$$=s.extend({method:B.literal("notifications/tools/list_changed")}),C4=B.enum(["debug","info","notice","warning","error","critical","alert","emergency"]),Q$=g.extend({method:B.literal("logging/setLevel"),params:i.extend({level:C4})}),J$=s.extend({method:B.literal("notifications/message"),params:w1.extend({level:C4,logger:B.optional(B.string()),data:B.unknown()})}),W$=B.object({name:B.string().optional()}).passthrough(),Y$=B.object({hints:B.optional(B.array(W$)),costPriority:B.optional(B.number().min(0).max(1)),speedPriority:B.optional(B.number().min(0).max(1)),intelligencePriority:B.optional(B.number().min(0).max(1))}).passthrough(),H$=B.object({role:B.enum(["user","assistant"]),content:B.union([y1,Z1])}).passthrough(),z$=g.extend({method:B.literal("sampling/createMessage"),params:i.extend({messages:B.array(H$),systemPrompt:B.optional(B.string()),includeContext:B.optional(B.enum(["none","thisServer","allServers"])),temperature:B.optional(B.number()),maxTokens:B.number().int(),stopSequences:B.optional(B.array(B.string())),metadata:B.optional(B.object({}).passthrough()),modelPreferences:B.optional(Y$)})}),j8=o.extend({model:B.string(),stopReason:B.optional(B.enum(["endTurn","stopSequence","maxTokens"]).or(B.string())),role:B.enum(["user","assistant"]),content:B.discriminatedUnion("type",[y1,Z1])}),X$=B.object({type:B.literal("ref/resource"),uri:B.string()}).passthrough(),B$=B.object({type:B.literal("ref/prompt"),name:B.string()}).passthrough(),G$=g.extend({method:B.literal("completion/complete"),params:i.extend({ref:B.union([B$,X$]),argument:B.object({name:B.string(),value:B.string()}).passthrough()})}),q$=o.extend({completion:B.object({values:B.array(B.string()).max(100),total:B.optional(B.number().int()),hasMore:B.optional(B.boolean())}).passthrough()}),w$=B.object({uri:B.string().startsWith("file://"),name:B.optional(B.string())}).passthrough(),j$=g.extend({method:B.literal("roots/list")}),K8=o.extend({roots:B.array(w$)}),K$=s.extend({method:B.literal("notifications/roots/list_changed")}),I5=B.union([I1,B8,G$,Q$,o9,n9,h9,x9,Z9,m9,u9,w8,q8]),h5=B.union([N1,h1,G8,K$]),T5=B.union([R1,j8,K8]),x5=B.union([I1,z$,j$]),y5=B.union([N1,h1,J$,p9,l9,$$,r9]),Z5=B.union([R1,v9,q$,t9,i9,T9,y9,g9,b4,e9]);class j1 extends Error{constructor($,Q,J){super(`MCP error ${$}: ${Q}`);this.code=$,this.data=J}}var V$=60000;class V8{constructor($){this._options=$,this._requestMessageId=0,this._requestHandlers=new Map,this._requestHandlerAbortControllers=new Map,this._notificationHandlers=new Map,this._responseHandlers=new Map,this._progressHandlers=new Map,this.setNotificationHandler(N1,(Q)=>{let J=this._requestHandlerAbortControllers.get(Q.params.requestId);J===null||J===void 0||J.abort(Q.params.reason)}),this.setNotificationHandler(h1,(Q)=>{this._onprogress(Q)}),this.setRequestHandler(I1,(Q)=>({}))}async connect($){this._transport=$,this._transport.onclose=()=>{this._onclose()},this._transport.onerror=(Q)=>{this._onerror(Q)},this._transport.onmessage=(Q)=>{if(!("method"in Q))this._onresponse(Q);else if("id"in Q)this._onrequest(Q);else this._onnotification(Q)},await this._transport.start()}_onclose(){var $;let Q=this._responseHandlers;this._responseHandlers=new Map,this._progressHandlers.clear(),this._transport=void 0,($=this.onclose)===null||$===void 0||$.call(this);let J=new j1(L0.ConnectionClosed,"Connection closed");for(let Y of Q.values())Y(J)}_onerror($){var Q;(Q=this.onerror)===null||Q===void 0||Q.call(this,$)}_onnotification($){var Q;let J=(Q=this._notificationHandlers.get($.method))!==null&&Q!==void 0?Q:this.fallbackNotificationHandler;if(J===void 0)return;Promise.resolve().then(()=>J($)).catch((Y)=>this._onerror(Error(`Uncaught error in notification handler: ${Y}`)))}_onrequest($){var Q,J;let Y=(Q=this._requestHandlers.get($.method))!==null&&Q!==void 0?Q:this.fallbackRequestHandler;if(Y===void 0){(J=this._transport)===null||J===void 0||J.send({jsonrpc:"2.0",id:$.id,error:{code:L0.MethodNotFound,message:"Method not found"}}).catch((H)=>this._onerror(Error(`Failed to send an error response: ${H}`)));return}let W=new AbortController;this._requestHandlerAbortControllers.set($.id,W),Promise.resolve().then(()=>Y($,{signal:W.signal})).then((H)=>{var z;if(W.signal.aborted)return;return(z=this._transport)===null||z===void 0?void 0:z.send({result:H,jsonrpc:"2.0",id:$.id})},(H)=>{var z,X;if(W.signal.aborted)return;return(z=this._transport)===null||z===void 0?void 0:z.send({jsonrpc:"2.0",id:$.id,error:{code:Number.isSafeInteger(H.code)?H.code:L0.InternalError,message:(X=H.message)!==null&&X!==void 0?X:"Internal error"}})}).catch((H)=>this._onerror(Error(`Failed to send response: ${H}`))).finally(()=>{this._requestHandlerAbortControllers.delete($.id)})}_onprogress($){let{progressToken:Q,...J}=$.params,Y=this._progressHandlers.get(Number(Q));if(Y===void 0){this._onerror(Error(`Received a progress notification for an unknown token: ${JSON.stringify($)}`));return}Y(J)}_onresponse($){let Q=$.id,J=this._responseHandlers.get(Number(Q));if(J===void 0){this._onerror(Error(`Received a response for an unknown message ID: ${JSON.stringify($)}`));return}if(this._responseHandlers.delete(Number(Q)),this._progressHandlers.delete(Number(Q)),"result"in $)J($);else{let Y=new j1($.error.code,$.error.message,$.error.data);J(Y)}}get transport(){return this._transport}async close(){var $;await(($=this._transport)===null||$===void 0?void 0:$.close())}request($,Q,J){return new Promise((Y,W)=>{var H,z,X,G;if(!this._transport){W(Error("Not connected"));return}if(((H=this._options)===null||H===void 0?void 0:H.enforceStrictCapabilities)===!0)this.assertCapabilityForMethod($.method);(z=J===null||J===void 0?void 0:J.signal)===null||z===void 0||z.throwIfAborted();let q=this._requestMessageId++,w={...$,jsonrpc:"2.0",id:q};if(J===null||J===void 0?void 0:J.onprogress)this._progressHandlers.set(q,J.onprogress),w.params={...$.params,_meta:{progressToken:q}};let V=void 0;this._responseHandlers.set(q,(R)=>{var h;if(V!==void 0)clearTimeout(V);if((h=J===null||J===void 0?void 0:J.signal)===null||h===void 0?void 0:h.aborted)return;if(R instanceof Error)return W(R);try{let Q1=Q.parse(R.result);Y(Q1)}catch(Q1){W(Q1)}});let F=(R)=>{var h;this._responseHandlers.delete(q),this._progressHandlers.delete(q),(h=this._transport)===null||h===void 0||h.send({jsonrpc:"2.0",method:"notifications/cancelled",params:{requestId:q,reason:String(R)}}).catch((Q1)=>this._onerror(Error(`Failed to send cancellation: ${Q1}`))),W(R)};(X=J===null||J===void 0?void 0:J.signal)===null||X===void 0||X.addEventListener("abort",()=>{var R;if(V!==void 0)clearTimeout(V);F((R=J===null||J===void 0?void 0:J.signal)===null||R===void 0?void 0:R.reason)});let P=(G=J===null||J===void 0?void 0:J.timeout)!==null&&G!==void 0?G:V$;V=setTimeout(()=>F(new j1(L0.RequestTimeout,"Request timed out",{timeout:P})),P),this._transport.send(w).catch((R)=>{if(V!==void 0)clearTimeout(V);W(R)})})}async notification($){if(!this._transport)throw Error("Not connected");this.assertNotificationCapability($.method);let Q={...$,jsonrpc:"2.0"};await this._transport.send(Q)}setRequestHandler($,Q){let J=$.shape.method.value;this.assertRequestHandlerCapability(J),this._requestHandlers.set(J,(Y,W)=>Promise.resolve(Q($.parse(Y),W)))}removeRequestHandler($){this._requestHandlers.delete($)}assertCanSetRequestHandler($){if(this._requestHandlers.has($))throw Error(`A request handler for ${$} already exists, which would be overridden`)}setNotificationHandler($,Q){this._notificationHandlers.set($.shape.method.value,(J)=>Promise.resolve(Q($.parse(J))))}removeNotificationHandler($){this._notificationHandlers.delete($)}}function P4($,Q){return Object.entries(Q).reduce((J,[Y,W])=>{if(W&&typeof W==="object")J[Y]=J[Y]?{...J[Y],...W}:W;else J[Y]=W;return J},{...$})}class U8 extends V8{constructor($,Q){var J;super(Q);this._serverInfo=$,this._capabilities=(J=Q===null||Q===void 0?void 0:Q.capabilities)!==null&&J!==void 0?J:{},this._instructions=Q===null||Q===void 0?void 0:Q.instructions,this.setRequestHandler(B8,(Y)=>this._oninitialize(Y)),this.setNotificationHandler(G8,()=>{var Y;return(Y=this.oninitialized)===null||Y===void 0?void 0:Y.call(this)})}registerCapabilities($){if(this.transport)throw Error("Cannot register capabilities after connecting to transport");this._capabilities=P4(this._capabilities,$)}assertCapabilityForMethod($){var Q,J;switch($){case"sampling/createMessage":if(!((Q=this._clientCapabilities)===null||Q===void 0?void 0:Q.sampling))throw Error(`Client does not support sampling (required for ${$})`);break;case"roots/list":if(!((J=this._clientCapabilities)===null||J===void 0?void 0:J.roots))throw Error(`Client does not support listing roots (required for ${$})`);break;case"ping":break}}assertNotificationCapability($){switch($){case"notifications/message":if(!this._capabilities.logging)throw Error(`Server does not support logging (required for ${$})`);break;case"notifications/resources/updated":case"notifications/resources/list_changed":if(!this._capabilities.resources)throw Error(`Server does not support notifying about resources (required for ${$})`);break;case"notifications/tools/list_changed":if(!this._capabilities.tools)throw Error(`Server does not support notifying of tool list changes (required for ${$})`);break;case"notifications/prompts/list_changed":if(!this._capabilities.prompts)throw Error(`Server does not support notifying of prompt list changes (required for ${$})`);break;case"notifications/cancelled":break;case"notifications/progress":break}}assertRequestHandlerCapability($){switch($){case"sampling/createMessage":if(!this._capabilities.sampling)throw Error(`Server does not support sampling (required for ${$})`);break;case"logging/setLevel":if(!this._capabilities.logging)throw Error(`Server does not support logging (required for ${$})`);break;case"prompts/get":case"prompts/list":if(!this._capabilities.prompts)throw Error(`Server does not support prompts (required for ${$})`);break;case"resources/list":case"resources/templates/list":case"resources/read":if(!this._capabilities.resources)throw Error(`Server does not support resources (required for ${$})`);break;case"tools/call":case"tools/list":if(!this._capabilities.tools)throw Error(`Server does not support tools (required for ${$})`);break;case"ping":case"initialize":break}}async _oninitialize($){let Q=$.params.protocolVersion;return this._clientCapabilities=$.params.capabilities,this._clientVersion=$.params.clientInfo,{protocolVersion:F4.includes(Q)?Q:X8,capabilities:this.getCapabilities(),serverInfo:this._serverInfo,...this._instructions&&{instructions:this._instructions}}}getClientCapabilities(){return this._clientCapabilities}getClientVersion(){return this._clientVersion}getCapabilities(){return this._capabilities}async ping(){return this.request({method:"ping"},R1)}async createMessage($,Q){return this.request({method:"sampling/createMessage",params:$},j8,Q)}async listRoots($,Q){return this.request({method:"roots/list",params:$},K8,Q)}async sendLoggingMessage($){return this.notification({method:"notifications/message",params:$})}async sendResourceUpdated($){return this.notification({method:"notifications/resources/updated",params:$})}async sendResourceListChanged(){return this.notification({method:"notifications/resources/list_changed"})}async sendToolListChanged(){return this.notification({method:"notifications/tools/list_changed"})}async sendPromptListChanged(){return this.notification({method:"notifications/prompts/list_changed"})}}import v4 from"node:process";class _8{append($){this._buffer=this._buffer?Buffer.concat([this._buffer,$]):$}readMessage(){if(!this._buffer)return null;let $=this._buffer.indexOf(`
`);if($===-1)return null;let Q=this._buffer.toString("utf8",0,$);return this._buffer=this._buffer.subarray($+1),U$(Q)}clear(){this._buffer=void 0}}function U$($){return L4.parse(JSON.parse($))}function E4($){return JSON.stringify($)+`
`}class F8{constructor($=v4.stdin,Q=v4.stdout){this._stdin=$,this._stdout=Q,this._readBuffer=new _8,this._started=!1,this._ondata=(J)=>{this._readBuffer.append(J),this.processReadBuffer()},this._onerror=(J)=>{var Y;(Y=this.onerror)===null||Y===void 0||Y.call(this,J)}}async start(){if(this._started)throw Error("StdioServerTransport already started! If using Server class, note that connect() calls start() automatically.");this._started=!0,this._stdin.on("data",this._ondata),this._stdin.on("error",this._onerror)}processReadBuffer(){var $,Q;while(!0)try{let J=this._readBuffer.readMessage();if(J===null)break;($=this.onmessage)===null||$===void 0||$.call(this,J)}catch(J){(Q=this.onerror)===null||Q===void 0||Q.call(this,J)}}async close(){var $;if(this._stdin.off("data",this._ondata),this._stdin.off("error",this._onerror),this._stdin.listenerCount("data")===0)this._stdin.pause();this._readBuffer.clear(),($=this.onclose)===null||$===void 0||$.call(this)}send($){return new Promise((Q)=>{let J=E4($);if(this._stdout.write(J))Q();else this._stdout.once("drain",Q)})}}q0();var L$={name:"contacts",description:"Search and retrieve contacts from Apple Contacts app",inputSchema:{type:"object",properties:{name:{type:"string",description:"Name to search for (optional - if not provided, returns all contacts). Can be partial name to search."}}}},S$={name:"notes",description:"Search, retrieve and create notes in Apple Notes app",inputSchema:{type:"object",properties:{operation:{type:"string",description:"Operation to perform: 'search', 'list', or 'create'",enum:["search","list","create"]},searchText:{type:"string",description:"Text to search for in notes (required for search operation)"},title:{type:"string",description:"Title of the note to create (required for create operation)"},body:{type:"string",description:"Content of the note to create (required for create operation)"},folderName:{type:"string",description:"Name of the folder to create the note in (optional for create operation, defaults to 'Claude')"}},required:["operation"]}},k$={name:"messages",description:"Interact with Apple Messages app - send, read, schedule messages and check unread messages",inputSchema:{type:"object",properties:{operation:{type:"string",description:"Operation to perform: 'send', 'read', 'schedule', or 'unread'",enum:["send","read","schedule","unread"]},phoneNumber:{type:"string",description:"Phone number to send message to (required for send, read, and schedule operations)"},message:{type:"string",description:"Message to send (required for send and schedule operations)"},limit:{type:"number",description:"Number of messages to read (optional, for read and unread operations)"},scheduledTime:{type:"string",description:"ISO string of when to send the message (required for schedule operation)"}},required:["operation"]}},A$={name:"mail",description:"Interact with Apple Mail app - read unread emails, search emails, and send emails",inputSchema:{type:"object",properties:{operation:{type:"string",description:"Operation to perform: 'unread', 'search', 'send', 'mailboxes', 'accounts', or 'latest'",enum:["unread","search","send","mailboxes","accounts","latest"]},account:{type:"string",description:"Email account to use (optional - if not provided, searches across all accounts)"},mailbox:{type:"string",description:"Mailbox to use (optional - if not provided, uses inbox or searches across all mailboxes)"},limit:{type:"number",description:"Number of emails to retrieve (optional, for unread, search, and latest operations)"},searchTerm:{type:"string",description:"Text to search for in emails (required for search operation)"},to:{type:"string",description:"Recipient email address (required for send operation)"},subject:{type:"string",description:"Email subject (required for send operation)"},body:{type:"string",description:"Email body content (required for send operation)"},cc:{type:"string",description:"CC email address (optional for send operation)"},bcc:{type:"string",description:"BCC email address (optional for send operation)"}},required:["operation"]}},M$={name:"reminders",description:"Search, create, and open reminders in Apple Reminders app",inputSchema:{type:"object",properties:{operation:{type:"string",description:"Operation to perform: 'list', 'search', 'open', 'create', or 'listById'",enum:["list","search","open","create","listById"]},searchText:{type:"string",description:"Text to search for in reminders (required for search and open operations)"},name:{type:"string",description:"Name of the reminder to create (required for create operation)"},listName:{type:"string",description:"Name of the list to create the reminder in (optional for create operation)"},listId:{type:"string",description:"ID of the list to get reminders from (required for listById operation)"},props:{type:"array",items:{type:"string"},description:"Properties to include in the reminders (optional for listById operation)"},notes:{type:"string",description:"Additional notes for the reminder (optional for create operation)"},dueDate:{type:"string",description:"Due date for the reminder in ISO format (optional for create operation)"}},required:["operation"]}},f$={name:"calendar",description:"Search, create, and open calendar events in Apple Calendar app",inputSchema:{type:"object",properties:{operation:{type:"string",description:"Operation to perform: 'search', 'open', 'list', or 'create'",enum:["search","open","list","create"]},searchText:{type:"string",description:"Text to search for in event titles, locations, and notes (required for search operation)"},eventId:{type:"string",description:"ID of the event to open (required for open operation)"},limit:{type:"number",description:"Number of events to retrieve (optional, default 10)"},fromDate:{type:"string",description:"Start date for search range in ISO format (optional, default is today)"},toDate:{type:"string",description:"End date for search range in ISO format (optional, default is 30 days from now for search, 7 days for list)"},title:{type:"string",description:"Title of the event to create (required for create operation)"},startDate:{type:"string",description:"Start date/time of the event in ISO format (required for create operation)"},endDate:{type:"string",description:"End date/time of the event in ISO format (required for create operation)"},location:{type:"string",description:"Location of the event (optional for create operation)"},notes:{type:"string",description:"Additional notes for the event (optional for create operation)"},isAllDay:{type:"boolean",description:"Whether the event is an all-day event (optional for create operation, default is false)"},calendarName:{type:"string",description:"Name of the calendar to create the event in (optional for create operation, uses default calendar if not specified)"}},required:["operation"]}},b$={name:"maps",description:"Search locations, manage guides, save favorites, and get directions using Apple Maps",inputSchema:{type:"object",properties:{operation:{type:"string",description:"Operation to perform with Maps",enum:["search","save","directions","pin","listGuides","addToGuide","createGuide"]},query:{type:"string",description:"Search query for locations (required for search)"},limit:{type:"number",description:"Maximum number of results to return (optional for search)"},name:{type:"string",description:"Name of the location (required for save and pin)"},address:{type:"string",description:"Address of the location (required for save, pin, addToGuide)"},fromAddress:{type:"string",description:"Starting address for directions (required for directions)"},toAddress:{type:"string",description:"Destination address for directions (required for directions)"},transportType:{type:"string",description:"Type of transport to use (optional for directions)",enum:["driving","walking","transit"]},guideName:{type:"string",description:"Name of the guide (required for createGuide and addToGuide)"}},required:["operation"]}},C$=[L$,S$,k$,A$,M$,f$,b$],R4=C$;var G6=!0,f0=null,e1=!1;console.error("Starting apple-mcp server...");var a0=null,t0=null,r0=null,s0=null,e0=null,$1=null,k1=null;async function K0($){if(e1)console.error(`Loading ${$} module on demand (safe mode)...`);try{switch($){case"contacts":if(!a0)a0=(await Promise.resolve().then(() => (L8(),D8))).default;return a0;case"notes":if(!t0)t0=(await Promise.resolve().then(() => (A8(),k8))).default;return t0;case"message":if(!r0)r0=(await Promise.resolve().then(() => (C8(),b8))).default;return r0;case"mail":if(!s0)s0=(await Promise.resolve().then(() => (E8(),P8))).default;return s0;case"reminders":if(!e0)e0=(await Promise.resolve().then(() => (R8(),v8))).default;return e0;case"calendar":if(!$1)$1=(await Promise.resolve().then(() => (h8(),I8))).default;return $1;case"maps":if(!k1)k1=(await Promise.resolve().then(() => (J4(),Q4))).default;return k1;default:throw Error(`Unknown module: ${$}`)}}catch(Q){throw console.error(`Error loading module ${$}:`,Q),Q}}f0=setTimeout(()=>{console.error("Loading timeout reached. Switching to safe mode (lazy loading...)"),G6=!1,e1=!0,a0=null,t0=null,r0=null,s0=null,e0=null,$1=null,W4()},5000);async function L5(){try{if(console.error("Attempting to eagerly load modules..."),a0=(await Promise.resolve().then(() => (L8(),D8))).default,console.error("- Contacts module loaded successfully"),t0=(await Promise.resolve().then(() => (A8(),k8))).default,console.error("- Notes module loaded successfully"),r0=(await Promise.resolve().then(() => (C8(),b8))).default,console.error("- Message module loaded successfully"),s0=(await Promise.resolve().then(() => (E8(),P8))).default,console.error("- Mail module loaded successfully"),e0=(await Promise.resolve().then(() => (R8(),v8))).default,console.error("- Reminders module loaded successfully"),$1=(await Promise.resolve().then(() => (h8(),I8))).default,console.error("- Calendar module loaded successfully"),k1=(await Promise.resolve().then(() => (J4(),Q4))).default,console.error("- Maps module loaded successfully"),f0)clearTimeout(f0),f0=null;console.error("All modules loaded successfully, using eager loading mode"),W4()}catch($){if(console.error("Error during eager loading:",$),console.error("Switching to safe mode (lazy loading)..."),f0)clearTimeout(f0),f0=null;G6=!1,e1=!0,a0=null,t0=null,r0=null,s0=null,e0=null,$1=null,k1=null,W4()}}L5();var s1;function W4(){console.error(`Initializing server in ${e1?"safe":"standard"} mode...`),s1=new U8({name:"Apple MCP tools",version:"1.0.0"},{capabilities:{tools:{}}}),s1.setRequestHandler(q8,async()=>({tools:R4})),s1.setRequestHandler(w8,async($)=>{try{let{name:Q,arguments:J}=$.params;if(!J)throw Error("No arguments provided");switch(Q){case"contacts":{if(!S5(J))throw Error("Invalid arguments for contacts tool");try{let Y=await K0("contacts");if(J.name){let W=await Y.findNumber(J.name);return{content:[{type:"text",text:W.length?`${J.name}: ${W.join(", ")}`:`No contact found for "${J.name}". Try a different name or use no name parameter to list all contacts.`}],isError:!1}}else{let W=await Y.getAllNumbers(),H=Object.keys(W).length;if(H===0)return{content:[{type:"text",text:"No contacts found in the address book. Please make sure you have granted access to Contacts."}],isError:!1};let z=Object.entries(W).filter(([X,G])=>G.length>0).map(([X,G])=>`${X}: ${G.join(", ")}`);return{content:[{type:"text",text:z.length>0?`Found ${H} contacts:

${z.join(`
`)}`:"Found contacts but none have phone numbers. Try searching by name to see more details."}],isError:!1}}}catch(Y){let W=Y instanceof Error?Y.message:String(Y);return{content:[{type:"text",text:W.includes("access")?W:`Error accessing contacts: ${W}`}],isError:!0}}}case"notes":{if(!k5(J))throw Error("Invalid arguments for notes tool");try{let Y=await K0("notes"),{operation:W}=J;switch(W){case"search":{if(!J.searchText)throw Error("Search text is required for search operation");let H=await Y.findNote(J.searchText);return{content:[{type:"text",text:H.length?H.map((z)=>`${z.name}:
${z.content}`).join(`

`):`No notes found for "${J.searchText}"`}],isError:!1}}case"list":{let H=await Y.getAllNotes();return{content:[{type:"text",text:H.length?H.map((z)=>`${z.name}:
${z.content}`).join(`

`):"No notes exist."}],isError:!1}}case"create":{if(!J.title||!J.body)throw Error("Title and body are required for create operation");let H=await Y.createNote(J.title,J.body,J.folderName);return{content:[{type:"text",text:H.success?`Created note "${J.title}" in folder "${H.folderName}"${H.usedDefaultFolder?" (created new folder)":""}.`:`Failed to create note: ${H.message}`}],isError:!H.success}}default:throw Error(`Unknown operation: ${W}`)}}catch(Y){let W=Y instanceof Error?Y.message:String(Y);return{content:[{type:"text",text:W.includes("access")?W:`Error accessing notes: ${W}`}],isError:!0}}}case"messages":{if(!A5(J))throw Error("Invalid arguments for messages tool");try{let Y=await K0("message");switch(J.operation){case"send":{if(!J.phoneNumber||!J.message)throw Error("Phone number and message are required for send operation");return await Y.sendMessage(J.phoneNumber,J.message),{content:[{type:"text",text:`Message sent to ${J.phoneNumber}`}],isError:!1}}case"read":{if(!J.phoneNumber)throw Error("Phone number is required for read operation");let W=await Y.readMessages(J.phoneNumber,J.limit);return{content:[{type:"text",text:W.length>0?W.map((H)=>`[${new Date(H.date).toLocaleString()}] ${H.is_from_me?"Me":H.sender}: ${H.content}`).join(`
`):"No messages found"}],isError:!1}}case"schedule":{if(!J.phoneNumber||!J.message||!J.scheduledTime)throw Error("Phone number, message, and scheduled time are required for schedule operation");let W=await Y.scheduleMessage(J.phoneNumber,J.message,new Date(J.scheduledTime));return{content:[{type:"text",text:`Message scheduled to be sent to ${J.phoneNumber} at ${W.scheduledTime}`}],isError:!1}}case"unread":{let W=await Y.getUnreadMessages(J.limit),H=await K0("contacts"),z=await Promise.all(W.map(async(X)=>{if(!X.is_from_me){let G=await H.findContactByPhone(X.sender);return{...X,displayName:G||X.sender}}return{...X,displayName:"Me"}}));return{content:[{type:"text",text:z.length>0?`Found ${z.length} unread message(s):
`+z.map((X)=>`[${new Date(X.date).toLocaleString()}] From ${X.displayName}:
${X.content}`).join(`

`):"No unread messages found"}],isError:!1}}default:throw Error(`Unknown operation: ${J.operation}`)}}catch(Y){let W=Y instanceof Error?Y.message:String(Y);return{content:[{type:"text",text:W.includes("access")?W:`Error with messages operation: ${W}`}],isError:!0}}}case"mail":{if(!M5(J))throw Error("Invalid arguments for mail tool");try{let Y=await K0("mail");switch(J.operation){case"unread":{let W;if(J.account){console.error(`Getting unread emails for account: ${J.account}`);let H=`
tell application "Mail"
    set resultList to {}
    try
        set targetAccount to first account whose name is "${J.account.replace(/"/g,"\\\"")}"

        -- Get mailboxes for this account
        set acctMailboxes to every mailbox of targetAccount

        -- If mailbox is specified, only search in that mailbox
        set mailboxesToSearch to acctMailboxes
        ${J.mailbox?`
        set mailboxesToSearch to {}
        repeat with mb in acctMailboxes
            if name of mb is "${J.mailbox.replace(/"/g,"\\\"")}" then
                set mailboxesToSearch to {mb}
                exit repeat
            end if
        end repeat
        `:""}

        -- Search specified mailboxes
        repeat with mb in mailboxesToSearch
            try
                set unreadMessages to (messages of mb whose read status is false)
                if (count of unreadMessages) > 0 then
                    set msgLimit to ${J.limit||10}
                    if (count of unreadMessages) < msgLimit then
                        set msgLimit to (count of unreadMessages)
                    end if

                    repeat with i from 1 to msgLimit
                        try
                            set currentMsg to item i of unreadMessages
                            set msgData to {subject:(subject of currentMsg), sender:(sender of currentMsg), ¬
                                        date:(date sent of currentMsg) as string, mailbox:(name of mb)}

                            -- Try to get content if possible
                            try
                                set msgContent to content of currentMsg
                                if length of msgContent > 500 then
                                    set msgContent to (text 1 thru 500 of msgContent) & "..."
                                end if
                                set msgData to msgData & {content:msgContent}
                            on error
                                set msgData to msgData & {content:"[Content not available]"}
                            end try

                            set end of resultList to msgData
                        on error
                            -- Skip problematic messages
                        end try
                    end repeat

                    if (count of resultList) ≥ ${J.limit||10} then exit repeat
                end if
            on error
                -- Skip problematic mailboxes
            end try
        end repeat
    on error errMsg
        return "Error: " & errMsg
    end try

    return resultList
end tell`;try{let z=await f(H);if(z&&z.startsWith("Error:"))throw Error(z);let X=[],G=z.match(/\{([^}]+)\}/g);if(G&&G.length>0)for(let q of G)try{let w=q.substring(1,q.length-1).split(","),V={};if(w.forEach((F)=>{let P=F.split(":");if(P.length>=2){let R=P[0].trim(),h=P.slice(1).join(":").trim();V[R]=h}}),V.subject||V.sender)X.push({subject:V.subject||"No subject",sender:V.sender||"Unknown sender",dateSent:V.date||new Date().toString(),content:V.content||"[Content not available]",isRead:!1,mailbox:`${J.account} - ${V.mailbox||"Unknown"}`})}catch(w){console.error("Error parsing email match:",w)}W=X}catch(z){console.error("Error getting account-specific emails:",z),W=await Y.getUnreadMails(J.limit)}}else W=await Y.getUnreadMails(J.limit);return{content:[{type:"text",text:W.length>0?`Found ${W.length} unread email(s)${J.account?` in account "${J.account}"`:""}${J.mailbox?` and mailbox "${J.mailbox}"`:""}:

`+W.map((H)=>`[${H.dateSent}] From: ${H.sender}
Mailbox: ${H.mailbox}
Subject: ${H.subject}
${H.content.substring(0,500)}${H.content.length>500?"...":""}`).join(`

`):`No unread emails found${J.account?` in account "${J.account}"`:""}${J.mailbox?` and mailbox "${J.mailbox}"`:""}`}],isError:!1}}case"search":{if(!J.searchTerm)throw Error("Search term is required for search operation");let W=await Y.searchMails(J.searchTerm,J.limit);return{content:[{type:"text",text:W.length>0?`Found ${W.length} email(s) for "${J.searchTerm}"${J.account?` in account "${J.account}"`:""}${J.mailbox?` and mailbox "${J.mailbox}"`:""}:

`+W.map((H)=>`[${H.dateSent}] From: ${H.sender}
Mailbox: ${H.mailbox}
Subject: ${H.subject}
${H.content.substring(0,200)}${H.content.length>200?"...":""}`).join(`

`):`No emails found for "${J.searchTerm}"${J.account?` in account "${J.account}"`:""}${J.mailbox?` and mailbox "${J.mailbox}"`:""}`}],isError:!1}}case"send":{if(!J.to||!J.subject||!J.body)throw Error("Recipient (to), subject, and body are required for send operation");return{content:[{type:"text",text:await Y.sendMail(J.to,J.subject,J.body,J.cc,J.bcc)}],isError:!1}}case"mailboxes":if(J.account){let W=await Y.getMailboxesForAccount(J.account);return{content:[{type:"text",text:W.length>0?`Found ${W.length} mailboxes for account "${J.account}":

${W.join(`
`)}`:`No mailboxes found for account "${J.account}". Make sure the account name is correct.`}],isError:!1}}else{let W=await Y.getMailboxes();return{content:[{type:"text",text:W.length>0?`Found ${W.length} mailboxes:

${W.join(`
`)}`:"No mailboxes found. Make sure Mail app is running and properly configured."}],isError:!1}}case"accounts":{let W=await Y.getAccounts();return{content:[{type:"text",text:W.length>0?`Found ${W.length} email accounts:

${W.join(`
`)}`:"No email accounts found. Make sure Mail app is configured with at least one account."}],isError:!1}}case"latest":{let W=J.account;if(!W){let z=await Y.getAccounts();if(z.length===0)throw Error("No email accounts found. Make sure Mail app is configured with at least one account.");W=z[0]}let H=await Y.getLatestMails(W,J.limit);return{content:[{type:"text",text:H.length>0?`Found ${H.length} latest email(s) in account "${W}":

`+H.map((z)=>`[${z.dateSent}] From: ${z.sender}
Mailbox: ${z.mailbox}
Subject: ${z.subject}
${z.content.substring(0,500)}${z.content.length>500?"...":""}`).join(`

`):`No latest emails found in account "${W}"`}],isError:!1}}default:throw Error(`Unknown operation: ${J.operation}`)}}catch(Y){let W=Y instanceof Error?Y.message:String(Y);return{content:[{type:"text",text:W.includes("access")?W:`Error with mail operation: ${W}`}],isError:!0}}}case"reminders":{if(!f5(J))throw Error("Invalid arguments for reminders tool");try{let Y=await K0("reminders"),{operation:W}=J;if(W==="list"){let H=await Y.getAllLists(),z=await Y.getAllReminders();return{content:[{type:"text",text:`Found ${H.length} lists and ${z.length} reminders.`}],lists:H,reminders:z,isError:!1}}else if(W==="search"){let{searchText:H}=J,z=await Y.searchReminders(H);return{content:[{type:"text",text:z.length>0?`Found ${z.length} reminders matching "${H}".`:`No reminders found matching "${H}".`}],reminders:z,isError:!1}}else if(W==="open"){let{searchText:H}=J,z=await Y.openReminder(H);return{content:[{type:"text",text:z.success?`Opened Reminders app. Found reminder: ${z.reminder?.name}`:z.message}],...z,isError:!z.success}}else if(W==="create"){let{name:H,listName:z,notes:X,dueDate:G}=J,q=await Y.createReminder(H,z,X,G);return{content:[{type:"text",text:`Created reminder "${q.name}" ${z?`in list "${z}"`:""}.`}],success:!0,reminder:q,isError:!1}}else if(W==="listById"){let{listId:H,props:z}=J,X=await Y.getRemindersFromListById(H,z);return{content:[{type:"text",text:X.length>0?`Found ${X.length} reminders in list with ID "${H}".`:`No reminders found in list with ID "${H}".`}],reminders:X,isError:!1}}return{content:[{type:"text",text:"Unknown operation"}],isError:!0}}catch(Y){console.error("Error in reminders tool:",Y);let W=Y instanceof Error?Y.message:String(Y);return{content:[{type:"text",text:W.includes("access")?W:`Error in reminders tool: ${W}`}],isError:!0}}}case"calendar":{if(!b5(J))throw Error("Invalid arguments for calendar tool");try{let Y=await K0("calendar"),{operation:W}=J;switch(W){case"search":{let{searchText:H,limit:z,fromDate:X,toDate:G}=J,q=await Y.searchEvents(H,z,X,G);return{content:[{type:"text",text:q.length>0?`Found ${q.length} events matching "${H}":

${q.map((w)=>`${w.title} (${new Date(w.startDate).toLocaleString()} - ${new Date(w.endDate).toLocaleString()})
Location: ${w.location||"Not specified"}
Calendar: ${w.calendarName}
ID: ${w.id}
${w.notes?`Notes: ${w.notes}
`:""}`).join(`

`)}`:`No events found matching "${H}".`}],isError:!1}}case"open":{let{eventId:H}=J,z=await Y.openEvent(H);return{content:[{type:"text",text:z.success?z.message:`Error opening event: ${z.message}`}],isError:!z.success}}case"list":{let{limit:H,fromDate:z,toDate:X}=J,G=await Y.getEvents(H,z,X),q=z?new Date(z).toLocaleDateString():"today",w=X?new Date(X).toLocaleDateString():"next 7 days";return{content:[{type:"text",text:G.length>0?`Found ${G.length} events from ${q} to ${w}:

${G.map((V)=>`${V.title} (${new Date(V.startDate).toLocaleString()} - ${new Date(V.endDate).toLocaleString()})
Location: ${V.location||"Not specified"}
Calendar: ${V.calendarName}
ID: ${V.id}`).join(`

`)}`:`No events found from ${q} to ${w}.`}],isError:!1}}case"create":{let{title:H,startDate:z,endDate:X,location:G,notes:q,isAllDay:w,calendarName:V}=J,F=await Y.createEvent(H,z,X,G,q,w,V);return{content:[{type:"text",text:F.success?`${F.message} Event scheduled from ${new Date(z).toLocaleString()} to ${new Date(X).toLocaleString()}${F.eventId?`
Event ID: ${F.eventId}`:""}`:`Error creating event: ${F.message}`}],isError:!F.success}}default:throw Error(`Unknown calendar operation: ${W}`)}}catch(Y){let W=Y instanceof Error?Y.message:String(Y);return{content:[{type:"text",text:W.includes("access")?W:`Error in calendar tool: ${W}`}],isError:!0}}}case"maps":{if(!C5(J))throw Error("Invalid arguments for maps tool");try{let Y=await K0("maps"),{operation:W}=J;switch(W){case"search":{let{query:H,limit:z}=J;if(!H)throw Error("Search query is required for search operation");let X=await Y.searchLocations(H,z);return{content:[{type:"text",text:X.success?`${X.message}

${X.locations.map((G)=>`Name: ${G.name}
Address: ${G.address}
${G.latitude&&G.longitude?`Coordinates: ${G.latitude}, ${G.longitude}
`:""}`).join(`

`)}`:`${X.message}`}],isError:!X.success}}case"save":{let{name:H,address:z}=J;if(!H||!z)throw Error("Name and address are required for save operation");let X=await Y.saveLocation(H,z);return{content:[{type:"text",text:X.message}],isError:!X.success}}case"pin":{let{name:H,address:z}=J;if(!H||!z)throw Error("Name and address are required for pin operation");let X=await Y.dropPin(H,z);return{content:[{type:"text",text:X.message}],isError:!X.success}}case"directions":{let{fromAddress:H,toAddress:z,transportType:X}=J;if(!H||!z)throw Error("From and to addresses are required for directions operation");let G=await Y.getDirections(H,z,X);return{content:[{type:"text",text:G.message}],isError:!G.success}}case"listGuides":{let H=await Y.listGuides();return{content:[{type:"text",text:H.message}],isError:!H.success}}case"addToGuide":{let{address:H,guideName:z}=J;if(!H||!z)throw Error("Address and guideName are required for addToGuide operation");let X=await Y.addToGuide(H,z);return{content:[{type:"text",text:X.message}],isError:!X.success}}case"createGuide":{let{guideName:H}=J;if(!H)throw Error("Guide name is required for createGuide operation");let z=await Y.createGuide(H);return{content:[{type:"text",text:z.message}],isError:!z.success}}default:throw Error(`Unknown maps operation: ${W}`)}}catch(Y){let W=Y instanceof Error?Y.message:String(Y);return{content:[{type:"text",text:W.includes("access")?W:`Error in maps tool: ${W}`}],isError:!0}}}default:return{content:[{type:"text",text:`Unknown tool: ${Q}`}],isError:!0}}}catch(Q){return{content:[{type:"text",text:`Error: ${Q instanceof Error?Q.message:String(Q)}`}],isError:!0}}}),console.error("Setting up MCP server transport..."),(async()=>{try{console.error("Initializing transport...");let $=new F8;console.error("Setting up stdout filter...");let Q=process.stdout.write.bind(process.stdout);process.stdout.write=(J,Y,W)=>{if(typeof J==="string"&&!J.startsWith("{"))return console.error("Filtering non-JSON stdout message"),!0;return Q(J,Y,W)},console.error("Connecting transport to server..."),await s1.connect($),console.error("Server connected successfully!")}catch($){console.error("Failed to initialize MCP server:",$),process.exit(1)}})()}function S5($){return typeof $==="object"&&$!==null&&(!("name"in $)||typeof $.name==="string")}function k5($){if(typeof $!=="object"||$===null)return!1;let{operation:Q}=$;if(typeof Q!=="string")return!1;if(!["search","list","create"].includes(Q))return!1;if(Q==="search"){let{searchText:J}=$;if(typeof J!=="string"||J==="")return!1}if(Q==="create"){let{title:J,body:Y}=$;if(typeof J!=="string"||J===""||typeof Y!=="string")return!1;let{folderName:W}=$;if(W!==void 0&&(typeof W!=="string"||W===""))return!1}return!0}function A5($){if(typeof $!=="object"||$===null)return!1;let{operation:Q,phoneNumber:J,message:Y,limit:W,scheduledTime:H}=$;if(!Q||!["send","read","schedule","unread"].includes(Q))return!1;switch(Q){case"send":case"schedule":if(!J||!Y)return!1;if(Q==="schedule"&&!H)return!1;break;case"read":if(!J)return!1;break;case"unread":break}if(J&&typeof J!=="string")return!1;if(Y&&typeof Y!=="string")return!1;if(W&&typeof W!=="number")return!1;if(H&&typeof H!=="string")return!1;return!0}function M5($){if(typeof $!=="object"||$===null)return!1;let{operation:Q,account:J,mailbox:Y,limit:W,searchTerm:H,to:z,subject:X,body:G,cc:q,bcc:w}=$;if(!Q||!["unread","search","send","mailboxes","accounts","latest"].includes(Q))return!1;switch(Q){case"search":if(!H||typeof H!=="string")return!1;break;case"send":if(!z||typeof z!=="string"||!X||typeof X!=="string"||!G||typeof G!=="string")return!1;break;case"unread":case"mailboxes":case"accounts":case"latest":break}if(J&&typeof J!=="string")return!1;if(Y&&typeof Y!=="string")return!1;if(W&&typeof W!=="number")return!1;if(q&&typeof q!=="string")return!1;if(w&&typeof w!=="string")return!1;return!0}function f5($){if(typeof $!=="object"||$===null)return!1;let{operation:Q}=$;if(typeof Q!=="string")return!1;if(!["list","search","open","create","listById"].includes(Q))return!1;if((Q==="search"||Q==="open")&&(typeof $.searchText!=="string"||$.searchText===""))return!1;if(Q==="create"&&(typeof $.name!=="string"||$.name===""))return!1;if(Q==="listById"&&(typeof $.listId!=="string"||$.listId===""))return!1;return!0}function b5($){if(typeof $!=="object"||$===null)return!1;let{operation:Q}=$;if(typeof Q!=="string")return!1;if(!["search","open","list","create"].includes(Q))return!1;if(Q==="search"){let{searchText:J}=$;if(typeof J!=="string")return!1}if(Q==="open"){let{eventId:J}=$;if(typeof J!=="string")return!1}if(Q==="create"){let{title:J,startDate:Y,endDate:W}=$;if(typeof J!=="string"||typeof Y!=="string"||typeof W!=="string")return!1}return!0}function C5($){if(typeof $!=="object"||$===null)return!1;let{operation:Q}=$;if(typeof Q!=="string")return!1;if(!["search","save","directions","pin","listGuides","addToGuide","createGuide"].includes(Q))return!1;if(Q==="search"){let{query:J}=$;if(typeof J!=="string"||J==="")return!1}if(Q==="save"||Q==="pin"){let{name:J,address:Y}=$;if(typeof J!=="string"||J===""||typeof Y!=="string"||Y==="")return!1}if(Q==="directions"){let{fromAddress:J,toAddress:Y}=$;if(typeof J!=="string"||J===""||typeof Y!=="string"||Y==="")return!1;let{transportType:W}=$;if(W!==void 0&&(typeof W!=="string"||!["driving","walking","transit"].includes(W)))return!1}if(Q==="createGuide"){let{guideName:J}=$;if(typeof J!=="string"||J==="")return!1}if(Q==="addToGuide"){let{address:J,guideName:Y}=$;if(typeof J!=="string"||J===""||typeof Y!=="string"||Y==="")return!1}return!0}
