import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ClientLayout } from './ClientLayout'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: 'GradeHub - Academic Grade Management System',
  description: 'GradeHub: Comprehensive platform for managing academic grades with verification, reporting, and student access',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
