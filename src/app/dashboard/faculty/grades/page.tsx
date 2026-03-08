'use client'

import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { useRequireRole } from '@/hooks/useRequireRole'
import { authService } from '@/services/authService'
import { gradeService } from '@/services/gradeService'
import { auditService } from '@/services/auditService'
import { User, Grade } from '@/types'
import { convertNumericToGrade } from '@/lib/gradeConversion'

type CurriculumCourse = {
  id: string
  code: string
  name: string
  yearLevel: string
  semester?: string
  groupLabel?: string
}

type CurriculumGroup = {
  label: string
  courses: Omit<CurriculumCourse, 'groupLabel'>[]
}

type ScoreInput = {
  shortQuiz?: number
  longQuiz?: number
  majorExam?: number
}

type AuditEntry = {
  id: string
  description: string
  timestamp: string
  action?: string
}

const curriculumGroups: CurriculumGroup[] = [
  {
    label: '1st Year - 1st Semester',
    courses: [
      { id: 'CC101', code: 'CC 101', name: 'Intro to Computing', yearLevel: '1st Year', semester: '1st Sem' },
      { id: 'CC102', code: 'CC 102', name: 'Comp Prog 1', yearLevel: '1st Year', semester: '1st Sem' },
      { id: 'GE1', code: 'GE 1', name: 'Understanding the Self (UTS)', yearLevel: '1st Year', semester: '1st Sem' },
      { id: 'GE4', code: 'GE 4', name: 'Mathematics in the Modern World (MMW)', yearLevel: '1st Year', semester: '1st Sem' },
      { id: 'GE5', code: 'GE 5', name: 'Purposive Communication (PCOM)', yearLevel: '1st Year', semester: '1st Sem' },
    ],
  },
  {
    label: '1st Year - 2nd Semester',
    courses: [
      { id: 'CC103', code: 'CC 103', name: 'Comp Prog 2', yearLevel: '1st Year', semester: '2nd Sem' },
      { id: 'IT05', code: 'IT 05', name: 'Discrete Math', yearLevel: '1st Year', semester: '2nd Sem' },
      { id: 'IT01', code: 'IT 01', name: 'Human-Computer Interaction (HCI)', yearLevel: '1st Year', semester: '2nd Sem' },
      { id: 'GE2', code: 'GE 2', name: 'Readings in Philippine History (RPH)', yearLevel: '1st Year', semester: '2nd Sem' },
      { id: 'GE7', code: 'GE 7', name: 'Science, Technology, and Society (STS)', yearLevel: '1st Year', semester: '2nd Sem' },
    ],
  },
  {
    label: '2nd Year - 1st Semester',
    courses: [
      { id: 'CC04', code: 'CC 04', name: 'Data Structures', yearLevel: '2nd Year', semester: '1st Sem' },
      { id: 'IT07', code: 'IT 07', name: 'Networking 1', yearLevel: '2nd Year', semester: '1st Sem' },
      { id: 'CC05', code: 'CC 05', name: 'Database 1', yearLevel: '2nd Year', semester: '1st Sem' },
      { id: 'PF101', code: 'PF 101', name: 'Object-Oriented Programming', yearLevel: '2nd Year', semester: '1st Sem' },
    ],
  },
  {
    label: '2nd Year - 2nd Semester',
    courses: [
      { id: 'IT11', code: 'IT 11', name: 'Web Systems 1', yearLevel: '2nd Year', semester: '2nd Sem' },
      { id: 'IT14', code: 'IT 14', name: 'Networking 2', yearLevel: '2nd Year', semester: '2nd Sem' },
      { id: 'IT13', code: 'IT 13', name: 'Advanced Database', yearLevel: '2nd Year', semester: '2nd Sem' },
      { id: 'GE8', code: 'GE 8', name: 'Ethics', yearLevel: '2nd Year', semester: '2nd Sem' },
    ],
  },
  {
    label: '3rd/4th Year - Capstone & Practicum',
    courses: [
      { id: 'SYSAN', code: 'SYSAN', name: 'Systems Analysis', yearLevel: '3rd/4th Year', semester: 'Upper Level' },
      { id: 'CAP1', code: 'CAP1', name: 'Capstone 1', yearLevel: '3rd/4th Year', semester: 'Upper Level' },
      { id: 'CAP2', code: 'CAP2', name: 'Capstone 2', yearLevel: '3rd/4th Year', semester: 'Upper Level' },
      { id: 'MAPP1', code: 'MAPP1', name: 'Mobile Apps 1', yearLevel: '3rd/4th Year', semester: 'Upper Level' },
      { id: 'MAPP2', code: 'MAPP2', name: 'Mobile Apps 2', yearLevel: '3rd/4th Year', semester: 'Upper Level' },
      { id: 'APPDEV', code: 'APPDEV', name: 'App Dev', yearLevel: '3rd/4th Year', semester: 'Upper Level' },
      { id: 'INFOSEC', code: 'INFOSEC', name: 'Info Assurance', yearLevel: '3rd/4th Year', semester: 'Upper Level' },
      { id: 'SYSINT', code: 'SYSINT', name: 'Systems Integration', yearLevel: '3rd/4th Year', semester: 'Upper Level' },
      { id: 'ITPM', code: 'ITPM', name: 'IT Project Mgmt', yearLevel: '3rd/4th Year', semester: 'Upper Level' },
      { id: 'SYSADMIN', code: 'SYSADMIN', name: 'Sys Admin', yearLevel: '3rd/4th Year', semester: 'Upper Level' },
      { id: 'INTERNSHIP', code: 'INTERNSHIP', name: 'Internship', yearLevel: '3rd/4th Year', semester: 'Upper Level' },
    ],
  },
]

