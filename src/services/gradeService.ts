import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  Timestamp,
} from 'firebase/firestore'
import { getDb } from '@/lib/firebase'
import { Grade } from '@/types'
import { isDevCourseRecord, isDevEnrollmentRecord, isDevGradeRecord } from '@/lib/devData'

const GRADES_COLLECTION = 'grades'

const getDatabase = () => {
  const db = getDb()
  if (!db) throw new Error('Firebase database not initialized')
  return db
}

const getTimeValue = (value: unknown) => {
  if (typeof (value as { toMillis?: () => number })?.toMillis === 'function') {
    return (value as { toMillis: () => number }).toMillis()
  }

  if (typeof (value as { toDate?: () => Date })?.toDate === 'function') {
    return (value as { toDate: () => Date }).toDate().getTime()
  }

  if (value instanceof Date) {
    return value.getTime()
  }

  return 0
}

const stripUndefined = <T extends Record<string, any>>(data: T): Partial<T> => {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  ) as Partial<T>
}

const sortByUpdatedAtDesc = <T extends { updatedAt?: unknown }>(records: T[]) => {
  return records.sort((a, b) => {
    const timeA = getTimeValue(a.updatedAt)
    const timeB = getTimeValue(b.updatedAt)
    return timeB - timeA
  })
}

const filterLiveGrades = (grades: Grade[]) => {
  return grades.filter((grade) => !isDevGradeRecord(grade))
}

const filterLiveEnrollments = <T extends Record<string, any>>(enrollments: T[]) => {
  return enrollments.filter((enrollment) => !isDevEnrollmentRecord(enrollment))
}

const filterLiveCourses = <T extends Record<string, any>>(courses: T[]) => {
  return courses.filter((course) => !isDevCourseRecord(course))
}

