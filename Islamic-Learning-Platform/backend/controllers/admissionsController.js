// Admissions & Faculty Controller
const { queryAll, queryOne, execute } = require('../database/db');

function getAdmissions(req, res) {
  try {
    const admissions = queryAll(`
      SELECT a.*, d.title_en as department_title, d.arabic_name as department_arabic
      FROM admissions a
      LEFT JOIN departments d ON a.department_id = d.id
      ORDER BY a.created_at DESC
    `);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, count: admissions.length, data: admissions }));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

function createAdmission(req, res, body) {
  try {
    const id = 'adm-' + Date.now();
    const roll_number = 'ROL-' + Math.floor(1000 + Math.random() * 9000);
    const {
      institute_id = 'inst-darululoom-1',
      student_name,
      guardian_name,
      guardian_phone,
      department_id,
      darja,
      fee_status = 'Paid',
      monthly_fee = 1200
    } = body;

    execute(`
      INSERT INTO admissions (id, institute_id, roll_number, student_name, guardian_name, guardian_phone, department_id, darja, fee_status, monthly_fee)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, institute_id, roll_number, student_name, guardian_name, guardian_phone, department_id, darja, fee_status, monthly_fee]);

    const created = queryOne('SELECT * FROM admissions WHERE id = ?', [id]);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Talib-e-Ilm admitted successfully', data: created }));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

function getFaculty(req, res) {
  try {
    const faculty = queryAll(`
      SELECT f.*, d.title_en as department_title
      FROM faculty f
      LEFT JOIN departments d ON f.department_id = d.id
      ORDER BY f.created_at ASC
    `);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, count: faculty.length, data: faculty }));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

function getDepartments(req, res) {
  try {
    const departments = queryAll('SELECT * FROM departments ORDER BY created_at ASC');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, count: departments.length, data: departments }));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

const crypto = require('crypto');
const { sendFacultyWelcomeEmail } = require('../services/emailService');

function hashPassword(plainText) {
  return crypto.createHash('sha256').update(plainText).digest('hex');
}

async function createFaculty(req, res, body) {
  try {
    body = body || {};
    const id = body.id || 'fac-' + Date.now();
    const {
      institute_id = 'inst-alfurqan',
      title = 'Ustad',
      name,
      email,
      phone = '+91 98000 11223',
      designation = 'Senior Ustad / Lecturer',
      department_id = 'dept-tajweed',
      sanad_details = 'Dars-e-Nizami Aalimiyyah Sanad',
      monthly_hadya = 25000,
      status = 'Active'
    } = body;

    if (!name) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Ustad / Teacher ka naam lazmi hai.' }));
    }

    // Resolve institute name and slug
    let instName = body.institute_name;
    if (!instName) {
      const instRecord = queryOne('SELECT legal_name FROM institutes WHERE id = ?', [institute_id]);
      instName = instRecord ? instRecord.legal_name : 'Al-Furqan Islamic Academy';
    }

    let instSlug = instName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (instSlug.includes('alfurqan')) instSlug = 'alfurqan';
    else if (instSlug.includes('darululoom')) instSlug = 'darululoom';
    else instSlug = instSlug.slice(0, 10) || 'institute';

    // Auto-generate username with institute name
    const cleanName = (name || 'teacher').toLowerCase().replace(/[^a-z0-9]/g, '') || 'ustad';
    let generatedUsername = `${cleanName}_${instSlug}`;
    const existingUser = queryOne('SELECT id FROM users WHERE username = ?', [generatedUsername]);
    if (existingUser) {
      generatedUsername = `${cleanName}_${instSlug}_${Math.floor(100 + Math.random() * 900)}`;
    }

    const finalEmail = (email || `${generatedUsername}@faculty.alnoor.edu`).toLowerCase().trim();
    const tempPassword = `Teacher${Math.floor(1000 + Math.random() * 9000)}`;
    const passHash = hashPassword(tempPassword);
    const userId = body.user_id || ('usr-fac-' + Date.now());

    // 1. Insert or update teacher into users table
    execute(`
      INSERT OR REPLACE INTO users (id, name, username, email, password, password_hash, role, phone, institute_affiliation)
      VALUES (?, ?, ?, ?, ?, ?, 'teacher', ?, ?)
    `, [userId, name, generatedUsername, finalEmail, tempPassword, passHash, phone, instName]);

    // 2. Insert into faculty table
    execute(`
      INSERT INTO faculty (id, institute_id, user_id, title, name, designation, department_id, sanad_details, monthly_hadya, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, institute_id, userId, title, name, designation, department_id, sanad_details, Number(monthly_hadya) || 0, status]);

    // 3. Generate 7-day secure password reset token
    const resetToken = 'rst_' + crypto.randomBytes(16).toString('hex');
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    const resetUrl = `http://localhost:8085/?reset_token=${resetToken}&user=${encodeURIComponent(generatedUsername)}`;

    try {
      execute(`
        INSERT OR REPLACE INTO password_resets (identifier, token, otp, expires_at, user_id)
        VALUES (?, ?, ?, ?, ?)
      `, [finalEmail, resetToken, Math.floor(100000 + Math.random() * 900000).toString(), expiresAt, userId]);

      execute(`
        INSERT OR REPLACE INTO password_resets (identifier, token, otp, expires_at, user_id)
        VALUES (?, ?, ?, ?, ?)
      `, [generatedUsername.toLowerCase(), resetToken, Math.floor(100000 + Math.random() * 900000).toString(), expiresAt, userId]);
    } catch (e) {
      console.warn('[FACULTY RESET TOKEN WARNING]', e.message);
    }

    // 4. Send official appointment welcome email
    let emailResult = { success: false };
    try {
      // Resolve department title for email
      const deptRecord = queryOne('SELECT title_en FROM departments WHERE id = ?', [department_id]);
      const departmentTitle = deptRecord ? deptRecord.title_en : department_id;

      emailResult = await sendFacultyWelcomeEmail({
        to: finalEmail,
        teacherName: name,
        instituteName: instName,
        departmentName: departmentTitle,
        designation: designation,
        sanadDetails: sanad_details,
        monthlyHadya: Number(monthly_hadya) || 0,
        username: generatedUsername,
        tempPassword: tempPassword,
        resetUrl: resetUrl
      });
    } catch (mailErr) {
      console.warn('[FACULTY EMAIL DISPATCH WARNING]', mailErr.message);
    }

    const created = queryOne('SELECT * FROM faculty WHERE id = ?', [id]);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: `Faculty member "${name}" kamyabi se register ho gaya aur credentials email kar diye gaye hain.`,
      data: created,
      username: generatedUsername,
      email: finalEmail,
      temp_password: tempPassword,
      reset_token: resetToken,
      reset_url: resetUrl,
      institute_name: instName,
      email_preview_url: emailResult.previewUrl || null,
      email_dispatch: {
        to: finalEmail,
        subject: `Welcome to ${instName} — Faculty Appointment & Login Credentials`,
        body: `Assalamu Alaikum ${name},\n\nAapko ${instName} me Asateza Faculty ke taur par shamil kiya gaya hai.\n\nDesignation: ${designation}\nDepartment: ${department_id}\nSanad: ${sanad_details}\nMonthly Hadya: ₹${monthly_hadya}\n\nUsername: ${generatedUsername}\nTemporary Password: ${tempPassword}\n\nPassword Reset Link (Valid for 7 days):\n${resetUrl}\n\nJazakAllahu Khaira.`
      }
    }));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

module.exports = {
  getAdmissions,
  createAdmission,
  getFaculty,
  createFaculty,
  getDepartments
};
