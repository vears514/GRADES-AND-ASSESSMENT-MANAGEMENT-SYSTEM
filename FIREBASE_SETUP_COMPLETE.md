# 🔧 Firebase Database Integration - Complete Setup

## Problem
❌ Database seeding failed because Firebase service account key is missing

```
FirebaseAppError: Failed to parse service account json file
Error: ENOENT: no such file or directory
open 'serviceAccountKey.json'
```

---

## Solution Overview

### What You Have ✅
- Firebase web credentials configured in `.env.local`
- Next.js application ready
- Firebase Firestore database created
- Security rules configured
- Indexes created

### What You Need ❌
- **Firebase Admin SDK Service Account Key** (JSON file)
- This allows backend/server code to access Firebase with admin privileges

---

## 3-Step Setup Process

### **STEP 1: Download Service Account Key**

1. Open: **https://console.firebase.google.com**
2. Select project: **gradehub-beltran**
3. Click ⚙️ icon (top-left) → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Save the downloaded JSON file

**Expected filename:** `gradehub-beltran-xxxxx.json`

---

### **STEP 2: Add to Project**

Place the downloaded file in your project root:

```
GRADES-AND-ASSESSMENT-MANAGEMENT-SYSTEM/
├── serviceAccountKey.json    ← Place here
├── src/
├── package.json
├── next.config.js
└── ...
```

---

### **STEP 3: Seed Database**

Run:
```bash
npm run seed-db
```

This will:
- ✅ Initialize Firebase with Admin SDK
- ✅ Create 7 test users
- ✅ Create 3 sample courses
- ✅ Create 6 student enrollments
- ✅ Create 4 sample grades
- ✅ Configure system settings

---

## What Gets Created

After seeding, you'll have in Firestore:

```
Firestore Database
├── users/                    [7 documents]
│   ├── admin-001
│   ├── faculty-001
│   ├── faculty-002
│   ├── registrar-001
│   ├── student-001
│   ├── student-002
│   └── student-003
│
├── courses/                  [3 documents]
│   ├── CS-101-2024-FALL
│   ├── CS-201-2024-FALL
│   └── CS-301-2024-FALL
│
├── enrollments/              [6 documents]
│   ├── student-001_CS-101
│   ├── student-002_CS-101
│   ├── student-003_CS-101
│   ├── student-001_CS-201
│   ├── student-002_CS-201
│   └── student-003_CS-201
│
├── grades/                   [4 documents]
│   ├── grade-001
│   ├── grade-002
│   ├── grade-003
│   └── grade-004
│
└── settings/                 [4 documents]
    ├── grade-scale
    ├── grade-verification-timeout
    ├── bulk-upload-max-size
    └── notification-email-enabled
```

---

## Test Accounts After Seeding

You can use these to test your app:

| Email | Role | Password |
|-------|------|----------|
| admin@gams.edu | Admin | \*Set in Firebase Auth |
| professor.smith@gams.edu | Faculty | \*Set in Firebase Auth |
| professor.johnson@gams.edu | Faculty | \*Set in Firebase Auth |
| registrar@gams.edu | Registrar | \*Set in Firebase Auth |
| alice.brown@student.gams.edu | Student | \*Set in Firebase Auth |
| bob.wilson@student.gams.edu | Student | \*Set in Firebase Auth |
| carol.martinez@student.gams.edu | Student | \*Set in Firebase Auth |

---

## Security ⚠️

**CRITICAL: Add to .gitignore**

The service account key contains sensitive credentials. Never commit it to Git:

```bash
# .gitignore
serviceAccountKey.json
```

Verify it's ignored:
```bash
grep "serviceAccountKey" .gitignore
```

---

## File Structure After Setup

```
project/
├── serviceAccountKey.json        ← DO NOT COMMIT
├── .env.local                     ← Already configured ✅
├── firestore.rules                ← Security rules ✅
├── firestore.indexes.json         ← Indexes ✅
├── scripts/
│   ├── seedDatabase.js            ← Updated to work ✅
│   ├── setupServiceAccount.js     ← New helper ✅
│   └── setupFirebase.js           ✅
├── src/
│   ├── app/
│   ├── lib/
│   │   └── firebase.ts            ← Web credentials ✅
│   └── services/
└── ...
```

---

## Commands (Updated)

```bash
# Get help setting up service account
npm run setup-service-account

# Seed database with sample data
npm run seed-db

# Validate Firebase configuration
npm run setup-firebase

# Deploy security rules to Firebase
npm run firebase:deploy:rules

# Create Firestore composite indexes
npm run firebase:deploy:indexes

# Deploy everything
npm run firebase:deploy
```

---

## Workflow

```
1. Download serviceAccountKey.json
   ↓
2. Place in project root
   ↓
3. npm run seed-db
   ↓
4. Wait for completion
   ↓
5. Check Firestore Console for data
   ↓
6. npm run dev
   ↓
7. Test login with seeded accounts
```

---

## Troubleshooting

### Error: "serviceAccountKey.json not found"
**→** Download the file from Firebase Console and place in project root

### Error: "Invalid JSON"
**→** Make sure the file is valid JSON (check it opened correctly)

### Error: "Project ID not set"
**→** Verify `.env.local` has `FIREBASE_PROJECT_ID=gradehub-beltran`

### Error: "Permission denied"
**→** Check Firebase Firestore has security rules deployed

### Data not visible in app
**→** Refresh browser and check Firestore Console to verify data exists

---

## Next Steps

After successful seeding:

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Open app:**
   ```
   http://localhost:3000
   ```

3. **Test login** with one of the seeded accounts

4. **Verify data** appears in application

5. **Begin implementation** following the [FIREBASE_IMPLEMENTATION_CHECKLIST.md](./FIREBASE_IMPLEMENTATION_CHECKLIST.md)

---

## Documentation Reference

| Document | Purpose |
|----------|---------|
| [FIREBASE_QUICK_SETUP.md](./FIREBASE_QUICK_SETUP.md) | Quick start guide |
| [FIREBASE_CONFIGURATION_GUIDE.md](./FIREBASE_CONFIGURATION_GUIDE.md) | Detailed setup |
| [FIREBASE_IMPLEMENTATION_CHECKLIST.md](./FIREBASE_IMPLEMENTATION_CHECKLIST.md) | Phase-by-phase tasks |
| [FIREBASE_DATABASE_INTEGRATION_PLAN.md](./FIREBASE_DATABASE_INTEGRATION_PLAN.md) | Architecture & design |
| [FIREBASE_CONFIG_FILES_SUMMARY.md](./FIREBASE_CONFIG_FILES_SUMMARY.md) | Configuration overview |

---

## Status Checklist

- [ ] Firebase Console open
- [ ] Service account key downloaded
- [ ] File placed in project root as `serviceAccountKey.json`
- [ ] Added to `.gitignore`
- [ ] `npm run seed-db` executed
- [ ] Data visible in Firestore Console
- [ ] Dev server started: `npm run dev`
- [ ] Login tested with seeded account
- [ ] Data appears in application
- [ ] Ready for Phase 1 implementation

---

## Ready to Go! 🚀

Once you have the service account key and run `npm run seed-db`, your Firebase database will be:
- ✅ Connected to your Next.js app
- ✅ Populated with sample data
- ✅ Ready for feature development
- ✅ Configured with security rules
- ✅ Optimized with indexes

**Proceed with Phase 1 implementation!**

---

**Last Updated:** February 10, 2026  
**Status:** Ready for database integration
