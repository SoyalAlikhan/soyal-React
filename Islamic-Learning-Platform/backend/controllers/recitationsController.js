// ============================================================================
// Al-Noor Open Source Islamic Learning Platform — Recitations & Tajweed Audio Controller
// Persists Student Tilawat Audio, Targeted Teacher Routing, and Student Feedback Notifications
// ============================================================================

const fs = require('fs');
const path = require('path');
const { queryAll, queryOne, execute } = require('../database/db');

function saveAudioIfBase64(audioStr, prefix = 'rec') {
  if (!audioStr || typeof audioStr !== 'string') return audioStr;
  if (audioStr.startsWith('data:audio/') || audioStr.includes(';base64,')) {
    try {
      const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'audio');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const matches = audioStr.match(/^data:audio\/([a-zA-Z0-9]+);base64,(.+)$/);
      const ext = (matches && matches[1]) ? (matches[1] === 'mpeg' ? 'mp3' : matches[1]) : 'webm';
      const base64Data = matches ? matches[2] : audioStr.split(';base64,')[1];
      if (base64Data) {
        const filename = `${prefix}-${Date.now()}-${Math.floor(100 + Math.random() * 900)}.${ext}`;
        const filePath = path.join(uploadsDir, filename);
        fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
        console.log(`[AUDIO SAVED PERMANENTLY] /uploads/audio/${filename}`);
        return `/uploads/audio/${filename}`;
      }
    } catch (e) {
      console.warn('[AUDIO SAVE WARNING]', e.message);
    }
  }
  return audioStr;
}

