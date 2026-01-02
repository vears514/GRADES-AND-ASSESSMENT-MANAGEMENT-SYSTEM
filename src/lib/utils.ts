import { ApiResponse } from '@/types'

export class ApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export const errorResponse = <T = any>(
  code: string,
  message: string,
  statusCode: number = 500,
  details?: Record<string, any>
): ApiResponse<T> => {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    timestamp: new Date().toISOString(),
  }
}

export const successResponse = <T = any>(data?: T): ApiResponse<T> => {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  }
}

export const handleApiError = (error: any) => {
  if (error instanceof ApiError) {
    return errorResponse(error.code, error.message, error.statusCode, error.details)
  }

  if (error.code === 'auth/user-not-found') {
    return errorResponse('AUTH_FAILED', 'User not found', 401)
  }

  if (error.code === 'auth/wrong-password') {
    return errorResponse('AUTH_FAILED', 'Invalid password', 401)
  }

  if (error.code === 'permission-denied') {
    return errorResponse('PERMISSION_DENIED', 'Access denied', 403)
  }

  if (error.code === 'not-found') {
    return errorResponse('NOT_FOUND', 'Resource not found', 404)
  }

  return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500)
}

export const calculateLetterGrade = (score: number): string => {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

export const calculateGPA = (letterGrade: string): number => {
  const gradeMap: Record<string, number> = {
    A: 4.0,
    B: 3.0,
    C: 2.0,
    D: 1.0,
    F: 0.0,
  }
  return gradeMap[letterGrade] || 0
}

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