export default function FacultyGradesPage() {
  const allowed = useRequireRole(['faculty', 'admin'])

  const [courses, setCourses] = useState<CurriculumCourse[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')
  const [students, setStudents] = useState<User[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [scoreInputs, setScoreInputs] = useState<Record<string, ScoreInput>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [auditFeed, setAuditFeed] = useState<AuditEntry[]>([])
  const [currentUserProfile, setCurrentUserProfile] = useState<User | null>(null)

  const groupedCourses = useMemo(() => {
    return curriculumGroups.map(group => ({
      label: group.label,
      courses: group.courses.map(course => ({ ...course, groupLabel: group.label })),
    }))
  }, [])

  useEffect(() => {
    const flattened = groupedCourses.flatMap(g => g.courses)
    setCourses(flattened)
    if (flattened.length > 0) {
      setSelectedCourseId(flattened[0].id)
    }
  }, [groupedCourses])

  useEffect(() => {
    const authUser = authService.getCurrentUser()
    if (authUser?.uid) {
      authService.getUserData(authUser.uid)
        .then(profile => setCurrentUserProfile(profile))
        .catch(err => console.warn('Failed to load user profile', err))
    }
  }, [])

  const refreshAuditFeed = useCallback(async () => {
    try {
      const logs = await auditService.getRecent(8)
      setAuditFeed(logs)
    } catch (error) {
      console.warn('Unable to load audit feed', error)
    }
  }, [])

  const fetchCourseData = useCallback(async (courseId: string) => {
    if (!courseId) return
    setLoading(true)
    try {
      const courseMeta = courses.find(c => c.id === courseId)
      const aliases = courseMeta
        ? [courseMeta.code, courseMeta.code.replace(/\s+/g, '')].filter(Boolean)
        : []

      const [courseGrades, roster] = await Promise.all([
        gradeService.getGradesByCourse(courseId, aliases),
        authService.getStudentsByEnrolledCourse(courseId),
      ])

      setGrades(courseGrades)
      setStudents(roster)
      setScoreInputs((prev) => {
        const next = { ...prev }
        roster.forEach(student => {
          const grade = courseGrades.find(g => {
            const ids = [student.id, student.studentId].filter(Boolean)
            return ids.includes(g.studentId)
          })
          next[student.id] = {
            shortQuiz: (grade as any)?.shortQuizScore ?? grade?.quizScore,
            longQuiz: (grade as any)?.longQuizScore,
            majorExam: (grade as any)?.majorExamScore ?? grade?.examScore,
          }
        })
        return next
      })
      await refreshAuditFeed()
    } catch (error) {
      console.error('Error fetching course data:', error)
      setGrades([])
      setStudents([])
    } finally {
      setLoading(false)
    }
  }, [refreshAuditFeed, courses])

  useEffect(() => {
    if (selectedCourseId) {
      fetchCourseData(selectedCourseId)
    }
  }, [selectedCourseId, fetchCourseData])

  const getGradeForStudent = useCallback((student: User) => {
    const identifiers = [student.id, student.studentId].filter(Boolean)
    return grades.find((grade) => identifiers.includes(grade.studentId))
  }, [grades])

  const getScoreInputs = (student: User): ScoreInput => {
    const grade = getGradeForStudent(student)
    const draft = scoreInputs[student.id] || {}
    return {
      shortQuiz: draft.shortQuiz ?? (grade as any)?.shortQuizScore ?? grade?.quizScore,
      longQuiz: draft.longQuiz ?? (grade as any)?.longQuizScore,
      majorExam: draft.majorExam ?? (grade as any)?.majorExamScore ?? grade?.examScore,
    }
  }

  const computeFinalGrade = (scores: ScoreInput): number | null => {
    const { shortQuiz, longQuiz, majorExam } = scores
    if (
      shortQuiz === undefined || longQuiz === undefined || majorExam === undefined ||
      [shortQuiz, longQuiz, majorExam].some(v => Number.isNaN(Number(v)))
    ) {
      return null
    }
    return +(Number(shortQuiz) * 0.2 + Number(longQuiz) * 0.3 + Number(majorExam) * 0.5).toFixed(2)
  }

  const handleInputChange = (studentId: string, field: keyof ScoreInput, value: string) => {
    setScoreInputs((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value === '' ? undefined : Number(value),
      },
    }))
  }

  const publishGradeMutation = useCallback(async (payload: Partial<Grade>) => {
    return gradeService.publishGrade(payload)
  }, [])

  const handleSaveAndPublish = async (student: User) => {
    if (!selectedCourseId) return
    const scores = getScoreInputs(student)
    const finalScore = computeFinalGrade(scores)

    if (finalScore === null) {
      alert('Please complete Short Quiz, Long Quiz, and Major Exam scores (0-100).')
      return
    }

    const values = [scores.shortQuiz, scores.longQuiz, scores.majorExam] as number[]
    if (values.some(v => v < 0 || v > 100)) {
      alert('Scores must be between 0 and 100.')
      return
    }

    const gradeRecord = getGradeForStudent(student)
    const conversion = convertNumericToGrade(finalScore)
    const authUser = authService.getCurrentUser()
    const course = courses.find(c => c.id === selectedCourseId)
    const professorName = (currentUserProfile?.firstName || currentUserProfile?.lastName)
      ? `${currentUserProfile?.firstName || ''} ${currentUserProfile?.lastName || ''}`.trim()
      : 'Professor'

    setSubmitting(true)
    try {
      await publishGradeMutation({
        id: gradeRecord?.id,
        courseId: selectedCourseId,
        studentId: gradeRecord?.studentId || student.studentId || student.id,
        score: finalScore,
        finalScore,
        quizScore: scores.shortQuiz,
        examScore: scores.majorExam,
        longQuizScore: scores.longQuiz,
        letterGrade: conversion.letterGrade,
        remarks: conversion.remarks,
        status: 'approved',
        submittedBy: authUser?.uid || 'unknown',
        updatedAt: new Date(),
      })

      await auditService.record({
        action: 'PUBLISH_GRADE',
        entityType: 'course',
        entityId: selectedCourseId,
        userId: authUser?.uid || 'unknown',
        description: `${professorName} published grades for ${course?.code || 'selected course'}`,
        changes: {
          studentId: student.studentId || student.id,
          finalScore,
          letterGrade: conversion.letterGrade,
        },
      })

      const [updatedGrades, updatedLogs] = await Promise.all([
        gradeService.getGradesByCourse(selectedCourseId),
        auditService.getRecent(8).catch(() => auditFeed),
      ])
      setGrades(updatedGrades)
      if (updatedLogs) {
        setAuditFeed(updatedLogs)
      }
    } catch (error: any) {
      console.error('Error publishing grade:', error)
      alert('Failed to save/publish. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitAll = async () => {
    if (!selectedCourseId || grades.length === 0) return
    if (!confirm('Submit all draft grades for verification?')) return

    setSubmitting(true)
    try {
      const draftGrades = grades.filter(g => g.status === 'draft')
      await Promise.all(draftGrades.map(g =>
        gradeService.updateGrade(g.id, { status: 'submitted', submittedAt: new Date() })
      ))

      const updatedGrades = await gradeService.getGradesByCourse(selectedCourseId)
      setGrades(updatedGrades)
      alert(`Successfully submitted ${draftGrades.length} grades.`)
    } catch (error) {
      console.error('Error submitting grades:', error)
      alert('Failed to submit grades.')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredStudents = students.filter(student => {
    const fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim().toLowerCase()
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(searchTerm.toLowerCase())

    const grade = getGradeForStudent(student)
    const matchesStatus = statusFilter === 'All' ||
      (statusFilter === 'Draft' && grade?.status === 'draft') ||
      (statusFilter === 'Submitted' && grade?.status === 'submitted') ||
      (statusFilter === 'Approved' && grade?.status === 'approved') ||
      (statusFilter === 'Unassigned' && !grade)

    return matchesSearch && matchesStatus
  })

  const gradeColor = (value: number | null) => {
    if (value === null) return 'text-gray-500'
    if (value < 75) return 'text-red-600'
    if (value >= 90) return 'text-green-600'
    return 'text-gray-800'
  }

  if (!allowed) return <div>Checking permissions...</div>

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Grade Entry</h1>
          <p className="text-gray-600 mt-1">Encode and publish grades with automated computation.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSubmitAll}
            disabled={submitting || grades.filter(g => g.status === 'draft').length === 0}
            className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md"
          >
            Submit All Drafts
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Course</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none text-black"
                >
                  {groupedCourses.map(group => (
                    <optgroup key={group.label} label={group.label}>
                      {group.courses.map(course => (
                        <option key={course.id} value={course.id}>
                          {course.code} - {course.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                  {courses.length === 0 && <option value="">No courses assigned</option>}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none text-black"
                >
                  <option>All</option>
                  <option>Draft</option>
                  <option>Submitted</option>
                  <option>Approved</option>
                  <option>Unassigned</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Search Student</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name or student ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none text-black"
                  />
                  <svg className="h-5 w-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-20 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 animate-pulse">Fetching class record...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-20 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 0 018 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">No students found for this selection.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Short Quizzes (20%)</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Long Quiz (30%)</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Major Exam (50%)</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Final Grade</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredStudents.map((student) => {
                      const grade = getGradeForStudent(student)
                      const scores = getScoreInputs(student)
                      const finalScore = computeFinalGrade(scores) ??
                        (typeof grade?.finalScore === 'number' ? grade.finalScore : grade?.score ?? null)
                      const letter = finalScore !== null ? convertNumericToGrade(finalScore).letterGrade : grade?.letterGrade

                      const firstName = (student.firstName || '').trim()
                      const lastName = (student.lastName || '').trim()
                      const displayName =
                        `${firstName} ${lastName}`.trim() ||
                        student.email ||
                        student.studentId ||
                        'Unknown Student'
                      const firstInitial = (firstName || lastName || '?').charAt(0).toUpperCase()
                      const secondInitial = (lastName || firstName.slice(1) || '').charAt(0).toUpperCase()

                      return (
                        <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold mr-3">
                                {firstInitial}{secondInitial}
                              </div>
                              <div>
                                <div className="text-sm font-bold text-gray-900">{displayName}</div>
                                <div className="text-xs text-gray-500">{student.studentId || student.id.slice(0, 8)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={scores.shortQuiz ?? ''}
                              onChange={(e) => handleInputChange(student.id, 'shortQuiz', e.target.value)}
                              className="w-full text-center bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={scores.longQuiz ?? ''}
                              onChange={(e) => handleInputChange(student.id, 'longQuiz', e.target.value)}
                              className="w-full text-center bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={scores.majorExam ?? ''}
                              onChange={(e) => handleInputChange(student.id, 'majorExam', e.target.value)}
                              className="w-full text-center bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col items-center gap-1">
                              <span className={`text-sm font-bold ${gradeColor(finalScore)}`}>
                                {finalScore !== null ? finalScore.toFixed(2) : '--'}
                              </span>
                              <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold ${letter ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-50 text-gray-400'}`}>
                                {letter ?? 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${grade?.status === 'approved' ? 'bg-green-100 text-green-700' :
                                grade?.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                                  grade?.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-500'
                                }`}>
                                {grade?.status ?? 'Unassigned'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleSaveAndPublish(student)}
                              disabled={submitting}
                              className="px-4 py-2 text-sm font-semibold bg-[#1E3A5F] text-white rounded-lg hover:bg-[#2D5986] disabled:opacity-60"
                            >
                              Save / Publish
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-between items-center px-2">
            <p className="text-xs text-gray-400 font-medium">
              Showing {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
            </p>
            <div className="flex gap-2">
              <button disabled className="px-3 py-1 border border-gray-200 rounded text-xs font-bold text-gray-400 disabled:bg-gray-50 transition-all">Previous</button>
              <button disabled className="px-3 py-1 border border-indigo-200 rounded text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-all">Next</button>
            </div>
          </div>
        </div>

        <aside className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-fit">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-800">Recent Activity</h2>
            <button onClick={refreshAuditFeed} className="text-xs text-indigo-600 hover:underline">Refresh</button>
          </div>
          {auditFeed.length === 0 ? (
            <p className="text-sm text-gray-500">No audit entries yet.</p>
          ) : (
            <div className="space-y-3">
              {auditFeed.map((log) => (
                <div key={log.id} className="p-3 rounded-lg border border-gray-100">
                  <div className="flex items-center justify-between text-sm font-semibold text-gray-800">
                    <span>{log.action || 'ACTION'}</span>
                    <span className="text-xs text-gray-500">{log.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{log.description}</p>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
