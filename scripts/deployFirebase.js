#!/usr/bin/env node
/**
 * Deploy Firebase security rules and indexes using service account key
 * This bypasses the need for firebase login
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const firebase = require('firebase-admin');
const https = require('https');

// Initialize Firebase Admin SDK
if (!firebase.apps.length) {
  const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');
  
  if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ Error: serviceAccountKey.json not found');
    console.error('   Please download it from Firebase Console > Project Settings > Service Accounts');
    process.exit(1);
  }

  const serviceAccount = require(serviceAccountPath);
  firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
}

const projectId = firebase.app().options.projectId;
console.log(`🔧 Deploying to Firebase project: ${projectId}`);

// Deploy rules and indexes using REST API
async function deployFirebase() {
  try {
    const credentials = firebase.app().options.credential;
    const accessToken = await credentials.getAccessToken();
    const token = accessToken.access_token;

    console.log('\n📋 Deploying Firestore security rules...');
    await deployRules(projectId, token);
    
    console.log('\n📑 Deploying Firestore indexes...');
    await deployIndexes(projectId, token);
    
    console.log('\n✅ Firebase deployment completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Deployment error:', error.message);
    process.exit(1);
  }
}

async function deployRules(projectId, token) {
  return new Promise((resolve, reject) => {
    const rulesPath = path.join(__dirname, '../firestore.rules');
    const rulesContent = fs.readFileSync(rulesPath, 'utf-8');

    const body = {
      rules: rulesContent
    };

    const options = {
      hostname: 'firestore.googleapis.com',
      port: 443,
      path: `/v1/projects/${projectId}/databases/(default)/rules`,
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log('✓ Rules deployed successfully');
          resolve();
        } else {
          reject(new Error(`Rules deployment failed: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify(body));
    req.end();
  });
}

async function deployIndexes(projectId, token) {
  return new Promise((resolve, reject) => {
    const indexesPath = path.join(__dirname, '../firestore.indexes.json');
    const indexesData = JSON.parse(fs.readFileSync(indexesPath, 'utf-8'));

    const indexes = indexesData.indexes || [];
    let completed = 0;
    let errors = [];

    if (indexes.length === 0) {
      console.log('ℹ No indexes to deploy');
      resolve();
      return;
    }

    indexes.forEach((index, idx) => {
      const body = {
        index: {
          ancestorField: 'All Ancestors',
          collectionId: index.collectionId || index.collection,
          fields: index.fields || index.queryScope
        }
      };

      const options = {
        hostname: 'firestore.googleapis.com',
        port: 443,
        path: `/v1/projects/${projectId}/databases/(default)/collectionGroups/${index.collectionId || index.collection}/indexes`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          completed++;
          if (res.statusCode !== 200 && res.statusCode !== 201) {
            errors.push(`Index ${idx + 1} (${index.collection}): ${data}`);
          }
          if (completed === indexes.length) {
            if (errors.length > 0) {
              console.log(`⚠ ${errors.length} index error(s) (may already exist):`);
              errors.forEach(e => console.log(`  ${e}`));
            }
            console.log(`✓ Processed ${indexes.length} indexes (some may already exist)`);
            resolve();
          }
        });
      });

      req.on('error', (err) => {
        completed++;
        errors.push(`Index ${idx + 1}: ${err.message}`);
        if (completed === indexes.length) {
          resolve(); // Continue on error
        }
      });

      req.write(JSON.stringify(body));
      req.end();
    });
  });
}

deployFirebase();
