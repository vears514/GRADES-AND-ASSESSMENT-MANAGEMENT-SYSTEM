/**
 * Firebase Firestore Seed Database Script
 * This script initializes the Firestore database with sample data for testing and development
 * 
 * Prerequisites:
 * 1. Install Firebase Admin SDK: npm install firebase-admin
 * 2. Download service account key from Firebase Console OR set FIREBASE_ADMIN_SDK_KEY env var
 * 3. Set up environment variables in .env.local
 * 
 * Usage:
 * node scripts/seedDatabase.js
 * 
 * Setup Instructions:
 * 1. Go to Firebase Console → Project Settings → Service Accounts
 * 2. Click "Generate New Private Key"
 * 3. Save the JSON key as serviceAccountKey.json in project root
 * 4. OR set FIREBASE_ADMIN_SDK_KEY=<json-key-path> in .env.local
 */

require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Helper function to initialize Firebase
function initializeFirebase() {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  
  if (!projectId) {
    throw new Error('❌ FIREBASE_PROJECT_ID not set in .env.local');
  }
  
  let credentialPath = null;
  
  // Try to find service account key
  if (process.env.FIREBASE_ADMIN_SDK_KEY) {
    credentialPath = process.env.FIREBASE_ADMIN_SDK_KEY;
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    credentialPath = process.env.FIREBASE_SERVICE_ACCOUNT;
  } else {
    // Check for serviceAccountKey.json in project root
    credentialPath = path.join(__dirname, '../serviceAccountKey.json');
  }
  
  // Verify the file exists
  if (!fs.existsSync(credentialPath)) {
    console.error('❌ Firebase service account key not found!');
    console.error(`\nExpected at: ${credentialPath}`);
    console.error('\n📋 To fix this:');
    console.error('1. Go to Firebase Console → https://console.firebase.google.com');
    console.error('2. Select project: gradehub-beltran');
    console.error('3. Go to Project Settings → Service Accounts tab');
    console.error('4. Click "Generate New Private Key"');
    console.error('5. Save the file as: serviceAccountKey.json in project root');
    console.error('6. OR set FIREBASE_ADMIN_SDK_KEY in .env.local');
    console.error('\n⚠️ IMPORTANT: Add serviceAccountKey.json to .gitignore!');
    process.exit(1);
  }
  
  try {
    admin.initializeApp({
      credential: admin.credential.cert(credentialPath),
      projectId: projectId
    });
    console.log(`✅ Firebase initialized with project: ${projectId}`);
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error.message);
    process.exit(1);
  }
}

let db = null; // Will be initialized after Firebase setup

// Helper function to log progress
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// Helper function for errors
function logError(message, error) {
  console.error(`[${new Date().toISOString()}] ERROR: ${message}`, error);
}

/**
 * Seed Users Collection
 */
async function seedUsers() {
  log('Seeding users collection...');
  
  const users = [
    {
      id: 'admin-001',
      email: 'admin@gams.edu',
      name: 'System Admin',
      role: 'admin',
      department: 'Administration',
      status: 'active',
      createdAt: admin.firestore.Timestamp.now(),
      lastLogin: admin.firestore.Timestamp.now()
    },
    {
      id: 'faculty-001',
      email: 'professor.smith@gams.edu',
      name: 'Dr. John Smith',
      role: 'faculty',
      department: 'Computer Science',
      status: 'active',
      createdAt: admin.firestore.Timestamp.now(),
      lastLogin: admin.firestore.Timestamp.now()
    },
    {
      id: 'faculty-002',
      email: 'professor.johnson@gams.edu',
      name: 'Dr. Emily Johnson',
      role: 'faculty',
      department: 'Computer Science',
      status: 'active',
      createdAt: admin.firestore.Timestamp.now(),
      lastLogin: admin.firestore.Timestamp.now()
    },
    {
      id: 'registrar-001',
      email: 'registrar@gams.edu',
      name: 'Sarah Davis',
      role: 'registrar',
      department: 'Registrar',
      status: 'active',
      createdAt: admin.firestore.Timestamp.now(),
      lastLogin: admin.firestore.Timestamp.now()
    },
    {
      id: 'student-001',
      email: 'alice.brown@student.gams.edu',
      name: 'Alice Brown',
      role: 'student',
      department: 'Computer Science',
      status: 'active',
      createdAt: admin.firestore.Timestamp.now(),
      lastLogin: admin.firestore.Timestamp.now()
    },
    {
      id: 'student-002',
      email: 'bob.wilson@student.gams.edu',
      name: 'Bob Wilson',
      role: 'student',
      department: 'Computer Science',
      status: 'active',
      createdAt: admin.firestore.Timestamp.now(),
      lastLogin: admin.firestore.Timestamp.now()
    },
    {
      id: 'student-003',
      email: 'carol.martinez@student.gams.edu',
      name: 'Carol Martinez',
      role: 'student',
      department: 'Computer Science',
      status: 'active',
      createdAt: admin.firestore.Timestamp.now(),
      lastLogin: admin.firestore.Timestamp.now()
    }
  ];

  let successCount = 0;
  for (const user of users) {
    try {
      await db.collection('users').doc(user.id).set(user);
      successCount++;
    } catch (error) {
      logError(`Failed to create user ${user.id}`, error);
    }
  }
  
  log(`✓ Created ${successCount}/${users.length} users`);
  return users;
}

