/**
 * Demo Accounts for Development/Testing Only
 * ⚠️ These accounts are for testing purposes in development mode only
 * They should NEVER be used in production
 */

export interface DemoAccount {
  email: string
  password: string
  role: 'student' | 'faculty' | 'registrar'
  firstName: string
  lastName: string
  department: string
}

export const DEMO_ACCOUNTS: Record<string, DemoAccount> = {
  student: {
    email: 'student@demo.com',
    password: 'DemoPass123!',
    role: 'student',
    firstName: 'John',
    lastName: 'Student',
    department: 'Computer Science',
  },
  faculty: {
    email: 'faculty@demo.com',
    password: 'DemoPass123!',
    role: 'faculty',
    firstName: 'Dr. Jane',
    lastName: 'Faculty',
    department: 'Computer Science',
  },
  registrar: {
    email: 'registrar@demo.com',
    password: 'DemoPass123!',
    role: 'registrar',
    firstName: 'Mike',
    lastName: 'Registrar',
    department: 'Administration',
  },
}

/**
 * Check if demo accounts should be available
 * Demo accounts are only available in development mode
 */
export const isDemoModeEnabled = () => {
  return process.env.NODE_ENV === 'development'
}

/**
 * Get all available demo accounts
 */
export const getAvailableDemoAccounts = () => {
  return isDemoModeEnabled() ? DEMO_ACCOUNTS : {}
}

/**
 * Create a mock user session without Firebase
 * Used for testing when demo accounts don't exist in Firebase yet
 */
export const createMockUserSession = (role: 'student' | 'faculty' | 'registrar') => {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Mock sessions only available in development mode')
  }

  const account = DEMO_ACCOUNTS[role]
  return {
    uid: `demo-${role}-${Date.now()}`,
    email: account.email,
    displayName: `${account.firstName} ${account.lastName}`,
    isDemo: true,
    metadata: {
      ...account,
      createdAt: new Date(),
      mockSession: true,
    },
  }
}
