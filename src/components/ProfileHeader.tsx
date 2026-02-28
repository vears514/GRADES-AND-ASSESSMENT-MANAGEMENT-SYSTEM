'use client'

import React from 'react'
import { UserRole } from '@/types'

interface ProfileHeaderProps {
  photoUrl?: string
  fullName: string
  email: string
  role: UserRole
}

export default function ProfileHeader({ photoUrl, fullName, email, role }: ProfileHeaderProps) {
  const roleLabel = role === 'admin' ? 'Super Admin' : role.charAt(0).toUpperCase() + role.slice(1)

  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden">
        {photoUrl ? (
          <img src={photoUrl} alt="Profile" className="object-cover w-full h-full" />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-2xl text-gray-500">
            {fullName.charAt(0)}
          </div>
        )}
      </div>
      <div>
        <h1 className="text-3xl font-bold">{fullName}</h1>
        <p className="text-gray-600">{email}</p>
        <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
          {roleLabel}
        </span>
      </div>
    </div>
  )
}
