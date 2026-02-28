# 🎭 Demo Accounts for Testing

Demo accounts provide an easy way to test the application without creating new accounts manually. They are **only available in development mode** and work with both email/password and pre-created accounts.

---

## 📋 Available Demo Accounts

### Student Account
- **Email**: `student@demo.com`
- **Password**: `DemoPass123!`
- **Role**: Student
- **Department**: Computer Science

### Faculty Account
- **Email**: `faculty@demo.com`
- **Password**: `DemoPass123!`
- **Role**: Faculty (Instructor)
- **Department**: Computer Science

### Registrar Account
- **Email**: `registrar@demo.com`
- **Password**: `DemoPass123!`
- **Role**: Registrar (Admin)
- **Department**: Administration

---

## 🚀 Quick Start

### Option 1: One-Click Demo Login (Easiest)
1. Go to `http://localhost:3001/login`
2. Scroll down to "Demo Accounts (Development Only)" section
3. Click the role button you want to test:
   - 👨‍🎓 Student
   - 👨‍🏫 Faculty
   - 📋 Registrar
4. Instantly logged in! ✅

### Option 2: Manual Login
1. Go to `http://localhost:3001/login`
2. Enter email: `student@demo.com` (or faculty/registrar)
3. Enter password: `DemoPass123!`
4. Click "Sign In"
5. Logged in! ✅

---

## 🔧 Setting Up Demo Accounts in Firestore

Demo accounts need to exist in Firebase. Two ways to set them up:

### Method 1: Automatic Setup Script (Recommended)

**Prerequisites**:
- Firebase Admin SDK installed
- Service account key from Firebase Console

**Steps**:
1. Download service account key:
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save as `serviceAccountKey.json` in project root

2. Run setup script:
```bash
node setup-demo-accounts.js
```

3. Wait for confirmation:
```
✅ Firestore profile created
   Email: student@demo.com
   Password: DemoPass123!
   Role: student
```

### Method 2: Manual Setup in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click on your project
3. Go to **Authentication** → **Users**
4. Click "Create user"
5. Add each demo account:
   - Email: `student@demo.com`
   - Password: `DemoPass123!`
   - Click "Create user"
6. Repeat for faculty and registrar

7. Create Firestore documents:
   - Go to **Firestore Database**
   - Collection: `users`
   - Document ID: (Use the UID from Auth step above)
   - Add fields:
     ```json
     {
       "uid": "[user-uid]",
       "email": "student@demo.com",
       "firstName": "John",
       "lastName": "Student",
       "role": "student",
       "department": "Computer Science",
       "authMethod": "email",
       "createdAt": Timestamp,
       "updatedAt": Timestamp
     }
     ```

---

## 🎯 What Demo Accounts Can Do

Demo accounts work exactly like real accounts:
- ✅ Login and logout
- ✅ Access dashboard based on role
- ✅ View role-specific pages
- ✅ Full session persistence
- ✅ All features enabled

Demo accounts cannot:
- ✅ Create other users (restrictions apply)
- ✅ Delete accounts
- ✅ Change core settings (depends on permissions)

---

## 🔒 Security Features

### Development-Only
- Demo buttons **only appear in development mode** (`NODE_ENV === 'development'`)
- Production builds don't include demo login code
- No hardcoded passwords in production

### Email/Password Validation
- Demo accounts use real Firebase Auth
- Passwords are hashed and secured
- Same security as regular accounts

### Visible & Clear
- Demo section clearly labeled "🎭 Demo Accounts (Development Only)"
- Shows demo password hint
- No hidden functionality

---

## 📂 Implementation Details

### Files Involved

| File | Purpose |
|------|---------|
| `src/config/demoAccounts.ts` | Demo account definitions |
| `src/services/authService.ts` | `loginWithDemo()` method |
| `src/app/login/page.tsx` | Demo login UI buttons |
| `setup-demo-accounts.js` | Script to create accounts in Firebase |

### How It Works

