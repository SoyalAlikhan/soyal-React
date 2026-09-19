// 30s Heartbeat SDK Attendance Engine Controller
const { queryAll, queryOne, execute } = require('../database/db');

function logHeartbeat(req, res, body) {
  try {
    const {
      student_id = 'usr-student-1',
      student_name = 'Ahmad Raza',
      class_session_id = 'HLQ-8821',
      in_class_seconds = 30,
      attendance_score_pct = 88,
      status = 'Present'
    } = body;

    execute(`
      INSERT INTO attendance_heartbeats (student_id, student_name, class_session_id, in_class_seconds, attendance_score_pct, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [student_id, student_name, class_session_id, in_class_seconds, attendance_score_pct, status]);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      success: true, 
      message: '30s Heartbeat recorded successfully by Auto Attendance Engine',
      stats: {
        student_name,
        class_session_id,
        in_class_seconds,
        attendance_score_pct,
        status
      }
    }));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

function getAttendanceLogs(req, res, queryParams = {}) {
  try {
    let sql = 'SELECT * FROM attendance_heartbeats';
    const params = [];

    if (queryParams.student_id) {
      sql += ' WHERE student_id = ?';
      params.push(queryParams.student_id);
    }

    sql += ' ORDER BY heartbeat_time DESC LIMIT 100';
    const logs = queryAll(sql, params);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, count: logs.length, data: logs }));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

module.exports = {
  logHeartbeat,
  getAttendanceLogs
};
