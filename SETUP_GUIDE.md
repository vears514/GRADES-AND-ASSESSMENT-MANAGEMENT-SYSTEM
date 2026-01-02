# Technical Setup & Configuration Guide

## 1. Prerequisites

### System Requirements
- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher (or yarn/pnpm)
- **Git**: 2.30.0 or higher
- **VS Code**: Latest version (recommended)

### Required Accounts
- Firebase Console (Google Cloud Project)
- Vercel Account
- GitHub Account (for version control)

---

## 2. Firebase Project Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create Project"
3. Name: `grades-assessment-system`
4. Enable Google Analytics (optional)
5. Create project

### Step 2: Enable Firebase Services

#### Authentication
```bash
1. Go to Authentication > Sign-in method
2. Enable Email/Password
3. Enable Google OAuth (optional)
4. Enable SSO (if using enterprise)
```

#### Firestore Database
```bash
1. Go to Firestore Database
2. Click "Create database"
3. Start in "Production mode"
4. Select region: (closest to your users)
5. Create database
```

#### Firebase Storage
```bash
1. Go to Storage
2. Click "Get started"
3. Create storage bucket (default location)
```

#### Cloud Functions (Optional)
```bash
1. Go to Functions
2. Create function for complex operations
3. Runtime: Node.js 18
```

### Step 3: Download Firebase Config

1. Go to Project Settings (gear icon)
2. Scroll to "Your apps"
3. Click "Web" icon
4. Register app
5. Copy Firebase SDK config

---

## 3. Local Development Setup

### Step 1: Clone & Initialize Project

```bash
# Create project directory
mkdir grades-assessment-system
cd grades-assessment-system

# Initialize Git
git init

# Create project structure
mkdir -p src/{app,components,lib,services,hooks,styles}
mkdir -p public/{images,documents}
mkdir -p firebase/functions
```

### Step 2: Initialize Next.js Project

```bash
# Using create-next-app
npx create-next-app@latest . --typescript --tailwind

# Or manual setup
npm init -y

# Install dependencies
npm install next react react-dom
```

### Step 3: Install Required Dependencies

```bash
# Firebase
npm install firebase firebase-admin

# UI & Styling
npm install -D tailwindcss postcss autoprefixer
npm install shadcn-ui

# Utilities
npm install axios zod zustand
npm install date-fns
npm install class-variance-authority clsx tailwind-merge

# Development
npm install -D typescript @types/node @types/react
npm install -D eslint eslint-config-next
npm install -D prettier

# Testing (optional)
npm install -D jest @testing-library/react @testing-library/jest-dom
npm install -D cypress
```

### Package.json Example

```json
{
  "name": "grades-assessment-system",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:e2e": "cypress open",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "firebase": "^10.0.0",
    "axios": "^1.6.0",
    "zustand": "^4.4.0",
    "zod": "^3.22.0",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "typescript": "^5.2.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.50.0",
    "eslint-config-next": "^14.0.0"
  }
}
```

### Step 4: Environment Configuration

Create `.env.local`:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (Backend only - use Firebase Admin SDK)
FIREBASE_ADMIN_SDK_KEY=your_admin_key_json_base64

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_ENV=development

# Feature Flags
NEXT_PUBLIC_ENABLE_BULK_UPLOAD=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

Create `.env.example` (commit to repo):

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

FIREBASE_ADMIN_SDK_KEY=

NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_ENV=development

NEXT_PUBLIC_ENABLE_BULK_UPLOAD=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

---

## 4. Firebase Configuration Files

### 4.1 Firestore Rules (`firebase/firestore.rules`)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    
    function isAdmin() {
      return isAuthenticated() && getUserRole() == 'admin';
    }
    
    function isRegistrar() {
      return isAuthenticated() && getUserRole() == 'registrar';
    }
    
    function isFaculty() {
      return isAuthenticated() && getUserRole() == 'faculty';
    }
    
    function isStudent() {
      return isAuthenticated() && getUserRole() == 'student';
    }

    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated() && 
                     (request.auth.uid == userId || isAdmin());
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if request.auth.uid == userId || isAdmin();
      allow delete: if isAdmin();
    }

    // Courses collection
    match /courses/{courseId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    // Grades collection
    match /grades/{gradeId} {
      allow read: if isAuthenticated() && 
                     (isAdmin() || isRegistrar() || 
                      resource.data.studentId == request.auth.uid ||
                      resource.data.facultyId == request.auth.uid);
      allow create: if isFaculty() && 
                       request.resource.data.facultyId == request.auth.uid;
      allow update: if isRegistrar() || 
                       (isFaculty() && resource.data.facultyId == request.auth.uid &&
                        resource.data.status == 'draft');
      allow delete: if isAdmin();
    }

    // Audit logs
    match /auditLogs/{logId} {
      allow read: if isAdmin();
      allow create: if isAuthenticated();
    }

    // Notifications
    match /notifications/{userId}/{notificationId} {
      allow read, update: if request.auth.uid == userId;
      allow create: if isAuthenticated();
    }
  }
}
```

### 4.2 Firebase Config (`src/lib/firebase.ts`)

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Enable emulators in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
  } catch (error) {
    // Emulators already initialized
  }
}

export default app;
```

