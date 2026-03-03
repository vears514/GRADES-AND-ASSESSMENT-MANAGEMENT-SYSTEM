'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRequireRole } from '@/hooks/useRequireRole'
import { authService } from '@/services/authService'
import { gradeService } from '@/services/gradeService'
import { User, Grade, Course } from '@/types'
import { convertNumericToGrade } from '@/lib/gradeConversion'

export default function FacultyGradesPage() {
  const allowed = useRequireRole(['faculty', 'admin'])

  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')
  const [students, setStudents] = useState<User[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const [editingId, setEditingId] = useState<string | null>(null) // Student ID being edited
  const [editScore, setEditScore] = useState('')

  // Fetch courses handled by this faculty
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const authUser = await authService.waitForAuthState()
        if (!authUser) return

        const facultyCourses = await gradeService.getCoursesByInstructor(authUser.uid)
        setCourses(facultyCourses)
        if (facultyCourses.length > 0) {
          setSelectedCourseId(facultyCourses[0].id)
        }
      } catch (error) {
        console.error('Error fetching courses:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [])

  // Fetch students and grades when course changes
  const fetchCourseData = useCallback(async (courseId: string) => {
    if (!courseId) return
    setLoading(true)
    try {
      // Find course details to get student list
      const course = courses.find(c => c.id === courseId)
      if (!course) return

      const [enrolledStudents, courseGrades] = await Promise.all([
        authService.getUsersByIds(course.students || []),
        gradeService.getGradesByCourse(courseId)
      ])

      setStudents(enrolledStudents)
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

  const handleEdit = (studentId: string, currentScore: number) => {
    setEditingId(studentId)
    setEditScore(currentScore.toString())
  }

  const handleSave = async (studentId: string) => {
    if (!selectedCourseId) return
    setSubmitting(true)
    try {
      const authUser = authService.getCurrentUser()
      const existingGrade = grades.find(g => g.studentId === studentId)
      const score = parseFloat(editScore)
      const conversion = convertNumericToGrade(score)

      const gradeData: Partial<Grade> = {
        id: existingGrade?.id,
        courseId: selectedCourseId,
        studentId: studentId,
        score: score,
        letterGrade: conversion.letterGrade,
        remarks: conversion.remarks,
        status: existingGrade?.status || 'draft',
        submittedBy: authUser?.uid || 'unknown',
        updatedAt: new Date()
      }

      await gradeService.upsertGrade(gradeData)

      // Refresh local grades
      const updatedGrades = await gradeService.getGradesByCourse(selectedCourseId)
      setGrades(updatedGrades)
      setEditingId(null)
    } catch (error) {
      console.error('Error saving grade:', error)
      alert('Failed to save grade. Please try again.')
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
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase()
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(searchTerm.toLowerCase())

    const grade = grades.find(g => g.studentId === student.id)
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

      {/* Filters */}
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
                  {course.code} - {course.name}
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

      {/* Grades Table */}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
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
                  const grade = grades.find(g => g.studentId === student.id)
                  const isEditing = editingId === student.id

                  return (
                    <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold mr-3">
                            {student.firstName[0]}{student.lastName[0]}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">{student.firstName} {student.lastName}</div>
                            <div className="text-xs text-gray-500">{student.studentId || student.id.slice(0, 8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editScore}
                              onChange={(e) => setEditScore(e.target.value)}
                              autoFocus
                              className="w-20 text-center bg-white border border-indigo-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-black font-bold"
                              min="0"
                              max="100"
                            />
                          ) : (
                            <span className="text-sm font-bold text-gray-700">{grade?.score ?? '—'}</span>
                          )}
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
                        {isEditing ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleSave(student.id)}
                              disabled={submitting}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Save"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Cancel"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEdit(student.id, grade?.score ?? 0)}
                            disabled={grade?.status === 'approved' || grade?.status === 'submitted'}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Edit"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Placeholder */}
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
  )
}
