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

const GRADES_COLLECTION = 'grades'

const getDatabase = () => {
  const db = getDb()
  if (!db) throw new Error('Firebase database not initialized')
  return db
}

const stripUndefined = <T extends Record<string, any>>(data: T): Partial<T> => {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  ) as Partial<T>
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

    return Array.from(gradeMap.values())
      .sort((a, b) => {
        const timeA = (a.updatedAt as any)?.toMillis?.() || 0
        const timeB = (b.updatedAt as any)?.toMillis?.() || 0
        return timeB - timeA
      })
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

    return Array.from(gradeMap.values())
      .sort((a, b) => {
        const timeA = (a.updatedAt as any)?.toMillis?.() || 0
        const timeB = (b.updatedAt as any)?.toMillis?.() || 0
        return timeB - timeA
      })
  },

  // Get pending grades for verification
  async getPendingGrades(limit = 50): Promise<Grade[]> {
    const db = getDatabase()
    const q = query(
      collection(db, GRADES_COLLECTION),
      where('status', '==', 'submitted')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Grade))
      .sort((a, b) => {
        const timeA = (a.updatedAt as any)?.toMillis?.() || 0
        const timeB = (b.updatedAt as any)?.toMillis?.() || 0
        return timeB - timeA
      })
      .slice(0, limit)
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
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
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

    return Array.from(enrollmentMap.values())
  },

  // Get course by ID
  async getCourseById(courseId: string): Promise<any | null> {
    const db = getDatabase()
    // Try both field 'id' and document ID (standard in Firestore)
    const q1 = query(collection(db, 'courses'), where('id', '==', courseId))
    const snap1 = await getDocs(q1)
    if (!snap1.empty) return { id: snap1.docs[0].id, ...snap1.docs[0].data() }

    // Standard document ID lookup
    const q2 = query(collection(db, 'courses'), where('__name__', '==', courseId))
    const snap2 = await getDocs(q2)
    if (!snap2.empty) return { id: snap2.docs[0].id, ...snap2.docs[0].data() }

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

    return Array.from(courseMap.values())
  },

  // Get all courses (used by admin views)
  async getAllCourses(): Promise<any[]> {
    const db = getDatabase()
    const querySnapshot = await getDocs(collection(db, 'courses'))
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
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
  }
}
