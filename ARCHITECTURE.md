# System Architecture - Grades & Assessment Management

## 1. High-Level Architecture Overview

The Grades & Assessment Management system follows a modern three-tier architecture with clear separation of concerns:

```
┌──────────────────────────────────────────────────────────────────┐
│                     PRESENTATION TIER                             │
│  Next.js Pages (React Components) + TypeScript + Tailwind CSS    │
│  - Faculty Dashboard, Registrar Portal, Student Dashboard         │
└──────────────────────────────────────────────────────────────────┘
                            ↕ HTTP/HTTPS
┌──────────────────────────────────────────────────────────────────┐
│                    APPLICATION TIER                              │
│        Next.js API Routes + Firebase SDK Integration             │
│  - Authentication, Authorization, Business Logic, Validation     │
└──────────────────────────────────────────────────────────────────┘
                            ↕ REST/WebSocket
┌──────────────────────────────────────────────────────────────────┐
│                      DATA TIER                                   │
│  Firestore (Primary) + Firebase Realtime DB + Storage            │
└──────────────────────────────────────────────────────────────────┘
```

## 2. Component Architecture

### 2.1 Frontend Architecture

```
src/app/
├── layout.tsx ..................... Root layout with providers
├── page.tsx ....................... Landing page
├── (auth)/ ........................ Auth group (public routes)
│   ├── login/ ..................... Login page
│   └── register/ .................. Registration page
│
├── (dashboard)/ ................... Protected routes (requires auth)
│   ├── layout.tsx ................. Dashboard layout with sidebar
│   │
│   ├── faculty/ ................... Faculty routes
│   │   ├── grades/ ................ Grade encoding interface
│   │   ├── submissions/ ........... View submissions
│   │   ├── corrections/ ........... Correction requests
│   │   └── dashboard/ ............ Faculty overview
│   │
│   ├── registrar/ ................. Registrar routes
│   │   ├── verification/ .......... Grade verification
│   │   ├── approvals/ ............ Batch approvals
│   │   ├── reports/ ............... View reports
│   │   └── dashboard/ ............ Registrar overview
│   │
│   ├── student/ ................... Student routes
│   │   ├── grades/ ................ View grades
│   │   ├── transcript/ ............ Download transcript
│   │   ├── gpa/ ................... View GPA
│   │   └── dashboard/ ............ Student overview
│   │
│   └── admin/ ..................... Admin routes
│       ├── users/ ................. User management
│       ├── courses/ ............... Course management
│       ├── reports/ ............... System reports
│       └── settings/ .............. System settings
│
└── api/
    ├── auth/ ...................... Authentication endpoints
    ├── grades/ .................... Grade management endpoints
    ├── verification/ .............. Verification endpoints
    ├── corrections/ ............... Correction management
    └── reports/ ................... Report generation

src/components/
├── Layout/ ........................ Layout components
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── Navigation.tsx
│
├── Auth/ .......................... Authentication components
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   └── ProtectedRoute.tsx
│
├── GradeEntry/ .................... Grade encoding components
│   ├── GradeForm.tsx
│   ├── BulkUploadForm.tsx
│   ├── GradeTable.tsx
│   └── ValidationDisplay.tsx
│
├── GradeVerification/ ............. Verification components
│   ├── VerificationDashboard.tsx
│   ├── GradeReview.tsx
│   ├── BatchApprovalModal.tsx
│   └── VerificationLog.tsx
│
├── StudentGradeViewer/ ............ Student dashboard components
│   ├── GradeCard.tsx
│   ├── TranscriptView.tsx
│   ├── GPACalculator.tsx
│   └── GradeAnalytics.tsx
│
├── Reports/ ....................... Report components
│   ├── ReportGenerator.tsx
│   ├── GradeDistribution.tsx
│   ├── StatisticsPanel.tsx
│   └── ExportButtons.tsx
│
└── Common/ ......................... Reusable components
    ├── Button.tsx
    ├── Modal.tsx
    ├── Table.tsx
    ├── Form.tsx
    ├── Alert.tsx
    └── LoadingSpinner.tsx

src/lib/
├── firebase.ts .................... Firebase initialization
├── auth.ts ........................ Authentication utilities
├── validators.ts .................. Input validation
├── types.ts ....................... TypeScript interfaces
└── utils/ ......................... Helper functions
    ├── gradeCalculations.ts
    ├── dateFormatters.ts
    └── errorHandlers.ts

src/services/
├── gradeService.ts ................ Grade operations
├── verificationService.ts ......... Verification operations
├── reportService.ts ............... Report generation
├── authService.ts ................. Authentication logic
└── correctionService.ts ........... Correction handling

src/hooks/
├── useAuth.ts ..................... Authentication hook
├── useGrades.ts ................... Grades hook
├── useUser.ts ..................... User hook
├── useNotification.ts ............. Notification hook
└── useFetch.ts .................... Custom fetch hook
```

