// ============================================================================
// Al-Noor Islamic Learning Platform — Homework & Assignments SQLite Controller
// Manages assignments assigned to specific Batches and Student Submissions
// ============================================================================

const { queryAll, queryOne, execute } = require('../database/db');

// Seed default homework if table is empty
try {
  const count = queryOne('SELECT COUNT(*) as count FROM homework');
  if (!count || count.count === 0) {
    console.log('[SQLite Backend] Seeding initial homework assignments for active batches...');
    
    // Check existing batches
    const firstBatch = queryOne("SELECT * FROM batches WHERE id = 'batch-tj-01'") || queryOne("SELECT * FROM batches LIMIT 1");
    const batchId = firstBatch ? firstBatch.id : 'batch-tj-01';
    const batchTitle = firstBatch ? firstBatch.title : 'Tajweed Foundation (Fajr)';
    const courseId = firstBatch ? firstBatch.course_id : 'crs-01';
    const courseTitle = firstBatch ? firstBatch.course_title : 'Sanad Tajweed-ul-Quran';

    execute(`
      INSERT INTO homework (id, course_id, course_title, batch_id, batch_title, teacher_id, teacher_name, title, instructions, due_date, due_time, max_marks, submission_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'hw-tj-01',
      courseId,
      courseTitle,
      batchId,
      batchTitle,
      'usr-teacher-1',
      'Qari Abdul Basit',
      'Surah Al-Mulk: Verses 1-10 Tilawat & Makharij Practice',
      'Record 10 verses with strict attention to Madd Munfasil and Qalqalah letters. Attach audio recitation and written notes.',
      '2026-09-25',
      '18:00',
      25,
      'Audio Recitation + PDF File'
    ]);

    execute(`
      INSERT INTO homework (id, course_id, course_title, batch_id, batch_title, teacher_id, teacher_name, title, instructions, due_date, due_time, max_marks, submission_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'hw-tj-02',
      courseId,
      courseTitle,
      batchId,
      batchTitle,
      'usr-teacher-1',
      'Qari Abdul Basit',
      'Noon Sakinah Rules Chart & Practical Identification',
      'Identify 5 examples of Izhar and 5 examples of Idgham from Surah Yaseen with proof rules.',
      '2026-09-28',
      '20:00',
      20,
      'PDF Document / Notes'
    ]);
  }
} catch (e) {
  console.warn('[homeworkController seed warning]', e.message);
}

/**
 * 1. GET /api/v1/homework
 * Optional query params: batch_id, student_id, course_id
 */
