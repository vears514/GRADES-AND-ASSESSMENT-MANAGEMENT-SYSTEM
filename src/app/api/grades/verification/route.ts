import { NextRequest, NextResponse } from 'next/server'
import { successResponse, errorResponse } from '@/lib/utils'

// GET /api/grades/pending
export async function GET(request: NextRequest) {
  try {
    // TODO: Query Firestore for pending grades
    const pendingGrades = [
      {
        id: '1',
        courseCode: 'COMP 101',
        studentName: 'John Doe',
        score: 85,
        submittedAt: new Date(),
        status: 'submitted',
      },
      {
        id: '2',
        courseCode: 'MATH 201',
        studentName: 'Jane Smith',
        score: 92,
        submittedAt: new Date(),
        status: 'submitted',
      },
    ]

    return NextResponse.json(
      successResponse({
        grades: pendingGrades,
        total: pendingGrades.length,
      })
    )
  } catch (error) {
    console.error('Verification fetch error:', error)
    return NextResponse.json(
      errorResponse('INTERNAL_ERROR', 'Failed to fetch grades', 500),
      { status: 500 }
    )
  }
}

// PUT /api/grades/:id/verify
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { action, comments } = body

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        errorResponse('INVALID_ACTION', 'Invalid action', 400),
        { status: 400 }
      )
    }

    // TODO: Update grade status in Firestore
    const updated = {
      id: params.id,
      status: action === 'approve' ? 'approved' : 'rejected',
      verifiedAt: new Date(),
      comments,
    }

    return NextResponse.json(successResponse(updated))
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      errorResponse('INTERNAL_ERROR', 'Failed to verify grade', 500),
      { status: 500 }
    )
  }
}
