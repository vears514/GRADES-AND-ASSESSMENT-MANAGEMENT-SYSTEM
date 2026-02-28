// TypeScript type definitions for the application

export type UserRole = 'faculty' | 'registrar' | 'student' | 'admin'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  department: string
  profilePhoto?: string
  authMethod?: 'email' | 'google'

  // student-specific
  studentId?: string
  course?: string
  yearLevel?: string
  section?: string
  adviser?: string
  currentGPA?: number
  enrolledSubjects?: string[]
  semester?: string
  schoolYear?: string

  // faculty-specific
  facultyId?: string
  assignedSubjects?: string[]
  handledSections?: string[]
  currentSemester?: string

  // audit/system
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Course {
  id: string
  code: string
  name: string
  department: string
  semester: string
  year: number
  instructor: {
    id: string
    name: string
  }
  students: string[]
  credits: number
  createdAt: Date
}

export interface Grade {
  id: string
  courseId: string
  studentId: string
  score: number
  letterGrade: string
  weightage: number
  remarks?: string
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'
  submittedBy: string
  submittedAt?: Date
  verifiedBy?: string
  verifiedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface GradeHistory {
  id: string
  gradeId: string
  previousScore?: number
  newScore: number
  previousStatus?: string
  newStatus: string
  changedBy: string
  reason?: string
  timestamp: Date
}

export interface GradeCorrectionRequest {
  id: string
  gradeId: string
  studentId: string
  courseId: string
  currentGrade: number
  proposedGrade: number
  reason: string
  documents?: string[]
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  approvals: Approval[]
  createdAt: Date
  updatedAt: Date
}

export interface Approval {
  level: number
  approverRole: string
  approverId: string
  status: 'pending' | 'approved' | 'rejected'
  comments?: string
  timestamp?: Date
}

export interface BulkUploadJob {
  id: string
  fileName: string
  courseId: string
  totalRecords: number
  successCount: number
  errorCount: number
  status: 'processing' | 'completed' | 'failed'
  errors: UploadError[]
  createdBy: string
  createdAt: Date
}

export interface UploadError {
  row: number
  studentId: string
  field: string
  message: string
  suggestedFix?: string
}

export interface AuditLog {
  id: string
  action: string
  entityType: string
  entityId: string
  userId: string
  changes: Record<string, any>
  timestamp: Date
  ipAddress?: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  actionUrl?: string
  createdAt: Date
}

export interface Report {
  id: string
  name: string
  type: 'grade_sheet' | 'transcript' | 'distribution' | 'analytics'
  courseId?: string
  semester?: string
  generatedBy: string
  fileUrl: string
  createdAt: Date
}

export interface ClassStatistics {
  courseId: string
  totalStudents: number
  averageScore: number
  medianScore: number
  standardDeviation: number
  gradeDistribution: {
    A: number
    B: number
    C: number
    D: number
    F: number
  }
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, any>
  }
  timestamp: string
}
