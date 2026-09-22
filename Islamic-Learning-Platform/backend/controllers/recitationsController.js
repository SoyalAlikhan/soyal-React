// ============================================================================
// Al-Noor Open Source Islamic Learning Platform — Recitations & Tajweed Audio Controller
// Persists Student Tilawat Audio, Batch Tagging, and Teacher Voice + Text Evaluations
// ============================================================================

const { queryAll, queryOne, execute } = require('../database/db');

// Seed default recitations if table is empty
const recCount = queryOne('SELECT COUNT(*) as count FROM recitations');
if (!recCount || recCount.count === 0) {
  const firstBatch = queryOne('SELECT id, course_id, title FROM batches LIMIT 1') || { id: 'batch-tj-01', title: 'Fajr After Tajweed Halaqah' };
  execute(`
    INSERT INTO recitations (id, batch_id, student_id, student_name, course_title, surah_name, verses, audio_url, duration, student_notes, teacher_feedback, tajweed_score, status)
    VALUES 
      ('rec-101', ?, 'stu-101', 'Ahmad Raza', 'Ahkam-e-Tajweed & Makharij Foundation', 'Surah Al-Fatiha', 'Ayat 1-7', 'https://everyayah.com/data/Husary_128kbps/001001.mp3', '01:15', 'Submitted for Ustad review with focus on Huroof-e-Halqi.', 'MashaAllah! Makharij durust hain. Ayah 4 me Madd par thoda aur waqt dein.', 92, 'Graded'),
      ('rec-102', ?, 'stu-102', 'Muhammad Zaid', 'Ahkam-e-Tajweed & Makharij Foundation', 'Surah Al-Baqarah', 'Ayat 1-5', 'https://everyayah.com/data/Husary_128kbps/002001.mp3', '02:10', 'Tilawat submitted for Makharij evaluation.', NULL, 0, 'Pending Evaluation')
  `, [firstBatch.id, firstBatch.id]);
  console.log('[SQLite Backend] Seeded default recitations with batch bindings.');
}

function getRecitations(req, res, query) {
  try {
    let recs = [];
    if (query && query.batch_id) {
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
      surah_name = 'Surah Recitation',
      verses = 'Ayat',
      audio_url = 'https://everyayah.com/data/Husary_128kbps/001001.mp3',
      duration = '01:00',
      student_notes = ''
    } = body || {};

    if (!student_id) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'student_id required' }));
    }

    execute(`
      INSERT INTO recitations (id, batch_id, student_id, student_name, course_title, surah_name, verses, audio_url, duration, student_notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending Evaluation')
    `, [id, batch_id, student_id, student_name, course_title, surah_name, verses, audio_url, duration, student_notes]);

    const created = queryOne('SELECT * FROM recitations WHERE id = ?', [id]);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Tilawat audio kamyabi se submit ho gayi!', data: created }));
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

    execute(`
      UPDATE recitations
      SET teacher_feedback = ?,
          teacher_voice_url = ?,
          tajweed_score = ?,
          status = 'Graded'
      WHERE id = ?
    `, [teacher_feedback, teacher_voice_url, tajweed_score, recitationId]);

    const updated = queryOne('SELECT * FROM recitations WHERE id = ?', [recitationId]);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: `Audio feedback & remarks kamyabi se record aur submit ho gaye!`,
      data: updated
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