function getHomework(req, res, query) {
  try {
    const { batch_id, student_id, course_id } = query || {};

    let sql = `
      SELECT 
        h.*,
        (SELECT COUNT(*) FROM homework_submissions hs WHERE hs.homework_id = h.id) as submissions_count
      FROM homework h
      WHERE 1=1
    `;
    const params = [];

    if (batch_id && batch_id !== 'all') {
      sql += ' AND (h.batch_id = ? OR h.batch_title = ?)';
      params.push(batch_id, batch_id);
    }

    if (course_id) {
      sql += ' AND h.course_id = ?';
      params.push(course_id);
    }

    sql += ' ORDER BY h.created_at DESC';

    const list = queryAll(sql, params);

    // If student_id is provided, attach student's personal submission status
    const data = list.map(hw => {
      let mySubmission = null;
      if (student_id) {
        mySubmission = queryOne(`
          SELECT * FROM homework_submissions 
          WHERE homework_id = ? AND student_id = ?
        `, [hw.id, student_id]);
      }

      return {
        id: hw.id,
        course: hw.course_title || 'Quranic Studies',
        courseId: hw.course_id,
        batch: hw.batch_title || 'General Batch',
        batchId: hw.batch_id,
        title: hw.title,
        instructions: hw.instructions,
        dueDate: `${hw.due_date || '2026-09-25'} (${hw.due_time || '20:00'})`,
        rawDueDate: hw.due_date,
        rawDueTime: hw.due_time,
        maxMarks: hw.max_marks || 25,
        submissionType: hw.submission_type,
        submissionsCount: hw.submissions_count || 0,
        mySubmissionStatus: mySubmission ? (mySubmission.status || 'Submitted') : 'Pending',
        myGrade: mySubmission && mySubmission.marks_awarded != null ? `${mySubmission.marks_awarded}/${hw.max_marks}` : (mySubmission ? 'Under Review' : null),
        teacherFeedback: mySubmission ? mySubmission.teacher_feedback : null,
        teacherVoiceUrl: mySubmission ? mySubmission.teacher_voice_url : null,
        submissionDetails: mySubmission || null
      };
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, count: data.length, data }));
  } catch (err) {
    console.error('[getHomework ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

/**
 * 2. POST /api/v1/homework
 * Saves newly assigned homework directly into SQLite database
 */
function createHomework(req, res, body) {
  try {
    const {
      title,
      batch_id,
      course_id,
      course_title,
      batch_title,
      due_date,
      due_time = '20:00',
      max_marks = 25,
      instructions = '',
      submission_type = 'Audio Recitation + PDF File',
      teacher_id = 'usr-teacher-1',
      teacher_name = 'Ustad'
    } = body || {};

    if (!title || !batch_id) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Title aur Batch ID dono lazmi hain!' }));
    }

    // Lookup batch info if not provided
    let finalBatchTitle = batch_title;
    let finalCourseTitle = course_title;
    let finalCourseId = course_id;

    const batch = queryOne('SELECT * FROM batches WHERE id = ? OR title = ?', [batch_id, batch_id]);
    if (batch) {
      finalBatchTitle = batch.title;
      finalCourseId = finalCourseId || batch.course_id;
      finalCourseTitle = finalCourseTitle || batch.course_title;
    }

    const id = 'hw-' + Date.now();
    execute(`
      INSERT INTO homework (id, course_id, course_title, batch_id, batch_title, teacher_id, teacher_name, title, instructions, due_date, due_time, max_marks, submission_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      finalCourseId || 'crs-01',
      finalCourseTitle || 'Quran Studies',
      batch_id,
      finalBatchTitle || batch_id,
      teacher_id,
      teacher_name,
      title,
      instructions,
      due_date || new Date().toISOString().split('T')[0],
      due_time,
      Number(max_marks) || 25,
      submission_type
    ]);

    const created = queryOne('SELECT * FROM homework WHERE id = ?', [id]);

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: `Homework "${title}" kamyabi se SQLite database me save ho gaya aur batch ke talaba ko assign kar diya gaya!`,
      data: created
    }));
  } catch (err) {
    console.error('[createHomework ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

/**
 * 3. DELETE /api/v1/homework/:id
 */
function deleteHomework(req, res, id) {
  try {
    execute('DELETE FROM homework WHERE id = ?', [id]);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Homework assignment deleted from database.' }));
  } catch (err) {
    console.error('[deleteHomework ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

/**
 * 4. POST /api/v1/homework/:id/submit
 * Student assignment submission
 */
function submitHomework(req, res, homeworkId, body) {
  try {
    const { student_id, student_name, submission_notes, audio_url, file_name } = body || {};

    if (!student_id || !homeworkId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'student_id aur homeworkId required hain.' }));
    }

    const subId = 'hws-' + Date.now();
    execute(`
      INSERT INTO homework_submissions (id, homework_id, student_id, student_name, submission_notes, audio_url, file_name, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'Submitted')
    `, [subId, homeworkId, student_id, student_name || 'Talib-e-Ilm', submission_notes || '', audio_url || '', file_name || '']);

    const created = queryOne('SELECT * FROM homework_submissions WHERE id = ?', [subId]);

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: 'Homework kamyabi se jamah (submit) ho gaya!',
      data: created
    }));
  } catch (err) {
    console.error('[submitHomework ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

/**
 * 5. PATCH /api/v1/homework/submissions/:id/grade
 * Teacher grading & audio feedback
 */
function gradeHomework(req, res, submissionId, body) {
  try {
    const { marks_awarded, teacher_feedback, teacher_voice_url } = body || {};

    execute(`
      UPDATE homework_submissions
      SET marks_awarded = ?, teacher_feedback = ?, teacher_voice_url = ?, status = 'Graded'
      WHERE id = ?
    `, [Number(marks_awarded) || 0, teacher_feedback || '', teacher_voice_url || '', submissionId]);

    const updated = queryOne('SELECT * FROM homework_submissions WHERE id = ?', [submissionId]);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: 'Homework evaluation kamyabi se darj ho gayi!',
      data: updated
    }));
  } catch (err) {
    console.error('[gradeHomework ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

/**
 * 6. GET /api/v1/homework/submissions
 */
function getSubmissions(req, res, query) {
  try {
    const { homework_id, batch_id } = query || {};
    let sql = 'SELECT * FROM homework_submissions WHERE 1=1';
    const params = [];

    if (homework_id) {
      sql += ' AND homework_id = ?';
      params.push(homework_id);
    }
    sql += ' ORDER BY submitted_at DESC';

    const list = queryAll(sql, params);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, count: list.length, data: list }));
  } catch (err) {
    console.error('[getSubmissions ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

module.exports = {
  getHomework,
  createHomework,
  deleteHomework,
  submitHomework,
  gradeHomework,
  getSubmissions
};
