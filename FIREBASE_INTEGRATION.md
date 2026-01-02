# GradeHub Firebase Integration Setup

## 📋 Overview

This document covers the complete Firebase integration setup for GradeHub, including authentication (email/password + Google OAuth), Firestore database, and deployment.

## 🚀 Quick Start

### 1. Install Firebase Tools (One-time)

```bash
npm install -g firebase-tools
```

### 2. Verify .env.local File

Check that `.env.local` exists in your project root with the following credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyABHS1sA2fprqrnkD1iR2GelXh4oN3nWOs
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=gradehub-beltran.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=gradehub-beltran
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=gradehub-beltran.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=313204491488
NEXT_PUBLIC_FIREBASE_APP_ID=1:313204491488:web:2cfaa051c44baa9e03bc85
```

### 3. Login to Firebase

```bash
firebase login
```

This will open a browser window for authentication. Log in with your Google account.

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` and test authentication.

## 📁 Project Structure

```
src/
├── lib/
│   ├── firebase.ts          # Firebase initialization
│   ├── auth.ts              # Authentication functions
│   └── AuthContext.tsx      # Auth state management
├── app/
│   ├── login/
│   │   └── page.tsx         # Login page with Google OAuth
│   ├── register/
│   │   └── page.tsx         # Registration with Google OAuth
│   └── page.tsx             # Landing page
```

## 🔐 Authentication Setup

### Files to Review

1. **src/lib/firebase.ts** - Firebase initialization
2. **src/lib/auth.ts** - Authentication functions (register, login, Google auth)
3. **src/lib/AuthContext.tsx** - React context for auth state
4. **src/app/login/page.tsx** - Login page with Google button
5. **src/app/register/page.tsx** - Registration page with Google button

### Key Functions

#### Email/Password Registration
```typescript
import { registerWithEmail } from '@/lib/auth'

const { user, profile } = await registerWithEmail(
  email,
  password,
  firstName,
  lastName,
  role,
  department
)
```

#### Email/Password Login
```typescript
import { signInWithEmail } from '@/lib/auth'

const user = await signInWithEmail(email, password)
```

#### Google Sign-In
```typescript
import { signInWithGoogle } from '@/lib/auth'

const { user, profile } = await signInWithGoogle()
```

#### Sign Out
```typescript
import { logOut } from '@/lib/auth'

await logOut()
```

### Using Auth Context in Components

```typescript
'use client'

import { useAuth } from '@/lib/AuthContext'

export default function MyComponent() {
  const { currentUser, userProfile, loading } = useAuth()

  if (loading) return <p>Loading...</p>

  if (!currentUser) return <p>Please log in</p>

  return <div>Welcome, {userProfile?.firstName}!</div>
}
```

## 🗄️ Firestore Database Structure

### Collections

#### users/
Stores user profile information
```
users/
├── {userId}/
│   ├── uid: string
│   ├── email: string
│   ├── firstName: string
│   ├── lastName: string
│   ├── role: 'student' | 'faculty' | 'registrar' | 'admin'
│   ├── department: string
│   └── createdAt: timestamp
```

#### grades/
Stores grade information
```
grades/
├── {gradeId}/
│   ├── courseId: string
│   ├── studentId: string
│   ├── instructorId: string
│   ├── grade: string (A, B, C, etc.)
│   ├── score: number (0-100)
│   ├── status: 'draft' | 'submitted' | 'verified' | 'approved'
│   ├── submittedAt: timestamp
│   ├── verifiedAt: timestamp
│   └── comments: string
```

#### courses/
Stores course information
```
courses/
├── {courseId}/
│   ├── name: string
│   ├── code: string
│   ├── semester: string
│   ├── year: number
│   ├── instructorId: string
│   ├── maxStudents: number
│   └── credits: number
```

#### corrections/
Stores grade correction requests
```
corrections/
├── {correctionId}/
│   ├── gradeId: string
│   ├── studentId: string
│   ├── requestedBy: string
│   ├── oldGrade: string
│   ├── newGrade: string
│   ├── reason: string
│   ├── status: 'pending' | 'approved' | 'rejected'
│   ├── requestedAt: timestamp
│   └── resolvedAt: timestamp
```

## 🔒 Security Rules

### Firestore Security Rules