### 2.2 Backend Architecture

```
Next.js API Routes Structure:

/api/
├── /auth
│   ├── login.ts .................. POST - User login
│   ├── logout.ts ................. POST - User logout
│   ├── register.ts ............... POST - User registration
│   └── me.ts ..................... GET  - Current user

├── /grades
│   ├── encode.ts ................. POST - Create grade
│   ├── [id]/
│   │   ├── index.ts .............. GET/PUT - Get/Update grade
│   │   └── history.ts ............ GET - Grade history
│   ├── courses/[courseId].ts ..... GET - Course grades
│   └── bulk-upload.ts ............ POST - Bulk upload

├── /verification
│   ├── pending.ts ................. GET - Pending verifications
│   ├── [id]/
│   │   ├── approve.ts ............ PUT - Approve grade
│   │   └── reject.ts ............ PUT - Reject grade
│   └── batch-approve.ts .......... POST - Batch approval

├── /corrections
│   ├── create.ts .................. POST - Create request
│   ├── [id]/
│   │   ├── approve.ts ............ PUT - Approve request
│   │   └── reject.ts ............ PUT - Reject request
│   ├── my-requests.ts ............ GET - Faculty requests
│   └── pending.ts ................ GET - Pending approvals

├── /reports
│   ├── class/[courseId].ts ........ GET - Class report
│   ├── transcript/[studentId].ts .. GET - Transcript
│   ├── statistics/[courseId].ts ... GET - Statistics
│   └── export.ts .................. POST - Export report

└── /admin
    ├── users.ts ................... User management
    ├── courses.ts ................. Course management
    └── settings.ts ................ System settings
```

### 2.3 Business Logic Layer

```
Services:

GradeService
├── submitGrade()
├── updateGrade()
├── deleteGrade()
├── getStudentGrades()
├── getCourseGrades()
├── validateGrade()
└── bulkImport()

VerificationService
├── getPendingVerifications()
├── approveGrade()
├── rejectGrade()
├── getVerificationHistory()
├── validateGradeRules()
└── batchApproveGrades()

ReportService
├── generateClassReport()
├── generateStudentTranscript()
├── generateStatistics()
├── calculateGPA()
├── exportToCSV()
└── exportToPDF()

CorrectionService
├── createCorrectionRequest()
├── approveCorrectionRequest()
├── rejectCorrectionRequest()
├── trackApprovals()
└── notifyStakeholders()

AuthService
├── login()
├── logout()
├── register()
├── validateToken()
├── refreshToken()
└── getCurrentUser()
```

## 3. Data Flow Architecture

### 3.1 Grade Submission Flow

```
Faculty Submit Grade
        ↓
GradeForm Validation
        ↓
POST /api/grades/encode
        ↓
AuthMiddleware (verify faculty role)
        ↓
GradeValidator (validate rules)
        ↓
Firestore Save (status: 'submitted')
        ↓
Create Audit Log
        ↓
Send Notification to Registrar
        ↓
Return Success Response
        ↓
Update UI with Confirmation
```

