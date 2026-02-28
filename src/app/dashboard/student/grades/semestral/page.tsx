'use client'

import { useState, useMemo, useEffect } from 'react'
import { convertPhilippineGPAToGrade, calculateGradeStatistics } from '@/lib/gradeConversion'

interface StudentClass {
  id: string
  grade: string
  subject_class: {
    curriculum_subject: {
      curriculum_subject_code: string
      units: number
      subject: {
        subject_title: string
      }
    }
    subject_teacher: {
      fname: string
      mname: string
      lname: string
    }
  }
}

interface SemestralGrade {
  id: string
  subjectCode: string
  subject: string
  subjectTeacher: string
  units: number
  numericGrade: number
  status: 'published'
}

export default function SemestralGradePage() {
  const [academicYear, setAcademicYear] = useState('1st Semester 2022-2023')
  const [gradesData, setGradesData] = useState<SemestralGrade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const availableSemesters = [
    '1st Semester 2025-2026',
    '2nd Semester 2025-2026',
    '1st Semester 2023-2024',
    '2nd Semester 2023-2024',
    '1st Semester 2022-2023',
    '2nd Semester 2022-2023',
  ]

  // Fetch grades from API on component mount
  useEffect(() => {
    const loadGrades = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch from your GraphQL endpoint
        const response = await fetch('/api/grades/verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `query GetAuthStudentClasses {
              getAuthStudentClasses {
                items {
                  id
                  grade
                  subject_class {
                    curriculum_subject {
                      curriculum_subject_code
                      units
                      subject {
                        subject_title
                      }
                    }
                    subject_teacher {
                      fname
                      mname
                      lname
                    }
                  }
                }
              }
            }`
          })
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`)
        }

        const result = await response.json()
        
        // Check for GraphQL errors
        if (result.errors && result.errors.length > 0) {
          throw new Error(`GraphQL error: ${result.errors[0].message}`)
        }

        // Check for data existence
        if (!result || typeof result !== 'object') {
          throw new Error('Invalid API response format')
        }

        if (result.data?.getAuthStudentClasses?.items && Array.isArray(result.data.getAuthStudentClasses.items)) {
          const items = result.data.getAuthStudentClasses.items as StudentClass[]
          const converted = items.map((item) => ({
            id: item.id,
            subjectCode: item.subject_class?.curriculum_subject?.curriculum_subject_code || 'N/A',
            subject: item.subject_class?.curriculum_subject?.subject?.subject_title || 'N/A',
            subjectTeacher: `${item.subject_class?.subject_teacher?.fname || ''} ${item.subject_class?.subject_teacher?.lname || ''}`.trim(),
            units: item.subject_class?.curriculum_subject?.units || 0,
            numericGrade: !isNaN(parseFloat(item.grade)) ? parseFloat(item.grade) : 0,
            status: 'published' as const,
          }))
          setGradesData(converted)
        } else {
          // No grades found - this is OK, just show empty
          setGradesData([])
        }
      } catch (err) {
        console.error('Error loading grades:', err)
        setError(err instanceof Error ? err.message : 'Failed to load grades from server')
        setGradesData([])
      } finally {
        setLoading(false)
      }
    }

    loadGrades()
  }, [])

  // Convert all grades and calculate statistics
  const grades = useMemo(() => {
    return gradesData.map((grade) => {
      const conversion = convertPhilippineGPAToGrade(grade.numericGrade)
      const { status: _, ...conversionWithoutStatus } = conversion
      return {
        ...grade,
        ...conversionWithoutStatus,
        remarks: 'Passed',
      }
    })
  }, [gradesData])

  const statistics = useMemo(() => {
    return calculateGradeStatistics(grades.map((g) => ({ gpa: g.gpa, units: g.units })))
  }, [grades])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'text-green-600'
      case 'submitted':
        return 'text-blue-600'
      case 'draft':
        return 'text-yellow-600'
      case 'approved':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  const getGradeColor = (letterGrade: string) => {
    if (letterGrade === 'F') return 'bg-red-100 text-red-700'
    if (letterGrade.includes('A')) return 'bg-green-100 text-green-700'
    if (letterGrade.includes('B')) return 'bg-blue-100 text-blue-700'
    if (letterGrade.includes('C')) return 'bg-yellow-100 text-yellow-700'
    if (letterGrade === 'D') return 'bg-orange-100 text-orange-700'
    return 'bg-gray-100 text-gray-700'
  }

  const handleDownload = () => {
    const headers = [
      'Subject Code',
      'Subject',
      'Subject Teacher',
      'Units',
      'Score',
      'Letter Grade',
      'GPA',
      'Remarks',
      'Status',
    ]
    const rows = grades.map((grade) => [
      grade.subjectCode,
      grade.subject,
      grade.subjectTeacher,
      grade.units,
      grade.numericGrade,
      grade.letterGrade,
      grade.gpa,
      grade.remarks,
      grade.status,
    ])

    let csv = headers.join(',') + '\n'
    rows.forEach((row) => {
      csv += row.map((cell) => `"${cell}"`).join(',') + '\n'
    })

    // Add summary
    csv += '\n\nGrade Summary\n'
    csv += `Total Courses,${statistics.totalCourses}\n`
    csv += `Passed Courses,${statistics.passedCourses}\n`
    csv += `Failed Courses,${statistics.failedCourses}\n`
    csv += `Total Units,${statistics.totalUnits}\n`
    csv += `Earned Units,${statistics.earnedUnits}\n`
    csv += `Weighted GPA (3.0 Scale),${statistics.gpa}\n`
    csv += `Pass Percentage,${statistics.passPercentage.toFixed(1)}%\n`

    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv))
    element.setAttribute('download', `semestral-grade-${academicYear.replace(/\s+/g, '-')}.csv`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="min-h-screen bg-white p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading your grades...</p>
          </div>
        )}

        {/* Content */}
        {!loading && (
          <>
            {/* Error State */}
            {error && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-700 text-sm">{error}</p>
              </div>
            )}

            {/* Breadcrumb */}
            <div className="mb-6 text-sm">
              <span className="text-blue-600 cursor-pointer hover:underline">Grades</span>
              <span className="text-gray-400 mx-2">&gt;</span>
              <span className="text-gray-700 font-medium">Semestral Grade</span>
            </div>

            {/* Header */}
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Semestral Grade</h1>

            {/* Academic Year Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full md:w-96 px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {availableSemesters.map((semester) => (
                  <option key={semester} value={semester}>
                    {semester}
                  </option>
                ))}
              </select>
            </div>

            {/* Grades Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Subject Code</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Subject</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Subject Teacher</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Units</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Grade</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Remarks</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grades.map((grade, idx) => (
                      <tr key={grade.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{grade.subjectCode}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{grade.subject}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{grade.subjectTeacher}</td>
                        <td className="px-6 py-4 text-sm text-center text-gray-900">{grade.units}</td>
                        <td className="px-6 py-4 text-sm text-center font-bold text-gray-900">{grade.numericGrade}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{grade.remarks}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${
                            grade.status === 'published' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {grade.status === 'published' ? 'Published' : grade.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                <p className="text-blue-600 text-sm font-medium">GPA (3.0 Scale)</p>
                <p className="text-2xl font-bold text-blue-700">{statistics.gpa.toFixed(2)}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                <p className="text-green-600 text-sm font-medium">Total Units</p>
                <p className="text-2xl font-bold text-green-700">{statistics.totalUnits}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                <p className="text-purple-600 text-sm font-medium">Passed</p>
                <p className="text-2xl font-bold text-purple-700">{statistics.passedCourses}/{statistics.totalCourses}</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
                <p className="text-orange-600 text-sm font-medium">Pass Rate</p>
                <p className="text-2xl font-bold text-orange-700">{statistics.passPercentage.toFixed(0)}%</p>
              </div>
            </div>

            {/* Download Button */}
            <div className="flex justify-end">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download Semestral
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