Set up in Firebase Console > Firestore Database > Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can only read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Grades access control
    match /grades/{gradeId} {
      // Students can read their own grades
      allow read: if request.auth != null && 
                     resource.data.studentId == request.auth.uid;
      // Faculty can read/write grades for their courses
      allow read, write: if request.auth != null && 
                           get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'faculty';
      // Registrar can read all and approve
      allow read: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'registrar';
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'registrar' &&
                      request.resource.data.status == 'approved';
      // Admin can do anything
      allow read, write: if request.auth != null && 
                           get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Courses can be read by authenticated users
    match /courses/{courseId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['registrar', 'admin'];
    }
    
    // Corrections access
    match /corrections/{correctionId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.studentId;
      allow update: if request.auth != null && 
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['registrar', 'admin'];
    }
    
    // Admin logs
    match /logs/{logId} {
      allow read: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow write: if request.auth != null;
    }
  }
}
```

### Storage Security Rules

Set up in Firebase Console > Storage > Rules

```javascript
service firebase.storage {
  match /b/{bucket}/o {
    // Users can only access their own files
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Course documents accessible by relevant users
    match /courses/{courseId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      get(/databases/(default)/documents/users/$(request.auth.uid)).data.role in ['faculty', 'registrar', 'admin'];
    }
  }
}
```

## 📱 Page Integration

### Login Page (`src/app/login/page.tsx`)

Features:
- ✅ Email/password login
- ✅ Google OAuth button
- ✅ Error handling
- ✅ Loading states
- ✅ Form validation

### Register Page (`src/app/register/page.tsx`)

Features:
- ✅ Email/password registration
- ✅ Google OAuth button
- ✅ Password strength indicator
- ✅ Role selection (student, faculty, registrar)
- ✅ Department field
- ✅ Form validation

## 🚀 Deployment

### Deploy to Firebase Hosting

```bash
# Build the Next.js app
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

### Full Deployment (with functions if applicable)

```bash
firebase deploy
```

### Deploy Only Functions

```bash
firebase deploy --only functions
```

## 🧪 Testing Authentication

### Test Email/Password Flow

1. Go to `http://localhost:3000/register`
2. Create an account with:
   - Email: test@example.com
   - Password: TestPassword123
   - First Name: Test
   - Last Name: User
   - Role: Student
   - Department: Engineering
3. Go to `http://localhost:3000/login`
4. Sign in with the created credentials

### Test Google OAuth Flow

1. Go to `http://localhost:3000/register` or `http://localhost:3000/login`
2. Click "Continue with Google" button
3. Complete Google authentication
4. Should automatically create profile or sign in

### Verify Firestore Data

1. Go to Firebase Console: https://console.firebase.google.com/project/gradehub-beltran
2. Go to Firestore Database
3. Check `users` collection for created profiles

## ⚠️ Important Notes

1. **Never commit `.env.local`** - It's already in .gitignore
2. **Public credentials are safe** - Firebase web SDK credentials are public by design
3. **Security comes from rules** - Firestore/Storage security rules enforce access control
4. **Google OAuth setup** - Already configured in Firebase Console
5. **Environment variables** - All use `NEXT_PUBLIC_` prefix (browser-safe)

## 🔧 Troubleshooting

### Firebase not initialized?
```bash
# Check .env.local exists and has correct values
cat .env.local

# Restart dev server
npm run dev
```

### Google auth not working?
- Verify OAuth is enabled: Firebase Console > Authentication > Sign-in method
- Check authorized domains: Firebase Console > Authentication > Settings
- Add localhost:3000 to authorized JavaScript origins

### Firestore queries failing?
- Check security rules: Firebase Console > Firestore Database > Rules
- Verify user has correct role in profile
- Check console for error messages

### Build errors?
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
npm install

# Rebuild
npm run build
```

## 📚 Additional Resources

- [Firebase Console](https://console.firebase.google.com/project/gradehub-beltran)
- [Firebase Web Docs](https://firebase.google.com/docs/web)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firestore Database](https://firebase.google.com/docs/firestore)
- [Firebase Storage](https://firebase.google.com/docs/storage)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Next.js Firebase Integration](https://firebase.google.com/docs/firestore/quickstart#web-version-9)

## ✅ Implementation Checklist

- [x] Firebase project created
- [x] Firebase SDK installed
- [x] Environment variables configured (.env.local)
- [x] Authentication functions implemented (src/lib/auth.ts)
- [x] Auth context created (src/lib/AuthContext.tsx)
- [x] Login page with Google OAuth
- [x] Register page with Google OAuth
- [ ] Set Firestore security rules
- [ ] Create initial Firestore collections
- [ ] Implement grade management features
- [ ] Implement user dashboard
- [ ] Deploy to Firebase Hosting
- [ ] Set up Firebase monitoring

## 🎯 Next Steps

1. Configure Firestore security rules in Firebase Console
2. Create Firestore collections structure
3. Implement dashboard pages for each role
4. Add grade management features
5. Deploy to production
