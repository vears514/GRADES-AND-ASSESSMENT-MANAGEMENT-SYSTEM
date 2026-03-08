import { initializeApp, applicationDefault, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import fs from 'fs'
import path from 'path'

// -------- CONFIG --------
// Adjust if your service account file is elsewhere
const findServiceAccountPath = () => {
  const candidates = [
    path.resolve(__dirname, '../serviceAccountKey.json'),       // when run with ts-node
    path.resolve(__dirname, '../../serviceAccountKey.json'),    // when compiled to scripts/dist
    path.resolve(process.cwd(), 'serviceAccountKey.json'),      // project root when run via npm script
  ]
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate
  }
  return null
}

// Curriculum mapping (course IDs match the Grade Entry dropdown IDs)
const curriculum: Record<string, string[]> = {
  '1st_Year_1st_Sem': ['CC101', 'CC102', 'GE1', 'GE4', 'GE5'],
  '1st_Year_2nd_Sem': ['CC103', 'IT05', 'IT01', 'GE2', 'GE7'],
  '2nd_Year_1st_Sem': ['CC04', 'IT07', 'CC05', 'PF101'],
  '2nd_Year_2nd_Sem': ['IT11', 'IT14', 'IT13', 'GE8'],
  '3rd_Year_1st_Sem': ['SYSAN', 'CAP1', 'MAPP1', 'APPDEV'],
  '3rd_Year_2nd_Sem': ['CAP2', 'MAPP2', 'INFOSEC', 'SYSINT', 'ITPM'],
  '4th_Year_1st_Sem': ['SYSADMIN', 'INTERNSHIP'],
  '4th_Year_2nd_Sem': [], // add practicum/thesis codes here when finalized
}

// Optional: limit run to specific emails; leave empty to process all students
const targetEmails = [
  'jdstudent01@gmail.com',
  'kenv04@gmail.com',
  'beltranmarkchristian5@gmail.com',
]

// Optional: fallback year/sem if missing (applies only to targetEmails)
const fallbackByEmail: Record<string, { yearLevel: string; semester: string; key: keyof typeof curriculum }> = {
  'jdstudent01@gmail.com': { yearLevel: '1st Year', semester: '1st Sem', key: '1st_Year_1st_Sem' },
  'kenv04@gmail.com': { yearLevel: '1st Year', semester: '1st Sem', key: '1st_Year_1st_Sem' },
  'beltranmarkchristian5@gmail.com': { yearLevel: '1st Year', semester: '1st Sem', key: '1st_Year_1st_Sem' },
}

const loadServiceAccount = () => {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) return applicationDefault()

  const resolved = findServiceAccountPath()
  if (resolved) {
    const json = JSON.parse(fs.readFileSync(resolved, 'utf8'))
    return cert(json)
  }

  throw new Error('Service account not found. Set GOOGLE_APPLICATION_CREDENTIALS or place serviceAccountKey.json in project root.')
}

const app = initializeApp({
  credential: loadServiceAccount(),
})
const db = getFirestore(app)

const normalizeCode = (code: string) => code.replace(/\s+/g, '').toUpperCase()

const getKey = (yearLevel?: string, semester?: string) => {
  if (!yearLevel || !semester) return null

  // Examples: "1st Year", "First Year", "4th year", "1st Sem", "Second Semester"
  const numericYear = yearLevel.match(/\d/)?.[0]
  const yearPart = numericYear ? `${numericYear}st_Year`.replace('2st', '2nd').replace('3st', '3rd').replace('4st', '4th') : null

  const semLower = semester.toLowerCase()
  const semPart = semLower.includes('1') || semLower.includes('first') ? '1st_Sem'
    : semLower.includes('2') || semLower.includes('second') ? '2nd_Sem'
      : semLower.includes('3') || semLower.includes('third') ? '3rd_Sem'
        : null

  if (!yearPart || !semPart) return null

  const key = `${yearPart}_${semPart}`
  return key in curriculum ? key : null
}

async function main() {
  const usersRef = db.collection('users')
  let query = usersRef.where('role', '==', 'student')
  if (targetEmails.length > 0) {
    query = query.where('email', 'in', targetEmails)
  }
  const snap = await query.get()
  console.log(`Found ${snap.size} students to update.`)

  const batch = db.batch()
  snap.forEach((docSnap) => {
    const data = docSnap.data() as any
    let key = getKey(data.yearLevel, data.currentSemester || data.semester)

    // Apply fallback for known emails if missing metadata
    if (!key && data.email && fallbackByEmail[data.email]) {
      const fallback = fallbackByEmail[data.email]
      key = fallback.key
      batch.update(docSnap.ref, {
        yearLevel: fallback.yearLevel,
        currentSemester: fallback.semester,
      })
      console.warn(`Applied fallback ${fallback.yearLevel} / ${fallback.semester} for ${data.email}`)
    }

    if (!key) {
      console.warn(`Skipping ${data.email || docSnap.id} - no matching curriculum key.`)
      return
    }
    const enrolledCourses = curriculum[key].map(normalizeCode)
    batch.update(docSnap.ref, { enrolledCourses })
    console.log(`Queued ${data.email || docSnap.id} => ${key} (${enrolledCourses.join(', ')})`)
  })

  await batch.commit()
  console.log('Enrollment array updates committed.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
