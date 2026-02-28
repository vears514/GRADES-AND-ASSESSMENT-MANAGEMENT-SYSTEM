'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/authService'

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    const logout = async () => {
      await authService.logout()
      router.replace('/login')
    }

    logout()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="card text-center max-w-md w-full">
        <h1 className="text-xl font-bold">Signing you out...</h1>
        <p className="text-sm text-gray-600 mt-2">Please wait while we end your session securely.</p>
      </div>
    </div>
  )
}
