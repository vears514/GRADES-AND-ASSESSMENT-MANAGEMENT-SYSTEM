import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Use direct property access so Next.js webpack can inline these at build time.
// Dynamic access like process.env[varName] does NOT work on the client side.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase (singleton pattern using Firebase's built-in getApps())
let firebaseApp: any = null
let auth: any = null
let db: any = null
let storage: any = null

const initializeFirebase = () => {
  if (typeof window === 'undefined') {
    // Don't initialize on the server
    return { app: null, auth: null, db: null, storage: null }
  }

  // If already initialized, return existing instances
  if (firebaseApp && auth && db) {
    return { app: firebaseApp, auth, db, storage }
  }

  try {
    // Use Firebase's built-in singleton: if an app already exists, reuse it
    firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
    auth = getAuth(firebaseApp)
    db = getFirestore(firebaseApp)
    storage = getStorage(firebaseApp)

    // Set persistence to LOCAL so users stay logged in across sessions
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        console.log('Firebase persistence enabled')
      })
      .catch((error) => {
        console.error('Error setting persistence:', error)
      })

    console.log('✅ Firebase initialized successfully')
  } catch (error: any) {
    console.error('Firebase initialization error:', error)
    // Reset to null so subsequent calls can retry
    firebaseApp = null
    auth = null
    db = null
    storage = null
  }

  return { app: firebaseApp, auth, db, storage }
}

// Initialize on client-side load
if (typeof window !== 'undefined') {
  initializeFirebase()
}

// Export a function to get initialized services (for SSR safety)
export const getFirebaseServices = () => {
  if (typeof window !== 'undefined' && (!firebaseApp || !auth || !db)) {
    initializeFirebase()
  }
  return { auth, db, storage }
}

// Export individual services with lazy initialization
export const getAuth_ = () => {
  if (typeof window !== 'undefined' && !auth) {
    initializeFirebase()
  }
  return auth
}

export const getDb = () => {
  if (typeof window !== 'undefined' && !db) {
    initializeFirebase()
  }
  return db
}

// For backward compatibility, export directly but they will be null until initialized
export { auth, db, storage }
export default firebaseApp
