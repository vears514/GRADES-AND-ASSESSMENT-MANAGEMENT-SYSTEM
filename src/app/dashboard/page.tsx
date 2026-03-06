'use client'

import { useRequireRole } from '@/hooks/useRequireRole'

const recentActivities = [
  { title: 'Grade Submitted', description: 'COMP 101 - 45 grades submitted for verification', time: '2 hours ago', status: 'pending' },
  { title: 'Grades Verified', description: 'MATH 201 - All grades approved and posted', time: '5 hours ago', status: 'approved' },
  { title: 'Correction Request', description: 'ENG 102 - Student requested grade appeal', time: '1 day ago', status: 'info' },
  { title: 'Report Generated', description: 'Fall 2025 Summary - Class averages and distribution', time: '2 days ago', status: 'approved' },
]

const auditLogs = [
  { user: 'Professor Smith', action: 'PUBLISH', entity: 'Grades', context: 'Term 1 2024', time: '10:32' },
  { user: 'Registrar Jane', action: 'UPDATE', entity: 'Student Profile', context: 'ID 10234', time: '09:18' },
  { user: 'Admin Mia', action: 'LOGIN', entity: 'Dashboard', context: '2FA success', time: '08:55' },
  { user: 'Professor Lee', action: 'LOGIN', entity: 'Dashboard', context: 'Grade entry', time: '08:10' },
  { user: 'Student User', action: 'LOGIN', entity: 'Student Portal', context: 'Viewed grades', time: 'Yesterday' },
]

export default function DashboardPage() {
  const allowed = useRequireRole(['student', 'faculty', 'registrar', 'admin'])
  if (allowed === null) {
    return <div>Checking permissions…</div>
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Grades" value="156" change="+12 this month" />
        <StatCard title="Pending Review" value="23" change="3 urgent" />
        <StatCard title="Approved" value="133" change="100%" />
        <StatCard title="Average Score" value="82.5" change="Up 2.3 points" />
      </div>

      {/* Grade Management Modules */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Grade Management Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ModuleCard
            title="Grade Encoding"
            subtitle="Faculty Module"
            borderColor="border-blue-200"
            titleColor="text-blue-700"
            points={[
              'Single & bulk grade entry',
              'Score validation',
              'Auto grade calculation',
              'Draft & submit workflow',
            ]}
            ctaHref="/dashboard/faculty/grades"
            ctaLabel="Go to Grade Entry →"
          />
          <ModuleCard
            title="Grade Verification"
            subtitle="Registrar Module"
            borderColor="border-green-200"
            titleColor="text-green-700"
            points={[
              'Grade review workflow',
              'Batch approval',
              'Quality checks',
              'Approval tracking',
            ]}
            ctaHref="/dashboard/registrar/verification"
            ctaLabel="Go to Verification →"
          />
          <ModuleCard
            title="My Grades"
            subtitle="Student Module"
            borderColor="border-purple-200"
            titleColor="text-purple-700"
            points={[
              'Grade transcript',
              'GPA calculation',
              'Performance tracking',
              'Degree progress',
            ]}
            ctaHref="/dashboard/student/grades"
            ctaLabel="Go to My Grades →"
          />
          <ModuleCard
            title="Grade Corrections"
            subtitle="Faculty Module"
            borderColor="border-orange-200"
            titleColor="text-orange-700"
            points={[
              'Correction requests',
              'Multi-level approval',
              'Documentation upload',
              'Change history',
            ]}
            ctaHref="/dashboard/faculty/corrections"
            ctaLabel="Go to Corrections →"
          />
          <ModuleCard
            title="Reports & Analytics"
            subtitle="Registrar Module"
            borderColor="border-red-200"
            titleColor="text-red-700"
            points={[
              'Class grade sheets',
              'Summary reports',
              'Analytics dashboard',
              'Export to PDF/Excel',
            ]}
            ctaHref="/dashboard/registrar/reports"
            ctaLabel="Go to Reports →"
          />
          <ModuleCard
            title="System Overview"
            subtitle="All Roles"
            borderColor="border-gray-300"
            titleColor="text-gray-800"
            points={[
              'Role-based access control',
              'Audit logging & tracking',
              'Data validation rules',
              'Secure operations',
            ]}
            ctaHref="#"
            ctaLabel="Learn More →"
            gradient
          />
        </div>
      </div>

      {/* Activity + Audit in two-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivities.map((item) => (
              <ActivityItem key={item.title} {...item} />
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold">Audit Log</h2>
            <span className="text-xs text-gray-500">Latest {auditLogs.length}</span>
          </div>
          <div className="divide-y divide-gray-100">
            {auditLogs.map((log, idx) => (
              <div key={idx} className="py-3 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                  {log.user.split(' ').map(n => n[0]).join('').slice(0,2)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm font-semibold text-gray-800">
                    <span>{log.user}</span>
                    <span className="text-xs text-gray-500">{log.time}</span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {log.action} • {log.entity} • {log.context}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <a href="/dashboard/audit-logs" className="text-sm font-semibold text-primary hover:text-[#2D5986] block mt-3">
            View full audit trail →
          </a>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, change }: { title: string; value: string; change: string }) {
  return (
    <div className="card">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-600 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          <p className="text-xs text-gray-500 mt-2">{change}</p>
        </div>
      </div>
    </div>
  )
}

function ModuleCard({
  title,
  subtitle,
  borderColor,
  titleColor,
  points,
  ctaHref,
  ctaLabel,
  gradient = false,
}: {
  title: string
  subtitle: string
  borderColor: string
  titleColor: string
  points: string[]
  ctaHref: string
  ctaLabel: string
  gradient?: boolean
}) {
  return (
    <div className={`card border-2 ${borderColor} hover:shadow-lg transition-shadow ${gradient ? 'bg-gradient-to-br from-gray-50 to-gray-100' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className={`text-lg font-bold ${titleColor}`}>{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        </div>
      </div>
      <ul className="text-sm space-y-1 mb-4 text-gray-700">
        {points.map((p) => (
          <li key={p}>• {p}</li>
        ))}
      </ul>
      <a href={ctaHref} className="button-primary text-sm w-full text-center inline-block">
        {ctaLabel}
      </a>
    </div>
  )
}

function ActivityItem({
  title,
  description,
  time,
  status,
}: {
  title: string
  description: string
  time: string
  status: string
}) {
  const badgeColor =
    status === 'approved'
      ? 'bg-green-100 text-green-700'
      : status === 'pending'
      ? 'bg-yellow-100 text-yellow-700'
      : 'bg-blue-100 text-blue-700'

  return (
    <div className="p-4 border border-gray-100 rounded-lg flex items-start gap-3 hover:border-gray-200 transition-colors">
      <div className={`w-10 h-10 rounded-full ${badgeColor} flex items-center justify-center text-xs font-bold uppercase`}>
        {status.slice(0, 2)}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
          <span className="text-xs text-gray-500">{time}</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
    </div>
  )
}
