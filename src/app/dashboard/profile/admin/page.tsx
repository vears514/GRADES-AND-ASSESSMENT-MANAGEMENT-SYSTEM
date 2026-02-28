'use client'

import { useEffect, useState } from 'react'
import { authService } from '@/services/authService'
import { User } from '@/types'
import ProfileHeader from '@/components/ProfileHeader'
import { useRequireRole } from '@/hooks/useRequireRole'

export default function AdminProfilePage() {
  const allowed = useRequireRole(['admin'])
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

  if (loading) return <div>Loading admin profile…</div>
  if (error) return <div className="text-red-600">{error}</div>

  const authUser = authService.getCurrentUser()
  const photoUrl = authUser?.photoURL || user?.profilePhoto

  return (
    <div>
      <ProfileHeader
        photoUrl={photoUrl}
        fullName={`${user?.firstName} ${user?.lastName}`}
        email={user?.email || ''}
        role={user?.role || 'admin'}
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
          <li><strong>Role:</strong> Super Admin</li>
        </ul>
      </section>

      {/* System Info */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">System Information</h2>
        <ul className="space-y-1">
          <li><strong>Last login:</strong> {user?.lastLogin ? user.lastLogin.toLocaleString() : 'N/A'}</li>
          <li><strong>Account creation date:</strong> {user?.createdAt.toLocaleDateString()}</li>
          <li><strong>Access level:</strong> Full</li>
        </ul>
      </section>

      {/* Admin Controls */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Admin Controls</h2>
        <div className="flex gap-4">
          <a href="/dashboard/admin/users" className="button-secondary">User Management</a>
          <a href="/dashboard/admin/settings" className="button-secondary">System Settings</a>
        </div>
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
