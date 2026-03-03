import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/authService'
import { UserRole } from '@/types'

/**
 * Hook that enforces that the current user has one of the specified roles.
 *
 * - If no user is logged in, it redirects to /login.
 * - If the user is logged in but their profile role is not in `roles`,
 *   it redirects to /unauthorized.
 *
 * Returns a boolean indicating whether the check has completed; render a
 * loading state while `false`.
 */
export function useRequireRole(roles: UserRole[]) {
  const router = useRouter()
  const [allowed, setAllowed] = useState<boolean | null>(null)
  const rolesKey = roles.join('|')

  useEffect(() => {
    let active = true
    setAllowed(null)

    const checkAccess = async () => {
      try {
        const firebaseUser = await authService.waitForAuthState()
        if (!active) return

        if (!firebaseUser) {
          router.replace('/login')
          return
        }

        const profile = await authService.getUserData(firebaseUser.uid)
        if (!active) return

        if (!profile || !roles.includes(profile.role as UserRole)) {
          router.replace('/unauthorized')
          return
        }

        setAllowed(true)
      } catch (error) {
        if (!active) return
        console.error('Role check failed:', error)
        router.replace('/login')
      }
    }

    checkAccess()

    return () => {
      active = false
    }
  }, [rolesKey, router])

  return allowed
}
