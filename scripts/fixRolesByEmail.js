#!/usr/bin/env node

/**
 * Repair Firebase user roles by email address.
 *
 * Usage:
 *   node scripts/fixRolesByEmail.js admin@example.com:admin student@example.com:student
 */

require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const VALID_ROLES = ['admin', 'registrar', 'faculty', 'student'];

function resolveServiceAccountPaths() {
  const candidates = [
    path.join(__dirname, '../serviceAccountKey.json'),
    path.join(__dirname, '../gradehub-beltran-firebase-adminsdk-fbsvc-be10c82a84.json'),
  ];

  return candidates.filter((candidate) => fs.existsSync(candidate));
}

function loadServiceAccount(pathname) {
  const raw = JSON.parse(fs.readFileSync(pathname, 'utf8'));
  // Some exported JSONs may contain escaped newlines in private_key.
  if (typeof raw.private_key === 'string' && raw.private_key.includes('\\n')) {
    raw.private_key = raw.private_key.replace(/\\n/g, '\n');
  }
  return raw;
}

async function initializeWorkingApp(candidates) {
  const initErrors = [];

  for (let index = 0; index < candidates.length; index += 1) {
    const pathname = candidates[index];
    const serviceAccount = loadServiceAccount(pathname);
    const appName = `fix-roles-${Date.now()}-${index}`;

    const app = admin.initializeApp(
      {
        credential: admin.credential.cert(serviceAccount),
        projectId:
          process.env.FIREBASE_PROJECT_ID ||
          process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
          serviceAccount.project_id,
      },
      appName
    );

    try {
      // Force token exchange now to verify this key is still valid.
      await app.auth().listUsers(1);
      console.log(`Using service account key: ${path.basename(pathname)} (${serviceAccount.private_key_id || 'unknown-kid'})`);
      return app;
    } catch (error) {
      const message = error?.message || String(error);
      initErrors.push(`${path.basename(pathname)}: ${message}`);
      console.warn(`Service account key failed: ${path.basename(pathname)} -> ${message}`);
      await app.delete().catch(() => {});
    }
  }

  throw new Error(
    `All service account keys failed.\n${initErrors.join('\n')}\n` +
    'Generate a new Firebase Admin SDK key in Firebase Console and save it as serviceAccountKey.json.'
  );
}

function parseRoleMappings(args) {
  if (!args.length) {
    throw new Error(
      'No mappings provided. Example: node scripts/fixRolesByEmail.js admin@example.com:admin student@example.com:student'
    );
  }

  return args.map((arg) => {
    const separatorIndex = arg.lastIndexOf(':');
    if (separatorIndex <= 0 || separatorIndex === arg.length - 1) {
      throw new Error(`Invalid mapping "${arg}". Expected format: email:role`);
    }

    const email = arg.slice(0, separatorIndex).trim().toLowerCase();
    const role = arg.slice(separatorIndex + 1).trim().toLowerCase();

    if (!VALID_ROLES.includes(role)) {
      throw new Error(`Invalid role "${role}" for ${email}. Valid roles: ${VALID_ROLES.join(', ')}`);
    }

    return { email, role };
  });
}

async function applyRole(email, role, app) {
  const auth = app.auth();
  const db = app.firestore();
  const userRecord = await auth.getUserByEmail(email);
  const uid = userRecord.uid;
  const claims = userRecord.customClaims || {};

  await auth.setCustomUserClaims(uid, { ...claims, role });

  // Primary profile doc (uid-based)
  await db.collection('users').doc(uid).set(
    {
      uid,
      email,
      role,
      updatedAt: new Date(),
    },
    { merge: true }
  );

  // Also update any existing docs keyed differently but with matching email
  const matchingProfiles = await db.collection('users').where('email', '==', email).get();
  for (const profileDoc of matchingProfiles.docs) {
    await profileDoc.ref.set(
      {
        role,
        updatedAt: new Date(),
      },
      { merge: true }
    );
  }

  console.log(`Updated ${email} -> ${role} (uid: ${uid})`);
}

async function main() {
  const serviceAccountPaths = resolveServiceAccountPaths();
  if (!serviceAccountPaths.length) {
    throw new Error(
      'No service account key found. Expected serviceAccountKey.json or gradehub-beltran-firebase-adminsdk-*.json in project root.'
    );
  }

  const roleMappings = parseRoleMappings(process.argv.slice(2));
  const app = await initializeWorkingApp(serviceAccountPaths);

  try {
    for (const mapping of roleMappings) {
      await applyRole(mapping.email, mapping.role, app);
    }

    console.log('Role repair completed.');
  } finally {
    await app.delete().catch(() => {});
  }
}

main().catch((error) => {
  console.error('Failed to repair roles:', error.message);
  process.exit(1);
});
