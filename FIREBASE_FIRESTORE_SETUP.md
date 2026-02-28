# Firebase Firestore Setup & Deployment Guide

## Overview
Your Grades and Assessment Management System now has comprehensive Firestore security rules and indexes configured for role-based access control (RBAC).

## Data Model

### Collections Structure
```
users/{uid}
  - displayName: string
  - email: string
  - role: "student" | "faculty" | "registrar" | "admin"
  - createdAt: timestamp
  - updatedAt: timestamp

courses/{courseId}
  - title: string
  - facultyId: string (UID of faculty member)
  - code: string
  - description: string
  - createdAt: timestamp

assessments/{assessmentId}
  - courseId: string
  - title: string
  - dueDate: timestamp
  - description: string
  - createdAt: timestamp

grades/{gradeId}
  - studentId: string (UID)
  - courseId: string
  - assessmentId: string
  - score: number
  - feedback: string
  - assessorId: string (UID of faculty)
  - createdAt: timestamp
  - updatedAt: timestamp

verification/{verificationId}
  - gradeId: string
  - code: string (verification code)
  - status: "pending" | "verified" | "rejected"
  - verifiedBy: string (UID of registrar)
  - createdAt: timestamp
```

## Security Rules Summary

### Role-Based Access Control (RBAC)

**Admin**: Full access to all collections
- Create, read, update, delete any document
- Set roles for other users
- View audit logs

**Registrar**: Verification and reporting
- Read all grades and user data
- Create/update verification records
- View reports
- Cannot modify user roles

**Faculty**: Course and grade management
- Create and manage their own courses
- Create grades for their courses
- Cannot view other faculty's grades
- Cannot modify user data

**Student**: Read-only access to own grades
- View their own profile
- View their grades and assessments
- Cannot modify any data
- Cannot see other students' grades

### Key Security Features
- Users cannot escalate their own roles
- Faculty can only manage their own courses
- Students can only see their own data
- Verification is registrar-only
- All write operations require authentication

## Deployment Steps

### 1. Install Firebase CLI (First Time Only)
```bash
npm install -g firebase-tools
```

### 2. Authenticate with Firebase
```bash
npm run firebase:login
```
This will open a browser to authenticate with your Google account linked to Firebase.

### 3. Initialize Firebase in Your Project (If Not Done)
```bash
npm run firebase:init
```
Select:
- ✅ Firestore
- ✅ Hosting
- ✅ Emulators (optional, for local testing)

### 4. Deploy Rules and Indexes
```bash
npm run firebase:deploy
```

Or deploy individually:
```bash
npm run firebase:deploy:rules      # Deploy security rules only
npm run firebase:deploy:indexes    # Deploy indexes only
```

## Local Testing with Emulator

### Start Emulator Suite
```bash
npm run firebase:emulate
```

This starts:
- Firestore Emulator (port 8080)
- Auth Emulator (port 9099)
- Emulator UI (port 4000)

### Connect Next.js App to Emulator

Add to `.env.local`:
```env
NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_AUTH_EMULATOR_URL=http://localhost:9099
```

### Test Rules Locally
```bash
npm run firebase:rules:test
```

## Setting User Roles

### Method 1: Using setCustomClaims Script

This script requires your Firebase service account key:

1. Get service account key:
   - Go to [Firebase Console](https://console.firebase.google.com) > Project Settings
   - Click "Service Accounts" tab
   - Click "Generate New Private Key"
   - Save as `serviceAccountKey.json` in project root
   - **Add to .gitignore** (never commit this file!)

2. Set roles:
```bash
npm run set-role <UID> <role>

# Examples:
npm run set-role user123 admin
npm run set-role user456 faculty
npm run set-role user789 student
```

### Method 2: Firebase Console
1. Go to Firebase Console > Authentication
2. Find user and click on them
3. Click "Custom Claims" button
4. Add: `{"role": "faculty"}`
5. Save

### Method 3: Cloud Functions (Recommended for Production)
Create a Cloud Function to handle role assignment securely through your app.

## Indexes

Composite indexes have been created for optimal query performance:

1. **grades** - courseId + studentId
2. **grades** - studentId + createdAt (DESC)
3. **grades** - courseId + createdAt (DESC)
4. **grades** - studentId + assessmentId
5. **courses** - facultyId + createdAt (DESC)

These indexes enable efficient queries like:
- Get all grades for a student in a course
- Get recent grades for a student
- Get all grades for a course
- Get courses for a faculty member

## Monitoring Deployment

### Check Status
```bash
firebase deploy --only firestore:rules --debug
```

### View in Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select "gradehub-beltran" project
3. Firestore > Rules tab (see your rules)
4. Firestore > Indexes tab (see index status)

### Troubleshooting

**Rules Deployment Fails**
- Check syntax in `firestore.rules`
- Ensure all collections mentioned in rules exist
- Run `firebase emulators:start` to test locally

**Indexes Not Building**
- Indexes can take 5-15 minutes to build
- Check Firebase Console > Firestore > Indexes for status
- You can still deploy; queries will work but may be slower until indexed

**Permission Denied Errors**
- Verify custom claims are set correctly: `npm run set-role <UID> <role>`
- Check rules logic for the specific collection/operation
- Test with Emulator first

## Next Steps

1. ✅ Firestore rules deployed
2. ✅ Indexes created
3. ⬜ Create Cloud Functions for:
   - User creation workflow
   - Grade verification workflow
   - Email notifications
   - Admin operations
4. ⬜ Update your Next.js API routes to use Firestore
5. ⬜ Add Firestore listeners to React components
6. ⬜ Set up monitoring and logging

## File References

- **firestore.rules** - Security rules for all collections
- **firestore.indexes.json** - Composite indexes configuration
- **firebase.json** - Firebase project configuration
- **scripts/setCustomClaims.js** - Admin utility to set user roles

## Documentation Links

- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/start)
- [Firestore Indexes](https://firebase.google.com/docs/firestore/query-data/index-overview)
- [Firebase Authentication Custom Claims](https://firebase.google.com/docs/auth/admin-sdk-setup)
- [Firebase Local Emulator Suite](https://firebase.google.com/docs/emulator-suite)
