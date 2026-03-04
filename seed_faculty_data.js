const admin = require('firebase-admin');
const fs = require('fs');

async function seedFacultyData() {
    const serviceAccount = JSON.parse(fs.readFileSync('./gradehub-beltran-firebase-adminsdk-fbsvc-be10c82a84.json', 'utf8'));

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }

    const db = admin.firestore();

    try {
        // 1. Find the current user (most recently updated, or admin/faculty)
        console.log('Finding users...');
        const usersSnap = await db.collection('users').get();
        let targetUserId = null;
        let targetUserName = 'Faculty User';

        usersSnap.forEach(doc => {
            const data = doc.data();
            console.log(`  User: ${doc.id} - ${data.firstName || ''} ${data.lastName || ''} (${data.role}) [${data.email || 'no email'}]`);
            // Use the first user we find (or last admin/faculty)
            if (!targetUserId) {
                targetUserId = doc.id;
                targetUserName = `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Faculty User';
            }
        });

        if (!targetUserId) {
            console.log('No users found! Please log in first.');
            process.exit(1);
        }

        console.log(`\nUsing user: ${targetUserId} (${targetUserName})`);

        // 2. Keep existing user role intact to avoid accidental role corruption.
        console.log('\nPreserving current role for target user (no role overwrite).');

        // 3. Create sample students
        console.log('Creating sample students...');
        const sampleStudents = [
            { id: 'STU-001', firstName: 'Juan', lastName: 'Dela Cruz', studentId: '22016501', email: 'juan.delacruz@student.edu' },
            { id: 'STU-002', firstName: 'JOHNDAVE', lastName: 'Santos', studentId: '22016502', email: 'johndave.santos@student.edu' },
            { id: 'STU-003', firstName: 'Jose', lastName: 'Rizal', studentId: '22016503', email: 'jose.rizal@student.edu' },
            { id: 'STU-004', firstName: 'Andrea', lastName: 'Bonifacio', studentId: '22016504', email: 'andrea.bonifacio@student.edu' },
            { id: 'STU-005', firstName: 'Carlos', lastName: 'Garcia', studentId: '22016505', email: 'carlos.garcia@student.edu' },
        ];

        for (const student of sampleStudents) {
            await db.collection('users').doc(student.id).set({
                uid: student.id,
                firstName: student.firstName,
                lastName: student.lastName,
                studentId: student.studentId,
                email: student.email,
                role: 'student',
                department: 'Computer Science',
                createdAt: new Date(),
                updatedAt: new Date()
            }, { merge: true });
            console.log(`  Created student: ${student.firstName} ${student.lastName}`);
        }

        const studentIds = sampleStudents.map(s => s.id);
        const johnDaveStudent = sampleStudents.find((student) => student.firstName === 'JOHNDAVE');

        // 4. Create courses with the target user as instructor
        console.log('\nCreating courses...');
        const courses = [
            { id: 'FACULTY-CS101', code: 'CS101', name: 'Introduction to Programming', credits: 3 },
            { id: 'FACULTY-CS201', code: 'CS201', name: 'Data Structures and Algorithms', credits: 3 },
            { id: 'FACULTY-CS301', code: 'CS301', name: 'Database Management Systems', credits: 3 },
        ];

        for (const course of courses) {
            await db.collection('courses').doc(course.id).set({
                id: course.id,
                code: course.code,
                name: course.name,
                department: 'Computer Science',
                semester: '1st Semester',
                year: 2025,
                instructor: {
                    id: targetUserId,
                    name: targetUserName
                },
                students: studentIds,
                credits: course.credits,
                createdAt: new Date(),
                isPublished: true
            }, { merge: true });
            console.log(`  Created course: ${course.code} - ${course.name}`);

            // 5. Create enrollments
            for (const studentId of studentIds) {
                await db.collection('enrollments').doc(`${studentId}_${course.id}`).set({
                    studentId: studentId,
                    courseId: course.id,
                    status: 'enrolled',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    semester: '1st Semester',
                    academicYear: '2025-2026'
                }, { merge: true });
            }

            // 6. Pre-seed one visible grade for JOHNDAVE in CS101.
            if (johnDaveStudent && course.id === 'FACULTY-CS101') {
                await db.collection('grades').doc(`${johnDaveStudent.id}_${course.id}`).set({
                    id: `${johnDaveStudent.id}_${course.id}`,
                    courseId: course.id,
                    studentId: johnDaveStudent.studentId,
                    score: 88,
                    letterGrade: 'B+',
                    remarks: 'Passed',
                    status: 'draft',
                    submittedBy: targetUserId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }, { merge: true });
            }
        }

        console.log('\n✅ DONE! Faculty grade entry data seeded successfully.');
        console.log('   • Target user role preserved (no overwrite)');
        console.log('   • 3 courses created (CS101, CS201, CS301)');
        console.log('   • 5 students enrolled in each course');
        console.log('\n   Refresh the page and go to Faculty > Grade Entry to encode grades!');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit(0);
    }
}

seedFacultyData();

