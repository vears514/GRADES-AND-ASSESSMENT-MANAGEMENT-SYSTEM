# Grades & Assessment Management System (GAMS)

A comprehensive web-based platform for managing academic grades with multi-level verification, student portal, and advanced reporting.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm/yarn/pnpm
- Firebase project
- Git

### Installation

1. **Clone and navigate to project:**
```bash
cd d:\GRADES-AND-ASSESSMENT-MANAGEMENT-SYSTEM
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env.local
```

4. **Configure Firebase credentials in `.env.local`:**
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

5. **Start development server:**
```bash
npm run dev
```

Visit `http://localhost:3000`

## 📁 Project Structure

```
src/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   └── grades/               # Grade management endpoints
│   ├── (auth)/                   # Public auth routes
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/                # Protected dashboard
│   │   ├── faculty/              # Faculty routes
│   │   │   ├── grades/page.tsx
│   │   │   └── submissions/page.tsx
│   │   ├── registrar/            # Registrar routes
│   │   ├── student/              # Student routes
│   │   ├── admin/                # Admin routes
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── components/                   # Reusable React components
│   ├── Layout/
│   ├── Auth/
│   ├── GradeEntry/
│   ├── Verification/
│   └── Common/
│
├── services/                     # Business logic
│   ├── authService.ts           # Authentication service
│   ├── gradeService.ts          # Grade management service
│   └── verificationService.ts   # Verification service
│
├── lib/                          # Utilities
│   ├── firebase.ts              # Firebase initialization
│   ├── validators.ts            # Zod validators
│   └── utils.ts                 # Helper functions
│
├── types/                        # TypeScript definitions
│   └── index.ts
│
├── styles/                       # Global styles
│   └── globals.css
│
└── hooks/                        # Custom React hooks

public/                           # Static assets
firebase/                         # Firebase configuration

```

## 🔑 Features Implemented

### ✅ Completed
- [x] Landing page with feature showcase
- [x] Login/Register pages with form validation
- [x] Dashboard layout with navigation
- [x] Grade entry interface with table
- [x] API routes for grades and auth
- [x] Firestore service integration
- [x] TypeScript type definitions
- [x] Tailwind CSS styling
- [x] Error handling utilities
- [x] Form validation with Zod

### 🚧 In Progress / TODO
- [ ] Firebase authentication integration
- [ ] Firestore database rules
- [ ] Grade verification dashboard
- [ ] Bulk upload functionality
- [ ] Student grade viewer
- [ ] Correction request workflow
- [ ] Reporting and analytics
- [ ] User management (admin)
- [ ] Email notifications
- [ ] Audit logging

## 📦 Available Scripts

### Development
```bash
npm run dev              # Start development server
npm run type-check      # Check TypeScript types
npm run lint            # Run ESLint
npm run format          # Format code with Prettier
```

### Production
```bash
npm run build           # Build for production
npm start              # Start production server
```

## 🔐 Authentication

### Demo Credentials (after Firebase setup)
- **Faculty**: faculty@demo.com / demo123
- **Registrar**: registrar@demo.com / demo123
- **Student**: student@demo.com / demo123
- **Admin**: admin@demo.com / demo123

## 🗄️ Database Schema (Firestore)

### Collections

#### `users`
```
- id: string
- email: string
- firstName: string
- lastName: string
- role: 'faculty' | 'registrar' | 'student' | 'admin'
- department: string
- profilePhoto?: string
- createdAt: timestamp
- updatedAt: timestamp
```

#### `grades`
```
- id: string
- courseId: string
- studentId: string
- score: number (0-100)
- letterGrade: string (A-F)
- status: 'draft' | 'submitted' | 'verified' | 'approved'
- submittedBy: string
- verifiedBy?: string
- createdAt: timestamp
- updatedAt: timestamp
```

#### `courses`
```
- id: string
- code: string
- name: string
- department: string
- instructor: string
- semester: string
- credits: number
- students: string[]
- createdAt: timestamp
```

#### `gradeCorrectionRequests`
```
- id: string
- gradeId: string
- studentId: string
- currentGrade: number
- proposedGrade: number
- reason: string
- status: 'pending' | 'approved' | 'rejected'
- approvals: Approval[]
- createdAt: timestamp
```

## 🎨 Design System

### Colors
- **Primary**: #3B82F6 (Blue)
- **Secondary**: #10B981 (Green)
- **Danger**: #EF4444 (Red)
- **Warning**: #F59E0B (Orange)
- **Neutral**: #6B7280 (Gray)

### Typography
- **Headings**: Bold, -0.01em letter spacing
- **Body**: Regular, 1.5 line height
- **Font**: Inter / System fonts

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub:**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Connect to Vercel:**
- Go to [Vercel](https://vercel.com)
- Import GitHub repository
- Add environment variables
- Deploy

### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init
firebase deploy
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Grades
- `POST /api/grades/encode` - Create grade
- `GET /api/grades/courses/:courseId` - Get course grades
- `PUT /api/grades/:id` - Update grade
- `DELETE /api/grades/:id` - Delete grade

### Verification
- `GET /api/grades/verification` - Get pending grades
- `PUT /api/grades/:id/verify` - Verify grade

## 🧪 Testing

### Run tests
```bash
npm test
```

### Run specific test
```bash
npm test -- specific-test.spec.ts
```

## 📚 Documentation

- [PROJECT_PLAN.md](./PROJECT_PLAN.md) - Project overview and scope
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture and design
- [MODULE_SPECIFICATIONS.md](./MODULE_SPECIFICATIONS.md) - Detailed module specs
- [UI_UX_WIREFRAMES.md](./UI_UX_WIREFRAMES.md) - Design guidelines
- [ERROR_HANDLING_SPECS.md](./ERROR_HANDLING_SPECS.md) - Error handling standards
- [EMAIL_TEMPLATES.md](./EMAIL_TEMPLATES.md) - Email notification templates
- [SEARCH_FILTER_SORT_STANDARDS.md](./SEARCH_FILTER_SORT_STANDARDS.md) - Search implementation

## 🐛 Troubleshooting

### Build errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Firebase connection issues
- Verify `NEXT_PUBLIC_FIREBASE_*` environment variables
- Check Firestore security rules
- Ensure Firebase project is active

### Port already in use
```bash
# Use different port
npm run dev -- -p 3001
```

## 📞 Support

For issues or questions:
1. Check existing documentation
2. Review error messages in browser console
3. Check Firebase console for service status
4. Create an issue in the repository

## 📄 License

MIT License - See [LICENSE](./LICENSE) file

## 👥 Team

- **Developer**: Implementation in progress
- **Documentation**: Complete
- **Design**: Based on wireframes in UI_UX_WIREFRAMES.md

## 🗓️ Roadmap

### Phase 1 (Current)
- ✅ Project setup
- ✅ Basic UI structure
- ✅ Landing page
- ✅ Auth pages
- 🚧 Firebase integration

### Phase 2
- [ ] Grade encoding module
- [ ] Verification dashboard
- [ ] Student portal
- [ ] Reporting

### Phase 3
- [ ] Admin panel
- [ ] Correction workflows
- [ ] Advanced analytics
- [ ] Mobile app

---

**Last Updated**: December 17, 2025  
**Status**: Active Development 🚀