function getRecitations(req, res, query) {
  try {
    let recs = [];
    if (query && (query.teacher_id || query.teacher_name)) {
      const tId = query.teacher_id || '';
      const tName = query.teacher_name || '';
      recs = queryAll('SELECT * FROM recitations WHERE teacher_id = ? OR teacher_name LIKE ? OR teacher_name = ? ORDER BY created_at DESC', [tId, `%${tName}%`, tName]);
    } else if (query && (query.student_id || query.student_name)) {
      const sId = query.student_id || '';
      const sName = query.student_name || '';
      recs = queryAll('SELECT * FROM recitations WHERE student_id = ? OR student_id = ? OR student_name = ? OR student_name LIKE ? ORDER BY created_at DESC', [sId, 'usr-' + sId, sName, `%${sName}%`]);
    } else if (query && query.batch_id) {
      recs = queryAll('SELECT * FROM recitations WHERE batch_id = ? ORDER BY created_at DESC', [query.batch_id]);
    } else {
      recs = queryAll('SELECT * FROM recitations ORDER BY created_at DESC');
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, count: recs.length, data: recs }));
  } catch (err) {
    console.error('[getRecitations ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

function createRecitation(req, res, body) {
  try {
    const id = body.id || 'rec-' + Date.now();
    const {
      batch_id = null,
      student_id,
      student_name = 'Talib-e-Ilm',
      course_title = 'Tajweed Foundation',
      surah_name = 'Surah Al-Fatiha',
      verses = 'Ayah 1–7',
      audio_url = 'https://everyayah.com/data/Husary_128kbps/001001.mp3',
      duration = '01:00',
      student_notes = ''
    } = body || {};

    if (!student_id) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'student_id required' }));
    }

    // 1. Resolve targeted batch and the batch's dedicated teacher
    let targetTeacherId = null;
    let targetTeacherName = body.teacher_name || 'Ustadh Bilal Ahmed';
    let batchName = 'General Batch';
    let resolvedCourseTitle = course_title || 'Tajweed Foundation';

    if (batch_id) {
      const batch = queryOne(`
        SELECT b.*, c.title as course_title, c.instructor_name as course_instructor
        FROM batches b
        LEFT JOIN courses c ON b.course_id = c.id
        WHERE b.id = ? OR b.batch_code = ?
      `, [batch_id, batch_id]);

      if (batch) {
        batchName = batch.title;
        resolvedCourseTitle = batch.course_title || resolvedCourseTitle;
        targetTeacherName = batch.instructor_name || batch.course_instructor || body.teacher_name || 'Ustadh Bilal Ahmed';
        if (batch.teacher_id) {
          targetTeacherId = batch.teacher_id;
        }
      }
    }

    if (!targetTeacherId && body.teacher_id) {
      targetTeacherId = body.teacher_id;
    }

    // Resolve a valid user from `users` table for foreign key integrity in notifications
    let teacherUser = null;
    if (targetTeacherId) {
      teacherUser = queryOne('SELECT id, name, email FROM users WHERE id = ?', [targetTeacherId]);
    }
    if (!teacherUser && targetTeacherName) {
      teacherUser = queryOne("SELECT id, name, email FROM users WHERE (role = 'teacher' OR role = 'admin') AND (LOWER(name) = LOWER(?) OR LOWER(name) LIKE LOWER(?))", [targetTeacherName, `%${targetTeacherName}%`]);
    }
    if (!teacherUser && targetTeacherName) {
      const fac = queryOne("SELECT user_id, name FROM faculty WHERE LOWER(name) = LOWER(?) OR LOWER(name) LIKE LOWER(?)", [targetTeacherName, `%${targetTeacherName}%`]);
      if (fac && fac.user_id) {
        teacherUser = queryOne('SELECT id, name, email FROM users WHERE id = ?', [fac.user_id]);
      }
    }
    if (!teacherUser) {
      teacherUser = queryOne("SELECT id, name, email FROM users WHERE role = 'teacher' LIMIT 1") || { id: 'usr-teacher-1', name: 'Ustadh Bilal Ahmed' };
    }

    targetTeacherId = teacherUser.id;
    if (teacherUser.name) {
      targetTeacherName = teacherUser.name;
    }

    // 1B. Resolve valid batch_id
    let resolvedBatchId = null;
    if (batch_id) {
      const bRec = queryOne('SELECT id FROM batches WHERE id = ? OR batch_code = ?', [batch_id, batch_id]);
      if (bRec) resolvedBatchId = bRec.id;
    }

    // 1C. Resolve valid student_id (must reference students.id)
    let resolvedStudentId = null;
    const stu = queryOne('SELECT id FROM students WHERE id = ? OR user_id = ? OR email = ?', [student_id, student_id, student_id]);
    if (stu) {
      resolvedStudentId = stu.id;
    } else {
      const u = queryOne('SELECT id, name, email FROM users WHERE id = ?', [student_id]);
      const newStuId = 'stu-' + Date.now();
      if (u) {
        execute('INSERT INTO students (id, user_id, name, email) VALUES (?, ?, ?, ?)', [newStuId, u.id, u.name, u.email]);
      } else {
        execute('INSERT INTO students (id, user_id, name, email) VALUES (?, ?, ?, ?)', [newStuId, 'usr-student-1', student_name, `${Date.now()}@student.alnoor.edu`]);
      }
      resolvedStudentId = newStuId;
    }

    // Save audio permanently to /uploads/audio/ if Base64
    const finalAudioUrl = saveAudioIfBase64(audio_url, 'student');

    // 2. Persist recitation with teacher_id and teacher_name
    execute(`
      INSERT INTO recitations (
        id, batch_id, student_id, student_name, course_title, 
        surah_name, verses, audio_url, duration, student_notes, 
        status, teacher_id, teacher_name
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending Evaluation', ?, ?)
    `, [
      id, resolvedBatchId, resolvedStudentId, student_name, resolvedCourseTitle,
      surah_name, verses, finalAudioUrl, duration, student_notes,
      targetTeacherId, targetTeacherName
    ]);

    // 3. TARGETED NOTIFICATION: Send ONLY to this batch's teacher
    const notifId = 'notif-' + Date.now();
    const notifTitle = `🎤 Nayi Tilawat Audio: ${student_name} (${batchName})`;
    const notifMessage = `Talib-e-Ilm ${student_name} ne batch "${batchName}" (${resolvedCourseTitle}) me Surah ${surah_name} (${verses}) ki tilawat submit ki hai.\n\n` +
      `Barah-e-karam tilawat suniye, makharij o tajweed ki galti batayein aur agar munasib samjhein to voice note me durust talaffuz record karke bhej dijiye.`;

    execute(`
      INSERT INTO notifications (id, user_id, type, title, message, link)
      VALUES (?, ?, 'recitation_submission', ?, ?, ?)
    `, [notifId, targetTeacherId, notifTitle, notifMessage, `#recitation-${id}`]);

    console.log(`[TARGETED NOTIFICATION DISPATCHED] -> Sent to Teacher "${targetTeacherName}" (ID: ${targetTeacherId}) ONLY for Batch "${batchName}"`);

    const created = queryOne('SELECT * FROM recitations WHERE id = ?', [id]);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: `Tilawat audio kamyabi se submit ho gayi aur sirf Ustad (${targetTeacherName}) ko notification bhej diya gaya!`,
      data: created,
      notified_teacher: {
        teacher_id: targetTeacherId,
        teacher_name: targetTeacherName,
        batch_name: batchName
      }
    }));
  } catch (err) {
    console.error('[createRecitation ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

function gradeRecitation(req, res, recitationId, body) {
  try {
    if (!recitationId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'recitationId required' }));
    }

    const {
      teacher_feedback = '',
      teacher_voice_url = null,
      tajweed_score = 90
    } = body || {};

    const existing = queryOne('SELECT * FROM recitations WHERE id = ?', [recitationId]);
    if (!existing) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Recitation record nahi mila' }));
    }

    const finalTeacherVoice = saveAudioIfBase64(teacher_voice_url, 'teacher');

    execute(`
      UPDATE recitations
      SET teacher_feedback = ?,
          teacher_voice_url = ?,
          tajweed_score = ?,
          status = 'Graded'
      WHERE id = ?
    `, [teacher_feedback, finalTeacherVoice, tajweed_score, recitationId]);

    // TARGETED NOTIFICATION: Send back to the specific student who submitted the audio
    let studentUserId = null;
    if (existing.student_id) {
      const u = queryOne('SELECT id FROM users WHERE id = ?', [existing.student_id]);
      if (u) studentUserId = u.id;
    }
    if (!studentUserId && existing.student_id) {
      const studentRec = queryOne('SELECT user_id, email FROM students WHERE id = ? OR user_id = ?', [existing.student_id, existing.student_id]);
      if (studentRec && studentRec.user_id) {
        const u = queryOne('SELECT id FROM users WHERE id = ?', [studentRec.user_id]);
        if (u) studentUserId = u.id;
      }
      if (!studentUserId && studentRec && studentRec.email) {
        const u = queryOne('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [studentRec.email]);
        if (u) studentUserId = u.id;
      }
    }
    if (!studentUserId && existing.student_name) {
      const u = queryOne('SELECT id FROM users WHERE LOWER(name) = LOWER(?)', [existing.student_name]);
      if (u) studentUserId = u.id;
    }

    if (!studentUserId) {
      const defStudent = queryOne("SELECT id FROM users WHERE role = 'student' LIMIT 1");
      studentUserId = defStudent ? defStudent.id : 'usr-student-1';
    }

    const batchRow = existing.batch_id ? queryOne('SELECT title FROM batches WHERE id = ?', [existing.batch_id]) : null;
    const batchDisplayName = batchRow ? batchRow.title : (existing.course_title || 'Tajweed Batch');
    const teacherName = existing.teacher_name || 'Ustadh Bilal Ahmed';
    const notifId = 'notif-' + Date.now();
    const notifTitle = `✅ Ustad ka Jawab: ${existing.surah_name} (${batchDisplayName})`;
    const previewRemarks = teacher_feedback ? teacher_feedback.slice(0, 130) : 'Feedback provided';
    const hasVoice = Boolean(finalTeacherVoice);
    const notifMessage = `Assalamu Alaikum wa Rahmatullahi wa Barakatuh!\n` +
      `Ustad ${teacherName} ne batch "${batchDisplayName}" ke liye aapki tilawat (Surah ${existing.surah_name}, ${existing.verses}) check kar li hai.\n\n` +
      `• Tajweed Score: ${tajweed_score}/100\n` +
      `• Ustad Remarks (Galti ki nishan-dahi): "${previewRemarks}"\n` +
      (hasVoice ? `• 🎙️ Ustad ka Voice Note Audio shamil hai — Tajweed Practice section me suniye aur talaffuz theek karein.` : '');

    execute(`
      INSERT INTO notifications (id, user_id, type, title, message, link)
      VALUES (?, ?, 'recitation_feedback', ?, ?, ?)
    `, [notifId, studentUserId, notifTitle, notifMessage, `#recitations`]);

    console.log(`[TARGETED NOTIFICATION DISPATCHED] -> Sent to Student (User ID: ${studentUserId}) for Batch "${batchDisplayName}"`);

    const updated = queryOne('SELECT * FROM recitations WHERE id = ?', [recitationId]);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: `Audio feedback & remarks kamyabi se record ho gaye aur Talib-e-Ilm ko notification bhej diya gaya!`,
      data: updated,
      notified_student_id: studentUserId
    }));
  } catch (err) {
    console.error('[gradeRecitation ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

module.exports = {
  getRecitations,
  createRecitation,
  gradeRecitation
};
