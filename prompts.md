# Conversation Prompts

## 2025-12-06

### Prompt 1
In this folder, record all of the prompts I give you in a markdown file.

### Prompt 2
Create a progressive web application (PWA) using angular and material. It should be responsive. Create a topBar component that includes: a hamburger menu on the left, a clock on the right and an online/offline indicator to the right of the clock. Major components can be switched to using the hamburger menu. The major components include:
1. NET assignments
2. People (aka operators)
3. Locations
4. Duties
5. About

### Prompt 3
In this folder is a prompts.md file. Record all prompts in this file.

### Prompt 4
The NET assignments component should be a filterable, sortable, angular material table. Above the table is a reactive form that creates a row in the table. New rows are inserted at the top of the table. The form includes fields for:
1. callsign
2. time in
3. name
4. duty
5. milage start
6. Classification

An operator (aka person) can be looked up by their callsign or name. When a partial callsign or name is entered there may be multiple matches. Have a way for the use to choose the person they want to assign. The file public/members.json is the list of operators (aka people).

Each row in the angular material table has columns for each of the six fields. It also has `time out` and `milage end`. There should be a way to delete a row from the table. Each row in the table may be editted in place.

### Prompt 5
In chrome dev console there is an error. The application does not load into the browser. Please fix. This is the error:

Uncaught Error: Could not resolve "@angular/animations/browser" imported by "@angular/platform-browser". Is it installed?
    at optional-peer-dep:__vite-optional-peer-dep:@angular/animations/browser:@angular/platform-browser:false (platform-browser:false:1:27)
