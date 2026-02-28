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
      where('courseId', '==', courseId),
      orderBy('updatedAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Grade))
  },

  // Get grades for a student
  async getGradesByStudent(studentId: string): Promise<Grade[]> {
    const db = getDatabase()
    const q = query(
      collection(db, GRADES_COLLECTION),
      where('studentId', '==', studentId),
      orderBy('updatedAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Grade))
  },

  // Get pending grades for verification
  async getPendingGrades(limit = 50): Promise<Grade[]> {
    const db = getDatabase()
    const q = query(
      collection(db, GRADES_COLLECTION),
      where('status', '==', 'submitted'),
      orderBy('updatedAt', 'desc'),
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.slice(0, limit).map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Grade))
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
    const docSnap = await getDocs(query(
      collection(db, GRADES_COLLECTION),
      where('id', '==', gradeId)
    ))
    
    if (docSnap.empty) return null
    return {
      id: docSnap.docs[0].id,
      ...docSnap.docs[0].data(),
    } as Grade
  },
}
