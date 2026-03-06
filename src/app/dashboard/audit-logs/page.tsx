'use client'

import React from 'react'

type AuditEntry = {
  id: string
  user: string
  role: string
  action: 'LOGIN' | 'LOGOUT' | 'PUBLISH' | 'UPDATE' | 'CREATE' | 'DELETE'
  entity: string
  context: string
  ts: string
}

const sampleLogs: AuditEntry[] = [
  { id: '1', user: 'Professor Smith', role: 'faculty', action: 'PUBLISH', entity: 'Grades', context: 'Term 1 2024', ts: '2026-03-07 10:32' },
  { id: '2', user: 'Registrar Jane', role: 'registrar', action: 'UPDATE', entity: 'Student Profile', context: 'ID 10234', ts: '2026-03-07 09:18' },
  { id: '3', user: 'Admin Mia', role: 'admin', action: 'LOGIN', entity: 'Dashboard', context: '2FA success', ts: '2026-03-07 08:55' },
  { id: '4', user: 'Professor Lee', role: 'faculty', action: 'LOGIN', entity: 'Dashboard', context: 'Grade entry', ts: '2026-03-07 08:10' },
  { id: '5', user: 'Student User', role: 'student', action: 'LOGIN', entity: 'Student Portal', context: 'Viewed grades', ts: '2026-03-06 20:14' },
]

export default function AuditLogsPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Activity & Audit Trail</h1>
        <p className="text-gray-600 mt-1">Monitor logins and grade-related actions across users.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-700">Recent Activity</div>
          <div className="text-xs text-gray-500">Showing latest {sampleLogs.length} events</div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Entity</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Context</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sampleLogs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800">{log.user}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{log.role}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-[#1E3A5F]">{log.action}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{log.entity}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{log.context}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{log.ts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