export const gradeService = {
  // Create a new grade
  async createGrade(data: Partial<Grade>): Promise<Grade> {
    const db = getDatabase()
    const gradesRef = collection(db, GRADES_COLLECTION)
    const payload = stripUndefined({
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    const docRef = await addDoc(gradesRef, payload)
    return {
      ...data,
      id: docRef.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Grade
  },

  // Get grades for a course
  async getGradesByCourse(courseId: string, aliases: string[] = []): Promise<Grade[]> {
    const db = getDatabase()
    const courseIdentifiers = Array.from(
      new Set([courseId, ...aliases].filter(Boolean))
    )
    const gradeMap = new Map<string, Grade>()

    for (const identifier of courseIdentifiers) {
      const q = query(
        collection(db, GRADES_COLLECTION),
        where('courseId', '==', identifier)
      )
      const querySnapshot = await getDocs(q)
      querySnapshot.docs.forEach((docSnap) => {
        gradeMap.set(docSnap.id, {
          id: docSnap.id,
          ...docSnap.data(),
        } as Grade)
      })
    }

    return sortByUpdatedAtDesc(filterLiveGrades(Array.from(gradeMap.values())))
  },

  // Get grades for a student
  async getGradesByStudent(studentId: string, aliases: string[] = []): Promise<Grade[]> {
    const db = getDatabase()
    const studentIdentifiers = Array.from(
      new Set([studentId, ...aliases].filter(Boolean))
    )
    const gradeMap = new Map<string, Grade>()

    for (const identifier of studentIdentifiers) {
      const q = query(
        collection(db, GRADES_COLLECTION),
        where('studentId', '==', identifier)
      )
      const querySnapshot = await getDocs(q)
      querySnapshot.docs.forEach((docSnap) => {
        gradeMap.set(docSnap.id, {
          id: docSnap.id,
          ...docSnap.data(),
        } as Grade)
      })
    }

    return sortByUpdatedAtDesc(filterLiveGrades(Array.from(gradeMap.values())))
  },

  // Get pending grades for verification
  async getPendingGrades(limit = 50): Promise<Grade[]> {
    const grades = await this.getGradesByStatuses(['submitted'])
    return grades.slice(0, limit)
  },

  async getGradesByStatuses(statuses: Grade['status'][]): Promise<Grade[]> {
    if (statuses.length === 0) {
      return []
    }

    const db = getDatabase()
    const q = query(
      collection(db, GRADES_COLLECTION),
      where('status', 'in', statuses.slice(0, 10))
    )
    const querySnapshot = await getDocs(q)
    const grades = querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    } as Grade))

    return sortByUpdatedAtDesc(filterLiveGrades(grades))
  },

  // Update grade status
  async updateGradeStatus(
    gradeId: string,
    status: Grade['status'],
    verifiedBy?: string
  ): Promise<void> {
    const db = getDatabase()
    const gradeRef = doc(db, GRADES_COLLECTION, gradeId)
    await updateDoc(gradeRef, stripUndefined({
      status,
      verifiedBy,
      verifiedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }))
  },

  // Update grade
  async updateGrade(gradeId: string, data: Partial<Grade>): Promise<void> {
    const db = getDatabase()
    const gradeRef = doc(db, GRADES_COLLECTION, gradeId)
    await updateDoc(gradeRef, stripUndefined({
      ...data,
      updatedAt: Timestamp.now(),
    }))
  },

  // Delete grade
  async deleteGrade(gradeId: string): Promise<void> {
    const db = getDatabase()
    const gradeRef = doc(db, GRADES_COLLECTION, gradeId)
    await deleteDoc(gradeRef)
  },

  // Get grade by ID
  async getGradeById(gradeId: string): Promise<Grade | null> {
    const db = getDatabase()
    const docSnap = await getDocs(query(collection(db, GRADES_COLLECTION), where('id', '==', gradeId)))
    // If the above query was used because 'id' is a field, keep it but also fallback to doc()
    if (!docSnap.empty) {
      return { id: docSnap.docs[0].id, ...docSnap.docs[0].data() } as Grade
    }

    // fallback or primary: try direct ID lookup
    const directSnap = await getDocs(query(collection(db, GRADES_COLLECTION), where('__name__', '==', gradeId)))
    if (!directSnap.empty) {
      return { id: directSnap.docs[0].id, ...directSnap.docs[0].data() } as Grade
    }
    return null
  },

  // Get enrollments for a course
  async getEnrollmentsByCourse(courseId: string): Promise<any[]> {
    const db = getDatabase()
    const q = query(
      collection(db, 'enrollments'),
      where('courseId', '==', courseId)
    )
    const querySnapshot = await getDocs(q)
    return filterLiveEnrollments(querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })))
  },

  // Get enrollments for a student
  async getEnrollmentsByStudent(studentId: string, aliases: string[] = []): Promise<any[]> {
    const db = getDatabase()
    const studentIdentifiers = Array.from(
      new Set([studentId, ...aliases].filter(Boolean))
    )
    const enrollmentMap = new Map<string, any>()

    for (const identifier of studentIdentifiers) {
      const q = query(
        collection(db, 'enrollments'),
        where('studentId', '==', identifier)
      )
      const querySnapshot = await getDocs(q)
      querySnapshot.docs.forEach((docSnap) => {
        enrollmentMap.set(docSnap.id, {
          id: docSnap.id,
          ...docSnap.data()
        })
      })
    }

    return filterLiveEnrollments(Array.from(enrollmentMap.values()))
  },

  // Get course by ID
  async getCourseById(courseId: string): Promise<any | null> {
    const db = getDatabase()
    // Try both field 'id' and document ID (standard in Firestore)
    const q1 = query(collection(db, 'courses'), where('id', '==', courseId))
    const snap1 = await getDocs(q1)
    if (!snap1.empty) {
      const course = { id: snap1.docs[0].id, ...snap1.docs[0].data() }
      return isDevCourseRecord(course) ? null : course
    }

    // Standard document ID lookup
    const q2 = query(collection(db, 'courses'), where('__name__', '==', courseId))
    const snap2 = await getDocs(q2)
    if (!snap2.empty) {
      const course = { id: snap2.docs[0].id, ...snap2.docs[0].data() }
      return isDevCourseRecord(course) ? null : course
    }

    return null
  },

  // Get courses by instructor
  async getCoursesByInstructor(instructorIdentifiers: string | string[]): Promise<any[]> {
    const db = getDatabase()
    const ids = Array.from(
      new Set(
        (Array.isArray(instructorIdentifiers) ? instructorIdentifiers : [instructorIdentifiers])
          .map(id => id?.trim())
          .filter(Boolean) as string[]
      )
    )
    if (ids.length === 0) return []

    const lookupFields = ['instructor.id', 'instructor.uid', 'facultyId', 'instructorId', 'teacherId']
    const courseMap = new Map<string, any>()

    for (const instructorId of ids) {
      for (const field of lookupFields) {
        try {
          const q = query(
            collection(db, 'courses'),
            where(field, '==', instructorId)
          )
          const querySnapshot = await getDocs(q)
          querySnapshot.docs.forEach((docSnap) => {
            courseMap.set(docSnap.id, {
              id: docSnap.id,
              ...docSnap.data()
            })
          })
        } catch (error) {
          // Some legacy documents may not have all fields. Continue fallback queries.
          console.warn(`Course lookup skipped for field "${field}"`, error)
        }
      }
    }

    return filterLiveCourses(Array.from(courseMap.values()))
  },

  // Get all courses (used by admin views)
  async getAllCourses(): Promise<any[]> {
    const db = getDatabase()
    const querySnapshot = await getDocs(collection(db, 'courses'))
    return filterLiveCourses(querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })))
  },

  // Upsert grade
  async upsertGrade(gradeData: Partial<Grade>): Promise<Grade> {
    if (gradeData.id) {
      const { id, ...updateData } = gradeData
      await this.updateGrade(id, updateData)
      return { ...gradeData } as Grade
    } else {
      const { id: _id, ...createData } = gradeData
      return await this.createGrade(createData)
    }
  },

  // Publish grade (sets status to approved and stamps publishedAt/by)
  async publishGrade(gradeData: Partial<Grade> & { submittedBy?: string }): Promise<Grade> {
    const payload = {
      ...gradeData,
      status: 'approved' as const,
      publishedAt: new Date(),
      publishedBy: gradeData.submittedBy || gradeData.verifiedBy || gradeData.submittedBy,
      submittedAt: gradeData.submittedAt || new Date(),
      updatedAt: new Date(),
    }
    return await this.upsertGrade(payload)
  }
}
