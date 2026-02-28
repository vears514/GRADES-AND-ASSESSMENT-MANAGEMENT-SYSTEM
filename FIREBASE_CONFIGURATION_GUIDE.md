# Firebase Configuration & Setup Guide

This guide walks through the complete Firebase setup process for the Grades & Assessment Management System (GAMS).

## Quick Start

1. **Run validation script:**
   ```bash
   node scripts/setupFirebase.js
   ```

2. **Configure environment variables:**
   - Update `.env.local` with your Firebase project credentials
   - Add `serviceAccountKey.json` to project root (from Firebase Console)

3. **Deploy Firebase resources:**
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes
   ```

4. **Initialize database:**
   ```bash
   node scripts/seedDatabase.js
   ```

## Configuration Files

### 1. firestore.rules
**Location:** `firestore.rules`
**Purpose:** Firestore security rules for all collections
**Key Features:**
- Role-based access control (admin, faculty, registrar, student)
- Student grade privacy protection
- Faculty course ownership enforcement
- Registrar verification workflows
- Audit logging restrictions

**Deploy:**
```bash
firebase deploy --only firestore:rules
```

### 2. firestore.indexes.json
**Location:** `firestore.indexes.json`
**Purpose:** Composite indexes for optimized queries
**Included Indexes:**
- Grade queries (by course, verification status, date)
- Grade verification queries (by status, course)
- Grade correction queries (by status, filer)
- User queries (by role, department, status)
- Course queries (by department, semester)
- Enrollment queries (by student/course, status)
- Audit log queries (by user, resource, action, timestamp)
- Bulk upload queries (by uploader, status)
- Report queries (by type, course, date)
- Notification queries (by read status, date)
- Session queries (by user, active status)

**Deploy:**
```bash
firebase deploy --only firestore:indexes
```

## Environment Setup

### Required Environment Variables

Add these to `.env.local`:

```env
# Firebase Web Configuration (from Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (for server-side operations)
FIREBASE_ADMIN_SDK_KEY=path/to/serviceAccountKey.json
FIREBASE_SERVICE_ACCOUNT=path/to/serviceAccountKey.json

# Application Settings
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Getting Firebase Credentials

1. **Web Configuration:**
   - Go to Firebase Console → Project Settings → General Tab
   - Copy the config object values to `.env.local`

2. **Admin SDK Key:**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save as `serviceAccountKey.json` in project root
   - Add to `.gitignore` (it contains secret keys!)

## Database Schema

The system uses 12 Firestore collections:

### Collections Overview

```
Firestore Database
├── users/                    # User accounts with roles
├── courses/                  # Course definitions
├── enrollments/              # Student course enrollments
├── grades/                   # Individual grade records
├── gradeVerifications/       # Grade verification status tracking
├── gradeCorrections/         # Student grade appeal/correction requests
├── bulkUploads/              # Bulk grade upload operations
├── notifications/            # User notifications (subcollection)
├── auditLogs/                # Compliance audit trail
├── reports/                  # Generated reports
├── emailLogs/                # Email delivery logs
└── settings/                 # System-wide configuration
```

## Security Rules Hierarchy

### Role-Based Access Control

**Admin:**
- Full read/write access to all collections
- Can create, update, delete any resource
- Can view all audit logs

**Faculty:**
- Own their course definitions
- Create and update grades for enrolled students
- Respond to grade corrections
- Upload bulk grades
- View their course reports

**Registrar:**
- Read all user and enrollment data
- Create/update grade verifications
- Process bulk uploads
- View all reports
- Access full audit logs

**Student:**
- Read own profile
- Read own grades
- Read own enrollments
- File grade corrections
- View own notifications

### Key Security Features

1. **Data Isolation:** Students can only access their own grades
2. **Ownership Verification:** Faculty can only modify grades in their courses
3. **Audit Logging:** All administrative actions are logged
4. **Transaction Safety:** Multi-document updates use transactions
5. **Field-Level Protection:** Sensitive fields (timestamps, IDs) can't be modified in updates

## Deployment Steps

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase
```bash
firebase login
```

### Step 3: Select Project
```bash
firebase use --add
# Select your Firebase project
# Set alias as "production" or "development"
```

### Step 4: Deploy Security Rules
```bash
firebase deploy --only firestore:rules
```

### Step 5: Create Composite Indexes
```bash
firebase deploy --only firestore:indexes
```

