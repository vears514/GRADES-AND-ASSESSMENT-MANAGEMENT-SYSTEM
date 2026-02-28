#!/usr/bin/env node
/**
 * Firebase Service Account Key Setup Helper
 * 
 * This script guides you through downloading and setting up your Firebase service account key
 * 
 * Usage: node scripts/setupServiceAccount.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  console.clear();
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Firebase Service Account Key Setup Helper                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log('📋 Steps to get your Firebase Service Account Key:\n');

  console.log('1️⃣  Open Firebase Console:');
  console.log('   👉 https://console.firebase.google.com\n');

  console.log('2️⃣  Select your project:');
  console.log('   👉 gradehub-beltran\n');

  console.log('3️⃣  Go to Project Settings:');
  console.log('   👉 Click ⚙️ (gear icon) → Project Settings\n');

  console.log('4️⃣  Go to Service Accounts tab:');
  console.log('   👉 Click "Service Accounts" tab\n');

  console.log('5️⃣  Generate private key:');
  console.log('   👉 Click "Generate New Private Key"\n');

  console.log('6️⃣  Save the JSON file:');
  console.log('   👉 Click "Generate" and save the file\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const ready = await question('Have you downloaded the service account key? (yes/no): ');

  if (ready.toLowerCase() !== 'yes' && ready.toLowerCase() !== 'y') {
    console.log('\n❌ Please download the key first, then come back to run this script again.');
    rl.close();
    process.exit(0);
  }

  const keyPath = await question('\nEnter the path to your serviceAccountKey.json file:\n(or press Enter if the file is in project root): ');

  const actualPath = keyPath.trim() || path.join(__dirname, '../serviceAccountKey.json');

  console.log(`\nChecking: ${actualPath}...`);

  if (!fs.existsSync(actualPath)) {
    console.log('❌ File not found at that location.');
    rl.close();
    process.exit(1);
  }

  try {
    const content = JSON.parse(fs.readFileSync(actualPath, 'utf8'));
    console.log('✅ Valid service account key file!\n');
    console.log(`Project ID: ${content.project_id}`);
    console.log(`Service Account Email: ${content.client_email}\n`);
  } catch (error) {
    console.log('❌ Invalid JSON file. Please check the file and try again.');
    rl.close();
    process.exit(1);
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('✅ Setup complete!\n');
  console.log('You can now run: npm run seed-db\n');

  console.log('⚠️  IMPORTANT SECURITY REMINDER:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Make sure serviceAccountKey.json is in your .gitignore');

  if (!fs.existsSync(path.join(__dirname, '../.gitignore'))) {
    console.log('\n⚠️  No .gitignore file found. Creating one with serviceAccountKey.json...');
    fs.writeFileSync(path.join(__dirname, '../.gitignore'), 'serviceAccountKey.json\n', { flag: 'a' });
    console.log('✅ Added to .gitignore');
  } else {
    const gitignoreContent = fs.readFileSync(path.join(__dirname, '../.gitignore'), 'utf8');
    if (!gitignoreContent.includes('serviceAccountKey.json')) {
      fs.appendFileSync(path.join(__dirname, '../.gitignore'), 'serviceAccountKey.json\n');
      console.log('✅ Added serviceAccountKey.json to .gitignore');
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  rl.close();
}

main().catch(error => {
  console.error('Error:', error);
  rl.close();
  process.exit(1);
});
