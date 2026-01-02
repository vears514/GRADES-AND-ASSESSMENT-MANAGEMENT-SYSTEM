import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GradeHub - Academic Grade Management System',
  description: 'GradeHub: Comprehensive platform for managing academic grades with verification, reporting, and student access',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  )
}
