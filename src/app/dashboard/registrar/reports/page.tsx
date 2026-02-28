'use client'

import { useState } from 'react'
import { useRequireRole } from '@/hooks/useRequireRole'

interface ReportType {
  id: string
  name: string
  description: string
  courses: string[]
  generatedDate?: string
  status: 'available' | 'processing'
}

interface CourseReport {
  courseCode: string
  courseName: string
  instructor: string
  totalStudents: number
  avgScore: number
  highestScore: number
  lowestScore: number
  gradeDistribution: {
    A: number
    B: number
    C: number
    D: number
    F: number
  }
  passRate: number
}

export default function ReportsPage() {
  const allowed = useRequireRole(['registrar','admin'])
  if (!allowed) return <div>Checking permissions…</div>
  const [reportType, setReportType] = useState<'class' | 'summary' | 'analytics'>('class')
  const [selectedCourse, setSelectedCourse] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [generatedReports, setGeneratedReports] = useState<ReportType[]>([
    {
      id: 'RPT001',
      name: 'COMP101 - Fall 2025 Grade Report',
      description: 'Class grade sheet for Introduction to Programming',
      courses: ['COMP101'],
      generatedDate: '2025-12-15',
      status: 'available'
    },
    {
      id: 'RPT002',
      name: 'Fall 2025 Summary Report',
      description: 'Overall grade summary for all courses',
      courses: ['COMP101', 'MATH201', 'ENG102'],
      generatedDate: '2025-12-14',
      status: 'available'
    }
  ])

  const courseReports: { [key: string]: CourseReport } = {
    'COMP101': {
      courseCode: 'COMP101',
      courseName: 'Introduction to Programming',
      instructor: 'Dr. Smith',
      totalStudents: 45,
      avgScore: 82.5,
      highestScore: 98,
      lowestScore: 62,
      gradeDistribution: { A: 18, B: 15, C: 8, D: 3, F: 1 },
      passRate: 97.8
    },
    'MATH201': {
      courseCode: 'MATH201',
      courseName: 'Calculus II',
      instructor: 'Prof. Johnson',
      totalStudents: 38,
      avgScore: 78.3,
      highestScore: 95,
      lowestScore: 55,
      gradeDistribution: { A: 12, B: 14, C: 8, D: 3, F: 1 },
      passRate: 94.7
    }
  }

  const handleGenerateReport = () => {
    if (selectedCourse) {
      const newReport: ReportType = {
        id: `RPT${generatedReports.length + 1}`,
        name: `${selectedCourse} - Report`,
        description: `Grade report for ${selectedCourse}`,
        courses: [selectedCourse],
        generatedDate: new Date().toISOString().split('T')[0],
        status: 'available'
      }
      setGeneratedReports([...generatedReports, newReport])
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Grade Reports & Analytics</h1>
        <p className="text-gray-600">Generate and view comprehensive grade reports</p>
      </div>

      {/* Report Generation Options */}
      <div className="card mb-8">
        <h2 className="text-xl font-bold mb-6">Generate New Report</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Report Type</label>
            <div className="space-y-2">
              {[
                { value: 'class', label: 'Class Grade Sheet' },
                { value: 'summary', label: 'Summary Report' },
                { value: 'analytics', label: 'Analytics Dashboard' }
              ].map(option => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="reportType"
                    value={option.value}
                    checked={reportType === option.value}
                    onChange={(e) => setReportType(e.target.value as any)}
                    className="w-4 h-4"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Select Course</label>
            <select 
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="input-field"
            >
              <option value="">Choose a course...</option>
              <option value="COMP101">COMP 101 - Introduction to Programming</option>
              <option value="MATH201">MATH 201 - Calculus II</option>
              <option value="ENG102">ENG 102 - English Composition</option>
              <option value="PHYS150">PHYS 150 - Physics I</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={handleGenerateReport}
            className="button-primary"
          >
            Generate Report
          </button>
          <button className="button-secondary">
            Preview
          </button>
          <button className="button-secondary">
            📥 Download Template
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Available Reports</h2>
        <div className="space-y-3">
          {generatedReports.map(report => (
            <div key={report.id} className="card flex justify-between items-start">
              <div>
                <p className="font-semibold text-lg">{report.name}</p>
                <p className="text-sm text-gray-600">{report.description}</p>
                <p className="text-xs text-gray-500 mt-2">Generated: {report.generatedDate}</p>
              </div>
              <div className="flex gap-2">
                {report.status === 'available' && (
                  <>
                    <button className="button-secondary text-sm">
                      👁️ View
                    </button>
                    <button className="button-secondary text-sm">
                      📥 Download
                    </button>
                    <button className="button-secondary text-sm">
                      📧 Email
                    </button>
                  </>
                )}
                {report.status === 'processing' && (
                  <span className="badge badge-warning">Processing...</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sample Course Analytics */}
      {selectedCourse && courseReports[selectedCourse] && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Course Analytics - {selectedCourse}</h2>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card bg-blue-50">
              <p className="text-blue-600 text-sm">Total Students</p>
              <p className="text-3xl font-bold text-blue-700">{courseReports[selectedCourse].totalStudents}</p>
            </div>
            <div className="card bg-green-50">
              <p className="text-green-600 text-sm">Average Score</p>
              <p className="text-3xl font-bold text-green-700">{courseReports[selectedCourse].avgScore}</p>
            </div>
            <div className="card bg-purple-50">
              <p className="text-purple-600 text-sm">Pass Rate</p>
              <p className="text-3xl font-bold text-purple-700">{courseReports[selectedCourse].passRate}%</p>
            </div>
          </div>

          {/* Grade Distribution */}
          <div className="card">
            <h3 className="font-bold mb-4">Grade Distribution</h3>
            <div className="space-y-4">
              {Object.entries(courseReports[selectedCourse].gradeDistribution).map(([grade, count]) => (
                <div key={grade}>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">Grade {grade}</span>
                    <span className="text-sm text-gray-600">{count} students</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                      style={{ width: `${(count / courseReports[selectedCourse].totalStudents) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Score Range */}
          <div className="card">
            <h3 className="font-bold mb-4">Score Range</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded">
                <p className="text-green-600 text-sm">Highest Score</p>
                <p className="text-3xl font-bold text-green-700">{courseReports[selectedCourse].highestScore}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded">
                <p className="text-orange-600 text-sm">Lowest Score</p>
                <p className="text-3xl font-bold text-orange-700">{courseReports[selectedCourse].lowestScore}</p>
              </div>
            </div>
          </div>

          {/* Course Info */}
          <div className="card">
            <h3 className="font-bold mb-4">Course Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Course Code</p>
                <p className="font-semibold">{courseReports[selectedCourse].courseCode}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Course Name</p>
                <p className="font-semibold">{courseReports[selectedCourse].courseName}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Instructor</p>
                <p className="font-semibold">{courseReports[selectedCourse].instructor}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Semester</p>
                <p className="font-semibold">Fall 2025</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Buttons */}
      <div className="mt-8 flex gap-2 flex-wrap">
        <button className="button-primary">
          📊 Export as PDF
        </button>
        <button className="button-secondary">
          📊 Export as Excel
        </button>
        <button className="button-secondary">
          🔄 Refresh Data
        </button>
        <button className="button-secondary">
          📧 Email Report
        </button>
      </div>
    </div>
  )
}
