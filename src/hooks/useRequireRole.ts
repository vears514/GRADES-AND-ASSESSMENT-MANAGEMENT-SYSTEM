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
  // null = still checking, true = allowed (never returns false because we
  // redirect immediately on failure)
  const [allowed, setAllowed] = useState<boolean | null>(null)

  useEffect(() => {
    let firstCall = true

    const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
      if (firstCall) {
        firstCall = false
        if (!firebaseUser) {
          return // wait for real event
        }
      }

      if (!firebaseUser) {
        router.replace('/login')
        return
      }

      const profile = await authService.getUserData(firebaseUser.uid)
      if (!profile || !roles.includes(profile.role as UserRole)) {
        router.replace('/unauthorized')
        return
      }
      setAllowed(true)
    })

    return () => unsubscribe()
  }, [roles, router])

  return allowed
}
