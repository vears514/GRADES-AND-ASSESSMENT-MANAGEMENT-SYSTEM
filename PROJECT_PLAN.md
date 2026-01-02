# Grades & Assessment Management Sub-system - Project Plan

## 1. Project Overview

### Purpose
Handles grade encoding, verification, and storage for academic evaluation. This system enables faculty to encode grades, registrars to verify and approve them, and students to view their academic performance.

### Project Scope
- Grade encoding by faculty members
- Multi-level grade verification workflow
- Student grade viewing portal
- Grade correction/change request handling
- Comprehensive grade reporting and analytics

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                         │
│               Next.js 14+ (React) + TypeScript              │
│              Tailwind CSS + Component Library               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API & MIDDLEWARE LAYER                   │
│              Next.js API Routes + Firebase SDK              │
│              Authentication & Authorization                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND SERVICES LAYER                   │
│              Firebase Cloud Functions (Optional)             │
│         Business Logic & Validation Processing              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA & STORAGE LAYER                     │
│        Firestore (Primary) + Realtime DB (Real-time)       │
│             Firebase Storage (Document Archival)            │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

### Frontend
- **Framework**: Next.js 14+
- **Language**: TypeScript
- **UI Framework**: React
- **Styling**: Tailwind CSS
- **State Management**: React Context API / Zustand
- **HTTP Client**: Axios or Fetch API
- **Charts/Analytics**: Chart.js or Recharts

### Backend
- **Server Framework**: Next.js API Routes
- **Authentication**: Firebase Authentication (Email/SSO)
- **Cloud Functions**: Firebase Cloud Functions (for complex operations)
- **Validation**: Zod or Yup

### Database
- **Primary Database**: Cloud Firestore
  - Real-time updates
  - Scalability for concurrent users
  - Transaction support for grade verification workflow
- **Realtime Database**: Firebase Realtime Database (optional, for live notifications)

### Storage
- **Document Storage**: Firebase Storage
  - Grade sheets (PDF/Excel)
  - Verification documents
  - Audit logs

### Hosting & Deployment
- **Frontend**: Vercel (automatic deployments from Git)
- **Backend/Functions**: Firebase Hosting + Cloud Functions
- **CI/CD**: GitHub Actions

---

## 4. Module Breakdown

### 4.1 Grade Encoding Module

**Purpose**: Faculty members input and manage grades for enrolled students

**Key Features**:
- Bulk grade upload (CSV/Excel)
- Individual grade entry form
- Auto-save functionality
- Validation rules per course/grading scale
- Grade history tracking
- Save as draft functionality

**Actors**: Faculty Members

**Data Model**:
```
Grade Encoding
├── courseId: string
├── facultyId: string
├── studentId: string
├── score: number (0-100 or custom scale)
├── letterGrade: string (A, B, C, D, F)
├── weightage: number
├── remarks: string (optional)
├── status: 'draft' | 'submitted' | 'verified' | 'approved'
├── createdAt: timestamp
├── updatedAt: timestamp
└── metadata: object
```

**API Endpoints**:
- `POST /api/grades/encode` - Submit grade
- `PUT /api/grades/encode/:id` - Update grade (draft)
- `GET /api/grades/courses/:courseId` - Get all grades for course
- `POST /api/grades/bulk-upload` - Bulk upload
- `GET /api/grades/history/:studentId` - Grade history

---

### 4.2 Grade Verification & Approval Module

**Purpose**: Registrar reviews and verifies grades before final posting

**Key Features**:
- Dashboard showing pending verifications
- Grade validation rules checking
- Comments/notes on verification
- Batch approval functionality
- Exception handling for flagged grades
- Audit trail for all verifications

**Actors**: Registrar, Academic Administrator

**Workflow**:
1. Faculty submits grades (status: submitted)
2. Registrar reviews for completeness and validity (status: under_review)
3. Registrar approves or requests corrections (status: approved/rejected)
4. Faculty corrects if needed, resubmits
5. Final approval locks the grade (status: final)

