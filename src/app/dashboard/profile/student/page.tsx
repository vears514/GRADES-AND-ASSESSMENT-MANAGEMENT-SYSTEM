'use client'

import { useEffect, useState } from 'react'
import { authService } from '@/services/authService'
import { User } from '@/types'
import ProfileHeader from '@/components/ProfileHeader'
import { useRequireRole } from '@/hooks/useRequireRole'

export default function StudentProfilePage() {
  const allowed = useRequireRole(['student','admin'])

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const authUser = authService.getCurrentUser()
        if (!authUser) throw new Error('Not authenticated')
        const profile = await authService.getUserData(authUser.uid)
        if (!profile) throw new Error('Profile not found')
        setUser(profile)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (!allowed) return <div>Checking permissions…</div>

  if (loading) return <div>Loading student profile…</div>
  if (error) return <div className="text-red-600">{error}</div>

  const authUser = authService.getCurrentUser()
  const photoUrl = authUser?.photoURL || user?.profilePhoto

  return (
    <div>
      <ProfileHeader
        photoUrl={photoUrl}
        fullName={`${user?.firstName} ${user?.lastName}`}
        email={user?.email || ''}
        role={user?.role || 'student'}
      />
      <div className="mb-6">
        <a href="/dashboard/profile/edit" className="button-secondary">
          Edit Profile
        </a>
      </div>

      {/* Basic Info */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Basic Information</h2>
        <ul className="space-y-1">
          <li><strong>Full name:</strong> {user?.firstName} {user?.lastName}</li>
          <li><strong>Email address:</strong> {user?.email}</li>
          <li><strong>Student ID:</strong> {user?.studentId || user?.id}</li>
          <li><strong>Role:</strong> Student</li>
          <li><strong>Account status:</strong> Active</li>
        </ul>
      </section>

      {/* Academic Info */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Academic Information</h2>
        <ul className="space-y-1">
          <li><strong>Course / Program:</strong> {user?.course || 'N/A'}</li>
          <li><strong>Year level:</strong> {user?.yearLevel || 'N/A'}</li>
          <li><strong>Section:</strong> {user?.section || 'N/A'}</li>
          <li><strong>Adviser:</strong> {user?.adviser || 'N/A'}</li>
        </ul>
      </section>

      {/* Grades Overview */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Grades Overview</h2>
        <ul className="space-y-1">
          <li><strong>Current GPA:</strong> {user?.currentGPA ?? 'N/A'}</li>
          <li><strong>Enrolled subjects:</strong> {user?.enrolledSubjects?.join(', ') || 'N/A'}</li>
          <li><strong>Semester / School year:</strong> {user?.semester || ''} {user?.schoolYear || ''}</li>
        </ul>
      </section>

      {/* Account Settings */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Account Settings</h2>
        <ul className="space-y-1">
          {user?.authMethod !== 'google' && (
            <li><a href="/change-password" className="text-blue-600 underline">Change password</a></li>
          )}
          <li><strong>Login method:</strong> {user?.authMethod === 'google' ? 'Google' : 'Email'}</li>
        </ul>
      </section>

      <button
        onClick={() => authService.logout().then(() => window.location.href = '/login')}
        className="button-secondary"
      >
        Logout
      </button>
    </div>
  )
}
