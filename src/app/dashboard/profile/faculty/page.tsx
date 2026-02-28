'use client'

import { useEffect, useState } from 'react'
import { authService } from '@/services/authService'
import { User } from '@/types'
import ProfileHeader from '@/components/ProfileHeader'
import { useRequireRole } from '@/hooks/useRequireRole'

export default function FacultyProfilePage() {
  const allowed = useRequireRole(['faculty','admin'])
  if (!allowed) return <div>Checking permissions…</div>

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

  if (loading) return <div>Loading faculty profile…</div>
  if (error) return <div className="text-red-600">{error}</div>

  const authUser = authService.getCurrentUser()
  const photoUrl = authUser?.photoURL || user?.profilePhoto

  return (
    <div>
      <ProfileHeader
        photoUrl={photoUrl}
        fullName={`${user?.firstName} ${user?.lastName}`}
        email={user?.email || ''}
        role={user?.role || 'faculty'}
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
          <li><strong>Email:</strong> {user?.email}</li>
          <li><strong>Faculty ID:</strong> {user?.facultyId || user?.id}</li>
          <li><strong>Role:</strong> Faculty</li>
          <li><strong>Department:</strong> {user?.department || 'N/A'}</li>
        </ul>
      </section>

      {/* Teaching Info */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Teaching Information</h2>
        <ul className="space-y-1">
          <li><strong>Assigned subjects:</strong> {user?.assignedSubjects?.join(', ') || 'N/A'}</li>
          <li><strong>Handled sections:</strong> {user?.handledSections?.join(', ') || 'N/A'}</li>
          <li><strong>Current semester:</strong> {user?.currentSemester || 'N/A'}</li>
        </ul>
      </section>

      {/* Permissions */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Permissions</h2>
        <ul className="space-y-1">
          <li>Grade entry access: <strong>Yes</strong></li>
          <li>Assessment management access: <strong>Yes</strong></li>
        </ul>
      </section>

      {/* Account Settings */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Account Settings</h2>
        <ul className="space-y-1">
          <li><strong>Login method:</strong> {user?.authMethod === 'google' ? 'Google' : 'Email'}</li>
          {/* additional security info could go here */}
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