**API Endpoints**:
- `GET /api/verification/pending` - Get pending verifications
- `PUT /api/verification/:gradeId/approve` - Approve grade
- `PUT /api/verification/:gradeId/reject` - Reject with reason
- `GET /api/verification/course/:courseId` - Course verification status
- `POST /api/verification/batch-approve` - Approve multiple grades
- `GET /api/verification/audit-log` - Verification history

---

### 4.3 Student Grade Viewer Module

**Purpose**: Students view their approved grades

**Key Features**:
- Personal grade dashboard
- Filter by semester/year/course
- GPA calculator
- Grade trends/analytics
- Downloadable grade sheet
- Grade dispute notifications

**Actors**: Students

**Data Display**:
- Current semester grades
- Overall GPA / CGPA
- Grade breakdown by course
- Pass/fail status
- Grade comparison (optional - benchmarking)

**API Endpoints**:
- `GET /api/student/grades` - Get authenticated student's grades
- `GET /api/student/gpa` - Calculate GPA
- `GET /api/student/transcript` - Full transcript
- `GET /api/student/grades/:courseId` - Specific course grade

---

### 4.4 Grade Correction/Request Handling Module

**Purpose**: Manage requests for grade changes with validation workflow

**Key Features**:
- Faculty can file grade correction requests
- Reason/justification required
- Supporting documentation upload
- Approval workflow (Registrar -> Department Head -> Provost)
- Status tracking for requestor
- Automatic notifications

**Actors**: Faculty, Registrar, Department Head, Provost

**Grade Correction Request Model**:
```
GradeCorrectionRequest
├── id: string
├── courseId: string
├── studentId: string
├── facultyId: string
├── originalGrade: number
├── proposedGrade: number
├── reason: string
├── supportingDocuments: string[] (file references)
├── status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'
├── approvalChain: array
│   ├── registrarApproval: {timestamp, approved, comments}
│   ├── departmentHeadApproval: {timestamp, approved, comments}
│   └── provostApproval: {timestamp, approved, comments}
├── createdAt: timestamp
├── updatedAt: timestamp
└── rejectionReason: string (if rejected)
```

**API Endpoints**:
- `POST /api/correction-requests/create` - File new request
- `GET /api/correction-requests/my-requests` - Faculty's requests
- `GET /api/correction-requests/pending` - Pending approvals (admin)
- `PUT /api/correction-requests/:id/approve` - Approve request
- `PUT /api/correction-requests/:id/reject` - Reject request
- `POST /api/correction-requests/:id/upload-document` - Upload supporting docs

---

### 4.5 Grade Reports & Summary Module

**Purpose**: Generate comprehensive grade reports and analytics

**Key Features**:
- Class grade sheets (PDF/Excel export)
- Pass/fail summaries
- Grade distribution analysis
- Statistical analytics (mean, median, std dev)
- Performance benchmarking
- Trend analysis over semesters
- Custom report generation

**Report Types**:
1. **Class Report**: All grades for a specific course
2. **Student Transcript**: Complete academic record
3. **Department Summary**: Aggregate performance metrics
4. **Grade Distribution**: Statistical analysis of grades
5. **Pass/Fail Report**: Summary of pass rates by course
6. **Performance Trends**: Grade trends over time
7. **Outlier Detection**: Flagged unusual grade patterns

**API Endpoints**:
- `GET /api/reports/class/:courseId` - Class grade sheet
- `GET /api/reports/student-transcript/:studentId` - Student transcript
- `GET /api/reports/grade-distribution/:courseId` - Distribution analysis
- `GET /api/reports/statistics/:courseId` - Statistical summary
- `POST /api/reports/export` - Export report (PDF/Excel)
- `GET /api/reports/analytics` - Dashboard analytics

---

## 5. User Roles & Permissions

| Role | Encode Grades | Verify Grades | View Grades | Correct Grades | View Reports | Approve Corrections |
|------|---------------|---------------|-------------|----------------|--------------|-------------------|
| Faculty | ✓ | ✗ | Own | ✓ (request) | Own courses | ✗ |
| Registrar | ✗ | ✓ | All | ✗ | All | ✓ (level 1) |
| Department Head | ✗ | ✗ | Dept | ✗ | Dept | ✓ (level 2) |
| Provost/Dean | ✗ | ✗ | All | ✗ | All | ✓ (level 3) |
| Student | ✗ | ✗ | Own | ✗ | Own | ✗ |

