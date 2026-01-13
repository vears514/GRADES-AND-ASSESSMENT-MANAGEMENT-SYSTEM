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
import { collection, addDoc, query, where, getDocs, Timestamp, getDoc, doc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { User } from '@/types'

const USERS_COLLECTION = 'users'
const googleProvider = new GoogleAuthProvider()

export const authService = {
  // Register user with email and password
  async register(email: string, password: string, userData: Partial<User>): Promise<User> {
    // Create Firebase auth user
    const { user: authUser } = await createUserWithEmailAndPassword(auth, email, password)

    // Store user data in Firestore
    const usersRef = collection(db, USERS_COLLECTION)
    const docRef = await addDoc(usersRef, {
      ...userData,
      email,
      uid: authUser.uid,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      authMethod: 'email',
    })

    return {
      id: docRef.id,
      email,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User
  },

  // Google Sign-Up/Sign-In
  async signInWithGoogle(): Promise<{ user: FirebaseUser; isNewUser: boolean }> {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const authUser = result.user

      // Check if user exists in Firestore
      const q = query(collection(db, USERS_COLLECTION), where('uid', '==', authUser.uid))
      const querySnapshot = await getDocs(q)
      const isNewUser = querySnapshot.empty

      if (isNewUser) {
        // Create user profile in Firestore for new Google users
        const usersRef = collection(db, USERS_COLLECTION)
        const [firstName, lastName] = (authUser.displayName || '').split(' ')

        await addDoc(usersRef, {
          uid: authUser.uid,
          email: authUser.email,
          firstName: firstName || '',
          lastName: lastName || '',
          photoURL: authUser.photoURL,
          role: 'student', // Default role for Google sign-up
          department: '',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          authMethod: 'google',
        })
      }

      return { user: authUser, isNewUser }
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled')
      }
      throw error
    }
  },

  // Login user with email and password
  async login(email: string, password: string): Promise<FirebaseUser> {
    const { user } = await signInWithEmailAndPassword(auth, email, password)
    return user
  },

  // Logout user
  async logout(): Promise<void> {
    await signOut(auth)
  },

  // Get user data from Firestore
  async getUserData(uid: string): Promise<User | null> {
    const q = query(collection(db, USERS_COLLECTION), where('uid', '==', uid))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) return null
    return {
      id: querySnapshot.docs[0].id,
      ...querySnapshot.docs[0].data(),
    } as User
  },

  // Subscribe to auth changes
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback)
  },

  // Get current user
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser
  },
}