### 3.2 Grade Verification Flow

```
Registrar Access Dashboard
        ↓
GET /api/verification/pending
        ↓
Fetch Submitted Grades
        ↓
Display in Verification Dashboard
        ↓
Registrar Reviews Grade
        ↓
PUT /api/verification/:id/approve
        ↓
AuthMiddleware (verify registrar role)
        ↓
Update Grade Status (submitted → approved)
        ↓
Create Audit Log with registrar details
        ↓
Send Notification to Faculty + Students
        ↓
Return Success Response
```

### 3.3 Grade Correction Request Flow

```
Faculty File Correction Request
        ↓
CorrectionForm with Justification
        ↓
POST /api/corrections/create
        ↓
Save Request (status: 'submitted')
        ↓
Queue for Registrar Review
        ↓
Registrar Reviews (approve/reject/forward)
        ↓
If Approved → Forward to Department Head
        ↓
If Approved → Forward to Provost (final approval)
        ↓
Update Original Grade (if final approval)
        ↓
Send Notifications at Each Step
        ↓
Create Audit Trail
        ↓
Return Confirmation
```

### 3.4 Report Generation Flow

```
Admin Request Report
        ↓
SELECT * FROM grades WHERE criteria
        ↓
Firestore Query with Filters
        ↓
Aggregate Data (mean, median, std dev)
        ↓
Generate Statistics
        ↓
Format Report (PDF/CSV/Excel)
        ↓
Store in Firebase Storage
        ↓
Return Download Link
        ↓
User Downloads File
```

## 4. Firebase Architecture

### 4.1 Firestore Database Design

**Collections Structure**:

```
users/
  {userId}/
    - email (indexed)
    - name
    - role (indexed)
    - department
    - photoURL
    - createdAt (indexed)
    - updatedAt

courses/
  {courseId}/
    - code (indexed)
    - title
    - department (indexed)
    - facultyId (indexed)
    - semester
    - year
    - enrolledStudents (array)
    - gradingScale
    - createdAt

grades/
  {gradeId}/
    - courseId (indexed)
    - studentId (indexed)
    - facultyId (indexed)
    - score (indexed)
    - letterGrade
    - status (indexed)
    - remarks
    - verifiedBy
    - approvedBy
    - createdAt (indexed)
    - updatedAt (indexed)
    - revisionNumber

gradeCorrectionRequests/
  {requestId}/
    - gradeId (indexed)
    - courseId (indexed)
    - studentId (indexed)
    - facultyId (indexed)
    - originalGrade
    - proposedGrade
    - reason
    - status (indexed)
    - approvalChain
    - createdAt (indexed)
    - updatedAt

auditLogs/
  {logId}/
    - userId (indexed)
    - action (indexed)
    - entityType (indexed)
    - entityId (indexed)
    - changes
    - timestamp (indexed)
    - ipAddress

notifications/
  {userId}/
    {notificationId}/
      - type
      - title
      - message
      - read
      - createdAt (indexed)
      - actionUrl
```

