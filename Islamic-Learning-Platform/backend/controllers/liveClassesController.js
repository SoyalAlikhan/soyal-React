// Live Classes & Halaqaat Schedulers Controller
const { queryAll, queryOne, execute } = require('../database/db');

// Ensure live_classes table exists
execute(`
  CREATE TABLE IF NOT EXISTS live_classes (
    id TEXT PRIMARY KEY,
    course_id TEXT,
    title TEXT NOT NULL,
    instructor_name TEXT NOT NULL,
    class_date TEXT NOT NULL,
    class_time TEXT,
    recurrence TEXT DEFAULT 'Daily',
    enrolled_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Scheduled',
    meeting_link TEXT DEFAULT '#auto-attendance',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Seed default live classes if empty
const count = queryOne('SELECT COUNT(*) as cnt FROM live_classes');
if (!count || count.cnt === 0) {
  execute(`
    INSERT INTO live_classes (id, course_id, title, instructor_name, class_date, class_time, recurrence, enrolled_count, status, meeting_link)
    VALUES 
      ('live-1', 'crs-tajweed-101', 'Interactive Tajweed Halaqah: Huroof-e-Musta''liyah (Daily)', 'Qari Abdul Basit Siddiqui', 'Tomorrow at 07:00 AM', '07:00 AM PKT', 'Daily', 48, 'Scheduled', '#auto-attendance'),
      ('live-2', 'crs-darse-nizami-201', 'Dars-e-Nizami Aalimiyyah Program (Mon, Wed, Fri)', 'Mufti Tariq Masood', 'Every Mon, Wed, Fri at 09:00 PM', '09:00 PM PKT', 'Mon, Wed, Fri', 35, 'Scheduled', '#auto-attendance'),
      ('live-3', 'crs-noorani-qaida', 'Noorani Qaida Live Huroof-e-Halqi Dars (Daily)', 'Maulana Ibrahim Qasmi', 'Daily at 05:00 PM', '05:00 PM PKT', 'Daily', 29, 'Scheduled', '#auto-attendance')
  `);
  console.log('[SQLite Backend] Seeded default live_classes into alnoor_lms.db');
}

function getLiveClasses(req, res, query) {
  try {
    let classes = [];
    if (query && query.batch_id) {
      classes = queryAll(`SELECT * FROM live_classes WHERE batch_id = ? ORDER BY created_at DESC`, [query.batch_id]);
    } else {
      classes = queryAll(`SELECT * FROM live_classes ORDER BY created_at DESC`);
    }
    const mapped = classes.map(c => ({
      id: c.id,
      batch_id: c.batch_id,
      course_id: c.course_id,
      title: c.title,
      instructor: c.instructor_name,
      date: c.class_date,
      time: c.class_time,
      recurrence: c.recurrence,
      enrolled: c.enrolled_count,
      status: c.status,
      link: c.meeting_link,
      created_at: c.created_at
    }));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, count: mapped.length, data: mapped }));
  } catch (err) {
    console.error('[getLiveClasses ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

function createLiveClass(req, res, body) {
  try {
    const id = body.id || 'live-' + Date.now();
    const actualTitle = body.title || 'Untitled Live Class';
    const actualInstructor = body.instructor_name || body.instructor || 'Qari Abdul Basit Siddiqui';
    const actualDate = body.class_date || body.date || (body.start_date && body.start_time ? `${body.start_date} at ${body.start_time}` : 'Tomorrow at 07:00 AM');
    const actualTime = body.class_time || body.start_time || body.time || '07:00 AM PKT';
    const actualEnrolled = Number(body.enrolled_count !== undefined ? body.enrolled_count : (body.enrolled !== undefined ? body.enrolled : 30));
    const actualLink = body.meeting_link || body.link || '#auto-attendance';
    const recurrence = body.recurrence || 'Daily';
    const status = body.status || 'Scheduled';
    
    let batch_id = body.batch_id || null;
    let course_id = body.course_id || null;

    if (batch_id) {
      const batchRow = queryOne('SELECT * FROM batches WHERE id = ? OR title = ?', [batch_id, batch_id]);
      if (batchRow) {
        batch_id = batchRow.id;
        course_id = course_id || batchRow.course_id;
      }
    }
    if (!course_id) {
      course_id = 'crs-tajweed-101';
    }

    execute(`
      INSERT INTO live_classes (id, batch_id, course_id, title, instructor_name, class_date, class_time, recurrence, enrolled_count, status, meeting_link)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, batch_id, course_id, actualTitle, actualInstructor, actualDate, actualTime, recurrence, actualEnrolled, status, actualLink]);

    const created = queryOne('SELECT * FROM live_classes WHERE id = ?', [id]);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: 'Live class schedule persisted to SQLite database successfully',
      data: {
        id: created.id,
        batch_id: created.batch_id,
        course_id: created.course_id,
        title: created.title,
        instructor: created.instructor_name,
        date: created.class_date,
        time: created.class_time,
        recurrence: created.recurrence,
        enrolled: created.enrolled_count,
        status: created.status,
        link: created.meeting_link,
        created_at: created.created_at
      }
    }));
  } catch (err) {
    console.error('[createLiveClass ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

function deleteLiveClass(req, res, classId) {
  try {
    const existing = queryOne('SELECT * FROM live_classes WHERE id = ?', [classId]);
    if (!existing) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Live class not found' }));
    }

    execute('DELETE FROM live_classes WHERE id = ?', [classId]);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: `Live class ${classId} deleted from database` }));
  } catch (err) {
    console.error('[deleteLiveClass ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

module.exports = {
  getLiveClasses,
  createLiveClass,
  deleteLiveClass
};
