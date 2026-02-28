#!/usr/bin/env node
/**
 * Firebase Setup & Configuration Script
 * Validates Firebase configuration and helps with initial setup
 * 
 * Usage:
 * node scripts/setupFirebase.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  requiredEnvVars: [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
    'FIREBASE_ADMIN_SDK_KEY',
    'FIREBASE_SERVICE_ACCOUNT'
  ],
  requiredFiles: [
    'firestore.rules',
    'firestore.indexes.json',
    'firebase.json'
  ],
  requiredDirs: [
    'src/lib',
    'src/services',
    'src/types',
    'scripts'
  ]
};

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log('\n' + '='.repeat(60), 'cyan');
  log(title, 'cyan');
  log('='.repeat(60), 'cyan');
}

function checkEnvironmentVariables() {
  logSection('Checking Environment Variables');
  
  const envFile = path.join(process.cwd(), '.env.local');
  const envExists = fs.existsSync(envFile);
  
  if (!envExists) {
    log('⚠ .env.local file not found', 'yellow');
    log('✓ Creating template .env.local file...', 'yellow');
    
    const template = `# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK
FIREBASE_ADMIN_SDK_KEY=/path/to/serviceAccountKey.json
FIREBASE_SERVICE_ACCOUNT=/path/to/serviceAccountKey.json

# Application Settings
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
`;
    
    try {
      fs.writeFileSync(envFile, template);
      log('✓ Template .env.local created successfully', 'green');
    } catch (error) {
      log(`✗ Failed to create .env.local: ${error.message}`, 'red');
    }
  } else {
    log('✓ .env.local file found', 'green');
  }
  
  // Check for required variables in .env.local
  if (envExists) {
    const content = fs.readFileSync(envFile, 'utf-8');
    const missingVars = [];
    
    CONFIG.requiredEnvVars.forEach(varName => {
      if (!content.includes(varName)) {
        missingVars.push(varName);
      }
    });
    
    if (missingVars.length > 0) {
      log(`⚠ Missing environment variables:`, 'yellow');
      missingVars.forEach(varName => {
        log(`  - ${varName}`, 'yellow');
      });
    } else {
      log('✓ All required environment variables present', 'green');
    }
  }
}

function checkRequiredFiles() {
  logSection('Checking Required Files');
  
  const projectRoot = process.cwd();
  
  CONFIG.requiredFiles.forEach(file => {
    const filePath = path.join(projectRoot, file);
    if (fs.existsSync(filePath)) {
      log(`✓ ${file}`, 'green');
    } else {
      log(`✗ ${file} - MISSING`, 'red');
    }
  });
}

function checkDirectoryStructure() {
  logSection('Checking Directory Structure');
  
  const projectRoot = process.cwd();
  
  CONFIG.requiredDirs.forEach(dir => {
    const dirPath = path.join(projectRoot, dir);
    if (fs.existsSync(dirPath)) {
      log(`✓ ${dir}/`, 'green');
    } else {
      log(`✗ ${dir}/ - MISSING`, 'red');
    }
  });
}

function checkNpmDependencies() {
  logSection('Checking NPM Dependencies');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    log('✗ package.json not found', 'red');
    return;
  }
  
  const packageJson = require(packageJsonPath);
  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };
  
  const required = [
    'next',
    'react',
    'typescript',
    'firebase',
    'firebase-admin',
    'tailwindcss',
    'zod'
  ];
  
  required.forEach(dep => {
    if (dependencies[dep]) {
      log(`✓ ${dep} (${dependencies[dep]})`, 'green');
    } else {
      log(`✗ ${dep} - NOT INSTALLED`, 'red');
    }
  });
}

function checkFirebaseConfiguration() {
  logSection('Checking Firebase Configuration');
  
  const firebaseJsonPath = path.join(process.cwd(), 'firebase.json');
  
  if (!fs.existsSync(firebaseJsonPath)) {
    log('✗ firebase.json not found', 'red');
    return;
  }
  
  try {
    const firebaseJson = JSON.parse(fs.readFileSync(firebaseJsonPath, 'utf-8'));
    log('✓ firebase.json is valid JSON', 'green');
    
    if (firebaseJson.projects) {
      log(`✓ Firebase projects configured: ${Object.keys(firebaseJson.projects).join(', ')}`, 'green');
    }
  } catch (error) {
    log(`✗ firebase.json is invalid JSON: ${error.message}`, 'red');
  }
}

function suggestNextSteps() {
  logSection('Suggested Next Steps');
  
  log('1. Configure Firebase:', 'blue');
  log('   - Go to Firebase Console (https://console.firebase.google.com)', 'cyan');
  log('   - Create a new project or select existing project');
  log('   - Copy project configuration and add to .env.local');
  log('');
  
  log('2. Download Service Account Key:', 'blue');
  log('   - In Firebase Console, go to Project Settings → Service Accounts', 'cyan');
  log('   - Click "Generate New Private Key"');
  log('   - Save as serviceAccountKey.json in project root (add to .gitignore!)');
  log('');
  
  log('3. Deploy Security Rules:', 'blue');
  log('   - Run: firebase deploy --only firestore:rules', 'cyan');
  log('   - Review firestore.rules file for any customizations needed');
  log('');
  
  log('4. Create Firestore Indexes:', 'blue');
  log('   - Run: firebase deploy --only firestore:indexes', 'cyan');
  log('   - Review firestore.indexes.json for query requirements');
  log('');
  
  log('5. Seed Database (Optional):', 'blue');
  log('   - Run: npm run seed-db', 'cyan');
  log('   - Initializes sample data for development/testing');
  log('');
  
  log('6. Install Dependencies:', 'blue');
  log('   - Run: npm install', 'cyan');
  log('   - Ensures all Firebase and dev dependencies are installed');
  log('');
  
  log('7. Start Development Server:', 'blue');
  log('   - Run: npm run dev', 'cyan');
  log('   - Opens http://localhost:3000');
}

function displayConfiguration() {
  logSection('Firebase Integration Configuration Status');
  
  log('Run the following commands to complete setup:\n', 'blue');
  
  log('Install Firebase CLI (if not already installed):', 'cyan');
  log('  npm install -g firebase-tools\n', 'yellow');
  
  log('Deploy Firestore Security Rules:', 'cyan');
  log('  firebase deploy --only firestore:rules\n', 'yellow');
  
  log('Deploy Firestore Composite Indexes:', 'cyan');
  log('  firebase deploy --only firestore:indexes\n', 'yellow');
  
  log('Deploy Firebase Storage Rules:', 'cyan');
  log('  firebase deploy --only storage\n', 'yellow');
  
  log('Seed Database with Sample Data:', 'cyan');
  log('  node scripts/seedDatabase.js\n', 'yellow');
}

function main() {
  console.clear();
  log('Firebase Setup & Configuration Validator', 'blue');
  log('Version 1.0.0', 'cyan');
  
  try {
    checkEnvironmentVariables();
    checkRequiredFiles();
    checkDirectoryStructure();
    checkNpmDependencies();
    checkFirebaseConfiguration();
    suggestNextSteps();
    displayConfiguration();
    
    logSection('Configuration Check Complete');
    log('Re-run this script after making changes to verify setup', 'green');
  } catch (error) {
    log(`Fatal error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the script
main();
