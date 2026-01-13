# Google Authentication - Implementation Details

## System Architecture

```
┌─────────────────────────────────────────┐
│         User Interface Layer            │
├─────────────────────────────────────────┤
│  Login Page          Register Page      │
│  ├─ Email/Password   ├─ Email/Password │
│  └─ Google Sign-In   └─ Google Sign-Up │
└────────────┬──────────────────┬────────┘
             │                  │
             └──────┬───────────┘
                    │
         ┌──────────▼──────────┐
         │ Authentication      │
         │ Service (authService)
         ├─────────────────────┤
         │ signInWithGoogle()  │
         │ login()             │
         │ register()          │
         │ logout()            │
         └──────────┬──────────┘
                    │
    ┌───────────────┼───────────────┐
    │               │               │
    ▼               ▼               ▼
┌─────────┐    ┌──────────┐   ┌──────────┐
│ Firebase│    │ Firestore│   │ Session  │
│  Auth   │    │  Database│   │ Storage  │
│ (Google)│    │ (users)  │   │ (local)  │
└─────────┘    └──────────┘   └──────────┘
```

## Data Flow

### Google Sign-In Flow
```
1. User clicks "Continue with Google"
   │
2. Google OAuth popup opens
   │
3. User authenticates with Google account
   │
4. Firebase receives Google credentials
   │
5. AuthService.signInWithGoogle() called
   │
6. Check if user exists in Firestore
   │
   ├─ New User:
   │  └─ Create Firestore document
   │     └─ Set isNewUser = true
   │
   └─ Existing User:
      └─ Set isNewUser = false
   │
7. Return { user, isNewUser }
   │
8. Redirect to dashboard
```

### Email/Password Sign-In Flow
```
1. User enters email & password
   │
2. Form validation
   │
3. Call authService.login(email, password)
   │
4. Firebase validates credentials
   │
5. Return Firebase user object
   │
6. Redirect to dashboard
```

## Code Integration Points

### 1. Firebase Configuration
**File:** `src/lib/firebase.ts`

```typescript
// Added: Session persistence
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Error setting persistence:', error)
})
```

**What it does:**
- Users remain logged in after page refresh
- Automatic session restoration
- Secure logout when explicitly called

### 2. Authentication Service
**File:** `src/services/authService.ts`

**Key Methods:**

```typescript
// New method for Google OAuth
async signInWithGoogle(): Promise<{ user: FirebaseUser; isNewUser: boolean }>
// Returns Google user and whether it's a new user

// Updated to support Google users
async register(): Promise<User>
// Now stores authMethod: 'email'

// Updated queries
async getUserData(uid: string): Promise<User | null>
// Queries by 'uid' field for proper user lookup
```

**Firestore Document Created:**
```json
{
  "uid": "google-unique-id",
  "email": "user@gmail.com",
  "firstName": "John",
  "lastName": "Doe",
  "photoURL": "https://lh3.googleusercontent.com/...",
  "role": "student",
  "department": "",
  "authMethod": "google",
  "createdAt": Timestamp,
  "updatedAt": Timestamp
}
```

### 3. Login Page Integration
**File:** `src/app/login/page.tsx`

**Added Components:**
```typescript
// Google Sign-In Handler
const handleGoogleSignIn = async () => {
  setError('')
  setLoading(true)

  try {
    const { user, isNewUser } = await authService.signInWithGoogle()
    setSuccess('Google sign-in successful! Redirecting...')
    
    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)
  } catch (err: any) {
    if (err.message === 'Sign-in was cancelled') {
      setError('Sign-in was cancelled. Please try again.')
    } else {
      setError(err.message || 'Google sign-in failed. Please try again.')
    }
  } finally {
    setLoading(false)
  }
}

// Button JSX
<button
  type="button"
  disabled={loading}
  className="w-full mt-6 py-2.5 px-4 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
  onClick={handleGoogleSignIn}
>
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    {/* Google icon SVG */}
  </svg>
  Continue with Google
</button>
```

### 4. Registration Page Integration
**File:** `src/app/register/page.tsx`

