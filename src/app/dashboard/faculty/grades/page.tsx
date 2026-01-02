'use client'

import { useState } from 'react'

interface Grade {
  id: string
  studentId: string
  studentName: string
  score: number
  status: 'draft' | 'submitted' | 'approved'
  remarks?: string
}

export default function GradesPage() {
  const [grades, setGrades] = useState<Grade[]>([
    {
      id: '1',
      studentId: 'S001',
      studentName: 'John Doe',
      score: 85,
      status: 'draft',
    },
    {
      id: '2',
      studentId: 'S002',
      studentName: 'Jane Smith',
      score: 92,
      status: 'submitted',
    },
    {
      id: '3',
      studentId: 'S003',
      studentName: 'Bob Johnson',
      score: 78,
      status: 'approved',
    },
  ])

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editScore, setEditScore] = useState('')

  const handleEdit = (id: string, currentScore: number) => {
    setEditingId(id)
    setEditScore(currentScore.toString())
  }

  const handleSave = (id: string) => {
    setGrades((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, score: parseFloat(editScore) } : g
      )
    )
    setEditingId(null)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Grade Entry</h1>
        <div className="space-x-2">
          <button className="button-primary">
            + New Grade
          </button>
          <button className="button-secondary">
            Bulk Upload
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Course</label>
            <select className="input-field">
              <option>Select Course</option>
              <option>COMP 101</option>
              <option>COMP 201</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select className="input-field">
              <option>All</option>
              <option>Draft</option>
              <option>Submitted</option>
              <option>Approved</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <input
              type="text"
              placeholder="Student name or ID"
              className="input-field"
            />
          </div>
          <div className="flex items-end">
            <button className="button-secondary w-full">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Grades Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="table-header">
              <th className="table-cell">Student ID</th>
              <th className="table-cell">Name</th>
              <th className="table-cell">Score</th>
              <th className="table-cell">Grade</th>
              <th className="table-cell">Status</th>
              <th className="table-cell">Actions</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((grade) => (
              <tr key={grade.id} className="table-row">
                <td className="table-cell">{grade.studentId}</td>
                <td className="table-cell">{grade.studentName}</td>
                <td className="table-cell">
                  {editingId === grade.id ? (
                    <input
                      type="number"
                      value={editScore}
                      onChange={(e) => setEditScore(e.target.value)}
                      className="input-field w-20"
                      min="0"
                      max="100"
                    />
                  ) : (
                    grade.score
                  )}
                </td>
                <td className="table-cell">
                  {grade.score >= 90 ? 'A' : grade.score >= 80 ? 'B' : 'C'}
                </td>
                <td className="table-cell">
                  <span className={`badge ${
                    grade.status === 'approved'
                      ? 'badge-success'
                      : grade.status === 'submitted'
                      ? 'badge-info'
                      : 'badge-warning'
                  } text-xs`}>
                    {grade.status}
                  </span>
                </td>
                <td className="table-cell">
                  {editingId === grade.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave(grade.id)}
                        className="text-sm text-green-600 hover:text-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-sm text-gray-600 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(grade.id, grade.score)}
                        className="text-sm text-primary hover:text-blue-700"
                      >
                        Edit
                      </button>
                      <button className="text-sm text-gray-600 hover:text-gray-700">
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Showing 1 to {grades.length} of {grades.length} results
        </p>
        <div className="space-x-2">
          <button className="button-secondary">Previous</button>
          <button className="button-secondary">Next</button>
        </div>
      </div>
    </div>
  )
}
