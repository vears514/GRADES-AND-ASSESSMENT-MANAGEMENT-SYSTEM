# 🎭 Demo Accounts - Firebase Setup & Troubleshooting

**Issue**: "Failed to get document because the client is offline"
**Solution**: Create demo accounts in Firebase, or use manual login

---

## ✅ Quick Fix (Choose One)

### Option A: Create Demo Accounts in Firebase (Recommended)

```bash
node setup-demo-accounts.js
```

**What it does**:
1. Creates 3 demo users in Firebase Auth
2. Creates profiles in Firestore
3. Demo buttons will work perfectly

**Requirements**: 
- `serviceAccountKey.json` in project root
- Get from Firebase Console → Project Settings → Service Accounts

### Option B: Manual Login (Works Now)

Don't want to setup Firebase accounts yet? **Use manual login**:

1. Email: `student@demo.com`
2. Password: `DemoPass123!`
3. Click "Sign In"

**Note**: Demo buttons require Firebase accounts. Manual login works the same way.

### Option C: Manual Firebase Setup

Create accounts directly in Firebase Console:

1. **Create Auth Users**:
   - Firebase Console → Authentication → Users
   - Click "Create user"
   - Add: `student@demo.com` / `DemoPass123!`
   - Add: `faculty@demo.com` / `DemoPass123!`
   - Add: `registrar@demo.com` / `DemoPass123!`
   - Note each UID

2. **Create Firestore Profiles**:
   - Firestore Database → users collection
   - Create document with ID = Auth UID
   - Add these fields:
     ```json
     {
       "uid": "[auth-uid-from-step-1]",
       "email": "student@demo.com",
       "firstName": "John",
       "lastName": "Student",
       "role": "student",
       "department": "Computer Science",
       "authMethod": "email",
       "createdAt": Timestamp.now(),
       "updatedAt": Timestamp.now()
     }
     ```

---

## 🔧 Getting serviceAccountKey.json

