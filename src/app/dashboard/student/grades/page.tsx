'use client'

import React, { useRef, useEffect, useState } from 'react'
import { useRequireRole } from '@/hooks/useRequireRole'
import { calculateGPA, convertNumericToGrade, calculateGradeStatistics } from '@/lib/gradeConversion'
import { authService } from '@/services/authService'
import { gradeService } from '@/services/gradeService'
import { User } from '@/types'



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
}

interface YearData {
  year: number
  semesters: Semester[]
}

// studentGradesData constant removed in favor of dynamic fetching

export default function StudentSemestralGradesPage() {
  const allowed = useRequireRole(['student', 'admin'])

  // hooks must run every render before we decide to exit
  const contentRef = useRef<HTMLDivElement>(null)
  const printRef = useRef<HTMLDivElement>(null)
  const [expandedYear, setExpandedYear] = useState<number | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [yearsData, setYearsData] = useState<YearData[]>([])
  const [loading, setLoading] = useState(true)

  // try to restore last expanded year from session storage when the
  // component mounts (supports back/forward and full reloads).
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true)
      try {
        const authUser = await authService.waitForAuthState()
        if (!authUser) return

        // Fetch user profile
        const userData = await authService.getUserData(authUser.uid)
        setProfile(userData)

        const studentId = userData?.studentId || authUser.uid

        // Fetch enrollments and grades
        const [enrollments, grades] = await Promise.all([
          gradeService.getEnrollmentsByStudent(studentId),
          gradeService.getGradesByStudent(studentId)
        ])

        const transformedYears = new Map<number, Map<string, Course[]>>()

        for (const enrollment of enrollments) {
          const courseData = await gradeService.getCourseById(enrollment.courseId)
          if (!courseData) continue

          const gradeRecord = grades.find(g => g.courseId === enrollment.courseId)

          // Map scores to PH 1.0 scale using conversion lib
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
            status: gradeRecord?.status === 'approved' ? 'published' : 'pending'
          }

          if (!transformedYears.has(courseData.year)) {
            transformedYears.set(courseData.year, new Map())
          }
          const semestersMap = transformedYears.get(courseData.year)!

          if (!semestersMap.has(courseData.semester)) {
            semestersMap.set(courseData.semester, [])
          }
          semestersMap.get(courseData.semester)!.push(internalCourse)
        }

        const finalData: YearData[] = Array.from(transformedYears.entries())
          .sort(([a], [b]) => a - b)
          .map(([year, sMap]) => ({
            year,
            semesters: Array.from(sMap.entries())
              .sort(([a], [b]) => (a === 'FALL' ? -1 : 1)) // FALL first
              .map(([sem, courses]) => ({
                id: `${year}-${sem}`,
                name: `${sem === 'FALL' ? '1st' : '2nd'} Semester ${year}-${year + 1}`,
                label: sem === 'FALL' ? '1st Semester' : '2nd Semester',
                courses
              }))
          }))

        setYearsData(finalData)

        // Auto-expand most recent year if none expanded
        if (finalData.length > 0 && expandedYear === null) {
          setExpandedYear(finalData[finalData.length - 1].year)
        }
      } catch (error) {
        console.error('Error fetching student data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAllData()

    const stored = sessionStorage.getItem('expandedYear')
    if (stored) {
      const year = parseInt(stored, 10)
      if (!isNaN(year)) {
        setExpandedYear(year)
      }
    }
  }, [])

  if (allowed === null) {
    return <div>Checking permissions…</div>
  }

  // Uses robust calculation handling 4.0 or 1.0 logic directly imported
  const calculateSemesterGPAStr = (courses: any[]) => calculateGPA(courses, '1.0').toFixed(2)
  const calculateYearGPAStr = (semesters: any[]) => {
    const allCourses = semesters.flatMap(s => s.courses)
    return calculateGPA(allCourses, '1.0').toFixed(2)
  }

  const getTotalCredits = () => {
    return yearsData.reduce((total, year) => {
      return total + year.semesters.reduce((semTotal, sem) => {
        return semTotal + sem.courses.reduce((courseTotal, course) => courseTotal + course.units, 0)
      }, 0)
    }, 0)
  }

  const getTotalPublished = () => {
    return yearsData.reduce((total, year) => {
      return total + year.semesters.reduce((semTotal, sem) => {
        return semTotal + sem.courses.filter(c => c.status === 'published').length
      }, 0)
    }, 0)
  }

  const getTotalCourses = () => {
    return yearsData.reduce((total, year) => {
      return total + year.semesters.reduce((semTotal, sem) => semTotal + sem.courses.length, 0)
    }, 0)
  }

  const downloadPDF = async () => {
    if (!printRef.current) return
    if (expandedYear === null) {
      alert('Please expand a year to download its report.')
      return
    }

    try {
      const module = await import('html2pdf.js')
      const html2pdf = module.default

      if (!html2pdf) {
        throw new Error('html2pdf library failed to load')
      }

      const element = printRef.current
      // Temporarily unhide for printing
      element.style.display = 'block'

      const filename = `UNOFFICIAL_FINAL_REPORT_OF_GRADES_YEAR_${expandedYear}.pdf`

      const opt = {
        margin: 10,
        filename,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, logging: false, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
      }

      await html2pdf().set(opt).from(element).save()

      // Hide again
      element.style.display = 'none'
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    }
  }

  const overallGWAValue = calculateGPA(
    yearsData.flatMap(y => y.semesters).flatMap(s => s.courses).filter(c => c.grade > 0),
    '1.0'
  ).toFixed(2)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-12">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Semestral Grades</h1>
              <p className="text-gray-600">View your academic performance by year and semester</p>
            </div>
            <button
              onClick={downloadPDF}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg hover:shadow-xl whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF Report
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Overall GWA Card */}
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 p-6 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 rounded-l-2xl"></div>
            <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Overall GWA</p>
            <p className="text-4xl font-extrabold text-blue-700 tracking-tight mt-1">{overallGWAValue}</p>
            <p className="text-xs text-gray-500 mt-2 font-medium">Ph 1.0 Scale</p>
          </div>

          {/* Total Credits Card */}
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 p-6 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500 rounded-l-2xl"></div>
            <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Total Credits</p>
            <p className="text-4xl font-extrabold text-green-700 tracking-tight mt-1">{getTotalCredits()}</p>
            <p className="text-xs text-gray-500 mt-2 font-medium">Units Earned</p>
          </div>

          {/* Grades Posted Card with Progress Bar */}
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 p-6 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500 rounded-l-2xl"></div>
            <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Grades Posted</p>
            <p className="text-4xl font-extrabold text-gray-900 tracking-tight mt-1">{getTotalPublished()}<span className="text-lg text-gray-400 font-medium ml-1">/{getTotalCourses()}</span></p>
            <div className="w-full bg-gray-100 rounded-full h-2 mt-3 mb-1 overflow-hidden">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${(getTotalPublished() / getTotalCourses()) * 100}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-gray-500 font-medium">Published Grades Progress</p>
          </div>

          {/* Status Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden flex flex-col justify-center items-start">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500 rounded-l-2xl"></div>
            <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Academic Status</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
              <p className="text-2xl font-bold text-gray-800">Active</p>
            </div>
            <p className="text-xs text-gray-400 mt-2">Currently Enrolled</p>
          </div>
        </div>

        {/* Grades by Year */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-20 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium animate-pulse">Loading academic records...</p>
          </div>
        ) : yearsData.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Records Found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              We couldn't find any semestral grades for your account. This is normal for newly registered students who haven't completed a term yet.
            </p>
          </div>
        ) : (
          <>
            <div ref={contentRef} className="space-y-6">
              {yearsData.map((yearData) => (
                <div key={yearData.year} className="bg-white rounded-lg shadow overflow-hidden text-black">
                  {/* Year Header */}
                  <button
                    onClick={() => {
                      const newYear = expandedYear === yearData.year ? null : yearData.year
                      setExpandedYear(newYear)
                      sessionStorage.setItem('expandedYear', newYear !== null ? newYear.toString() : '')
                    }}
                    className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all flex justify-between items-center"
                  >
                    <div className="flex items-center gap-4">
                      <h2 className="text-xl font-bold">
                        Year {yearData.year}
                      </h2>
                      <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                        GWA: {calculateYearGPAStr(yearData.semesters)}
                      </span>
                    </div>
                    <svg
                      className={`h-5 w-5 transition-transform ${expandedYear === yearData.year ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </button>

                  {/* Semesters */}
                  {expandedYear === yearData.year && (
                    <div className="p-6 space-y-6">
                      {yearData.semesters.map((semester) => (
                        <div key={semester.id} className="border border-gray-200 rounded-lg overflow-hidden">
                          {/* Semester Header */}
                          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-700">{semester.name}</h3>
                            <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded">
                              GWA: {calculateSemesterGPAStr(semester.courses)}
                            </span>
                          </div>

                          {/* Courses Table */}
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="bg-gray-100 border-b border-gray-200">
                                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Course Code</th>
                                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Course Name</th>
                                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Teacher</th>
                                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Units</th>
                                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Grade</th>
                                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Remarks</th>
                                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {semester.courses.map((course) => (
                                  <tr key={course.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{course.code}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{course.name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{course.teacher}</td>
                                    <td className="px-4 py-3 text-sm text-center font-medium text-gray-700">{course.units}</td>
                                    <td className="px-4 py-3 text-sm text-center">
                                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-500">
                                        {course.gradeLetters}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{course.remarks}</td>
                                    <td className="px-4 py-3 text-sm">
                                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${course.status === 'published'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {course.status === 'published' ? 'Published' : 'Pending'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Semester Summary */}
                          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-between items-center text-sm">
                            <span className="text-gray-700">
                              Total Units: <span className="font-semibold">{semester.courses.reduce((sum, c) => sum + c.units, 0)}</span>
                            </span>
                            <span className="text-gray-700">
                              Semester GWA: <span className="font-semibold text-indigo-600">{calculateSemesterGPAStr(semester.courses)}</span>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer Info */}
            <div className="mt-8 bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Note:</span> Your semestral grades are organized by year and semester. Published grades appear on your official transcript. Pending grades are still being processed by your instructor.
              </p>
            </div>

            {/* Hidden Printable Report */}
            <div style={{ display: 'none' }}>
              <div ref={printRef} className="p-8 bg-white text-black font-sans w-[800px] max-w-full">
                {/* Header */}
                <div className="text-center mb-6">
                  <h1 className="text-xl font-bold text-blue-900 leading-tight">Bestlink College of the Philippines</h1>
                  <p className="text-sm">#1071 Brgy. Kaligayahan, Quirino Highway Novaliches Quezon City</p>
                  <p className="text-sm font-semibold mt-1">2nd Semester, School Year 2023-2024</p>
                  <h2 className="text-lg font-bold mt-4 mb-6 uppercase tracking-wider">UNOFFICIAL FINAL REPORT OF GRADES</h2>
                </div>

                {/* Student Info */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-1 mb-8 text-sm">
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
                    <span className="flex-1 text-black">: {new Date().getFullYear()}-{new Date().getFullYear() + 1}</span>
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

                {/* Grades Table */}
                <table className="w-full text-sm mb-6 border-b-2 border-dashed border-gray-400 text-black">
                  <thead>
                    <tr className="border-t-2 border-b-2 border-dashed border-gray-400 text-black">
                      <th className="py-2 text-left font-semibold">CODE</th>
                      <th className="py-2 text-left font-semibold w-1/2">SUBJECT TITLE</th>
                      <th className="py-2 text-center font-semibold">Grade</th>
                      <th className="py-2 text-center font-semibold">Credited<br />Units</th>
                      <th className="py-2 text-left font-semibold">REMARKS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearsData
                      .filter(y => y.year === expandedYear)
                      .flatMap(y => y.semesters)
                      .flatMap(s => s.courses)
                      .map((course) => (
                        <tr key={course.id} className="text-black text-[12px]">
                          <td className="py-1">{course.code}</td>
                          <td className="py-1">{course.name}</td>
                          <td className="py-1 text-center font-medium">{course.grade.toFixed(2)}</td>
                          <td className="py-1 text-center">{course.units.toFixed(1)}</td>
                          <td className="py-1">{course.remarks}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>

                {/* Footer Info */}
                <div className="text-sm text-black">
                  <div className="text-center mb-6">*** Nothing Follows ***</div>

                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <table className="w-full mb-4">
                        <tbody>
                          {expandedYear && (() => {
                            const yearData = yearsData.find(y => y.year === expandedYear);
                            if (!yearData) return null;
                            const courses = yearData.semesters.flatMap(s => s.courses);
                            const stats = calculateGradeStatistics(courses.map(c => ({ gpa: c.grade, units: c.units })));
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
                            );
                          })()}
                        </tbody>
                      </table>
                      <div className="mt-8 text-center border-t border-black w-48 inline-block">
                        <p className="mt-1 text-black">Registrar</p>
                      </div>
                    </div>

                    <div className="text-xs text-black">
                      <p className="font-semibold mb-1 text-blue-900 border-b border-gray-300 pb-1">GRADING SYSTEM:</p>
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

                <div className="mt-8 text-xs text-gray-500 border-t border-gray-100 pt-4" suppressHydrationWarning>
                  Date Printed: {new Date().toLocaleString()} [{(profile?.firstName && profile?.lastName) ? `${profile.firstName} ${profile.lastName}` : 'STUDENT'}]
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
