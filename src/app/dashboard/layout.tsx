'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { authService } from '@/services/authService'
import type { User, UserRole } from '@/types'

type DashboardNavItem = {
  href: string
  label: string
  icon: React.ReactNode
  exact?: boolean
  matchPrefixes?: string[]
  variant?: 'default' | 'danger'
}

type DashboardNavSection = {
  label: string
  items: DashboardNavItem[]
}

const roleLabels: Record<UserRole, string> = {
  student: 'Student Portal',
  faculty: 'Faculty Portal',
  registrar: 'Registrar Portal',
  admin: 'Admin Portal',
}

function getPortalLabel(role: UserRole | null) {
  return role ? roleLabels[role] : 'Dashboard Portal'
}

function getUserDisplayName(profile: User | null) {
  const fullName = `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim()
  return fullName || profile?.email || 'Dashboard User'
}

function getUserSubtitle(profile: User | null, role: UserRole | null) {
  if (!profile) {
    return 'Loading account...'
  }

  if (profile.department) {
    return `${getPortalLabel(role)} - ${profile.department}`
  }

  if (profile.program) {
    return `${getPortalLabel(role)} - ${profile.program}`
  }

  return getPortalLabel(role)
}

function getUserInitials(profile: User | null) {
  const initials = `${profile?.firstName?.[0] || ''}${profile?.lastName?.[0] || ''}`.toUpperCase()
  if (initials) {
    return initials
  }

  return (profile?.email?.[0] || 'U').toUpperCase()
}

function isNavItemActive(pathname: string, item: DashboardNavItem) {
  if (item.exact) {
    return pathname === item.href
  }

  if (pathname === item.href) {
    return true
  }

  return item.matchPrefixes?.some((prefix) => pathname.startsWith(prefix)) || false
}

function buildNavigation(role: UserRole | null): DashboardNavSection[] {
  const sections: DashboardNavSection[] = [
    {
      label: 'Main',
      items: [
        {
          href: '/dashboard',
          label: 'Dashboard',
          icon: <DashboardIcon />,
          exact: true,
        },
      ],
    },
  ]

  if (role === 'faculty' || role === 'admin') {
    sections.push({
      label: 'Faculty',
      items: [
        {
          href: '/dashboard/faculty/grades',
          label: 'Grade Entry',
          icon: <ClipboardIcon />,
          matchPrefixes: ['/dashboard/faculty/grades'],
        },
        {
          href: '/dashboard/faculty/corrections',
          label: 'Corrections',
          icon: <RefreshIcon />,
          matchPrefixes: ['/dashboard/faculty/corrections'],
        },
      ],
    })
  }

  if (role === 'registrar' || role === 'admin') {
    sections.push({
      label: 'Registrar',
      items: [
        {
          href: '/dashboard/registrar/verification',
          label: 'Verification',
          icon: <ShieldCheckIcon />,
          matchPrefixes: ['/dashboard/registrar/verification'],
        },
        {
          href: '/dashboard/registrar/reports',
          label: 'Reports',
          icon: <ChartIcon />,
          matchPrefixes: ['/dashboard/registrar/reports'],
        },
      ],
    })
  }

  if (role === 'student' || role === 'admin') {
    sections.push({
      label: 'Student',
      items: [
        {
          href: '/dashboard/student/grades',
          label: 'My Grades',
          icon: <DocumentIcon />,
          exact: true,
        },
        {
          href: '/dashboard/student/grades/semestral',
          label: 'Semestral',
          icon: <ArchiveIcon />,
          matchPrefixes: ['/dashboard/student/grades/semestral'],
        },
      ],
    })
  }

  if (role === 'admin') {
    sections.push({
      label: 'Administration',
      items: [
        {
          href: '/dashboard/admin/users',
          label: 'User Management',
          icon: <UsersIcon />,
          matchPrefixes: ['/dashboard/admin/users'],
        },
        {
          href: '/dashboard/audit-logs',
          label: 'Audit Logs',
          icon: <ActivityIcon />,
          matchPrefixes: ['/dashboard/audit-logs'],
        },
        {
          href: '/dashboard/admin/settings',
          label: 'Settings',
          icon: <SettingsIcon />,
          matchPrefixes: ['/dashboard/admin/settings'],
        },
        {
          href: '/register',
          label: 'Registration',
          icon: <PlusUserIcon />,
          matchPrefixes: ['/register'],
        },
      ],
    })
  }

  sections.push({
    label: 'Account',
    items: [
      {
        href: '/dashboard/profile',
        label: 'My Profile',
        icon: <ProfileIcon />,
        matchPrefixes: ['/dashboard/profile'],
      },
      {
        href: '/logout',
        label: 'Log Out',
        icon: <LogoutIcon />,
        matchPrefixes: ['/logout'],
        variant: 'danger',
      },
    ],
  })

  return sections
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [profile, setProfile] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    let active = true

    const unsubscribe = authService.onAuthStateChanged(async (authUser) => {
      if (!active) {
        return
      }

      if (!authUser) {
        setProfile(null)
        setUserRole(null)
        return
      }

      try {
        const userProfile = await authService.getUserData(authUser.uid)
        if (!active) {
          return
        }

        setProfile(userProfile)
        setUserRole(userProfile?.role || null)
      } catch (error) {
        console.error('Failed to load dashboard profile:', error)
        if (!active) {
          return
        }

        setProfile(null)
        setUserRole(null)
      }
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  const navigationSections = buildNavigation(userRole)
  const displayName = getUserDisplayName(profile)
  const displaySubtitle = getUserSubtitle(profile, userRole)
  const initials = getUserInitials(profile)
  const portalLabel = getPortalLabel(userRole)

  return (
    <div className="dashboard-shell">
      <header className="dashboard-topbar">
        <div className="dashboard-topbar-left">
          <button
            type="button"
            className="dashboard-icon-button lg:hidden"
            onClick={() => setSidebarOpen((value) => !value)}
            aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
          >
            <MenuIcon />
          </button>

          <Link href="/dashboard" className="dashboard-brand">
            <span className="dashboard-brand-mark">GH</span>
            <span className="dashboard-brand-copy">
              <span className="dashboard-brand-title">Grade Hub</span>
              <span className="dashboard-brand-subtitle">{portalLabel}</span>
            </span>
          </Link>
        </div>

        <div className="dashboard-search hidden md:flex">
          <SearchIcon />
          <input
            type="search"
            placeholder="Search modules, pages, users..."
            aria-label="Search dashboard"
          />
        </div>

        <div className="dashboard-topbar-right">
          <div className="dashboard-status hidden xl:flex">
            <span className="dashboard-status-pill">Live</span>
            <span className="dashboard-status-text">{portalLabel}</span>
          </div>

          <button type="button" className="dashboard-icon-button" aria-label="Notifications">
            <BellIcon />
            <span className="dashboard-notification-dot" />
          </button>

          <Link href="/dashboard/profile" className="dashboard-user-pill">
            <span className="dashboard-user-avatar">{initials}</span>
            <span className="dashboard-user-meta">
              <span className="dashboard-user-name">{displayName}</span>
              <span className="dashboard-user-role">{displaySubtitle}</span>
            </span>
          </Link>
        </div>
      </header>

      <div
        className={`dashboard-sidebar-overlay ${sidebarOpen ? 'is-open' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <aside className={`dashboard-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <div className="dashboard-sidebar-head">
          <div className="dashboard-sidebar-eyebrow">Navigation</div>
          <div className="dashboard-sidebar-title">{portalLabel}</div>
          <div className="dashboard-sidebar-subtitle">Role-based access for grades and assessment workflows.</div>
        </div>

        <nav className="dashboard-nav" aria-label="Dashboard navigation">
          {navigationSections.map((section) => (
            <div key={section.label} className="dashboard-nav-section">
              <div className="dashboard-nav-label">{section.label}</div>

              <div className="dashboard-nav-items">
                {section.items.map((item) => {
                  const active = isNavItemActive(pathname, item)
                  const variantClass = item.variant === 'danger' ? 'is-danger' : ''
                  const activeClass = active ? 'is-active' : ''

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={`dashboard-nav-item ${variantClass} ${activeClass}`.trim()}
                    >
                      <span className="dashboard-nav-icon">{item.icon}</span>
                      <span className="dashboard-nav-text">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-main-content">{children}</div>
      </main>
    </div>
  )
}

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M3 13.2c0-.72.39-1.38 1.02-1.72l6.5-3.52a3 3 0 0 1 2.96 0l6.5 3.52c.63.34 1.02 1 1.02 1.72V19a2 2 0 0 1-2 2h-3.4a1 1 0 0 1-1-1v-3.4a1.6 1.6 0 0 0-1.6-1.6h-2a1.6 1.6 0 0 0-1.6 1.6V20a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2v-5.8Z" />
      <path d="M8 6.5 12 4l4 2.5" />
    </svg>
  )
}

function ClipboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M9 4.5h6a1.5 1.5 0 0 1 1.5 1.5v1H7.5V6A1.5 1.5 0 0 1 9 4.5Z" />
      <path d="M7.5 7H6a2 2 0 0 0-2 2v9.5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-1.5" />
      <path d="M8.5 12h7M8.5 15.5h7" />
    </svg>
  )
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M20 7v5h-5" />
      <path d="M4 17v-5h5" />
      <path d="M7.5 18A7.5 7.5 0 0 0 19 12.5M17 6A7.5 7.5 0 0 0 5 11.5" />
    </svg>
  )
}

function ShieldCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 3.5 19 6v5.6c0 4.26-2.68 8.06-7 9.9-4.32-1.84-7-5.64-7-9.9V6l7-2.5Z" />
      <path d="m9.4 12.2 1.8 1.8 3.6-4" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4.5 19.5h15" />
      <path d="M7.5 17V10.5" />
      <path d="M12 17V7.5" />
      <path d="M16.5 17v-4.5" />
    </svg>
  )
}

function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M8 3.5h6l4 4V19a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5.5a2 2 0 0 1 2-2Z" />
      <path d="M14 3.5V8h4" />
      <path d="M9 12.5h6M9 16h6" />
    </svg>
  )
}

function ArchiveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 7.5h16" />
      <path d="M5.5 7.5V18A2.5 2.5 0 0 0 8 20.5h8A2.5 2.5 0 0 0 18.5 18V7.5" />
      <path d="M6 3.5h12A1.5 1.5 0 0 1 19.5 5v1A1.5 1.5 0 0 1 18 7.5H6A1.5 1.5 0 0 1 4.5 6V5A1.5 1.5 0 0 1 6 3.5Z" />
      <path d="M10 11.5h4" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M16.5 20v-1.4A3.6 3.6 0 0 0 12.9 15H7.6A3.6 3.6 0 0 0 4 18.6V20" />
      <path d="M10.2 11.8a3.3 3.3 0 1 0 0-6.6 3.3 3.3 0 0 0 0 6.6Z" />
      <path d="M20 20v-1.2a3.2 3.2 0 0 0-2.5-3.1" />
      <path d="M15.8 5.4a3 3 0 0 1 0 5.9" />
    </svg>
  )
}

function ActivityIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 12h3l2-4 4 8 2-4h5" />
      <path d="M4 5.5h16v13H4z" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" />
      <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1.8 1.8 0 0 1-2.5 2.5l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a1.8 1.8 0 0 1-3.6 0v-.1a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a1.8 1.8 0 0 1-2.5-2.5l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4A1.8 1.8 0 0 1 4 11.4h.1a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1A1.8 1.8 0 0 1 7.2 7l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V6a1.8 1.8 0 1 1 3.6 0v.1a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1A1.8 1.8 0 0 1 17 9.6l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6h.1a1.8 1.8 0 0 1 0 3.6h-.1a1 1 0 0 0-.9.6Z" />
    </svg>
  )
}

function PlusUserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12.5 20v-1.6a3.4 3.4 0 0 0-3.4-3.4H6.4A3.4 3.4 0 0 0 3 18.4V20" />
      <path d="M7.8 11.8a3.3 3.3 0 1 0 0-6.6 3.3 3.3 0 0 0 0 6.6Z" />
      <path d="M18 8v6M15 11h6" />
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M18.5 20v-1.4A4.1 4.1 0 0 0 14.4 14.5H9.6A4.1 4.1 0 0 0 5.5 18.6V20" />
      <path d="M12 11.5A3.5 3.5 0 1 0 12 4.5a3.5 3.5 0 0 0 0 7Z" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M9 20H6.5A2.5 2.5 0 0 1 4 17.5v-11A2.5 2.5 0 0 1 6.5 4H9" />
      <path d="m14 16 4-4-4-4" />
      <path d="M18 12H9" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M6.5 9.8a5.5 5.5 0 1 1 11 0v2.8c0 .7.28 1.37.77 1.87l.73.73H5l.73-.73c.5-.5.77-1.17.77-1.87V9.8Z" />
      <path d="M10 18a2 2 0 0 0 4 0" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}