### Step 6: Deploy Storage Rules (if applicable)
```bash
firebase deploy --only storage
```

### Step 7: Verify Deployment
```bash
firebase firestore:indexes --list
```

## Database Seeding

### Automatic Seeding

Run the seed script to populate sample data:

```bash
node scripts/seedDatabase.js
```

### What Gets Seeded

- **Users:** 1 admin, 2 faculty, 1 registrar, 3 students
- **Courses:** 3 computer science courses
- **Enrollments:** 6 student enrollments across courses
- **Grades:** 4 sample grades with various verification statuses
- **Settings:** Default grade scale, verification timeout, upload limits

### Manual Seeding

Use the seeding script in `scripts/seedDatabase.js` as reference for adding data programmatically:

```javascript
// Example: Add a new course
const courseData = {
  code: 'CS-101',
  name: 'Introduction to CS',
  facultyId: 'faculty-001',
  // ... other fields
};

await db.collection('courses').doc('CS-101-2024-FALL').set(courseData);
```

## Validation Script

### Running Configuration Validation

```bash
node scripts/setupFirebase.js
```

This checks:
- ✓ Environment variables in `.env.local`
- ✓ Required files present
- ✓ Directory structure correct
- ✓ npm dependencies installed
- ✓ Firebase configuration valid

### Common Issues

| Issue | Solution |
|-------|----------|
| `.env.local` not found | Run setupFirebase.js (creates template) |
| Environment variables missing | Update `.env.local` with Firebase credentials |
| `serviceAccountKey.json` error | Download from Firebase Console Settings |
| Deployment fails | Check Firebase CLI login with `firebase login` |
| Rules validation error | Review firestore.rules syntax |
| Indexes not created | Check Firestore console for pending indexes |

## Development Workflow

### Local Development

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Connect to Firebase emulator (optional):**
   ```bash
   firebase emulators:start
   ```

3. **Monitor Firestore in console:**
   - Firebase Console → Firestore Database
   - Real-time data viewing and testing

### Testing with Sample Data

1. **Seed database:**
   ```bash
   node scripts/seedDatabase.js
   ```

2. **Test accounts:**
   - Student: `alice.brown@student.gams.edu`
   - Faculty: `professor.smith@gams.edu`
   - Admin: `admin@gams.edu`
   - Registrar: `registrar@gams.edu`

## Advanced Configuration

### Custom Security Rules

Modify `firestore.rules` for specific requirements:

```javascript
// Example: Restrict grade updates to within 30 days
match /grades/{gradeId} {
  allow update: if isFaculty() &&
    (now - resource.data.createdAt) < duration.value(30, 'd');
}
```

### Additional Composite Indexes

Add to `firestore.indexes.json` for custom queries:

```json
{
  "collectionGroup": "grades",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "courseId", "order": "ASCENDING" },
    { "fieldPath": "studentId", "order": "ASCENDING" },
    { "fieldPath": "submittedAt", "order": "DESCENDING" }
  ]
}
```

### Performance Monitoring

Enable Firebase Performance Monitoring:

1. Go to Firebase Console → Performance
2. Follow setup instructions for your Next.js app
3. Monitor response times and page transitions

## Backup & Recovery

### Backup Firestore Data

```bash
firebase firestore:export backup/
```

### Restore from Backup

```bash
firebase firestore:import backup/
```

### Important Notes

- Always backup before major updates
- Backups include all collections and indexes
- Recovery doesn't restore authentication users

## Troubleshooting

### Common Problems

**"Permission denied" errors:**
- Check user role in `users` collection
- Verify security rules match user role requirements
- Check `verificationStatus` field exists for grades

**"Document not found" in rules:**
- Some documents may not exist yet
- Use `exists()` check in rules
- Initialize documents in seeding script

**Slow queries:**
- Check composite indexes are deployed
- Use firestore.indexes.json to add more indexes
- Monitor query patterns in Firestore console

**Firebase initialization errors:**
- Verify .env.local has all required variables
- Check serviceAccountKey.json file exists and is valid JSON
- Restart development server after env changes

## Additional Resources

- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/start)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

## Support

For issues with:
- **Firebase configuration:** Check Firebase Console
- **Security rules:** Review `firestore.rules` and test in console
- **Database schema:** See FIREBASE_INTEGRATION_PLANNING.md
- **Implementation:** See FIREBASE_IMPLEMENTATION_CHECKLIST.md