---

## 6. Database Schema (Firestore Collections)

```
firestore/
├── users/
│   ├── {userId}/
│   │   ├── email: string
│   │   ├── name: string
│   │   ├── role: 'faculty' | 'registrar' | 'student' | 'admin'
│   │   ├── department: string
│   │   ├── photoURL: string
│   │   └── createdAt: timestamp
│
├── courses/
│   ├── {courseId}/
│   │   ├── code: string
│   │   ├── title: string
│   │   ├── department: string
│   │   ├── facultyId: string
│   │   ├── semester: string
│   │   ├── year: number
│   │   ├── enrolledStudents: array
│   │   ├── gradingScale: object
│   │   └── createdAt: timestamp
│
├── grades/
│   ├── {gradeId}/
│   │   ├── courseId: string
│   │   ├── studentId: string
│   │   ├── facultyId: string
│   │   ├── score: number
│   │   ├── letterGrade: string
│   │   ├── status: string
│   │   ├── remarks: string
│   │   ├── verifiedBy: string (registrar id)
│   │   ├── approvedBy: string (dean id)
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp
│
├── gradeCorrectionRequests/
│   ├── {requestId}/
│   │   ├── gradeId: string
│   │   ├── courseId: string
│   │   ├── studentId: string
│   │   ├── facultyId: string
│   │   ├── originalGrade: number
│   │   ├── proposedGrade: number
│   │   ├── reason: string
│   │   ├── status: string
│   │   ├── approvalChain: object
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp
│
├── auditLogs/
│   ├── {logId}/
│   │   ├── userId: string
│   │   ├── action: string
│   │   ├── entityType: string
│   │   ├── entityId: string
│   │   ├── changes: object
│   │   ├── timestamp: timestamp
│   │   └── ipAddress: string
│
└── notifications/
    ├── {userId}/
    │   ├── {notificationId}/
    │   │   ├── type: string
    │   │   ├── title: string
    │   │   ├── message: string
    │   │   ├── read: boolean
    │   │   ├── createdAt: timestamp
    │   │   └── actionUrl: string
```

---

## 7. Security & Compliance

### Authentication & Authorization
- Firebase Authentication for secure login
- Role-based access control (RBAC)
- Token-based API authentication (JWT)
- Multi-factor authentication (MFA) for admins

### Data Protection
- End-to-end encryption for sensitive grade data
- Row-level security with Firestore rules
- GDPR compliance for student data
- Regular data backups

### Audit & Logging
- All grade modifications logged
- User action audit trail
- Grade verification history
- Correction request tracking

### Validation
- Server-side validation for all grade inputs
- Business logic validation (e.g., grade ranges)
- Duplicate grade prevention
- Referential integrity checks

---

## 8. File Structure

