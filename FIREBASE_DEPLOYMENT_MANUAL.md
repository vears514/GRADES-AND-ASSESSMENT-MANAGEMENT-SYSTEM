# Firebase Firestore Deployment Instructions

## Quick Start - Manual Deployment via Firebase Console

Since CLI authentication requires interactive browser access, here's how to deploy directly via the Firebase Console:

### Step 1: Deploy Security Rules
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your **gradehub-beltran** project
3. Navigate to **Firestore Database** > **Rules** tab
4. Click **Edit Rules**
5. Replace the content with [firestore.rules](./firestore.rules)
6. Click **Publish**

### Step 2: Create Indexes
1. In Firebase Console, go to **Firestore Database** > **Indexes** tab
2. Click **Create Composite Index**
3. Add each index from [firestore.indexes.json](./firestore.indexes.json):

#### Index 1: Grades - courseId + studentId
- Collection: `grades`
- Field 1: `courseId` (Ascending)
- Field 2: `studentId` (Ascending)

#### Index 2: Grades - studentId + createdAt
- Collection: `grades`
- Field 1: `studentId` (Ascending)
- Field 2: `createdAt` (Descending)

#### Index 3: Grades - courseId + createdAt
- Collection: `grades`
- Field 1: `courseId` (Ascending)
- Field 2: `createdAt` (Descending)

#### Index 4: Grades - studentId + assessmentId
- Collection: `grades`
- Field 1: `studentId` (Ascending)
- Field 2: `assessmentId` (Ascending)

#### Index 5: Courses - facultyId + createdAt
- Collection: `courses`
- Field 1: `facultyId` (Ascending)
- Field 2: `createdAt` (Descending)

---

## Alternative: CLI Deployment (If CLI Login Works)

If you can successfully authenticate:

```bash
# Login to Firebase
firebase login

# Deploy everything
firebase deploy --only firestore:rules,firestore:indexes

# Or deploy separately
firebase deploy --only firestore:rules      # Rules only
firebase deploy --only firestore:indexes    # Indexes only
```

---

## Verification Checklist

After deployment, verify everything is working:

### ✅ Rules Deployed
- [ ] Go to Firebase Console > Firestore > Rules
- [ ] Confirm your rules are showing (should mention users, courses, grades, etc.)
- [ ] Rules status should show "Published"

### ✅ Indexes Created
- [ ] Go to Firebase Console > Firestore > Indexes
- [ ] Should see 5 composite indexes
- [ ] All indexes should have status "Enabled" (may take 5-15 minutes to build)

### ✅ Test Rules with Emulator
```bash
npm run firebase:emulate
```
Then in another terminal:
```bash
npm run firebase:rules:test
```

---

## Setting Up User Roles

After rules are deployed, you need to assign roles to users:

### Method 1: Firebase Console (Quick for Testing)
1. Go to **Authentication** > Find user
2. Click the three dots > **Custom Claims**
3. Add:
```json
{"role": "admin"}
```
4. Save

Valid roles: `admin`, `registrar`, `faculty`, `student`

### Method 2: Service Account Script (For Production)
1. Download service account key from Project Settings > Service Accounts
2. Save as `serviceAccountKey.json` (in root, not in repo)
3. Add to `.gitignore`
4. Run:
```bash
npm run set-role <UID> admin
npm run set-role <UID> faculty
npm run set-role <UID> registrar
npm run set-role <UID> student
```

---

## Troubleshooting

### "Rules Deployment Failed"
- Check for syntax errors in `firestore.rules`
- Ensure all referenced collections are valid
- Copy rules content carefully from the file

### "Indexes Not Building"
- Indexes build automatically after creation
- Can take 5-15 minutes
- You can still deploy; queries will work but slower until indexed

### "Permission Denied" When Testing
- Verify user has custom claims set (role)
- Check rules logic matches your user's role
- Use Emulator UI (http://localhost:4000) to debug

### Firebase Console Not Showing New Rules
- Refresh the page
- Clear browser cache
- Wait a few seconds for rules to propagate

---

## Files Reference

| File | Purpose |
|------|---------|
| `firestore.rules` | Security rules - controls access to all collections |
| `firestore.indexes.json` | Index definitions for query performance |
| `firebase.json` | Firebase project configuration |
| `.firebaserc` | Firebase project aliases |
| `scripts/setCustomClaims.js` | Admin utility to set user roles |

---

## Next: Update Your Application

Once rules are deployed, update your app to use Firestore:

1. Create Firestore service in `src/services/firestoreService.ts`
2. Update API routes to use Firestore
3. Add Firestore listeners to React components
4. Implement initialization of users collection on registration

---

## Support

For detailed Firestore docs:
- [Security Rules](https://firebase.google.com/docs/firestore/security/start)
- [Indexes & Queries](https://firebase.google.com/docs/firestore/query-data/index-overview)
- [Custom Claims](https://firebase.google.com/docs/auth/admin-sdk-setup)