### 4.2 Firebase Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function hasRole(role) {
      return isAuthenticated() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == role;
    }
    
    function isFacultyOfCourse(courseId) {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/courses/$(courseId)).data.facultyId == request.auth.uid;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated() && (request.auth.uid == userId || hasRole('admin'));
      allow update: if request.auth.uid == userId;
      allow create, delete: if hasRole('admin');
    }
    
    // Courses collection
    match /courses/{courseId} {
      allow read: if isAuthenticated();
      allow write: if hasRole('admin') || isFacultyOfCourse(courseId);
    }
    
    // Grades collection
    match /grades/{gradeId} {
      allow read: if isAuthenticated() && (
        hasRole('registrar') || 
        hasRole('admin') ||
        resource.data.studentId == request.auth.uid ||
        resource.data.facultyId == request.auth.uid
      );
      
      allow create: if hasRole('faculty') && request.resource.data.facultyId == request.auth.uid;
      
      allow update: if hasRole('registrar') || 
                       (hasRole('faculty') && resource.data.facultyId == request.auth.uid && 
                        resource.data.status == 'draft');
      
      allow delete: if hasRole('admin');
    }
    
    // Audit logs collection (append-only)
    match /auditLogs/{logId} {
      allow read: if hasRole('admin');
      allow create: if request.auth != null;
    }
    
    // Notifications collection
    match /notifications/{userId}/{notificationId} {
      allow read, update: if request.auth.uid == userId;
      allow create: if request.auth != null;
    }
  }
}
```

## 5. Authentication & Authorization

### 5.1 Authentication Flow

```
Client (Login)
    ↓
POST /api/auth/login
    ↓
Firebase Auth: email + password
    ↓
Generate Custom Token
    ↓
Return JWT + User Data
    ↓
Store in Session/Cookies (secure, httpOnly)
    ↓
Client Ready with Auth Context
```

### 5.2 Authorization Checks

```
Protected API Route
    ↓
Verify JWT Token
    ↓
Fetch User from Firestore
    ↓
Check User Role
    ↓
Role-Based Access Control (RBAC)
    ↓
Grant/Deny Access
    ↓
Audit Log the Access
```

## 6. Error Handling Architecture

```
Client-Side Errors
├── Form Validation Errors → Display inline validation
├── Network Errors → Retry logic + offline fallback
└── User-Friendly Error Messages

Server-Side Errors
├── 400 Bad Request → Validation failed
├── 401 Unauthorized → Auth failed
├── 403 Forbidden → Permission denied
├── 404 Not Found → Resource not found
└── 500 Server Error → Log and notify admin

Error Handling Middleware
├── Try-Catch blocks
├── Firebase error mapping
├── Consistent error response format
└── Logging to monitoring service
```

## 7. Performance Architecture

### 7.1 Frontend Optimization

- Code splitting (dynamic imports)
- Image optimization (next/image)
- CSS-in-JS optimization (Tailwind)
- Lazy loading components
- React.memo for expensive components
- Zustand for lightweight state management

### 7.2 Backend Optimization

- Firestore indexing strategy
- Query optimization with composite indexes
- Pagination for large datasets (first/next)
- Caching layer for frequently accessed data
- Rate limiting on API endpoints

### 7.3 Database Optimization

```
Firestore Indexes:
- grades: (courseId, status, createdAt)
- grades: (studentId, status, createdAt)
- users: (role, department)
- courses: (facultyId, year, semester)
- auditLogs: (userId, timestamp, action)
```

## 8. Deployment Architecture

### 8.1 Frontend Deployment (Vercel)

```
Git Push → main branch
    ↓
GitHub Webhook Trigger
    ↓
Vercel Build Pipeline
    ↓
Install Dependencies
    ↓
Build Next.js App
    ↓
Run Tests
    ↓
Deploy to CDN
    ↓
Preview URL Generated
```

### 8.2 Backend Deployment (Firebase)

```
Deploy Firebase Functions
    ↓
Update Firestore Rules
    ↓
Deploy to Production
    ↓
Monitor Cloud Functions
```

## 9. Monitoring & Logging

### 9.1 Application Monitoring

- Vercel Analytics for frontend performance
- Firebase Crashlytics for error tracking
- Custom logging for business operations
- Error Reporting dashboard

### 9.2 Audit Trail

```
AuditLog Entry:
{
  userId: string,
  action: 'CREATE_GRADE' | 'VERIFY_GRADE' | 'CORRECT_GRADE',
  entityType: 'GRADE' | 'CORRECTION' | 'USER',
  entityId: string,
  changes: object,
  timestamp: serverTimestamp,
  ipAddress: string
}
```

---

**Last Updated**: December 17, 2025
