/**
 * Standard 3.0 GPA Grading System (Philippine Grading Scale)
 * Used in most Philippine universities
 */

export interface GradeConversion {
  numericGrade: number
  letterGrade: string
  gpa: number
  description: string
  remarks: string
  status: 'passed' | 'failed'
}

/**
 * Convert numeric grade (0-100) to letter grade and GPA
 * Uses standard Philippine 3.0 GPA scale
 */
export const convertNumericToGrade = (score: number): GradeConversion => {
  // Ensure score is within valid range
  const validScore = Math.max(0, Math.min(100, score))

  // Standard 3.0 GPA Scale
  if (validScore >= 90) {
    return {
      numericGrade: validScore,
      letterGrade: 'A',
      gpa: 1.0,
      description: 'Excellent',
      remarks: 'Passed',
      status: 'passed',
    }
  }
  if (validScore >= 87) {
    return {
      numericGrade: validScore,
      letterGrade: 'A-',
      gpa: 1.25,
      description: 'Very Good',
      remarks: 'Passed',
      status: 'passed',
    }
  }
  if (validScore >= 84) {
    return {
      numericGrade: validScore,
      letterGrade: 'B+',
      gpa: 1.5,
      description: 'Good',
      remarks: 'Passed',
      status: 'passed',
    }
  }
  if (validScore >= 80) {
    return {
      numericGrade: validScore,
      letterGrade: 'B',
      gpa: 1.75,
      description: 'Good',
      remarks: 'Passed',
      status: 'passed',
    }
  }
  if (validScore >= 77) {
    return {
      numericGrade: validScore,
      letterGrade: 'B-',
      gpa: 2.0,
      description: 'Satisfactory',
      remarks: 'Passed',
      status: 'passed',
    }
  }
  if (validScore >= 74) {
    return {
      numericGrade: validScore,
      letterGrade: 'C+',
      gpa: 2.25,
      description: 'Fair',
      remarks: 'Passed',
      status: 'passed',
    }
  }
  if (validScore >= 70) {
    return {
      numericGrade: validScore,
      letterGrade: 'C',
      gpa: 2.5,
      description: 'Fair',
      remarks: 'Passed',
      status: 'passed',
    }
  }
  if (validScore >= 67) {
    return {
      numericGrade: validScore,
      letterGrade: 'C-',
      gpa: 2.75,
      description: 'Barely Passing',
      remarks: 'Passed',
      status: 'passed',
    }
  }
  if (validScore >= 65) {
    return {
      numericGrade: validScore,
      letterGrade: 'D',
      gpa: 3.0,
      description: 'Passing',
      remarks: 'Passed',
      status: 'passed',
    }
  }

  // Failed
  return {
    numericGrade: validScore,
    letterGrade: 'F',
    gpa: 4.0,
    description: 'Failure',
    remarks: 'Failed',
    status: 'failed',
  }
}

/**
 * Convert GPA value (1.0 - 4.0) to letter grade
 * Useful when you have GPA and need letter grade
 */
export const convertGPAToLetterGrade = (gpa: number): string => {
  if (gpa <= 1.0) return 'A'
  if (gpa <= 1.25) return 'A-'
  if (gpa <= 1.5) return 'B+'
  if (gpa <= 1.75) return 'B'
  if (gpa <= 2.0) return 'B-'
  if (gpa <= 2.25) return 'C+'
  if (gpa <= 2.5) return 'C'
  if (gpa <= 2.75) return 'C-'
  if (gpa <= 3.0) return 'D'
  return 'F'
}

/**
 * Calculate GPA from array of grades (credits-weighted)
 */
export const calculateWeightedGPA = (
  grades: Array<{ gpa: number; units: number }>
): number => {
  if (grades.length === 0) return 0

  const totalWeightedGPA = grades.reduce((sum, grade) => {
    return sum + grade.gpa * grade.units
  }, 0)

  const totalUnits = grades.reduce((sum, grade) => sum + grade.units, 0)

  return totalUnits > 0 ? parseFloat((totalWeightedGPA / totalUnits).toFixed(2)) : 0
}

