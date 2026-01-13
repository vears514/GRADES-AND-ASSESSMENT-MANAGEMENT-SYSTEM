# Google Authentication - Quick Reference

## 🔑 Key Integration Points

### Authentication Service
**File:** `src/services/authService.ts`

```typescript
// Sign in with Google
const { user, isNewUser } = await authService.signInWithGoogle()

// Sign in with email/password
const user = await authService.login(email, password)

// Register with email/password
const user = await authService.register(email, password, userData)

// Sign out
await authService.logout()

// Get current user
const currentUser = authService.getCurrentUser()

// Get user profile from Firestore
const profile = await authService.getUserData(uid)

// Listen to auth changes
authService.onAuthStateChanged((user) => {
  // User state changed
})
```

## 🎨 UI Components

### Login Page
- **Path:** `/login`
- **Features:** Email/password login, Google sign-in
- **Button:** "Continue with Google"

### Register Page  
- **Path:** `/register`
- **Features:** Email/password registration, Google sign-up
- **Button:** "Sign up with Google"

## 📊 Firestore Structure

### Users Collection
```
users/
  └─ {docId}
     ├─ uid: string (Google user ID)
     ├─ email: string
     ├─ firstName: string
     ├─ lastName: string
     ├─ photoURL: string (Google avatar)
     ├─ role: 'student' | 'faculty' | 'registrar'
     ├─ department: string
     ├─ authMethod: 'email' | 'google'
     ├─ createdAt: timestamp
     └─ updatedAt: timestamp
```

## 🔧 Configuration

### Environment Variables (.env.local)
```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### Firebase Setup
1. ✅ Google provider enabled in Firebase Console
2. ✅ OAuth consent screen configured
3. ✅ Test users added (for development)

## 🚀 Usage Examples

### In a React Component
```typescript
'use client'

import { useState, useEffect } from 'react'
import { authService } from '@/services/authService'

export default function MyComponent() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        authService.getUserData(firebaseUser.uid).then(setUser)
      } else {
        // User is signed out
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) return <div>Loading...</div>

  if (!user) return <div>Please sign in</div>

  return <div>Welcome, {user.firstName}!</div>
}
```

### Handle Google Sign-In
```typescript
const handleGoogleSignIn = async () => {
  try {
    const { user, isNewUser } = await authService.signInWithGoogle()
    
    if (isNewUser) {
      console.log('New user created:', user.email)
    } else {
      console.log('Existing user signed in:', user.email)
    }
    
    // Redirect to dashboard
    router.push('/dashboard')
  } catch (error) {
    console.error('Sign-in failed:', error.message)
  }
}
```

## 🐛 Debugging

### Check if user is authenticated
```typescript
const currentUser = authService.getCurrentUser()
console.log('Current user:', currentUser)
```

### View user profile in Firestore
```typescript
const profile = await authService.getUserData(currentUser.uid)
console.log('User profile:', profile)
```

### Monitor auth state changes
```typescript
authService.onAuthStateChanged((user) => {
  console.log('Auth state changed:', user)
})
```

## ⚠️ Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| Popup blocked | Browser security | Allow popups for localhost |
| User not in Firestore | Profile creation failed | Check Firestore rules |
| CORS error | API misconfiguration | Verify API key in console |
| Invalid credentials | Wrong .env variables | Update .env.local |

## 📱 Test Credentials

### Development Testing
- Use your own Google account
- Add yourself as test user in Firebase Console
- Google authentication popup may appear

## 🔗 Important Links

- **Firebase Console:** https://console.firebase.google.com/project/gradehub-beltran
- **Google Cloud Console:** https://console.cloud.google.com
- **Firebase Docs:** https://firebase.google.com/docs/auth/web/google-signin

## ✅ Checklist for Production

- [ ] Google OAuth consent screen configured
- [ ] Authorized redirect URIs set in Google Cloud
- [ ] Firestore security rules configured
- [ ] Production environment variables set
- [ ] Email verification implemented
- [ ] Password reset functionality added
- [ ] User profile completion flow created
- [ ] Error handling tested
- [ ] Load testing performed
- [ ] Security review completed

---

**Last Updated:** January 4, 2026  
**Status:** ✅ Implementation Complete
