'use client'

import { useRequireRole } from '@/hooks/useRequireRole'

export default function UserManagementPage() {
  const allowed = useRequireRole(['admin'])
  if (!allowed) return <div>Checking permissions…</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <p>This is a placeholder for the admin user management interface.</p>
    </div>
  )
}
