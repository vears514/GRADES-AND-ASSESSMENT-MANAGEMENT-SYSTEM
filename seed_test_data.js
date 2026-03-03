const admin = require('firebase-admin');
const fs = require('fs');

async function seedData() {
    const serviceAccount = JSON.parse(fs.readFileSync('./gradehub-beltran-firebase-adminsdk-fbsvc-be10c82a84.json', 'utf8'));

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }

    const db = admin.firestore();

    try {
        console.log('Fetching users...');
        const usersSnap = await db.collection('users').get();
        let facultyId = null;
        const students = [];

        usersSnap.forEach(doc => {
            const data = doc.data();
            console.log(`User: ${doc.id} - ${data.firstName} ${data.lastName} (${data.role})`);
            if (data.role === 'faculty') {
                facultyId = doc.id;
            } else if (data.role === 'student') {
                students.push(doc.id);
            }
        });

        if (!facultyId) {
            console.log('No faculty found. Creating a test faculty...');
            const facultyRef = db.collection('users').doc();
            await facultyRef.set({
                firstName: 'Test',
                lastName: 'Faculty',
                role: 'faculty',
                email: 'faculty@test.com',
                createdAt: new Date(),
                updatedAt: new Date()
            });
            facultyId = facultyRef.id;
            console.log('Created faculty with ID:', facultyId);
        }

        if (students.length === 0) {
            console.log('No students found. Creating a test student...');
            const studentRef = db.collection('users').doc();
            await studentRef.set({
                firstName: 'John',
                lastName: 'Dave JD',
                role: 'student',
                email: 'johndave@test.com',
                createdAt: new Date(),
                updatedAt: new Date()
            });
            students.push(studentRef.id);
            console.log('Created student with ID:', studentRef.id);
        }

        console.log(`Using Faculty ID: ${facultyId}`);
        console.log(`Enrolling Students:`, students);

        // Create a course
        const courseRef = db.collection('courses').doc('TEST-COURSE-101');
        await courseRef.set({
            code: 'CS101',
            name: 'Introduction to Computer Science',
            department: 'Computer Science',
            semester: '1st Semester',
            year: 2024,
            instructor: {
                id: facultyId,
                name: 'Test Faculty'
            },
            students: students,
            credits: 3,
            createdAt: new Date(),
            isPublished: true
        }, { merge: true });

        console.log('Course TEST-COURSE-101 seeded successfully.');

        // Enrol students (if needed by other parts of the app)
        for (const studentId of students) {
            const enrollmentRef = db.collection('enrollments').doc(`${studentId}_TEST-COURSE-101`);
            await enrollmentRef.set({
                studentId: studentId,
                courseId: 'TEST-COURSE-101',
                status: 'enrolled',
                createdAt: new Date(),
                updatedAt: new Date(),
                semester: '1st Semester',
                academicYear: '2024-2025'
            }, { merge: true });
            console.log(`Enrolled student ${studentId} in TEST-COURSE-101`);
        }

        console.log('Seeding complete.');
    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        process.exit(0);
    }
}

seedData();
