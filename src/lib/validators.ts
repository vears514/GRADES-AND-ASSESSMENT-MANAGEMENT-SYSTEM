import { z } from 'zod'

// Grade validation
export const GradeValidator = z.object({
  courseId: z.string().min(1, 'Course is required'),
  studentId: z.string().min(1, 'Student is required'),
  score: z.number().min(0).max(100, 'Score must be between 0 and 100'),
  letterGrade: z.string().regex(/^[A-F]$/, 'Invalid letter grade'),
  weightage: z.number().min(0).max(1),
  remarks: z.string().optional(),
})

// User registration validation
export const RegisterValidator = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),
  role: z.enum(['faculty', 'student', 'registrar', 'admin']),
  department: z.string().min(1, 'Department required'),
})

// Login validation
export const LoginValidator = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password required'),
})

// Course validation
export const CourseValidator = z.object({
  code: z.string().min(3, 'Course code required'),
  name: z.string().min(5, 'Course name required'),
  department: z.string().min(1, 'Department required'),
  semester: z.string(),
  credits: z.number().min(1).max(4),
})

// Correction request validation
export const CorrectionRequestValidator = z.object({
  gradeId: z.string().min(1),
  proposedGrade: z.number().min(0).max(100),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
  documents: z.array(z.string()).optional(),
})

// Bulk upload validation
export const BulkUploadValidator = z.object({
  courseId: z.string().min(1),
  file: z.instanceof(File).refine(
    (file) => file.size <= 5 * 1024 * 1024,
    'File size must be less than 5MB'
  ),
})

export type Grade = z.infer<typeof GradeValidator>
export type Register = z.infer<typeof RegisterValidator>
export type Login = z.infer<typeof LoginValidator>
export type Course = z.infer<typeof CourseValidator>
export type CorrectionRequest = z.infer<typeof CorrectionRequestValidator>
export type BulkUpload = z.infer<typeof BulkUploadValidator>
