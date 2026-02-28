# Firebase Database Integration - Quick Setup Guide

## Current Status
✅ Firebase web credentials configured  
❌ Firebase Admin SDK key (service account) needed  
🔧 Database seeding script ready  

---

## Step 1: Get Firebase Service Account Key

Run this interactive setup helper:

```bash
npm run setup-service-account
```

This will guide you through:
1. Opening Firebase Console
2. Navigating to Service Accounts
3. Generating a private key
4. Saving it to your project

**OR do it manually:**

1. Go to: https://console.firebase.google.com
2. Select project: **gradehub-beltran**
3. Click ⚙️ → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Save the JSON file as `serviceAccountKey.json` in project root

---

## Step 2: Add to .gitignore

Make sure this file is NEVER committed:

```bash
# .gitignore
serviceAccountKey.json
```

Check if it's already there:
```bash
grep -i "serviceAccountKey" .gitignore
```

---

## Step 3: Seed the Database

Now you can initialize Firebase with sample data:

```bash
npm run seed-db
```

This creates:
- ✅ 7 test users (admin, faculty, registrar, students)
- ✅ 3 sample courses
- ✅ 6 student enrollments
- ✅ 4 sample grades
- ✅ System settings

---

## Step 4: Verify in Firebase Console

Check that data was created:

1. Go to Firebase Console → Firestore Database
2. Check these collections:
   - `users` - 7 documents
   - `courses` - 3 documents
   - `enrollments` - 6 documents
   - `grades` - 4 documents
   - `settings` - 4 documents

---

## Expected Output

```
[2026-02-10T...] ✅ Firebase initialized with project: gradehub-beltran
[2026-02-10T...] Starting database seeding...
[2026-02-10T...] ========================================
[2026-02-10T...] Seeding users collection...
[2026-02-10T...] ✓ Created 7/7 users
[2026-02-10T...] Seeding courses collection...
[2026-02-10T...] ✓ Created 3/3 courses
[2026-02-10T...] Seeding enrollments collection...
[2026-02-10T...] ✓ Created 6/6 enrollments
[2026-02-10T...] Seeding grades collection...
[2026-02-10T...] ✓ Created 4/4 grades
[2026-02-10T...] Seeding settings collection...
[2026-02-10T...] ✓ Created 4/4 settings
[2026-02-10T...] Creating initial audit log...
[2026-02-10T...] ✓ Created audit log: xyz123
[2026-02-10T...] ========================================
[2026-02-10T...] ✓ Database seeding completed successfully!
```

---

## Available Test Accounts

After seeding, you can login with these accounts:

| Email | Password | Role |
|-------|----------|------|
| admin@gams.edu | \* | Admin |
| professor.smith@gams.edu | \* | Faculty |
| registrar@gams.edu | \* | Registrar |
| alice.brown@student.gams.edu | \* | Student |
| bob.wilson@student.gams.edu | \* | Student |

\* You'll need to set passwords in Firebase Auth Console

---

## Troubleshooting

### Error: "serviceAccountKey.json not found"

**Solution:**
```bash
npm run setup-service-account
```

### Error: "Firebase project ID not set"

**Solution:** Check `.env.local` has this line:
```
FIREBASE_PROJECT_ID=gradehub-beltran
```

### Error: "Failed to initialize Firebase"

**Solution:** Verify the service account key is valid JSON:
```bash
node -e "console.log(JSON.parse(require('fs').readFileSync('serviceAccountKey.json')))"
```

### Data not appearing in Firestore

**Solution:** Check Firebase Console → Firestore Database is initialized

---

## Advanced Commands

```bash
# Validate Firebase setup
npm run setup-firebase

# Deploy security rules
npm run firebase:deploy:rules

# Deploy indexes
npm run firebase:deploy:indexes

# Deploy everything
npm run firebase:deploy

# Start Firebase emulator (local testing)
npm run firebase:emulate
```

---

## Next Steps

After seeding is complete:

1. ✅ Start development server: `npm run dev`
2. ✅ Test login with seeded accounts
3. ✅ Verify data appears in app
4. ✅ Deploy security rules: `npm run firebase:deploy:rules`
5. ✅ Begin Phase 1 implementation

---

## Security Checklist

Before production:

- [ ] serviceAccountKey.json in .gitignore
- [ ] Never commit service account key
- [ ] Rotate keys regularly
- [ ] Use environment variables for key path
- [ ] Enable Firestore backups
- [ ] Review security rules before deployment

---

## Documentation

- [Firebase Configuration Guide](./FIREBASE_CONFIGURATION_GUIDE.md)
- [Implementation Checklist](./FIREBASE_IMPLEMENTATION_CHECKLIST.md)
- [Database Integration Plan](./FIREBASE_DATABASE_INTEGRATION_PLAN.md)
- [Firebase Console](https://console.firebase.google.com)

---

**Status:** Ready to seed database  
**Last Updated:** February 10, 2026
