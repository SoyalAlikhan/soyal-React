// Centralized REST API Router (/api/v1/...)
// Shared between Web (React) and Mobile App (React Native) per BRD Section 19A

const coursesController = require('../controllers/coursesController');
const leaveController = require('../controllers/leaveController');
const admissionsController = require('../controllers/admissionsController');
const attendanceController = require('../controllers/attendanceController');
const chandaController = require('../controllers/chandaController');
const explorerController = require('../controllers/explorerController');

function handleApiRequest(req, res, pathname, query, body) {
  // CORS Headers for both Web & Mobile
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // 1. Health Check
  if (pathname === '/api/v1/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      status: 'ok',
      service: 'Al-Noor Islamic Learning Platform API',
      version: '2.0.0',
      database: 'SQLite (node:sqlite built-in)',
      timestamp: new Date().toISOString()
    }));
  }

  // 2. Courses
  if (pathname === '/api/v1/courses') {
    if (req.method === 'GET') return coursesController.getCourses(req, res);
    if (req.method === 'POST') return coursesController.createCourse(req, res, body);
  }

  // 3. Leave Applications
  if (pathname === '/api/v1/leaves') {
    if (req.method === 'GET') return leaveController.getLeaves(req, res, query);
    if (req.method === 'POST') return leaveController.submitLeave(req, res, body);
  }
  if (pathname.startsWith('/api/v1/leaves/')) {
    const leaveId = pathname.replace('/api/v1/leaves/', '').trim();
    if (req.method === 'PATCH' || req.method === 'PUT' || req.method === 'POST') {
      return leaveController.updateLeaveDecision(req, res, leaveId, body);
    }
  }

  // 4. Admissions & Faculty
  if (pathname === '/api/v1/admissions') {
    if (req.method === 'GET') return admissionsController.getAdmissions(req, res);
    if (req.method === 'POST') return admissionsController.createAdmission(req, res, body);
  }
  if (pathname === '/api/v1/faculty') {
    if (req.method === 'GET') return admissionsController.getFaculty(req, res);
    if (req.method === 'POST') return admissionsController.createFaculty(req, res, body);
  }
  if (pathname === '/api/v1/departments' && req.method === 'GET') {
    return admissionsController.getDepartments(req, res);
  }

  // 4B. Batches & Schedulers
  if (pathname === '/api/v1/batches') {
    if (req.method === 'GET') return coursesController.getBatches(req, res);
    if (req.method === 'POST') return coursesController.createBatch(req, res, body);
  }

  // 5. 30s Heartbeat SDK Attendance
  if (pathname === '/api/v1/attendance/heartbeat' && req.method === 'POST') {
    return attendanceController.logHeartbeat(req, res, body);
  }
  if (pathname === '/api/v1/attendance/logs' && req.method === 'GET') {
    return attendanceController.getAttendanceLogs(req, res, query);
  }

  // 6. Chanda & Waqf Ledger
  if (pathname === '/api/v1/chanda') {
    if (req.method === 'GET') return chandaController.getChandaLedger(req, res);
    if (req.method === 'POST') return chandaController.recordChanda(req, res, body);
  }

  // 7. Database Explorer API
  if (pathname === '/api/v1/explorer/tables' && req.method === 'GET') {
    return explorerController.getDatabaseOverview(req, res);
  }
  if (pathname.startsWith('/api/v1/explorer/table/')) {
    const tableName = pathname.replace('/api/v1/explorer/table/', '').trim();
    if (req.method === 'GET') return explorerController.getTableRecords(req, res, tableName, query);
  }
  if (pathname === '/api/v1/explorer/query' && req.method === 'POST') {
    return explorerController.executeConsoleQuery(req, res, body);
  }

  // 404 Route Not Found
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: false, error: `API route ${req.method} ${pathname} not found` }));
}

module.exports = {
  handleApiRequest
};
