#!/usr/bin/env node

/**
 * Set Custom Claims for Firebase Users
 * 
 * This script sets custom claims on Firebase users to establish their role.
 * Custom claims are used in Firestore security rules for role-based access control.
 * 
 * Usage:
 *   node scripts/setCustomClaims.js <UID> <role>
 * 
 * Example:
 *   node scripts/setCustomClaims.js user123 admin
 *   node scripts/setCustomClaims.js user456 faculty
 *   node scripts/setCustomClaims.js user789 student
 * 
 * IMPORTANT: This script requires Firebase Admin SDK credentials
 * Make sure you have downloaded your service account key from Firebase Console:
 * 1. Go to Firebase Console > Project Settings > Service Accounts
 * 2. Generate a new private key
 * 3. Save as serviceAccountKey.json in the root directory
 * 4. Add serviceAccountKey.json to .gitignore
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Check if service account key exists
const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Error: serviceAccountKey.json not found');
  console.error('\nTo use this script:');
  console.error('1. Go to Firebase Console > Project Settings > Service Accounts');
  console.error('2. Click "Generate New Private Key"');
  console.error('3. Save the JSON file as serviceAccountKey.json in the project root');
  console.error('4. Add serviceAccountKey.json to .gitignore');
  process.exit(1);
}

// Initialize Firebase Admin SDK
const serviceAccount = require(serviceAccountPath);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'gradehub-beltran'
});

// Get command line arguments
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node scripts/setCustomClaims.js <UID> <role>');
  console.error('\nValid roles: admin, registrar, faculty, student');
  console.error('\nExample:');
  console.error('  node scripts/setCustomClaims.js user123 admin');
  process.exit(1);
}

const [uid, role] = args;
const validRoles = ['admin', 'registrar', 'faculty', 'student'];

if (!validRoles.includes(role)) {
  console.error(`❌ Invalid role: ${role}`);
  console.error(`Valid roles are: ${validRoles.join(', ')}`);
  process.exit(1);
}

// Set custom claims
async function setRole() {
  try {
    await admin.auth().setCustomUserClaims(uid, { role });
    console.log(`✅ Successfully set role "${role}" for user ${uid}`);
    
    // Also update the user document in Firestore
    await admin.firestore().collection('users').doc(uid).update({ role });
    console.log(`✅ Updated user document in Firestore`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting custom claims:', error.message);
    process.exit(1);
  }
}

setRole();
