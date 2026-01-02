# Firebase Setup Guide for GradeHub

## Overview
This guide covers the Firebase configuration and deployment process for the GradeHub project.

## Firebase Project Details

**Project Name:** gradehub-beltran  
**Auth Domain:** gradehub-beltran.firebaseapp.com  
**Project ID:** gradehub-beltran  

## Configuration

The Firebase configuration is already set up in the following files:

### 1. **src/lib/firebase.ts**
- Initializes Firebase with Authentication, Firestore, and Storage
- Uses environment variables for configuration
- Exports auth, db, and storage instances

### 2. **.env.local**
- Contains all public Firebase credentials
- **⚠️ IMPORTANT:** Keep this file private - add to .gitignore
- Credentials shown:
  - API Key: AIzaSyABHS1sA2fprqrnkD1iR2GelXh4oN3nWOs
  - Auth Domain: gradehub-beltran.firebaseapp.com
  - Project ID: gradehub-beltran
  - Storage Bucket: gradehub-beltran.firebasestorage.app
  - Messaging Sender ID: 313204491488
  - App ID: 1:313204491488:web:2cfaa051c44baa9e03bc85

## Installation Steps

### 1. Install Firebase Tools (if not already installed)
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```
This opens a browser window to authenticate with your Google account.

### 3. Connect Project (if needed)
```bash
firebase init
```
Select the following when prompted:
- Authentication
- Firestore Database
- Storage
- Hosting (optional)

### 4. Install Firebase SDK in Your Project
```bash
npm install firebase
```

## Authentication Setup

### Email/Password Authentication
Already configured in Firebase Console. Users can sign up and log in using credentials.

### Google Authentication
To enable Google Sign-In:
1. Go to Firebase Console > Authentication > Sign-in method
2. Enable Google provider
3. Add authorized JavaScript origins:
   - http://localhost:3000
   - Your production domain

### OAuth Configuration
Google OAuth is integrated in:
- Login Page: `src/app/login/page.tsx`
- Registration Page: `src/app/register/page.tsx`

## Firestore Database Structure

```
users/
├── {userId}/
│   ├── email: string
│   ├── firstName: string
│   ├── lastName: string
│   ├── role: 'student' | 'faculty' | 'registrar' | 'admin'
│   ├── department: string
│   └── createdAt: timestamp

grades/
├── {gradeId}/
│   ├── courseId: string
│   ├── studentId: string
│   ├── grade: string
│   ├── score: number
│   ├── status: 'draft' | 'submitted' | 'approved'
│   └── submittedAt: timestamp

courses/
├── {courseId}/
│   ├── name: string
│   ├── code: string
│   ├── semester: string
│   └── instructor: string
```

## Storage Structure

```
users/{userId}/
├── profile-picture.jpg

documents/{courseId}/
├── {documentName}
```

## Security Rules

### Firestore Security Rules
```javascript
// Only authenticated users can access their own data
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{document=**} {
      allow read, write: if request.auth.uid == document.uid;
    }
    match /grades/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.role != null;
    }
  }
}
```

### Storage Security Rules
```javascript
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{uid}/{allPaths=**} {
      allow read, write: if request.auth.uid == uid;
    }
  }
}
```

## Deployment

### Deploy to Firebase Hosting
```bash
firebase deploy --only hosting
```

### Deploy Functions (if using Cloud Functions)
```bash
firebase deploy --only functions
```

### Deploy All
```bash
firebase deploy
```

## Environment Variables

All Firebase credentials are stored in `.env.local`. This file should:
- ✅ Be added to `.gitignore`
- ✅ Be kept private
- ✅ Use NEXT_PUBLIC_ prefix for client-side variables
- ❌ Never be committed to version control

## Testing

### Test Email/Password Auth
- Login Page: http://localhost:3000/login
- Register Page: http://localhost:3000/register

### Test Google Auth
- Click "Continue with Google" button
- Complete Google authentication flow

## Troubleshooting

### Firebase not initializing?
- Check `.env.local` file exists
- Verify all environment variables are set
- Restart the development server: `npm run dev`

### Authentication failing?
- Ensure Firebase project has Authentication enabled
- Check security rules in Firebase Console
- Verify OAuth credentials are correct

### Firestore not working?
- Enable Firestore in Firebase Console
- Check database security rules
- Ensure collections exist with proper structure

## Next Steps

1. ✅ Firebase configured
2. ✅ Authentication setup
3. ✅ Google OAuth integrated
4. 📝 Implement user authentication handlers in auth pages
5. 📝 Create Firestore collection structure
6. 📝 Set up security rules
7. 📝 Implement grade management features
8. 📝 Deploy to Firebase Hosting

## Useful Links

- [Firebase Console](https://console.firebase.google.com/project/gradehub-beltran)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Web Setup Guide](https://firebase.google.com/docs/web/setup)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
