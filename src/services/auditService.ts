import { collection, addDoc, getDocs, limit, orderBy, query, Timestamp } from 'firebase/firestore'
import { getDb } from '@/lib/firebase'

const AUDIT_COLLECTION = 'auditLogs'

const getDatabase = () => {
  const db = getDb()
  if (!db) {
    throw new Error('Firebase database not initialized')
  }
  return db
}

type AuditPayload = {
  action: string
  entityType: string
  entityId?: string
  userId?: string
  description?: string
  changes?: Record<string, any>
}

export const auditService = {
  async record(payload: AuditPayload) {
    const db = getDatabase()
    const data = {
      ...payload,
      changes: payload.changes || {},
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    }

    const docRef = await addDoc(collection(db, AUDIT_COLLECTION), data)
    return { id: docRef.id, ...data }
  },

  async getRecent(max = 10) {
    const db = getDatabase()
    const q = query(collection(db, AUDIT_COLLECTION), orderBy('timestamp', 'desc'), limit(max))
    const snap = await getDocs(q)
    return snap.docs.map(doc => {
      const data = doc.data() as any
      const ts = data?.timestamp?.toDate?.() || new Date()
      return {
        id: doc.id,
        ...data,
        timestamp: ts.toLocaleString(),
      }
    })
  },
}
