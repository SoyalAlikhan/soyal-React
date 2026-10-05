// ============================================================================
// Al-Noor Islamic Learning Platform — Platform Features Controller (BRD v4)
// Notifications (BRD 33), Payments (BRD 32), Certificates (BRD 19), Moderation (BRD 36)
// ============================================================================

const { queryAll, queryOne, execute } = require('../database/db');

// --- NOTIFICATIONS (BRD Section 33) ---
function getNotifications(req, res, query) {
  try {
    const userId = query && (query.user_id || query.userId);
    let sql = 'SELECT * FROM notifications';
    const params = [];

    if (userId) {
      const associatedIds = new Set([userId, 'all']);
      try {
        const studentRec = queryOne('SELECT id, user_id, email FROM students WHERE id = ? OR user_id = ? OR email = ?', [userId, userId, userId]);
        if (studentRec) {
          if (studentRec.id) associatedIds.add(studentRec.id);
          if (studentRec.user_id) associatedIds.add(studentRec.user_id);
          if (studentRec.email) associatedIds.add(studentRec.email.toLowerCase());
        }
        const userRec = queryOne('SELECT id, email, username FROM users WHERE id = ? OR email = ? OR username = ?', [userId, userId, userId]);
        if (userRec) {
          if (userRec.id) associatedIds.add(userRec.id);
          if (userRec.email) associatedIds.add(userRec.email.toLowerCase());
          if (userRec.username) associatedIds.add(userRec.username.toLowerCase());
        }
      } catch (e) {}

      const idArr = Array.from(associatedIds);
      const placeholders = idArr.map(() => '?').join(',');
      sql += ` WHERE user_id IN (${placeholders})`;
      params.push(...idArr);
    }
    sql += ' ORDER BY created_at DESC LIMIT 50';

    const notifs = queryAll(sql, params);
    const unreadCount = notifs.filter(n => !n.is_read).length;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      count: notifs.length,
      unreadCount,
      data: notifs
    }));
  } catch (err) {
    console.error('[GET NOTIFICATIONS ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

function createNotification(req, res, body) {
  try {
    const { user_id, profile_id, type = 'info', title, message, link } = body || {};
    if (!user_id || !title) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'user_id and title required' }));
    }

    const id = 'notif-' + Date.now();
    execute(
      'INSERT INTO notifications (id, user_id, profile_id, type, title, message, link) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, user_id, profile_id || null, type, title, message || '', link || null]
    );

    const created = queryOne('SELECT * FROM notifications WHERE id = ?', [id]);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Notification created', data: created }));
  } catch (err) {
    console.error('[CREATE NOTIFICATION ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

function markNotificationRead(req, res, id) {
  try {
    if (id === 'all') {
      execute('UPDATE notifications SET is_read = 1');
    } else {
      execute('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Notification marked as read' }));
  } catch (err) {
    console.error('[MARK NOTIFICATION READ ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

// --- PAYMENTS & FEES (BRD Section 32) ---
function getPayments(req, res, query) {
  try {
    const studentId = query && (query.student_id || query.studentId);
    let sql = `
      SELECT p.*, u.name as student_name, c.title as course_title, b.title as batch_title
      FROM payments p
      LEFT JOIN users u ON p.student_id = u.id
      LEFT JOIN courses c ON p.course_id = c.id
      LEFT JOIN batches b ON p.batch_id = b.id
    `;
    const params = [];
    if (studentId) {
      sql += ' WHERE p.student_id = ?';
      params.push(studentId);
    }
    sql += ' ORDER BY p.created_at DESC';

    const payments = queryAll(sql, params);
    const totalCollected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const teacherShareTotal = payments.reduce((sum, p) => sum + (p.teacher_share || 0), 0);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      count: payments.length,
      totalCollected,
      teacherShareTotal,
      data: payments
    }));
  } catch (err) {
    console.error('[GET PAYMENTS ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

function createPayment(req, res, body) {
  try {
    const {
      student_id,
      course_id,
      batch_id,
      amount,
      payment_method = 'UPI',
      teacher_share = 0,
      platform_share = 0
    } = body || {};

    if (!student_id || !amount) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'student_id and amount required' }));
    }

    const id = 'pay-' + Date.now();
    const invoice_number = 'INV-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    const tShare = teacher_share || Math.round(amount * 0.85);
    const pShare = platform_share || (amount - tShare);

    execute(`
      INSERT INTO payments (id, student_id, course_id, batch_id, amount, payment_method, status, invoice_number, teacher_share, platform_share)
      VALUES (?, ?, ?, ?, ?, ?, 'paid', ?, ?, ?)
    `, [id, student_id, course_id || null, batch_id || null, amount, payment_method, invoice_number, tShare, pShare]);

    const created = queryOne('SELECT * FROM payments WHERE id = ?', [id]);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: 'Payment recorded successfully',
      data: created
    }));
  } catch (err) {
    console.error('[CREATE PAYMENT ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

// --- CERTIFICATES (BRD Section 19) ---
function getCertificates(req, res, query) {
  try {
    const studentId = query && (query.student_id || query.studentId);
    let sql = 'SELECT * FROM certificates';
    const params = [];
    if (studentId) {
      sql += ' WHERE student_id = ?';
      params.push(studentId);
    }
    sql += ' ORDER BY created_at DESC';

    const certs = queryAll(sql, params);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, count: certs.length, data: certs }));
  } catch (err) {
    console.error('[GET CERTIFICATES ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

function createCertificate(req, res, body) {
  try {
    const {
      student_id,
      student_name,
      course_id,
      course_title,
      instructor_name,
      grade = 'A',
      score = 90,
      completion_date = new Date().toISOString().split('T')[0]
    } = body || {};

    if (!student_id || !course_id || !student_name || !course_title) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'student_id, student_name, course_id, and course_title required' }));
    }

    const id = 'cert-' + Date.now();
    const verification_qr = 'SDI-CERT-' + id.toUpperCase();

    execute(`
      INSERT INTO certificates (id, student_id, student_name, course_id, course_title, instructor_name, grade, score, completion_date, verification_qr)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, student_id, student_name, course_id, course_title, instructor_name || '', grade, score, completion_date, verification_qr]);

    const created = queryOne('SELECT * FROM certificates WHERE id = ?', [id]);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Certificate issued successfully', data: created }));
  } catch (err) {
    console.error('[CREATE CERTIFICATE ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

// --- CONTENT MODERATION QUEUE (BRD Section 36) ---
function getReports(req, res, query) {
  try {
    const status = query && query.status;
    let sql = 'SELECT * FROM content_reports';
    const params = [];
    if (status) {
      sql += ' WHERE status = ?';
      params.push(status);
    }
    sql += ' ORDER BY created_at DESC';

    const reports = queryAll(sql, params);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, count: reports.length, data: reports }));
  } catch (err) {
    console.error('[GET REPORTS ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

function createReport(req, res, body) {
  try {
    const { reporter_id, reporter_name, content_type, content_id, reason, details } = body || {};
    if (!reporter_id || !content_type || !reason) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'reporter_id, content_type, and reason required' }));
    }

    const id = 'rep-' + Date.now();
    execute(`
      INSERT INTO content_reports (id, reporter_id, reporter_name, content_type, content_id, reason, details, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `, [id, reporter_id, reporter_name || 'Anonymous', content_type, content_id || null, reason, details || '']);

    const created = queryOne('SELECT * FROM content_reports WHERE id = ?', [id]);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Report submitted to moderation queue', data: created }));
  } catch (err) {
    console.error('[CREATE REPORT ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

function updateReportStatus(req, res, id, body) {
  try {
    const { status, moderator_notes } = body || {};
    if (!status) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'status required (resolved / dismissed / action_taken)' }));
    }

    execute(
      'UPDATE content_reports SET status = ?, moderator_notes = ? WHERE id = ?',
      [status, moderator_notes || '', id]
    );

    const updated = queryOne('SELECT * FROM content_reports WHERE id = ?', [id]);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Report status updated', data: updated }));
  } catch (err) {
    console.error('[UPDATE REPORT ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

module.exports = {
  getNotifications,
  createNotification,
  markNotificationRead,
  getPayments,
  createPayment,
  getCertificates,
  createCertificate,
  getReports,
  createReport,
  updateReportStatus
};
