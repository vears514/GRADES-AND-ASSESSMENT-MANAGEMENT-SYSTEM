'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRequireRole } from '@/hooks/useRequireRole'
import { authService } from '@/services/authService'
import { gradeService } from '@/services/gradeService'
import { User, Grade } from '@/types'
import { convertNumericToGrade } from '@/lib/gradeConversion'

type CurriculumCourse = {
  id: string
  code: string
  name: string
  year: string
  semester: string
}

const curriculum: CurriculumCourse[] = [
  { year: '1st Year', semester: '1st Sem', code: 'CC 101', name: 'Introduction to Computing', id: 'CC101' },
  { year: '1st Year', semester: '1st Sem', code: 'CC 102', name: 'Computer Programming 1', id: 'CC102' },
  { year: '1st Year', semester: '1st Sem', code: 'GE 1 / UTS', name: 'Understanding the Self', id: 'GE1' },
  { year: '1st Year', semester: '1st Sem', code: 'GE 4 / MMW', name: 'Mathematics in the Modern World', id: 'GE4' },
  { year: '1st Year', semester: '1st Sem', code: 'GE 5 / PCOM', name: 'Purposive Communication', id: 'GE5' },
  { year: '1st Year', semester: '2nd Sem', code: 'CC 103', name: 'Computer Programming 2', id: 'CC103' },
  { year: '1st Year', semester: '2nd Sem', code: 'IT 05', name: 'Discrete Mathematics', id: 'IT05' },
  { year: '1st Year', semester: '2nd Sem', code: 'IT 01', name: 'Introduction to Human-Computer Interaction', id: 'IT01' },
  { year: '1st Year', semester: '2nd Sem', code: 'GE 2 / RPH', name: 'Readings in Philippine History', id: 'GE2' },
  { year: '1st Year', semester: '2nd Sem', code: 'GE 7 / STS', name: 'Science, Technology, and Society', id: 'GE7' },
  { year: '2nd Year', semester: '1st Sem', code: 'CC 04 / ICS 2605', name: 'Data Structures and Algorithms', id: 'CC04' },
  { year: '2nd Year', semester: '1st Sem', code: 'IT 07 / CIT 303', name: 'Networking 1', id: 'IT07' },
  { year: '2nd Year', semester: '1st Sem', code: 'CC 05 / ICS 2607', name: 'Information Management 1 (Databases)', id: 'CC05' },
  { year: '2nd Year', semester: '1st Sem', code: 'PF 101 / INTE 1044', name: 'Object-Oriented Programming', id: 'PF101' },
  { year: '2nd Year', semester: '2nd Sem', code: 'IT 11 / WS 101', name: 'Web Systems and Technologies 1', id: 'IT11' },
  { year: '2nd Year', semester: '2nd Sem', code: 'IT 14 / INTE 1030', name: 'Networking 2', id: 'IT14' },
  { year: '2nd Year', semester: '2nd Sem', code: 'IT 13', name: 'Advanced Database Systems', id: 'IT13' },
  { year: '2nd Year', semester: '2nd Sem', code: 'GE 8 / ETH', name: 'Ethics', id: 'GE8' },
  { year: '3rd Year', semester: '1st Sem', code: 'IT 16 / IT 633', name: 'Systems Analysis and Design', id: 'IT16' },
  { year: '3rd Year', semester: '1st Sem', code: 'CIT 302 / IPT 102', name: 'Integrative Programming and Technologies', id: 'CIT302' },
  { year: '3rd Year', semester: '1st Sem', code: 'CC 06 / CIT 307', name: 'Applications Development and Emerging Tech', id: 'CC06' },
  { year: '3rd Year', semester: '1st Sem', code: 'IT 06 / CIT 306', name: 'Mobile Applications', id: 'IT06' },
  { year: '3rd Year', semester: '2nd Sem', code: 'CITE 007A / CIT 308', name: 'Capstone Project 1', id: 'CITE007A' },
  { year: '3rd Year', semester: '2nd Sem', code: 'CITE 006 / CIT 310', name: 'Information Assurance and Security 1', id: 'CITE006' },
  { year: '3rd Year', semester: '2nd Sem', code: 'IT 15 / CIT 305', name: 'Systems Integration and Architecture', id: 'IT15' },
  { year: '3rd Year', semester: '2nd Sem', code: 'CIT 309', name: 'IT Project Management', id: 'CIT309' },
  { year: '4th Year', semester: '1st Sem', code: 'CIT 400 / CAP 102', name: 'Capstone Project 2', id: 'CIT400' },
  { year: '4th Year', semester: '1st Sem', code: 'CIT 401', name: 'Systems Administration and Maintenance', id: 'CIT401' },
  { year: '4th Year', semester: '1st Sem', code: 'CITE 008', name: 'Social Issues and Professional Practice', id: 'CITE008' },
  { year: '4th Year', semester: '1st Sem', code: 'ITELEC', name: 'Professional/IT Electives', id: 'ITELEC' },
  { year: '4th Year', semester: '2nd Sem', code: 'CIT 402 / INTE 1043', name: 'Internship / Practicum in Computing', id: 'CIT402' },
]

