# Getting Started - Next Steps

## 🚀 Quick Start Guide

### Step 1: Install Dependencies
```bash
cd d:\GRADES-AND-ASSESSMENT-MANAGEMENT-SYSTEM
npm install
```

### Step 2: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create Project"
3. Name: `grades-assessment-system`
4. Enable Google Analytics (optional)
5. Create project

### Step 3: Enable Firebase Services

#### Authentication
1. Go to **Authentication** → **Sign-in method**
2. Enable **Email/Password**
3. Save

#### Firestore Database
1. Go to **Firestore Database**
2. Click **Create database**
3. Start in **Production mode**
4. Select your region
5. Create

#### Firebase Storage
1. Go to **Storage**
2. Click **Get started**
3. Keep default settings
4. Create bucket

### Step 4: Get Firebase Config
1. Go to **Project Settings** (gear icon)
2. Scroll to **Your apps**
3. Click **Web** icon (</> symbol)
4. Register app
5. Copy the Firebase SDK config

### Step 5: Configure Environment Variables
Create `.env.local` in project root:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Step 6: Start Development Server
```bash
npm run dev
```

Visit: `http://localhost:3000`

---

## 📝 Demo Credentials

After setup, use these to create test accounts:

**Faculty Account**
- Email: faculty@demo.com
- Password: Demo123!@
- Role: Faculty
- Department: Computer Science

**Student Account**
- Email: student@demo.com
- Password: Demo123!@
- Role: Student
- Department: Computer Science

**Registrar Account**
- Email: registrar@demo.com
- Password: Demo123!@
- Role: Registrar
- Department: Academic Affairs

---

## 🗄️ Create Firestore Collections

Run these commands or create manually in Firebase Console:

### Collection: `users`
```json
{
  "id": "user_001",
  "email": "faculty@demo.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "faculty",
  "department": "Computer Science",
  "createdAt": "2025-12-17T00:00:00Z",
  "updatedAt": "2025-12-17T00:00:00Z"
}
```

### Collection: `courses`
```json
{
  "id": "course_001",
  "code": "COMP101",
  "name": "Introduction to Programming",
  "department": "Computer Science",
  "instructor": "user_001",
  "semester": "Fall 2025",
  "credits": 3,
  "students": ["student_001", "student_002"],
  "createdAt": "2025-12-17T00:00:00Z"
}
```

### Collection: `grades`
```json
{
  "id": "grade_001",
  "courseId": "course_001",
  "studentId": "student_001",
  "score": 85,
  "letterGrade": "A",
  "status": "draft",
  "submittedBy": "user_001",
  "createdAt": "2025-12-17T00:00:00Z",
  "updatedAt": "2025-12-17T00:00:00Z"
}
```

---

## 🔒 Firestore Security Rules

Add these rules in **Firestore** → **Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{document=**} {
      allow read, write: if request.auth != null;
    }

    // Courses collection
    match /courses/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      (request.auth.uid == resource.data.instructor || 
                       hasRole('admin'));
    }

    // Grades collection
    match /grades/{document=**} {
      allow read: if request.auth != null && 
                     (request.auth.uid == resource.data.studentId ||
                      hasRole('faculty') ||
                      hasRole('registrar') ||
                      hasRole('admin'));
      allow write: if request.auth != null && 
                      (hasRole('faculty') || hasRole('admin'));
    }

    // Helpers
    function hasRole(role) {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == role;
    }
  }
}
```

---

## 🧪 Testing the Application

### Test Login Page
```
URL: http://localhost:3000/login
Test: Try demo credentials or create new account via /register
```

### Test Grade Entry
```
URL: http://localhost:3000/dashboard/faculty/grades
Features: Edit score, filter by status, pagination
```

### Test Dashboard
```
URL: http://localhost:3000/dashboard
View: Stats cards, recent activity, quick actions
```

---

## 🐛 Troubleshooting

### Issue: "Cannot find module 'firebase'"
**Solution**: Run `npm install`

### Issue: Environment variables not loading
**Solution**: 
1. Restart dev server: `Ctrl+C` then `npm run dev`
2. Check `.env.local` syntax (no spaces)

### Issue: Firestore connection error
**Solution**:
1. Verify Firebase credentials in `.env.local`
2. Check Firestore is enabled in Firebase console
3. Check security rules allow access

### Issue: "Port 3000 already in use"
**Solution**: 
```bash
npm run dev -- -p 3001
```

---

## 📱 Available Pages

| URL | Purpose | Status |
|-----|---------|--------|
| / | Landing page | ✅ Ready |
| /login | Login page | ✅ Ready |
| /register | Registration | ✅ Ready |
| /dashboard | Dashboard home | ✅ Ready |
| /dashboard/faculty/grades | Grade entry | ✅ Ready |
| /dashboard/registrar/verification | Grade verification | 🚧 Coming |
| /dashboard/student/grades | Student grades | 🚧 Coming |
| /dashboard/admin/users | User management | 🚧 Coming |

---

## 💡 Tips for Development

### Hot Reload
- Changes to files automatically reload in browser
- No need to restart dev server

### Component Styling
- Use Tailwind classes: `className="bg-primary text-white"`
- Use custom utilities: `className="button-primary"`
- Reference `src/styles/globals.css`

### Adding New Pages
```bash
# Create new page
mkdir src/app/new-page
touch src/app/new-page/page.tsx

# Automatically available at /new-page
```

### Adding New API Routes
```bash
# Create new route
mkdir src/app/api/new-route
touch src/app/api/new-route/route.ts

# Automatically available at /api/new-route
```

---

## 📚 Documentation References

Read these in order:
1. `IMPLEMENTATION_GUIDE.md` - Complete setup
2. `PROJECT_PLAN.md` - Project scope
3. `ARCHITECTURE.md` - System design
4. `MODULE_SPECIFICATIONS.md` - Feature details
5. `UI_UX_WIREFRAMES.md` - Design guidelines

---

## 🎯 What's Next

After getting the app running:

1. **Test the flows**:
   - Register a new account
   - Login with account
   - Navigate dashboard
   - Edit grades

2. **Explore code**:
   - Look at `src/app/page.tsx`
   - Check `src/app/dashboard/page.tsx`
   - Review `src/services/gradeService.ts`

3. **Implement Phase 2**:
   - Add verification dashboard
   - Create bulk upload
   - Build student portal
   - Add reporting

---

## 🆘 Need Help?

1. Check console for errors: `F12` → Console tab
2. Review `IMPLEMENTATION_GUIDE.md`
3. Check [Next.js docs](https://nextjs.org)
4. Check [Firebase docs](https://firebase.google.com/docs)
5. Check [Tailwind docs](https://tailwindcss.com)

---

## ✅ Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Firebase project created
- [ ] Environment variables set (`.env.local`)
- [ ] Development server running (`npm run dev`)
- [ ] Can access `http://localhost:3000`
- [ ] Can navigate to `/login`
- [ ] Can navigate to `/register`
- [ ] Dashboard loads at `/dashboard`

---

**Ready to start!** 🚀

Run: `npm run dev`

Then visit: `http://localhost:3000`
