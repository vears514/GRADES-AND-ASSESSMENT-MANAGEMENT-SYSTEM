#!/usr/bin/env node
/**
 * Create Firebase Auth users for seeded test accounts
 * This creates authentication accounts for all the seeded Firestore users
 */

require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ serviceAccountKey.json not found. Please download from Firebase Console.');
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
  });
}

const auth = admin.auth();

// Test accounts to create in Firebase Auth
const TEST_ACCOUNTS = [
  {
    email: 'admin@gams.edu',
    password: 'Admin@12345',
    displayName: 'System Admin',
    uid: 'admin-001'
  },
  {
    email: 'professor.smith@gams.edu',
    password: 'Faculty@12345',
    displayName: 'Dr. John Smith',
    uid: 'faculty-001'
  },
  {
    email: 'professor.johnson@gams.edu',
    password: 'Faculty@12345',
    displayName: 'Dr. Emily Johnson',
    uid: 'faculty-002'
  },
  {
    email: 'registrar@gams.edu',
    password: 'Registrar@12345',
    displayName: 'Sarah Davis',
    uid: 'registrar-001'
  },
  {
    email: 'alice.brown@student.gams.edu',
    password: 'Student@12345',
    displayName: 'Alice Brown',
    uid: 'student-001'
  },
  {
    email: 'bob.wilson@student.gams.edu',
    password: 'Student@12345',
    displayName: 'Bob Wilson',
    uid: 'student-002'
  },
  {
    email: 'carlos.garcia@student.gams.edu',
    password: 'Student@12345',
    displayName: 'Carlos Garcia',
    uid: 'student-003'
  }
];

async function createAuthAccounts() {
  console.log('🔐 Creating Firebase Auth accounts for test users...\n');
  
  let successCount = 0;
  let errorCount = 0;

  for (const account of TEST_ACCOUNTS) {
    try {
      // Check if account already exists
      try {
        await auth.getUser(account.uid);
        console.log(`⚠️  Account already exists: ${account.email}`);
        continue;
      } catch (error) {
        if (error.code !== 'auth/user-not-found') {
          throw error;
        }
      }

      // Create new auth user
      await auth.createUser({
        uid: account.uid,
        email: account.email,
        password: account.password,
        displayName: account.displayName,
        emailVerified: false,
      });

      console.log(`✅ ${account.displayName}`);
      console.log(`   Email: ${account.email}`);
      console.log(`   Password: ${account.password}\n`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to create ${account.email}: ${error.message}`);
      errorCount++;
    }
  }

  console.log('=====================================');
  console.log(`✓ Created: ${successCount} accounts`);
  if (errorCount > 0) {
    console.log(`✗ Failed: ${errorCount} accounts`);
  }
  console.log('=====================================\n');

  console.log('🎉 All test accounts are ready to use!');
  console.log('Start the app with: npm run dev');
  console.log('Then login at: http://localhost:3000/login\n');

  process.exit(0);
}

createAuthAccounts().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
