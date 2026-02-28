'use client'

import Link from 'next/link'

export default function SemestralGradePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Semestral Grade</h1>
      <p className="text-gray-600 mb-6">Review your latest semester performance summary.</p>

      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Fall 2025</h2>
          <span className="badge badge-success">Session Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-700">Semester GPA</p>
            <p className="text-3xl font-bold text-blue-800">3.42</p>
          </div>
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="text-sm text-green-700">Units Passed</p>
            <p className="text-3xl font-bold text-green-800">17</p>
          </div>
          <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
            <p className="text-sm text-purple-700">Standing</p>
            <p className="text-3xl font-bold text-purple-800">Good</p>
          </div>
        </div>
      </div>

      <Link href="/dashboard/student/grades" className="button-secondary inline-block">
        ← Back to My Grades
      </Link>
    </div>
  )
}
