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
 * Enrolls a student into a batch directly in SQLite
 * Updates enrollments table with foreign keys
 */
function enrollStudentInBatch(req, res, batchId, body) {
  try {
    const studentId = body.student_id || body.studentId;
    const targetBatchId = batchId || body.batch_id || body.batchId;
    const paymentStatus = body.payment_status || body.feeStatus || 'Paid';

    if (!studentId || !targetBatchId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'student_id and batch_id are required' }));
    }

    // Verify batch exists
    const batch = queryOne('SELECT * FROM batches WHERE id = ? OR batch_code = ?', [targetBatchId, targetBatchId]);
    if (!batch) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Batch not found' }));
    }

    // Verify student exists (if student doesn't exist, create automatically)
    let student = queryOne('SELECT * FROM students WHERE id = ? OR email = ?', [studentId, body.email || '']);
    if (!student && body.name) {
      const newStuId = 'stu-' + Date.now();
      const rollNo = 'ROL-' + Math.floor(8000 + Math.random() * 1999);
      execute(`
        INSERT INTO students (id, name, email, phone, roll_number, guardian_name, institute_affiliation)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [newStuId, body.name, body.email || `${body.name.toLowerCase().replace(/\s+/g, '')}@student.alnoor.edu`, body.phone || '+91 98000 11223', rollNo, body.guardian || 'Guardian', 'Jamia Darul Uloom']);
      student = queryOne('SELECT * FROM students WHERE id = ?', [newStuId]);
    }

    if (!student) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Student record not found in database' }));
    }

    // Check if student is ALREADY enrolled in this batch
    const alreadyEnrolled = queryOne(`
      SELECT id FROM enrollments WHERE student_id = ? AND batch_id = ?
    `, [student.id, batch.id]);

    if (alreadyEnrolled) {
      res.writeHead(409, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: false,
        error: `Talib-e-Ilm ${student.name} is already enrolled in batch "${batch.title}".`
      }));
    }

    // Insert new Enrollment record with Foreign Keys
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

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: `Talib-e-Ilm ${student.name} successfully enrolled in ${batch.title}`,
      batch_enrolled_count: currentEnrolledCount ? currentEnrolledCount.count : 1,
      data: fullRecord
    }));
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
 * Creates a brand new student in the database
 */
function createStudent(req, res, body) {
  try {
    const id = body.id || 'stu-' + Date.now();
    const name = body.name || 'Anonymous Student';
    const email = body.email || `student.${Date.now()}@alnoor.edu`;
    const phone = body.phone || '+91 98000 00000';
    const rollNumber = body.roll_number || 'ROL-' + Math.floor(8000 + Math.random() * 1999);
    const guardianName = body.guardian_name || 'Guardian';
    const gender = body.gender || 'Male';
    const instituteAffiliation = body.institute_affiliation || 'Jamia Darul Uloom';

    execute(`
      INSERT INTO students (id, name, email, phone, roll_number, guardian_name, gender, institute_affiliation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, name, email, phone, rollNumber, guardianName, gender, instituteAffiliation]);

    // Also register in users table
    execute(`
      INSERT OR IGNORE INTO users (id, name, email, role, phone, avatar, institute_affiliation)
      VALUES (?, ?, ?, 'student', ?, 'fa-user-graduate', ?)
    `, [`usr-${id}`, name, email, phone, instituteAffiliation]);

    const created = queryOne('SELECT * FROM students WHERE id = ?', [id]);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Student registered in database successfully', data: created }));
  } catch (err) {
    console.error('[createStudent ERROR]', err);
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
  createStudent
};
