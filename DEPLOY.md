# Deployment Guide

This guide describes the steps for deploying a new version of the NCS PWA application to Firebase.

## Prerequisites

Before deploying, ensure you have:

1. **Firebase CLI installed**
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase authentication**
   ```bash
   firebase login
   ```

3. **Correct Firebase project selected**
   ```bash
   firebase use default
   ```
   This should show: `Now using alias default (anet-b84b5)`

4. **All dependencies installed**
   ```bash
   npm install
   ```

## Pre-Deployment Checklist

Before deploying a new version, complete these steps:

- [ ] All changes are committed to git
- [ ] Code has been tested locally (`npm start`)
- [ ] Production build completes without errors (`npm run build:prod`)
- [ ] All tests pass (if applicable)
- [ ] Database rules are up to date in `database.rules.json`
- [ ] Environment variables are correctly configured in `src/environments/environment.ts`

## Deployment Steps

### Option 1: Using the Deploy Script (Recommended)

The simplest way to deploy is using the pre-configured npm script:

```bash
npm run deploy
```

This command will:
1. Build the application for production (`ng build --configuration production`)
2. Deploy to Firebase Hosting and update database rules

### Option 2: Manual Deployment

If you need more control over the deployment process:

1. **Build the application for production**
   ```bash
   npm run build:prod
   ```
   This creates optimized production files in `dist/ncs-pwa/browser/`

2. **Deploy to Firebase**
   ```bash
   firebase deploy
   ```

### Option 3: Deploy Specific Services

You can deploy individual Firebase services:

**Deploy only hosting:**
```bash
firebase deploy --only hosting
```

**Deploy only database rules:**
```bash
firebase deploy --only database
```

**Deploy multiple services:**
```bash
firebase deploy --only hosting,database
```

## Post-Deployment Verification

After deployment, verify the following:

1. **Visit the live site**
   - URL: https://anet-b84b5.web.app
   - Or: https://anet-b84b5.firebaseapp.com

2. **Test critical functionality**
   - [ ] Login with Google authentication works
   - [ ] Can select/create a NET
   - [ ] Can add assignments
   - [ ] Can view/edit/delete assignments
   - [ ] All menu items work correctly

3. **Check Firebase Console**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select the "anet-b84b5" project
   - Verify hosting deployment in the "Hosting" section
   - Check for any errors in "Functions" or "Database" sections

4. **Monitor for errors**
   - Check browser console for JavaScript errors
   - Monitor Firebase Console for database/auth errors

## Rollback Procedure

If you need to rollback to a previous version:

1. **View deployment history**
   ```bash
   firebase hosting:channel:list
   ```

2. **Rollback to a previous version**
   - Go to Firebase Console → Hosting
   - Find the previous successful deployment
   - Click "..." menu and select "Rollback to this version"

## Common Issues and Solutions

### Build Fails

**Issue:** `ng build` fails with errors

**Solution:**
- Check for TypeScript errors: `ng build`
- Ensure all dependencies are installed: `npm install`
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### Deployment Fails

**Issue:** `firebase deploy` fails with authentication error

**Solution:**
```bash
firebase logout
firebase login
firebase use default
```

**Issue:** Deployment succeeds but site shows old version

**Solution:**
- Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache
- Wait a few minutes for CDN to propagate

### Database Rules Not Updating

**Issue:** Database rules don't seem to update after deployment

**Solution:**
```bash
firebase deploy --only database
```
Check `database.rules.json` for syntax errors before deploying.

## Environment-Specific Deployments

### Development/Testing Environment

For testing purposes, you can use Firebase Hosting channels:

```bash
# Create a preview channel
firebase hosting:channel:deploy preview-feature-name

# This will give you a URL like:
# https://anet-b84b5--preview-feature-name-xxxxx.web.app
```

### Production Environment

Always deploy to production using:
```bash
npm run deploy
```

## Build Configuration

The production build is configured in `angular.json` with these optimizations:

- Minification and uglification of JavaScript
- CSS optimization
- AOT (Ahead-of-Time) compilation
- Tree shaking to remove unused code
- Source maps for debugging (if configured)

Build output directory: `dist/ncs-pwa/browser/`

## Firebase Project Information

- **Project ID:** anet-b84b5
- **Project Name:** ANET (ARES NET)
- **Hosting URL:** https://anet-b84b5.web.app
- **Services Used:**
  - Firebase Hosting
  - Firebase Realtime Database
  - Firebase Authentication (Google Sign-In)

## Additional Resources

- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [Angular Build Documentation](https://angular.io/guide/build)
- Initial setup instructions: See `FIREBASE_SETUP.md`

## Support

For issues with:
- **Firebase deployment:** Check Firebase Console and logs
- **Build errors:** Review Angular CLI output
- **Application errors:** Check browser console and Firebase error logs
