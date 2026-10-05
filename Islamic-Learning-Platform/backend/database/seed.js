// ============================================================================
// School of Deeni Ilm — BRD v4 Database Seeder (Clean Reset)
// Seeds default records matching Islamic LMS BRD v4 Personas and Catalogs
// ============================================================================

const { queryAll, queryOne, execute } = require('./db');

function seedDatabase() {
  console.log('Seeding School of Deeni Ilm Database (BRD v4 — Clean Reset)...');

  const crypto = require('crypto');
  const hash = (pw) => crypto.createHash('sha256').update(pw).digest('hex');

  // =============================================
  // 1. Users & Personas (BRD Section 26, 28, 29)
  // One user per role + one multi-role demo user
  // =============================================
  const users = [
    {
      id: 'usr-student-1',
      name: 'Ayesha Khan',
      email: 'ayesha@test.com',
      username: 'ayesha',
      password: 'student123',
      role: 'student',
      phone: '+91 98765 43210',
      avatar: 'A',
      institute_affiliation: 'Kids Academy — Age 11-13'
    },
    {
      id: 'usr-teacher-1',
      name: 'Ustadh Bilal Ahmed',
      email: 'bilal@test.com',
      username: 'bilal',
      password: 'teacher123',
      role: 'teacher',
      phone: '+91 98111 22334',
      avatar: 'B',
      institute_affiliation: 'Independent Verified Scholar'
    },
    {
      id: 'usr-teacher-2',
      name: 'Ustadha Sara Qureshi',
      email: 'sara@test.com',
      username: 'sara',
      password: 'teacher123',
      role: 'teacher',
      phone: '+91 98444 55667',
      avatar: 'S',
      institute_affiliation: 'Al-Furqan Academy (Senior Teacher)'
    },
    {
      id: 'usr-institute-1',
      name: 'Al-Furqan Academy',
      email: 'admin@alfurqan.edu',
      username: 'alfurqan',
      password: 'institute123',
      role: 'institute',
      phone: '+91 98222 33445',
      avatar: 'F',
      institute_affiliation: 'Al-Furqan Islamic Academy'
    },
    {
      id: 'usr-admin-1',
      name: 'Platform Admin',
      email: 'admin@test.com',
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      phone: '+91 98333 44556',
      avatar: 'P',
      institute_affiliation: 'School of Deeni Ilm (Super Admin)'
    },
    // Multi-profile demo user (BRD Section 28)
    {
      id: 'usr-multi-1',
      name: 'Soyal Khan',
      email: 'soyal@test.com',
      username: 'soyal',
      password: 'test123',
      role: 'student',
      phone: '+91 99999 00001',
      avatar: 'S',
      institute_affiliation: 'Multi-Role Account'
    }
  ];

  for (const u of users) {
    const exists = queryOne('SELECT id FROM users WHERE id = ?', [u.id]);
    const passHash = hash(u.password);
    if (!exists) {
      execute(
        'INSERT INTO users (id, name, username, email, password, password_hash, role, phone, avatar, institute_affiliation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [u.id, u.name, u.username, u.email, u.password, passHash, u.role, u.phone, u.avatar, u.institute_affiliation]
      );
    }
  }

  // =============================================
  // 2. Profiles (BRD Section 28 — Multi-Role)
  // =============================================
  const profiles = [
    { id: 'prf-s1', user_id: 'usr-student-1', role: 'student', display_name: 'Ayesha Khan', verification_status: 'verified', is_active: 1 },
    { id: 'prf-t1', user_id: 'usr-teacher-1', role: 'teacher', display_name: 'Ustadh Bilal Ahmed', verification_status: 'verified', is_active: 1 },
    { id: 'prf-t2', user_id: 'usr-teacher-2', role: 'teacher', display_name: 'Ustadha Sara Qureshi', linked_institute_id: 'inst-alfurqan', verification_status: 'verified', is_active: 1 },
    { id: 'prf-i1', user_id: 'usr-institute-1', role: 'institute_admin', display_name: 'Al-Furqan Academy', linked_institute_id: 'inst-alfurqan', verification_status: 'verified', is_active: 1 },
    { id: 'prf-a1', user_id: 'usr-admin-1', role: 'admin', display_name: 'Platform Admin', verification_status: 'verified', is_active: 1 },
    // Multi-profile user: 3 roles under 1 account
    { id: 'prf-ms', user_id: 'usr-multi-1', role: 'student', display_name: 'Soyal Khan (Student)', verification_status: 'verified', is_active: 1 },
    { id: 'prf-mt', user_id: 'usr-multi-1', role: 'teacher', display_name: 'Soyal Khan (Teacher)', verification_status: 'verified', is_active: 0 },
    { id: 'prf-mi', user_id: 'usr-multi-1', role: 'institute_admin', display_name: 'Soyal Khan (Jamia Nazim)', linked_institute_id: 'inst-alfurqan', verification_status: 'verified', is_active: 0 }
  ];
  for (const p of profiles) {
    const exists = queryOne('SELECT id FROM profiles WHERE id = ?', [p.id]);
    if (!exists) {
      execute('INSERT INTO profiles (id, user_id, role, display_name, linked_institute_id, verification_status, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [p.id, p.user_id, p.role, p.display_name, p.linked_institute_id || null, p.verification_status, p.is_active]);
    }
  }

  // =============================================
  // 3. Institutes (BRD Section 27)
  // =============================================
  const institutes = [
    { id: 'inst-alfurqan', legal_name: 'Al-Furqan Islamic Academy', arabic_name: 'أكاديمية الفرقان الإسلامية', nazim_name: 'Al-Furqan Academy Admin', waqf_id: 'WAQF-UP-88219', city: 'Jaipur', country: 'India', subdomain: 'alfurqan.deeni-ilm.org', bank_account: 'SBI A/C: 99281002931' }
  ];
  for (const inst of institutes) {
    const exists = queryOne('SELECT id FROM institutes WHERE id = ?', [inst.id]);
    if (!exists) {
      execute('INSERT INTO institutes (id, legal_name, arabic_name, nazim_name, waqf_id, city, country, subdomain, bank_account) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [inst.id, inst.legal_name, inst.arabic_name, inst.nazim_name, inst.waqf_id, inst.city, inst.country, inst.subdomain, inst.bank_account]);
    }
  }

  // =============================================
  // 4. Departments (BRD Section 27.2)
  // =============================================
  const departments = [
    { id: 'dept-tajweed', institute_id: 'inst-alfurqan', title_en: "Qur'an & Tajweed", title_ur: 'شعبہ تجوید و قراءت', arabic_name: 'قسم التجويد', nazim_name: 'Ustadh Bilal Ahmed', gender_policy: 'All' },
    { id: 'dept-islamic-studies', institute_id: 'inst-alfurqan', title_en: 'Islamic Studies', title_ur: 'شعبہ اسلامی علوم', arabic_name: 'قسم الدراسات الإسلامية', nazim_name: 'Ustadha Sara Qureshi', gender_policy: 'All' },
    { id: 'dept-arabic', institute_id: 'inst-alfurqan', title_en: 'Arabic Language', title_ur: 'شعبہ عربی زبان', arabic_name: 'قسم اللغة العربية', nazim_name: 'Ustadh Bilal Ahmed', gender_policy: 'All' },
    { id: 'dept-hifz', institute_id: 'inst-alfurqan', title_en: 'Hifz-ul-Quran', title_ur: 'شعبہ حفظ القرآن', arabic_name: 'قسم تحفيظ القرآن', nazim_name: 'Ustadha Sara Qureshi', gender_policy: 'All' },
    { id: 'dept-darse-nizami', institute_id: 'inst-alfurqan', title_en: "Aalim / Aalima Path", title_ur: 'شعبہ درسِ نظامی', arabic_name: 'قسم الدرس النظامي', nazim_name: 'Platform Admin', gender_policy: 'All' },
    { id: 'dept-banat', institute_id: 'inst-alfurqan', title_en: "Women's Section", title_ur: 'شعبہ بنات', arabic_name: 'قسم البنات', nazim_name: 'Ustadha Sara Qureshi', gender_policy: 'Strict Pardah Female Only' }
  ];
  for (const d of departments) {
    const exists = queryOne('SELECT id FROM departments WHERE id = ?', [d.id]);
    if (!exists) {
      execute('INSERT INTO departments (id, institute_id, title_en, title_ur, arabic_name, nazim_name, gender_policy) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [d.id, d.institute_id, d.title_en, d.title_ur, d.arabic_name, d.nazim_name, d.gender_policy]);
    }
  }

  // =============================================
  // 5. Faculty (BRD Section 27.2)
  // =============================================
  const faculty = [
    { id: 'fac-1', institute_id: 'inst-alfurqan', user_id: 'usr-teacher-1', title: 'Ustadh', name: 'Ustadh Bilal Ahmed', designation: 'Senior Qari & Tajweed Instructor', department_id: 'dept-tajweed', sanad_details: 'Fazil Darul Uloom — Sanad-e-Qirat', monthly_hadya: 15000, status: 'Active' },
    { id: 'fac-2', institute_id: 'inst-alfurqan', user_id: 'usr-teacher-2', title: 'Ustadha', name: 'Ustadha Sara Qureshi', designation: 'Islamic Studies & Women Section Head', department_id: 'dept-islamic-studies', sanad_details: 'Aalima Certification — Jamia Al-Kauthar', monthly_hadya: 12000, status: 'Active' }
  ];
  for (const f of faculty) {
    const exists = queryOne('SELECT id FROM faculty WHERE id = ?', [f.id]);
    if (!exists) {
      execute('INSERT INTO faculty (id, institute_id, user_id, title, name, designation, department_id, sanad_details, monthly_hadya, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [f.id, f.institute_id, f.user_id, f.title, f.name, f.designation, f.department_id, f.sanad_details, f.monthly_hadya, f.status]);
    }
  }

  // =============================================
  // 6. Courses (BRD Sections 3-10, 30, 42.1)
  // =============================================
  const courses = [
    { id: 'crs-01', institute_id: 'inst-alfurqan', instructor_name: 'Ustadh Bilal Ahmed', department_id: 'dept-tajweed', title: 'Tajweed Foundation & Rules of Ghunnah', arabic_title: 'أحكام التجويد والغنة', level: 'Mubtadi (Beginner)', tuition_type: 'Monthly Madrasa', fee_amount: 800, duration: '16 Weeks', mode: 'Interactive Live Halaqah', approval_status: 'Approved', description: 'Complete Tajweed course covering Makharij, Ghunnah, Madd and Qalqalah rules. Includes practical tilawat sessions.', kitab_hawala: 'Al-Muqaddimah Al-Jazariyyah' },
    { id: 'crs-02', institute_id: 'inst-alfurqan', instructor_name: 'Ustadha Sara Qureshi', department_id: 'dept-islamic-studies', title: 'Aqeedah Beginner — Foundations of Faith', arabic_title: 'أصول العقيدة', level: 'Mubtadi (Beginner)', tuition_type: '100% Free Waqf', fee_amount: 0, duration: '12 Weeks', mode: 'Self-Paced + Live Q&A', approval_status: 'Approved', description: 'Foundations of Islamic belief, Tawheed, Risalat, and Akhirah.', kitab_hawala: 'Aqeedah Tahawiyyah' },
    { id: 'crs-03', institute_id: 'inst-alfurqan', instructor_name: 'Ustadh Bilal Ahmed', department_id: 'dept-arabic', title: 'Arabic Level 2 — Sarf & Nahw', arabic_title: 'المستوى الثاني في الصرف والنحو', level: 'Mutawassit (Intermediate)', tuition_type: 'One-time Dars', fee_amount: 1200, duration: '20 Weeks', mode: 'Interactive Live Halaqah', approval_status: 'Approved', description: 'Arabic Grammar: Ism, Fil, Harf, Jumla Ismiyyah and Filiyyah.', kitab_hawala: 'Hidayat-un-Nahw & Ilm-us-Sarf' },
    { id: 'crs-04', institute_id: 'inst-alfurqan', instructor_name: 'Ustadha Sara Qureshi', department_id: 'dept-tajweed', title: 'Noorani Qaida with Makharij', arabic_title: 'نوراني قاعدة', level: 'Mubtadi (Beginner)', tuition_type: '100% Free Waqf', fee_amount: 0, duration: '8 Weeks', mode: 'Self-Paced + Live Q&A', approval_status: 'Approved', description: 'Learn Arabic letters, basic Makharij, and join Qaida reading practice.', kitab_hawala: 'Noorani Qaida' },
    { id: 'crs-05', institute_id: 'inst-alfurqan', instructor_name: 'Ustadh Bilal Ahmed', department_id: 'dept-tajweed', title: 'Advanced Tajweed & Waqf-o-Ibtida', arabic_title: 'التجويد المتقدم والوقف والابتداء', level: 'Muntahi (Advanced)', tuition_type: 'One-time Dars', fee_amount: 1500, duration: '24 Weeks', mode: 'Interactive Live Halaqah', approval_status: 'Approved', description: 'Advanced recitation rules including Waqf, Ibtida, and Qiraat foundations.', kitab_hawala: 'Kitab-ul-Waqf wal-Ibtida' },
    { id: 'crs-06', institute_id: 'inst-alfurqan', instructor_name: 'Ustadha Sara Qureshi', department_id: 'dept-hifz', title: 'Hifz-ul-Quran Memorization Program', arabic_title: 'حفظ القرآن الکریم', level: 'Mubtadi (Beginner)', tuition_type: 'Monthly Madrasa', fee_amount: 1500, duration: 'Continuous', mode: 'Interactive Live Halaqah', approval_status: 'Approved', description: 'Daily Hifz sabaq, sabqi, and manzil revision halaqah.', kitab_hawala: 'Mushaf Uthmani' }
  ];
  for (const c of courses) {
    const exists = queryOne('SELECT id FROM courses WHERE id = ?', [c.id]);
    if (!exists) {
      execute('INSERT INTO courses (id, institute_id, instructor_name, department_id, title, arabic_title, level, tuition_type, fee_amount, duration, mode, approval_status, description, kitab_hawala) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [c.id, c.institute_id, c.instructor_name, c.department_id, c.title, c.arabic_title, c.level, c.tuition_type, c.fee_amount, c.duration, c.mode, c.approval_status, c.description, c.kitab_hawala]);
    }
  }

  // =============================================
  // 7. Batches (BRD Section 42.2)
  // =============================================
  const batches = [
    { id: 'batch-01', course_id: 'crs-01', batch_code: 'TJ-EVE-B1', title: 'Tajweed Evening — Batch 1', schedule_days: 'Mon, Wed, Fri', class_time: '5:30 PM — 6:15 PM', max_talaba: 20 },
    { id: 'batch-02', course_id: 'crs-02', batch_code: 'AQ-AFT-B1', title: 'Aqeedah Beginner — Batch 1', schedule_days: 'Tue, Thu', class_time: '4:00 PM — 4:45 PM', max_talaba: 25 },
    { id: 'batch-03', course_id: 'crs-03', batch_code: 'AR-MOR-B1', title: 'Arabic Level 2 — Batch 1', schedule_days: 'Mon, Wed, Fri', class_time: '10:00 AM — 11:00 AM', max_talaba: 15 },
    { id: 'batch-04', course_id: 'crs-04', batch_code: 'QD-MOR-B1', title: 'Noorani Qaida — Batch 1', schedule_days: 'Daily (Mon-Fri)', class_time: '7:00 AM — 7:40 AM', max_talaba: 30 }
  ];
  for (const b of batches) {
    const exists = queryOne('SELECT id FROM batches WHERE id = ?', [b.id]);
    if (!exists) {
      execute('INSERT INTO batches (id, course_id, batch_code, title, schedule_days, class_time, max_talaba) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [b.id, b.course_id, b.batch_code, b.title, b.schedule_days, b.class_time, b.max_talaba]);
    }
  }

  // =============================================
  // 8. Students (BRD Section 42.3)
  // =============================================
  const students = [
    { id: 'stu-01', user_id: 'usr-student-1', name: 'Ayesha Khan', email: 'ayesha@test.com', phone: '+91 98765 43210', roll_number: 'SDI-2026-001', guardian_name: 'Dr. M. Khan', gender: 'Female', age: 12 },
    { id: 'stu-02', user_id: 'usr-multi-1', name: 'Soyal Khan', email: 'soyal@test.com', phone: '+91 99999 00001', roll_number: 'SDI-2026-002', guardian_name: null, gender: 'Male', age: 22 }
  ];
  for (const s of students) {
    const exists = queryOne('SELECT id FROM students WHERE id = ?', [s.id]);
    if (!exists) {
      execute('INSERT INTO students (id, user_id, name, email, phone, roll_number, guardian_name, gender, age) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [s.id, s.user_id, s.name, s.email, s.phone, s.roll_number, s.guardian_name, s.gender, s.age]);
    }
  }

  // =============================================
  // 9. Enrollments
  // =============================================
  const enrollments = [
    { id: 'enr-01', student_id: 'stu-01', course_id: 'crs-01', batch_id: 'batch-01' },
    { id: 'enr-02', student_id: 'stu-01', course_id: 'crs-02', batch_id: 'batch-02' },
    { id: 'enr-03', student_id: 'stu-01', course_id: 'crs-04', batch_id: 'batch-04' }
  ];
  for (const e of enrollments) {
    const exists = queryOne('SELECT id FROM enrollments WHERE id = ?', [e.id]);
    if (!exists) {
      execute('INSERT INTO enrollments (id, student_id, course_id, batch_id) VALUES (?, ?, ?, ?)', [e.id, e.student_id, e.course_id, e.batch_id]);
    }
  }

  // =============================================
  // 10. Live Classes (BRD Section 15, 42.4)
  // =============================================
  const liveClasses = [
    { id: 'lc-01', batch_id: 'batch-01', course_id: 'crs-01', title: 'Live — Rules of Ghunnah', instructor_name: 'Ustadh Bilal Ahmed', class_date: '2026-09-29', class_time: '5:30 PM', recurrence: 'Mon/Wed/Fri', enrolled_count: 14, status: 'Scheduled' },
    { id: 'lc-02', batch_id: 'batch-02', course_id: 'crs-02', title: 'Aqeedah Intro — Tawheed', instructor_name: 'Ustadha Sara Qureshi', class_date: '2026-09-30', class_time: '4:00 PM', recurrence: 'Tue/Thu', enrolled_count: 18, status: 'Scheduled' }
  ];
  for (const lc of liveClasses) {
    const exists = queryOne('SELECT id FROM live_classes WHERE id = ?', [lc.id]);
    if (!exists) {
      execute('INSERT INTO live_classes (id, batch_id, course_id, title, instructor_name, class_date, class_time, recurrence, enrolled_count, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [lc.id, lc.batch_id, lc.course_id, lc.title, lc.instructor_name, lc.class_date, lc.class_time, lc.recurrence, lc.enrolled_count, lc.status]);
    }
  }

  // =============================================
  // 11. Homework (BRD Section 34)
  // =============================================
  const homework = [
    { id: 'hw-01', course_id: 'crs-01', course_title: 'Tajweed Foundation', batch_id: 'batch-01', batch_title: 'Tajweed Evening — Batch 1', teacher_id: 'usr-teacher-1', teacher_name: 'Ustadh Bilal Ahmed', title: 'Surah Al-Fatiha Recitation Practice', instructions: 'Record your tilawat of Surah Al-Fatiha with proper Makharij and submit audio.', due_date: '2026-10-01', due_time: '6:00 PM', max_marks: 25, submission_type: 'Audio Recitation' }
  ];
  for (const h of homework) {
    const exists = queryOne('SELECT id FROM homework WHERE id = ?', [h.id]);
    if (!exists) {
      execute('INSERT INTO homework (id, course_id, course_title, batch_id, batch_title, teacher_id, teacher_name, title, instructions, due_date, due_time, max_marks, submission_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [h.id, h.course_id, h.course_title, h.batch_id, h.batch_title, h.teacher_id, h.teacher_name, h.title, h.instructions, h.due_date, h.due_time, h.max_marks, h.submission_type]);
    }
  }

  // =============================================
  // 12. Notifications (BRD Section 33)
  // =============================================
  const notifs = [
    { id: 'notif-01', user_id: 'usr-student-1', type: 'class', title: 'Tajweed live class in 15 min', message: 'Your Tajweed Foundation class with Ustadh Bilal starts at 5:30 PM today.' },
    { id: 'notif-02', user_id: 'usr-student-1', type: 'homework', title: 'Homework due tomorrow', message: 'Surah Al-Fatiha recitation assignment due by 6 PM tomorrow.' },
    { id: 'notif-03', user_id: 'usr-student-1', type: 'grade', title: 'New grade posted', message: 'Ustadh Bilal graded your Tajweed quiz: 88/100. MashaAllah!' },
    { id: 'notif-04', user_id: 'usr-teacher-1', type: 'submission', title: 'New audio submission', message: 'Ayesha Khan submitted Surah Al-Fatiha recitation for review.' },
    { id: 'notif-05', user_id: 'usr-teacher-1', type: 'fee', title: 'Payment received', message: 'Student Ayesha Khan paid ₹800 for Tajweed batch.' },
    { id: 'notif-06', user_id: 'usr-admin-1', type: 'verification', title: 'Teacher verification pending', message: 'New teacher registration requires credential verification.' }
  ];
  for (const n of notifs) {
    const exists = queryOne('SELECT id FROM notifications WHERE id = ?', [n.id]);
    if (!exists) {
      execute('INSERT INTO notifications (id, user_id, type, title, message) VALUES (?, ?, ?, ?, ?)', [n.id, n.user_id, n.type, n.title, n.message]);
    }
  }

  // =============================================
  // 13. Certificates (BRD Section 19)
  // =============================================
  const certs = [
    { id: 'cert-01', student_id: 'usr-student-1', student_name: 'Ayesha Khan', course_id: 'crs-04', course_title: 'Noorani Qaida with Makharij', instructor_name: 'Ustadha Sara Qureshi', grade: 'A+', score: 96, completion_date: '2026-08-10' }
  ];
  for (const c of certs) {
    const exists = queryOne('SELECT id FROM certificates WHERE id = ?', [c.id]);
    if (!exists) {
      execute('INSERT INTO certificates (id, student_id, student_name, course_id, course_title, instructor_name, grade, score, completion_date, verification_qr) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [c.id, c.student_id, c.student_name, c.course_id, c.course_title, c.instructor_name, c.grade, c.score, c.completion_date, 'SDI-CERT-' + c.id]);
    }
  }

  // =============================================
  // 14. Payments (BRD Section 32)
  // =============================================
  const payments = [
    { id: 'pay-01', student_id: 'usr-student-1', course_id: 'crs-01', batch_id: 'batch-01', amount: 800, payment_method: 'UPI', status: 'paid', invoice_number: 'INV-2026-001', teacher_share: 680, platform_share: 120 }
  ];
  for (const p of payments) {
    const exists = queryOne('SELECT id FROM payments WHERE id = ?', [p.id]);
    if (!exists) {
      execute('INSERT INTO payments (id, student_id, course_id, batch_id, amount, payment_method, status, invoice_number, teacher_share, platform_share) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [p.id, p.student_id, p.course_id, p.batch_id, p.amount, p.payment_method, p.status, p.invoice_number, p.teacher_share, p.platform_share]);
    }
  }

  // =============================================
  // 15. Content Reports (BRD Section 36)
  // =============================================
  const reports = [
    { id: 'rep-01', reporter_id: 'usr-student-1', reporter_name: 'Ayesha Khan', content_type: 'qa_comment', reason: 'Unverified fatwa', details: 'Comment in Fiqh lesson contains fatwa without proper source reference.', status: 'pending' }
  ];
  for (const r of reports) {
    const exists = queryOne('SELECT id FROM content_reports WHERE id = ?', [r.id]);
    if (!exists) {
      execute('INSERT INTO content_reports (id, reporter_id, reporter_name, content_type, reason, details, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [r.id, r.reporter_id, r.reporter_name, r.content_type, r.reason, r.details, r.status]);
    }
  }

  // =============================================
  // 16. Chanda Ledger (BRD Section 32)
  // =============================================
  const chanda = [
    { id: 'ch-01', institute_id: 'inst-alfurqan', student_or_donor: 'Anonymous Donor', fund_category: 'Waqf Fund', amount: 50000, payment_mode: 'Bank Transfer', receipt_no: 'REC-2026-001' }
  ];
  for (const ch of chanda) {
    const exists = queryOne('SELECT id FROM chanda_ledger WHERE id = ?', [ch.id]);
    if (!exists) {
      execute('INSERT INTO chanda_ledger (id, institute_id, student_or_donor, fund_category, amount, payment_mode, receipt_no) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [ch.id, ch.institute_id, ch.student_or_donor, ch.fund_category, ch.amount, ch.payment_mode, ch.receipt_no]);
    }
  }

  // =============================================
  // 17. Admissions Register
  // =============================================
  const admissions = [
    { id: 'adm-01', institute_id: 'inst-alfurqan', roll_number: 'SDI-2026-001', student_name: 'Ayesha Khan', guardian_name: 'Dr. M. Khan', guardian_phone: '+91 98765 43210', department_id: 'dept-tajweed', darja: 'Foundation Year', fee_status: 'Paid', monthly_fee: 800 }
  ];
  for (const a of admissions) {
    const exists = queryOne('SELECT id FROM admissions WHERE id = ?', [a.id]);
    if (!exists) {
      execute('INSERT INTO admissions (id, institute_id, roll_number, student_name, guardian_name, guardian_phone, department_id, darja, fee_status, monthly_fee) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [a.id, a.institute_id, a.roll_number, a.student_name, a.guardian_name, a.guardian_phone, a.department_id, a.darja, a.fee_status, a.monthly_fee]);
    }
  }

  console.log('✅ Database seeded successfully with BRD v4 clean data!');
  console.log('   Login Credentials:');
  console.log('   Student:   ayesha@test.com / student123');
  console.log('   Teacher:   bilal@test.com / teacher123');
  console.log('   Institute: admin@alfurqan.edu / institute123');
  console.log('   Admin:     admin@test.com / admin123');
  console.log('   Multi:     soyal@test.com / test123');
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
