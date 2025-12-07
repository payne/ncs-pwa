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

### Prompt 6
Change the add new assignment form:
1. Make the fields go from left to right mimicing a row in the angular material table.
2. Make time in autopopulate to the current time.
3. Duty should be a drop down from five canned duties: general, lead, scout, floater, and unassigned
4. Classification should be a drop down from four canned values: full, partial, new, and observer

### Prompt 7
The six fields of the add new assignment form should go left to right instead of down. The length of each field should be much smaller so that it responsively only takes one row on the page.

### Prompt 8
The orientation of the form is still up to down instead of left to right. fix it.

### Prompt 9
Duty should default to unassigned. Milage start to 0. classification to observer.

### Prompt 10
add an action to the table rows called checkout. It will update the time out field.

### Prompt 11
Assignments does not show up when clicking the hamburger menu. Please fix.

### Prompt 12
Use localstorage so when the user navigates away from ncs-net-assignments and then returns to ncs-net-assignments data in the angular material table is not lost.

### Prompt 13
add firebase to the project. Many different web browsers may be working with the same NET. All NETs have a unique ID and a set of assignments for that NET. When one browser updates or adds an assignment the change is reflected in all the browsers.

### Prompt 14
Here's what happens when I do a `npm start`

❯ npm start

> ncs-pwa@0.0.0 start
> ng serve

Application bundle generation failed. [1.913 seconds] - 2025-12-07T01:31:03.064Z

✘ [ERROR] TS2790: The operand of a 'delete' operator must be optional. [plugin angular-compiler]

    src/app/_services/firebase.service.ts:58:11:
      58 │     delete assignmentWithoutId.id;
         ╵            ~~~~~~~~~~~~~~~~~~~~~~

### Prompt 15
Should the .firebase directory be in .gitignore?

### Prompt 16
Things work locally on http://localhost:4200 when I run `npm start` but do not work when deployed to firebase hosting. The URL is https://anet-b84b5.web.app/ My guess is authentication needs to be added. Set it up so anyone with a gmail address may use all aspects of the application.

### Prompt 17
when I run `npm run build` I get this error: bundle initial exceeded maximum budget. Budget 1.00 MB was not met by 176.42 kB with a total of 1.18 MB.

### Prompt 18
Add a script to package.json that does what `npm run build` does but puts the files in the public folder so that when I run `firebase deploy` the new version of the application is deployed.

### Prompt 19
Chrome dev console now has this error:
```
installHook.js:1 ERROR FirebaseError: Firebase: No Firebase App '[DEFAULT]' has been created - call initializeApp() first (app/no-app).
```
please fix it

### Prompt 20
Progress! But when I click the `Sign in with google` button a dialog very briefly appears and then there is this error in chrome dev tools console:

```
GET https://identitytoolkit.googleapis.com/v1/projects?key=AIzaSyDEHZPiUMPJd_1Mmp25rOgpm1VFBqNeT7I 400 (Bad Request)
Error signing in with Google: FirebaseError: Firebase: Error (auth/configuration-not-found).
```
Please fix it

### Prompt 21
It's working: thank you. Are any of the values in `src/environments` sensitive or is it ok to put it in a public github repo?

### Prompt 22
Add a logout item to the hamburger menu just above about

### Prompt 23
At the bottom of the text in the ncs-about component should be a note that this code is under the Apache 2.0 License. And that the source code is available at https://github.com/payne/ncs-pwa
