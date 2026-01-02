'use client'

import { useState } from 'react'

interface StudentGrade {
  id: string
  courseCode: string
  courseName: string
  semester: string
  score: number
  letterGrade: string
  credits: number
  gradePoints: number
  status: 'approved' | 'pending'
}

export default function StudentGradesPage() {
  const [grades] = useState<StudentGrade[]>([
    {
      id: 'G001',
      courseCode: 'COMP101',
      courseName: 'Introduction to Programming',
      semester: 'Fall 2025',
      score: 85,
      letterGrade: 'A',
      credits: 3,
      gradePoints: 12,
      status: 'approved',
    },
    {
      id: 'G002',
      courseCode: 'MATH201',
      courseName: 'Calculus II',
      semester: 'Fall 2025',
      score: 92,
      letterGrade: 'A',
      credits: 4,
      gradePoints: 16,
      status: 'approved',
    },
    {
      id: 'G003',
      courseCode: 'ENG102',
      courseName: 'English Composition',
      semester: 'Fall 2025',
      score: 78,
      letterGrade: 'B',
      credits: 3,
      gradePoints: 9,
      status: 'approved',
    },
    {
      id: 'G004',
      courseCode: 'PHYS150',
      courseName: 'Physics I',
      semester: 'Fall 2025',
      score: 88,
      letterGrade: 'A',
      credits: 4,
      gradePoints: 16,
      status: 'pending',
    },
  ])

  const totalCredits = grades.reduce((sum, g) => sum + g.credits, 0)
  const totalGradePoints = grades.reduce((sum, g) => sum + g.gradePoints, 0)
  const gpa = (totalGradePoints / totalCredits).toFixed(2)
  const approvedGrades = grades.filter(g => g.status === 'approved').length

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Grades</h1>
        <p className="text-gray-600">View your academic records and performance</p>
      </div>

      {/* GPA Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
          <p className="text-blue-600 text-sm font-medium">Current GPA</p>
          <p className="text-4xl font-bold text-blue-700">{gpa}</p>
          <p className="text-xs text-blue-600 mt-2">Out of 4.0</p>
        </div>
        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
          <p className="text-green-600 text-sm font-medium">Total Credits</p>
          <p className="text-4xl font-bold text-green-700">{totalCredits}</p>
          <p className="text-xs text-green-600 mt-2">Credits Earned</p>
        </div>
        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
          <p className="text-purple-600 text-sm font-medium">Grades Posted</p>
          <p className="text-4xl font-bold text-purple-700">{approvedGrades}/{grades.length}</p>
          <p className="text-xs text-purple-600 mt-2">Approved Grades</p>
        </div>
        <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200">
          <p className="text-orange-600 text-sm font-medium">Grade Points</p>
          <p className="text-4xl font-bold text-orange-700">{totalGradePoints}</p>
          <p className="text-xs text-orange-600 mt-2">Total Points</p>
        </div>
      </div>

      {/* Grades by Semester */}
      <div className="card mb-6">
        <h2 className="text-xl font-bold mb-4">Fall 2025 Semester</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="table-cell">Course Code</th>
                <th className="table-cell">Course Name</th>
                <th className="table-cell">Score</th>
                <th className="table-cell">Grade</th>
                <th className="table-cell">Credits</th>
                <th className="table-cell">Grade Points</th>
                <th className="table-cell">Status</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((grade) => (
                <tr key={grade.id} className="table-row">
                  <td className="table-cell font-semibold">{grade.courseCode}</td>
                  <td className="table-cell">{grade.courseName}</td>
                  <td className="table-cell font-semibold text-lg">{grade.score}</td>
                  <td className="table-cell">
                    <span className={`badge ${
                      grade.letterGrade === 'A' ? 'badge-success' :
                      grade.letterGrade === 'B' ? 'badge-info' :
                      grade.letterGrade === 'C' ? 'badge-warning' :
                      'badge-error'
                    }`}>
                      {grade.letterGrade}
                    </span>
                  </td>
                  <td className="table-cell">{grade.credits}</td>
                  <td className="table-cell font-semibold">{grade.gradePoints}</td>
                  <td className="table-cell">
                    <span className={`badge ${
                      grade.status === 'approved' ? 'badge-success' : 'badge-warning'
                    }`}>
                      {grade.status === 'approved' ? 'Posted' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Chart Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-bold mb-4">Grade Distribution</h3>
          <div className="space-y-3">
            {[
              { grade: 'A', count: 3, color: 'bg-green-500' },
              { grade: 'B', count: 1, color: 'bg-yellow-500' },
              { grade: 'C', count: 0, color: 'bg-orange-500' },
              { grade: 'D', count: 0, color: 'bg-red-500' },
            ].map(item => (
              <div key={item.grade}>
                <div className="flex justify-between mb-1">
                  <span className="font-medium">Grade {item.grade}</span>
                  <span className="text-sm text-gray-600">{item.count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`${item.color} h-2 rounded-full`}
                    style={{ width: `${(item.count / grades.length) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold mb-4">Academic Standing</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">✓</div>
              <div>
                <p className="font-medium">Good Academic Standing</p>
                <p className="text-sm text-gray-600">GPA above 2.0</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-2xl">📊</div>
              <div>
                <p className="font-medium">Performance Trend</p>
                <p className="text-sm text-gray-600">Steady progress maintained</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-2xl">🎯</div>
              <div>
                <p className="font-medium">Dean's List Eligible</p>
                <p className="text-sm text-gray-600">GPA above 3.5 threshold</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-4">
        <button className="button-primary">
          📥 Download Transcript
        </button>
        <button className="button-secondary">
          📧 Email Grades
        </button>
        <button className="button-secondary">
          📋 View Full Details
        </button>
      </div>
    </div>
  )
}