---

## 5. Next.js Configuration

### 5.1 `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  images: {
    domains: ['storage.googleapis.com'],
    unoptimized: process.env.NODE_ENV === 'development',
  },

  env: {
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
  },

  headers: async () => {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=10, stale-while-revalidate=59',
          },
        ],
      },
    ];
  },

  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
```

### 5.2 `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "isolatedModules": true,
    "allowJs": true,
    
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/services/*": ["./src/services/*"],
      "@/hooks/*": ["./src/hooks/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### 5.3 `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      },
    },
  },
  plugins: [],
}
export default config
```

---

## 6. Running the Application

### Development Mode

```bash
# Start development server
npm run dev

# Application will be available at http://localhost:3000
```

### Firebase Emulator Suite (Local Development)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize emulators in project
firebase init emulators

# Start emulators
firebase emulators:start

# Emulator Suite UI: http://localhost:4000
```

### Production Build

```bash
# Create production build
npm run build

# Start production server
npm start
```

---

## 7. Deployment Configuration

### 7.1 Vercel Deployment

1. Connect GitHub repository to Vercel
2. Configure environment variables:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   ... (all public env vars)
   ```
3. Set build command: `npm run build`
4. Set start command: `npm start`

### 7.2 Firebase Deployment

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy functions
firebase deploy --only functions

# Deploy everything
firebase deploy
```

---

## 8. Development Workflow

### 8.1 Git Workflow

```bash
# Clone repository
git clone <repository-url>
cd grades-assessment-system

# Create feature branch
git checkout -b feature/module-name

# Make changes and commit
git add .
git commit -m "feat: add feature description"

# Push to remote
git push origin feature/module-name

# Create Pull Request on GitHub
```

### 8.2 Code Quality

```bash
# Run linting
npm run lint

# Run type checking
npm run type-check

# Format code with Prettier
npx prettier --write .
```

### 8.3 Testing

```bash
# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Watch mode
npm run test -- --watch
```

---

## 9. Project Structure Best Practices

```
grades-assessment-system/
├── public/
│   ├── images/
│   ├── documents/
│   └── fonts/
│
├── src/
│   ├── app/
│   │   ├── layout.tsx ............... Root layout
│   │   ├── page.tsx ................ Home page
│   │   ├── (auth)/ ................. Auth pages
│   │   ├── (dashboard)/ ............ Protected pages
│   │   └── api/ .................... API routes
│   │
│   ├── components/
│   │   ├── Layout/
│   │   ├── Auth/
│   │   ├── Grades/
│   │   ├── Common/
│   │   └── ui/
│   │
│   ├── lib/
│   │   ├── firebase.ts
│   │   ├── types.ts
│   │   ├── validators.ts
│   │   └── utils/
│   │
│   ├── services/
│   │   ├── authService.ts
│   │   ├── gradeService.ts
│   │   └── reportService.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useGrades.ts
│   │   └── useFetch.ts
│   │
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── ToastContext.tsx
│   │
│   └── styles/
│       └── globals.css
│
├── firebase/
│   ├── functions/
│   ├── firestore.rules
│   └── firebase.json
│
├── .github/
│   └── workflows/
│       ├── test.yml
│       └── deploy.yml
│
├── .env.example
├── .gitignore
├── .eslintrc.json
├── .prettierrc
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── README.md
├── PROJECT_PLAN.md
├── ARCHITECTURE.md
└── MODULE_SPECIFICATIONS.md
```

---

## 10. Security Checklist

- [ ] Firebase Security Rules configured
- [ ] Environment variables properly set
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented
- [ ] Data encryption at rest
- [ ] HTTPS enforced
- [ ] Password hashing (Firebase Auth handles this)
- [ ] Audit logging implemented

---

## 11. Monitoring & Logging

### Firebase Console Monitoring
- Real-time database activity
- Error tracking
- Performance metrics
- Usage analytics

### Vercel Monitoring
- Deployment logs
- Performance metrics
- Error reporting
- Analytics

### Application Logging
```typescript
// src/lib/logger.ts
export const log = (level: 'info' | 'warn' | 'error', message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, data);
  
  // Send to external logging service (e.g., Sentry)
  if (level === 'error') {
    // sendToErrorTracking(message, data);
  }
};
```

---

**Document Version**: 1.0  
**Last Updated**: December 17, 2025
