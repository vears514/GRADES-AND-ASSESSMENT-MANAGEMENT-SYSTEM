import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
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

export const gradeService = {
  // Create a new grade
  async createGrade(data: Partial<Grade>): Promise<Grade> {
    const db = getDatabase()
    const gradesRef = collection(db, GRADES_COLLECTION)
    const docRef = await addDoc(gradesRef, {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    return {
      ...data,
      id: docRef.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Grade
  },

  // Get grades for a course
  async getGradesByCourse(courseId: string): Promise<Grade[]> {
    const db = getDatabase()
    const q = query(
      collection(db, GRADES_COLLECTION),
      where('courseId', '==', courseId)
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
  },

  // Get grades for a student
  async getGradesByStudent(studentId: string): Promise<Grade[]> {
    const db = getDatabase()
    const q = query(
      collection(db, GRADES_COLLECTION),
      where('studentId', '==', studentId)
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
    await updateDoc(gradeRef, {
      status,
      verifiedBy,
      verifiedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
  },

  // Update grade
  async updateGrade(gradeId: string, data: Partial<Grade>): Promise<void> {
    const db = getDatabase()
    const gradeRef = doc(db, GRADES_COLLECTION, gradeId)
    await updateDoc(gradeRef, {
      ...data,
      updatedAt: Timestamp.now(),
    })
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
    const docRef = doc(db, GRADES_COLLECTION, gradeId)
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

  // Get enrollments for a student
  async getEnrollmentsByStudent(studentId: string): Promise<any[]> {
    const db = getDatabase()
    const q = query(
      collection(db, 'enrollments'),
      where('studentId', '==', studentId)
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
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
  async getCoursesByInstructor(instructorId: string): Promise<any[]> {
    const db = getDatabase()
    const q = query(
      collection(db, 'courses'),
      where('instructor.id', '==', instructorId)
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  },

  // Upsert grade
  async upsertGrade(gradeData: Partial<Grade>): Promise<Grade> {
    const db = getDatabase()
    if (gradeData.id) {
      await this.updateGrade(gradeData.id, gradeData)
      return { ...gradeData } as Grade
    } else {
      return await this.createGrade(gradeData)
    }
  }
}
