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

## Google Authentication Setup

### 1. Firebase Console Configuration

#### Step 1: Enable Google Sign-In
1. Go to [Firebase Console](https://console.firebase.google.com/project/gradehub-beltran/authentication/providers)
2. Navigate to **Authentication** → **Sign-in method**
3. Click on **Google** provider
4. Toggle **Enable** switch to ON
5. Select the support email from the dropdown
6. Click **Save**

#### Step 2: Configure OAuth Consent Screen
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials/consent)
2. Make sure the correct project is selected (gradehub-beltran)
3. Click **Create Consent Screen**
4. Select **External** for user type
5. Fill in the required fields:
   - **App name:** GradeHub
   - **User support email:** your-email@example.com
   - **Developer contact info:** your-email@example.com
6. Add these scopes:
   - `email`
   - `profile`
   - `openid`
7. Add test users (your email address)
8. Submit for review (or keep in development mode for testing)

### 2. Implementation in Code

The Google authentication is now integrated into the following files:

**authService.ts:**
- `signInWithGoogle()` - Handles Google sign-in/sign-up
- Automatically creates user profile in Firestore for new Google users
- Stores authentication method (`email` or `google`)

**src/app/login/page.tsx:**
- "Continue with Google" button
- Redirects to dashboard on success

**src/app/register/page.tsx:**
- "Sign up with Google" button
- Users can skip email/password registration

### 3. Testing Google Authentication

1. Start the development server: `npm run dev`
2. Navigate to http://localhost:3000/login or /register
3. Click "Continue with Google" or "Sign up with Google"
4. Sign in with your Google account
5. You'll be redirected to the dashboard

### 4. Firestore User Document Structure

```json
{
  "uid": "google-user-id",
  "email": "user@gmail.com",
  "firstName": "John",
  "lastName": "Doe",
  "photoURL": "https://...",
  "role": "student",
  "department": "",
  "authMethod": "google",
  "createdAt": "2024-01-04T...",
  "updatedAt": "2024-01-04T..."
}
```

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
