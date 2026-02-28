'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { authService } from '@/services/authService'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null)
  const [roleLabel, setRoleLabel] = useState('')
  const [userRole, setUserRole] = useState<string | null>(null)

  // determine label based on logged in user's role
  useEffect(() => {
    const load = async () => {
      const authUser = authService.getCurrentUser()
      if (!authUser) return
      const profile = await authService.getUserData(authUser.uid)
      if (!profile) return
      switch (profile.role) {
        case 'student':
          setRoleLabel('Student Portal')
          setUserRole('student')
          break
        case 'faculty':
          setRoleLabel('Faculty Portal')
          setUserRole('faculty')
          break
        case 'registrar':
          setRoleLabel('Registrar Portal')
          setUserRole('registrar')
          break
        case 'admin':
          setRoleLabel('Admin Portal')
          setUserRole('admin')
          break
        default:
          setRoleLabel('Dashboard')
          setUserRole(null)
      }
    }
    load()
  }, [])

  return (
    <div className="flex h-screen bg-surface">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-border overflow-y-auto">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-primary">Grade Hub</h1>
          <p className="text-xs text-gray-500 mt-1">{roleLabel || 'Loading...'}</p>
        </div>

        <nav className="mt-6 space-y-1 px-4 pb-8">
          <NavLink href="/dashboard" label="Dashboard" icon="" />
          
          {/* only show faculty menu if user is faculty or admin */}
          {userRole && (['faculty','admin'] as string[]).includes(userRole) && (
            <NavMenu 
              label="Faculty" 
              icon=""
              expanded={expandedMenu === 'faculty'}
              onToggle={() => setExpandedMenu(expandedMenu === 'faculty' ? null : 'faculty')}
              items={[
                { href: '/dashboard/faculty/grades', label: 'Grade Entry', icon: '' },
                { href: '/dashboard/faculty/corrections', label: 'Corrections', icon: '' },
              ]}
            />
          )}

          {/* show registrar menu for registrar or admin */}
          {userRole && (['registrar','admin'] as string[]).includes(userRole) && (
            <NavMenu 
              label="Registrar" 
              icon=""
              expanded={expandedMenu === 'registrar'}
              onToggle={() => setExpandedMenu(expandedMenu === 'registrar' ? null : 'registrar')}
              items={[
                { href: '/dashboard/registrar/verification', label: 'Verification', icon: '' },
                { href: '/dashboard/registrar/reports', label: 'Reports', icon: '' },
              ]}
            />
          )}

          {/* show student menu for students */}
          {userRole === 'student' && (
            <NavMenu 
              label="Student" 
              icon=""
              expanded={expandedMenu === 'student'}
              onToggle={() => setExpandedMenu(expandedMenu === 'student' ? null : 'student')}
              items={[
                { href: '/dashboard/student/grades', label: 'My Grades', icon: '' },
              ]}
            />
          )}

          <div className="pt-6 border-t mt-6">
            <NavLink href="/dashboard/profile" label="Profile" icon="" />
            <NavLink href="/logout" label="Logout" icon="" />
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-white border-b border-border px-8 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Welcome Back</h2>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center">
              U
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

function NavLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  // use Next.js Link to avoid full page reloads so we keep React state and
  // authentication intact when navigating within the dashboard.
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-2 rounded-md text-gray-700 hover:bg-surface transition-colors"
    >
      <span className="text-lg">{icon}</span>
      <span className="font-medium text-sm">{label}</span>
    </Link>
  )
}

function NavMenu({ 
  label, 
  icon, 
  expanded, 
  onToggle,
  items 
}: { 
  label: string
  icon: string
  expanded: boolean
  onToggle: () => void
  items: Array<{ href: string; label: string; icon: string }>
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-2 rounded-md text-gray-700 hover:bg-surface transition-colors"
      >
        <span className="text-lg">{icon}</span>
        <span className="font-medium text-sm flex-1 text-left">{label}</span>
        <span className={`transition-transform ${expanded ? 'rotate-180' : ''}`}>▾</span>
      </button>
      
      {expanded && (
        <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2 rounded-md text-gray-600 hover:bg-surface text-sm transition-colors"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
