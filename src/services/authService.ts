import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth'
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { User } from '@/types'

const USERS_COLLECTION = 'users'

export const authService = {
  // Register user
  async register(email: string, password: string, userData: Partial<User>): Promise<User> {
    // Create Firebase auth user
    const { user: authUser } = await createUserWithEmailAndPassword(auth, email, password)

    // Store user data in Firestore
    const usersRef = collection(db, USERS_COLLECTION)
    const docRef = await addDoc(usersRef, {
      ...userData,
      email,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })

    return {
      id: docRef.id,
      email,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User
  },

  // Login user
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
    const q = query(
      collection(db, USERS_COLLECTION),
      where('id', '==', uid)
    )
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
