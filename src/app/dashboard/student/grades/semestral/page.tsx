'use client'

import { useState, useMemo, useEffect } from 'react'
import { convertPhilippineGPAToGrade, calculateGradeStatistics } from '@/lib/gradeConversion'
import { useRequireRole } from '@/hooks/useRequireRole'
import { authService } from '@/services/authService'
import { User } from '@/types'
import { useRef } from 'react'

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
  const allowed = useRequireRole(['student', 'admin'])
  const [academicYear, setAcademicYear] = useState('2nd Semester 2023-2024 - College (past)')
  const [gradesData, setGradesData] = useState<SemestralGrade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  const availableSemesters = [
    '1st Semester 2025-2026 - College (past)',
    '2nd Semester 2025-2026 - College (active)',
    '1st Semester 2023-2024 - College (past)',
    '2nd Semester 2023-2024 - College (past)',
    '1st Semester 2022-2023 - College (past)',
    '2nd Semester 2022-2023 - College (past)',
  ]

  // Fetch grades once auth and role checks have passed.
  useEffect(() => {
    if (allowed !== true) {
      return
    }

    let active = true

    const loadGrades = async () => {
      try {
        if (!active) return
        setLoading(true)
        setError(null)

        const authUser = await authService.waitForAuthState()
        if (!authUser) {
          throw new Error('Not authenticated')
        }
        const idToken = await authUser.getIdToken()

        // Fetch user profile for the report details
        const userProfile = await authService.getUserData(authUser.uid)
        if (!active) return
        if (userProfile) {
          setProfile(userProfile)
        } else {
          // Fallback to Mark Christian Advincula Beltran if no profile data
          setProfile({
            id: authUser.uid,
            email: authUser.email || '',
            firstName: 'Mark Christian Advincula',
            lastName: 'BELTRAN',
            role: 'student',
            studentId: '22016527',
            gender: 'Male',
            college: 'College Computer Studies',
            program: 'Bachelor of Science in Information Technology',
            yearLevel: '2nd Year',
            createdAt: new Date(),
            updatedAt: new Date(),
            department: 'CCS'
          } as User)
        }

        const response = await fetch('/api/grades/verification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
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

        if (result.data?.getAuthStudentClasses?.items && Array.isArray(result.data.getAuthStudentClasses.items) && result.data.getAuthStudentClasses.items.length > 0) {
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
          if (!active) return
          setGradesData(converted)
        } else {
          // Fallback to Mark Christian Beltran's data for demo purposes if API is empty
          const fallbackData: SemestralGrade[] = [
            { id: 'b1', subjectCode: 'GE9', subject: 'The Life and Works of Jose Rizal', subjectTeacher: 'Fernando Velez', units: 3.0, numericGrade: 2.50, status: 'published' },
            { id: 'b2', subjectCode: 'DM102', subject: 'Financial Management', subjectTeacher: 'Elzeo Rebollido', units: 3.0, numericGrade: 5.00, status: 'published' },
            { id: 'b3', subjectCode: 'SIA101', subject: 'System Integration and Architecture 1', subjectTeacher: 'Kimberly Joy Español', units: 3.0, numericGrade: 3.00, status: 'published' },
            { id: 'b4', subjectCode: 'CC105', subject: 'Information Management', subjectTeacher: 'Jorge Lucero', units: 3.0, numericGrade: 3.00, status: 'published' },
            { id: 'b5', subjectCode: 'NET102', subject: 'Networking 2', subjectTeacher: 'Enrico Pineda', units: 3.0, numericGrade: 2.75, status: 'published' },
            { id: 'b6', subjectCode: 'WEB101', subject: 'Web Development (Advance Web / Platform)', subjectTeacher: 'Ronald Jr Roldan', units: 3.0, numericGrade: 2.50, status: 'published' },
            { id: 'b7', subjectCode: 'ITE2', subject: 'IT ELECTIVE 2 (Advance Jvaoor OOP)', subjectTeacher: 'Alejandro Adovas', units: 3.0, numericGrade: 1.75, status: 'published' },
            { id: 'b8', subjectCode: 'PE4', subject: 'Team Sports', subjectTeacher: 'Adrian Joseph Trapal', units: 2.0, numericGrade: 2.25, status: 'published' },
          ]
          if (!active) return
          if (academicYear.includes('2nd Semester 2023-2024')) {
            setGradesData(fallbackData)
          } else {
            setGradesData([])
          }
        }
      } catch (err) {
        console.error('Error loading grades:', err)
        if (!active) return
        setError(err instanceof Error ? err.message : 'Failed to load grades from server')
        setGradesData([])
      } finally {
        if (!active) return
        setLoading(false)
      }
    }

    loadGrades()

    return () => {
      active = false
    }
  }, [allowed])

  // Convert all grades and calculate statistics
  const grades = useMemo(() => {
    return gradesData.map((grade) => {
      const conversion = convertPhilippineGPAToGrade(grade.numericGrade)
      const { status: _, ...conversionWithoutStatus } = conversion
      return {
        ...grade,
        ...conversionWithoutStatus,
        remarks: grade.numericGrade > 3.0 ? 'Failed' : 'Passed',
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

  const handleDownload = async () => {
    if (!printRef.current) return

    try {
      const module = await import('html2pdf.js')
      const html2pdf = module.default

      if (!html2pdf) {
        throw new Error('html2pdf library failed to load')
      }

      const element = printRef.current
      // Temporarily unhide for printing
      element.style.display = 'block'

      const filename = `UNOFFICIAL_FINAL_REPORT_OF_GRADES_${academicYear.replace(/\s+/g, '_')}.pdf`

      const opt = {
        margin: 10,
        filename,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, logging: false },
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

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {allowed === null && (
          <div className="text-center py-12">
            <p className="text-gray-600">Checking permissions...</p>
          </div>
        )}

        {/* Loading State */}
        {allowed === true && loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading your grades...</p>
          </div>
        )}

        {/* Content */}
        {allowed === true && !loading && (
          <>
            {/* Error State */}
            {error && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-700 text-sm">{error}</p>
              </div>
            )}

            {/* Breadcrumb */}
            <div className="mb-6 text-sm flex items-center">
              <span className="text-[#5e51e1] cursor-pointer hover:underline font-medium">Grades</span>
              <span className="text-gray-400 mx-2 text-[10px]">&gt;</span>
              <span className="text-gray-500">Semestral Grade</span>
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-6 py-4 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Subject Code</th>
                      <th className="px-6 py-4 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Subject</th>
                      <th className="px-6 py-4 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Subject Teacher</th>
                      <th className="px-6 py-4 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Units</th>
                      <th className="px-6 py-4 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Grade</th>
                      <th className="px-6 py-4 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Remarks</th>
                      <th className="px-6 py-4 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {grades.map((grade) => (
                      <tr key={grade.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">{grade.subjectCode}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{grade.subject}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{grade.subjectTeacher}</td>
                        <td className="px-6 py-4 text-sm text-center text-gray-600">{grade.units}</td>
                        <td className="px-6 py-4 text-sm text-center text-gray-600 font-medium">{grade.numericGrade.toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{grade.remarks}</td>
                        <td className="px-6 py-4 text-left text-sm text-gray-600">{grade.status.charAt(0).toUpperCase() + grade.status.slice(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>



            {/* Download Button */}
            <div className="flex justify-end">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#5e51e1] hover:bg-[#4e42d1] text-white font-semibold rounded-[10px] transition-all shadow-sm"
              >
                <div className="grid grid-cols-2 gap-0.5">
                  <div className="w-2 h-2 border border-white rounded-[1px]"></div>
                  <div className="w-2 h-2 border border-white rounded-[1px]"></div>
                  <div className="w-2 h-2 border border-white rounded-[1px]"></div>
                  <div className="w-2 h-2 border border-white rounded-[1px]"></div>
                </div>
                Download Semestral
              </button>
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
                    <span className="w-24">Fullname</span>
                    <span className="flex-1">: {(profile?.lastName ? `${profile.lastName}, ` : '') + (profile?.firstName || 'Unknown')}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32">Student No</span>
                    <span className="flex-1">: {profile?.studentId || 'N/A'}</span>
                  </div>

                  <div className="flex">
                    <span className="w-24">Gender</span>
                    <span className="flex-1">: {profile?.gender || 'N/A'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32">Academic Year</span>
                    <span className="flex-1">: {academicYear}</span>
                  </div>

                  <div className="flex">
                    <span className="w-24">College</span>
                    <span className="flex-1">: {profile?.college || 'N/A'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32">Year Level</span>
                    <span className="flex-1">: {profile?.yearLevel || 'N/A'}</span>
                  </div>

                  <div className="flex">
                    <span className="w-24">Program</span>
                    <span className="flex-1">: {profile?.program || 'N/A'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32">Academic Status</span>
                    <span className="flex-1">: Regular</span>
                  </div>
                </div>

                {/* Grades Table */}
                <table className="w-full text-sm mb-6 border-b-2 border-dashed border-gray-400">
                  <thead>
                    <tr className="border-t-2 border-b-2 border-dashed border-gray-400">
                      <th className="py-2 text-left font-semibold">CODE</th>
                      <th className="py-2 text-left font-semibold w-1/2">SUBJECT TITLE</th>
                      <th className="py-2 text-center font-semibold">Grade</th>
                      <th className="py-2 text-center font-semibold">Credited<br />Units</th>
                      <th className="py-2 text-left font-semibold">REMARKS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grades.map((grade) => (
                      <tr key={grade.id}>
                        <td className="py-1">{grade.subjectCode}</td>
                        <td className="py-1">{grade.subject}</td>
                        <td className="py-1 text-center font-semibold">{grade.numericGrade.toFixed(2)}</td>
                        <td className="py-1 text-center">{grade.units.toFixed(1)}</td>
                        <td className="py-1">{grade.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Footer Info */}
                <div className="text-sm">
                  <div className="text-center mb-6">*** Nothing Follows ***</div>

                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <table className="w-full mb-4">
                        <tbody>
                          <tr>
                            <td className="py-1">Total Subjects Enrolled</td>
                            <td>: {statistics.totalCourses.toFixed(1)}</td>
                          </tr>
                          <tr>
                            <td className="py-1">Total Credits Enrolled</td>
                            <td>: {statistics.totalUnits.toFixed(1)}</td>
                          </tr>
                          <tr>
                            <td className="py-1">Total Credits Earned</td>
                            <td>: {statistics.earnedUnits.toFixed(1)}</td>
                          </tr>
                          <tr>
                            <td className="py-1 font-semibold">Grade Point Average</td>
                            <td className="font-semibold">: {statistics.gpa.toFixed(3)}</td>
                          </tr>
                        </tbody>
                      </table>
                      <div className="mt-8 text-center border-t border-black w-48 inline-block">
                        <p className="mt-1">Registrar</p>
                      </div>
                    </div>

                    <div className="text-xs">
                      <p className="font-semibold mb-1">GRADING SYSTEM:</p>
                      <div className="grid grid-cols-2 gap-x-4">
                        <div>
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
                        <div>
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

                <div className="mt-8 text-xs text-gray-500" suppressHydrationWarning>
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
