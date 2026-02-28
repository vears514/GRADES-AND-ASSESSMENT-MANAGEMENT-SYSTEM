// Firebase Authentication handlers for GradeHub
import { getDb } from './firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
  AuthError,
} from 'firebase/auth'
import { getFirebaseServices } from './firebase'
import { setDoc, doc, getDoc } from 'firebase/firestore'
import { getAuth_ } from './firebase'

const googleProvider = new GoogleAuthProvider()

// Configure Google sign-in to request additional scopes
googleProvider.addScope('profile')
googleProvider.addScope('email')

export interface UserProfile {
  uid: string
  email: string
  firstName: string
  lastName: string
  role: 'student' | 'faculty' | 'registrar' | 'admin'
  department: string
  createdAt: Date
}

/**
 * Register user with email and password
 */
export const registerWithEmail = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  role: string,
  department: string
): Promise<{ user: User; profile: UserProfile }> => {
  try {
    const auth = getAuth_()
    const db = getDb()
    if (!auth || !db) throw new Error('Firebase not initialized')
    // Create user account
    const result = await createUserWithEmailAndPassword(auth, email, password)
    const user = result.user

    // Create user profile in Firestore
    const userProfile: UserProfile = {
      uid: user.uid,
      email,
      firstName,
      lastName,
      role: role as 'student' | 'faculty' | 'registrar' | 'admin',
      department,
      createdAt: new Date(),
    }

    await setDoc(doc(db, 'users', user.uid), userProfile)

    return { user, profile: userProfile }
  } catch (error: any) {
    throw new Error(getErrorMessage(error))
  }
}

/**
 * Sign in user with email and password
 */
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    const auth = getAuth_()
    if (!auth) throw new Error('Firebase not initialized')
    const result = await signInWithEmailAndPassword(auth, email, password)
    return result.user
  } catch (error: any) {
    throw new Error(getErrorMessage(error))
  }
}

/**
 * Sign in with Google
 */
export const signInWithGoogle = async (): Promise<{
  user: User
  profile?: UserProfile
}> => {
  try {
    const auth = getAuth_()
    const db = getDb()
    if (!auth || !db) throw new Error('Firebase not initialized')
    const result = await signInWithPopup(auth, googleProvider)
    const user = result.user

    // Check if user profile exists
    const userDocRef = doc(db, 'users', user.uid)
    const userDocSnap = await getDoc(userDocRef)

    if (!userDocSnap.exists()) {
      // Create new user profile for Google sign-in
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        firstName: user.displayName?.split(' ')[0] || 'User',
        lastName: user.displayName?.split(' ')[1] || '',
        role: 'student',
        department: '',
        createdAt: new Date(),
      }

      await setDoc(userDocRef, userProfile)
      return { user, profile: userProfile }
    }

    const profile = userDocSnap.data() as UserProfile
    return { user, profile }
  } catch (error: any) {
    throw new Error(getErrorMessage(error))
  }
}

/**
 * Sign out current user
 */
export const logOut = async (): Promise<void> => {
  try {
    const auth = getAuth_()
    if (!auth) throw new Error('Firebase not initialized')
    await signOut(auth)
  } catch (error: any) {
    throw new Error(getErrorMessage(error))
  }
}

/**
 * Subscribe to auth state changes
 */
export const onAuthChange = (callback: (user: User | null) => void) => {
  const auth = getAuth_()
  if (!auth) {
    console.error('Firebase auth not initialized')
    return () => {}
  }
  return onAuthStateChanged(auth, callback)
}

/**
 * Get current user profile from Firestore
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const db = getDb()
    if (!db) {
      console.error('Firebase database not initialized')
      return null
    }
    const userDocRef = doc(db, 'users', uid)
    const userDocSnap = await getDoc(userDocRef)

    if (userDocSnap.exists()) {
      return userDocSnap.data() as UserProfile
    }
    return null
  } catch (error: any) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

/**
 * Update user profile
 */
export const updateUserProfile = async (
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> => {
  try {
    const db = getDb()
    if (!db) throw new Error('Firebase not initialized')
    const userDocRef = doc(db, 'users', uid)
    await setDoc(userDocRef, updates, { merge: true })
  } catch (error: any) {
    throw new Error(getErrorMessage(error))
  }
}

/**
 * Convert Firebase error codes to user-friendly messages
 */
function getErrorMessage(error: AuthError): string {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'Email address is already registered. Please use a different email or sign in.'
    case 'auth/invalid-email':
      return 'Invalid email address. Please check and try again.'
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 8 characters with uppercase and numbers.'
    case 'auth/user-not-found':
      return 'No account found with this email. Please register first.'
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.'
    case 'auth/account-exists-with-different-credential':
      return 'An account with this email already exists with a different sign-in method.'
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed. Please try again.'
    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled. Please try again.'
    default:
      return error.message || 'Authentication failed. Please try again.'
  }
}
