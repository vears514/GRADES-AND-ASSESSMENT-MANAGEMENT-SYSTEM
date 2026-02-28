'use client'

import { useEffect, useState } from 'react'
import { authService } from '@/services/authService'
import { User } from '@/types'
import { useRouter } from 'next/navigation'
import { useRequireRole } from '@/hooks/useRequireRole'

export default function EditProfilePage() {
  const router = useRouter()
  const allowed = useRequireRole(['student','faculty','admin'])
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

  if (loading) return <div>Loading profile…</div>
  if (error) return <div className="text-red-600">{error}</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>
      <p className="mb-4">This page will allow the user to update limited profile fields such as name, department, etc.</p>
      <button onClick={() => router.push('/dashboard/profile')} className="button-secondary">
        Back to Profile
      </button>
    </div>
  )
}
