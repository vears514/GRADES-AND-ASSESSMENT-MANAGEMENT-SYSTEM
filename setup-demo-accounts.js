/**
 * Setup Demo Accounts for Development
 * 
 * This script creates demo user accounts in Firebase Auth and Firestore
 * Run with: node setup-demo-accounts.js
 */

require('dotenv').config({ path: '.env.local' })
const admin = require('firebase-admin')

// Initialize Firebase Admin
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Try to get service account key
let serviceAccount
try {
  serviceAccount = require('./serviceAccountKey.json')
} catch (e) {
  console.warn('⚠️  serviceAccountKey.json not found')
  console.log('To setup demo accounts, you need to:')
  console.log('1. Go to Firebase Console')
  console.log('2. Project Settings → Service Accounts')
  console.log('3. Generate new private key')
  console.log('4. Save as serviceAccountKey.json in project root')
  process.exit(0)
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
})

const auth = admin.auth()
const db = admin.firestore()

const DEMO_ACCOUNTS = {
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

async function setupDemoAccounts() {
  console.log('🎭 Setting up demo accounts...\n')

  for (const [key, account] of Object.entries(DEMO_ACCOUNTS)) {
    try {
      // Create Firebase Auth user
      console.log(`Creating ${key} account...`)
      const userRecord = await auth.createUser({
        email: account.email,
        password: account.password,
        displayName: `${account.firstName} ${account.lastName}`,
      })

      console.log(`✅ Auth user created: ${userRecord.uid}`)

      // Create Firestore profile
      await db.collection('users').doc(userRecord.uid).set({
        uid: userRecord.uid,
        email: account.email,
        firstName: account.firstName,
        lastName: account.lastName,
        role: account.role,
        department: account.department,
        photoURL: '',
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
        authMethod: 'email',
      })

      console.log(`✅ Firestore profile created`)
      console.log(`   Email: ${account.email}`)
      console.log(`   Password: ${account.password}`)
      console.log(`   Role: ${account.role}\n`)
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log(`⚠️  ${account.email} already exists, skipping...\n`)
      } else {
        console.error(`❌ Error creating ${key} account:`, error.message)
      }
    }
  }

  console.log('🎭 Demo account setup complete!')
  console.log('\nYou can now login with:')
  console.log('- Student: student@demo.com / DemoPass123!')
  console.log('- Faculty: faculty@demo.com / DemoPass123!')
  console.log('- Registrar: registrar@demo.com / DemoPass123!')

  process.exit(0)
}

setupDemoAccounts().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
