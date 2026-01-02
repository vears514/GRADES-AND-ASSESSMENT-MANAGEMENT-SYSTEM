import { NextRequest, NextResponse } from 'next/server'
import { successResponse, errorResponse } from '@/lib/utils'

// POST /api/auth/register
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName, role, department } = body

    // Validation
    if (!email || !password || !firstName || !lastName || !role) {
      return NextResponse.json(
        errorResponse('VALIDATION_FAILED', 'Missing required fields', 400),
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        errorResponse('INVALID_PASSWORD', 'Password must be at least 8 characters', 400),
        { status: 400 }
      )
    }

    // TODO: Create user in Firebase
    const user = {
      id: `user_${Date.now()}`,
      email,
      firstName,
      lastName,
      role,
      department,
      createdAt: new Date(),
    }

    return NextResponse.json(
      successResponse(user),
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Registration error:', error)
    
    if (error.code === 'auth/email-already-in-use') {
      return NextResponse.json(
        errorResponse('EMAIL_EXISTS', 'Email already registered', 409),
        { status: 409 }
      )
    }

    return NextResponse.json(
      errorResponse('INTERNAL_ERROR', 'Registration failed', 500),
      { status: 500 }
    )
  }
}
