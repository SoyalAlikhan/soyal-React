// Leave (Chutti) Applications & Approvals Controller
const { queryAll, queryOne, execute } = require('../database/db');

function getLeaves(req, res, queryParams = {}) {
  try {
    let sql = 'SELECT * FROM leave_applications';
    const params = [];

    if (queryParams.student_id) {
      sql += ' WHERE student_id = ?';
      params.push(queryParams.student_id);
    } else if (queryParams.teacher) {
      sql += ' WHERE assigned_teacher LIKE ?';
      params.push(`%${queryParams.teacher}%`);
    }

    sql += ' ORDER BY created_at DESC';
    const leaves = queryAll(sql, params);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, count: leaves.length, data: leaves }));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

function submitLeave(req, res, body) {
  try {
    const id = 'LV-' + (Math.floor(100 + Math.random() * 900));
    const {
      student_id = 'usr-student-1',
      student_name = 'Ahmad Raza',
      course_title,
      assigned_teacher,
      approver_role,
      leave_type,
      from_date,
      to_date,
      reason
    } = body;

    const ustad_remarks = `Submitted to ${assigned_teacher} for formal approval`;

    execute(`
      INSERT INTO leave_applications (id, student_id, student_name, course_title, assigned_teacher, approver_role, leave_type, from_date, to_date, reason, status, ustad_remarks)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending Ustad Review ⏳', ?)
    `, [id, student_id, student_name, course_title, assigned_teacher, approver_role, leave_type, from_date, to_date, reason, ustad_remarks]);

    const created = queryOne('SELECT * FROM leave_applications WHERE id = ?', [id]);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Leave application submitted successfully', data: created }));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

function updateLeaveDecision(req, res, leaveId, body) {
  try {
    const { decision, remarks } = body;
    const statusText = decision === 'Approved' ? 'Approved ✅' : 'Rejected ❌';
    const finalRemarks = remarks || (decision === 'Approved' ? 'Ustaad ne uzr-e-shar\'i qubool farmaya. Chutti manzoor shuda.' : 'Dars ke nuqsaan ki wajah se chutti manzoor nahi hui.');

    execute(`
      UPDATE leave_applications 
      SET status = ?, ustad_remarks = ?
      WHERE id = ?
    `, [statusText, finalRemarks, leaveId]);

    const updated = queryOne('SELECT * FROM leave_applications WHERE id = ?', [leaveId]);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: `Leave ${leaveId} updated to ${statusText}`, data: updated }));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

module.exports = {
  getLeaves,
  submitLeave,
  updateLeaveDecision
};
