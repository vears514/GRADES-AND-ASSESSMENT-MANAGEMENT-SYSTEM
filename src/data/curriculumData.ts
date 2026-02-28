/**
 * BSCS Curriculum Data
 * Based on the curriculum document provided
 */

export interface Subject {
  code: string;
  description: string;
  units: number;
  grade?: string;
  gradePoint?: number;
}

export interface Semester {
  year: number;
  semester: number;
  subjects: Subject[];
  totalUnits: number;
}

export interface CurriculumData {
  semesters: Semester[];
  totalUnitsRequired: number;
}

// Sample curriculum data based on BSCS structure
const curriculumData: CurriculumData = {
  semesters: [
    {
      year: 1,
      semester: 1,
      subjects: [
        { code: 'CS 101', description: 'READING AND APPRECIATION OF LITERATURE', units: 3, grade: 'A', gradePoint: 4.0 },
        { code: 'CS 181', description: 'FUNDAMENTALS OF PROGRAMMING I', units: 3, grade: 'A-', gradePoint: 3.7 },
        { code: 'CS 182', description: 'BUSINESS APPLICATION SOFTWARE', units: 3, grade: 'B+', gradePoint: 3.3 },
        { code: 'CS 802', description: 'READING IN PHILIPPINE HISTORY WITH EMPHASIS ON THE 21ST CENTURY', units: 3, grade: 'A', gradePoint: 4.0 },
        { code: 'GEC 804', description: 'MATHEMATICS IN THE MODERN WORLD', units: 3, grade: 'B+', gradePoint: 3.3 },
        { code: 'NSTP 181', description: 'NSTP CUT 1 1', units: 2, grade: 'A', gradePoint: 4.0 },
        { code: 'PATHFIT 1', description: 'MOVEMENT COMPETENCY TRAINING', units: 2, grade: 'A', gradePoint: 4.0 }
      ],
      totalUnits: 19
    },
    {
      year: 1,
      semester: 2,
      subjects: [
        { code: 'CS 191', description: 'PURPOSIVE COMMUNICATION', units: 3, grade: 'A', gradePoint: 4.0 },
        { code: 'GEC 181', description: 'UNDERSTANDING THE SELF', units: 3, grade: 'A-', gradePoint: 3.7 },
        { code: 'CS 193', description: 'INTERMEDIATE PROGRAMMING', units: 3, grade: 'A', gradePoint: 4.0 },
        { code: 'CS 193', description: 'WEB SYSTEMS AND TECHNOLOGIES', units: 3, grade: 'B+', gradePoint: 3.3 },
        { code: 'CS 188', description: 'TECHNICAL COMPUTER CONCEPTS', units: 3, grade: 'A-', gradePoint: 3.7 },
        { code: 'LIT 081', description: 'PHILIPPINE LITERATURE IN ENGLISH', units: 3, grade: 'A', gradePoint: 4.0 },
        { code: 'NSTP 181', description: 'EXERCISE-BASED FITNESS ACTIVITIES', units: 2, grade: 'A', gradePoint: 4.0 }
      ],
      totalUnits: 20
    },
    {
      year: 2,
      semester: 1,
      subjects: [
        { code: 'CS 184', description: 'DATA STRUCTURES AND ALGORITHMS', units: 3, grade: 'A', gradePoint: 4.0 },
        { code: 'CS 153', description: 'INTRODUCTION TO MANAGEMENT', units: 3, grade: 'A-', gradePoint: 3.7 },
        { code: 'CS 185', description: 'DATABASE MANAGEMENT', units: 3, grade: 'A', gradePoint: 4.0 },
        { code: 'CS 391', description: 'LOGIC CIRCUITS AND INTELLIGENT THEORY', units: 3, grade: 'B+', gradePoint: 3.3 },
        { code: 'CS 188', description: 'DISCRETE STRUCTURES 1', units: 3, grade: 'A', gradePoint: 4.0 },
        { code: 'PR 882', description: 'DIFFERENTIAL CALCULUS', units: 3, grade: 'B+', gradePoint: 3.3 },
        { code: 'PATHFIT 3', description: 'DANCE AND FITNESS', units: 2, grade: 'A', gradePoint: 4.0 }
      ],
      totalUnits: 20
    },
    {
      year: 2,
      semester: 2,
      subjects: [
        { code: 'CS 110', description: 'DIGITAL GRAPHICS', units: 1.88, grade: 'A', gradePoint: 4.0 },
        { code: 'CS 104', description: 'DISCRETE STRUCTURES 1', units: 1.32, grade: 'A-', gradePoint: 3.7 },
        { code: 'CS 109', description: 'PROGRAMMING LANGUAGES', units: 1.32, grade: 'A', gradePoint: 4.0 },
        { code: 'CS 187', description: 'EMBEDDED PROGRAMMING', units: 1.32, grade: 'B+', gradePoint: 3.3 },
        { code: 'GEC 981', description: 'HUMAN COMPUTER INTERACTION', units: 1.32, grade: 'A', gradePoint: 4.0 },
        { code: 'CSM 123', description: 'INTEGRAL CALCULUS', units: 1.88, grade: 'A-', gradePoint: 3.7 },
        { code: 'PATHFIT 4', description: 'SPORTS AND FITNESS', units: 2, grade: 'A', gradePoint: 4.0 }
      ],
      totalUnits: 10.4
    },
    {
      year: 3,
      semester: 1,
      subjects: [
        { code: 'CS 132', description: 'WEB SYSTEMS AND CONCEPTS', units: 1.75, grade: 'A', gradePoint: 4.0 },
        { code: 'CS 139', description: 'SOFTWARE ENGINEERING 1', units: 2.60, grade: 'A-', gradePoint: 3.7 },
        { code: 'CS 135', description: 'SYSTEMS AND COMMUNICATIONS', units: 1.50, grade: 'A', gradePoint: 4.0 },
        { code: 'CS 184', description: 'ALGORITHM AND COMPLEXITY', units: 1.60, grade: 'B+', gradePoint: 3.3 },
        { code: 'CSM 184', description: 'DIGITAL FUNDAMENTALS', units: 2.60, grade: 'A', gradePoint: 4.0 },
        { code: 'GEC 987', description: 'SCIENCE AND TECHNOLOGY', units: 1.25, grade: 'A-', gradePoint: 3.7 },
        { code: 'GEC 988', description: 'ETHICS', units: 1.75, grade: 'A', gradePoint: 4.0 }
      ],
      totalUnits: 13
    },
    {
      year: 3,
      semester: 2,
      subjects: [
        { code: 'CS 184', description: 'APPLICATIONS DEVELOPMENT AND PROGRAMMING', units: 1.75, grade: 'A', gradePoint: 4.0 },
        { code: 'CS 134', description: 'SOFTWARE ENGINEERING 2', units: 1.75, grade: 'A-', gradePoint: 3.7 },
        { code: 'CS 179', description: 'ARCHITECTURE AND ORGANIZATION', units: 2.60, grade: 'A', gradePoint: 4.0 },
        { code: 'CSE 182', description: 'GRAPHICS AND VISUAL COMPUTING', units: 1.58, grade: 'B+', gradePoint: 3.3 },
        { code: 'EC 962', description: 'ART APPRECIATION', units: 1.75, grade: 'A', gradePoint: 4.0 },
        { code: 'GEM 881', description: 'LIFE & WORKS OF RIZAL', units: 1.75, grade: 'A-', gradePoint: 3.7 },
        { code: 'HIS 981', description: 'METHODS OF RESEARCH', units: 1.00, grade: 'A', gradePoint: 4.0 }
      ],
      totalUnits: 12.18
    }
  ],
  totalUnitsRequired: 124
};

export default curriculumData;
