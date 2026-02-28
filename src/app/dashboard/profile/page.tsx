'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/authService'
import { User } from '@/types'

export default function ProfileRouterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userData, setUserData] = useState<User | null>(null)
  const [redirected, setRedirected] = useState(false)

  useEffect(() => {
    // wait for a stable auth state instead of reading currentUser immediately
    let firstCall = true
    let isUnmounting = false
    
    const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
      if (firstCall) {
        firstCall = false
        if (!firebaseUser) return
      }

      if (!firebaseUser) {
        if (!isUnmounting) {
          router.push('/login')
        }
        return
      }

      // Prevent multiple redirects for the same user
      if (redirected) {
        return
      }

      try {
        const profile = await authService.getUserData(firebaseUser.uid)
        if (!profile) {
          if (!isUnmounting) {
            setError('User profile not found')
          }
          return
        }
        
        if (isUnmounting) return
        
        setUserData(profile)
        setRedirected(true)

        switch (profile.role) {
          case 'student':
            router.replace('/dashboard/profile/student')
            break
          case 'faculty':
            router.replace('/dashboard/profile/faculty')
            break
          case 'registrar':
            router.replace('/dashboard/profile/registrar')
            break
          case 'admin':
            router.replace('/dashboard/profile/admin')
            break
          default:
            router.replace('/dashboard')
        }
      } catch (err: any) {
        if (!isUnmounting) {
          setError(err.message || 'Unable to load profile')
        }
      } finally {
        if (!isUnmounting) {
          setLoading(false)
        }
      }
    })

    return () => {
      isUnmounting = true
      unsubscribe()
    }
  }, [router])

  if (loading) {
    return <div>Loading profile...</div>
  }

  if (error) {
    return <div className="text-red-600">{error}</div>
  }

  // the component itself never renders anything because we redirect immediately
  return null
}