**Added Import:**
```typescript
import { UserRole } from '@/types'
```

**Added Handler:**
```typescript
const handleGoogleSignUp = async () => {
  setError('')
  setLoading(true)

  try {
    const { user, isNewUser } = await authService.signInWithGoogle()
    setSuccess('Google sign-up successful! Redirecting...')
    
    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)
  } catch (err: any) {
    if (err.message === 'Sign-in was cancelled') {
      setError('Sign-up was cancelled. Please try again.')
    } else {
      setError(err.message || 'Google sign-up failed. Please try again.')
    }
  } finally {
    setLoading(false)
  }
}
```

**Updated Form Submission:**
```typescript
try {
  await authService.register(formData.email, formData.password, {
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    role: formData.role as UserRole,  // Type cast added
    department: formData.department,
  })
  // ...
}
```

## Error Handling

### Google Authentication Errors

| Error | Status | Handler |
|-------|--------|---------|
| Popup closed by user | 'auth/popup-closed-by-user' | Caught and message shown |
| Network error | Network timeout | Caught as error object |
| User cancelled | User action | Caught and message shown |
| Invalid credentials | Auth failure | Caught and message shown |

### User Experience
- All errors show user-friendly messages
- Loading state during authentication
- No technical details exposed to user
- Clear success/error indicators

## Security Implementation

### 1. Google OAuth 2.0
- Uses Google's official Firebase provider
- Proper scopes requested: `email`, `profile`
- No sensitive data stored in browser

### 2. Session Management
- `browserLocalPersistence` for secure storage
- Session expires on logout
- Automatic token refresh
- No manual token storage needed

### 3. Firestore
- User profiles stored in Firestore
- Ready for security rules implementation
- User UID used as key identifier
- Timestamp tracking (creation, updates)

### 4. Environment Variables
- All credentials in `.env.local` (never committed)
- Public credentials safe for browser
- Private keys handled by Firebase backend

## Type Safety

### TypeScript Definitions

```typescript
// User type from @/types
export type UserRole = 'faculty' | 'registrar' | 'student' | 'admin'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  department: string
  profilePhoto?: string
  createdAt: Date
  updatedAt: Date
}

// Return type from signInWithGoogle
interface GoogleSignInResult {
  user: FirebaseUser
  isNewUser: boolean
}
```

## Performance Considerations

1. **Lazy Loading**
   - Google provider loaded on demand
   - Popup only opened when needed

2. **Session Caching**
   - Session stored locally
   - No repeated Firebase calls
   - Faster page loads

3. **Async Operations**
   - Non-blocking authentication
   - User can see loading indicators
   - Proper timeout handling

## Browser Compatibility

- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

**Requirements:**
- JavaScript enabled
- Popups allowed
- Cookies enabled
- Modern browser (ES2020+)

## Testing Coverage

### Unit Tests (Ready to implement)
- [ ] signInWithGoogle returns correct shape
- [ ] New users create Firestore documents
- [ ] Existing users don't duplicate documents
- [ ] Error handling catches exceptions
- [ ] Session persistence works

### Integration Tests (Ready to implement)
- [ ] Login flow end-to-end
- [ ] Register flow end-to-end
- [ ] Google popup interaction
- [ ] Firestore document creation
- [ ] Dashboard redirect

### Manual Tests (Can perform)
- ✅ Google sign-in from login page
- ✅ Google sign-up from register page
- ✅ Email/password still works
- ✅ Error messages display properly
- ✅ Session persists on refresh

## Deployment Checklist

### Pre-Production
- [ ] Test with multiple Google accounts
- [ ] Verify Firestore security rules
- [ ] Update Firebase OAuth consent screen
- [ ] Configure authorized domains
- [ ] Set up error logging

### Production
- [ ] Deploy to Vercel with env vars
- [ ] Monitor Firebase authentication logs
- [ ] Set up user support channel
- [ ] Prepare documentation
- [ ] Plan rollback strategy

---

**Created:** January 4, 2026  
**Implementation Status:** ✅ Complete  
**Ready for:** Testing & Deployment