/**
 * Seed Courses Collection
 */
async function seedCourses(facultyUsers) {
  log('Seeding courses collection...');
  
  const courses = [
    {
      id: 'CS-101-2024-FALL',
      code: 'CS-101',
      name: 'Introduction to Computer Science',
      description: 'Fundamentals of computer science and programming',
      department: 'Computer Science',
      facultyId: 'faculty-001',
      year: 2024,
      semester: 'FALL',
      credits: 4,
      capacity: 30,
      enrolledCount: 3,
      isPublished: true,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    },
    {
      id: 'CS-201-2024-FALL',
      code: 'CS-201',
      name: 'Data Structures',
      description: 'Advanced data structures and algorithms',
      department: 'Computer Science',
      facultyId: 'faculty-002',
      year: 2024,
      semester: 'FALL',
      credits: 4,
      capacity: 25,
      enrolledCount: 3,
      isPublished: true,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    },
    {
      id: 'CS-301-2024-FALL',
      code: 'CS-301',
      name: 'Database Systems',
      description: 'Relational databases and SQL',
      department: 'Computer Science',
      facultyId: 'faculty-001',
      year: 2024,
      semester: 'FALL',
      credits: 3,
      capacity: 20,
      enrolledCount: 0,
      isPublished: true,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    }
  ];

  let successCount = 0;
  for (const course of courses) {
    try {
      await db.collection('courses').doc(course.id).set(course);
      successCount++;
    } catch (error) {
      logError(`Failed to create course ${course.id}`, error);
    }
  }
  
  log(`✓ Created ${successCount}/${courses.length} courses`);
  return courses;
}

/**
 * Seed Enrollments Collection
 */
async function seedEnrollments(courses) {
  log('Seeding enrollments collection...');
  
  const enrollments = [
    {
      id: 'student-001_CS-101-2024-FALL',
      studentId: 'student-001',
      courseId: 'CS-101-2024-FALL',
      enrollmentDate: admin.firestore.Timestamp.now(),
      status: 'active',
      createdAt: admin.firestore.Timestamp.now()
    },
    {
      id: 'student-002_CS-101-2024-FALL',
      studentId: 'student-002',
      courseId: 'CS-101-2024-FALL',
      enrollmentDate: admin.firestore.Timestamp.now(),
      status: 'active',
      createdAt: admin.firestore.Timestamp.now()
    },
    {
      id: 'student-003_CS-101-2024-FALL',
      studentId: 'student-003',
      courseId: 'CS-101-2024-FALL',
      enrollmentDate: admin.firestore.Timestamp.now(),
      status: 'active',
      createdAt: admin.firestore.Timestamp.now()
    },
    {
      id: 'student-001_CS-201-2024-FALL',
      studentId: 'student-001',
      courseId: 'CS-201-2024-FALL',
      enrollmentDate: admin.firestore.Timestamp.now(),
      status: 'active',
      createdAt: admin.firestore.Timestamp.now()
    },
    {
      id: 'student-002_CS-201-2024-FALL',
      studentId: 'student-002',
      courseId: 'CS-201-2024-FALL',
      enrollmentDate: admin.firestore.Timestamp.now(),
      status: 'active',
      createdAt: admin.firestore.Timestamp.now()
    },
    {
      id: 'student-003_CS-201-2024-FALL',
      studentId: 'student-003',
      courseId: 'CS-201-2024-FALL',
      enrollmentDate: admin.firestore.Timestamp.now(),
      status: 'active',
      createdAt: admin.firestore.Timestamp.now()
    }
  ];

  let successCount = 0;
  for (const enrollment of enrollments) {
    try {
      await db.collection('enrollments').doc(enrollment.id).set(enrollment);
      successCount++;
    } catch (error) {
      logError(`Failed to create enrollment ${enrollment.id}`, error);
    }
  }
  
  log(`✓ Created ${successCount}/${enrollments.length} enrollments`);
  return enrollments;
}

/**
 * Seed Grades Collection
 */