export default function FacultyGradesPage() {
  const allowed = useRequireRole(['faculty', 'admin'])

  const [courses, setCourses] = useState<CurriculumCourse[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')
  const [students, setStudents] = useState<User[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [quizScore, setQuizScore] = useState('')
  const [examScore, setExamScore] = useState('')
  const [editStatus, setEditStatus] = useState<'draft' | 'submitted' | 'approved'>('approved')
  const [editRemarks, setEditRemarks] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null)

  useEffect(() => {
    const curriculumCourses = curriculum.map(c => ({
      id: c.id,
      code: c.code,
      name: c.name,
      year: c.year,
      semester: c.semester,
      students: [],
    })) as Course[]
    setCourses(curriculumCourses)
    if (curriculumCourses.length > 0) {
      setSelectedCourseId(curriculumCourses[0].id)
    }
    setLoading(false)
  }, [])

  const fetchCourseData = useCallback(async (courseId: string) => {
    if (!courseId) return
    setLoading(true)
    try {
      const course = courses.find(c => c.id === courseId)
      if (!course) {
        setStudents([])
        setGrades([])
        return
      }

      const courseGrades = await gradeService.getGradesByCourse(courseId)
      setStudents([]) // no enrolled roster provided in curriculum dataset
      setGrades(courseGrades)
    } catch (error) {
      console.error('Error fetching course data:', error)
    } finally {
      setLoading(false)
    }
  }, [courses])

  useEffect(() => {
    if (selectedCourseId) {
      fetchCourseData(selectedCourseId)
    }
  }, [selectedCourseId, fetchCourseData])

  if (!allowed) return <div>Checking permissions…</div>

  const getGradeForStudent = (student: User) => {
    const studentIdentifiers = [student.id, student.studentId].filter(Boolean)
    return grades.find((grade) => studentIdentifiers.includes(grade.studentId))
  }

  const handleEdit = (student: User, currentScore?: number) => {
    setEditingId(student.id)
    setSelectedStudent(student)
    const g = getGradeForStudent(student)
    setQuizScore(g?.quizScore !== undefined ? String(g.quizScore) : '')
    setExamScore(g?.examScore !== undefined ? String(g.examScore) : '')
    setEditStatus((g?.status as any) || 'approved')
    setEditRemarks(g?.remarks || '')
    setShowModal(true)
  }

  const handleSave = async (student: User) => {
    if (!selectedCourseId) return
    const quiz = Number(quizScore)
    const exam = Number(examScore)
    if (!Number.isFinite(quiz) || quiz < 0 || quiz > 100 || !Number.isFinite(exam) || exam < 0 || exam > 100) {
      alert('Please enter valid quiz/exam scores from 0 to 100.')
      return
    }
    const finalScore = +(quiz * 0.2 + exam * 0.8).toFixed(2)
    const conversion = convertNumericToGrade(finalScore)

    setSubmitting(true)
    try {
      const authUser = authService.getCurrentUser()
      const existingGrade = getGradeForStudent(student)

      const gradeData: Partial<Grade> = {
        id: existingGrade?.id,
        courseId: selectedCourseId,
        studentId: existingGrade?.studentId || student.studentId || student.id,
        quizScore: quiz,
        examScore: exam,
        finalScore,
        score: finalScore,
        letterGrade: conversion.letterGrade,
        remarks: editRemarks || conversion.remarks,
        status: editStatus,
        submittedBy: authUser?.uid || 'unknown',
        updatedAt: new Date()
      }

      await gradeService.publishGrade(gradeData)

      const updatedGrades = await gradeService.getGradesByCourse(selectedCourseId)
      setGrades(updatedGrades)
      setEditingId(null)
      setShowModal(false)
      setSelectedStudent(null)
    } catch (error) {
      console.error('Error saving grade:', error)
      const message = error instanceof Error ? error.message : 'Please try again.'
      alert(`Failed to save grade. ${message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitAll = async () => {
    if (!selectedCourseId || grades.length === 0) return
    if (!confirm('Are you sure you want to submit all draft grades for verification?')) return

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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Grade Entry</h1>
          <p className="text-gray-600 mt-1">Manage and submit grades for your assigned courses</p>
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Course</label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none text-black"
            >
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.name} ({(course as any).year} | {(course as any).semester})
                </option>
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
          <div className="md:col-span-2">
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
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Student Details</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Grade</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredStudents.map((student) => {
                  const grade = getGradeForStudent(student)
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
                        <div className="flex justify-center">
                          <span className="text-sm font-bold text-gray-700">{grade?.finalScore ?? grade?.score ?? '—'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${grade ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-50 text-gray-400'
                            }`}>
                            {grade?.letterGrade ?? 'N/A'}
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
                          onClick={() => handleEdit(student, grade?.score)}
                          disabled={grade?.status === 'approved' || grade?.status === 'submitted'}
                          className="px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent text-sm font-semibold"
                          title="Edit"
                        >
                          Edit
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

      {showModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Quick update</p>
                <p className="text-sm font-semibold text-gray-800">
                  {selectedStudent.firstName} {selectedStudent.lastName} ({selectedStudent.studentId || selectedStudent.id.slice(0, 8)})
                </p>
              </div>
              <button
                onClick={() => { setShowModal(false); setEditingId(null); setSelectedStudent(null); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="p-3 rounded-lg bg-[#E9F4FF] text-[#1E3A5F] text-sm font-medium">
                Status: {editStatus === 'approved' ? 'Approved' : editStatus === 'submitted' ? 'Submitted' : 'Draft'}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-600">Quiz (20%)</label>
                  <input
                    type="number"
                    value={quizScore}
                    onChange={(e) => setQuizScore(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2D5986] outline-none text-black"
                    min="0"
                    max="100"
                    autoFocus
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-600">Exam (80%)</label>
                  <input
                    type="number"
                    value={examScore}
                    onChange={(e) => setExamScore(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2D5986] outline-none text-black"
                    min="0"
                    max="100"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-600">Final Grade (computed)</label>
                  <div className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-800">
                    {Number.isFinite(Number(quizScore)) && Number.isFinite(Number(examScore))
                      ? `${(Number(quizScore) * 0.2 + Number(examScore) * 0.8).toFixed(2)}`
                      : '—'}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-600">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2D5986] outline-none text-black"
                  >
                    <option value="approved">Publish (Approved)</option>
                    <option value="submitted">Submitted</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div className="md:col-span-2 flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-600">Remarks</label>
                  <textarea
                    value={editRemarks}
                    onChange={(e) => setEditRemarks(e.target.value)}
                    rows={3}
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2D5986] outline-none text-black"
                    placeholder="Add a short note (optional)"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => { setShowModal(false); setEditingId(null); setSelectedStudent(null); }}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => selectedStudent && handleSave(selectedStudent)}
                disabled={submitting}
                className="px-4 py-2 text-sm font-semibold bg-[#1E3A5F] text-white rounded-lg hover:bg-[#2D5986] disabled:opacity-60"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
