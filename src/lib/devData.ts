const DEV_DATA_PREFIXES = ['SEED-', 'FACULTY-', 'DEMO-'] as const

const normalizeIdentifier = (value: unknown) => {
  return typeof value === 'string' ? value.trim().toUpperCase() : ''
}

export const isDevIdentifier = (value: unknown) => {
  const normalized = normalizeIdentifier(value)
  return DEV_DATA_PREFIXES.some((prefix) => normalized.startsWith(prefix))
}

export const isDevGradeRecord = (grade: unknown) => {
  if (!grade || typeof grade !== 'object') {
    return false
  }

  const record = grade as Record<string, unknown>

  return (
    isDevIdentifier(record.id) ||
    isDevIdentifier(record.courseId) ||
    isDevIdentifier(record.studentId) ||
    isDevIdentifier(record.submittedBy) ||
    isDevIdentifier(record.publishedBy) ||
    isDevIdentifier(record.verifiedBy)
  )
}

export const isDevEnrollmentRecord = (enrollment: unknown) => {
  if (!enrollment || typeof enrollment !== 'object') {
    return false
  }

  const record = enrollment as Record<string, unknown>

  return (
    isDevIdentifier(record.id) ||
    isDevIdentifier(record.courseId) ||
    isDevIdentifier(record.studentId)
  )
}

export const isDevCourseRecord = (course: unknown) => {
  if (!course || typeof course !== 'object') {
    return false
  }

  const record = course as Record<string, unknown>

  return isDevIdentifier(record.id)
}

export const isDevUserRecord = (user: unknown) => {
  if (!user || typeof user !== 'object') {
    return false
  }

  const record = user as Record<string, unknown>
  const email = typeof record.email === 'string' ? record.email.toLowerCase() : ''

  return isDevIdentifier(record.id) || email.endsWith('@demo.com')
}