```
grades-assessment-system/
├── public/
│   ├── images/
│   └── documents/
│
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── faculty/
│   │   │   ├── registrar/
│   │   │   ├── student/
│   │   │   └── admin/
│   │   └── api/
│   │       ├── auth/
│   │       ├── grades/
│   │       ├── verification/
│   │       ├── corrections/
│   │       └── reports/
│   │
│   ├── components/
│   │   ├── Layout/
│   │   ├── Auth/
│   │   ├── GradeEntry/
│   │   ├── GradeVerification/
│   │   ├── StudentGradeViewer/
│   │   ├── Reports/
│   │   └── Common/
│   │
│   ├── lib/
│   │   ├── firebase.ts
│   │   ├── auth.ts
│   │   ├── validators.ts
│   │   ├── types.ts
│   │   └── utils/
│   │
│   ├── services/
│   │   ├── gradeService.ts
│   │   ├── verificationService.ts
│   │   ├── reportService.ts
│   │   └── authService.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useGrades.ts
│   │   └── useUser.ts
│   │
│   └── styles/
│       └── globals.css
│
├── firebase/
│   ├── functions/
│   │   ├── index.ts
│   │   ├── gradeProcessor.ts
│   │   ├── notifications.ts
│   │   └── reports.ts
│   │
│   └── firestore.rules
│
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 9. Development Phases

### Phase 1: Foundation (Weeks 1-2)
- [ ] Project setup with Next.js, TypeScript, Tailwind
- [ ] Firebase configuration and authentication
- [ ] Database schema design and Firestore setup
- [ ] User management and role-based access control
- [ ] API route structure

### Phase 2: Core Grade Encoding (Weeks 3-4)
- [ ] Grade entry form component
- [ ] Individual grade submission API
- [ ] Bulk upload functionality
- [ ] Grade validation and storage
- [ ] Faculty dashboard

### Phase 3: Verification Workflow (Weeks 5-6)
- [ ] Verification dashboard for registrars
- [ ] Grade review and approval UI
- [ ] Batch approval functionality
- [ ] Audit logging system
- [ ] Email notifications

### Phase 4: Student Portal (Weeks 7)
- [ ] Student grade viewing interface
- [ ] GPA calculation engine
- [ ] Grade transcript generation
- [ ] Performance analytics display

### Phase 5: Grade Corrections (Weeks 8-9)
- [ ] Grade correction request form
- [ ] Multi-level approval workflow
- [ ] Document upload system
- [ ] Correction tracking and notifications

### Phase 6: Reporting & Analytics (Weeks 10-11)
- [ ] Report generation engine
- [ ] Multiple report types implementation
- [ ] PDF/Excel export functionality
- [ ] Analytics dashboard
- [ ] Statistical analysis

### Phase 7: Testing & Deployment (Weeks 12)
- [ ] Unit and integration testing
- [ ] User acceptance testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Production deployment

---

## 10. API Documentation Quick Reference

### Authentication
```
POST   /api/auth/login              - User login
POST   /api/auth/logout             - User logout
POST   /api/auth/register           - User registration
GET    /api/auth/me                 - Current user info
```

### Grades
```
POST   /api/grades/encode           - Submit grade
PUT    /api/grades/encode/:id       - Update grade (draft)
GET    /api/grades/courses/:id      - Get course grades
POST   /api/grades/bulk-upload      - Bulk upload
GET    /api/grades/history/:id      - Grade history
```

### Verification
```
GET    /api/verification/pending    - Pending verifications
PUT    /api/verification/:id/approve - Approve grade
PUT    /api/verification/:id/reject  - Reject grade
POST   /api/verification/batch-approve - Batch approval
```

### Student
```
GET    /api/student/grades          - Student grades
GET    /api/student/gpa             - Calculate GPA
GET    /api/student/transcript      - Full transcript
```

### Corrections
```
POST   /api/corrections/create      - File correction request
GET    /api/corrections/my-requests - Faculty requests
GET    /api/corrections/pending     - Pending approvals
PUT    /api/corrections/:id/approve - Approve request
```

### Reports
```
GET    /api/reports/class/:id       - Class grade sheet
GET    /api/reports/transcript/:id  - Student transcript
GET    /api/reports/distribution/:id - Grade distribution
POST   /api/reports/export          - Export report
```

---

## 11. Testing Strategy

- **Unit Tests**: Jest for utility functions and services
- **Integration Tests**: Testing API routes with test database
- **E2E Tests**: Cypress for critical user workflows
- **Performance Tests**: Lighthouse for frontend performance

---

## 12. Deployment Strategy

### Frontend (Vercel)
- Automatic deployments on push to main branch
- Environment-based configuration
- CDN optimization

### Backend (Firebase)
- Cloud Functions deployment
- Firestore configuration
- Storage buckets setup

### CI/CD Pipeline
- GitHub Actions for automated testing
- Staging environment for QA
- Production rollout strategy

---

## 13. Success Metrics

- Grade encoding time reduced by 50%
- Verification workflow completion time < 2 hours
- 99.9% system uptime
- Student grade access within 1 minute after approval
- System performance: page load < 2 seconds
- User adoption rate > 95% within first month

---

## 14. Contact & Support

- **Project Manager**: [Name/Contact]
- **Technical Lead**: [Name/Contact]
- **Documentation**: [Wiki/Confluence Link]
- **Issue Tracking**: GitHub Issues

---

**Document Version**: 1.0  
**Last Updated**: December 17, 2025  
**Status**: In Development