/**
 * Convert Philippine 4-point GPA scale to letter grade
 * Based on official Bestlink College of the Philippines grading system
 * 
 * Scale Mapping:
 * 1.00 = 98-100 (A)
 * 1.25 = 95-97  (A-)
 * 1.50 = 92-94  (B+)
 * 1.75 = 89-91  (B)
 * 2.00 = 86-88  (B-)
 * 2.25 = 83-85  (C+)
 * 2.50 = 80-82  (C)
 * 2.75 = 77-79  (C-)
 * 3.00 = 75-76  (D)
 * 5.00 = 1-74   (F - Failing)
 */
export const convertPhilippineGPAToGrade = (gpa: number): GradeConversion => {
  const validGPA = Math.max(1.0, Math.min(5.0, gpa))

  if (validGPA <= 1.0) {
    return {
      numericGrade: 99,
      letterGrade: 'A',
      gpa: 1.0,
      description: 'Excellent',
      remarks: 'Passed',
      status: 'passed',
    }
  }
  if (validGPA <= 1.25) {
    return {
      numericGrade: 96,
      letterGrade: 'A-',
      gpa: 1.25,
      description: 'Very Good',
      remarks: 'Passed',
      status: 'passed',
    }
  }
  if (validGPA <= 1.5) {
    return {
      numericGrade: 93,
      letterGrade: 'B+',
      gpa: 1.5,
      description: 'Good',
      remarks: 'Passed',
      status: 'passed',
    }
  }
  if (validGPA <= 1.75) {
    return {
      numericGrade: 90,
      letterGrade: 'B',
      gpa: 1.75,
      description: 'Satisfactory',
      remarks: 'Passed',
      status: 'passed',
    }
  }
  if (validGPA <= 2.0) {
    return {
      numericGrade: 87,
      letterGrade: 'B-',
      gpa: 2.0,
      description: 'Satisfactory',
      remarks: 'Passed',
      status: 'passed',
    }
  }
  if (validGPA <= 2.25) {
    return {
      numericGrade: 84,
      letterGrade: 'C+',
      gpa: 2.25,
      description: 'Fair',
      remarks: 'Passed',
      status: 'passed',
    }
  }
  if (validGPA <= 2.5) {
    return {
      numericGrade: 81,
      letterGrade: 'C',
      gpa: 2.5,
      description: 'Fair',
      remarks: 'Passed',
      status: 'passed',
    }
  }
  if (validGPA <= 2.75) {
    return {
      numericGrade: 78,
      letterGrade: 'C-',
      gpa: 2.75,
      description: 'Barely Passing',
      remarks: 'Passed',
      status: 'passed',
    }
  }
  if (validGPA <= 3.0) {
    return {
      numericGrade: 75,
      letterGrade: 'D',
      gpa: 3.0,
      description: 'Barely Passing',
      remarks: 'Passed',
      status: 'passed',
    }
  }

  return {
    numericGrade: 50,
    letterGrade: 'F',
    gpa: 5.0,
    description: 'Failing',
    remarks: 'Failed',
    status: 'failed',
  }
}

/**
 * Check if a grade is passing
 */
export const isPassingGrade = (gpa: number): boolean => {
  return gpa < 5.0 // Anything except F (5.0) is passing
}

/**
 * Get grade statistics
 */
export interface GradeStatistics {
  totalCourses: number
  passedCourses: number
  failedCourses: number
  totalUnits: number
  earnedUnits: number
  gpa: number
  passPercentage: number
}

export const calculateGradeStatistics = (
  grades: Array<{ gpa: number; units: number }>
): GradeStatistics => {
  const totalCourses = grades.length
  const passedCourses = grades.filter((g) => isPassingGrade(g.gpa)).length
  const failedCourses = totalCourses - passedCourses
  const totalUnits = grades.reduce((sum, g) => sum + g.units, 0)
  const earnedUnits = grades.reduce((sum, g) => (isPassingGrade(g.gpa) ? sum + g.units : sum), 0)
  const gpa = calculateWeightedGPA(grades)
  const passPercentage = totalCourses > 0 ? (passedCourses / totalCourses) * 100 : 0

  return {
    totalCourses,
    passedCourses,
    failedCourses,
    totalUnits,
    earnedUnits,
    gpa,
    passPercentage,
  }
}
