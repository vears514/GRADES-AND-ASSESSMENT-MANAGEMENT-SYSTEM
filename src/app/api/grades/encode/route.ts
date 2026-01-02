import { NextRequest, NextResponse } from 'next/server'
import { successResponse, errorResponse } from '@/lib/utils'

// POST /api/grades/encode
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { courseId, studentId, score, letterGrade, remarks } = body

    // Validation
    if (!courseId || !studentId || score === undefined) {
      return NextResponse.json(
        errorResponse('VALIDATION_FAILED', 'Missing required fields', 400),
        { status: 400 }
      )
    }

    if (score < 0 || score > 100) {
      return NextResponse.json(
        errorResponse('INVALID_SCORE', 'Score must be between 0 and 100', 400),
        { status: 400 }
      )
    }

    // TODO: Save to Firestore
    const gradeData = {
      id: `grade_${Date.now()}`,
      courseId,
      studentId,
      score,
      letterGrade,
      remarks,
      status: 'draft',
      createdAt: new Date(),
    }

    return NextResponse.json(
      successResponse(gradeData),
      { status: 201 }
    )
  } catch (error) {
    console.error('Grade encoding error:', error)
    return NextResponse.json(
      errorResponse('INTERNAL_ERROR', 'Failed to encode grade', 500),
      { status: 500 }
    )
  }
}
