'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRequireRole } from '@/hooks/useRequireRole'
import { authService } from '@/services/authService'
import { auditService } from '@/services/auditService'
import { gradeService } from '@/services/gradeService'
import type { Grade } from '@/types'

type QueueStatus = 'all' | 'submitted' | 'approved' | 'rejected'

type VerificationRow = {
  id: string
  courseCode: string
  courseName: string
  studentId: string
  studentName: string
  score: number | null
  letterGrade: string
  submittedBy: string
  submittedDate: string
  status: Grade['status']
  remarks?: string
}

const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0
}

const formatDate = (value: unknown) => {
  if (!value) {
    return '-'
  }

  const date =
    typeof (value as any)?.toDate === 'function'
      ? (value as any).toDate()
      : value instanceof Date
      ? value
      : new Date(value as string)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const statusBadgeClass = (status: Grade['status']) => {
  switch (status) {
    case 'approved':
      return 'badge-success'
    case 'rejected':
      return 'badge-error'
    default:
      return 'badge-warning'
  }
}

const statusLabel = (status: Grade['status']) => {
  switch (status) {
    case 'submitted':
      return 'Submitted'
    case 'approved':
      return 'Approved'
    case 'rejected':
      return 'Rejected'
    case 'under_review':
      return 'Under Review'
    case 'draft':
      return 'Draft'
    default:
      return status
  }
}

export default function VerificationPage() {
  const allowed = useRequireRole(['registrar', 'admin'])
  const [grades, setGrades] = useState<VerificationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState<QueueStatus>('all')
  const [filterCourse, setFilterCourse] = useState('')
  const [selectedGradeId, setSelectedGradeId] = useState<string | null>(null)
  const [comments, setComments] = useState('')

  const loadVerificationQueue = async () => {
    setLoading(true)
    setError('')

    try {
      const [gradeRecords, courses] = await Promise.all([
        gradeService.getGradesByStatuses(['submitted', 'approved', 'rejected']),
        gradeService.getAllCourses(),
      ])

      const courseMap = new Map<string, any>()
      courses.forEach((course) => {
        const identifiers = [course.id, course.code].filter(isNonEmptyString)
        identifiers.forEach((identifier) => courseMap.set(identifier, course))
      })

      const relatedUserIds = Array.from(
        new Set(
          gradeRecords.flatMap((grade) =>
            [grade.studentId, grade.submittedBy, grade.verifiedBy].filter(isNonEmptyString)
          )
        )
      )

      const [usersById, usersByStudentId] = await Promise.all([
        authService.getUsersByIds(relatedUserIds),
        authService.getUsersByStudentIds(relatedUserIds),
      ])

      const userMap = new Map<string, any>()
      ;[...usersById, ...usersByStudentId].forEach((user) => {
        const identifiers = [user.id, user.studentId, user.email].filter(isNonEmptyString)
        identifiers.forEach((identifier) => userMap.set(identifier, user))
      })

      const rows = gradeRecords.map((grade) => {
        const course = courseMap.get(grade.courseId)
        const student = userMap.get(grade.studentId)
        const faculty = userMap.get(grade.submittedBy)
        const score = typeof grade.finalScore === 'number' ? grade.finalScore : grade.score
        const studentName = `${student?.firstName || ''} ${student?.lastName || ''}`.trim()
        const facultyName = `${faculty?.firstName || ''} ${faculty?.lastName || ''}`.trim()

        return {
          id: grade.id,
          courseCode: course?.code || grade.courseId || '-',
          courseName: course?.name || 'Unassigned Course',
          studentId: student?.studentId || grade.studentId,
          studentName: studentName || student?.email || 'Unknown Student',
          score: typeof score === 'number' ? score : null,
          letterGrade: grade.letterGrade || '-',
          submittedBy: facultyName || faculty?.email || grade.submittedBy || '-',
          submittedDate: formatDate(grade.submittedAt || grade.updatedAt),
          status: grade.status,
          remarks: grade.remarks,
        } satisfies VerificationRow
      })

      setGrades(rows)
    } catch (loadError: any) {
      console.error('Failed to load verification queue:', loadError)
      setError(loadError.message || 'Unable to load verification records.')
      setGrades([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (allowed === true) {
      void loadVerificationQueue()
    }
  }, [allowed])

  const courseOptions = useMemo(() => {
    return Array.from(new Set(grades.map((grade) => grade.courseCode))).sort()
  }, [grades])

  const filteredGrades = useMemo(() => {
    return grades.filter((grade) => {
      if (filterStatus !== 'all' && grade.status !== filterStatus) {
        return false
      }

      if (filterCourse && grade.courseCode !== filterCourse) {
        return false
      }

      return true
    })
  }, [filterCourse, filterStatus, grades])

  const selectedGrade = filteredGrades.find((grade) => grade.id === selectedGradeId) ||
    grades.find((grade) => grade.id === selectedGradeId) ||
    null

  const submittedCount = grades.filter((grade) => grade.status === 'submitted').length
  const approvedCount = grades.filter((grade) => grade.status === 'approved').length
  const rejectedCount = grades.filter((grade) => grade.status === 'rejected').length

  const completeReview = async (nextStatus: 'approved' | 'rejected') => {
    if (!selectedGradeId || !selectedGrade) {
      return
    }

    setActionLoading(true)
    try {
      const authUser = await authService.waitForAuthState()
      if (!authUser) {
        throw new Error('You must be logged in to review grades.')
      }

      await gradeService.updateGradeStatus(selectedGradeId, nextStatus, authUser.uid)
      await gradeService.updateGrade(selectedGradeId, {
        remarks: comments.trim() || (nextStatus === 'approved' ? 'Approved by registrar.' : 'Rejected by registrar.'),
      })

      await auditService.record({
        action: nextStatus === 'approved' ? 'VERIFY_GRADE' : 'REJECT_GRADE',
        entityType: 'grade',
        entityId: selectedGradeId,
        userId: authUser.uid,
        description: `${statusLabel(nextStatus)} ${selectedGrade.courseCode} for ${selectedGrade.studentName}.`,
        changes: {
          status: nextStatus,
          remarks: comments.trim(),
        },
      })

      setSelectedGradeId(null)
      setComments('')
      await loadVerificationQueue()
    } catch (reviewError: any) {
      console.error('Failed to complete verification review:', reviewError)
      setError(reviewError.message || 'Unable to update the grade status.')
    } finally {
      setActionLoading(false)
    }
  }

  if (allowed === null) {
    return <div>Checking permissions...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold">Grade Verification & Approval</h1>
        <p className="text-gray-600">Review grades submitted by faculty and decide whether they should be published to students.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="card">
          <p className="text-sm text-gray-600">Pending Review</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">{submittedCount}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Approved</p>
          <p className="mt-2 text-3xl font-bold text-green-600">{approvedCount}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Rejected</p>
          <p className="mt-2 text-3xl font-bold text-red-600">{rejectedCount}</p>
        </div>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium">Course</label>
            <select
              className="input-field"
              value={filterCourse}
              onChange={(event) => setFilterCourse(event.target.value)}
            >
              <option value="">All Courses</option>
              {courseOptions.map((courseCode) => (
                <option key={courseCode} value={courseCode}>
                  {courseCode}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Status</label>
            <select
              className="input-field"
              value={filterStatus}
              onChange={(event) => setFilterStatus(event.target.value as QueueStatus)}
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex items-end">
            <button type="button" onClick={() => void loadVerificationQueue()} className="button-secondary w-full">
              Refresh Queue
            </button>
          </div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          </div>
        ) : filteredGrades.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">
            No grade submissions matched the current filters.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th>Course</th>
                <th>Student</th>
                <th>Score</th>
                <th>Grade</th>
                <th>Submitted By</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGrades.map((grade) => (
                <tr key={grade.id}>
                  <td>
                    <div>
                      <p className="font-medium text-gray-900">{grade.courseCode}</p>
                      <p className="text-sm text-gray-600">{grade.courseName}</p>
                    </div>
                  </td>
                  <td>
                    <div>
                      <p className="font-medium text-gray-900">{grade.studentName}</p>
                      <p className="text-sm text-gray-600">{grade.studentId}</p>
                    </div>
                  </td>
                  <td className="font-semibold">{typeof grade.score === 'number' ? grade.score.toFixed(2) : '-'}</td>
                  <td>{grade.letterGrade}</td>
                  <td className="text-sm">{grade.submittedBy}</td>
                  <td className="text-sm">{grade.submittedDate}</td>
                  <td>
                    <span className={`badge ${statusBadgeClass(grade.status)}`}>
                      {statusLabel(grade.status)}
                    </span>
                  </td>
                  <td>
                    {grade.status === 'submitted' ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedGradeId(grade.id)
                          setComments(grade.remarks || '')
                        }}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        Review
                      </button>
                    ) : (
                      <span className="text-sm text-gray-500">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedGrade && (
        <div className="modal-overlay">
          <div className="modal max-w-lg">
            <h2 className="mb-4 text-xl font-bold">Review Grade Submission</h2>

            <div className="mb-5 space-y-3 rounded-lg bg-gray-50 p-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Student</p>
                <p className="font-semibold text-gray-900">{selectedGrade.studentName}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Course</p>
                <p className="font-semibold text-gray-900">
                  {selectedGrade.courseCode} - {selectedGrade.courseName}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Submitted Score</p>
                <p className="font-semibold text-gray-900">
                  {typeof selectedGrade.score === 'number' ? selectedGrade.score.toFixed(2) : '-'} ({selectedGrade.letterGrade})
                </p>
              </div>
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium">Reviewer Notes</label>
              <textarea
                value={comments}
                onChange={(event) => setComments(event.target.value)}
                placeholder="Add remarks for this decision."
                rows={4}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void completeReview('approved')}
                disabled={actionLoading}
                className="button-primary flex-1"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => void completeReview('rejected')}
                disabled={actionLoading}
                className="button-danger flex-1"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedGradeId(null)
                  setComments('')
                }}
                disabled={actionLoading}
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
