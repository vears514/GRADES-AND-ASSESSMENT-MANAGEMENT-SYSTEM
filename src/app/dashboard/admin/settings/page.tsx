'use client'

import { useRequireRole } from '@/hooks/useRequireRole'

export default function SystemSettingsPage() {
  const allowed = useRequireRole(['admin'])
  if (allowed === null) return <div>Checking permissions…</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">System Settings</h1>
      <p>This is a placeholder for global system configuration options.</p>
    </div>
  )
}
