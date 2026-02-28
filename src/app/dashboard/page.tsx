'use client'

import { useRequireRole } from '@/hooks/useRequireRole'

export default function DashboardPage() {
  const allowed = useRequireRole(['student','faculty','registrar','admin'])
  if (allowed === null) {
    return <div>Checking permissions…</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Grades" value="156" change="+12 this month" icon="" />
        <StatCard title="Pending Review" value="23" change="3 urgent" icon="" />
        <StatCard title="Approved" value="133" change="100%" icon="" />
        <StatCard title="Average Score" value="82.5" change="Up 2.3 points" icon="" />
      </div>

      {/* Grade Management Modules */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Grade Management Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Grade Encoding */}
          <div className="card border-2 border-blue-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-blue-700">Grade Encoding</h3>
                <p className="text-sm text-gray-600 mt-1">Faculty Module</p>
              </div>
              <div className="text-3xl"></div>
            </div>
            <p className="text-gray-700 mb-4">Enter and manage student grades for your courses</p>
            <ul className="text-sm space-y-1 mb-4">
              <li>✓ Single & bulk grade entry</li>
              <li>✓ Score validation</li>
              <li>✓ Auto grade calculation</li>
              <li>✓ Draft & submit workflow</li>
            </ul>
            <a href="/dashboard/faculty/grades" className="button-primary text-sm w-full text-center inline-block">
              Go to Grade Entry →
            </a>
          </div>

          {/* Grade Verification */}
          <div className="card border-2 border-green-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-green-700">Grade Verification</h3>
                <p className="text-sm text-gray-600 mt-1">Registrar Module</p>
              </div>
              <div className="text-3xl"></div>
            </div>
            <p className="text-gray-700 mb-4">Review and approve submitted grades before posting</p>
            <ul className="text-sm space-y-1 mb-4">
              <li>✓ Grade review workflow</li>
              <li>✓ Batch approval</li>
              <li>✓ Quality checks</li>
              <li>✓ Approval tracking</li>
            </ul>
            <a href="/dashboard/registrar/verification" className="button-primary text-sm w-full text-center inline-block">
              Go to Verification →
            </a>
          </div>

          {/* Student Grade Viewer */}
          <div className="card border-2 border-purple-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-purple-700">My Grades</h3>
                <p className="text-sm text-gray-600 mt-1">Student Module</p>
              </div>
              <div className="text-3xl"></div>
            </div>
            <p className="text-gray-700 mb-4">View your academic records and calculate GPA</p>
            <ul className="text-sm space-y-1 mb-4">
              <li>✓ Grade transcript</li>
              <li>✓ GPA calculation</li>
              <li>✓ Performance tracking</li>
              <li>✓ Degree progress</li>
            </ul>
            <a href="/dashboard/student/grades" className="button-primary text-sm w-full text-center inline-block">
              Go to My Grades →
            </a>
          </div>

          {/* Grade Corrections */}
          <div className="card border-2 border-orange-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-orange-700">Grade Corrections</h3>
                <p className="text-sm text-gray-600 mt-1">Faculty Module</p>
              </div>
              <div className="text-3xl"></div>
            </div>
            <p className="text-gray-700 mb-4">Request and manage grade changes with documentation</p>
            <ul className="text-sm space-y-1 mb-4">
              <li>✓ Correction requests</li>
              <li>✓ Multi-level approval</li>
              <li>✓ Documentation upload</li>
              <li>✓ Change history</li>
            </ul>
            <a href="/dashboard/faculty/corrections" className="button-primary text-sm w-full text-center inline-block">
              Go to Corrections →
            </a>
          </div>

          {/* Reports & Analytics */}
          <div className="card border-2 border-red-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-red-700">Reports & Analytics</h3>
                <p className="text-sm text-gray-600 mt-1">Registrar Module</p>
              </div>
              <div className="text-3xl"></div>
            </div>
            <p className="text-gray-700 mb-4">Generate comprehensive grade reports and analytics</p>
            <ul className="text-sm space-y-1 mb-4">
              <li>✓ Class grade sheets</li>
              <li>✓ Summary reports</li>
              <li>✓ Analytics dashboard</li>
              <li>✓ Export to PDF/Excel</li>
            </ul>
            <a href="/dashboard/registrar/reports" className="button-primary text-sm w-full text-center inline-block">
              Go to Reports →
            </a>
          </div>

          {/* System Overview */}
          <div className="card border-2 border-gray-300 hover:shadow-lg transition-shadow bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800">System Overview</h3>
                <p className="text-sm text-gray-600 mt-1">All Roles</p>
              </div>
              <div className="text-3xl"></div>
            </div>
            <p className="text-gray-700 mb-4">Complete grade management with validation & auditing</p>
            <ul className="text-sm space-y-1 mb-4">
              <li>✓ Role-based access control</li>
              <li>✓ Audit logging & tracking</li>
              <li>✓ Data validation rules</li>
              <li>✓ Secure operations</li>
            </ul>
            <button className="button-secondary text-sm w-full">
              Learn More →
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <ActivityItem
              title="Grade Submitted"
              description="COMP 101 - 45 grades submitted for verification"
              time="2 hours ago"
              status="pending"
              icon=""
            />
            <ActivityItem
              title="Grades Verified"
              description="MATH 201 - All grades approved and posted"
              time="5 hours ago"
              status="approved"
              icon=""
            />
            <ActivityItem
              title="Correction Request"
              description="ENG 102 - Student requested grade appeal"
              time="1 day ago"
              status="info"
              icon=""
            />
            <ActivityItem
              title="Report Generated"
              description="Fall 2025 Summary - Class averages and distribution"
              time="2 days ago"
              status="approved"
              icon=""
            />
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <a href="/dashboard/faculty/grades" className="button-primary w-full text-center inline-block">
              Enter Grades
            </a>
            <a href="/dashboard/registrar/verification" className="button-secondary w-full text-center inline-block">
              Review Grades
            </a>
            <a href="/dashboard/registrar/reports" className="button-secondary w-full text-center inline-block">
              View Reports
            </a>
            <a href="/dashboard/student/grades" className="button-secondary w-full text-center inline-block">
              My Grades
            </a>
            <button className="button-secondary w-full">
              Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  change,
  icon,
}: {
  title: string
  value: string
  change: string
  icon: string
}) {
  return (
    <div className="card">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-600 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          <p className="text-xs text-gray-500 mt-2">{change}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  )
}

function ActivityItem({
  title,
  description,
  time,
  status,
  icon,
}: {
  title: string
  description: string
  time: string
  status: 'approved' | 'pending' | 'info'
  icon: string
}) {
  const statusClasses = {
    approved: 'badge-success',
    pending: 'badge-warning',
    info: 'badge-info',
  }

  return (
    <div className="flex gap-4 pb-4 border-b border-border last:border-0">
      <div className="text-2xl pt-1">{icon}</div>
      <div className="flex-1">
        <h3 className="font-semibold text-sm">{title}</h3>
        <p className="text-xs text-gray-600 mt-1">{description}</p>
        <p className="text-xs text-gray-500 mt-2">{time}</p>
      </div>
      <div className={`badge ${statusClasses[status]} text-xs whitespace-nowrap`}>
        {status === 'pending' ? 'Pending' : status === 'approved' ? 'Approved' : 'Info'}
      </div>
    </div>
  )
}
