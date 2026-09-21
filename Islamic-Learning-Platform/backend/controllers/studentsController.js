// ============================================================================
// Al-Noor Open Source Islamic Learning Platform — Students & Batch Enrollments Controller
// Provides Relational SQL Queries, JOINs, and Dynamic Exclusions for Batches
// ============================================================================

const { queryAll, queryOne, execute } = require('../database/db');

// 1. Ensure students table exists
execute(`
  CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    roll_number TEXT UNIQUE,
    guardian_name TEXT,
    gender TEXT DEFAULT 'Male',
    age INTEGER DEFAULT 18,
    institute_affiliation TEXT DEFAULT 'Jamia Darul Uloom',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  )
`);

// Ensure enrollments table has indexes
try {
  execute(`CREATE INDEX IF NOT EXISTS idx_enroll_student ON enrollments(student_id)`);
  execute(`CREATE INDEX IF NOT EXISTS idx_enroll_batch ON enrollments(batch_id)`);
} catch {}

// 2. Seed Default Students if table is empty
const studentCount = queryOne('SELECT COUNT(*) as count FROM students');
if (!studentCount || studentCount.count === 0) {
  console.log('[SQLite Backend] Seeding student directory and batch enrollments...');
  
  const defaultStudents = [
    {
      id: 'stu-101',
      user_id: 'usr-student-1',
      name: 'Ahmad Raza',
      email: 'ahmad.raza@example.com',
      phone: '+91 98765 43210',
      roll_number: 'ROL-8821',
      guardian_name: 'Muhammad Farooq',
      gender: 'Male',
      age: 19,
      institute_affiliation: 'Jamia Darul Uloom (Talib-e-Ilm)'
    },
    {
      id: 'stu-102',
      user_id: null,
      name: 'Muhammad Zaid',
      email: 'zaid.m@example.com',
      phone: '+91 98765 00113',
      roll_number: 'ROL-8822',
      guardian_name: 'Tariq Mehmood',
      gender: 'Male',
      age: 20,
      institute_affiliation: 'Jamia Darul Uloom'
    },
    {
      id: 'stu-103',
      user_id: null,
      name: 'Umar Farooq',
      email: 'umar.f@example.com',
      phone: '+91 98765 00114',
      roll_number: 'ROL-8823',
      guardian_name: 'Abdul Ghaffar',
      gender: 'Male',
      age: 17,
      institute_affiliation: 'Hifz Academy'
    },
    {
      id: 'stu-104',
      user_id: null,
      name: 'Bilal Khan',
      email: 'bilal.khan@example.com',
      phone: '+91 98765 00115',
      roll_number: 'ROL-8824',
      guardian_name: 'Jamshed Khan',
      gender: 'Male',
      age: 21,
      institute_affiliation: 'Jamia Darul Uloom'
    },
    {
      id: 'stu-105',
      user_id: null,
      name: 'Abdullah Siddiqui',
      email: 'abdullah.s@example.com',
      phone: '+91 98765 00116',
      roll_number: 'ROL-8825',
      guardian_name: 'Rashid Siddiqui',
      gender: 'Male',
      age: 18,
      institute_affiliation: 'Tajweed Markaz'
    },
    {
      id: 'stu-106',
      user_id: null,
      name: 'Fatima Bint Tariq',
      email: 'fatima.t@example.com',
      phone: '+91 98765 00117',
      roll_number: 'ROL-8826',
      guardian_name: 'Mufti Tariq Masood',
      gender: 'Female',
      age: 19,
      institute_affiliation: 'Shoba-e-Banat'
    },
    {
      id: 'stu-107',
      user_id: null,
      name: 'Zainab Qasim',
      email: 'zainab.q@example.com',
      phone: '+91 98765 00118',
      roll_number: 'ROL-8827',
      guardian_name: 'Maulana Qasim',
      gender: 'Female',
      age: 18,
      institute_affiliation: 'Shoba-e-Banat'
    },
    {
      id: 'stu-108',
      user_id: null,
      name: 'Hamza Ali',
      email: 'hamza.ali@example.com',
      phone: '+91 98765 00119',
      roll_number: 'ROL-8828',
      guardian_name: 'Akbar Ali',
      gender: 'Male',
      age: 22,
      institute_affiliation: 'Jamia Darul Uloom'
    },
    {
      id: 'stu-109',
      user_id: null,
      name: 'Hassan Raza',
      email: 'hassan.raza@example.com',
      phone: '+91 98765 00120',
      roll_number: 'ROL-8829',
      guardian_name: 'Farooq Raza',
      gender: 'Male',
      age: 17,
      institute_affiliation: 'Hifz Academy'
    },
    {
      id: 'stu-110',
      user_id: null,
      name: 'Usman Ghani',
      email: 'usman.g@example.com',
      phone: '+91 98765 00121',
      roll_number: 'ROL-8830',
      guardian_name: 'Ghulam Rasool',
      gender: 'Male',
      age: 20,
      institute_affiliation: 'Jamia Darul Uloom'
    }
  ];

  for (const s of defaultStudents) {
    execute(
      `INSERT OR IGNORE INTO students (id, user_id, name, email, phone, roll_number, guardian_name, gender, age, institute_affiliation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [s.id, s.user_id, s.name, s.email, s.phone, s.roll_number, s.guardian_name, s.gender, s.age, s.institute_affiliation]
    );

    // Also ensure user record exists for authentication
    const userExists = queryOne('SELECT id FROM users WHERE email = ?', [s.email]);
    if (!userExists) {
      execute(
        `INSERT OR IGNORE INTO users (id, name, email, role, phone, avatar, institute_affiliation)
         VALUES (?, ?, ?, 'student', ?, 'fa-user-graduate', ?)`,
        [s.user_id || `usr-${s.id}`, s.name, s.email, s.phone, s.institute_affiliation]
      );
    }
  }

  // Seed initial enrollments for existing batches
  const batches = queryAll('SELECT id, course_id FROM batches LIMIT 3');
  if (batches.length > 0) {
    const b0 = batches[0]; // batch-tj-01
    const b1 = batches[1] || batches[0];
    
    // Enroll Ahmad Raza and Muhammad Zaid in b0
    execute(`INSERT OR IGNORE INTO enrollments (id, student_id, course_id, batch_id, payment_status) VALUES (?, ?, ?, ?, ?)`,
      ['enr-101', 'stu-101', b0.course_id, b0.id, 'Paid']);
    execute(`INSERT OR IGNORE INTO enrollments (id, student_id, course_id, batch_id, payment_status) VALUES (?, ?, ?, ?, ?)`,
      ['enr-102', 'stu-102', b0.course_id, b0.id, 'Paid']);
    
    // Enroll Umar Farooq and Bilal Khan in b1
    execute(`INSERT OR IGNORE INTO enrollments (id, student_id, course_id, batch_id, payment_status) VALUES (?, ?, ?, ?, ?)`,
      ['enr-103', 'stu-103', b1.course_id, b1.id, 'Paid']);
    execute(`INSERT OR IGNORE INTO enrollments (id, student_id, course_id, batch_id, payment_status) VALUES (?, ?, ?, ?, ?)`,
      ['enr-104', 'stu-104', b1.course_id, b1.id, '100% Waqf']);
  }
}

// ============================================================================
// API Handlers with Relational SQL JOINs
// ============================================================================

/**
 * 1. GET /api/v1/students
 * Fetches all registered students with their current batch enrollments count
 */
function getStudents(req, res) {
  try {
    const students = queryAll(`
      SELECT s.*, 
             COUNT(e.id) as total_enrollments,
             GROUP_CONCAT(b.title, ', ') as enrolled_batches
      FROM students s
      LEFT JOIN enrollments e ON s.id = e.student_id
      LEFT JOIN batches b ON e.batch_id = b.id
      GROUP BY s.id
      ORDER BY s.name ASC
    `);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, count: students.length, data: students }));
  } catch (err) {
    console.error('[getStudents ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

/**
 * 2. GET /api/v1/students/available?batch_id=:batchId
 * Returns only students who are NOT YET ENROLLED in the specified batch
 * Uses SQL Subquery with NOT IN (SELECT student_id FROM enrollments WHERE batch_id = ?)
 */
function getAvailableStudentsForBatch(req, res, query) {
  try {
    const batchId = query.batch_id;
    if (!batchId) {
      // If no batch_id specified, return all students
      const allStudents = queryAll(`SELECT * FROM students ORDER BY name ASC`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, count: allStudents.length, data: allStudents }));
    }

    // SQL Exclusion Query: Exclude students already in this batch
    const available = queryAll(`
      SELECT s.* 
      FROM students s
      WHERE s.id NOT IN (
        SELECT e.student_id 
        FROM enrollments e 
        WHERE e.batch_id = ?
      )
      ORDER BY s.name ASC
    `, [batchId]);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      batch_id: batchId,
      count: available.length,
      data: available
    }));
  } catch (err) {
    console.error('[getAvailableStudentsForBatch ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

/**
 * 3. GET /api/v1/batches/:batchId/students OR /api/v1/batch-students?batch_id=:batchId
 * Uses Relational SQL JOIN to return students enrolled in a specific batch
 */
function getBatchStudents(req, res, batchId) {
  try {
    let sql;
    let params = [];

    if (batchId && batchId !== 'all') {
      sql = `
        SELECT 
          e.id as enrollment_id,
          s.id as student_id,
          s.name as student_name,
          s.email,
          s.phone,
          s.roll_number,
          s.gender,
          b.id as batch_id,
          b.title as batch_name,
          b.batch_code,
          c.title as course_title,
          e.payment_status,
          e.created_at as enrolled_at
        FROM enrollments e
        JOIN students s ON e.student_id = s.id
        JOIN batches b ON e.batch_id = b.id
        LEFT JOIN courses c ON b.course_id = c.id
        WHERE b.id = ? OR b.batch_code = ?
        ORDER BY e.created_at DESC
      `;
      params = [batchId, batchId];
    } else {
      // Fetch all enrolled students across all batches
      sql = `
        SELECT 
          e.id as enrollment_id,
          s.id as student_id,
          s.name as student_name,
          s.email,
          s.phone,
          s.roll_number,
          s.gender,
          b.id as batch_id,
          b.title as batch_name,
          b.batch_code,
          c.title as course_title,
          e.payment_status,
          e.created_at as enrolled_at
        FROM enrollments e
        JOIN students s ON e.student_id = s.id
        JOIN batches b ON e.batch_id = b.id
        LEFT JOIN courses c ON b.course_id = c.id
        ORDER BY e.created_at DESC
      `;
    }

    const rows = queryAll(sql, params);
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, count: rows.length, data: rows }));
  } catch (err) {
    console.error('[getBatchStudents ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

/**
 * 4. POST /api/v1/batches/:batchId/enroll OR /api/v1/batch-students
/**
 * Helper to generate random 8-character secure password and username
 */
const crypto = require('crypto');

function hashPassword(plainText) {
  return crypto.createHash('sha256').update(plainText).digest('hex');
}

function generateStudentCredentials(name) {
  const cleanName = (name || 'student').toLowerCase().replace(/[^a-z0-9]/g, '') || 'talib';
  const username = `${cleanName}_${Math.floor(1000 + Math.random() * 9000)}`;
  // Exactly 8 characters: 'Noor' + 4 random digits (e.g. Noor8492)
  const password = `Noor${Math.floor(1000 + Math.random() * 9000)}`;
  const passwordHash = hashPassword(password);
  return { username, password, passwordHash };
}

/**
 * 4. POST /api/v1/batches/:batchId/enroll OR /api/v1/batch-students
 * Enrolls a student into a batch directly in SQLite
 * Updates enrollments table with foreign keys
 */
function enrollStudentInBatch(req, res, batchId, body) {
  try {
    body = body || {};
    // Extract studentId string or student object
    let studentId = null;
    let studentObj = null;

    if (typeof body.student_id === 'object' && body.student_id !== null) {
      studentObj = body.student_id;
      studentId = studentObj.id || null;
    } else if (typeof body.studentId === 'object' && body.studentId !== null) {
      studentObj = body.studentId;
      studentId = studentObj.id || null;
    } else if (typeof body.student_id === 'string') {
      studentId = body.student_id.trim();
    } else if (typeof body.studentId === 'string') {
      studentId = body.studentId.trim();
    }

    const targetBatchId = (batchId || body.batch_id || body.batchId || '').toString().trim();
    const paymentStatus = body.payment_status || body.feeStatus || 'Paid';

    if (!targetBatchId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'batch_id lazmi hai.' }));
    }

    // Verify batch exists
    const batch = queryOne('SELECT * FROM batches WHERE id = ? OR batch_code = ?', [targetBatchId, targetBatchId]);
    if (!batch) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: `Batch "${targetBatchId}" database me nahi mila.` }));
    }

    // Determine student name, email, phone from either body or studentObj
    const studentName = (studentObj ? studentObj.name : body.name) || '';
    const studentEmail = ((studentObj ? studentObj.email : body.email) || '').trim().toLowerCase();
    const studentPhone = (studentObj ? studentObj.phone : body.phone) || '+91 98765 00000';

    let student = null;
    if (studentId) {
      student = queryOne('SELECT * FROM students WHERE id = ?', [studentId]);
    }
    if (!student && studentEmail) {
      student = queryOne('SELECT * FROM students WHERE LOWER(email) = ?', [studentEmail]);
    }

    let generatedCreds = null;

    // If student doesn't exist, create brand new student record with auto credentials!
    if (!student) {
      if (!studentName) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Talib-e-Ilm ka naam ya valid student ID lazmi hai.' }));
      }

      const newStuId = 'stu-' + Date.now();
      const finalEmail = studentEmail || `${studentName.toLowerCase().replace(/[^a-z0-9]/g, '')}${Math.floor(100 + Math.random() * 900)}@student.alnoor.edu`;
      const rollNo = (studentObj && studentObj.roll_number) || body.roll_number || ('ROL-' + Math.floor(8000 + Math.random() * 1999));
      
      generatedCreds = generateStudentCredentials(studentName);
      const userId = 'usr-' + newStuId;

      // 1. Insert into users table FIRST (so foreign key user_id exists)
      execute(`
        INSERT OR REPLACE INTO users (id, name, username, email, password, password_hash, role, phone, institute_affiliation)
        VALUES (?, ?, ?, ?, ?, ?, 'student', ?, ?)
      `, [userId, studentName, generatedCreds.username, finalEmail, generatedCreds.password, generatedCreds.passwordHash, studentPhone, 'Jamia Darul Uloom']);

      // 2. Insert into students table
      execute(`
        INSERT INTO students (id, user_id, name, username, email, phone, roll_number, guardian_name, gender, institute_affiliation)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [newStuId, userId, studentName, generatedCreds.username, finalEmail, studentPhone, rollNo, body.guardian_name || 'Guardian', body.gender || 'Male', body.institute_affiliation || 'Jamia Darul Uloom']);

      student = queryOne('SELECT * FROM students WHERE id = ?', [newStuId]);
    }

    if (!student) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Student record could not be created or found.' }));
    }

    // Check if student is ALREADY enrolled in THIS batch
    const alreadyEnrolled = queryOne(`
      SELECT id FROM enrollments WHERE student_id = ? AND batch_id = ?
    `, [student.id, batch.id]);

    if (alreadyEnrolled) {
      res.writeHead(409, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: false,
        error: `Talib-e-Ilm "${student.name}" pehle se batch "${batch.title}" me enrolled hai.`
      }));
    }

    // Insert new Enrollment record with Foreign Keys (Multi-batch enrollment supported!)
    const enrollmentId = 'enr-' + Date.now();
    execute(`
      INSERT INTO enrollments (id, student_id, course_id, batch_id, payment_status)
      VALUES (?, ?, ?, ?, ?)
    `, [enrollmentId, student.id, batch.course_id, batch.id, paymentStatus]);

    // Update batch enrolled count dynamically
    const currentEnrolledCount = queryOne(`
      SELECT COUNT(*) as count FROM enrollments WHERE batch_id = ?
    `, [batch.id]);

    // Fetch the complete enrolled record via JOIN to return to frontend
    const fullRecord = queryOne(`
      SELECT 
        e.id as enrollment_id,
        s.id as student_id,
        s.name as student_name,
        s.username,
        s.email,
        s.phone,
        s.roll_number,
        b.id as batch_id,
        b.title as batch_name,
        b.batch_code,
        e.payment_status,
        e.created_at as enrolled_at
      FROM enrollments e
      JOIN students s ON e.student_id = s.id
      JOIN batches b ON e.batch_id = b.id
      WHERE e.id = ?
    `, [enrollmentId]);

    // Prepare response with credentials if generated
    const responsePayload = {
      success: true,
      message: `Talib-e-Ilm "${student.name}" kamyabi se batch "${batch.title}" me dakhil kar liya gaya!`,
      batch_enrolled_count: currentEnrolledCount ? currentEnrolledCount.count : 1,
      data: fullRecord
    };

    if (generatedCreds) {
      responsePayload.credentials = {
        student_id: student.id,
        name: student.name,
        username: generatedCreds.username,
        plain_password: generatedCreds.password,
        email: student.email,
        batch_name: batch.title,
        dispatch_message: `Assalamu Alaikum ${student.name}! Aapko Jamia Darul Uloom ke batch "${batch.title}" me dakhil kar liya gaya hai.\n\nAapke Login Credentials:\nUsername: ${generatedCreds.username}\nPassword: ${generatedCreds.password}\nLogin Portal: http://localhost:8085`
      };
    }

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(responsePayload));
  } catch (err) {
    console.error('[enrollStudentInBatch ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

/**
 * 5. DELETE /api/v1/batches/:batchId/students/:studentId
 * Removes a student from a batch and deletes the enrollment record
 */
function removeStudentFromBatch(req, res, batchId, studentId) {
  try {
    const existing = queryOne(`
      SELECT id FROM enrollments WHERE batch_id = ? AND student_id = ?
    `, [batchId, studentId]);

    if (!existing) {
      // Try by enrollment_id
      const byEnrollId = queryOne(`SELECT id, batch_id FROM enrollments WHERE id = ?`, [studentId]);
      if (byEnrollId) {
        execute(`DELETE FROM enrollments WHERE id = ?`, [studentId]);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true, message: 'Student un-enrolled from batch' }));
      }

      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Enrollment record not found' }));
    }

    execute(`DELETE FROM enrollments WHERE batch_id = ? AND student_id = ?`, [batchId, studentId]);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: `Student successfully removed from batch ${batchId}`
    }));
  } catch (err) {
    console.error('[removeStudentFromBatch ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

/**
 * 6. POST /api/v1/students
 * Creates a brand new student in the database with auto-generated credentials
 */
function createStudent(req, res, body) {
  try {
    body = body || {};
    const id = body.id || 'stu-' + Date.now();
    const name = body.name || 'Anonymous Student';
    const email = (body.email || `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}${Math.floor(100 + Math.random() * 900)}@alnoor.edu`).toLowerCase();
    const phone = body.phone || '+91 98000 00000';
    const rollNumber = body.roll_number || 'ROL-' + Math.floor(8000 + Math.random() * 1999);
    const guardianName = body.guardian_name || 'Guardian';
    const gender = body.gender || 'Male';
    const instituteAffiliation = body.institute_affiliation || 'Jamia Darul Uloom';

    const creds = generateStudentCredentials(name);
    const userId = 'usr-' + id;

    // 1. Insert into users table FIRST (so foreign key user_id exists)
    execute(`
      INSERT OR REPLACE INTO users (id, name, username, email, password, password_hash, role, phone, institute_affiliation)
      VALUES (?, ?, ?, ?, ?, ?, 'student', ?, ?)
    `, [userId, name, creds.username, email, creds.password, creds.passwordHash, phone, instituteAffiliation]);

    // 2. Insert into students table
    execute(`
      INSERT INTO students (id, user_id, name, username, email, phone, roll_number, guardian_name, gender, institute_affiliation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, userId, name, creds.username, email, phone, rollNumber, guardianName, gender, instituteAffiliation]);

    const created = queryOne('SELECT * FROM students WHERE id = ?', [id]);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: 'Talib-e-Ilm kamyabi se SQLite database me register ho gaya!',
      data: created,
      credentials: {
        student_id: id,
        name: name,
        username: creds.username,
        plain_password: creds.password,
        email: email,
        dispatch_message: `Assalamu Alaikum ${name}! Al-Noor Islamic Platform par aapka account create kar diya gaya hai.\n\nAapke Login Credentials:\nUsername: ${creds.username}\nPassword: ${creds.password}\nLogin URL: http://localhost:8085`
      }
    }));
  } catch (err) {
    console.error('[createStudent ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

/**
 * 7. GET /api/v1/students/:id/dashboard
 * Strict Student Portal Isolation: Returns ONLY enrolled courses, batches, live classes, homework, and notices
 */
function getStudentDashboard(req, res, studentId) {
  try {
    if (!studentId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'studentId required' }));
    }

    // Lookup student record (by student ID or user ID)
    const student = queryOne('SELECT * FROM students WHERE id = ? OR user_id = ? OR email = ?', [studentId, studentId, studentId]);
    const actualStuId = student ? student.id : studentId;

    // 1. Enrolled Batches
    const batches = queryAll(`
      SELECT 
        b.id, b.title, b.batch_code, b.course_id, 
        c.title as course_title, c.instructor_name as teacher_name, 
        b.class_time, b.schedule_days,
        e.payment_status, e.created_at as enrolled_at
      FROM enrollments e
      JOIN batches b ON e.batch_id = b.id
      LEFT JOIN courses c ON b.course_id = c.id
      WHERE e.student_id = ?
    `, [actualStuId]);

    const batchIds = batches.map(b => b.id);
    const courseIds = batches.map(b => b.course_id).filter(Boolean);

    // 2. Enrolled Courses
    let courses = [];
    if (courseIds.length > 0) {
      const placeholders = courseIds.map(() => '?').join(',');
      courses = queryAll(`SELECT * FROM courses WHERE id IN (${placeholders})`, courseIds);
    }

    // 3. Homework for student's batches
    let homework = [];
    if (batchIds.length > 0) {
      const placeholders = batchIds.map(() => '?').join(',');
      homework = queryAll(`
        SELECT 
          h.*,
          (SELECT status FROM homework_submissions hs WHERE hs.homework_id = h.id AND hs.student_id = ?) as my_submission_status,
          (SELECT marks_awarded FROM homework_submissions hs WHERE hs.homework_id = h.id AND hs.student_id = ?) as my_marks,
          (SELECT teacher_feedback FROM homework_submissions hs WHERE hs.homework_id = h.id AND hs.student_id = ?) as teacher_feedback,
          (SELECT teacher_voice_url FROM homework_submissions hs WHERE hs.homework_id = h.id AND hs.student_id = ?) as teacher_voice_url
        FROM homework h
        WHERE h.batch_id IN (${placeholders})
        ORDER BY h.created_at DESC
      `, [actualStuId, actualStuId, actualStuId, actualStuId, ...batchIds]);
    }

    // 4. Live Classes for student's batches or enrolled courses
    let liveClasses = [];
    if (courseIds.length > 0 || batchIds.length > 0) {
      const allIds = [...new Set([...courseIds, ...batchIds])];
      const placeholders = allIds.map(() => '?').join(',');
      liveClasses = queryAll(`
        SELECT * FROM live_classes 
        WHERE course_id IN (${placeholders}) OR id IN (${placeholders})
        ORDER BY class_date ASC
      `, [...allIds, ...allIds]);
    }

    // Also include public halaqahs
    const publicClasses = queryAll(`SELECT * FROM live_classes WHERE course_id IS NULL OR course_id = '' LIMIT 5`);
    const combinedLive = [...liveClasses, ...publicClasses.filter(p => !liveClasses.some(l => l.id === p.id))];

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      student: student || { id: actualStuId },
      enrolled_batches: batches,
      enrolled_courses: courses,
      homework: homework,
      live_classes: combinedLive
    }));
  } catch (err) {
    console.error('[getStudentDashboard ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

module.exports = {
  getStudents,
  getAvailableStudentsForBatch,
  getBatchStudents,
  enrollStudentInBatch,
  removeStudentFromBatch,
  createStudent,
  getStudentDashboard
};

