'use client'

import { useEffect, useState } from 'react'
import { authService } from '@/services/authService'
import { User } from '@/types'
import ProfileHeader from '@/components/ProfileHeader'
import { useRequireRole } from '@/hooks/useRequireRole'

export default function AdminProfilePage() {
  const allowed = useRequireRole(['admin'])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (allowed !== true) {
      return
    }

    let active = true

    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const authUser = await authService.waitForAuthState()
        if (!authUser) {
          throw new Error('Not authenticated')
        }

        const profile = await authService.getUserData(authUser.uid)
        if (!profile) {
          throw new Error('Profile not found')
        }

        if (!active) {
          return
        }

        setUser(profile)
      } catch (err: any) {
        if (!active) {
          return
        }
        setError(err.message || 'Failed to load profile')
      } finally {
        if (!active) {
          return
        }
        setLoading(false)
      }
    }

    load()

    return () => {
      active = false
    }
  }, [allowed])

  if (allowed === null) return <div>Checking permissions...</div>
  if (loading) return <div>Loading admin profile...</div>
  if (error) return <div className="text-red-600">{error}</div>

  const authUser = authService.getCurrentUser()
  const photoUrl = authUser?.photoURL || user?.profilePhoto

  const formatDate = (value: unknown) => {
    if (!value) {
      return 'N/A'
    }

    const date = value instanceof Date ? value : new Date(value as string)
    return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
  }

  const formatDateTime = (value: unknown) => {
    if (!value) {
      return 'N/A'
    }

    const date = value instanceof Date ? value : new Date(value as string)
    return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleString()
  }

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

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Basic Information</h2>
        <ul className="space-y-1">
          <li><strong>Full name:</strong> {user?.firstName} {user?.lastName}</li>
          <li><strong>Email:</strong> {user?.email}</li>
          <li><strong>Role:</strong> Super Admin</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">System Information</h2>
        <ul className="space-y-1">
          <li><strong>Last login:</strong> {formatDateTime(user?.lastLogin)}</li>
          <li><strong>Account creation date:</strong> {formatDate(user?.createdAt)}</li>
          <li><strong>Access level:</strong> Full</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Admin Controls</h2>
        <div className="flex gap-4">
          <a href="/dashboard/admin/users" className="button-secondary">User Management</a>
        </div>
      </section>

      <button
        onClick={() => authService.logout().then(() => { window.location.href = '/login' })}
        className="button-secondary"
      >
        Logout
      </button>
    </div>
  )
}
