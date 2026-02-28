import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  updateProfile,
} from 'firebase/auth'
import { collection, addDoc, query, where, getDocs, Timestamp, getDoc, doc, setDoc } from 'firebase/firestore'
import { getAuth_, getDb } from '@/lib/firebase'
import { User } from '@/types'

const USERS_COLLECTION = 'users'
const googleProvider = new GoogleAuthProvider()

// Helper to safely get auth and db instances
const getServices = () => {
  const auth = getAuth_()
  const db = getDb()
  if (!auth || !db) {
    throw new Error('Firebase services not initialized. Please check your configuration.')
  }
  return { auth, db }
}

export const authService = {
  // Register user with email and password
  async register(email: string, password: string, userData: Partial<User>): Promise<User> {
    const { auth, db } = getServices()
    
    // Create Firebase auth user
    const { user: authUser } = await createUserWithEmailAndPassword(auth, email, password)

    // Store user data in Firestore with userId as document ID
    const userDocRef = doc(db, USERS_COLLECTION, authUser.uid)
    await setDoc(userDocRef, {
      ...userData,
      email,
      uid: authUser.uid,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      authMethod: 'email',
    })

    return {
      id: authUser.uid,
      email,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User
  },

  // Google Sign-Up/Sign-In
  async signInWithGoogle(): Promise<{ user: FirebaseUser; isNewUser: boolean }> {
    try {
      const { auth, db } = getServices()
      
      console.log('Starting Google Sign-In...')
      
      // Ensure auth and db are initialized
      if (!auth) {
        throw new Error('Firebase Auth not initialized. Please refresh the page.')
      }
      if (!db) {
        throw new Error('Firestore not initialized. Please refresh the page.')
      }

      console.log('Opening Google Sign-In popup...')
      const result = await signInWithPopup(auth, googleProvider)
      const authUser = result.user
      
      console.log('Google Sign-In successful, user:', authUser.uid)

      // Check if user exists in Firestore
      const userDocRef = doc(db, USERS_COLLECTION, authUser.uid)
      const userDocSnap = await getDoc(userDocRef)
      const isNewUser = !userDocSnap.exists()

      console.log('User is new:', isNewUser)

      if (isNewUser) {
        // Create user profile in Firestore for new Google users with uid as document ID
        const displayName = authUser.displayName || 'User'
        const nameParts = displayName.split(' ')
        const firstName = nameParts[0] || ''
        const lastName = nameParts.slice(1).join(' ') || ''

        console.log('Creating user profile...', { firstName, lastName, email: authUser.email })

        await setDoc(userDocRef, {
          uid: authUser.uid,
          email: authUser.email,
          firstName,
          lastName,
          // store both for compatibility, but user-facing code uses profilePhoto
          photoURL: authUser.photoURL,
          profilePhoto: authUser.photoURL,
          role: 'student', // Default role for Google sign-up
          department: '',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          authMethod: 'google',
        })
        
        console.log('User profile created successfully')
      }

      console.log('Google Sign-In flow complete')
      return { user: authUser, isNewUser }
    } catch (error: any) {
      console.error('Google Sign-In error:', error.code, error.message)
      
      if (error.code === 'auth/popup-blocked') {
        throw new Error('Sign-in popup was blocked by your browser. Please allow popups and try again.')
      }
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled. Please try again.')
      }
      if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('Sign-in was cancelled. Please try again.')
      }
      if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your internet connection and try again.')
      }
      
      throw new Error(error.message || 'Google sign-in failed. Please try again.')
    }
  },

  // Login user with email and password
  async login(email: string, password: string): Promise<FirebaseUser> {
    const { auth } = getServices()
    
    const { user } = await signInWithEmailAndPassword(auth, email, password)
    return user
  },

  // Logout user
  async logout(): Promise<void> {
    const { auth } = getServices()
    
    await signOut(auth)
  },

  // Get user data from Firestore
  async getUserData(uid: string): Promise<User | null> {
    const { db } = getServices()
    
    const userDocRef = doc(db, USERS_COLLECTION, uid)
    const userDocSnap = await getDoc(userDocRef)

    if (!userDocSnap.exists()) return null
    
    const data = userDocSnap.data()
    // some user docs may have photoURL property from Google signup,
    // normalize to profilePhoto field matching our User type
    if (data.photoURL && !data.profilePhoto) {
      data.profilePhoto = data.photoURL
    }

    return {
      id: userDocSnap.id,
      ...data,
    } as User
  },

  // Subscribe to auth changes
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    const { auth } = getServices()
    
    return onAuthStateChanged(auth, callback)
  },

  // Get current user
  getCurrentUser(): FirebaseUser | null {
    const { auth } = getServices()
    
    return auth.currentUser
  },

  // Demo login for development/testing purposes only
  async loginWithDemo(demoAccount: { email: string; password: string }): Promise<FirebaseUser> {
    // Only allow demo login in development mode
    if (process.env.NODE_ENV !== 'development') {
      throw new Error('Demo login is only available in development mode')
    }

    const { auth } = getServices()
    console.log('🎭 Demo login with:', demoAccount.email)
    
    try {
      const { user } = await signInWithEmailAndPassword(auth, demoAccount.email, demoAccount.password)
      console.log('✅ Demo login successful:', user.email)
      return user
    } catch (error: any) {
      console.error('🎭 Demo login error code:', error.code)
      
      // If demo account doesn't exist, provide helpful error
      // Note: Firebase returns auth/invalid-credential for both user-not-found and wrong-password for security
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        console.warn('⚠️ Demo account not found in Firebase')
        console.warn('Email:', demoAccount.email)
        console.warn('This means the demo accounts haven\'t been created yet.')
        console.warn('\nTo fix this, run: node setup-demo-accounts.js')
        console.warn('\nOr manually create accounts in Firebase Console with:')
        console.warn('Email: ' + demoAccount.email)
        console.warn('Password: ' + demoAccount.password)
        throw new Error(
          `Demo account "${demoAccount.email}" not found. Please run: node setup-demo-accounts.js`
        )
      }
      throw error
    }
  },
}
