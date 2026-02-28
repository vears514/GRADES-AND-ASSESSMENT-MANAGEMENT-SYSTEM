# ⚡ Create Firestore Database - Quick Fix

## The Issue
✅ Firebase project exists: `gradehub-beltran`  
✅ Service account key connected  
✅ Users & Courses created successfully  
❌ **Firestore database hasn't been initialized yet**

---

## Solution in 60 Seconds

### Step 1: Go to Firebase Console
1. Visit: https://console.firebase.google.com
2. Select project: **`gradehub-beltran`**

### Step 2: Create Firestore Database
1. In left sidebar, find **"Firestore Database"**
2. Click **"Create Database"**
3. When prompted:
   - **Location**: Choose closest to you (or leave default)
   - **Security Rules**: Select **"Start in production mode"**
4. Click **"Create"**

⏳ **Wait 1-2 minutes** for database to initialize

### Step 3: Verify Creation
- You should see your database is now "Ready"
- You'll see an empty collection list

### Step 4: Run Seed Script Again
```bash
npm run seed-db
```

✅ All collections (enrollments, grades, settings) should now create successfully!

---

## Why This Fixes It

Firebase projects and Firestore databases are **separate**. Your:
- ✅ Firebase Project: Created
- ✅ Authentication enabled  
- ✅ Service account configured
- ❌ **Firestore Database: Never initialized**

When you create it, the NOT_FOUND errors disappear and all documents write successfully.

---

## After Database Creation

Once the seed completes successfully, you'll have:
- **7 test users** (admin, faculty, registrar, students)
- **3 courses** 
- **6 enrollments**
- **4 grades**
- **4 settings**
- **1 audit log entry**

Then deploy your security rules:
```bash
npm run firebase:deploy:rules
npm run firebase:deploy:indexes
```

Ready to start building! 🚀
