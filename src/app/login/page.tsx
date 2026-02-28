'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { authService } from '@/services/authService'
import { DEMO_ACCOUNTS, isDemoModeEnabled } from '@/config/demoAccounts'

// determine where to send a user based on their role
function getPathForRole(role?: string) {
  // always send to the profile router – it will branch itself
  // by leaving the role in the URL we also support deep links in future
  switch (role) {
    case 'student':
      return '/dashboard/profile/student'
    case 'faculty':
      return '/dashboard/profile/faculty'
    case 'registrar':
      return '/dashboard/profile/registrar'
    case 'admin':
      return '/dashboard/profile/admin'
    default:
      return '/dashboard/profile'
  }
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    try {
      const userCredential = await authService.login(email, password)
      setSuccess('Login successful! Redirecting...')
      setTimeout(async () => {
        // fetch profile for role-based routing
        const profile = await authService.getUserData(userCredential.uid)
        const destination = profile ? getPathForRole(profile.role) : '/dashboard'
        router.push(destination)
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      console.log('Google Sign-In button clicked')
      const { user, isNewUser } = await authService.signInWithGoogle()
      console.log('Sign-in successful:', user.email, 'isNewUser:', isNewUser)
      
      setSuccess('Google sign-in successful! Redirecting...')
      
      // If it's a new user, you might want to redirect to complete profile
      // Otherwise go to dashboard
      setTimeout(async () => {
        if (isNewUser) {
          router.push('/dashboard/profile-setup')
        } else {
          // fetch role and route accordingly for existing users
          const profile = user ? await authService.getUserData(user.uid) : null
          const destination = profile ? getPathForRole(profile.role) : '/dashboard'
          router.push(destination)
        }
      }, 1500)
    } catch (err: any) {
      console.error('Google Sign-In failed:', err)

      // handle some common error codes explicitly
      if (err.code === 'auth/invalid-credential') {
        setError(
          'Google authentication returned invalid credentials. ' +
          'Please check your Firebase configuration (OAuth client IDs, ' +
          'authorized domains) and try again.'
        )
      } else if (err.message.includes('cancelled') || err.message.includes('closed')) {
        setError('Sign-in was cancelled. Please try again.')
      } else if (err.message.includes('popup')) {
        setError(err.message)
      } else {
        setError(err.message || 'Google sign-in failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async (role: 'student' | 'faculty' | 'registrar' | 'admin') => {
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const demoAccount = DEMO_ACCOUNTS[role]
      console.log('Demo login attempt for role:', role)
      
      const userCredential = await authService.loginWithDemo(demoAccount)
      setSuccess(`Demo ${role} login successful! Redirecting...`)
      
      setTimeout(async () => {
        // after demo login we already know role by parameter but keep generic
        const destination = getPathForRole(role)
        router.push(destination)
      }, 1500)
    } catch (err: any) {
      console.error('Demo login error:', err)
      
      // Handle specific Firebase errors
      if (err.message.includes('not found') || err.message.includes('setup-demo-accounts')) {
        setError(
          `Demo accounts not created in Firebase. QUICK FIX:\n\n` +
          `1. Open a terminal in this project\n` +
          `2. Run: node setup-demo-accounts.js\n` +
          `3. Try login again\n\n` +
          `(Make sure serviceAccountKey.json is in your project root)`
        )
      } else if (err.message.includes('auth/wrong-password')) {
        setError('Incorrect password. Demo password is: DemoPass123!')
      } else if (err.message.includes('offline')) {
        setError('Firestore connection issue. Please check your internet connection.')
      } else {
        setError(err.message || `Demo login failed. Please try again.`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center px-4">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="card shadow-2xl border-0">
          <div className="mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">GH</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">GradeHub</h1>
            <p className="text-center text-gray-600 text-sm">Academic Grade Management System</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-3">
              <span className="text-lg">!</span>
              <div>{error}</div>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-start gap-3">
              <span className="text-lg">✓</span>
              <div>{success}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="your@email.com"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300" disabled={loading} />
                <span className="text-gray-700">Remember me</span>
              </label>
              <Link href="#" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="button-primary w-full py-2.5 font-semibold text-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="text-gray-500 text-sm">or</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            disabled={loading}
            className="w-full mt-6 py-2.5 px-4 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleGoogleSignIn}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Demo Accounts Section (Development Only) */}
          {isDemoModeEnabled() && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-500 mb-3">Demo Accounts (Development Only)</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('student')}
                  disabled={loading}
                  className="py-2 px-2 text-xs font-semibold text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('faculty')}
                  disabled={loading}
                  className="py-2 px-2 text-xs font-semibold text-white bg-purple-500 hover:bg-purple-600 rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Faculty
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('registrar')}
                  disabled={loading}
                  className="py-2 px-2 text-xs font-semibold text-white bg-green-500 hover:bg-green-600 rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Registrar
                </button>
              </div>
              <p className="text-center text-xs text-gray-400 mt-2">Password: DemoPass123!</p>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
