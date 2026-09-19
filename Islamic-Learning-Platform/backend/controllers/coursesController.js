// Courses & Schedulers Controller
const { queryAll, queryOne, execute } = require('../database/db');

function getCourses(req, res) {
  try {
    const courses = queryAll(`
      SELECT c.*, d.title_en as department_title, d.arabic_name as department_arabic
      FROM courses c
      LEFT JOIN departments d ON c.department_id = d.id
      ORDER BY c.created_at DESC
    `);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, count: courses.length, data: courses }));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

function createCourse(req, res, body) {
  try {
    const id = 'crs-' + Date.now();
    const {
      institute_id = 'inst-darululoom-1',
      instructor_name,
      department_id,
      title,
      arabic_title = '',
      level = 'Mubtadi (Beginner)',
      tuition_type = 'Monthly Madrasa',
      fee_amount = 0,
      duration = '16 Weeks',
      mode = 'Interactive Live Halaqah'
    } = body;

    execute(`
      INSERT INTO courses (id, institute_id, instructor_name, department_id, title, arabic_title, level, tuition_type, fee_amount, duration, mode)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, institute_id, instructor_name, department_id, title, arabic_title, level, tuition_type, fee_amount, duration, mode]);

    const newCourse = queryOne('SELECT * FROM courses WHERE id = ?', [id]);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Course created successfully', data: newCourse }));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

module.exports = {
  getCourses,
  createCourse
};
