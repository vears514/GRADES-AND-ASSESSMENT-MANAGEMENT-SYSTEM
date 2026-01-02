#!/bin/bash
# Grades & Assessment Management System - Quick Commands

## 🚀 Start Development

# Start Next.js dev server
npm run dev

# Start on different port
npm run dev -- -p 3001

# Start with production build
npm run build && npm run start


## 🔨 Development Tasks

# Format all code
npm run format

# Check TypeScript errors
npm run type-check

# Run linter
npm run lint

# Full type check
npm run type-check


## 📦 Dependencies

# Install all dependencies
npm install

# Install with legacy peer deps (if issues)
npm install --legacy-peer-deps

# Install specific package
npm install package-name

# Clean install
rm -rf node_modules package-lock.json
npm install


## 🧪 Testing (when added)

# Run tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run tests with coverage
npm run test -- --coverage


## 🚀 Deployment

# Build for production
npm run build

# Check build output
ls -la .next

# Deploy to Vercel
vercel deploy --prod


## 🔧 Utilities

# List installed packages
npm list

# Check for outdated packages
npm outdated

# Update packages
npm update

# Clean npm cache
npm cache clean --force


## 📁 Project Navigation

# Main source directory
cd src

# Pages and routes
cd src/app

# Backend services
cd src/services

# Utilities and helpers
cd src/lib

# Type definitions
cd src/types

# Global styles
cd src/styles


## 🌍 Environment

# Copy example env
cp .env.example .env.local

# Edit env file
# Add your Firebase credentials


## 📚 Documentation

# Open Getting Started guide
cat GETTING_STARTED.md

# Open Implementation guide
cat IMPLEMENTATION_GUIDE.md

# Open Project status
cat PROJECT_STARTUP_STATUS.md


## 🐛 Debugging

# Check Node version
node --version

# Check npm version
npm --version

# Check if port 3000 is in use (Windows)
netstat -ano | findstr :3000

# Check if port 3000 is in use (Mac/Linux)
lsof -i :3000

# Kill process on port 3000 (Mac/Linux)
kill -9 $(lsof -t -i :3000)


## 📊 Project Info

# Total files
find . -type f | grep -E "^./src" | wc -l

# Total lines of code
find ./src -name "*.ts" -o -name "*.tsx" | xargs wc -l

# File structure
tree src --charset ascii

# Size of project
du -sh .


## 🔐 Firebase

# Initialize Firebase (if needed)
firebase init

# Deploy to Firebase hosting
firebase deploy

# Check Firebase config
cat src/lib/firebase.ts


## 🚨 Error Fixes

# If npm install fails
npm install --legacy-peer-deps

# If port 3000 in use
npm run dev -- -p 3001

# If TypeScript errors
npm run type-check

# If build fails
rm -rf .next && npm run build

# Clear node_modules cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install


## 📱 Testing Routes

# Once app is running, test these URLs:

# Landing page
http://localhost:3000/

# Login
http://localhost:3000/login

# Register
http://localhost:3000/register

# Dashboard (protected)
http://localhost:3000/dashboard

# Grade entry (protected)
http://localhost:3000/dashboard/faculty/grades


## 🎯 API Endpoints

# Register user
POST http://localhost:3000/api/auth/register
Content-Type: application/json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "faculty",
  "department": "Computer Science"
}

# Login user
POST http://localhost:3000/api/auth/login
Content-Type: application/json
{
  "email": "user@example.com",
  "password": "password123"
}

# Encode grade
POST http://localhost:3000/api/grades/encode
Content-Type: application/json
{
  "courseId": "COMP101",
  "studentId": "STU001",
  "score": 85,
  "letterGrade": "A",
  "remarks": "Excellent work"
}

# Get pending grades for verification
GET http://localhost:3000/api/grades/verification

# Verify grade (approve/reject)
PUT http://localhost:3000/api/grades/verification
Content-Type: application/json
{
  "gradeId": "grade_001",
  "action": "approve",
  "comments": "Approved"
}


## 🔄 Workflow Examples

### Complete Flow - Firebase Setup
1. firebase init
2. Select Firestore Database
3. Select Authentication
4. Deploy: firebase deploy

### Complete Flow - First Run
1. npm install
2. cp .env.example .env.local
3. Add Firebase credentials to .env.local
4. npm run dev
5. Open http://localhost:3000
6. Register account
7. Login
8. Access dashboard

### Complete Flow - Deployment
1. npm run build (build locally)
2. vercel deploy (deploy to Vercel)
3. Add environment variables to Vercel
4. Verify at deployed URL
5. firebase deploy (if using Firebase hosting)


## 📊 Quick Stats

# Count components
find ./src -name "*.tsx" | wc -l

# Count services
ls -la src/services/*.ts | wc -l

# Count API routes
find ./src/app/api -name "route.ts" | wc -l

# Count total TypeScript files
find ./src -name "*.ts" -o -name "*.tsx" | wc -l


## 🎨 Tailwind Commands

# Generate Tailwind CSS
npx tailwindcss -i ./src/styles/globals.css -o ./dist/output.css

# Watch Tailwind changes
npx tailwindcss -i ./src/styles/globals.css -o ./dist/output.css --watch


## 📦 All Available Scripts

# From package.json:
npm run dev           # Start development server
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint
npm run format        # Format code with Prettier
npm run type-check    # Check TypeScript types


## 🚀 Performance Tips

# Use production build
npm run build
npm run start

# Check bundle size
npm install -g webpack-bundle-analyzer

# Analyze build
ANALYZE=true npm run build


## 🔗 External Resources

# Next.js: https://nextjs.org/docs
# React: https://react.dev
# TypeScript: https://www.typescriptlang.org
# Tailwind: https://tailwindcss.com
# Firebase: https://firebase.google.com/docs
# Zod: https://zod.dev
# Zustand: https://github.com/pmndrs/zustand

---

## 💡 Common Issues & Solutions

### Port 3000 in use
Solution: npm run dev -- -p 3001

### npm install hangs
Solution: 
  npm install --legacy-peer-deps
  or
  npm install --no-save --legacy-peer-deps

### TypeScript errors
Solution: npm run type-check

### Module not found
Solution: 
  npm install
  npm cache clean --force
  rm -rf node_modules && npm install

### Firebase auth not working
Solution:
  Check .env.local has credentials
  Verify Firebase project enabled Email auth
  Check browser console for errors

---

Ready to start? Run: npm run dev

For detailed setup, see: GETTING_STARTED.md
