'use client'

import { useEffect, useState } from 'react'
import { authService } from '@/services/authService'
import { User, UserRole } from '@/types'
import { useRequireRole } from '@/hooks/useRequireRole'
import ProfileSettingsView from './ProfileSettingsView'

interface RoleProfilePageProps {
  allowedRoles: UserRole[]
}

export default function RoleProfilePage({ allowedRoles }: RoleProfilePageProps) {
  const allowed = useRequireRole(allowedRoles)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (allowed !== true) {
      return
    }

    let active = true

    const loadProfile = async () => {
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

    loadProfile()

    return () => {
      active = false
    }
  }, [allowed])

  if (allowed === null || loading) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-10 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-700">Profile</p>
        <h1 className="mt-3 text-2xl font-bold text-slate-950">Loading profile...</h1>
        <p className="mt-2 text-sm text-slate-500">Retrieving account details and academic information.</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-[28px] border border-red-200 bg-red-50 px-6 py-6 text-red-700 shadow-sm">
        <h1 className="text-xl font-bold">Unable to load profile</h1>
        <p className="mt-2 text-sm">{error}</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const authUser = authService.getCurrentUser()
  const photoUrl = authUser?.photoURL || user.profilePhoto

  return <ProfileSettingsView user={user} photoUrl={photoUrl} />
}
