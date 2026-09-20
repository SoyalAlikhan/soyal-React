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

function createFaculty(req, res, body) {
  try {
    const id = body.id || 'fac-' + Date.now();
    const {
      institute_id = 'inst-darululoom-1',
      user_id = null,
      title = 'Ustad',
      name,
      designation = 'Senior Ustad',
      department_id = 'dept-tajweed',
      sanad_details = 'Dars-e-Nizami Aalimiyyah Sanad',
      monthly_hadya = 35000,
      status = 'Active'
    } = body;

    execute(`
      INSERT INTO faculty (id, institute_id, user_id, title, name, designation, department_id, sanad_details, monthly_hadya, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, institute_id, user_id, title, name, designation, department_id, sanad_details, Number(monthly_hadya) || 0, status]);

    const created = queryOne('SELECT * FROM faculty WHERE id = ?', [id]);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Faculty member registered successfully', data: created }));
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
