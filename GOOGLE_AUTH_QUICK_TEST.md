# Quick Google Auth Testing Checklist

## Before Testing
- [ ] `.env.local` file exists with all Firebase credentials
- [ ] Firebase project has Google OAuth enabled
- [ ] OAuth credentials configured in Google Cloud Console
- [ ] Firestore rules deployed
- [ ] Port 3000 or 3001 is available

## To Run Dev Server
```bash
cd c:\Users\pbrya\Documents\GitHub\GRADES-AND-ASSESSMENT-MANAGEMENT-SYSTEM
npm run dev
```

Visit: `http://localhost:3000` (or 3001 if 3000 is in use)

## Test 1: Email & Password Registration
1. Go to `/register`
2. Fill form with:
   - First Name: John
   - Last Name: Doe
   - Email: test@example.com
   - Password: TestPassword123!
   - Confirm: TestPassword123!
   - Role: Student
   - Department: CS
3. Click Register
4. Should redirect to `/dashboard`
5. Check Firestore → users collection

## Test 2: Email & Password Login
1. Go to `/login`
2. Enter credentials from Test 1
3. Click Login
4. Should redirect to `/dashboard`

## Test 3: Google Sign-In (THE FIX)
1. Go to `/login`
2. Click "Sign in with Google"
3. **Watch browser console** for logs (F12 → Console)
4. Complete Google OAuth popup
5. Check for these logs:
   ```
   Starting Google Sign-In...
   Opening Google Sign-In popup...
   Google Sign-In successful, user: [some-uid]
   User is new: [true/false]
   Creating user profile...
   User profile created successfully
   Google Sign-In flow complete
   ```
6. Should redirect to `/dashboard` or `/dashboard/profile-setup`
7. Check Firestore → users → new document created

## Console Errors to Check
| Error | Solution |
|-------|----------|
| "popup-blocked" | Allow popups in browser |
| "popup-closed-by-user" | Complete OAuth flow |
| "Permission denied" | Check Firestore rules |
| "Firebase not initialized" | Check `.env.local` |
| "Network error" | Check internet connection |

## What Changed
✅ Google auth now creates user profile with UID as document ID
✅ Added debug logging throughout the flow
✅ Better error messages
✅ Firestore rules now compatible with the auth flow

## Browser DevTools
Open F12 and check:
- **Console tab** → Look for our debug logs
- **Network tab** → Check for failed API calls
- **Application tab** → Check localStorage/sessionStorage
- **Storage tab** → Check Firestore writes (if available)

## If Still Not Working
1. Clear browser cache: Ctrl+Shift+Delete
2. Check `.env.local` is in root directory
3. Verify Firebase project ID matches
4. Check Google Cloud OAuth credentials
5. Deploy Firestore rules: `firebase deploy --only firestore:rules`
6. Restart dev server: Stop (Ctrl+C) and run `npm run dev` again

## Files Modified
- `src/services/authService.ts` - Core auth logic fix
- `src/app/login/page.tsx` - Better error handling
- `src/lib/firebase.ts` - Validation & logging

All changes are backward compatible!
