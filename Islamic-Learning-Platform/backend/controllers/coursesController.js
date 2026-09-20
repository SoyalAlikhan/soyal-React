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

    // Map database fields to standard schema compatible with React state & DB Explorer
    const mapped = courses.map(c => {
      let parsedLessons = [];
      if (c.lessons_json) {
        try {
          parsedLessons = JSON.parse(c.lessons_json);
        } catch {
          parsedLessons = [];
        }
      }
      return {
        ...c,
        instructor: c.instructor_name || 'Qari Abdul Basit Siddiqui',
        titleArabic: c.arabic_title || '',
        dept: c.department_id ? c.department_id.replace('dept-', '') : 'quran',
        feeModel: c.tuition_type === '100% Free Waqf' ? 'free' : (c.tuition_type === 'One-time Dars' ? 'one_time' : 'monthly'),
        price: c.fee_amount || 0,
        kitabHawala: c.kitab_hawala || '',
        courseType: c.course_type || (c.mode && c.mode.includes('Live') ? 'live' : 'self_paced'),
        studentsCount: c.students_count || 0,
        rating: c.rating ? Number(c.rating) : 5.0,
        status: c.approval_status || 'Approved',
        lessons: parsedLessons.length > 0 ? parsedLessons : [
          { id: 1, title: 'Lesson 1: Introduction & Classical Sanad', duration: '30 mins', type: 'Live' }
        ]
      };
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, count: mapped.length, data: mapped }));
  } catch (err) {
    console.error('[getCourses ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

function createCourse(req, res, body) {
  try {
    const id = body.id || 'crs-' + Date.now();
    let {
      institute_id = 'inst-darululoom-1',
      instructor_name,
      instructor,
      department_id,
      dept,
      title,
      arabic_title = '',
      titleArabic = '',
      level = 'Mubtadi (Beginner)',
      tuition_type,
      fee_model,
      feeModel,
      fee_amount = 0,
      price = 0,
      duration = '16 Weeks',
      durationWeeks,
      mode = 'Interactive Live Halaqah',
      courseType,
      course_type,
      description = '',
      kitabHawala = '',
      kitab_hawala = '',
      lessons = [],
      lessons_json
    } = body;

    const actualInstructor = instructor_name || instructor || 'Qari Abdul Basit Siddiqui';
    const actualTitle = title || 'Untitled Islamic Course';
    const actualArabicTitle = arabic_title || titleArabic || '';

    // Normalize level to satisfy SQLite CHECK constraint
    let normLevel = 'Mubtadi (Beginner)';
    if (/muntahi|advance/i.test(level)) normLevel = 'Muntahi (Advanced)';
    else if (/mutawassit|intermediate/i.test(level)) normLevel = 'Mutawassit (Intermediate)';
    else if (/mubtadi|begin/i.test(level)) normLevel = 'Mubtadi (Beginner)';

    // Normalize tuition_type to satisfy SQLite CHECK constraint
    const feeVal = fee_model || feeModel || tuition_type || '';
    let normTuition = 'Monthly Madrasa';
    if (/free|waqf/i.test(feeVal)) normTuition = '100% Free Waqf';
    else if (/one.*time|dars/i.test(feeVal)) normTuition = 'One-time Dars';
    else if (/month/i.test(feeVal)) normTuition = 'Monthly Madrasa';

    // Normalize department_id
    let actualDept = department_id || dept || 'dept-tajweed';
    if (actualDept === 'quran') actualDept = 'dept-tajweed';
    else if (actualDept === 'hadith' || actualDept === 'darse_nizami') actualDept = 'dept-darse-nizami';
    else if (actualDept === 'hifz') actualDept = 'dept-hifz';
    else if (actualDept === 'women' || actualDept === 'banat') actualDept = 'dept-banat';
    else if (!actualDept.startsWith('dept-')) actualDept = 'dept-tajweed';

    // Normalize duration
    const actualDuration = durationWeeks ? `${durationWeeks} Weeks` : (duration || '12 Weeks');

    // Normalize mode & course_type
    const actualCourseType = course_type || courseType || 'live';
    const actualMode = actualCourseType === 'live' ? 'Interactive Live Halaqah' : (actualCourseType === 'self_paced' ? 'Self-Paced' : mode);

    // Normalize fee
    const actualFee = Number(fee_amount || price || 0);

    // Normalize Hawala & Description
    const actualHawala = kitab_hawala || kitabHawala || '';
    const actualDesc = description || '';

    // Lessons JSON
    const actualLessonsJson = lessons_json || (lessons && lessons.length > 0 ? JSON.stringify(lessons) : '[]');

    execute(`
      INSERT INTO courses (
        id, institute_id, instructor_name, department_id, title, arabic_title, 
        level, tuition_type, fee_amount, duration, mode, approval_status, 
        description, kitab_hawala, course_type, rating, students_count, lessons_json
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      institute_id,
      actualInstructor,
      actualDept,
      actualTitle,
      actualArabicTitle,
      normLevel,
      normTuition,
      actualFee,
      actualDuration,
      actualMode,
      'Approved',
      actualDesc,
      actualHawala,
      actualCourseType,
      5.0,
      0,
      actualLessonsJson
    ]);

    const created = queryOne('SELECT * FROM courses WHERE id = ?', [id]);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      success: true, 
      message: 'Course created and persisted to SQLite successfully', 
      data: {
        ...created,
        instructor: created.instructor_name,
        titleArabic: created.arabic_title,
        dept: actualDept.replace('dept-', ''),
        feeModel: normTuition === '100% Free Waqf' ? 'free' : (normTuition === 'One-time Dars' ? 'one_time' : 'monthly'),
        price: actualFee,
        kitabHawala: actualHawala,
        courseType: actualCourseType,
        studentsCount: 0,
        rating: 5.0,
        status: 'Approved',
        lessons: lessons
      } 
    }));
  } catch (err) {
    console.error('[createCourse ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

// Batches & Halaqaat Schedulers
function getBatches(req, res) {
  try {
    const batches = queryAll(`
      SELECT b.*, c.title as course_title, c.instructor_name
      FROM batches b
      LEFT JOIN courses c ON b.course_id = c.id
      ORDER BY b.created_at DESC
    `);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, count: batches.length, data: batches }));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

function createBatch(req, res, body) {
  try {
    const id = body.id || 'bat-' + Date.now();
    const {
      course_id = 'crs-tajweed-101',
      batch_code = 'BCH-' + Math.floor(100 + Math.random() * 900),
      title,
      schedule_days = 'Mon, Wed, Fri',
      class_time = '08:30 PM PKT',
      max_talaba = 30
    } = body;

    execute(`
      INSERT INTO batches (id, course_id, batch_code, title, schedule_days, class_time, max_talaba)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, course_id, batch_code, title || 'Halaqah Batch', schedule_days, class_time, Number(max_talaba) || 30]);

    const created = queryOne('SELECT * FROM batches WHERE id = ?', [id]);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Batch schedule created successfully', data: created }));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

module.exports = {
  getCourses,
  createCourse,
  getBatches,
  createBatch
};
