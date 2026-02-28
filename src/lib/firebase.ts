import { initializeApp } from 'firebase/app'
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Validate Firebase configuration
const validateFirebaseConfig = () => {
  const requiredFields = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ]

  const missingFields = requiredFields.filter(
    (field) => !process.env[field]
  )

  if (missingFields.length > 0) {
    console.warn(
      'Missing Firebase configuration:',
      missingFields.join(', '),
      'Please check your .env.local file'
    )
  }
}

validateFirebaseConfig()

// Initialize Firebase
let firebaseApp: any = null
let auth: any = null
let db: any = null
let storage: any = null
let initialized = false

const initializeFirebase = () => {
  if (initialized) {
    return { app: firebaseApp, auth, db, storage }
  }

  if (typeof window !== 'undefined') {
    try {
      firebaseApp = initializeApp(firebaseConfig)
      auth = getAuth(firebaseApp)
      db = getFirestore(firebaseApp)
      storage = getStorage(firebaseApp)
      initialized = true

      // Set persistence to LOCAL so users stay logged in across sessions
      setPersistence(auth, browserLocalPersistence)
        .then(() => {
          console.log('Firebase persistence enabled')
        })
        .catch((error) => {
          console.error('Error setting persistence:', error)
        })
    } catch (error: any) {
      console.error('Firebase initialization error:', error)
      if (error.code === 'app/invalid-api-key') {
        console.error('Invalid Firebase API key. Please check your .env.local file')
      }
    }
  }

  return { app: firebaseApp, auth, db, storage }
}

// Initialize on client-side load
if (typeof window !== 'undefined') {
  initializeFirebase()
}

// Export a function to get initialized services (for SSR safety)
export const getFirebaseServices = () => {
  if (!initialized && typeof window !== 'undefined') {
    initializeFirebase()
  }
  return { auth, db, storage }
}

// Export individual services with lazy initialization
export const getAuth_ = () => {
  if (!auth && typeof window !== 'undefined') {
    initializeFirebase()
  }
  return auth
}

export const getDb = () => {
  if (!db && typeof window !== 'undefined') {
    initializeFirebase()
  }
  return db
}

// For backward compatibility, export directly but they will be null until initialized
export { auth, db, storage }
export default firebaseApp
