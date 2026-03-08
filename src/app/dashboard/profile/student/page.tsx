'use client'

import RoleProfilePage from '@/components/profile/RoleProfilePage'

export default function StudentProfilePage() {
  return <RoleProfilePage allowedRoles={['student', 'admin']} />
}
