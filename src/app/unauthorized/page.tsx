'use client'

import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md text-center">
        <h1 className="text-3xl font-bold mb-4 text-red-600">Access Denied</h1>
        <p className="mb-6">You do not have permission to view this page or perform this action.</p>
        <Link href="/dashboard" className="button-primary">
          Return to Dashboard
        </Link>
      </div>
    </div>
  )
}
