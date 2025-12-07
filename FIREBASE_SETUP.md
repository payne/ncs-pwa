# Firebase Setup Instructions

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter a project name (e.g., "NCS PWA")
   1. Called it ANET (for ARES NET or just "a net")
4. Follow the setup wizard

## 2. Enable Realtime Database

1. In your Firebase project, click on "Realtime Database" in the left menu
2. Click "Create Database"
3. Choose a location (e.g., us-central1)
4. Start in **test mode** for now (you can secure it later)
   1. Oops!  Chose lockdown mode not test mode.
5. Click "Enable"

## 3. Get Your Firebase Configuration

1. In the Firebase Console, click on the gear icon next to "Project Overview"
2. Click "Project settings"
3. Scroll down to "Your apps" section
4. Click on the web icon `</>` to add a web app
5. Register your app with a nickname (e.g., "NCS PWA Web")
6. Copy the `firebaseConfig` object

## 4. Update Your Environment File

Open `src/environments/environment.ts` and replace the placeholder values with your actual Firebase configuration:

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "your-project-id.firebaseapp.com",
    databaseURL: "https://your-project-id-default-rtdb.firebaseio.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
  }
};
```

## 5. Enable Google Authentication

1. In Firebase Console, click on "Authentication" in the left menu
2. Click "Get started" if you haven't enabled Authentication yet
3. Click on the "Sign-in method" tab
4. Click on "Google" in the providers list
5. Toggle "Enable"
6. Select a support email (your email)
7. Click "Save"

## 6. Configure Database Rules (IMPORTANT!)

Now that authentication is enabled, you need to secure your database to require authentication:

1. In Firebase Console, go to "Realtime Database"
2. Click on the "Rules" tab
3. Replace the rules with:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

This ensures that only authenticated users can read and write data.

**What this means:**
- `auth != null` - Only authenticated users (signed in with Google) can access the database
- Anyone with a Google/Gmail account can sign in and use the app
- Data is protected from unauthenticated access

## 7. Test Your Setup

1. Run your application: `npm start`
2. You should be redirected to the login page
3. Click "Sign in with Google"
4. Sign in with your Google account
5. You'll be redirected to NET Assignments
6. Click "Create New NET"
7. Enter a NET name
8. Add an assignment
9. Open the same app in another browser or incognito window
10. Sign in with the same or different Google account
11. Select the same NET
12. You should see the assignment appear in real-time!
13. Click on your profile picture in the top right to sign out

## Database Structure

Your Firebase Realtime Database will have this structure:

```
nets/
  {netId}/
    name: "NET Name"
    createdAt: timestamp
    assignments/
      {assignmentId}/
        callsign: "KE0ABC"
        timeIn: "14:30"
        name: "John Doe"
        duty: "general"
        milageStart: 0
        classification: "observer"
        timeOut: ""
        milageEnd: 0
```

## Troubleshooting

- **Error: "Permission denied"**: Check your database rules
- **Data not syncing**: Verify your Firebase configuration is correct
- **Can't create NET**: Check browser console for errors and verify database rules
