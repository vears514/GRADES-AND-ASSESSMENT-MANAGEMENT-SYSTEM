'use client'

import React, { useState } from 'react'
import { authService } from '@/services/authService'
import { getDb } from '@/lib/firebase'
import { doc, setDoc, Timestamp } from 'firebase/firestore'

export default function SeedDataPage() {
    const [status, setStatus] = useState<string>('')
    const [loading, setLoading] = useState(false)

    const handleSeedStudentGrades = async () => {
        setStatus('Seeding student grades...')
        setLoading(true)
        try {
            const authUser = await authService.waitForAuthState()
            if (!authUser) {
                setStatus('Must be logged in to seed data.')
                setLoading(false)
                return
            }

            const db = getDb()
            const profile = await authService.getUserData(authUser.uid)
            const studentId = 'S001'

            const coursesToSeed = [
                {
                    id: 'SEED-CS101',
                    code: 'CS101',
                    name: 'Introduction to computer science "Fundamentals of computer science and programming"',
                    credits: 3,
                    score: 85,
                },
                {
                    id: 'SEED-DS201',
                    code: 'DS201',
                    name: 'Data Structures "Advanced data structures and algorithms"',
                    credits: 3,
                    score: 90,
                },
                {
                    id: 'SEED-DB301',
                    code: 'DS301',
                    name: 'Database System "Relational databases and SQL"',
                    credits: 3,
                    score: 88,
                }
            ]

            for (const courseData of coursesToSeed) {
                const courseRef = doc(db, 'courses', courseData.id)
                await setDoc(courseRef, {
                    id: courseData.id,
                    code: courseData.code,
                    name: courseData.name,
                    department: 'Computer Science',
                    semester: 'FALL',
                    year: 2024,
                    instructor: {
                        id: 'INST100',
                        name: 'Professor Smith'
                    },
                    students: [studentId],
                    credits: courseData.credits,
                    createdAt: Timestamp.now(),
                    isPublished: true
                })

                const enrollmentRef = doc(db, 'enrollments', `${studentId}_${courseData.id}`)
                await setDoc(enrollmentRef, {
                    studentId: studentId,
                    courseId: courseData.id,
                    status: 'enrolled',
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                    semester: 'FALL',
                    academicYear: '2024-2025'
                })

                const gradeRef = doc(db, 'grades', `${studentId}_${courseData.id}`)
                await setDoc(gradeRef, {
                    id: `${studentId}_${courseData.id}`,
                    courseId: courseData.id,
                    studentId: studentId,
                    score: courseData.score,
                    status: 'approved',
                    submittedBy: 'INST100',
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now()
                }, { merge: true })
            }

            const studentRef = doc(db, 'users', authUser.uid)
            await setDoc(studentRef, {
                uid: authUser.uid,
                studentId: profile?.studentId || studentId,
                firstName: profile?.firstName || 'Student',
                lastName: profile?.lastName || 'Test',
                email: profile?.email || authUser.email || '',
                department: profile?.department || 'Computer Science',
                updatedAt: Timestamp.now()
            }, { merge: true })

            setStatus(`✅ Successfully seeded 3 subjects with grades for your account! Go to Grades > Semestral Grade.`)
        } catch (e: any) {
            console.error(e)
            setStatus(`❌ Error: ${e.message}`)
        } finally {
            setLoading(false)
        }
    }

    const handleSeedFacultyGradeEntry = async () => {
        setStatus('Seeding faculty grade entry data...')
        setLoading(true)
        try {
            const authUser = await authService.waitForAuthState()
            if (!authUser) {
                setStatus('Must be logged in to seed data.')
                setLoading(false)
                return
            }

            const db = getDb()
            const facultyId = authUser.uid
            const profile = await authService.getUserData(facultyId)

            if (!profile || (profile.role !== 'faculty' && profile.role !== 'admin')) {
                setStatus(
                    'Current account is not faculty/admin. For safety, this seed no longer changes user roles.\n' +
                    'Log in with a faculty/admin account, then run Seed Faculty Data again.'
                )
                setLoading(false)
                return
            }

            const facultyName = authUser.displayName || `${profile.firstName || 'Faculty'} ${profile.lastName || 'User'}`

            // 2. Create sample students
            const sampleStudents = [
                { id: 'STU-001', firstName: 'Juan', lastName: 'Dela Cruz', studentId: '22016501', email: 'juan.delacruz@student.edu' },
                { id: 'STU-002', firstName: 'JOHNDAVE', lastName: 'Santos', studentId: '22016502', email: 'johndave.santos@student.edu' },
                { id: 'STU-003', firstName: 'Jose', lastName: 'Rizal', studentId: '22016503', email: 'jose.rizal@student.edu' },
                { id: 'STU-004', firstName: 'Andrea', lastName: 'Bonifacio', studentId: '22016504', email: 'andrea.bonifacio@student.edu' },
                { id: 'STU-005', firstName: 'Carlos', lastName: 'Garcia', studentId: '22016505', email: 'carlos.garcia@student.edu' },
            ]

            for (const student of sampleStudents) {
                const studentRef = doc(db, 'users', student.id)
                await setDoc(studentRef, {
                    uid: student.id,
                    firstName: student.firstName,
                    lastName: student.lastName,
                    studentId: student.studentId,
                    email: student.email,
                    role: 'student',
                    department: 'Computer Science',
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now()
                }, { merge: true })
            }

            const studentIds = sampleStudents.map(s => s.id)
            const johnDaveStudent = sampleStudents.find(student => student.firstName === 'JOHNDAVE')

            // 3. Create courses with the current user as instructor
            const coursesToSeed = [
                { id: 'FACULTY-CS101', code: 'CS101', name: 'Introduction to Programming', credits: 3 },
                { id: 'FACULTY-CS201', code: 'CS201', name: 'Data Structures and Algorithms', credits: 3 },
                { id: 'FACULTY-CS301', code: 'CS301', name: 'Database Management Systems', credits: 3 },
            ]

            for (const course of coursesToSeed) {
                const courseRef = doc(db, 'courses', course.id)
                await setDoc(courseRef, {
                    id: course.id,
                    code: course.code,
                    name: course.name,
                    department: 'Computer Science',
                    semester: '1st Semester',
                    year: 2025,
                    instructor: {
                        id: facultyId,
                        name: facultyName
                    },
                    students: studentIds,
                    credits: course.credits,
                    createdAt: Timestamp.now(),
                    isPublished: true
                }, { merge: true })

                // 4. Create enrollments for each student
                for (const studentId of studentIds) {
                    const enrollmentRef = doc(db, 'enrollments', `${studentId}_${course.id}`)
                    await setDoc(enrollmentRef, {
                        studentId: studentId,
                        courseId: course.id,
                        status: 'enrolled',
                        createdAt: Timestamp.now(),
                        updatedAt: Timestamp.now(),
                        semester: '1st Semester',
                        academicYear: '2025-2026'
                    }, { merge: true })
                }

                // 5. Pre-seed an initial grade so one row is not empty in faculty grade entry.
                if (johnDaveStudent && course.id === 'FACULTY-CS101') {
                    const gradeRef = doc(db, 'grades', `${johnDaveStudent.id}_${course.id}`)
                    await setDoc(gradeRef, {
                        id: `${johnDaveStudent.id}_${course.id}`,
                        courseId: course.id,
                        studentId: johnDaveStudent.studentId,
                        score: 88,
                        letterGrade: 'B+',
                        remarks: 'Passed',
                        status: 'draft',
                        submittedBy: facultyId,
                        createdAt: Timestamp.now(),
                        updatedAt: Timestamp.now(),
                    }, { merge: true })
                }
            }

            setStatus(
                `Faculty grade entry data seeded!\n` +
                `- 3 courses created (CS101, CS201, CS301)\n` +
                `- 5 students enrolled in each course\n` +
                `- JOHNDAVE Santos has an initial grade in CS101\n\n` +
                `Go to Faculty > Grade Entry to continue encoding grades.`
            )
        } catch (e: any) {
            console.error(e)
            setStatus(`❌ Error: ${e.message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-10">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-2 text-gray-900">Seed Test Data</h1>
                <p className="mb-8 text-gray-500">Create test data in Firestore for development and testing.</p>

                <div className="space-y-6">
                    {/* Faculty Grade Entry Seed */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-indigo-700 mb-2">🎓 Faculty Grade Entry</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Creates 3 courses (CS101, CS201, CS301) with your account as instructor and enrolls 5 sample students. This action does <strong>not</strong> change your role anymore. After seeding, go to <strong>Faculty &gt; Grade Entry</strong> to encode grades.
                        </p>
                        <button
                            onClick={handleSeedFacultyGradeEntry}
                            disabled={loading}
                            className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold disabled:opacity-50 transition-all"
                        >
                            {loading ? 'Seeding...' : 'Seed Faculty Data'}
                        </button>
                    </div>

                    {/* Student Grades Seed */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-emerald-700 mb-2">📊 Student Semestral Grades</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Creates 3 subjects (Intro to CS, Data Structures, Database System) with mock grades assigned to your account. After seeding, go to <strong>Grades → Semestral Grade</strong>.
                        </p>
                        <button
                            onClick={handleSeedStudentGrades}
                            disabled={loading}
                            className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold disabled:opacity-50 transition-all"
                        >
                            {loading ? 'Seeding...' : 'Seed Student Data'}
                        </button>
                    </div>
                </div>

                {/* Status Output */}
                {status && (
                    <div className={`mt-6 p-4 rounded-lg font-medium text-sm whitespace-pre-line ${status.startsWith('❌') ? 'bg-red-50 text-red-800 border border-red-200' : status.startsWith('✅') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-blue-50 text-blue-800 border border-blue-200'}`}>
                        {status}
                    </div>
                )}
            </div>
        </div>
    )
}


