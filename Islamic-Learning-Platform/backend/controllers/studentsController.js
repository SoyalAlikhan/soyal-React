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

// 2. Student seeding is now handled by seed.js — no inline seeding needed


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
          e.course_id,
          s.id as student_id,
          s.user_id,
          s.name as student_name,
          s.email,
          s.phone,
          s.roll_number,
          s.gender,
          b.id as batch_id,
          b.title as batch_name,
          b.batch_code,
          b.instructor_name as batch_instructor,
          b.teacher_id,
          c.title as course_title,
          c.instructor_name as course_instructor,
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
          e.course_id,
          s.id as student_id,
          s.user_id,
          s.name as student_name,
          s.email,
          s.phone,
          s.roll_number,
          s.gender,
          b.id as batch_id,
          b.title as batch_name,
          b.batch_code,
          b.instructor_name as batch_instructor,
          b.teacher_id,
          c.title as course_title,
          c.instructor_name as course_instructor,
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
const { sendWelcomeEmail } = require('../services/emailService');

function hashPassword(plainText) {
  return crypto.createHash('sha256').update(plainText).digest('hex');
}

function generateStudentCredentials(name, instSlug = null) {
  const cleanName = (name || 'student').toLowerCase().replace(/[^a-z0-9]/g, '') || 'talib';
  let username;
  if (instSlug) {
    username = `${cleanName}_${instSlug}`;
  } else {
    username = `${cleanName}_${Math.floor(1000 + Math.random() * 9000)}`;
  }
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
async function enrollStudentInBatch(req, res, batchId, body) {
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
    } else if (typeof body.student === 'object' && body.student !== null) {
      studentObj = body.student;
      studentId = studentObj.id || null;
    } else if (typeof body.student_id === 'string') {
      studentId = body.student_id.trim();
    } else if (typeof body.studentId === 'string') {
      studentId = body.studentId.trim();
    } else if (body.name || body.student_name) {
      studentObj = body;
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

    // Determine institute affiliation from batch, teacher, course, or request body
    let resolvedInstituteName = body.institute_name || body.institute_affiliation || null;
    let instSlug = null;

    if (!resolvedInstituteName && (batch.teacher_id || batch.instructor_name)) {
      const teacher = queryOne("SELECT institute_affiliation FROM users WHERE (id = ? OR name = ?) AND role = 'teacher'", [batch.teacher_id, batch.instructor_name]);
      if (teacher && teacher.institute_affiliation && !teacher.institute_affiliation.toLowerCase().includes('independent')) {
        resolvedInstituteName = teacher.institute_affiliation;
      }
    }

    if (!resolvedInstituteName && batch.course_id) {
      const courseRec = queryOne("SELECT institute_id FROM courses WHERE id = ?", [batch.course_id]);
      if (courseRec && courseRec.institute_id && courseRec.institute_id !== 'independent') {
        const instRec = queryOne("SELECT legal_name, subdomain FROM institutes WHERE id = ?", [courseRec.institute_id]);
        if (instRec) {
          resolvedInstituteName = instRec.legal_name;
        }
      }
    }

    if (resolvedInstituteName) {
      const lowerAff = resolvedInstituteName.toLowerCase();
      if (!lowerAff.includes('independent')) {
        let slug = lowerAff.replace(/[^a-z0-9]/g, '');
        if (slug.includes('alfurqan')) instSlug = 'alfurqan';
        else if (slug.includes('darululoom')) instSlug = 'darululoom';
        else instSlug = slug.slice(0, 10) || 'institute';
      } else {
        resolvedInstituteName = null;
      }
    }

    // Determine student name, email, phone from either body or studentObj
    const studentName = (studentObj ? (studentObj.name || studentObj.student_name) : (body.name || body.student_name)) || '';
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
      let rollNo = (studentObj && studentObj.roll_number) || body.roll_number || ('ROL-' + Math.floor(10000 + Math.random() * 89999));
      const existingRoll = queryOne('SELECT id FROM students WHERE roll_number = ?', [rollNo]);
      if (existingRoll) {
        rollNo = 'ROL-' + Date.now().toString().slice(-6);
      }
      
      generatedCreds = generateStudentCredentials(studentName, instSlug);
      // Ensure unique username
      const existingUserU = queryOne('SELECT id FROM users WHERE username = ?', [generatedCreds.username]);
      if (existingUserU) {
        generatedCreds.username = `${generatedCreds.username}_${Math.floor(100 + Math.random() * 900)}`;
      }

      const userId = 'usr-' + newStuId;
      const finalAffiliation = resolvedInstituteName || 'Independent Student';

      // 1. Insert into users table FIRST (so foreign key user_id exists)
      execute(`
        INSERT OR REPLACE INTO users (id, name, username, email, password, password_hash, role, phone, institute_affiliation)
        VALUES (?, ?, ?, ?, ?, ?, 'student', ?, ?)
      `, [userId, studentName, generatedCreds.username, finalEmail, generatedCreds.password, generatedCreds.passwordHash, studentPhone, finalAffiliation]);

      // 2. Insert into students table
      execute(`
        INSERT INTO students (id, user_id, name, username, email, phone, roll_number, guardian_name, gender, institute_affiliation)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [newStuId, userId, studentName, generatedCreds.username, finalEmail, studentPhone, rollNo, body.guardian_name || 'Guardian', body.gender || 'Male', finalAffiliation]);

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
      data: fullRecord
    };

    // Fetch course & teacher information for email and notification dispatch
    const course = queryOne('SELECT * FROM courses WHERE id = ?', [batch.course_id]);
    const courseTitle = course ? course.title : 'Islamic Studies';
    const courseArabicTitle = (course && course.arabic_title) ? ` (${course.arabic_title})` : '';
    const fullCourseTitle = courseTitle + courseArabicTitle;
    const instructorName = batch.instructor_name || (course ? course.instructor_name : 'Ustadh Bilal Ahmed');
    const courseLevel = (course && course.level) || 'All Levels';
    const courseMode = (course && course.mode) || 'Interactive Live Halaqah';
    const courseDuration = (course && course.duration) || 'Ongoing';
    const classTime = batch.class_time || '07:00 AM';
    const scheduleDays = batch.schedule_days || 'Mon, Wed, Fri';
    const batchCode = batch.batch_code ? `[${batch.batch_code}] ` : '';
    const feeInfo = (course && (course.tuition_type === 'free' || !course.fee_amount)) 
      ? 'Bila Muawaza (Free / Waqf)' 
      : (course ? `₹${course.fee_amount} (${course.tuition_type || 'Standard'})` : 'Standard');
    const courseDesc = (course && course.description) ? course.description : '';

    // Generate secure password reset token and link
    const resetToken = 'rst_' + crypto.randomBytes(16).toString('hex');
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    const usernameForLogin = (generatedCreds ? generatedCreds.username : (student.username || student.name.toLowerCase().replace(/[^a-z0-9]/g, '')));
    let studentUserId = student.user_id;
    const existingUser = queryOne('SELECT id FROM users WHERE email = ? OR username = ?', [student.email.toLowerCase(), usernameForLogin.toLowerCase()]);
    if (existingUser) {
      studentUserId = existingUser.id;
      execute('UPDATE students SET user_id = ? WHERE id = ?', [studentUserId, student.id]);
    } else if (!studentUserId || !queryOne('SELECT id FROM users WHERE id = ?', [studentUserId])) {
      studentUserId = 'usr-' + student.id;
      try {
        execute(`INSERT INTO users (id, name, username, email, password, role) VALUES (?, ?, ?, ?, ?, 'student')`,
          [studentUserId, student.name, usernameForLogin, student.email.toLowerCase(), 'student123']
        );
      } catch (errIns) {
        // Fallback to student-1 if any constraint conflicts
        const fallback = queryOne("SELECT id FROM users WHERE role = 'student' LIMIT 1");
        if (fallback) studentUserId = fallback.id;
      }
      execute(`UPDATE students SET user_id = ? WHERE id = ?`, [studentUserId, student.id]);
    }

    try {
      execute(`
        INSERT OR REPLACE INTO password_resets (identifier, token, otp, expires_at, user_id)
        VALUES (?, ?, ?, ?, ?)
      `, [student.email.toLowerCase(), resetToken, Math.floor(100000 + Math.random() * 900000).toString(), expiresAt, studentUserId]);

      if (usernameForLogin) {
        execute(`
          INSERT OR REPLACE INTO password_resets (identifier, token, otp, expires_at, user_id)
          VALUES (?, ?, ?, ?, ?)
        `, [usernameForLogin.toLowerCase(), resetToken, Math.floor(100000 + Math.random() * 900000).toString(), expiresAt, studentUserId]);
      }
    } catch (e) {
      console.warn('[RESET TOKEN WARNING]', e.message);
    }

    const resetLink = `http://localhost:8085/?reset_token=${resetToken}&user=${encodeURIComponent(usernameForLogin)}`;

    // Detailed in-app Notification for student with full course & batch details
    const notifTitle = `🎉 Naye Course me Dakhila: ${courseTitle}`;
    const notifMessage = 
      `Assalamu Alaikum wa Rahmatullahi wa Barakatuh!\n` +
      `Mubarak ho! Ustad ${instructorName} ne aapko naye course "${fullCourseTitle}" ke batch "${batch.title}" ${batchCode}me dakhil kar liya hai.\n\n` +
      `📋 COURSE & BATCH DETAILS:\n` +
      `• Course: ${fullCourseTitle}\n` +
      `• Batch: ${batch.title} ${batchCode}\n` +
      `• Ustad / Teacher: ${instructorName}\n` +
      `• Class Timings: ${classTime}\n` +
      `• Schedule Days: ${scheduleDays}\n` +
      `• Level & Mode: ${courseLevel} · ${courseMode}\n` +
      `• Duration: ${courseDuration}\n` +
      `• Fee Model: ${feeInfo}` +
      (courseDesc ? `\n• Overview: ${courseDesc}` : '');

    try {
      let validUid = studentUserId;
      if (!validUid && student.email) {
        const uRow = queryOne('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [student.email]);
        if (uRow) validUid = uRow.id;
      }
      if (validUid) {
        const notifId = 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
        execute(`
          INSERT INTO notifications (id, user_id, type, title, message, link)
          VALUES (?, ?, 'course_enrollment', ?, ?, ?)
        `, [
          notifId,
          validUid,
          notifTitle,
          notifMessage,
          '#courses'
        ]);
      }
    } catch (e) {
      console.warn('[ENROLL NOTIF WARNING]', e.message);
    }

    // Construct full simulated email dispatch payload
    const isExistingStudent = !generatedCreds;
    const instHeader = resolvedInstituteName || 'School of Deeni Ilm';
    const emailSubject = isExistingStudent 
      ? `✦ Course Enrollment Confirmation — ${courseTitle} (${batch.title})`
      : `✦ Welcome to ${instHeader} — Enrolled in ${courseTitle} (${batch.title})`;

    const emailText = isExistingStudent
      ? `Assalamu Alaikum wa Rahmatullahi wa Barakatuh ${student.name},\n\n` +
        `Mubarak ho! Aapko ${instHeader} ke naye course "${fullCourseTitle}" ke batch "${batch.title}" me shamil kar liya gaya hai.\n\n` +
        `📚 COURSE & BATCH DETAILS:\n` +
        `• Institute: ${instHeader}\n` +
        `• Course: ${fullCourseTitle}\n` +
        `• Batch: ${batch.title} (${batch.batch_code || ''})\n` +
        `• Teacher / Ustad: ${instructorName}\n` +
        `• Timings: ${classTime}\n` +
        `• Schedule Days: ${scheduleDays}\n` +
        `• Level & Mode: ${courseLevel} · ${courseMode}\n` +
        `• Duration: ${courseDuration}\n` +
        `• Fee Model: ${feeInfo}\n` +
        (courseDesc ? `• Overview: ${courseDesc}\n\n` : `\n`) +
        `🔐 YOUR LOGIN ACCESS:\n` +
        `• Portal URL: http://localhost:8085\n` +
        `• Username: ${usernameForLogin}\n` +
        `• Password: Aapka pehle se set kiya hua password hi is naye course ke liye chalega.\n\n` +
        `Agar aap password bhool gaye hain to is link se reset kar sakte hain:\n${resetLink}\n\n` +
        `JazakAllahu Khaira,\n${instHeader} Administration`
      : `Assalamu Alaikum wa Rahmatullahi wa Barakatuh ${student.name},\n\n` +
        `Mubarak ho! Aapko ${instHeader} ke course "${fullCourseTitle}" ke batch "${batch.title}" me kamyabi se enroll kar liya gaya hai.\n\n` +
        `📚 COURSE & BATCH DETAILS:\n` +
        `• Institute: ${instHeader}\n` +
        `• Course: ${fullCourseTitle}\n` +
        `• Batch: ${batch.title} (${batch.batch_code || ''})\n` +
        `• Teacher / Ustad: ${instructorName}\n` +
        `• Timings: ${classTime}\n` +
        `• Schedule Days: ${scheduleDays}\n` +
        `• Level & Mode: ${courseLevel} · ${courseMode}\n` +
        `• Duration: ${courseDuration}\n` +
        `• Fee Model: ${feeInfo}\n` +
        (courseDesc ? `• Overview: ${courseDesc}\n\n` : `\n`) +
        `🔐 YOUR LOGIN CREDENTIALS:\n` +
        `• Portal URL: http://localhost:8085\n` +
        `• Username: ${usernameForLogin}\n` +
        `• Temporary Password: ${generatedCreds ? generatedCreds.password : '(Use reset link below)'}\n\n` +
        `🔗 PASSWORD RESET LINK (BRD 41.1):\n` +
        `Aap niche diye gaye link par click karke apna naya password set kar sakte hain:\n` +
        `${resetLink}\n\n` +
        `JazakAllahu Khaira,\n${instHeader} Administration`;

    console.log(`[DISPATCH EMAIL SIMULATION] To: ${student.email}`);
    console.log(`[DISPATCH EMAIL SUBJECT] ${emailSubject}`);
    console.log(`[DISPATCH EMAIL RESET LINK] ${resetLink}`);

    // Real Email Dispatch via SMTP / Nodemailer
    let emailResult = { success: false };
    try {
      emailResult = await sendWelcomeEmail({
        to: student.email,
        studentName: student.name,
        instituteName: resolvedInstituteName,
        courseTitle: fullCourseTitle,
        batchTitle: batch.title,
        batchCode: batch.batch_code,
        classTime: classTime,
        scheduleDays: scheduleDays,
        instructorName: instructorName,
        courseLevel: courseLevel,
        courseMode: courseMode,
        courseDuration: courseDuration,
        courseFee: feeInfo,
        courseDescription: courseDesc,
        username: usernameForLogin,
        tempPassword: generatedCreds ? generatedCreds.password : 'Student@2026',
        isExistingStudent: isExistingStudent,
        resetUrl: resetLink
      });
      console.log(`[STUDENT ENROLL] Real email dispatch result for ${student.email}:`, emailResult.success);
    } catch (e) {
      console.warn('[STUDENT ENROLL] Email dispatch error:', e.message);
    }

    responsePayload.student_id = student.id;
    responsePayload.user_id = studentUserId;
    responsePayload.username = usernameForLogin;
    responsePayload.email = student.email;
    responsePayload.institute_name = resolvedInstituteName;
    responsePayload.course_title = fullCourseTitle;
    responsePayload.batch_title = batch.title;
    responsePayload.class_time = classTime;
    responsePayload.schedule_days = scheduleDays;
    responsePayload.course_level = courseLevel;
    responsePayload.course_mode = courseMode;
    responsePayload.course_duration = courseDuration;
    responsePayload.course_fee = feeInfo;
    responsePayload.course_description = courseDesc;
    responsePayload.instructor_name = instructorName;
    responsePayload.notification_title = notifTitle;
    responsePayload.notification_message = notifMessage;
    responsePayload.reset_token = resetToken;
    responsePayload.reset_url = resetLink;
    responsePayload.email_sent = emailResult.success;
    responsePayload.is_existing_student = isExistingStudent;
    responsePayload.message = isExistingStudent 
      ? `Talib-e-Ilm "${student.name}" ko naye course "${courseTitle}" (${batch.title}) me kamyabi se shamil kar liya gaya!`
      : `Talib-e-Ilm "${student.name}" kamyabi se batch "${batch.title}" me dakhil kar liya gaya!`;
    responsePayload.email_preview_url = emailResult.previewUrl || null;
    responsePayload.email_dispatch = {
      to: student.email,
      subject: emailSubject,
      body: emailText,
      sent: emailResult.success,
      previewUrl: emailResult.previewUrl || null
    };

    responsePayload.credentials = {
      student_id: student.id,
      user_id: studentUserId,
      name: student.name,
      username: usernameForLogin,
      plain_password: generatedCreds ? generatedCreds.password : null,
      email: student.email,
      phone: student.phone,
      course_id: batch.course_id,
      course_title: courseTitle,
      batch_id: batch.id,
      batch_name: batch.title,
      batch_code: batch.batch_code || '',
      timings: batch.class_time || '07:00 AM',
      class_time: batch.class_time || '07:00 AM',
      schedule_days: batch.schedule_days || 'Mon, Wed, Fri',
      instructor_name: instructorName,
      reset_token: resetToken,
      reset_link: resetLink,
      portal_url: 'http://localhost:8085',
      dispatch_message: emailText,
      email_subject: emailSubject
    };

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

    // If batch_id is provided, automatically enroll student into this batch
    if (body.batch_id) {
      return enrollStudentInBatch(req, res, body.batch_id, {
        student_id: id,
        name,
        email,
        phone,
        roll_number: rollNumber,
        guardian_name: guardianName,
        gender,
        institute_affiliation: instituteAffiliation
      });
    }

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

function updateStudent(req, res, studentId, body) {
  try {
    if (!studentId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'studentId required' }));
    }

    const {
      name,
      email,
      phone,
      roll_number,
      guardian_name,
      gender,
      age,
      institute_affiliation
    } = body || {};

    const existing = queryOne('SELECT * FROM students WHERE id = ?', [studentId]);
    if (!existing) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Talib-e-Ilm nahi mila.' }));
    }

    execute(`
      UPDATE students 
      SET name = COALESCE(?, name),
          email = COALESCE(?, email),
          phone = COALESCE(?, phone),
          roll_number = COALESCE(?, roll_number),
          guardian_name = COALESCE(?, guardian_name),
          gender = COALESCE(?, gender),
          age = COALESCE(?, age),
          institute_affiliation = COALESCE(?, institute_affiliation)
      WHERE id = ?
    `, [
      name ?? null,
      email ?? null,
      phone ?? null,
      roll_number ?? null,
      guardian_name ?? null,
      gender ?? null,
      age ?? null,
      institute_affiliation ?? null,
      studentId
    ]);

    if (existing.user_id) {
      execute(`
        UPDATE users
        SET name = COALESCE(?, name),
            email = COALESCE(?, email),
            phone = COALESCE(?, phone)
        WHERE id = ?
      `, [
        name ?? null,
        email ?? null,
        phone ?? null,
        existing.user_id
      ]);
    }

    const updated = queryOne('SELECT * FROM students WHERE id = ?', [studentId]);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: `Talib-e-Ilm "${updated.name}" ki detail kamyabi se update ho gayi!`,
      data: updated
    }));
  } catch (err) {
    console.error('[updateStudent ERROR]', err);
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
  updateStudent,
  getStudentDashboard
};

