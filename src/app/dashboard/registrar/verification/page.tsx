'use client'

import { useState } from 'react'
import { useRequireRole } from '@/hooks/useRequireRole'

interface GradeForVerification {
  id: string
  courseCode: string
  courseName: string
  studentId: string
  studentName: string
  submittedScore: number
  letterGrade: string
  submittedBy: string
  submittedDate: string
  status: 'pending' | 'approved' | 'rejected'
  remarks?: string
}

export default function VerificationPage() {
  const allowed = useRequireRole(['registrar','admin'])
  if (!allowed) return <div>Checking permissions…</div>
  const [grades, setGrades] = useState<GradeForVerification[]>([
    {
      id: 'G001',
      courseCode: 'COMP101',
      courseName: 'Introduction to Programming',
      studentId: 'S001',
      studentName: 'John Doe',
      submittedScore: 85,
      letterGrade: 'A',
      submittedBy: 'Dr. Smith',
      submittedDate: '2025-12-15',
      status: 'pending',
    },
    {
      id: 'G002',
      courseCode: 'COMP101',
      courseName: 'Introduction to Programming',
      studentId: 'S002',
      studentName: 'Jane Smith',
      submittedScore: 92,
      letterGrade: 'A',
      submittedBy: 'Dr. Smith',
      submittedDate: '2025-12-15',
      status: 'pending',
    },
    {
      id: 'G003',
      courseCode: 'COMP201',
      courseName: 'Data Structures',
      studentId: 'S003',
      studentName: 'Bob Johnson',
      submittedScore: 78,
      letterGrade: 'B',
      submittedBy: 'Prof. Jones',
      submittedDate: '2025-12-14',
      status: 'approved',
      remarks: 'Verified by Registrar'
    },
  ])

  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [filterCourse, setFilterCourse] = useState('')
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null)
  const [comments, setComments] = useState('')

  const filteredGrades = grades.filter(g => {
    if (filterStatus !== 'all' && g.status !== filterStatus) return false
    if (filterCourse && g.courseCode !== filterCourse) return false
    return true
  })

  const handleApprove = (gradeId: string) => {
    setGrades(prev => prev.map(g => 
      g.id === gradeId 
        ? { ...g, status: 'approved', remarks: comments || 'Approved' }
        : g
    ))
    setSelectedGrade(null)
    setComments('')
  }

  const handleReject = (gradeId: string) => {
    setGrades(prev => prev.map(g => 
      g.id === gradeId 
        ? { ...g, status: 'rejected', remarks: comments || 'Rejected' }
        : g
    ))
    setSelectedGrade(null)
    setComments('')
  }

  const pendingCount = grades.filter(g => g.status === 'pending').length
  const approvedCount = grades.filter(g => g.status === 'approved').length
  const rejectedCount = grades.filter(g => g.status === 'rejected').length

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Grade Verification & Approval</h1>
        <p className="text-gray-600">Review and verify submitted grades before posting</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending Review</p>
              <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
            <div className="text-4xl text-yellow-200">⏳</div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Approved</p>
              <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
            </div>
            <div className="text-4xl text-green-200">✓</div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Rejected</p>
              <p className="text-3xl font-bold text-red-600">{rejectedCount}</p>
            </div>
            <div className="text-4xl text-red-200">✗</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Course</label>
            <select 
              className="input-field"
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
            >
              <option value="">All Courses</option>
              <option value="COMP101">COMP 101 - Introduction to Programming</option>
              <option value="COMP201">COMP 201 - Data Structures</option>
              <option value="COMP301">COMP 301 - Algorithms</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select 
              className="input-field"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="button-secondary w-full">
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Grades Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="table-header">
              <th className="table-cell">Course</th>
              <th className="table-cell">Student</th>
              <th className="table-cell">Score</th>
              <th className="table-cell">Grade</th>
              <th className="table-cell">Submitted By</th>
              <th className="table-cell">Date</th>
              <th className="table-cell">Status</th>
              <th className="table-cell">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredGrades.map((grade) => (
              <tr key={grade.id} className="table-row">
                <td className="table-cell">
                  <div>
                    <p className="font-medium">{grade.courseCode}</p>
                    <p className="text-sm text-gray-600">{grade.courseName}</p>
                  </div>
                </td>
                <td className="table-cell">
                  <div>
                    <p className="font-medium">{grade.studentName}</p>
                    <p className="text-sm text-gray-600">{grade.studentId}</p>
                  </div>
                </td>
                <td className="table-cell font-semibold">{grade.submittedScore}</td>
                <td className="table-cell">{grade.letterGrade}</td>
                <td className="table-cell text-sm">{grade.submittedBy}</td>
                <td className="table-cell text-sm">{grade.submittedDate}</td>
                <td className="table-cell">
                  <span className={`badge ${
                    grade.status === 'approved'
                      ? 'badge-success'
                      : grade.status === 'rejected'
                      ? 'badge-error'
                      : 'badge-warning'
                  }`}>
                    {grade.status.charAt(0).toUpperCase() + grade.status.slice(1)}
                  </span>
                </td>
                <td className="table-cell">
                  {grade.status === 'pending' ? (
                    <button
                      onClick={() => setSelectedGrade(grade.id)}
                      className="text-sm text-primary hover:text-blue-700 font-medium"
                    >
                      Review
                    </button>
                  ) : (
                    <span className="text-sm text-gray-500">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Review Modal */}
      {selectedGrade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Review Grade</h2>
            
            {grades.find(g => g.id === selectedGrade) && (
              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Student</p>
                  <p className="font-semibold">{grades.find(g => g.id === selectedGrade)?.studentName}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Score & Grade</p>
                  <p className="font-semibold">
                    {grades.find(g => g.id === selectedGrade)?.submittedScore} / 100 
                    ({grades.find(g => g.id === selectedGrade)?.letterGrade})
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Comments</label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Add verification notes or reason for rejection"
                    className="input-field"
                    rows={3}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => handleApprove(selectedGrade)}
                className="button-primary flex-1"
              >
                ✓ Approve
              </button>
              <button
                onClick={() => handleReject(selectedGrade)}
                className="button-secondary flex-1"
              >
                ✗ Reject
              </button>
              <button
                onClick={() => {
                  setSelectedGrade(null)
                  setComments('')
                }}
                className="button-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
