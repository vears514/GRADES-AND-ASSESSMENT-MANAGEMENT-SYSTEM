# Firebase Database Integration Planning Document

**Version**: 1.0  
**Created**: February 10, 2026  
**Status**: Pre-Implementation Planning  
**Project**: Grades & Assessment Management System

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Firebase Architecture](#firebase-architecture)
3. [Complete Firestore Schema](#complete-firestore-schema)
4. [Integration Road Map](#integration-road-map)
5. [Task-by-Task Firebase Integration](#task-by-task-firebase-integration)
6. [Implementation Sprints](#implementation-sprints)
7. [Security Rules Strategy](#security-rules-strategy)
8. [Data Validation & Indexes](#data-validation--indexes)
9. [API Layer Integration](#api-layer-integration)
10. [Frontend State Management](#frontend-state-management)
11. [Migration & Data Seeding](#migration--data-seeding)
12. [Monitoring & Performance](#monitoring--performance)

---

## OVERVIEW

### Purpose
This document outlines how to integrate Firebase Firestore database across all 49 tasks in the MASTER_TASKBOARD, ensuring:
- Data consistency across all features
- Proper authentication & authorization at database level
- Efficient query patterns
- Scalable architecture
- Type-safe operations

### Firebase Services Being Used
1. **Firestore Database** - Primary data store (NoSQL)
2. **Firebase Authentication** - User auth & management
3. **Firebase Storage** - File uploads (bulk uploads, documents)
4. **Firebase Cloud Functions** - Batch operations (optional)
5. **Firestore Transactions** - Multi-document updates

### Key Principles
- ✅ Single source of truth in Firestore
- ✅ Real-time data sync where applicable
- ✅ Security rules enforce authorization
- ✅ Efficient indexing for all queries
- ✅ Audit trails for compliance

---

## FIREBASE ARCHITECTURE

### High-Level Architecture

```
┌─────────────────────────────────┐
│     Frontend (React/Next.js)     │
│  - Components                    │
│  - Custom Hooks (useFirebase)    │
│  - Context API (AuthContext)     │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│  Frontend Services Layer         │
│  - gradeService.tsx             │
│  - authService.ts               │
│  - verificationService.ts       │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│  Backend API Layer (Routes)      │
│  - /api/grades/*                │
│  - /api/verification/*          │
│  - /api/corrections/*           │
│  - /api/admin/*                 │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│  Firebase Services              │
│  - Firestore Database           │
│  - Firebase Auth                │
│  - Firebase Storage             │
│  - Security Rules               │
└─────────────────────────────────┘
```

### Data Flow Pattern

```
User Action (Frontend)
    ↓
Service Method Call
    ↓
API Route Handler
    ↓
Firestore Transaction/Write
    ↓
Security Rules Check
    ↓
Database Update
    ↓
Real-time Listener Update (if subscribed)
    ↓
UI Re-render
```

---

## COMPLETE FIRESTORE SCHEMA

### Collection Hierarchy

```
firestore/
├── users/
│   ├── {uid}/
│   │   ├── profile: {}
│   │   ├── role: string
│   │   ├── department: string
│   │   ├── status: enum
│   │   ├── createdAt: timestamp
│   │   └── permissions: []
│   └── query: role, department, status
│
├── courses/
│   ├── {courseId}/
│   │   ├── code: string
│   │   ├── name: string
│   │   ├── department: string
│   │   ├── semester: string
│   │   ├── year: number
│   │   ├── instructor: {uid}
│   │   ├── capacity: number
│   │   ├── credits: number
│   │   ├── description: string
│   │   └── createdAt: timestamp
│   └── queries: department, semester, year
│
├── enrollments/
│   ├── {enrollmentId}/
│   │   ├── studentId: {uid}
│   │   ├── courseId: string
│   │   ├── enrolledAt: timestamp
│   │   ├── status: enum (active, dropped, completed)
│   │   └── grade: {
│   │       ├── score: number
│   │       ├── letterGrade: string
│   │       ├── submittedAt: timestamp
│   │       ├── verifiedAt: timestamp
│   │       ├── verifiedBy: {uid}
│   │       └── status: enum
│   │   }
│   └── subcollection: grades (historical)
│
├── grades/
│   ├── {gradeId}/
│   │   ├── studentId: {uid}
│   │   ├── courseId: string
│   │   ├── score: number
│   │   ├── letterGrade: string
│   │   ├── remarks: string
│   │   ├── submittedBy: {uid}
│   │   ├── submittedAt: timestamp
│   │   ├── verificationStatus: enum (pending, approved, rejected)
│   │   ├── verifiedBy: {uid}
│   │   ├── verifiedAt: timestamp
│   │   ├── rejectionReason: string
│   │   ├── history: []
│   │   └── createdAt: timestamp
│   │
│   └── subcollections:
│       └── history/
│           ├── {versionId}/
│           │   ├── previousScore: number
│           │   ├── newScore: number
│           │   ├── changedBy: {uid}
│           │   └── changedAt: timestamp
│
├── bulkUploads/
│   ├── {batchId}/
│   │   ├── fileName: string
│   │   ├── courseId: string
│   │   ├── uploadedBy: {uid}
│   │   ├── uploadedAt: timestamp
│   │   ├── status: enum (processing, completed, failed)
│   │   ├── totalRecords: number
│   │   ├── successCount: number
│   │   ├── errorCount: number
│   │   ├── fileUrl: string
│   │   └── errors: []
│   │
│   └── subcollections:
│       └── records/
│           ├── {recordId}/
│           │   ├── studentId: string
│           │   ├── score: number
│           │   ├── status: enum (success, failed)
│           │   └── error: string
│
├── gradeCorrections/
│   ├── {correctionId}/
│   │   ├── studentId: {uid}
│   │   ├── courseId: string
│   │   ├── gradeId: string
│   │   ├── requestedScore: number
│   │   ├── currentScore: number
│   │   ├── reason: string
│   │   ├── status: enum (pending, approved, rejected)
│   │   ├── submittedAt: timestamp
│   │   ├── filedBy: {uid}
│   │   ├── documentUrls: []
│   │   │
│   │   └── approvals: {
│   │       ├── departmentHead: {
│   │       │   ├── uid: {uid}
│   │       │   ├── approved: boolean
│   │       │   ├── comments: string
│   │       │   └── timestamp: timestamp
│   │       └── provost: {
│   │           ├── uid: {uid}
│   │           ├── approved: boolean
│   │           ├── comments: string
│   │           └── timestamp: timestamp
│   │       }
│   │
│   └── subcollections:
│       └── documents/
│           ├── {docId}/
│           │   ├── fileName: string
│           │   ├── fileUrl: string
│           │   ├── uploadedAt: timestamp
│           │   └── type: string
│
├── gradeVerifications/
│   ├── {verificationId}/
│   │   ├── courseId: string
│   │   ├── submittedBy: {uid}
│   │   ├── submittedAt: timestamp
│   │   ├── totalGrades: number
│   │   ├── status: enum (pending, approved, rejected, partial)
│   │   ├── approvedBy: {uid}
│   │   ├── approvedAt: timestamp
│   │   ├── rejectionReason: string
│   │   ├── gradeIds: []
│   │   └── comments: string
│   │
│   └── subcollections:
│       └── items/
│           ├── {gradeId}/
│           │   ├── studentId: {uid}
│           │   ├── score: number
│           │   ├── status: enum
│           │   └── remarks: string
│
├── notifications/
│   ├── {userId}/
│   │   └── messages/
│   │       ├── {notificationId}/
│   │       │   ├── type: enum (grade_posted, grade_approved, request_update, deadline, system)
│   │       │   ├── title: string
│   │       │   ├── message: string
│   │       │   ├── relatedId: string (gradeId, correctionId, etc.)
│   │       │   ├── read: boolean
│   │       │   ├── createdAt: timestamp
│   │       │   ├── actionUrl: string
│   │       │   └── emailSent: boolean
│
├── auditLogs/
│   ├── {logId}/
│   │   ├── userId: {uid}
│   │   ├── action: string
│   │   ├── resource: enum (grade, user, course, correction, verification)
│   │   ├── resourceId: string
│   │   ├── oldValue: any
│   │   ├── newValue: any
│   │   ├── timestamp: timestamp
│   │   ├── ipAddress: string
│   │   └── status: enum (success, failed)
│   │
│   └── queries: userId, resource, action, timestamp
│
├── reports/
│   ├── {reportId}/
│   │   ├── title: string
│   │   ├── type: enum (class_stats, grade_distribution, completion_status, custom)
│   │   ├── generatedBy: {uid}
│   │   ├── generatedAt: timestamp
│   │   ├── courseId: string
│   │   ├── data: {} (dynamic based on report type)
│   │   ├── filters: {}
│   │   └── expiresAt: timestamp
│
├── emailLogs/
│   ├── {emailId}/
│   │   ├── to: string
│   │   ├── type: enum (grade_posted, approval, rejection, etc.)
│   │   ├── subject: string
│   │   ├── sentAt: timestamp
│   │   ├── status: enum (sent, failed, bounced)
│   │   ├── notificationId: string
│   │   └── error: string
│
├── settings/
│   ├── {settingId}/
│   │   ├── category: string
│   │   ├── key: string
│   │   ├── value: any
│   │   ├── type: string
│   │   ├── updatedBy: {uid}
│   │   ├── updatedAt: timestamp
│   │   └── description: string
│
└── sessions/
    ├── {sessionId}/
    │   ├── userId: {uid}
    │   ├── userAgent: string
    │   ├── ipAddress: string
    │   ├── createdAt: timestamp
    │   ├── lastActivityAt: timestamp
    │   ├── expiresAt: timestamp
    │   └── isActive: boolean
```

### Complete Field Reference

| Collection | Field | Type | Required | Indexed | Purpose |
|-----------|-------|------|----------|---------|---------|
| users | profile.email | string | ✅ | ✅ | Login, contact |
| users | profile.firstName | string | ✅ | ❌ | Display |
| users | profile.lastName | string | ✅ | ❌ | Display |
| users | role | enum | ✅ | ✅ | Authorization |
| users | department | string | ✅ | ✅ | Filtering |
| users | status | enum | ✅ | ✅ | Active users |
| grades | studentId | ref | ✅ | ✅ | Student lookup |
| grades | courseId | string | ✅ | ✅ | Course lookup |
| grades | score | number | ✅ | ✅ | Sorting |
| grades | verificationStatus | enum | ✅ | ✅ | Filtering pending |
| gradeCorrections | status | enum | ✅ | ✅ | Workflow status |
| notifications | read | boolean | ✅ | ✅ | Unread count |
| auditLogs | userId | ref | ✅ | ✅ | User actions |
| auditLogs | timestamp | timestamp | ✅ | ✅ | Time range queries |

---

## INTEGRATION ROAD MAP

### Phase 1: Foundation (Week 1-2)
**Goal**: Core Firebase setup with basic read/write operations

```
┌─────────────────────────────────────┐
│ PHASE 1: FOUNDATION                 │
├─────────────────────────────────────┤
│ ✅ Firebase Project Setup            │
│ ✅ Authentication (Email/Password)   │
│ ✅ Users Collection + Auth Link      │
│ ✅ Basic CRUD Services               │
│ 🚧 Grade Submission Flow             │
│ 🚧 Security Rules (read-only)        │
└─────────────────────────────────────┘
```

**Firestore Collections to Create**:
- `users` - User profiles linked to Auth UID
- `courses` - Course master data
- `enrollments` - Student-Course mapping
- `grades` (basic) - Simple grade records

**Backend Tasks**:
- [x] Setup Firebase initialization
- [ ] Create user profile on auth signup
- [ ] Create courses API endpoint
- [ ] Create grade submission API

**Frontend Tasks**:
- [ ] Setup Firebase SDK in app
- [ ] Create useAuth hook
- [ ] Create useGrades hook
- [ ] Build grade entry form

---

### Phase 2: Verification & Approval (Week 3-4)
**Goal**: Add verification workflow and security rules

```
┌─────────────────────────────────────┐
│ PHASE 2: VERIFICATION               │
├─────────────────────────────────────┤
│ ✅ Grade Submission (Phase 1)        │
│ 🚧 Verification Collection           │
│ 🚧 Approval Workflow                 │
│ 🚧 Security Rules (authorization)    │
│ 🚧 Real-time Listeners               │
│ 🚧 Verification Dashboard            │
└─────────────────────────────────────┘
```

**Firestore Collections to Create**:
- `gradeVerifications` - Batch verification
- Indexes for verification queries

**Backend Tasks**:
- [ ] Create verification API endpoints
- [ ] Implement approval logic
- [ ] Add transaction handling

**Frontend Tasks**:
- [ ] Build verification dashboard
- [ ] Add real-time listeners
- [ ] Display approval status

---

### Phase 3: Advanced Features (Week 5-6)
**Goal**: Bulk uploads, corrections, notifications

```
┌─────────────────────────────────────┐
│ PHASE 3: ADVANCED FEATURES          │
├─────────────────────────────────────┤
│ ✅ Phases 1-2                        │
│ 🚧 Bulk Upload Collection            │
│ 🚧 Grade Corrections Collection      │
│ 🚧 Notifications Collection          │
│ 🚧 Audit Logging                     │
│ 🚧 File Storage Integration          │
│ 🚧 Email Trigger Service             │
└─────────────────────────────────────┘
```

**Firestore Collections to Create**:
- `bulkUploads` - Batch upload tracking
- `gradeCorrections` - Appeal/correction requests
- `notifications` - User notifications
- `auditLogs` - Compliance logging
- `emailLogs` - Email delivery tracking

**Backend Tasks**:
- [ ] Bulk upload API (CSV parsing, validation)
- [ ] Correction request API
- [ ] Notification service
- [ ] Audit logging middleware

**Frontend Tasks**:
- [ ] Bulk upload UI with drag-drop
- [ ] Correction form
- [ ] Notification center
- [ ] Student portal

---

### Phase 4: Admin & Reporting (Week 7+)
**Goal**: Administrative features and analytics

```
┌─────────────────────────────────────┐
│ PHASE 4: ADMIN & REPORTING          │
├─────────────────────────────────────┤
│ ✅ Phases 1-3                        │
│ 🚧 Reports Collection                │
│ 🚧 Admin User Management             │
│ 🚧 Analytics & Dashboard             │
│ 🚧 Settings Collection               │
│ 🚧 Performance Optimization          │
└─────────────────────────────────────┘
```

**Firestore Collections to Create**:
- `reports` - Generated reports
- `settings` - System configuration
- `sessions` - User sessions

**Backend Tasks**:
- [ ] Admin user management API
- [ ] Report generation API
- [ ] Analytics endpoints
- [ ] System settings API

**Frontend Tasks**:
- [ ] Admin dashboard
- [ ] User management interface
- [ ] Analytics visualizations
- [ ] Settings panel

---

## TASK-BY-TASK FIREBASE INTEGRATION

### ✅ COMPLETED TASKS (Firebase Implementation)

**Landing Page**
- Firebase SDK initialized
- Public access (no DB queries)
- Status: ✅ No changes needed

**Login Page**
- Integration: `firebase.auth().signInWithEmailAndPassword()`
- Collections used: None (auth handles it)
- Status: ✅ Ready for Firebase Auth

**Register Page**
- Integration: 
  ```typescript
  firebase.auth().createUserWithEmailAndPassword(email, password)
  db.collection('users').doc(uid).set({...profile})
  ```
- Collections: `users`
- Status: 🚧 Needs user profile creation

**Dashboard Main Layout**
- Integration: `useAuth()` hook to display user info
- Collections used: `users` (read)
- Status: 🚧 Needs real-time listener

**Grade Entry Interface**
- Integration: Form submission → API → Firestore write
- Collections: `grades`, `enrollments`
- Status: 🚧 Needs validation + transaction

---

### 🚧 IN-PROGRESS TASKS (Firebase Integration Required)

**Firebase Authentication Integration**
```
Step 1: Initialize Firebase Auth
- Already done in src/lib/firebase.ts

Step 2: Create AuthContext Provider
- Wrap app with FirebaseAuthProvider
- Listen to auth state changes
- Expose user, loading, error

Step 3: Create useAuth Hook
- Return user, login, logout, signup
- Handle token refresh

Step 4: Implement Firebase Auth UI
- Email/password authentication
- Google OAuth integration
- Error handling

Implementation Timeline: Week 1
Firestore Collections: None (Firebase Auth)
Dependencies: Firebase SDK v10.7+
```

**Google OAuth Implementation**
```
Step 1: Setup Google OAuth credentials
- Create OAuth 2.0 Client IDs in Google Cloud Console
- Configure authorized redirect URIs
- Store credentials in .env.local

Step 2: Implement Google Sign-In
- Add signInWithPopup(googleAuthProvider)
- Handle popup blocking
- Create user profile on first login

Step 3: Link Google account to existing user
- Handle account linking for existing users
- Update user profile with Google data

Implementation Timeline: Week 1-2
Firestore Collections: users (write on first login)
Dependencies: @react-oauth/google
```

**Session Management & Token Refresh**
```
Step 1: Create Session Management Service
- Track active sessions in Firestore
- Implement token refresh logic
- Handle session expiry

Step 2: Auto-refresh Tokens
- Setup Firebase token auto-refresh
- Intercept API requests for token injection
- Handle 401 responses

Step 3: Multi-device Session Management
- List active sessions in user settings
- Allow remote logout from other devices
- Track device info

Implementation Timeline: Week 2
Firestore Collections: sessions
Query Pattern: db.collection('sessions').where('userId', '==', uid)
```

---

### 📋 PENDING FIREBASE INTEGRATION TASKS

#### FACULTY DASHBOARD FEATURES

**Grade Submission API**
```typescript
// Collection: grades
// API: POST /api/grades/create

const submitGrade = async (gradeData) => {
  const gradeRef = db.collection('grades').doc();
  
  return db.runTransaction(async (transaction) => {
    // Write grade
    transaction.set(gradeRef, {
      ...gradeData,
      submittedBy: currentUser.uid,
      submittedAt: serverTimestamp(),
      verificationStatus: 'pending',
      createdAt: serverTimestamp()
    });
    
    // Update enrollment
    transaction.update(
      db.collection('enrollments').doc(gradeData.enrollmentId),
      { 'grade.status': 'submitted' }
    );
    
    // Create audit log
    transaction.set(
      db.collection('auditLogs').doc(),
      {
        userId: currentUser.uid,
        action: 'grade_submitted',
        resource: 'grade',
        resourceId: gradeRef.id,
        newValue: gradeData,
        timestamp: serverTimestamp()
      }
    );
  });
};

// Required Indexes:
// - grades: submittedBy, submittedAt
// - grades: verificationStatus, submittedAt
```

**Bulk Upload API**
```typescript
// Collections: bulkUploads, bulkUploads/{id}/records

const processBulkUpload = async (fileId, csvData) => {
  const batchRef = db.collection('bulkUploads').doc(fileId);
  
  // 1. Create upload record
  await batchRef.set({
    fileName: csvData.fileName,
    courseId: csvData.courseId,
    uploadedBy: currentUser.uid,
    uploadedAt: serverTimestamp(),
    status: 'processing',
    totalRecords: csvData.records.length,
    successCount: 0,
    errorCount: 0
  });
  
  // 2. Parse and validate CSV
  const validatedRecords = validateCSV(csvData);
  
  // 3. Write records (note: use batch writes for large datasets)
  const batch = db.batch();
  let successCount = 0, errorCount = 0;
  
  validatedRecords.forEach((record, index) => {
    if (record.isValid) {
      batch.set(batchRef.collection('records').doc(), {
        ...record,
        status: 'success'
      });
      successCount++;
    } else {
      batch.set(batchRef.collection('records').doc(), {
        ...record,
        status: 'failed',
        error: record.error
      });
      errorCount++;
    }
  });
  
  await batch.commit();
  
  // 4. Update batch status
  await batchRef.update({
    status: 'completed',
    successCount,
    errorCount
  });
};

// Firebase Storage: Store uploaded CSV file
const uploadFile = async (file) => {
  const storagePath = `bulk-uploads/${currentUser.uid}/${Date.now()}_${file.name}`;
  const storageRef = storage.ref(storagePath);
  return storageRef.put(file);
};
```

**Grade History Viewer**
```typescript
// Subcollection: grades/{gradeId}/history

const getGradeHistory = async (gradeId) => {
  return db
    .collection('grades')
    .doc(gradeId)
    .collection('history')
    .orderBy('changedAt', 'desc')
    .get();
};

// Real-time listener
const subscribeToGradeHistory = (gradeId, callback) => {
  return db
    .collection('grades')
    .doc(gradeId)
    .collection('history')
    .orderBy('changedAt', 'desc')
    .limit(50)
    .onSnapshot(callback);
};
```

---

#### REGISTRAR DASHBOARD FEATURES

**Grade Verification Dashboard**
```typescript
// Collections: grades, gradeVerifications, enrollments

const getGradesPendingVerification = async (courseId) => {
  return db
    .collection('grades')
    .where('courseId', '==', courseId)
    .where('verificationStatus', '==', 'pending')
    .orderBy('submittedAt', 'desc')
    .get();
};

// Real-time listener for dashboard
const subscribeToPendingGrades = (courseId, callback) => {
  return db
    .collection('grades')
    .where('courseId', '==', courseId)
    .where('verificationStatus', '==', 'pending')
    .orderBy('submittedAt', 'desc')
    .limit(100)
    .onSnapshot(callback);
};

// Bulk verify action
const bulkVerifyGrades = async (gradeIds, action, comments) => {
  return db.runTransaction(async (transaction) => {
    gradeIds.forEach((gradeId) => {
      transaction.update(
        db.collection('grades').doc(gradeId),
        {
          verificationStatus: action, // 'approved' or 'rejected'
          verifiedBy: currentUser.uid,
          verifiedAt: serverTimestamp(),
          rejectionReason: action === 'rejected' ? comments : null
        }
      );
    });
  });
};

// Required Indexes:
// - grades: (courseId, verificationStatus, submittedAt)
```

**Correction Request Review Panel**
```typescript
// Collections: gradeCorrections, gradeCorrections/{id}/documents

const getPendingCorrections = async () => {
  return db
    .collection('gradeCorrections')
    .where('status', '==', 'pending')
    .orderBy('submittedAt', 'desc')
    .get();
};

const approveCorrection = async (correctionId, comment) => {
  return db.runTransaction(async (transaction) => {
    const correctionRef = db.collection('gradeCorrections').doc(correctionId);
    const correction = await transaction.get(correctionRef);
    
    // Approve correction
    transaction.update(correctionRef, {
      status: 'approved',
      approvals: {
        ...correction.data().approvals,
        [currentUser.uid]: {
          uid: currentUser.uid,
          approved: true,
          comments: comment,
          timestamp: serverTimestamp()
        }
      }
    });
    
    // Update original grade if all approvals complete
    if (allApprovalsComplete(correction.data())) {
      transaction.update(
        db.collection('grades').doc(correction.data().gradeId),
        {
          score: correction.data().requestedScore,
          letterGrade: calculateLetterGrade(correction.data().requestedScore),
          updatedAt: serverTimestamp()
        }
      );
    }
  });
};

// Required Indexes:
// - gradeCorrections: (status, submittedAt)
```

---

#### STUDENT PORTAL FEATURES

**Grade Viewer API**
```typescript
// Collections: grades, enrollments

const getStudentGrades = async (studentId) => {
  return db
    .collection('grades')
    .where('studentId', '==', studentId)
    .where('verificationStatus', '==', 'approved')
    .orderBy('createdAt', 'desc')
    .get();
};

// Real-time listener
const subscribeToStudentGrades = (studentId, callback) => {
  return db
    .collection('grades')
    .where('studentId', '==', studentId)
    .where('verificationStatus', '==', 'approved')
    .orderBy('createdAt', 'desc')
    .onSnapshot(callback);
};

const getGradeTranscript = async (studentId) => {
  const grades = await getStudentGrades(studentId);
  
  return {
    student: await db.collection('users').doc(studentId).get(),
    grades: grades.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })),
    gpa: calculateGPA(grades),
    generatedAt: new Date()
  };
};
```

**Grade Appeal/Correction Form**
```typescript
// Collections: gradeCorrections, gradeCorrections/{id}/documents

const submitGradeAppeal = async (appealData) => {
  return db.runTransaction(async (transaction) => {
    const correctionRef = db.collection('gradeCorrections').doc();
    
    transaction.set(correctionRef, {
      studentId: currentUser.uid,
      courseId: appealData.courseId,
      gradeId: appealData.gradeId,
      currentScore: appealData.currentScore,
      requestedScore: appealData.requestedScore,
      reason: appealData.reason,
      status: 'pending',
      filedBy: currentUser.uid,
      submittedAt: serverTimestamp(),
      documentUrls: [],
      approvals: {}
    });
    
    // Create notification for department head
    transaction.set(
      db.collection('notifications').doc(`${departmentHeadId}_${correctionRef.id}`),
      {
        type: 'correction_request',
        title: 'New Grade Correction Request',
        message: `Student submitted grade appeal for ${appealData.courseId}`,
        relatedId: correctionRef.id,
        read: false,
        createdAt: serverTimestamp()
      }
    );
  });
};

// File upload for supporting documents
const uploadCorrectionDocument = async (correctionId, file) => {
  const storagePath = `corrections/${correctionId}/${Date.now()}_${file.name}`;
  const storageRef = storage.ref(storagePath);
  
  await storageRef.put(file);
  const fileUrl = await storageRef.getDownloadURL();
  
  // Add document reference to correction
  await db
    .collection('gradeCorrections')
    .doc(correctionId)
    .collection('documents')
    .add({
      fileName: file.name,
      fileUrl,
      uploadedAt: serverTimestamp(),
      type: file.type
    });
};
```

**Notification Center**
```typescript
// Collections: notifications

const getStudentNotifications = async (limit = 20) => {
  return db
    .collection('notifications')
    .doc(currentUser.uid)
    .collection('messages')
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();
};

const markNotificationAsRead = async (notificationId) => {
  return db
    .collection('notifications')
    .doc(currentUser.uid)
    .collection('messages')
    .doc(notificationId)
    .update({ read: true });
};

// Real-time listener for new notifications
const subscribeToNotifications = (callback) => {
  return db
    .collection('notifications')
    .doc(currentUser.uid)
    .collection('messages')
    .orderBy('createdAt', 'desc')
    .limit(50)
    .onSnapshot(callback);
};
```

---

#### ADMIN FEATURES

**User Management API**
```typescript
// Collections: users

const getUsersList = async (filters = {}) => {
  let query = db.collection('users');
  
  if (filters.role) {
    query = query.where('role', '==', filters.role);
  }
  if (filters.department) {
    query = query.where('department', '==', filters.department);
  }
  if (filters.status) {
    query = query.where('status', '==', filters.status);
  }
  
  return query.orderBy('profile.createdAt', 'desc').get();
};

const createUser = async (userData) => {
  // 1. Create Firebase Auth user
  const authUser = await firebase.auth().createUser({
    email: userData.email,
    password: userData.temporaryPassword,
    displayName: userData.displayName
  });
  
  // 2. Create user document
  return db.collection('users').doc(authUser.uid).set({
    profile: {
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone
    },
    role: userData.role,
    department: userData.department,
    status: 'active',
    permissions: getRolePermissions(userData.role),
    createdAt: serverTimestamp()
  });
};

const updateUser = async (userId, updates) => {
  return db.collection('users').doc(userId).update({
    ...updates,
    updatedAt: serverTimestamp()
  });
};

const deleteUser = async (userId) => {
  return db.runTransaction(async (transaction) => {
    // Mark as inactive instead of deleting
    transaction.update(db.collection('users').doc(userId), {
      status: 'inactive',
      deactivatedAt: serverTimestamp()
    });
  });
};

// Required Indexes:
// - users: (role, createdAt)
// - users: (department, status)
```

**Course Management API**
```typescript
// Collections: courses, enrollments

const createCourse = async (courseData) => {
  const courseRef = db.collection('courses').doc(courseData.code);
  
  return db.runTransaction(async (transaction) => {
    transaction.set(courseRef, {
      ...courseData,
      instructor: courseData.instructorId,
      createdAt: serverTimestamp(),
      createdBy: currentUser.uid
    });
  });
};

const enrollStudent = async (courseId, studentId) => {
  return db.collection('enrollments').add({
    studentId,
    courseId,
    enrolledAt: serverTimestamp(),
    status: 'active',
    grade: {
      status: 'not_submitted'
    }
  });
};

// Required Indexes:
// - courses: (department, semester, year)
```

**Audit Log Viewer**
```typescript
// Collections: auditLogs

const getAuditLogs = async (filters = {}) => {
  let query = db.collection('auditLogs');
  
  if (filters.userId) {
    query = query.where('userId', '==', filters.userId);
  }
  if (filters.resource) {
    query = query.where('resource', '==', filters.resource);
  }
  if (filters.action) {
    query = query.where('action', '==', filters.action);
  }
  
  if (filters.startDate && filters.endDate) {
    query = query
      .where('timestamp', '>=', filters.startDate)
      .where('timestamp', '<=', filters.endDate);
  }
  
  return query
    .orderBy('timestamp', 'desc')
    .limit(1000)
    .get();
};

// Required Indexes:
// - auditLogs: (userId, timestamp)
// - auditLogs: (resource, action, timestamp)
```

**System Reports API**
```typescript
// Collections: reports

const generateClassStatistics = async (courseId) => {
  const grades = await db
    .collection('grades')
    .where('courseId', '==', courseId)
    .where('verificationStatus', '==', 'approved')
    .get();
  
  const report = {
    courseId,
    totalStudents: grades.size,
    averageScore: calculateAverage(grades),
    median: calculateMedian(grades),
    gradeDistribution: calculateDistribution(grades),
    timestamp: serverTimestamp()
  };
  
  // Save report
  await db.collection('reports').add(report);
  return report;
};

const generateGradeDistribution = async (courseId) => {
  // Similar to above but focuses on grade distribution
};

const generateCompletionStatus = async (courseId) => {
  // Track submission and verification status
};

// Required Indexes:
// - reports: (type, courseId, generatedAt)
```

---

## IMPLEMENTATION SPRINTS

### Sprint 1: Foundation (Weeks 1-2)

**Goal**: Authentication and basic CRUD operations

| Task | Database Integration | Status | Effort |
|------|---------------------|--------|--------|
| Firebase Auth Setup | N/A | ✅ | 2h |
| User Profile Creation | users collection | 🚧 | 4h |
| Email/Password Login | Firebase Auth | 🚧 | 3h |
| Google OAuth | Firebase Auth + users | 🚧 | 6h |
| Create Grade API | grades collection | 🚧 | 5h |
| Dashboard (Real-time) | users + grades | 🚧 | 4h |
| Security Rules (Basic) | Firestore rules | 📋 | 3h |
| **TOTAL** | | | **27h** |

**Firestore Collections Ready**:
- ✅ users
- ✅ courses
- ✅ enrollments
- ✅ grades (basic)

---

### Sprint 2: Verification (Weeks 3-4)

**Goal**: Grade verification workflow and bulk operations

| Task | Database Integration | Status | Effort |
|------|---------------------|--------|--------|
| Grade Verification API | gradeVerifications | 📋 | 8h |
| Verification Dashboard | Real-time listeners | 📋 | 6h |
| Bulk Upload API | bulkUploads collection | 📋 | 10h |
| CSV Validation | Zod + Logic | 📋 | 4h |
| Bulk Upload UI | Progress tracking | 📋 | 5h |
| Security Rules (Auth) | Firestore rules | 📋 | 4h |
| Indexes Creation | All verification queries | 📋 | 2h |
| **TOTAL** | | | **39h** |

**Firestore Collections Ready**:
- ✅ gradeVerifications
- ✅ bulkUploads + records
- ✅ Updated indexes

---

### Sprint 3: Advanced (Weeks 5-6)

**Goal**: Corrections, notifications, and logging

| Task | Database Integration | Status | Effort |
|------|---------------------|--------|--------|
| Correction Requests API | gradeCorrections | 📋 | 8h |
| Correction UI (Student) | Forms + File upload | 📋 | 6h |
| Correction Review (Admin) | Real-time queries | 📋 | 5h |
| Notifications System | notifications collection | 📋 | 10h |
| Notification Center UI | Real-time listeners | 📋 | 4h |
| Audit Logging Middleware | auditLogs collection | 📋 | 6h |
| Email Integration | emailLogs + service | 📋 | 8h |
| **TOTAL** | | | **47h** |

**Firestore Collections Ready**:
- ✅ gradeCorrections + documents
- ✅ notifications
- ✅ auditLogs
- ✅ emailLogs

---

### Sprint 4: Admin & Reports (Weeks 7+)

**Goal**: Administrative features and analytics

| Task | Database Integration | Status | Effort |
|------|---------------------|--------|--------|
| User Management API | users collection | 📋 | 8h |
| Admin Dashboard | Real-time queries | 📋 | 8h |
| Course Management | courses collection | 📋 | 6h |
| Reporting System | reports collection | 📋 | 10h |
| Analytics UI | Chart.js/Recharts | 📋 | 6h |
| Settings Management | settings collection | 📋 | 4h |
| Session Management | sessions collection | 📋 | 5h |
| Performance Optimization | Index review, caching | 📋 | 8h |
| **TOTAL** | | | **55h** |

**Firestore Collections Ready**:
- ✅ reports
- ✅ settings
- ✅ sessions

---

## SECURITY RULES STRATEGY

### Firestore Security Rules Structure

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isFaculty() {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'faculty';
    }
    
    function isRegistrar() {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'registrar';
    }
    
    function isStudent() {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'student';
    }
    
    function isOwner(uid) {
      return request.auth.uid == uid;
    }
    
    function getDepartment() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.department;
    }
    
    // Users Collection
    match /users/{uid} {
      // Users can read their own profile
      allow read: if isOwner(uid);
      
      // Users can update their own profile (limited fields)
      allow update: if isOwner(uid) &&
                       !request.resource.data.diff(resource.data).affectedKeys()
                         .hasAny(['role', 'department', 'permissions', 'status']);
      
      // Admins can read all users
      allow read: if isAdmin();
      
      // Admins can create and manage users
      allow create, update, delete: if isAdmin();
      
      // Public creation for auth signup
      allow create: if isAuthenticated() &&
                       uid == request.auth.uid &&
                       request.resource.data.keys().hasOnly(['profile', 'role', 'department', 'status', 'permissions', 'createdAt']) &&
                       request.resource.data.role in ['student', 'faculty', 'registrar'];
    }
    
    // Courses Collection
    match /courses/{courseId} {
      // Anyone authenticated can read courses
      allow read: if isAuthenticated();
      
      // Only faculty and admins can create courses
      allow create: if (isFaculty() || isAdmin());
      
      // Faculty can update their own courses, admins can update any
      allow update: if isAdmin() ||
                       (isFaculty() && resource.data.instructor == request.auth.uid);
      
      // Only admins can delete courses
      allow delete: if isAdmin();
    }
    
    // Enrollments Collection
    match /enrollments/{docId} {
      // Students can read their own enrollments
      allow read: if isStudent() && resource.data.studentId == request.auth.uid;
      
      // Faculty can read enrollments for their courses
      allow read: if isFaculty() && 
                      resource.data.courseId in get(/databases/$(database)/documents/courses/$(resource.data.courseId)).data.instructor == request.auth.uid;
      
      // Registrars can read all enrollments
      allow read: if isRegistrar();
      
      // Only admins can create/update enrollments
      allow create, update: if isAdmin();
      
      allow delete: if isAdmin();
    }
    
    // Grades Collection
    match /grades/{gradeId} {
      // Faculty can read grades they submitted
      allow read: if isFaculty() && resource.data.submittedBy == request.auth.uid;
      
      // Students can only see their approved grades
      allow read: if isStudent() && 
                      resource.data.studentId == request.auth.uid &&
                      resource.data.verificationStatus == 'approved';
      
      // Registrars can read all grades
      allow read: if isRegistrar();
      
      // Faculty can create grades for their courses
      allow create: if isFaculty() &&
                       request.resource.data.submittedBy == request.auth.uid &&
                       request.resource.data.verificationStatus == 'pending';
      
      // Registrars can approve/reject grades
      allow update: if isRegistrar() &&
                       request.resource.data.verifiedBy == request.auth.uid &&
                       request.resource.data.diff(resource.data)
                         .affectedKeys().hasOnly(['verificationStatus', 'verifiedBy', 'verifiedAt', 'rejectionReason']);
      
      // Faculty can update own grades if not yet verified
      allow update: if isFaculty() &&
                       resource.data.submittedBy == request.auth.uid &&
                       resource.data.verificationStatus == 'pending';
      
      // History subcollection (append-only)
      match /history/{historyId} {
        allow read: if isFaculty() || isRegistrar() || isAdmin();
        allow create: if isFaculty() || isRegistrar();
      }
      
      allow delete: if isAdmin();
    }
    
    // Grade Verifications Collection
    match /gradeVerifications/{verificationId} {
      // Faculty can read verifications for their grades
      allow read: if isFaculty();
      
      // Registrars can read and update verifications
      allow read, update: if isRegistrar();
      
      // Only admins can delete
      allow delete: if isAdmin();
      
      // Items subcollection
      match /items/{gradeId} {
        allow read, write: if isRegistrar() || isAdmin();
      }
    }
    
    // Bulk Uploads Collection
    match /bulkUploads/{batchId} {
      // Faculty can read their own uploads
      allow read: if isFaculty() && resource.data.uploadedBy == request.auth.uid;
      
      // Registrars can read all uploads
      allow read: if isRegistrar();
      
      // Faculty can create uploads
      allow create: if isFaculty() &&
                       request.resource.data.uploadedBy == request.auth.uid;
      
      // Admins can manage all
      allow read, write, delete: if isAdmin();
      
      // Records subcollection
      match /records/{recordId} {
        allow read: if isFaculty() || isRegistrar() || isAdmin();
        allow write: if isAdmin() || isFaculty();
      }
    }
    
    // Grade Corrections Collection
    match /gradeCorrections/{correctionId} {
      // Students can read and create their own corrections
      allow read: if isStudent() && resource.data.filedBy == request.auth.uid;
      allow create: if isStudent() && request.resource.data.filedBy == request.auth.uid;
      
      // Faculty can read corrections for their courses
      allow read: if isFaculty();
      
      // Registrars can read and approve corrections
      allow read, update: if isRegistrar();
      
      // Admins have full access
      allow read, write, delete: if isAdmin();
      
      // Documents subcollection
      match /documents/{docId} {
        allow read: if isStudent() || isFaculty() || isRegistrar() || isAdmin();
        allow write: if isStudent() || isAdmin();
      }
    }
    
    // Notifications Collection
    match /notifications/{userId}/messages/{notificationId} {
      // Users can read their own notifications
      allow read: if isOwner(userId);
      
      // Users can mark their own notifications as read
      allow update: if isOwner(userId) &&
                       !request.resource.data.diff(resource.data)
                         .affectedKeys().hasAny(['type', 'title', 'message', 'createdAt']);
      
      // Only admin/system can write notifications
      allow create: if isAdmin();
    }
    
    // Audit Logs Collection
    match /auditLogs/{logId} {
      // Only admins can read audit logs
      allow read: if isAdmin();
      
      // Only system/admin can write
      allow create: if isAdmin();
      
      // Audit logs are immutable
      allow delete: if false;
    }
    
    // Reports Collection
    match /reports/{reportId} {
      // Admins can create and read reports
      allow read, create: if isAdmin();
      
      // Faculty/Registrars can read reports
      allow read: if (isFaculty() || isRegistrar());
      
      // Only admins can update/delete
      allow update, delete: if isAdmin();
    }
    
    // Email Logs Collection
    match /emailLogs/{logId} {
      // Only admins can read email logs
      allow read: if isAdmin();
      
      // Only system can write
      allow create: if isAdmin();
    }
    
    // Settings Collection
    match /settings/{settingId} {
      // Admins can read settings
      allow read: if isAdmin();
      
      // Only admins can create/update settings
      allow create, update: if isAdmin();
      
      allow delete: if false; // Never delete settings
    }
    
    // Sessions Collection
    match /sessions/{sessionId} {
      // Users can read their own sessions
      allow read: if resource.data.userId == request.auth.uid || isAdmin();
      
      // Users can create their own sessions
      allow create: if request.resource.data.userId == request.auth.uid;
      
      // Users can delete their own sessions
      allow delete: if resource.data.userId == request.auth.uid || isAdmin();
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## DATA VALIDATION & INDEXES

### Composite Indexes

```javascript
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "grades",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "courseId", "order": "ASCENDING" },
        { "fieldPath": "verificationStatus", "order": "ASCENDING" },
        { "fieldPath": "submittedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "grades",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "studentId", "order": "ASCENDING" },
        { "fieldPath": "verificationStatus", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "gradeVerifications",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "submittedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "gradeCorrections",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "submittedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "role", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "department", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "auditLogs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "auditLogs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "resource", "order": "ASCENDING" },
        { "fieldPath": "action", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "notifications",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "read", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

### Validation Schemas (Zod)

```typescript
// lib/validators.ts - Enhanced with Firebase validation

import { z } from 'zod';

export const userProfileSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),
  phone: z.string().optional(),
  role: z.enum(['student', 'faculty', 'registrar', 'admin']),
  department: z.string().min(1, 'Department required'),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
  permissions: z.array(z.string()).default([])
});

export const gradeSchema = z.object({
  studentId: z.string().uid('Invalid student ID'),
  courseId: z.string().min(3, 'Invalid course ID'),
  enrollmentId: z.string().min(1, 'Enrollment ID required'),
  score: z.number().min(0).max(100, 'Score must be 0-100'),
  letterGrade: z.enum(['A', 'B', 'C', 'D', 'F']),
  remarks: z.string().optional(),
  submittedBy: z.string().uid('Invalid user ID'),
  verificationStatus: z.enum(['pending', 'approved', 'rejected']).default('pending')
});

export const gradeVerificationSchema = z.object({
  courseId: z.string().min(3),
  gradeIds: z.array(z.string().min(1)).min(1, 'At least one grade required'),
  comments: z.string().optional(),
  verificationStatus: z.enum(['pending', 'approved', 'rejected']).default('pending')
});

export const bulkUploadSchema = z.object({
  courseId: z.string().min(3),
  csvData: z.string().min(10, 'CSV data too small'),
  fileName: z.string().endsWith('.csv', 'Must be CSV file')
});

export const correctionRequestSchema = z.object({
  courseId: z.string().min(3),
  gradeId: z.string().min(1),
  currentScore: z.number().min(0).max(100),
  requestedScore: z.number().min(0).max(100),
  reason: z.string().min(10, 'Provide detailed reason'),
  documentUrls: z.array(z.string().url()).optional()
});

export const notificationSchema = z.object({
  type: z.enum(['grade_posted', 'grade_approved', 'request_update', 'deadline', 'system']),
  title: z.string().min(5),
  message: z.string().min(10),
  relatedId: z.string().optional(),
  read: z.boolean().default(false),
  actionUrl: z.string().url().optional()
});

export const auditLogSchema = z.object({
  userId: z.string().uid(),
  action: z.string().min(1),
  resource: z.enum(['grade', 'user', 'course', 'correction', 'verification']),
  resourceId: z.string().min(1),
  oldValue: z.any().optional(),
  newValue: z.any().optional(),
  ipAddress: z.string().ip().optional(),
  status: z.enum(['success', 'failed']).default('success')
});
```

---

## API LAYER INTEGRATION

### Backend API Structure

```typescript
// app/api/grades/create/route.ts

import { v } from 'firebase-admin';
import { db } from '@/lib/firebase';
import { gradeSchema } from '@/lib/validators';
import { createAuditLog } from '@/services/auditService';

export async POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validation
    const validated = gradeSchema.parse(body);
    
    // Authorization (handled by middleware)
    const userId = request.headers.get('x-user-id');
    if (userId !== validated.submittedBy) {
      return new Response('Unauthorized', { status: 401 });
    }
    
    // Database operation
    const gradeId = await db.runTransaction(async (transaction) => {
      const gradeRef = db.collection('grades').doc();
      
      transaction.set(gradeRef, {
        ...validated,
        createdAt: FieldValue.serverTimestamp(),
        submittedAt: FieldValue.serverTimestamp()
      });
      
      // Create audit log
      await createAuditLog(transaction, {
        userId,
        action: 'grade_submitted',
        resource: 'grade',
        resourceId: gradeRef.id,
        newValue: validated,
        status: 'success'
      });
      
      return gradeRef.id;
    });
    
    return Response.json(
      { id: gradeId, message: 'Grade submitted successfully' },
      { status: 201 }
    );
    
  } catch (error) {
    // Log error and return response
    return Response.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
```

### Service Layer Pattern

```typescript
// services/gradeService.ts

import { db } from '@/lib/firebase';
import { Grade, User } from '@/types';

export class GradeService {
  static async getStudentGrades(
    studentId: string,
    filters?: { courseId?: string; status?: string }
  ): Promise<Grade[]> {
    let query = db
      .collection('grades')
      .where('studentId', '==', studentId)
      .where('verificationStatus', '==', 'approved');
    
    if (filters?.courseId) {
      query = query.where('courseId', '==', filters.courseId);
    }
    
    const snapshot = await query
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Grade));
  }
  
  static subscribeToGrades(
    studentId: string,
    callback: (grades: Grade[]) => void
  ): () => void {
    return db
      .collection('grades')
      .where('studentId', '==', studentId)
      .where('verificationStatus', '==', 'approved')
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        const grades = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Grade));
        callback(grades);
      });
  }
  
  static async submitGrade(gradeData: Partial<Grade>): Promise<string> {
    const ref = await db.collection('grades').add({
      ...gradeData,
      createdAt: FieldValue.serverTimestamp(),
      submittedAt: FieldValue.serverTimestamp(),
      verificationStatus: 'pending'
    });
    
    return ref.id;
  }
  
  static async updateGrade(
    gradeId: string,
    updates: Partial<Grade>
  ): Promise<void> {
    return db.collection('grades').doc(gradeId).update({
      ...updates,
      updatedAt: FieldValue.serverTimestamp()
    });
  }
  
  static async approveGrade(
    gradeId: string,
    userId: string,
    comments?: string
  ): Promise<void> {
    return db.runTransaction(async (transaction) => {
      transaction.update(db.collection('grades').doc(gradeId), {
        verificationStatus: 'approved',
        verifiedBy: userId,
        verifiedAt: FieldValue.serverTimestamp(),
        rejectionReason: null
      });
      
      // Create notification for student
      const grade = await transaction.get(
        db.collection('grades').doc(gradeId)
      );
      
      transaction.set(
        db.collection('notifications')
          .doc(grade.data().studentId)
          .collection('messages')
          .doc(),
        {
          type: 'grade_approved',
          title: `Grade Approved for ${grade.data().courseId}`,
          message: `Your grade of ${grade.data().letterGrade} has been approved.`,
          relatedId: gradeId,
          read: false,
          createdAt: FieldValue.serverTimestamp()
        }
      );
    });
  }
}
```

---

## FRONTEND STATE MANAGEMENT

### Custom Hooks Pattern

```typescript
// lib/useGrades.ts

import { useState, useEffect, useCallback } from 'react';
import { GradeService } from '@/services/gradeService';
import { Grade } from '@/types';

export function useGrades(studentId: string, filters?: any) {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    setLoading(true);
    
    // Real-time listener
    const unsubscribe = GradeService.subscribeToGrades(
      studentId,
      (data) => {
        setGrades(data);
        setLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, [studentId]);
  
  const submitGrade = useCallback(
    async (gradeData: Partial<Grade>) => {
      try {
        setLoading(true);
        await GradeService.submitGrade(gradeData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    []
  );
  
  return { grades, loading, error, submitGrade };
}

// lib/useAuth.ts

import { useContext, useCallback, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export function useAuth() {
  const context = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      context.setUser(user);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  return {
    ...context,
    loading
  };
}
```

### React Context for Global State

```typescript
// lib/AuthContext.tsx

import { createContext, ReactNode, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';

export interface AuthContextType {
  user: FirebaseUser | null;
  userRole?: string;
  setUser: (user: FirebaseUser | null) => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  logout: async () => {}
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userRole, setUserRole] = useState<string>();
  
  const logout = async () => {
    const auth = getAuth();
    await auth.signOut();
    setUser(null);
  };
  
  return (
    <AuthContext.Provider
      value={{ user, userRole, setUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
```

---

## MIGRATION & DATA SEEDING

### Database Seeding Script

```typescript
// scripts/seedDatabase.ts

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const app = initializeApp({
  credential: cert(require('./serviceAccountKey.json'))
});

const db = getFirestore(app);

async function seedDatabase() {
  console.log('🌱 Starting database seed...');
  
  try {
    // 1. Seed courses
    console.log('📚 Seeding courses...');
    const coursesData = [
      {
        code: 'COMP101',
        name: 'Introduction to Computer Science',
        department: 'Computer Science',
        semester: 'Fall',
        year: 2024,
        capacity: 30,
        credits: 3
      },
      // ... more courses
    ];
    
    for (const course of coursesData) {
      await db.collection('courses').doc(course.code).set({
        ...course,
        createdAt: FieldValue.serverTimestamp()
      });
    }
    
    // 2. Seed enrollments
    console.log('👥 Seeding enrollments...');
    // ... similar pattern
    
    // 3. Create settings
    console.log('⚙️ Seeding settings...');
    const settings = [
      {
        category: 'grading',
        key: 'min_score',
        value: 0,
        type: 'number'
      },
      // ... more settings
    ];
    
    for (const setting of settings) {
      await db.collection('settings').doc(`${setting.category}_${setting.key}`).set({
        ...setting,
        updatedAt: FieldValue.serverTimestamp()
      });
    }
    
    console.log('✅ Database seed completed successfully!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

seedDatabase();
```

---

## MONITORING & PERFORMANCE

### Real-Time Listener Best Practices

```typescript
// Pattern: Unsubscribe on unmount
useEffect(() => {
  const unsubscribe = db
    .collection('grades')
    .where('studentId', '==', userId)
    .onSnapshot(
      (snapshot) => {
        // Handle snapshot
      },
      (error) => {
        // Handle error
        console.error('Listener error:', error);
      }
    );
  
  return () => unsubscribe(); // Critical!
}, [userId]);
```

### Query Optimization Checklist

- ✅ Use indexes for all filtered/ordered queries
- ✅ Limit result set with `.limit()`
- ✅ Use pagination for large datasets
- ✅ Cache frequently accessed data
- ✅ Avoid fetching unnecessary fields
- ✅ Use subcollections for large arrays
- ✅ Implement exponential backoff for retries
- ✅ Monitor Firestore usage in Firebase Console

### Performance Metrics

```typescript
// Track Firestore usage
console.log('Firestore Read Operations:', readOps);
console.log('Firestore Write Operations:', writeOps);
console.log('Average Query Time (ms):', avgQueryTime);
console.log('Real-time Listeners Active:', activeListeners);
```

### Monitoring Dashboard Metrics

| Metric | Target | Alert |
|--------|--------|-------|
| Read Operations/day | < 100K | > 150K |
| Write Operations/day | < 50K | > 75K |
| Avg Query Time | < 500ms | > 1000ms |
| Active Listeners | < 100 | > 150 |
| Storage (GB) | < 10GB | > 15GB |

---

## DEPLOYMENT CHECKLIST

Before deploying to production:

- [ ] All indexes deployed to Firestore
- [ ] Security rules reviewed and tested
- [ ] Backups configured (Firebase Backups)
- [ ] Error logging enabled (Sentry/Cloud Functions)
- [ ] Monitoring alerts configured
- [ ] Rate limiting implemented
- [ ] CORS properly configured
- [ ] Environment variables set in production
- [ ] Data validation schemas finalized
- [ ] API rate limits documented
- [ ] Disaster recovery plan documented

---

## SUMMARY

This Firebase Integration Planning provides:

1. **Complete Firestore Schema** - All collections and fields defined
2. **Phased Implementation** - 4 sprints covering all features
3. **Security Layer** - Comprehensive Firestore security rules
4. **Code Patterns** - Services, hooks, and API examples
5. **Performance Strategy** - Indexing, query optimization
6. **Task Integration** - How each task uses Firebase

**Next Steps**:
1. Review this document with team
2. Adjust schema based on feedback
3. Deploy security rules to Firebase
4. Begin Sprint 1 implementation
5. Set up monitoring and logging

---

**Document Version**: 1.0  
**Last Updated**: February 10, 2026  
**Status**: Ready for Implementation
