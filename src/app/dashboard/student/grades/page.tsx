'use client'

import React, { useRef, useEffect, useState } from 'react'
import { useRequireRole } from '@/hooks/useRequireRole'
import { calculateGPA } from '@/lib/gradeConversion'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

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
  const allowed = useRequireRole(['student', 'admin'])

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

  // Uses robust calculation handling 4.0 or 1.0 logic directly imported
  const calculateSemesterGPAStr = (courses: Course[]) => calculateGPA(courses, '1.0').toFixed(2)
  const calculateYearGPAStr = (semesters: Semester[]) => {
    const allCourses = semesters.flatMap(s => s.courses)
    return calculateGPA(allCourses, '1.0').toFixed(2)
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

  // --- Chart.js Data Logic ---
  const extractChartData = () => {
    // Array of string labels e.g. "Y1", "Y2"
    const labels = studentGradesData.map(y => `Year ${y.year}`)
    // Calculates total GPA accurately using our internal function mappings
    const numericGPAs = studentGradesData.map(y => calculateGPA(y.semesters.flatMap(s => s.courses), '1.0'))

    return {
      labels,
      datasets: [
        {
          label: 'Overall Yearly GPA Trend (Ph 1.0 Scale)',
          data: numericGPAs,
          borderColor: 'rgb(79, 70, 229)', // indigo-600
          backgroundColor: 'rgba(79, 70, 229, 0.15)',
          tension: 0.3,
          pointBackgroundColor: 'rgb(59, 130, 246)', // blue-500
          pointHoverRadius: 7,
          pointRadius: 5,
          fill: true
        }
      ]
    }
  }

  const downloadPDF = async () => {
    if (!contentRef.current) return

    try {
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

  const overallGPA = calculateGPA(
    studentGradesData.flatMap(y => y.semesters).flatMap(s => s.courses),
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
              disabled={typeof window !== 'undefined' && typeof window.html2pdf === 'undefined'}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Overall GPA Card */}
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 p-6 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 rounded-l-2xl"></div>
            <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Overall GPA</p>
            <p className="text-4xl font-extrabold text-blue-700 tracking-tight mt-1">{overallGPA}</p>
            <p className="text-xs text-gray-500 mt-2 font-medium">Out of 4.0 Scale</p>
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
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 p-6 transition-all duration-300 relative overflow-hidden group flex flex-col justify-center items-start">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500 rounded-l-2xl"></div>
            <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Academic Status</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse"></div>
              <p className="text-2xl font-bold text-orange-700">Active</p>
            </div>
            <p className="text-xs text-gray-500 mt-3 font-medium">Currently Enrolled</p>
          </div>
        </div>

        {/* GPA Trend Chart */}
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 p-6 mb-8 transition-all duration-300">
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Academic Progression</h2>
              <p className="text-sm text-gray-500">GPA Trend Across College Career (1.0 - Highest)</p>
            </div>
          </div>
          <div className="w-full h-80 relative">
            {typeof window !== 'undefined' ? (
              <Line
                data={extractChartData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      reverse: true, // 1.0 is better than 4.0 in Philippines
                      min: 1.0,
                      max: 4.0,
                      ticks: {
                        stepSize: 0.5
                      },
                      title: {
                        display: true,
                        text: 'Weighted GPA'
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        font: {
                          family: "'Inter', sans-serif",
                          size: 13
                        }
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(17, 24, 39, 0.9)',
                      padding: 12,
                      titleFont: { size: 14, family: "'Inter', sans-serif" },
                      bodyFont: { size: 13, family: "'Inter', sans-serif" },
                      cornerRadius: 8
                    }
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-xl">
                <p className="text-gray-400">Loading chart...</p>
              </div>
            )}
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
                    GPA: {calculateYearGPAStr(yearData.semesters)}
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
                          GPA: {calculateSemesterGPAStr(semester.courses)}
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
                          Semester GPA: <span className="font-semibold text-indigo-600">{calculateSemesterGPAStr(semester.courses)}</span>
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
