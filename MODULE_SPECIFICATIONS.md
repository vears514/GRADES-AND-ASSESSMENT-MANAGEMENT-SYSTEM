# Detailed Module Specifications

## Module 1: Grade Encoding System

### Overview
The Grade Encoding module allows faculty members to input and manage student grades for their courses with comprehensive validation and audit trails.

### Functional Requirements

#### FR1.1 Individual Grade Entry
- Faculty can enter grades for individual students
- Support multiple grading scales (0-100, A-F, GPA 0-4.0, custom)
- Auto-save functionality every 30 seconds
- Draft status preservation

**UI Form Fields**:
```
- Course Selection (dropdown)
- Student Selection (searchable)
- Score Input (numeric validation)
- Letter Grade (auto-calculated or manual)
- Remarks (optional text area)
- Weightage (for components like midterm, final, project)
```

#### FR1.2 Bulk Grade Upload
- Upload CSV/Excel files with grade data
- Template provided for consistency
- Validation report before confirmation
- Rollback capability if errors found

**CSV Format**:
```
StudentID,StudentName,Score,LetterGrade,Weightage,Remarks
S001,John Doe,85,A,1.0,Excellent
S002,Jane Smith,78,B,1.0,Good
```

#### FR1.3 Grade Validation
- Score range validation (0-100)
- Mandatory field validation
- Duplicate grade prevention
- Referential integrity with courses and students
- Business rule validation (e.g., grade cannot be negative)

#### FR1.4 Draft Management
- Save grades as draft
- Edit draft grades before submission
- Delete draft grades
- View draft vs submitted status clearly

#### FR1.5 Grade History & Revision Tracking
- View history of all grade changes
- Timestamp of each modification
- Identify who made changes (audit trail)
- Rollback to previous versions (admin only)

### Non-Functional Requirements

| Requirement | Specification |
|-------------|---------------|
| Response Time | < 2 seconds for grade save |
| Bulk Upload Limit | 1000 students per upload |
| Maximum File Size | 5 MB |
| Concurrent Users | 100+ simultaneous faculty |
| Data Consistency | ACID transactions |

### API Specifications

```typescript
// Grade Encoding Endpoints

POST /api/grades/encode
Request: {
  courseId: string,
  studentId: string,
  score: number,
  letterGrade: string,
  weightage?: number,
  remarks?: string
}
Response: {
  id: string,
  status: 'draft' | 'submitted',
  createdAt: timestamp,
  message: string
}

PUT /api/grades/encode/:gradeId
Request: {
  score?: number,
  letterGrade?: string,
  remarks?: string
}
Response: {
  id: string,
  updatedAt: timestamp,
  message: string
}

GET /api/grades/courses/:courseId
Response: {
  grades: Grade[],
  total: number,
  statuses: {
    draft: number,
    submitted: number,
    verified: number
  }
}

POST /api/grades/bulk-upload
Request: FormData with file
Response: {
  uploadId: string,
  validationReport: {
    totalRows: number,
    validRows: number,
    errors: ValidationError[]
  }
}

GET /api/grades/history/:studentId
Response: {
  history: GradeHistoryEntry[],
  total: number
}
```

### Data Model

```typescript
interface Grade {
  id: string;
  courseId: string;
  studentId: string;
  facultyId: string;
  score: number;
  letterGrade: string;
  weightage: number;
  remarks: string;
  status: 'draft' | 'submitted' | 'verified' | 'approved';
  revisionNumber: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  verifiedBy?: string;
  approvedBy?: string;
  metadata: {
    uploadBatchId?: string;
    componentType?: string; // 'midterm', 'final', 'project'
  };
}

interface GradeHistoryEntry {
  timestamp: Timestamp;
  action: 'created' | 'updated' | 'verified' | 'approved';
  modifiedBy: string;
  previousValue?: number;
  newValue?: number;
  reason?: string;
}
```

---

## Module 2: Grade Verification & Approval System

### Overview
The Verification module implements a multi-level approval workflow for submitted grades with comprehensive review capabilities.

### Functional Requirements

#### FR2.1 Verification Dashboard
- Display all submitted grades pending verification
- Filter by course, department, date range
- Quick stats: total pending, overdue, flagged
- Search functionality

#### FR2.2 Grade Review Interface
- Display student info, course details, and grade
- Show grade statistics for the course (mean, median)
- Compare against class average
- Flag anomalies (very high/low grades)
- Add verification notes/comments

#### FR2.3 Approval Workflow
```
Status Flow:
draft → submitted → under_review → approved → final
                  ↘ rejected → submitted (resubmit)
```

#### FR2.4 Batch Approval
- Select multiple grades (by course, status, date)
- Bulk approve if all pass validation
- Bulk reject with common reason
- Transaction-based (all-or-nothing)

#### FR2.5 Exception Handling
- Flag grades with unusual patterns
- Route high-variance grades for additional review
- Require justification for grades outside norms
- Escalation mechanism for disputed grades

