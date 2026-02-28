'use client'

import React, { useRef, useEffect, useState } from 'react'
import { useRequireRole } from '@/hooks/useRequireRole'

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

const studentGradesData: YearData[] = [
  {
    year: 1,
    semesters: [
      {
        id: '1-1',
        name: '1st Semester 2023-2024',
        label: '1st Semester',
        courses: [
          { id: 'c1', code: 'CS101', name: 'Introduction to Programming', units: 3, grade: 1.75, gradeLetters: 'A-', teacher: 'Dr. Patricia Lopez', remarks: 'Passed', status: 'published' },
          { id: 'c2', code: 'CS181', name: 'Computer Fundamentals', units: 3, grade: 1.5, gradeLetters: 'A-', teacher: 'Prof. Michael Torres', remarks: 'Passed', status: 'published' },
          { id: 'c3', code: 'CS182', name: 'Digital Logic', units: 3, grade: 2.0, gradeLetters: 'B+', teacher: 'Ms. Sarah Chen', remarks: 'Passed', status: 'published' },
          { id: 'c4', code: 'CS802', name: 'Mathematics for CS I', units: 4, grade: 1.75, gradeLetters: 'A-', teacher: 'Prof. James Mitchell', remarks: 'Passed', status: 'published' },
          { id: 'c5', code: 'GEC804', name: 'English Communication', units: 3, grade: 2.25, gradeLetters: 'B', teacher: 'Mr. John Smith', remarks: 'Passed', status: 'published' },
          { id: 'c6', code: 'NSTP181', name: 'NSTP I', units: 3, grade: 1.0, gradeLetters: 'A', teacher: 'Maj. Carlos Reyes', remarks: 'Passed', status: 'published' },
        ]
      },
      {
        id: '1-2',
        name: '2nd Semester 2023-2024',
        label: '2nd Semester',
        courses: [
          { id: 'd1', code: 'CS191', name: 'Data Structures', units: 3, grade: 1.5, gradeLetters: 'A-', teacher: 'Dr. Patricia Lopez', remarks: 'Passed', status: 'published' },
          { id: 'd2', code: 'GEC181', name: 'Philosophy', units: 3, grade: 2.0, gradeLetters: 'B+', teacher: 'Fr. Antonio Cruz', remarks: 'Passed', status: 'published' },
          { id: 'd3', code: 'CS193', name: 'Database Systems', units: 3, grade: 1.75, gradeLetters: 'A-', teacher: 'Prof. Michael Torres', remarks: 'Passed', status: 'published' },
          { id: 'd4', code: 'CS188', name: 'Computer Architecture', units: 4, grade: 2.0, gradeLetters: 'B+', teacher: 'Ms. Sarah Chen', remarks: 'Passed', status: 'published' },
          { id: 'd5', code: 'LIT081', name: 'Philippine Literature', units: 3, grade: 2.25, gradeLetters: 'B', teacher: 'Mr. Robert Santos', remarks: 'Passed', status: 'published' },
        ]
      }
    ]
  },
  {
    year: 2,
    semesters: [
      {
        id: '2-1',
        name: '1st Semester 2024-2025',
        label: '1st Semester',
        courses: [
          { id: 'e1', code: 'CS110', name: 'Algorithms', units: 3, grade: 1.75, gradeLetters: 'A-', teacher: 'Prof. James Mitchell', remarks: 'Passed', status: 'published' },
          { id: 'e2', code: 'CS153', name: 'Operating Systems', units: 3, grade: 1.5, gradeLetters: 'A-', teacher: 'Dr. Patricia Lopez', remarks: 'Passed', status: 'published' },
          { id: 'e3', code: 'CS185', name: 'Web Development I', units: 3, grade: 2.0, gradeLetters: 'B+', teacher: 'Mr. Ronald Rodan', remarks: 'Passed', status: 'published' },
          { id: 'e4', code: 'CS140', name: 'Software Engineering', units: 4, grade: 1.75, gradeLetters: 'A-', teacher: 'Ms. Sarah Chen', remarks: 'Passed', status: 'published' },
          { id: 'e5', code: 'GEC188', name: 'Social Sciences', units: 3, grade: 2.0, gradeLetters: 'B+', teacher: 'Mr. Ferdinand Velez', remarks: 'Passed', status: 'published' },
        ]
      },
      {
        id: '2-2',
        name: '2nd Semester 2024-2025',
        label: '2nd Semester',
        courses: [
          { id: 'f1', code: 'CS104', name: 'Network Fundamentals', units: 3, grade: 1.75, gradeLetters: 'A-', teacher: 'Mr. Fernando Velez', remarks: 'Passed', status: 'published' },
          { id: 'f2', code: 'CS109', name: 'Database Design', units: 3, grade: 1.5, gradeLetters: 'A-', teacher: 'Dr. Patricia Lopez', remarks: 'Passed', status: 'published' },
          { id: 'f3', code: 'CS187', name: 'Mobile App Dev', units: 3, grade: 2.0, gradeLetters: 'B+', teacher: 'Mr. Ronald Rodan', remarks: 'Passed', status: 'published' },
          { id: 'f4', code: 'CS120', name: 'Cybersecurity Basics', units: 3, grade: 1.75, gradeLetters: 'A-', teacher: 'Maj. Carlos Reyes', remarks: 'Passed', status: 'published' },
          { id: 'f5', code: 'GEC200', name: 'Environmental Science', units: 3, grade: 2.0, gradeLetters: 'B+', teacher: 'Dr. Maria Santos', remarks: 'Passed', status: 'published' },
        ]
      }
    ]
  },
  {
    year: 3,
    semesters: [
      {
        id: '3-1',
        name: '1st Semester 2025-2026',
        label: '1st Semester',
        courses: [
          { id: 'g1', code: 'CS132', name: 'AI & Machine Learning', units: 4, grade: 1.5, gradeLetters: 'A-', teacher: 'Prof. James Mitchell', remarks: 'Passed', status: 'published' },
          { id: 'g2', code: 'CS139', name: 'Cloud Computing', units: 3, grade: 1.75, gradeLetters: 'A-', teacher: 'Dr. Patricia Lopez', remarks: 'Passed', status: 'pending' },
          { id: 'g3', code: 'CS135', name: 'Information Security', units: 3, grade: 2.0, gradeLetters: 'B+', teacher: 'Maj. Carlos Reyes', remarks: 'Passed', status: 'pending' },
          { id: 'g4', code: 'CS184', name: 'IT Elective I', units: 3, grade: 1.75, gradeLetters: 'A-', teacher: 'Ms. Sarah Chen', remarks: 'Passed', status: 'pending' },
          { id: 'g5', code: 'GEC300', name: 'Ethics & Values', units: 3, grade: 2.0, gradeLetters: 'B+', teacher: 'Fr. Antonio Cruz', remarks: 'Passed', status: 'pending' },
        ]
      },
      {
        id: '3-2',
        name: '2nd Semester 2025-2026',
        label: '2nd Semester',
        courses: [
          { id: 'h1', code: 'CS134', name: 'Capstone Project I', units: 3, grade: 1.5, gradeLetters: 'A-', teacher: 'Prof. James Mitchell', remarks: 'In Progress', status: 'pending' },
          { id: 'h2', code: 'CS179', name: 'Advanced Networks', units: 3, grade: 1.75, gradeLetters: 'A-', teacher: 'Mr. Fernando Velez', remarks: 'In Progress', status: 'pending' },
          { id: 'h3', code: 'CS182', name: 'IT Elective II', units: 3, grade: 2.0, gradeLetters: 'B+', teacher: 'Ms. Sarah Chen', remarks: 'In Progress', status: 'pending' },
          { id: 'h4', code: 'CSE300', name: 'Professional Practice', units: 2, grade: 1.0, gradeLetters: 'A', teacher: 'Dr. Maria Santos', remarks: 'In Progress', status: 'pending' },
        ]
      }
    ]
  }
]