```
1. User clicks demo button on login page
   ↓
2. handleDemoLogin() function called with role
   ↓
3. authService.loginWithDemo() uses email/password
   ↓
4. Firebase Auth validates credentials
   ↓
5. User logged in and redirected to dashboard
   ↓
6. Console shows: "🎭 Demo login attempt for role: student"
```

---

## 🧪 Testing Different Roles

### Test Student Access
1. Click "👨‍🎓 Student" button
2. Logged in as student
3. Should see student-specific views
4. Can view grades, transcripts

### Test Faculty Access
1. Click "👨‍🏫 Faculty" button
2. Logged in as faculty
3. Should see faculty-specific views
4. Can enter and manage grades

### Test Registrar Access
1. Click "📋 Registrar" button
2. Logged in as registrar
3. Should see registrar-specific views
4. Can verify and approve grades

---

## 🛠️ Troubleshooting

### Demo Buttons Not Showing
**Problem**: Demo account buttons don't appear on login page
**Solution**: 
- Check you're in development mode (`npm run dev`)
- Production builds exclude demo buttons
- Verify `NODE_ENV === 'development'`

### "Firebase not initialized" Error
**Problem**: Demo login throws initialization error
**Solution**:
- Ensure `.env.local` has all Firebase credentials
- Refresh the page
- Check browser console for specific errors

### "User not found" Error
**Problem**: Demo account exists in Auth but not in Firestore
**Solution**:
- Run `node setup-demo-accounts.js` to create Firestore profiles
- Or manually create documents in Firebase Console
- Ensure document ID matches the Auth UID

### Forgot Demo Password?
**Answer**: `DemoPass123!` for all demo accounts

---

## 📝 Example Usage

### Console Output During Demo Login
```
🎭 Demo login attempt for role: student
✅ Demo login successful: student@demo.com
🎭 Demo login with: {email: 'student@demo.com', password: 'DemoPass123!'}
```

### Firestore Demo User Document
```json
{
  "authMethod": "email",
  "createdAt": "2026-01-16T...",
  "department": "Computer Science",
  "email": "student@demo.com",
  "firstName": "John",
  "lastName": "Student",
  "role": "student",
  "uid": "abc123xyz456...",
  "updatedAt": "2026-01-16T..."
}
```

---

## ⚠️ Important Notes

### Never Use in Production
- Demo accounts are development-only
- Production builds automatically exclude demo functionality
- No security risk in production

### Testing Real Flows
- Demo accounts are great for rapid testing
- Use real email accounts for proper user testing
- Test sign-up/registration separately

### Multiple Logins
- Can switch between demo accounts anytime
- Just click different role button
- Automatically logs out previous user

---

## 🔄 Adding More Demo Accounts

To add additional demo accounts:

1. **Update `src/config/demoAccounts.ts`**:
```typescript
export const DEMO_ACCOUNTS = {
  // ... existing accounts
  admin: {
    email: 'admin@demo.com',
    password: 'DemoPass123!',
    role: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    department: 'Administration',
  },
}
```

2. **Update `src/app/login/page.tsx`**:
```tsx
<button onClick={() => handleDemoLogin('admin')} ...>
  🔒 Admin
</button>
```

3. **Create in Firebase**:
```bash
node setup-demo-accounts.js
```

---

## ✅ Checklist

- [x] Demo accounts defined in `demoAccounts.ts`
- [x] Login page shows demo buttons
- [x] Demo login handler added to authService
- [x] Only available in development mode
- [x] Setup script provided
- [x] Clear UI labeling
- [x] Password displayed in UI
- [x] Console logging for debugging

---

## 📞 Quick Reference

| Want to... | Do this |
|------------|---------|
| Create demo accounts | Run: `node setup-demo-accounts.js` |
| Test as student | Click "👨‍🎓 Student" button |
| Test as faculty | Click "👨‍🏫 Faculty" button |
| Test as registrar | Click "📋 Registrar" button |
| Use manual login | Enter email: `student@demo.com` |
| Find password | It's displayed under demo buttons |
| Add new demo role | Edit `demoAccounts.ts` |
| Disable demo mode | Comment out demo section in login page |

---

**Status**: ✅ Ready to use
**Development Only**: ✅ Yes
**Security**: ✅ Production-safe