#### FR2.6 Audit Trail
- Complete history of verification actions
- Who approved, when, and any comments
- Queryable audit log for compliance

### API Specifications

```typescript
GET /api/verification/pending
Query: {
  courseId?: string,
  department?: string,
  limit?: number,
  offset?: number
}
Response: {
  grades: GradeWithStatistics[],
  total: number,
  stats: {
    avgScore: number,
    medianScore: number,
    stdDev: number
  }
}

PUT /api/verification/:gradeId/approve
Request: {
  notes?: string,
  reviewedAt: timestamp
}
Response: {
  id: string,
  status: 'approved',
  approvedAt: timestamp
}

PUT /api/verification/:gradeId/reject
Request: {
  reason: string,
  comments?: string
}
Response: {
  id: string,
  status: 'rejected',
  rejectionReason: string
}

POST /api/verification/batch-approve
Request: {
  gradeIds: string[],
  courseId: string,
  notes?: string
}
Response: {
  approved: number,
  failed: number,
  errors?: ValidationError[]
}

GET /api/verification/audit-log
Query: {
  userId?: string,
  entityType?: string,
  startDate?: date,
  endDate?: date
}
Response: {
  logs: AuditLogEntry[],
  total: number
}
```

---

## Module 3: Student Grade Viewer

### Overview
Provides students with secure access to view their approved grades and academic performance.

### Functional Requirements

#### FR3.1 Grade Dashboard
- Display all approved grades
- Organize by semester/year
- Show current semester prominently
- Course code, title, credit hours, grade
- Date approved

#### FR3.2 GPA Calculation
- Calculate semester GPA
- Calculate cumulative GPA (CGPA)
- Show grade distribution breakdown
- Display academic standing

#### FR3.3 Grade Transcript
- View complete academic record
- Filter by semester/year range
- Generate PDF transcript
- Print-friendly format

#### FR3.4 Grade Analytics
- Grade trends over time
- Performance visualization (chart)
- Comparison with class average (anonymized)
- Performance improvements/declines

#### FR3.5 Notifications
- Alert when grades are posted
- Alert for flagged grades
- Grade dispute notifications
- Grade correction updates

### API Specifications

```typescript
GET /api/student/grades
Response: {
  currentSemester: {
    semester: string,
    grades: Grade[]
  },
  allGrades: Grade[],
  gpa: {
    semesterGPA: number,
    cumulativeGPA: number
  }
}

GET /api/student/gpa
Response: {
  semesterGPA: number,
  cumulativeGPA: number,
  academicStanding: string,
  gradeBreakdown: {
    A: number,
    B: number,
    C: number,
    D: number,
    F: number
  }
}

GET /api/student/transcript
Query: {
  startSemester?: string,
  endSemester?: string,
  format?: 'json' | 'pdf'
}
Response: (PDF download or JSON data)

GET /api/student/grades/:courseId
Response: {
  grade: Grade,
  courseDetails: Course,
  classStatistics: {
    mean: number,
    median: number,
    highestGrade: number,
    lowestGrade: number
  }
}
```

### Data Display Components

```typescript
interface StudentGradeCard {
  courseCode: string;
  courseTitle: string;
  creditHours: number;
  score: number;
  letterGrade: string;
  semester: string;
  year: number;
  approvedDate: Timestamp;
}

interface GPABreakdown {
  semesterGPA: number;
  cumulativeGPA: number;
  academicStanding: 'Good Standing' | 'Probation' | 'Excellent';
  totalCredits: number;
  gradeDistribution: Record<string, number>;
}
```

---

## Module 4: Grade Correction/Request Handling

### Overview
Manages the workflow for faculty grade change requests with multi-level approval chain.

### Functional Requirements

#### FR4.1 Correction Request Submission
- Faculty initiates grade correction request
- Provides justification/reason
- Selects original grade and proposed grade
- Upload supporting documentation

#### FR4.2 Multi-Level Approval Chain
```
Faculty → Registrar (Level 1)
          ↓ (if approved)
          Department Head (Level 2)
          ↓ (if approved)
          Provost/Dean (Level 3)
```

#### FR4.3 Request Tracking
- Faculty views status of submitted requests
- Track at which level request is pending
- View approver comments/notes
- Timeline visibility

#### FR4.4 Approval Actions
- Approve and forward to next level
- Reject with detailed reason
- Request more information/clarification
- Set deadline for response

#### FR4.5 Automatic Updates
- Automatic status updates via email
- In-system notifications
- SMS alerts for urgent requests
- Escalation after deadline

### API Specifications