export default function StudentSemestralGradesPage() {
  const allowed = useRequireRole(['student','admin'])

  // hooks must run every render before we decide to exit
  const contentRef = useRef<HTMLDivElement>(null)
  const [expandedYear, setExpandedYear] = useState<number | null>(3)

  // try to restore last expanded year from session storage when the
  // component mounts (supports back/forward and full reloads).
  useEffect(() => {
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

  const calculateSemesterGPA = (courses: Course[]) => {
    const totalPoints = courses.reduce((sum, course) => sum + (course.grade * course.units), 0)
    const totalUnits = courses.reduce((sum, course) => sum + course.units, 0)
    return totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : '0.00'
  }

  const calculateYearGPA = (semesters: Semester[]) => {
    const allCourses = semesters.flatMap(s => s.courses)
    return calculateSemesterGPA(allCourses)
  }

  const getTotalCredits = () => {
    return studentGradesData.reduce((total, year) => {
      return total + year.semesters.reduce((semTotal, sem) => {
        return semTotal + sem.courses.reduce((courseTotal, course) => courseTotal + course.units, 0)
      }, 0)
    }, 0)
  }

  const getTotalPublished = () => {
    return studentGradesData.reduce((total, year) => {
      return total + year.semesters.reduce((semTotal, sem) => {
        return semTotal + sem.courses.filter(c => c.status === 'published').length
      }, 0)
    }, 0)
  }

  const getTotalCourses = () => {
    return studentGradesData.reduce((total, year) => {
      return total + year.semesters.reduce((semTotal, sem) => semTotal + sem.courses.length, 0)
    }, 0)
  }

  const downloadPDF = async () => {
    if (!contentRef.current) return

    try {
      // lazily import the pdf library only when needed.  moving this
      // inside the click handler prevents any errant code from executing
      // during render and also keeps the bundle smaller for users who
      // never download.
      const module = await import('html2pdf.js')
      const html2pdf = module.default

      if (!html2pdf) {
        throw new Error('html2pdf library failed to load')
      }

      const element = contentRef.current
      const filename = `Semestral_Grades_${new Date().toISOString().split('T')[0]}.pdf`

      const opt = {
        margin: 10,
        filename,
        image: { type: 'png' as const, quality: 0.98 },
        html2canvas: { scale: 2, logging: false },
        jsPDF: { orientation: 'landscape' as const, unit: 'mm', format: 'a4' }
      }

      html2pdf().set(opt).from(element).save()
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    }
  }

  const overallGPA = calculateYearGPA(
    studentGradesData.flatMap(y => y.semesters)
  )

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
              disabled={typeof html2pdf === 'undefined'}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2m0 0v-8m0 8H3m12-8V9m0 8h9" />
              </svg>
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <p className="text-blue-600 text-sm font-medium">Overall GPA</p>
            <p className="text-3xl font-bold text-blue-700 mt-2">{overallGPA}</p>
            <p className="text-xs text-gray-500 mt-2">Out of 4.0</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <p className="text-green-600 text-sm font-medium">Total Credits</p>
            <p className="text-3xl font-bold text-green-700 mt-2">{getTotalCredits()}</p>
            <p className="text-xs text-gray-500 mt-2">Units Earned</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <p className="text-purple-600 text-sm font-medium">Grades Posted</p>
            <p className="text-3xl font-bold text-purple-700 mt-2">{getTotalPublished()}/{getTotalCourses()}</p>
            <p className="text-xs text-gray-500 mt-2">Published Grades</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
            <p className="text-orange-600 text-sm font-medium">Status</p>
            <p className="text-3xl font-bold text-orange-700 mt-2">Active</p>
            <p className="text-xs text-gray-500 mt-2">Current Status</p>
          </div>
        </div>

        {/* Grades by Year */}
        <div ref={contentRef} className="space-y-6">
          {studentGradesData.map((yearData) => (
            <div key={yearData.year} className="bg-white rounded-lg shadow overflow-hidden">
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
                    GPA: {calculateYearGPA(yearData.semesters)}
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
                          GPA: {calculateSemesterGPA(semester.courses)}
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
                                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                    course.status === 'published'
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
                          Semester GPA: <span className="font-semibold text-indigo-600">{calculateSemesterGPA(semester.courses)}</span>
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
      </div>
    </div>
  )
}