**Step 1**: Go to [Firebase Console](https://console.firebase.google.com)

**Step 2**: Select your project (gradehub-beltran)

**Step 3**: Click ⚙️ **Project Settings** (top left)

**Step 4**: Click **Service Accounts** tab

**Step 5**: Click **Generate New Private Key**

**Step 6**: Save the downloaded JSON file as `serviceAccountKey.json` in your project root:
```
GRADES-AND-ASSESSMENT-MANAGEMENT-SYSTEM/
├── serviceAccountKey.json  ← Save here
├── package.json
├── src/
└── ...
```

**Step 7**: Run setup script:
```bash
node setup-demo-accounts.js
```

---

## ✨ Expected Output

### Successful Setup
```
🎭 Setting up demo accounts...

Creating student account...
✅ Auth user created: abc123xyz456...
✅ Firestore profile created
   Email: student@demo.com
   Password: DemoPass123!
   Role: student

Creating faculty account...
✅ Auth user created: def456uvw789...
✅ Firestore profile created
   Email: faculty@demo.com
   Password: DemoPass123!
   Role: faculty

Creating registrar account...
✅ Auth user created: ghi789rst012...
✅ Firestore profile created
   Email: registrar@demo.com
   Password: DemoPass123!
   Role: registrar

🎭 Demo account setup complete!

You can now login with:
- Student: student@demo.com / DemoPass123!
- Faculty: faculty@demo.com / DemoPass123!
- Registrar: registrar@demo.com / DemoPass123!
```

---

## 🧪 Testing After Setup

### Test Demo Buttons
1. Go to `http://localhost:3001/login`
2. Scroll to "🎭 Demo Accounts (Development Only)"
3. Click any button:
   - 👨‍🎓 Student
   - 👨‍🏫 Faculty
   - 📋 Registrar
4. Should instantly login and redirect to dashboard ✅

### Test Manual Login
1. Enter email: `student@demo.com`
2. Enter password: `DemoPass123!`
3. Click "Sign In"
4. Should redirect to dashboard ✅

---

## 🐛 Troubleshooting

### Problem: Demo buttons show error message
**Error**: "Demo account 'student@demo.com' not found"

**Solution**:
```bash
node setup-demo-accounts.js
```

Run this to create the accounts in Firebase.

### Problem: "serviceAccountKey.json not found"
**Solution**:
1. Download it from Firebase Console (see instructions above)
2. Save in project root
3. Run `node setup-demo-accounts.js` again

### Problem: Still getting "offline" error
**Solution**:
1. Check internet connection
2. Verify `.env.local` has all Firebase credentials
3. Refresh the page
4. Check browser console (F12 → Console) for specific errors

### Problem: Demo buttons not appearing
**Solution**:
- Make sure you're in development mode: `npm run dev`
- Demo buttons only appear in development, not in production builds
- Refresh the page (Ctrl+Shift+R)

### Problem: Wrong password error
**Answer**: All demo accounts use: `DemoPass123!`

---

## 📋 Demo Account Details

### Student
```
Email: student@demo.com
Password: DemoPass123!
Role: student
Department: Computer Science
Name: John Student
```

### Faculty
```
Email: faculty@demo.com
Password: DemoPass123!
Role: faculty
Department: Computer Science
Name: Dr. Jane Faculty
```

### Registrar
```
Email: registrar@demo.com
Password: DemoPass123!
Role: registrar
Department: Administration
Name: Mike Registrar
```

---

## 🔄 Workflow Options

### Workflow 1: Full Setup (Recommended)
```
1. Get serviceAccountKey.json from Firebase
2. Run: node setup-demo-accounts.js
3. Start: npm run dev
4. Login: Click demo buttons
```

### Workflow 2: Manual Firebase Setup
```
1. Create accounts in Firebase Console Auth
2. Create profiles in Firestore
3. Start: npm run dev
4. Login: Click demo buttons
```

### Workflow 3: Manual Login (No Firebase Setup)
```
1. Start: npm run dev
2. Don't click demo buttons
3. Enter email/password manually
4. Will fail until accounts created
5. (Same as Workflow 1 or 2)
```

---

## 📂 Setup Script Details

**File**: `setup-demo-accounts.js`

**What it does**:
- Connects to Firebase using serviceAccountKey.json
- Creates 3 users in Firebase Auth
- Creates user profiles in Firestore
- Handles duplicate accounts gracefully
- Displays credentials for testing

**How to run**:
```bash
node setup-demo-accounts.js
```

**Error handling**:
- If account already exists: Skips it
- If serviceAccountKey.json missing: Shows instructions
- If Firebase error: Displays error message

---

## ✅ Checklist

**Before running setup script**:
- [ ] Downloaded `serviceAccountKey.json`
- [ ] Saved in project root
- [ ] Dev server running: `npm run dev`
- [ ] Can access: `http://localhost:3001/login`

**Running setup script**:
- [ ] Run: `node setup-demo-accounts.js`
- [ ] See success messages for all 3 accounts
- [ ] No errors displayed

**After setup**:
- [ ] Refresh login page
- [ ] Demo buttons appear
- [ ] Click one and login works
- [ ] Redirects to dashboard

---

## 🎯 Success Indicators

✅ **Setup Script Completes**:
```
✅ Auth user created: [uid]
✅ Firestore profile created
```

✅ **Demo Login Works**:
- Click demo button
- User redirects to dashboard
- Console shows: `"✅ Demo login successful"`

✅ **Manual Login Works**:
- Enter email + password
- Click Sign In
- User redirects to dashboard

✅ **Browser Console Clean**:
- No "offline" errors
- No "user-not-found" errors
- No Firebase errors

---

## 🚀 Common Commands

```bash
# Get serviceAccountKey.json and run setup
# (See instructions above)
node setup-demo-accounts.js

# Start development server
npm run dev

# Build for production (demo code excluded)
npm run build

# Check for TypeScript errors
npm run type-check
```

---

## 📞 Still Having Issues?

1. **Check browser console** (F12 → Console tab)
   - Look for specific Firebase error messages
   - Copy error code

2. **Verify Firebase setup**:
   - Project ID matches `.env.local`
   - API key is correct
   - Firestore database exists

3. **Verify Firestore Rules**:
   - Users collection exists
   - Rules allow authenticated writes
   - No permission denied errors

4. **Internet connection**:
   - Verify you can access Firebase
   - Check if VPN/proxy blocking Firebase
   - Disable VPN temporarily to test

---

## 🎉 Summary

**Three ways to get demo accounts working**:

1. **Easiest**: `node setup-demo-accounts.js` ← Start here
2. **Manual Firebase**: Create in Firebase Console
3. **Manual Login**: Use email/password input

**Next step**: Follow Option A above

**Time needed**: 5 minutes to complete setup

**Questions**: See troubleshooting section above