```typescript
POST /api/corrections/create
Request: {
  gradeId: string,
  proposedGrade: number,
  reason: string,
  justification: string,
  supportingDocuments?: string[] // file IDs
}
Response: {
  requestId: string,
  status: 'draft' | 'submitted',
  createdAt: timestamp
}

GET /api/corrections/my-requests
Query: {
  status?: string,
  limit?: number,
  offset?: number
}
Response: {
  requests: CorrectionRequest[],
  total: number
}

GET /api/corrections/pending
Query: {
  approverLevel?: number,
  department?: string
}
Response: {
  requests: CorrectionRequest[],
  total: number
}

PUT /api/corrections/:requestId/approve
Request: {
  comments?: string,
  forwardToLevel?: number
}
Response: {
  id: string,
  status: 'approved',
  nextLevel?: number
}

PUT /api/corrections/:requestId/reject
Request: {
  rejectionReason: string,
  comments?: string,
  allowResubmit?: boolean
}
Response: {
  id: string,
  status: 'rejected'
}

POST /api/corrections/:requestId/upload-document
Request: FormData with file
Response: {
  documentId: string,
  url: string
}
```

### Data Model

```typescript
interface GradeCorrectionRequest {
  id: string;
  gradeId: string;
  courseId: string;
  studentId: string;
  facultyId: string;
  originalGrade: number;
  proposedGrade: number;
  reason: string;
  justification: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  
  approvalChain: {
    registrarApproval?: {
      timestamp: Timestamp;
      approved: boolean;
      approverEmail: string;
      comments: string;
    };
    departmentHeadApproval?: {
      timestamp: Timestamp;
      approved: boolean;
      approverEmail: string;
      comments: string;
    };
    provostApproval?: {
      timestamp: Timestamp;
      approved: boolean;
      approverEmail: string;
      comments: string;
    };
  };
  
  supportingDocuments: DocumentReference[];
  rejectionReason?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## Module 5: Grade Reports & Analytics

### Overview
Generates comprehensive reports and analytics for grade management and institutional analysis.

### Functional Requirements

#### FR5.1 Class Grade Sheet
- All grades for a specific course
- Course statistics (mean, median, mode)
- Grade distribution
- Export to PDF/Excel
- Include attendance rates (if integrated)

#### FR5.2 Student Transcript
- Complete academic record
- Summary GPA/CGPA
- Academic standing
- Semester-wise breakdown
- Downloadable format (PDF)

#### FR5.3 Grade Distribution Analysis
- Histogram/distribution curve
- Pass/fail rates
- Grade breakdown percentages
- Comparison with historical data
- Outlier identification

#### FR5.4 Statistical Analytics
- Mean, median, mode scores
- Standard deviation
- Percentile ranks
- Performance trends

#### FR5.5 Department/Institutional Reports
- Aggregate performance by department
- Course-wise performance
- Faculty-wise performance metrics
- Student performance tracking

#### FR5.6 Compliance Reports
- Grade approval timelines
- Verification turnaround times
- Audit trail reports
- Data integrity reports

### API Specifications

```typescript
GET /api/reports/class/:courseId
Query: {
  format?: 'json' | 'pdf' | 'csv',
  semester?: string
}
Response: {
  courseDetails: Course,
  grades: Grade[],
  statistics: {
    mean: number,
    median: number,
    mode: number,
    stdDev: number,
    min: number,
    max: number
  },
  gradeDistribution: Record<string, number>,
  passRate: number,
  failRate: number
}

GET /api/reports/transcript/:studentId
Query: {
  format?: 'json' | 'pdf'
}
Response: (Transcript object or PDF)

GET /api/reports/statistics/:courseId
Response: {
  courseCode: string,
  courseTitle: string,
  enrollmentCount: number,
  passCount: number,
  failCount: number,
  statistics: {
    mean: number,
    median: number,
    stdDev: number,
    quartiles: {
      Q1: number,
      Q2: number,
      Q3: number
    }
  },
  gradeDistribution: {
    A: number,
    B: number,
    C: number,
    D: number,
    F: number
  }
}

POST /api/reports/export
Request: {
  reportType: string,
  courseId?: string,
  department?: string,
  semester?: string,
  format: 'pdf' | 'csv' | 'xlsx'
}
Response: {
  downloadUrl: string,
  expiresIn: number // seconds
}

GET /api/reports/analytics
Query: {
  type: 'institutional' | 'department' | 'course',
  period?: string
}
Response: {
  charts: ChartData[],
  summary: AnalyticsSummary,
  trends: TrendData[]
}
```

---

## Module 6: System Administration

### Overview
Administrative functions for system configuration and user management.

### Functional Requirements

#### FR6.1 User Management
- Create/edit/deactivate users
- Assign roles and permissions
- Reset passwords
- Manage user departments

#### FR6.2 Course Management
- Create/edit courses
- Assign faculty
- Set grading scales
- Manage enrollment

#### FR6.3 System Settings
- Configure grading scales
- Set passing grade thresholds
- Configure verification levels
- Set notification preferences

#### FR6.4 Data Management
- Backup data
- Archive old records
- Restore data
- Data import/export

---

**Document Version**: 1.0  
**Last Updated**: December 17, 2025