async function seedGrades() {
  log('Seeding grades collection...');
  
  const grades = [
    {
      id: 'grade-001',
      studentId: 'student-001',
      courseId: 'CS-101-2024-FALL',
      assignmentId: 'assignment-001',
      score: 92,
      maxScore: 100,
      percentage: 92,
      letterGrade: 'A',
      submittedBy: 'faculty-001',
      submittedAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-15')),
      verificationStatus: 'pending',
      createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-15')),
      updatedAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-15'))
    },
    {
      id: 'grade-002',
      studentId: 'student-001',
      courseId: 'CS-101-2024-FALL',
      assignmentId: 'assignment-002',
      score: 88,
      maxScore: 100,
      percentage: 88,
      letterGrade: 'B+',
      submittedBy: 'faculty-001',
      submittedAt: admin.firestore.Timestamp.fromDate(new Date('2024-02-15')),
      verificationStatus: 'verified',
      createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-02-15')),
      updatedAt: admin.firestore.Timestamp.fromDate(new Date('2024-02-20'))
    },
    {
      id: 'grade-003',
      studentId: 'student-002',
      courseId: 'CS-101-2024-FALL',
      assignmentId: 'assignment-001',
      score: 85,
      maxScore: 100,
      percentage: 85,
      letterGrade: 'B',
      submittedBy: 'faculty-001',
      submittedAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-15')),
      verificationStatus: 'verified',
      createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-15')),
      updatedAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-20'))
    },
    {
      id: 'grade-004',
      studentId: 'student-001',
      courseId: 'CS-201-2024-FALL',
      assignmentId: 'assignment-003',
      score: 78,
      maxScore: 100,
      percentage: 78,
      letterGrade: 'C+',
      submittedBy: 'faculty-002',
      submittedAt: admin.firestore.Timestamp.fromDate(new Date('2024-03-10')),
      verificationStatus: 'pending',
      createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-03-10')),
      updatedAt: admin.firestore.Timestamp.fromDate(new Date('2024-03-10'))
    }
  ];

  let successCount = 0;
  for (const grade of grades) {
    try {
      await db.collection('grades').doc(grade.id).set(grade);
      successCount++;
    } catch (error) {
      logError(`Failed to create grade ${grade.id}`, error);
    }
  }
  
  log(`✓ Created ${successCount}/${grades.length} grades`);
  return grades;
}

/**
 * Seed Settings Collection
 */
async function seedSettings() {
  log('Seeding settings collection...');
  
  const settings = [
    {
      id: 'grade-scale',
      key: 'grade_scale',
      name: 'Grade Scale',
      description: 'Default grade scale for the system',
      value: {
        A: { min: 90, max: 100 },
        'B+': { min: 87, max: 89 },
        B: { min: 80, max: 86 },
        'C+': { min: 77, max: 79 },
        C: { min: 70, max: 76 },
        D: { min: 60, max: 69 },
        F: { min: 0, max: 59 }
      },
      isPublic: true,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    },
    {
      id: 'grade-verification-timeout',
      key: 'grade_verification_timeout',
      name: 'Grade Verification Timeout',
      description: 'Days allowed for grade verification (in days)',
      value: 14,
      isPublic: false,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    },
    {
      id: 'bulk-upload-max-size',
      key: 'bulk_upload_max_size',
      name: 'Bulk Upload Max Size',
      description: 'Maximum file size for bulk uploads (in MB)',
      value: 10,
      isPublic: false,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    },
    {
      id: 'notification-email-enabled',
      key: 'notification_email_enabled',
      name: 'Email Notifications',
      description: 'Enable email notifications',
      value: true,
      isPublic: false,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    }
  ];

  let successCount = 0;
  for (const setting of settings) {
    try {
      await db.collection('settings').doc(setting.id).set(setting);
      successCount++;
    } catch (error) {
      logError(`Failed to create setting ${setting.id}`, error);
    }
  }
  
  log(`✓ Created ${successCount}/${settings.length} settings`);
  return settings;
}

/**
 * Create initial audit log
 */
async function seedAuditLog() {
  log('Creating initial audit log...');
  
  const auditLog = {
    userId: 'admin-001',
    action: 'database_seeded',
    resource: 'firestore',
    details: 'Database initialized with seed data',
    ipAddress: '127.0.0.1',
    status: 'success',
    timestamp: admin.firestore.Timestamp.now()
  };

  try {
    const docRef = await db.collection('auditLogs').add(auditLog);
    log(`✓ Created audit log: ${docRef.id}`);
  } catch (error) {
    logError('Failed to create audit log', error);
  }
}

/**
 * Main seeding function
 */
async function seedDatabase() {
  try {
    // Initialize Firebase first
    initializeFirebase();
    
    // Now initialize Firestore reference
    db = admin.firestore();
    
    log('Starting database seeding...');
    log('========================================');
    
    // Seed collections in order
    const users = await seedUsers();
    const courses = await seedCourses(users);
    const enrollments = await seedEnrollments(courses);
    const grades = await seedGrades();
    const settings = await seedSettings();
    await seedAuditLog();
    
    log('========================================');
    log('✓ Database seeding completed successfully!');
    log('Summary:');
    log(`  - Users: ${users.length}`);
    log(`  - Courses: ${courses.length}`);
    log(`  - Enrollments: ${enrollments.length}`);
    log(`  - Grades: ${grades.length}`);
    log(`  - Settings: ${settings.length}`);
    
    process.exit(0);
  } catch (error) {
    logError('Fatal error during database seeding', error);
    process.exit(1);
  }
}

// Run the seeding script
seedDatabase();
