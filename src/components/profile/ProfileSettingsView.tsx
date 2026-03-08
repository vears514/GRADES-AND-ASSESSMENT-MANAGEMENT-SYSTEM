'use client'

import Link from 'next/link'
import { useState } from 'react'
import { authService } from '@/services/authService'
import { User, UserRole } from '@/types'

type SettingsTabId = 'account' | 'security' | 'additional'
type IconName =
  | 'user'
  | 'mail'
  | 'id'
  | 'role'
  | 'building'
  | 'shield'
  | 'lock'
  | 'clock'
  | 'graduation'
  | 'list'
  | 'camera'
  | 'logout'
  | 'book'

interface DisplayField {
  label: string
  value?: string
  icon: IconName
  span?: 'full'
}

interface DisplaySection {
  title: string
  description: string
  fields: DisplayField[]
}

interface SettingsTab {
  id: SettingsTabId
  label: string
  description: string
  icon: IconName
}

interface ProfileSettingsViewProps {
  user: User
  photoUrl?: string
}

const roleLabels: Record<UserRole, string> = {
  student: 'Student',
  faculty: 'Faculty',
  registrar: 'Registrar',
  admin: 'Super Admin',
}

const additionalTabLabels: Record<UserRole, string> = {
  student: 'Student Additional Information',
  faculty: 'Faculty Additional Information',
  registrar: 'Registrar Additional Information',
  admin: 'Administrative Information',
}

