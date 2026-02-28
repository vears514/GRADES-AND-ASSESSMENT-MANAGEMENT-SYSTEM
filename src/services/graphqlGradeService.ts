/**
 * GraphQL Grade Service
 * Handles fetching student grades from the GraphQL API
 */

interface StudentGrade {
  id: string
  subjectCode: string
  subject: string
  subjectTeacher: string
  units: number
  numericGrade: number
  semester: string
  status: 'published' | 'draft' | 'submitted' | 'approved'
}

interface GraphQLGrade {
  id: string
  subject_class_id: string
  grade: string
  class_status: string
  dropped: boolean
  subject_class: {
    curriculum_subject: {
      curriculum_subject_code: string
      units: number
      subject: {
        subject_title: string
        subject_code: string
      }
    }
    subject_teacher: {
      fname: string
      mname: string
      lname: string
    }
    section: {
      academic_year: {
        semester: string
        acYear: string
      }
    }
  }
}

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:3001/graphql'

/**
 * Convert GraphQL grade response to StudentGrade format
 */
export const convertGraphQLGradeToStudentGrade = (graphqlGrade: GraphQLGrade): StudentGrade => {
  const gradeNumeric = parseFloat(graphqlGrade.grade)
  const subject = graphqlGrade.subject_class.curriculum_subject.subject
  const teacher = graphqlGrade.subject_class.subject_teacher
  const curriculumSubject = graphqlGrade.subject_class.curriculum_subject
  const academicYear = graphqlGrade.subject_class.section.academic_year

  return {
    id: graphqlGrade.id,
    subjectCode: subject.subject_code,
    subject: subject.subject_title,
    subjectTeacher: `${teacher.fname} ${teacher.mname} ${teacher.lname}`,
    units: curriculumSubject.units,
    numericGrade: gradeNumeric,
    semester: `${academicYear.semester} Semester ${academicYear.acYear}`,
    status: 'published',
  }
}

/**
 * Fetch student grades from GraphQL API
 */
export const fetchStudentGrades = async (studentId: string): Promise<StudentGrade[]> => {
  try {
    const query = `
      query GetAuthStudentClasses {
        getAuthStudentClasses {
          items {
            id
            subject_class_id
            grade
            class_status
            dropped
            subject_class {
              curriculum_subject {
                curriculum_subject_code
                units
                subject {
                  subject_title
                  subject_code
                }
              }
              subject_teacher {
                fname
                mname
                lname
              }
              section {
                academic_year {
                  semester
                  acYear
                }
              }
            }
          }
        }
      }
    `

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify({ query }),
    })

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.errors) {
      throw new Error(`GraphQL error: ${data.errors[0].message}`)
    }

    const graphqlGrades: GraphQLGrade[] = data.data.getAuthStudentClasses.items
    return graphqlGrades
      .filter((g) => !g.dropped) // Filter out dropped classes
      .map(convertGraphQLGradeToStudentGrade)
  } catch (error) {
    console.error('Failed to fetch student grades:', error)
    throw error
  }
}

/**
 * Group grades by semester
 */
export const groupGradesBySemester = (
  grades: StudentGrade[]
): Record<string, StudentGrade[]> => {
  return grades.reduce(
    (acc, grade) => {
      if (!acc[grade.semester]) {
        acc[grade.semester] = []
      }
      acc[grade.semester].push(grade)
      return acc
    },
    {} as Record<string, StudentGrade[]>
  )
}
