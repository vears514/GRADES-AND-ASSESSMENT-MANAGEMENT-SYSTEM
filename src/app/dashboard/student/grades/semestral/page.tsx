'use client'

import React, { useRef, useEffect, useState } from 'react'
import { useRequireRole } from '@/hooks/useRequireRole'
import { calculateGradeStatistics, convertNumericToGrade } from '@/lib/gradeConversion'
import { authService } from '@/services/authService'
import { gradeService } from '@/services/gradeService'
import { User, Grade } from '@/types'

declare global {
  function html2pdf(): any
}

interface Course {
  id: string
  code: string
  name: string
  units: number
  grade: number
  gradeLetters: string
  teacher: string
  remarks: string
  status: 'published' | 'pending'
}

interface Semester {
  id: string
  name: string
  label: string
  courses: Course[]
  year: number
  semKey: string
}

export default function StudentSemestralGradesPage() {
  const allowed = useRequireRole(['student', 'admin'])

  const printRef = useRef<HTMLDivElement>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [semestersData, setSemestersData] = useState<Semester[]>([])
  const [selectedSemId, setSelectedSemId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [gradeRecords, setGradeRecords] = useState<Grade[]>([])

  useEffect(() => {
    let active = true

    const fetchAllData = async () => {
      if (active) {
        setLoading(true)
      }
      try {
        const authUser = await authService.waitForAuthState()
        if (!authUser) return

        const userData = await authService.getUserData(authUser.uid)
        if (!active) return
        setProfile(userData)

        const studentIdentifiers = Array.from(
          new Set([authUser.uid, userData?.studentId].filter(Boolean))
        ) as string[]

        const primaryStudentId = studentIdentifiers[0] || authUser.uid
        const fallbackStudentIds = studentIdentifiers.slice(1)

        const [enrollments, grades] = await Promise.all([
          gradeService.getEnrollmentsByStudent(primaryStudentId, fallbackStudentIds),
          gradeService.getGradesByStudent(primaryStudentId, fallbackStudentIds),
        ])
        setGradeRecords(grades)

        const termMap = new Map<string, Semester>()

        for (const enrollment of enrollments) {
          const courseData = await gradeService.getCourseById(enrollment.courseId)
          if (!courseData) continue

          const gradeRecord = grades.find((g: Grade) => g.courseId === enrollment.courseId)
          const conversion = gradeRecord ? convertNumericToGrade(gradeRecord.score) : null

          const internalCourse: Course = {
            id: enrollment.id,
            code: courseData.code,
            name: courseData.name,
            units: courseData.credits || courseData.units || 3,
            grade: conversion?.gpa || 0,
            gradeLetters: conversion?.letterGrade || 'N/A',
            teacher: courseData.instructor?.name || 'TBA',
            remarks: conversion?.remarks || (gradeRecord ? 'Pending' : 'Enrolled'),
            status: gradeRecord?.status === 'approved' ? 'published' : 'pending',
          }

          const termKey = `${courseData.year}-${courseData.semester}`
          if (!termMap.has(termKey)) {
            const semPrefix = courseData.semester === 'FALL' ? '1st' : '2nd'
            termMap.set(termKey, {
              id: termKey,
              name: `${semPrefix} Semester ${courseData.year}-${courseData.year + 1} - College`,
              label: `${semPrefix} Semester`,
              year: courseData.year,
              semKey: courseData.semester,
              courses: [],
            })
          }
          termMap.get(termKey)!.courses.push(internalCourse)
        }

        const finalData = Array.from(termMap.values()).sort((a, b) => {
          if (a.year !== b.year) return b.year - a.year
          return a.semKey === 'SPRING' ? -1 : 1
        })

        if (!active) return
        setSemestersData(finalData)

        if (finalData.length > 0) {
          setSelectedSemId(finalData[0].id)
        }
      } catch (error) {
        console.error('Error fetching student data:', error)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }
    fetchAllData()

    return () => {
      active = false
    }
  }, [])

  if (allowed === null) {
    return <div>Checking permissions...</div>
  }

  const publishedGrades = gradeRecords
    .map((g) => {
      const score = typeof g.finalScore === 'number' ? g.finalScore : g.score
      const conversion = convertNumericToGrade(score)
      const updated = (g.updatedAt as any)?.toDate?.() || (g.updatedAt as Date) || null
      return {
        id: g.id,
        courseId: g.courseId,
        letter: conversion.letterGrade,
        remarks: conversion.remarks,
        status: g.status,
        score,
        updatedAt: updated,
      }
    })
    .sort((a, b) => (b.updatedAt?.getTime?.() || 0) - (a.updatedAt?.getTime?.() || 0))

  const downloadPDF = async () => {
    if (!printRef.current) return
    if (!selectedSemId) {
      alert('Please select a semester to download its report.')
      return
    }

    try {
      const module = await import('html2pdf.js')
      const html2pdf = module.default

      if (!html2pdf) {
        throw new Error('html2pdf library failed to load')
      }

      const element = printRef.current
      element.style.display = 'block'

      const filename = `SEMESTRAL_GRADES_${selectedSemId}.pdf`
      const opt = {
        margin: 10,
        filename,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, logging: false, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
      }

      await html2pdf().set(opt).from(element).save()
      element.style.display = 'none'
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    }
  }

  const selectedSemester = semestersData.find((s) => s.id === selectedSemId)

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-12">
      <div className="flex items-center border-b border-gray-100 bg-white px-8 py-5">
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <span className="cursor-pointer text-blue-600 hover:underline">Grades</span>
          <span className="text-gray-400">&gt;</span>
          <span className="font-medium text-blue-600">Semestral Grade</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-8 py-6">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Semestral Grade</h1>

        {publishedGrades.length > 0 && (
          <div className="mb-6 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <p className="text-sm font-semibold text-gray-800">Latest Encoded Grades</p>
                <p className="text-xs text-gray-500">Pulled directly from published grade records</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Course</th>
                    <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Score</th>
                    <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Letter</th>
                    <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Status</th>
                    <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {publishedGrades.map((g) => (
                    <tr key={g.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">{g.courseId}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{typeof g.score === 'number' ? g.score.toFixed(2) : '-'}</td>
                      <td className="px-6 py-3 text-sm font-semibold text-gray-800">{g.letter}</td>
                      <td className="px-6 py-3 text-sm capitalize text-gray-700">{g.status || '-'}</td>
                      <td className="px-6 py-3 text-sm text-gray-500">
                        {g.updatedAt ? g.updatedAt.toLocaleString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-gray-100 bg-white p-20 shadow-sm">
            <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
            <p className="animate-pulse font-medium text-gray-500">Loading academic records...</p>
          </div>
        ) : semestersData.length === 0 ? (
          <div className="rounded-lg border border-gray-100 bg-white p-12 text-center shadow-sm">
            <h3 className="mb-2 text-lg font-bold text-gray-800">No Records Found</h3>
            <p className="text-gray-600">We couldn't find any semestral grades for your account.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-gray-800">Academic Year</label>
              <select
                value={selectedSemId || ''}
                onChange={(e) => setSelectedSemId(e.target.value)}
                className="w-full appearance-none rounded-md border border-indigo-200 bg-white px-4 py-2.5 text-sm text-indigo-900 shadow-sm outline-none transition-colors focus:border-indigo-500 md:w-[400px]"
                style={{
                  backgroundImage:
                    'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%234F46E5%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem top 50%',
                  backgroundSize: '0.65rem auto',
                }}
              >
                {semestersData.map((sem) => (
                  <option key={sem.id} value={sem.id}>
                    {sem.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedSemester && (
              <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Subject Code</th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Subject</th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Subject Teacher</th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Units</th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Grade</th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Remarks</th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {selectedSemester.courses.map((course) => (
                        <tr key={course.id} className="transition-colors hover:bg-gray-50/50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-800">{course.code}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{course.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{course.teacher}</td>
                          <td className="px-6 py-4 text-sm text-gray-800">{course.units}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-800">{course.gradeLetters}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{course.remarks}</td>
                          <td className="px-6 py-4 text-sm capitalize text-gray-600">{course.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button
                onClick={downloadPDF}
                className="flex items-center gap-2 rounded-full bg-[#4F46E5] px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Semestral
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'none' }}>
          <div ref={printRef} className="w-[800px] max-w-full bg-white p-8 font-sans text-black">
            <div className="mb-6 text-center">
              <h1 className="text-xl font-bold leading-tight text-blue-900">Bestlink College of the Philippines</h1>
              <p className="text-sm">#1071 Brgy. Kaligayahan, Quirino Highway Novaliches Quezon City</p>
              <p className="mt-1 text-sm font-semibold">{selectedSemester?.name}</p>
              <h2 className="mt-4 mb-6 text-lg font-bold uppercase tracking-wider">UNOFFICIAL FINAL REPORT OF GRADES</h2>
            </div>

            <div className="mb-8 grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
              <div className="flex">
                <span className="w-24 font-semibold text-black">Fullname</span>
                <span className="flex-1 text-black">: {(profile?.lastName ? `${profile.lastName}, ` : '') + (profile?.firstName || 'Unknown')}</span>
              </div>
              <div className="flex">
                <span className="w-32 font-semibold text-black">Student No</span>
                <span className="flex-1 text-black">: {profile?.studentId || 'N/A'}</span>
              </div>
              <div className="flex">
                <span className="w-24 font-semibold text-black">Gender</span>
                <span className="flex-1 text-black">: {profile?.gender || 'N/A'}</span>
              </div>
              <div className="flex">
                <span className="w-32 font-semibold text-black">Academic Year</span>
                <span className="flex-1 text-black">: {selectedSemester?.year}-{selectedSemester ? selectedSemester.year + 1 : ''}</span>
              </div>
              <div className="flex">
                <span className="w-24 font-semibold text-black">College</span>
                <span className="flex-1 text-black">: {profile?.college || 'N/A'}</span>
              </div>
              <div className="flex">
                <span className="w-32 font-semibold text-black">Year Level</span>
                <span className="flex-1 text-black">: {profile?.yearLevel || 'Unknown'}</span>
              </div>
              <div className="flex">
                <span className="w-24 font-semibold text-black">Program</span>
                <span className="flex-1 text-black">: {profile?.program || profile?.course || 'N/A'}</span>
              </div>
              <div className="flex">
                <span className="w-32 font-semibold text-black">Academic Status</span>
                <span className="flex-1 text-black">: Regular</span>
              </div>
            </div>

            <table className="mb-6 w-full border-b-2 border-dashed border-gray-400 text-sm text-black">
              <thead>
                <tr className="border-t-2 border-b-2 border-dashed border-gray-400 text-black">
                  <th className="py-2 text-left font-semibold">CODE</th>
                  <th className="w-1/2 py-2 text-left font-semibold">SUBJECT TITLE</th>
                  <th className="py-2 text-center font-semibold">Grade</th>
                  <th className="py-2 text-center font-semibold">
                    Credited
                    <br />
                    Units
                  </th>
                  <th className="py-2 text-left font-semibold">REMARKS</th>
                </tr>
              </thead>
              <tbody>
                {selectedSemester?.courses.map((course) => (
                  <tr key={course.id} className="text-[12px] text-black">
                    <td className="py-1">{course.code}</td>
                    <td className="py-1">{course.name}</td>
                    <td className="py-1 text-center font-medium">{course.gradeLetters}</td>
                    <td className="py-1 text-center">{course.units.toFixed(1)}</td>
                    <td className="py-1">{course.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="text-sm text-black">
              <div className="mb-6 text-center">*** Nothing Follows ***</div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <table className="mb-4 w-full">
                    <tbody>
                      {selectedSemester &&
                        (() => {
                          const courses = selectedSemester.courses
                          const stats = calculateGradeStatistics(courses.map((c) => ({ gpa: c.grade, units: c.units })))
                          return (
                            <>
                              <tr>
                                <td className="py-1">Total Subjects Enrolled</td>
                                <td>: {stats.totalCourses.toFixed(1)}</td>
                              </tr>
                              <tr>
                                <td className="py-1">Total Credits Enrolled</td>
                                <td>: {stats.totalUnits.toFixed(1)}</td>
                              </tr>
                              <tr>
                                <td className="py-1 font-semibold">General Weighted Average</td>
                                <td className="font-semibold">: {stats.gpa.toFixed(3)}</td>
                              </tr>
                            </>
                          )
                        })()}
                    </tbody>
                  </table>
                  <div className="mt-8 inline-block w-48 border-t border-black text-center">
                    <p className="mt-1 text-black">Registrar</p>
                  </div>
                </div>

                <div className="text-xs text-black">
                  <p className="mb-1 border-b border-gray-300 pb-1 font-semibold text-blue-900">GRADING SYSTEM:</p>
                  <div className="grid grid-cols-2 gap-x-4">
                    <div className="space-y-0.5">
                      <p>1.00 = 98 - 100</p>
                      <p>1.25 = 95 - 97</p>
                      <p>1.50 = 92 - 94</p>
                      <p>1.75 = 89 - 91</p>
                      <p>2.00 = 86 - 88</p>
                      <p>2.25 = 83 - 85</p>
                      <p>2.50 = 80 - 82</p>
                      <p>2.75 = 77 - 79</p>
                      <p>3.00 = 75 - 76</p>
                      <p>5.00 = 1 - 74</p>
                    </div>
                    <div className="space-y-0.5">
                      <p>DRP = Dropped</p>
                      <p>INC = Incomplete</p>
                      <p>N = No Credit</p>
                      <p>NA = Not Attending</p>
                      <p>NG = No Grade</p>
                      <p>OD = Officially Dropped</p>
                      <p>UD = Unofficially Dropped</p>
                      <p>UW = Unauthorized Withdrawal</p>
                      <p>W = Withdrawal</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-gray-100 pt-4 text-xs text-gray-500" suppressHydrationWarning>
              Date Printed: {new Date().toLocaleString()} [{profile?.firstName && profile?.lastName ? `${profile.firstName} ${profile.lastName}` : 'STUDENT'}]
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
