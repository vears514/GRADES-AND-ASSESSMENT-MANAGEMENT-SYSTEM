'use client'

import { useState } from 'react'

interface CorrectionRequest {
  id: string
  gradeId: string
  courseCode: string
  courseName: string
  studentId: string
  studentName: string
  currentScore: number
  currentGrade: string
  proposedScore: number
  proposedGrade: string
  reason: string
  fileUrl?: string
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'
  submittedDate?: string
  reviewedDate?: string
  comments?: string
}

export default function CorrectionRequestPage() {
  const [requests, setRequests] = useState<CorrectionRequest[]>([
    {
      id: 'CR001',
      gradeId: 'G001',
      courseCode: 'COMP101',
      courseName: 'Introduction to Programming',
      studentId: 'S001',
      studentName: 'John Doe',
      currentScore: 85,
      currentGrade: 'A',
      proposedScore: 90,
      proposedGrade: 'A',
      reason: 'Extra credit assignment was not counted in original submission',
      status: 'under_review',
      submittedDate: '2025-12-16',
      comments: 'Being reviewed by department head'
    },
    {
      id: 'CR002',
      gradeId: 'G002',
      courseCode: 'MATH201',
      courseName: 'Calculus II',
      studentId: 'S002',
      studentName: 'Jane Smith',
      currentScore: 78,
      currentGrade: 'B',
      proposedScore: 82,
      proposedGrade: 'B',
      reason: 'Midterm exam was graded incorrectly. Calculator was allowed but marked as cheating',
      status: 'approved',
      submittedDate: '2025-12-10',
      reviewedDate: '2025-12-13',
      comments: 'Approved - Error in grading confirmed'
    },
  ])

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    studentId: '',
    studentName: '',
    currentScore: '',
    currentGrade: '',
    proposedScore: '',
    proposedGrade: '',
    reason: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = () => {
    if (formData.courseCode && formData.reason && formData.proposedScore) {
      const newRequest: CorrectionRequest = {
        id: `CR${requests.length + 3}`,
        gradeId: `G${requests.length + 3}`,
        ...formData,
        currentScore: parseInt(formData.currentScore),
        proposedScore: parseInt(formData.proposedScore),
        status: 'submitted',
        submittedDate: new Date().toISOString().split('T')[0],
      }
      setRequests([...requests, newRequest])
      setShowForm(false)
      setFormData({
        courseCode: '',
        courseName: '',
        studentId: '',
        studentName: '',
        currentScore: '',
        currentGrade: '',
        proposedScore: '',
        proposedGrade: '',
        reason: '',
      })
    }
  }

  const draftCount = requests.filter(r => r.status === 'draft').length
  const underReviewCount = requests.filter(r => r.status === 'under_review' || r.status === 'submitted').length
  const approvedCount = requests.filter(r => r.status === 'approved').length
  const rejectedCount = requests.filter(r => r.status === 'rejected').length

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Grade Correction Requests</h1>
          <p className="text-gray-600">Request grade changes with supporting documentation</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="button-primary"
        >
          + New Request
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <p className="text-gray-600 text-sm">Total Requests</p>
          <p className="text-3xl font-bold">{requests.length}</p>
        </div>
        <div className="card">
          <p className="text-yellow-600 text-sm">Under Review</p>
          <p className="text-3xl font-bold text-yellow-600">{underReviewCount}</p>
        </div>
        <div className="card">
          <p className="text-green-600 text-sm">Approved</p>
          <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
        </div>
        <div className="card">
          <p className="text-red-600 text-sm">Rejected</p>
          <p className="text-3xl font-bold text-red-600">{rejectedCount}</p>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card mb-8 bg-blue-50 border-2 border-blue-200">
          <h2 className="text-xl font-bold mb-6">Create New Correction Request</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Course Code</label>
              <input
                type="text"
                name="courseCode"
                value={formData.courseCode}
                onChange={handleInputChange}
                placeholder="e.g., COMP101"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Course Name</label>
              <input
                type="text"
                name="courseName"
                value={formData.courseName}
                onChange={handleInputChange}
                placeholder="e.g., Introduction to Programming"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Student ID</label>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                placeholder="e.g., S001"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Student Name</label>
              <input
                type="text"
                name="studentName"
                value={formData.studentName}
                onChange={handleInputChange}
                placeholder="Full name"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Current Score</label>
              <input
                type="number"
                name="currentScore"
                value={formData.currentScore}
                onChange={handleInputChange}
                min="0"
                max="100"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Current Grade</label>
              <select
                name="currentGrade"
                value={formData.currentGrade}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="">Select Grade</option>
                <option value="A">A (90-100)</option>
                <option value="B">B (80-89)</option>
                <option value="C">C (70-79)</option>
                <option value="D">D (60-69)</option>
                <option value="F">F (Below 60)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Proposed Score</label>
              <input
                type="number"
                name="proposedScore"
                value={formData.proposedScore}
                onChange={handleInputChange}
                min="0"
                max="100"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Proposed Grade</label>
              <select
                name="proposedGrade"
                value={formData.proposedGrade}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="">Select Grade</option>
                <option value="A">A (90-100)</option>
                <option value="B">B (80-89)</option>
                <option value="C">C (70-79)</option>
                <option value="D">D (60-69)</option>
                <option value="F">F (Below 60)</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Reason for Correction *</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              placeholder="Explain why the grade should be corrected. Minimum 50 characters."
              className="input-field"
              rows={4}
            />
            <p className="text-xs text-gray-600 mt-1">
              {formData.reason.length} characters (minimum 50 required)
            </p>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleSubmit}
              disabled={formData.reason.length < 50 || !formData.courseCode || !formData.proposedScore}
              className="button-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Request
            </button>
            <button 
              onClick={() => setShowForm(false)}
              className="button-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Requests List */}
      <div className="space-y-4">
        {requests.map((request) => (
          <div key={request.id} className="card">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-gray-600 text-sm">Course</p>
                <p className="font-semibold">{request.courseCode}</p>
                <p className="text-sm text-gray-600">{request.courseName}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Grade Change</p>
                <p className="font-semibold">
                  <span className="text-orange-600">{request.currentGrade} ({request.currentScore})</span>
                  <span className="text-gray-400"> → </span>
                  <span className="text-green-600">{request.proposedGrade} ({request.proposedScore})</span>
                </p>
              </div>
              <div className="flex items-center justify-between md:justify-end">
                <div>
                  <span className={`badge ${
                    request.status === 'approved' ? 'badge-success' :
                    request.status === 'rejected' ? 'badge-error' :
                    request.status === 'under_review' || request.status === 'submitted' ? 'badge-warning' :
                    'badge-info'
                  }`}>
                    {request.status === 'under_review' ? 'Under Review' :
                     request.status === 'submitted' ? 'Submitted' :
                     request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">Reason</p>
              <p className="text-gray-700">{request.reason}</p>
            </div>

            {request.comments && (
              <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                <p className="text-sm font-medium text-blue-900">Reviewer Comments:</p>
                <p className="text-sm text-blue-800">{request.comments}</p>
              </div>
            )}

            <div className="mt-4 flex gap-2 text-xs text-gray-600">
              {request.submittedDate && (
                <span>📅 Submitted: {request.submittedDate}</span>
              )}
              {request.reviewedDate && (
                <span>✓ Reviewed: {request.reviewedDate}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
