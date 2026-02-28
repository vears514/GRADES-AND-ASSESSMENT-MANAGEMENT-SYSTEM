'use client'

import { AuthProvider } from '@/lib/AuthContext'
import { ReactNode } from 'react'

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        {children}
      </div>
    </AuthProvider>
  )
}