export default function ProfileSettingsView({ user, photoUrl }: ProfileSettingsViewProps) {
  const [activeTab, setActiveTab] = useState<SettingsTabId>('account')
  const [loggingOut, setLoggingOut] = useState(false)

  const roleLabel = roleLabels[user.role]
  const idLabel = getPrimaryIdLabel(user.role)
  const workspaceLabel = getWorkspaceLabel(user.role)
  const username = user.studentId || user.facultyId || getEmailUsername(user.email) || user.id
  const primaryId = user.studentId || user.facultyId || user.id
  const workspace = joinValues(
    user.role === 'student'
      ? [user.college, user.department]
      : [user.department, user.college]
  )

  const tabs: SettingsTab[] = [
    {
      id: 'account',
      label: 'Account',
      description: 'Manage your public profile and private information',
      icon: 'user',
    },
    {
      id: 'security',
      label: 'Security',
      description: 'Review sign-in method and account activity',
      icon: 'shield',
    },
    {
      id: 'additional',
      label: additionalTabLabels[user.role],
      description: getAdditionalDescription(user.role),
      icon: user.role === 'student' ? 'graduation' : 'book',
    },
  ]

  const profileFields: DisplayField[] = [
    { label: 'First Name', value: user.firstName, icon: 'user' },
    { label: 'Middle Name', value: undefined, icon: 'user' },
    { label: 'Last Name', value: user.lastName, icon: 'user' },
    { label: 'Suffix', value: undefined, icon: 'id' },
    { label: 'Username', value: username, icon: 'id' },
    { label: 'Role/s', value: roleLabel, icon: 'role' },
    { label: idLabel, value: primaryId, icon: 'id' },
    { label: workspaceLabel, value: workspace, icon: 'building' },
  ]

  const personalFields: DisplayField[] = [
    { label: 'Email Address', value: user.email, icon: 'mail' },
    { label: 'Department', value: user.department, icon: 'building' },
    { label: 'Gender', value: user.gender, icon: 'user' },
    { label: 'Program', value: user.program || user.course, icon: 'graduation' },
    { label: 'Profile Updated', value: formatDateTime(user.updatedAt), icon: 'clock' },
    { label: 'Created On', value: formatDateTime(user.createdAt), icon: 'clock' },
  ]

  const securityFields: DisplayField[] = [
    {
      label: 'Sign-in Method',
      value: user.authMethod === 'google' ? 'Google Sign-In' : 'Email and Password',
      icon: 'shield',
    },
    { label: 'Primary Email', value: user.email, icon: 'mail' },
    {
      label: 'Password Management',
      value: user.authMethod === 'google' ? 'Managed by Google account' : 'Managed in application auth flow',
      icon: 'lock',
    },
    { label: 'Last Login', value: formatDateTime(user.lastLogin), icon: 'clock' },
    { label: 'Last Profile Update', value: formatDateTime(user.updatedAt), icon: 'clock' },
    { label: 'Account Created', value: formatDateTime(user.createdAt), icon: 'clock' },
  ]

  const additionalSections = getAdditionalSections(user)

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      await authService.logout()
      window.location.href = '/login'
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_60px_-30px_rgba(15,23,42,0.35)]">
      <div className="grid lg:grid-cols-[320px,minmax(0,1fr)]">
        <aside className="border-b border-slate-200 bg-slate-50 lg:border-b-0 lg:border-r">
          <div className="border-b border-slate-200 px-8 py-8">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-700">Profile</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">Settings</h1>
            <p className="mt-3 max-w-xs text-sm leading-6 text-slate-500">
              Review the information attached to your account and the academic records stored in the system.
            </p>
          </div>

          <div className="space-y-2 px-4 py-4">
            {tabs.map((tab) => {
              const active = tab.id === activeTab

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-start gap-4 rounded-2xl border px-5 py-4 text-left transition-all ${
                    active
                      ? 'border-blue-200 bg-blue-50 text-blue-900 shadow-sm'
                      : 'border-transparent bg-transparent text-slate-600 hover:border-slate-200 hover:bg-white'
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      active ? 'bg-white text-blue-700' : 'bg-white text-slate-400'
                    }`}
                  >
                    <LineIcon name={tab.icon} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{tab.label}</span>
                    <span className="mt-1 block text-sm leading-6 text-slate-500">{tab.description}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </aside>

        <section className="bg-[#eef2f7] px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-6 xl:grid xl:grid-cols-[220px,minmax(0,1fr)]">
                <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-2xl font-bold text-slate-950">Account</h2>
                  <p className="mt-2 text-sm text-slate-500">Avatar</p>
                  <p className="text-sm text-slate-500">Display Picture</p>

                  <div className="relative mt-8 flex justify-center">
                    <div className="relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-[6px] border-slate-100 bg-slate-400 text-4xl font-bold text-white shadow-inner">
                      {photoUrl ? (
                        <img src={photoUrl} alt="Profile avatar" className="h-full w-full object-cover" />
                      ) : (
                        <span>{getInitials(user.firstName, user.lastName)}</span>
                      )}
                      <span className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500 shadow-lg ring-4 ring-slate-100">
                        <LineIcon name="camera" />
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-4">
                    <p className="text-sm font-semibold text-slate-900">{`${user.firstName} ${user.lastName}`.trim()}</p>
                    <p className="mt-1 text-sm text-slate-500">{user.email}</p>
                    <div className="mt-4 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-blue-700">
                      {roleLabel}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <FieldSection
                    title="Profile"
                    description="Following information is publicly displayed."
                    fields={profileFields}
                  />
                  <FieldSection
                    title="Personal Information"
                    description="Communication details in case we want to connect with you."
                    fields={personalFields}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr),320px]">
              <FieldSection
                title="Security"
                description="Review your authentication method and account activity."
                fields={securityFields}
              />

              <div className="space-y-6">
                <ActionCard
                  title="Session Controls"
                  description="Use the secure sign-out action when you are finished using the system."
                >
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <LineIcon name="logout" className="h-4 w-4" />
                    {loggingOut ? 'Signing Out...' : 'Logout'}
                  </button>
                </ActionCard>

                <ActionCard
                  title="Profile Maintenance"
                  description="The editable profile flow already exists in the dashboard if you want to extend it next."
                >
                  <Link
                    href="/dashboard/profile/edit"
                    className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    Open Edit Profile
                  </Link>
                </ActionCard>
              </div>
            </div>
          )}

          {activeTab === 'additional' && (
            <div className="space-y-6">
              {additionalSections.map((section) => (
                <FieldSection
                  key={section.title}
                  title={section.title}
                  description={section.description}
                  fields={section.fields}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function FieldSection({
  title,
  description,
  fields,
}: {
  title: string
  description: string
  fields: DisplayField[]
}) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-2xl font-bold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm text-slate-500">{description}</p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <div key={`${title}-${field.label}`} className={field.span === 'full' ? 'md:col-span-2' : ''}>
            <p className="mb-2 block text-sm font-semibold text-slate-700">{field.label}</p>
            <div className="flex min-h-[56px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
              <span className="text-slate-400">
                <LineIcon name={field.icon} />
              </span>
              <span className={field.value ? 'text-slate-700' : 'text-slate-400'}>
                {field.value || 'Not provided'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function ActionCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      <div className="mt-6">{children}</div>
    </section>
  )
}

function LineIcon({ name, className = 'h-5 w-5' }: { name: IconName; className?: string }) {
  const sharedProps = {
    className,
    fill: 'none',
    stroke: 'currentColor',
    viewBox: '0 0 24 24',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }

  switch (name) {
    case 'mail':
      return (
        <svg {...sharedProps}>
          <path d="M4 6h16v12H4z" />
          <path d="m4 8 8 6 8-6" />
        </svg>
      )
    case 'id':
      return (
        <svg {...sharedProps}>
          <path d="M4 5h16v14H4z" />
          <path d="M8 10h3" />
          <path d="M8 14h6" />
          <circle cx="16.5" cy="10.5" r="2.5" />
        </svg>
      )
    case 'role':
      return (
        <svg {...sharedProps}>
          <path d="M12 3 4 7l8 4 8-4-8-4Z" />
          <path d="M6 10.5v3.5c0 2 2.7 3.5 6 3.5s6-1.5 6-3.5v-3.5" />
        </svg>
      )
    case 'building':
      return (
        <svg {...sharedProps}>
          <path d="M5 21V5l7-2v18" />
          <path d="M19 21V9l-7-2" />
          <path d="M9 9h.01" />
          <path d="M9 13h.01" />
          <path d="M9 17h.01" />
          <path d="M15 13h.01" />
          <path d="M15 17h.01" />
        </svg>
      )
    case 'shield':
      return (
        <svg {...sharedProps}>
          <path d="M12 3 5 6v6c0 5 3.5 8 7 9 3.5-1 7-4 7-9V6l-7-3Z" />
          <path d="m9.5 12 1.5 1.5 3-3.5" />
        </svg>
      )
    case 'lock':
      return (
        <svg {...sharedProps}>
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      )
    case 'clock':
      return (
        <svg {...sharedProps}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5v5l3 2" />
        </svg>
      )
    case 'graduation':
      return (
        <svg {...sharedProps}>
          <path d="M3 9.5 12 5l9 4.5-9 4.5-9-4.5Z" />
          <path d="M7 12.5V16c0 1.7 2.2 3 5 3s5-1.3 5-3v-3.5" />
        </svg>
      )
    case 'list':
      return (
        <svg {...sharedProps}>
          <path d="M9 6h11" />
          <path d="M9 12h11" />
          <path d="M9 18h11" />
          <circle cx="4.5" cy="6" r="1" fill="currentColor" stroke="none" />
          <circle cx="4.5" cy="12" r="1" fill="currentColor" stroke="none" />
          <circle cx="4.5" cy="18" r="1" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'camera':
      return (
        <svg {...sharedProps}>
          <path d="M4 8h3l1.5-2h7L17 8h3v9H4z" />
          <circle cx="12" cy="13" r="3.5" />
        </svg>
      )
    case 'logout':
      return (
        <svg {...sharedProps}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="m16 17 5-5-5-5" />
          <path d="M21 12H9" />
        </svg>
      )
    case 'book':
      return (
        <svg {...sharedProps}>
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5Z" />
          <path d="M8 7h7" />
          <path d="M8 11h7" />
        </svg>
      )
    case 'user':
    default:
      return (
        <svg {...sharedProps}>
          <circle cx="12" cy="8" r="3.25" />
          <path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
        </svg>
      )
  }
}

function getAdditionalSections(user: User): DisplaySection[] {
  switch (user.role) {
    case 'student':
      return [
        {
          title: 'Academic Information',
          description: 'Enrollment and academic records attached to the student account.',
          fields: [
            { label: 'Course / Program', value: user.program || user.course, icon: 'graduation' },
            { label: 'Year Level', value: user.yearLevel, icon: 'book' },
            { label: 'Section', value: user.section, icon: 'list' },
            { label: 'Adviser', value: user.adviser, icon: 'user' },
            { label: 'Semester', value: user.semester || user.currentSemester, icon: 'clock' },
            { label: 'School Year', value: user.schoolYear, icon: 'clock' },
            {
              label: 'Current GPA',
              value: typeof user.currentGPA === 'number' ? user.currentGPA.toFixed(2) : undefined,
              icon: 'graduation',
            },
            {
              label: 'Enrolled Subjects',
              value: joinValues(user.enrolledSubjects),
              icon: 'list',
              span: 'full',
            },
            {
              label: 'Enrolled Courses',
              value: joinValues(user.enrolledCourses),
              icon: 'book',
              span: 'full',
            },
          ],
        },
      ]
    case 'faculty':
      return [
        {
          title: 'Teaching Information',
          description: 'Current teaching assignments and workload references.',
          fields: [
            { label: 'Faculty ID', value: user.facultyId || user.id, icon: 'id' },
            { label: 'Department', value: user.department, icon: 'building' },
            { label: 'Current Semester', value: user.currentSemester, icon: 'clock' },
            { label: 'Role', value: roleLabels[user.role], icon: 'role' },
            {
              label: 'Assigned Subjects',
              value: joinValues(user.assignedSubjects),
              icon: 'book',
              span: 'full',
            },
            {
              label: 'Handled Sections',
              value: joinValues(user.handledSections),
              icon: 'list',
              span: 'full',
            },
          ],
        },
      ]
    case 'registrar':
      return [
        {
          title: 'Registrar Information',
          description: 'Administrative references used for verification and reporting workflows.',
          fields: [
            { label: 'Employee ID', value: user.id, icon: 'id' },
            { label: 'Department', value: user.department, icon: 'building' },
            { label: 'Access Scope', value: 'Academic verification and records reporting', icon: 'shield' },
            { label: 'System Role', value: roleLabels[user.role], icon: 'role' },
            { label: 'Created On', value: formatDateTime(user.createdAt), icon: 'clock' },
            { label: 'Last Updated', value: formatDateTime(user.updatedAt), icon: 'clock' },
          ],
        },
      ]
    case 'admin':
      return [
        {
          title: 'Administrative Controls',
          description: 'System-level account details and operational access references.',
          fields: [
            { label: 'Admin ID', value: user.id, icon: 'id' },
            { label: 'Department', value: user.department, icon: 'building' },
            { label: 'Access Level', value: 'Full platform administration', icon: 'shield' },
            { label: 'Last Login', value: formatDateTime(user.lastLogin), icon: 'clock' },
            { label: 'Created On', value: formatDateTime(user.createdAt), icon: 'clock' },
            { label: 'Last Updated', value: formatDateTime(user.updatedAt), icon: 'clock' },
          ],
        },
      ]
    default:
      return []
  }
}

function getPrimaryIdLabel(role: UserRole) {
  switch (role) {
    case 'student':
      return 'Student ID'
    case 'faculty':
      return 'Faculty ID'
    case 'admin':
      return 'Admin ID'
    case 'registrar':
    default:
      return 'Employee ID'
  }
}

function getWorkspaceLabel(role: UserRole) {
  switch (role) {
    case 'student':
      return 'School / College'
    case 'faculty':
      return 'Department / School'
    case 'registrar':
      return 'Office / Unit'
    case 'admin':
    default:
      return 'Department / Unit'
  }
}

function getAdditionalDescription(role: UserRole) {
  switch (role) {
    case 'student':
      return 'Additional records for enrollment, course, and academic standing'
    case 'faculty':
      return 'Additional records for teaching load and faculty assignments'
    case 'registrar':
      return 'Additional records for administrative verification workflows'
    case 'admin':
    default:
      return 'Additional records for platform management and access level'
  }
}

function getEmailUsername(email?: string) {
  if (!email) {
    return ''
  }

  return email.split('@')[0]
}

function joinValues(values?: Array<string | undefined> | string) {
  if (typeof values === 'string') {
    return values || undefined
  }

  const cleaned = (values || []).map((value) => value?.trim()).filter(Boolean)
  return cleaned.length > 0 ? cleaned.join(', ') : undefined
}

function getInitials(firstName?: string, lastName?: string) {
  const parts = [firstName, lastName].map((part) => part?.trim()).filter(Boolean)
  if (parts.length === 0) {
    return 'U'
  }

  return parts.map((part) => part![0]).join('').slice(0, 2).toUpperCase()
}

function formatDateTime(value: unknown) {
  const normalized = normalizeDate(value)
  if (!normalized) {
    return undefined
  }

  return normalized.toLocaleString()
}

function normalizeDate(value: unknown) {
  if (!value) {
    return null
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }

  if (typeof value === 'object') {
    if (typeof (value as { toDate?: () => Date }).toDate === 'function') {
      const converted = (value as { toDate: () => Date }).toDate()
      return Number.isNaN(converted.getTime()) ? null : converted
    }

    const seconds = (value as { seconds?: number }).seconds
    if (typeof seconds === 'number') {
      const converted = new Date(seconds * 1000)
      return Number.isNaN(converted.getTime()) ? null : converted
    }
  }

  const converted = new Date(value as string | number)
  return Number.isNaN(converted.getTime()) ? null : converted
}
