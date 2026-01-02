import { NextRequest, NextResponse } from 'next/server'
import { successResponse, errorResponse } from '@/lib/utils'

// POST /api/auth/login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        errorResponse('VALIDATION_FAILED', 'Email and password required', 400),
        { status: 400 }
      )
    }

    // TODO: Authenticate with Firebase
    const user = {
      id: `user_${Date.now()}`,
      email,
      firstName: 'Demo',
      lastName: 'User',
      role: 'student',
      department: 'CS',
    }

    return NextResponse.json(
      successResponse({
        user,
        token: 'demo_token_' + Date.now(),
      })
    )
  } catch (error: any) {
    console.error('Login error:', error)

    if (error.code === 'auth/user-not-found') {
      return NextResponse.json(
        errorResponse('AUTH_FAILED', 'User not found', 401),
        { status: 401 }
      )
    }

    if (error.code === 'auth/wrong-password') {
      return NextResponse.json(
        errorResponse('AUTH_FAILED', 'Invalid password', 401),
        { status: 401 }
      )
    }

    return NextResponse.json(
      errorResponse('INTERNAL_ERROR', 'Login failed', 500),
      { status: 500 }
    )
  }
}
