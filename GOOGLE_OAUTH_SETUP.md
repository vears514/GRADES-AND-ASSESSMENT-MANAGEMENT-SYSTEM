# Google OAuth Configuration & Troubleshooting Guide

## Issue Fixed: Google Auth Keeps Loading

The issue was caused by **Firestore rules being incompatible** with how user profiles were being created during Google Sign-In.

### Root Cause
- The Firestore rules require the document ID to match the user's UID
- The code was using `addDoc()` which creates auto-generated document IDs
- This caused a permission denied error that silently hung the login process

### Solution Applied
✅ Changed from `addDoc()` to `setDoc()` with user's UID as document ID
✅ Added comprehensive console logging for debugging
✅ Improved error messages and handling
✅ Added better initialization checks

## 🔧 Firebase Console Configuration Required

### Step 1: Enable Google OAuth Provider
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **gradehub-beltran**
3. Navigate to **Authentication** → **Sign-in method**
4. Click **Google**
5. Enable it and save
6. Ensure a support email is configured

### Step 2: Configure Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Find your **OAuth 2.0 Client ID** (Web application)
5. Click on it and verify these **Authorized redirect URIs**:

```
http://localhost:3000
http://localhost:3001
http://localhost:3000/login
http://127.0.0.1:3000
http://127.0.0.1:3001
https://gradehub-beltran.firebaseapp.com
https://your-production-domain.com
```

6. Save changes

### Step 3: Configure OAuth Consent Screen
1. In Google Cloud Console, go to **APIs & Services** → **OAuth consent screen**
2. Select **External** and click **Create**
3. Fill in:
   - **App name**: GradeHub
   - **User support email**: your-email@example.com
   - **Developer contact**: your-email@example.com
4. Add required scopes:
   - `https://www.googleapis.com/auth/userinfo.profile`
   - `https://www.googleapis.com/auth/userinfo.email`
5. Complete and save

### Step 4: Verify Firestore Rules
Ensure your firestore.rules has this for the users collection:

```firestore
match /users/{userId} {
  allow create: if isSignedIn() && request.auth.uid == userId
                && (request.resource.data.role == 'student' || !('role' in request.resource.data))
                && request.resource.data.email == request.auth.token.email;
                
  allow read: if isSignedIn() && (
                request.auth.uid == userId ||
                isAdmin() ||
                isRegistrar()
              );
              
  allow update: if isSignedIn() && (
                  isAdmin() ||
                  (request.auth.uid == userId && !('role' in request.resource.data) && resource.data.role == request.resource.data.role)
                );
                
  allow delete: if isSignedIn() && isAdmin();
}
```

Deploy rules with:
```bash
firebase deploy --only firestore:rules
```

## 🧪 Testing Google Auth

### Local Testing
1. Start the dev server:
```bash
npm run dev
```

2. Go to `http://localhost:3000/login`

3. Click "Sign in with Google"

4. Complete the OAuth flow

5. **Check Browser Console** (F12 → Console tab) for debug logs:
```
Starting Google Sign-In...
Opening Google Sign-In popup...
Google Sign-In successful, user: [uid]
User is new: [true/false]
Creating user profile...
User profile created successfully
Google Sign-In flow complete
```

### Expected Flow
1. ✅ Google popup opens
2. ✅ User selects/logs in with Google account
3. ✅ Popup closes
4. ✅ Console shows "Google Sign-In successful"
5. ✅ User profile created in Firestore
6. ✅ Redirect to dashboard

## 🐛 Troubleshooting

### Problem: "Popup is blocked"
**Solutions:**
- Check browser popup blocker settings
- Whitelist `gradehub-beltran.firebaseapp.com`
- Try in incognito mode
- Use Firefox if Chrome blocks it

### Problem: "Sign-in was cancelled"
**Solutions:**
- Ensure you completed the Google login flow
- Check if OAuth screen shows all permissions
- Verify Google Cloud OAuth credentials are correct

### Problem: "Firebase not initialized"
**Solutions:**
- Check `.env.local` has all required variables
- Verify API key is correct
- Clear browser cache and reload
- Check browser console for specific Firebase errors

### Problem: User profile not created in Firestore
**Solutions:**
- Check Firestore rules allow the create operation
- Verify database is in production mode
- Check browser console for "Permission denied" error
- Open DevTools → Network tab → look for failed requests
- Ensure `NEXT_PUBLIC_FIREBASE_PROJECT_ID` matches your Firebase project

### Problem: "Network error"
**Solutions:**
- Check internet connection
- Verify API keys are valid
- Check if Firebase API is down: https://status.firebase.google.com
- Try disabling VPN/proxy if used

## 📋 Environment Variables Checklist

Your `.env.local` must contain:

```ini
# ✅ Your current configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyABHS1sA2fprqrnkD1iR2GelXh4oN3nWOs
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=gradehub-beltran.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=gradehub-beltran
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=gradehub-beltran.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=313204491488
NEXT_PUBLIC_FIREBASE_APP_ID=1:313204491488:web:2cfaa051c44baa9e03bc85
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## 🔍 Debug Checklist

When testing Google OAuth, verify:

- [ ] Browser console shows no errors
- [ ] OAuth popup appears when clicking button
- [ ] Google login screen shows
- [ ] "Starting Google Sign-In..." log appears
- [ ] "Google Sign-In successful" log appears
- [ ] No "Permission denied" errors in console
- [ ] New user document appears in Firestore `users` collection
- [ ] User is redirected to dashboard (or profile-setup for new users)
- [ ] Refreshing page keeps user logged in
- [ ] Logout button clears the session

## 📊 Firestore User Document Example

After successful Google Sign-In, your Firestore should have:

```json
{
  "users": {
    "[USER_UID]": {
      "uid": "[USER_UID]",
      "email": "user@gmail.com",
      "firstName": "John",
      "lastName": "Doe",
      "photoURL": "https://lh3.googleusercontent.com/...",
      "role": "student",
      "department": "",
      "createdAt": "2026-01-16T...",
      "updatedAt": "2026-01-16T...",
      "authMethod": "google"
    }
  }
}
```

## 🚀 Production Deployment

Before deploying to production:

1. [ ] Update `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` if using custom domain
2. [ ] Add production domain to Google OAuth redirect URIs
3. [ ] Test Google OAuth on staging environment
4. [ ] Configure HTTPS (required for OAuth)
5. [ ] Update OAuth consent screen to production
6. [ ] Deploy Firestore rules to production
7. [ ] Test all authentication flows in production

## 📞 Additional Resources

- [Firebase Google Auth Docs](https://firebase.google.com/docs/auth/web/google-signin)
- [Google OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)
- [Firebase Console](https://console.firebase.google.com)
- [Google Cloud Console](https://console.cloud.google.com)
- [Browser DevTools Guide](https://developer.chrome.com/docs/devtools/)

## ✅ What Changed in the Code

| File | Change | Reason |
|------|--------|--------|
| `src/services/authService.ts` | Use `setDoc()` instead of `addDoc()` with UID as document ID | Firestore rules require document ID to match auth UID |
| `src/services/authService.ts` | Added comprehensive console logging | Better debugging for OAuth flow |
| `src/services/authService.ts` | Improved error handling with specific error codes | More helpful error messages |
| `src/app/login/page.tsx` | Added error state reset | Prevent error message persistence |
| `src/app/login/page.tsx` | Added console logging | Track user actions |
| `src/lib/firebase.ts` | Added Firebase config validation | Catch missing environment variables early |

