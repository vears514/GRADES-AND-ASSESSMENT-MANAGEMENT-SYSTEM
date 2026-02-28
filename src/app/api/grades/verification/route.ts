import { NextRequest, NextResponse } from 'next/server'
import { successResponse, errorResponse } from '@/lib/utils'

// GET /api/grades/verification
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

// POST /api/grades/verification - Handle GraphQL queries
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        {
          data: null,
          errors: [{ message: 'Invalid request body' }],
        },
        { status: 400 }
      )
    }

    // Forward to actual GraphQL endpoint if configured
    const graphqlEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT
    
    if (!graphqlEndpoint) {
      // Return mock data if no GraphQL endpoint is configured
      console.warn('No NEXT_PUBLIC_GRAPHQL_ENDPOINT configured, returning mock data')
      
      // Mock response for getAuthStudentClasses query
      if (body.query && body.query.includes('getAuthStudentClasses')) {
        return NextResponse.json({
          data: {
            getAuthStudentClasses: {
              items: [],
            },
          },
        })
      }

      return NextResponse.json(
        {
          data: null,
          errors: [{ message: 'No GraphQL endpoint configured' }],
        },
        { status: 500 }
      )
    }

    // Forward the request to the GraphQL endpoint
    const graphqlResponse = await fetch(graphqlEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization') as string,
        }),
      },
      body: JSON.stringify(body),
    })

    if (!graphqlResponse.ok) {
      console.error(`GraphQL endpoint error: ${graphqlResponse.statusText}`)
      return NextResponse.json(
        {
          data: null,
          errors: [{ message: `GraphQL request failed: ${graphqlResponse.statusText}` }],
        },
        { status: graphqlResponse.status }
      )
    }

    const data = await graphqlResponse.json()
    
    // Ensure response is properly formatted
    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        {
          data: null,
          errors: [{ message: 'Invalid GraphQL response' }],
        },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Verification/GraphQL error:', error)
    return NextResponse.json(
      {
        data: null,
        errors: [{ message: error instanceof Error ? error.message : 'Failed to process request' }],
      },
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

