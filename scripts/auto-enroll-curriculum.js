// Bulk auto-enrollment script (CommonJS) to avoid ts-node dependency.
// Usage: node scripts/auto-enroll-curriculum.js

const path = require('path')
const fs = require('fs')
const admin = require('firebase-admin')

const serviceAccountPath = path.resolve(__dirname, '../serviceAccountKey.json')
if (!fs.existsSync(serviceAccountPath)) {
  console.error('Service account file not found at', serviceAccountPath)
  process.exit(1)
}
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
}
const db = admin.firestore()

const curriculum = {
  '1st_Year_1st_Sem': ['CC101', 'CC102', 'GE1', 'GE4', 'GE5'],
  '1st_Year_2nd_Sem': ['CC103', 'IT05', 'IT01', 'GE2', 'GE7'],
  '2nd_Year_1st_Sem': ['CC04', 'IT07', 'CC05', 'PF101'],
  '2nd_Year_2nd_Sem': ['IT11', 'IT14', 'IT13', 'GE8'],
  '3rd_Year_1st_Sem': ['SYSAN', 'CAP1', 'MAPP1', 'APPDEV'],
  '3rd_Year_2nd_Sem': ['CAP2', 'INFOSEC', 'SYSINT', 'ITPM'],
  '4th_Year_1st_Sem': ['SYSADMIN', 'INTERNSHIP'],
  '4th_Year_2nd_Sem': [],
}

const targetEmails = [
  'jdstudent01@gmail.com',
  'kenv04@gmail.com',
  'beltranmarkchristian5@gmail.com',
]

const normalizeKey = (yearLevel, semester) => {
  if (!yearLevel || !semester) return null
  const yearNum = (yearLevel.match(/\d/) || [null])[0]
  const semNum = (semester.match(/\d/) || [null])[0]
  if (!yearNum || !semNum) return null
  return `${yearNum}st_Year_${semNum}st_Sem`.replace('2st', '2nd').replace('3st', '3rd').replace('4st', '4th')
}

async function run() {
  const usersRef = db.collection('users')
  const snap = await usersRef.where('email', 'in', targetEmails).get()
  console.log(`Processing ${snap.size} students...`)

  const batch = db.batch()
  snap.forEach((doc) => {
    const data = doc.data()
    const key = normalizeKey(data.yearLevel, data.currentSemester || data.semester)
    if (!key || !curriculum[key]) {
      console.warn(`Skipping ${data.email || doc.id} (no curriculum match for year/sem)`)
      return
    }
    const enrolledCourses = curriculum[key]
    batch.update(doc.ref, { enrolledCourses })
    console.log(`Queued ${data.email || doc.id} -> ${key}: ${enrolledCourses.join(', ')}`)
  })

  await batch.commit()
  console.log('Enrollment update committed.')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
