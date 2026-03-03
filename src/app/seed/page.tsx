'use client'

import React, { useState } from 'react'
import { authService } from '@/services/authService'
import { getDb } from '@/lib/firebase'
import { doc, setDoc, Timestamp } from 'firebase/firestore'

export default function SeedDataPage() {
    const [status, setStatus] = useState<string>('')

    const handleSeed = async () => {
        setStatus('Seeding started...')
        try {
            const authUser = await authService.waitForAuthState()
            if (!authUser) {
                setStatus('Must be logged in to seed data.')
                return
            }

            const db = getDb()
            const studentId = 'S001'

            // The three specific courses requested
            const coursesToSeed = [
                {
                    id: 'SEED-CS101',
                    code: 'CS101',
                    name: 'Introduction to computer science "Fundamentals of computer science and programming"',
                    credits: 3,
                    score: 85, // Grade: 2.25
                },
                {
                    id: 'SEED-DS201',
                    code: 'DS201',
                    name: 'Data Structures "Advanced data structures and algorithms"',
                    credits: 3,
                    score: 90, // Grade: 1.75
                },
                {
                    id: 'SEED-DB301',
                    code: 'DS301',
                    name: 'Database System "Relational databases and SQL"',
                    credits: 3,
                    score: 88, // Grade: 2.00
                }
            ]

            for (const courseData of coursesToSeed) {
                // 1. Seed Course
                const courseRef = doc(db, 'courses', courseData.id)
                await setDoc(courseRef, {
                    id: courseData.id,
                    code: courseData.code,
                    name: courseData.name,
                    department: 'Computer Science',
                    semester: 'FALL',   // Semestral Grade expects 'FALL' or 'SPRING'
                    year: 2024,
                    instructor: {
                        id: 'INST100',
                        name: 'Professor Smith' // Will show in Teacher col
                    },
                    students: [studentId],
                    credits: courseData.credits,
                    createdAt: Timestamp.now(),
                    isPublished: true
                })

                // 2. Seed Enrollment
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

                // 3. Seed Grade
                const gradeRef = doc(db, 'grades', `${studentId}_${courseData.id}`)
                await setDoc(gradeRef, {
                    id: `${studentId}_${courseData.id}`,
                    courseId: courseData.id,
                    studentId: studentId,
                    score: courseData.score,
                    status: 'approved', // Shows as "Published"
                    submittedBy: 'INST100',
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now()
                }, { merge: true })
            }

            // Seed a Mock Student Profile for 'S001' linked to your User ID
            const studentRef = doc(db, 'users', authUser.uid)
            await setDoc(studentRef, {
                uid: authUser.uid,
                studentId: studentId,
                role: 'student', // Overwriting your role temporarily so you immediately see it on Semestral Grade page if you're not a student
                firstName: 'Student',
                lastName: 'Test',
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            }, { merge: true })

            setStatus(`Successfully seeded 3 specific subjects (Intro to CS, Data Structures, DB Systems) with grades for your account! Go to Grades > Semestral Grade.`)

        } catch (e: any) {
            console.error(e)
            setStatus(`Error: ${e.message}`)
        }
    }

    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold mb-4">Seed 3 Specific Subjects</h1>
            <p className="mb-4 text-gray-600">This will create "Introduction to CS", "Data Structures", and "Database System" with mock grades assigned to you.</p>
            <button
                onClick={handleSeed}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-semibold"
            >
                Run Specific Seed
            </button>
            {status && (
                <div className="mt-4 p-4 bg-green-100 text-green-900 rounded font-semibold text-sm">
                    {status}
                </div>
            )}
        </div>
    )
}
