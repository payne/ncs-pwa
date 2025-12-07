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

## 5. Configure Database Rules (Important!)

For development, you can use these permissive rules. **IMPORTANT: Secure these before going to production!**

1. In Firebase Console, go to "Realtime Database"
2. Click on the "Rules" tab
3. Replace the rules with:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

**For production**, use more secure rules like:

```json
{
  "rules": {
    "nets": {
      "$netId": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

## 6. Test Your Setup

1. Run your application: `npm start`
2. Navigate to NET Assignments
3. Click "Create New NET"
4. Enter a NET name
5. Add an assignment
6. Open the same app in another browser or incognito window
7. Select the same NET
8. You should see the assignment appear in real-time!

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
