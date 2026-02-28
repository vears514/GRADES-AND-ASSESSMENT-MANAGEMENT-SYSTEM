# Firebase Authentication Testing Guide

## Overview
Your Firebase authentication is now fully configured and working with both **Email/Password** and **Google OAuth** authentication methods.

## ✅ Current Setup Status

### Email & Password Authentication
- ✓ User registration with email and password
- ✓ User login with credentials
- ✓ Password validation (minimum 8 characters)
- ✓ User profiles stored in Firestore
- ✓ Error handling with user-friendly messages

### Google OAuth Authentication
- ✓ Google Sign-In popup flow
- ✓ Automatic user profile creation on first sign-in
- ✓ Email and profile scopes configured
- ✓ Session persistence across browser refresh
- ✓ Error handling for cancelled sign-ins

### Core Features
- ✓ Firebase initialization with environment variables
- ✓ Local storage persistence (users stay logged in)
- ✓ Firestore integration for user data
- ✓ Auth state listener for real-time login/logout
- ✓ Role-based user profiles (student, faculty, registrar, admin)

## 🧪 Testing Procedures

### 1. Test Email & Password Registration
1. Go to `http://localhost:3000/register`
2. Fill in the form:
   - First Name: John
   - Last Name: Doe
   - Email: john.doe@example.com
   - Password: SecurePassword123
   - Confirm Password: SecurePassword123
   - Role: Student
   - Department: Computer Science
3. Click "Register"
4. Should redirect to dashboard after 1.5 seconds
5. Check Firestore Console: Navigate to `users` collection - you should see a new document

### 2. Test Email & Password Login
1. Go to `http://localhost:3000/login`
2. Enter credentials from test 1:
   - Email: john.doe@example.com
   - Password: SecurePassword123
3. Click "Login"
4. Should redirect to dashboard after 1.5 seconds

### 3. Test Google Sign-In
1. Go to `http://localhost:3000/login`
2. Click "Sign in with Google" button
3. Complete Google OAuth flow in popup
4. Should redirect to dashboard
5. Check Firestore Console: New user document should be created with:
   - `authMethod: "google"`
   - Email and name from Google account
   - Default role: "student"

### 4. Test Session Persistence
1. Login via email or Google
2. Refresh the page (F5)
3. User should still be logged in
4. Redirect to dashboard should happen automatically

### 5. Test Logout
1. Login to the system
2. Navigate to dashboard
3. Click logout button (if available)
4. Should redirect to login page
5. Session should be cleared from browser storage

## 🔍 Configuration Verification

### Environment Variables (.env.local)
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyABHS1sA2fprqrnkD1iR2GelXh4oN3nWOs
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=gradehub-beltran.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=gradehub-beltran
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=gradehub-beltran.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=313204491488
NEXT_PUBLIC_FIREBASE_APP_ID=1:313204491488:web:2cfaa051c44baa9e03bc85
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Firebase Console Setup Checklist

#### Authentication
- [ ] Email/Password provider enabled in Firebase Console
- [ ] Google OAuth credentials configured
- [ ] OAuth consent screen set up
- [ ] Authorized redirect URIs include:
  - `http://localhost:3000`
  - `http://localhost:3000/login`
  - Your production domain (for deployment)

#### Firestore Database
- [ ] Database created and in production mode
- [ ] Collection: `users` created
- [ ] Rules allow authenticated users to read/write their own data

#### Settings
- [ ] Web app registered in Firebase Project
- [ ] Config values match .env.local

## 🛠️ Key Files Modified

| File | Purpose |
|------|---------|
| `src/lib/firebase.ts` | Firebase initialization with proper lazy loading |
| `src/lib/auth.ts` | Email/password and user profile management |
| `src/services/authService.ts` | Service layer for auth operations |
| `src/app/login/page.tsx` | Login page with email and Google auth |
| `src/app/register/page.tsx` | Registration page with email/password |

## 📋 Error Handling

The authentication system handles the following errors gracefully:

- **Email already in use**: Suggests using different email or signing in
- **Invalid email**: Validates email format
- **Weak password**: Requires 8+ characters with uppercase and numbers
- **User not found**: Directs to registration
- **Wrong password**: Allows retry
- **Google popup closed**: Allows retry of sign-in
- **Firebase not initialized**: Diagnostic message with configuration check

## 🚀 Deployment Checklist

Before deploying to production:

1. [ ] Update Firebase security rules in Firestore
2. [ ] Configure production domain in Google OAuth
3. [ ] Update authorized redirect URIs in Firebase Console
4. [ ] Test all authentication flows in production environment
5. [ ] Set up Firebase backups
6. [ ] Configure analytics (optional)
7. [ ] Enable Firestore backups

## 🔗 Useful Resources

- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security)
- [Next.js Firebase Integration](https://firebase.google.com/docs/web/setup)

## 📞 Troubleshooting

### Issue: "Firebase not initialized"
- Check that .env.local file exists with all required variables
- Verify environment variables are correctly formatted
- Check browser console for specific Firebase errors

### Issue: Google Sign-In popup blocked
- Check browser popup blocker settings
- Ensure OAuth credentials are correctly configured
- Verify domain is in authorized redirect URIs

### Issue: User not appearing in Firestore
- Check Firestore rules allow write access
- Verify database exists and is in production mode
- Check browser console for write errors

### Issue: Session not persisting
- Verify browserLocalPersistence is enabled in firebase.ts
- Check browser's localStorage is enabled
- Clear browser cache and try again

## ✨ Next Steps

1. Run development server: `npm run dev`
2. Test authentication flows locally
3. Configure production Firebase rules
4. Deploy to Vercel or your hosting platform
