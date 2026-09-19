// ============================================================================
// Al-Noor Islamic Learning Platform — Relational Database Seeder
// Seeds default records matching Islamic LMS BRD v2 Personas and Catalogs
// ============================================================================

const { queryAll, queryOne, execute } = require('./db');

function seedDatabase() {
  console.log('Seeding Al-Noor Islamic Learning Platform Database...');

  // 1. Users & Personas
  const users = [
    {
      id: 'usr-student-1',
      name: 'Ahmad Raza',
      email: 'ahmad.raza@example.com',
      role: 'student',
      phone: '+91 98765 43210',
      avatar: 'fa-user-graduate',
      institute_affiliation: 'Jamia Darul Uloom (Talib-e-Ilm)'
    },
    {
      id: 'usr-teacher-1',
      name: 'Qari Abdul Basit Siddiqui',
      email: 'qari.basit@darululoom.edu',
      role: 'teacher',
      phone: '+91 98111 22334',
      avatar: 'fa-chalkboard-teacher',
      institute_affiliation: 'Jamia Darul Uloom (Senior Qari)'
    },
    {
      id: 'usr-institute-1',
      name: 'Maulana Ibrahim Qasmi',
      email: 'admin@darululoom.edu',
      role: 'institute',
      phone: '+91 98222 33445',
      avatar: 'fa-mosque',
      institute_affiliation: 'Jamia Darul Uloom (Nazim-e-Ala)'
    },
    {
      id: 'usr-scholar-1',
      name: 'Mufti Tariq Masood',
      email: 'mufti.tariq@shariahboard.org',
      role: 'scholar',
      phone: '+91 98333 44556',
      avatar: 'fa-user-shield',
      institute_affiliation: 'Central Shariah Moderation Board'
    },
    {
      id: 'usr-teacher-2',
      name: 'Ustadha Zainab Bint Ali',
      email: 'zainab.ali@alnoor.edu',
      role: 'teacher',
      phone: '+91 98444 55667',
      avatar: 'fa-user-tie',
      institute_affiliation: 'Shoba-e-Banat (Khawateen Wing)'
    }
  ];

  for (const u of users) {
    const exists = queryOne('SELECT id FROM users WHERE id = ?', [u.id]);
    if (!exists) {
      execute(
        'INSERT INTO users (id, name, email, role, phone, avatar, institute_affiliation) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [u.id, u.name, u.email, u.role, u.phone, u.avatar, u.institute_affiliation]
      );
    }
  }

  // 2. Institutes (Jamia Darul Uloom)
  const instituteId = 'inst-darululoom-1';
  const instExists = queryOne('SELECT id FROM institutes WHERE id = ?', [instituteId]);
  if (!instExists) {
    execute(
      `INSERT INTO institutes (id, legal_name, arabic_name, nazim_name, waqf_id, city, country, subdomain, bank_account)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        instituteId,
        'Jamia Darul Uloom Deoband / Karachi',
        'جامعة دار العلوم',
        'Maulana Ibrahim Qasmi',
        'WAQF-UP-88219-DELHI',
        'Deoband / Karachi',
        'India / Pakistan',
        'darululoom.alnoor.edu',
        'Al-Baraka Islamic Bank A/C: 99281002931 (IFSC: BARAK001)'
      ]
    );
  }

  // 3. Departments (Shoba-jaat)
  const departments = [
    {
      id: 'dept-tajweed',
      institute_id: instituteId,
      title_en: 'Ahkam-e-Tajweed & Qirat Department',
      title_ur: 'شعبہ تجوید و قراءت',
      arabic_name: 'قسم التجويد والقراءات',
      nazim_name: 'Qari Abdul Basit Siddiqui',
      gender_policy: 'All'
    },
    {
      id: 'dept-darse-nizami',
      institute_id: instituteId,
      title_en: 'Dars-e-Nizami Aalimiyyah Program',
      title_ur: 'شعبہ درسِ نظامی (عالمیت)',
      arabic_name: 'قسم الدرس النظامي والعالمية',
      nazim_name: 'Mufti Tariq Masood',
      gender_policy: 'Male Only'
    },
    {
      id: 'dept-hifz',
      institute_id: instituteId,
      title_en: 'Hifz-ul-Quran Memorization Academy',
      title_ur: 'شعبہ حفظ القرآن الکریم',
      arabic_name: 'قسم تحفيظ القرآن الكريم',
      nazim_name: 'Hafiz Muhammad Bilal',
      gender_policy: 'All'
    },
    {
      id: 'dept-banat',
      institute_id: instituteId,
      title_en: 'Shoba-e-Banat (Khawateen Wing)',
      title_ur: 'شعبہ بنات (خواتین ونگ)',
      arabic_name: 'قسم البنات للشريعة الإسلامية',
      nazim_name: 'Ustadha Zainab Bint Ali',
      gender_policy: 'Strict Pardah Female Only'
    }
  ];

  for (const d of departments) {
    const exists = queryOne('SELECT id FROM departments WHERE id = ?', [d.id]);
    if (!exists) {
      execute(
        `INSERT INTO departments (id, institute_id, title_en, title_ur, arabic_name, nazim_name, gender_policy)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [d.id, d.institute_id, d.title_en, d.title_ur, d.arabic_name, d.nazim_name, d.gender_policy]
      );
    }
  }

  // 4. Faculty Members
  const facultyList = [
    {
      id: 'fac-101',
      institute_id: instituteId,
      user_id: 'usr-teacher-1',
      title: 'Senior Qari',
      name: 'Qari Abdul Basit Siddiqui',
      designation: 'Head of Tajweed & Qirat',
      department_id: 'dept-tajweed',
      sanad_details: 'Hafs an Asim Sanad-e-Aliyah (Shatibiyyah)',
      monthly_hadya: 45000,
      status: 'Active'
    },
    {
      id: 'fac-102',
      institute_id: instituteId,
      user_id: 'usr-scholar-1',
      title: 'Senior Mufti',
      name: 'Mufti Tariq Masood',
      designation: 'Sheikh-ul-Hadith & Shariah Reviewer',
      department_id: 'dept-darse-nizami',
      sanad_details: 'Dars-e-Nizami Aalimiyyah & Takhassus fil-Fiqh',
      monthly_hadya: 60000,
      status: 'Active'
    },
    {
      id: 'fac-103',
      institute_id: instituteId,
      user_id: 'usr-teacher-2',
      title: 'Ustadha',
      name: 'Ustadha Zainab Bint Ali',
      designation: 'Nazima Shoba-e-Banat',
      department_id: 'dept-banat',
      sanad_details: 'Faazilah Dars-e-Nizami (Aalimah Sanad)',
      monthly_hadya: 38000,
      status: 'Active'
    }
  ];

  for (const f of facultyList) {
    const exists = queryOne('SELECT id FROM faculty WHERE id = ?', [f.id]);
    if (!exists) {
      execute(
        `INSERT INTO faculty (id, institute_id, user_id, title, name, designation, department_id, sanad_details, monthly_hadya, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [f.id, f.institute_id, f.user_id, f.title, f.name, f.designation, f.department_id, f.sanad_details, f.monthly_hadya, f.status]
      );
    }
  }

  // 5. Courses
  const courses = [
    {
      id: 'crs-tajweed-101',
      institute_id: instituteId,
      instructor_name: 'Qari Abdul Basit Siddiqui',
      department_id: 'dept-tajweed',
      title: 'Ahkam-e-Tajweed & Makharij Foundation',
      arabic_title: 'أحكام التجويد ومخارج الحروف',
      level: 'Mubtadi (Beginner)',
      tuition_type: 'Monthly Madrasa',
      fee_amount: 1200,
      duration: '16 Weeks',
      mode: 'Interactive Live Halaqah',
      approval_status: 'Approved'
    },
    {
      id: 'crs-darse-nizami-1',
      institute_id: instituteId,
      instructor_name: 'Mufti Tariq Masood',
      department_id: 'dept-darse-nizami',
      title: 'Dars-e-Nizami Aalimiyyah Program (Year 1)',
      arabic_title: 'برنامج العالمية في الدرس النظامي',
      level: 'Muntahi (Advanced)',
      tuition_type: 'Monthly Madrasa',
      fee_amount: 2500,
      duration: '48 Weeks',
      mode: 'Interactive Live Halaqah',
      approval_status: 'Approved'
    },
    {
      id: 'crs-hifz-1',
      institute_id: instituteId,
      instructor_name: 'Hafiz Muhammad Bilal',
      department_id: 'dept-hifz',
      title: 'Hifz-ul-Quran Memorization Halaqah',
      arabic_title: 'حلقة تحفيظ القرآن الكريم',
      level: 'Mubtadi (Beginner)',
      tuition_type: 'Monthly Madrasa',
      fee_amount: 1500,
      duration: 'Continuous',
      mode: 'Interactive Live Halaqah',
      approval_status: 'Approved'
    },
    {
      id: 'crs-fard-ayn',
      institute_id: instituteId,
      instructor_name: 'Shaykh Dr. Ismail Badawi',
      department_id: 'dept-darse-nizami',
      title: "Fard 'Ayn Islamic Essentials",
      arabic_title: 'الفرض العيني وأساسيات الإسلام',
      level: 'Mubtadi (Beginner)',
      tuition_type: '100% Free Waqf',
      fee_amount: 0,
      duration: '8 Weeks',
      mode: 'Self-Paced + Live Q&A',
      approval_status: 'Approved'
    }
  ];

  for (const c of courses) {
    const exists = queryOne('SELECT id FROM courses WHERE id = ?', [c.id]);
    if (!exists) {
      execute(
        `INSERT INTO courses (id, institute_id, instructor_name, department_id, title, arabic_title, level, tuition_type, fee_amount, duration, mode, approval_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [c.id, c.institute_id, c.instructor_name, c.department_id, c.title, c.arabic_title, c.level, c.tuition_type, c.fee_amount, c.duration, c.mode, c.approval_status]
      );
    }
  }

  // 6. Batches
  const batches = [
    {
      id: 'batch-tj-01',
      course_id: 'crs-tajweed-101',
      batch_code: 'TJ-MORNING-2026',
      title: 'Fajr After Tajweed Halaqah',
      schedule_days: 'Mon, Wed, Fri',
      class_time: '07:00 AM - 08:15 AM',
      max_talaba: 25
    },
    {
      id: 'batch-tj-02',
      course_id: 'crs-tajweed-101',
      batch_code: 'TJ-EVENING-2026',
      title: 'Isha Interactive Tajweed Class',
      schedule_days: 'Tue, Thu, Sat',
      class_time: '08:30 PM - 09:45 PM',
      max_talaba: 30
    }
  ];

  for (const b of batches) {
    const exists = queryOne('SELECT id FROM batches WHERE id = ?', [b.id]);
    if (!exists) {
      execute(
        `INSERT INTO batches (id, course_id, batch_code, title, schedule_days, class_time, max_talaba)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [b.id, b.course_id, b.batch_code, b.title, b.schedule_days, b.class_time, b.max_talaba]
      );
    }
  }

  // 7. Admissions Register (Talaba Dakhila)
  const admissions = [
    {
      id: 'adm-2026-001',
      institute_id: instituteId,
      roll_number: 'ROL-8821',
      student_name: 'Ahmad Raza',
      guardian_name: 'Muhammad Farooq',
      guardian_phone: '+91 98765 00112',
      department_id: 'dept-tajweed',
      darja: 'Darja Ula (Tajweed)',
      fee_status: 'Paid',
      monthly_fee: 1200
    },
    {
      id: 'adm-2026-002',
      institute_id: instituteId,
      roll_number: 'ROL-8822',
      student_name: 'Muhammad Zaid',
      guardian_name: 'Tariq Mehmood',
      guardian_phone: '+91 98765 00113',
      department_id: 'dept-darse-nizami',
      darja: 'Darja Saniya (Nahw & Sarf)',
      fee_status: 'Paid',
      monthly_fee: 2500
    },
    {
      id: 'adm-2026-003',
      institute_id: instituteId,
      roll_number: 'ROL-8823',
      student_name: 'Umar Farooq',
      guardian_name: 'Abdul Ghaffar',
      guardian_phone: '+91 98765 00114',
      department_id: 'dept-hifz',
      darja: 'Para 15 Hifz',
      fee_status: '100% Waqf',
      monthly_fee: 0
    }
  ];

  for (const a of admissions) {
    const exists = queryOne('SELECT id FROM admissions WHERE id = ?', [a.id]);
    if (!exists) {
      execute(
        `INSERT INTO admissions (id, institute_id, roll_number, student_name, guardian_name, guardian_phone, department_id, darja, fee_status, monthly_fee)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [a.id, a.institute_id, a.roll_number, a.student_name, a.guardian_name, a.guardian_phone, a.department_id, a.darja, a.fee_status, a.monthly_fee]
      );
    }
  }

  // 8. Leave Applications (Chutti Register)
  const leaves = [
    {
      id: 'LV-101',
      student_id: 'usr-student-1',
      student_name: 'Ahmad Raza',
      course_title: 'Ahkam-e-Tajweed & Makharij Foundation',
      assigned_teacher: 'Qari Abdul Basit Siddiqui',
      approver_role: 'Qari Abdul Basit (Primary Ustad)',
      leave_type: "Uzr-e-Shar'i (Safar)",
      from_date: '2026-09-18',
      to_date: '2026-09-19',
      reason: 'Walidain ke hamrah zaroori safar ki wajah se 2 din ki ijazat matloob hai.',
      status: 'Approved ✅',
      ustad_remarks: 'Ustaad ne uzr-e-shar\'i qubool farmaya. Safar ki ijazat di gayi.'
    },
    {
      id: 'LV-102',
      student_id: 'usr-student-1',
      student_name: 'Ahmad Raza',
      course_title: 'Ahkam-e-Tajweed & Makharij Foundation',
      assigned_teacher: 'Qari Abdul Basit Siddiqui',
      approver_role: 'Qari Abdul Basit & Nazim',
      leave_type: "Uzr-e-Shar'i (Beemari)",
      from_date: '2026-09-20',
      to_date: '2026-09-22',
      reason: 'Shadeed bukhar aur sardi ki wajah se kal ki class me hazir nahi ho sakunga.',
      status: 'Pending Ustad Review ⏳',
      ustad_remarks: 'Under verification by Ustad Qari Abdul Basit'
    }
  ];

  for (const l of leaves) {
    const exists = queryOne('SELECT id FROM leave_applications WHERE id = ?', [l.id]);
    if (!exists) {
      execute(
        `INSERT INTO leave_applications (id, student_id, student_name, course_title, assigned_teacher, approver_role, leave_type, from_date, to_date, reason, status, ustad_remarks)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [l.id, l.student_id, l.student_name, l.course_title, l.assigned_teacher, l.approver_role, l.leave_type, l.from_date, l.to_date, l.reason, l.status, l.ustad_remarks]
      );
    }
  }

  // 9. Mahana Chanda & Waqf Ledger
  const chandaRecords = [
    {
      id: 'CH-2026-01',
      institute_id: instituteId,
      student_or_donor: 'Haji Abdul Karim (Waqf Donor)',
      fund_category: 'Yateem Talaba Kifalah Fund',
      amount: 15000,
      payment_mode: 'Direct Bank NEFT',
      receipt_no: 'RCP-88219'
    },
    {
      id: 'CH-2026-02',
      institute_id: instituteId,
      student_or_donor: 'Muhammad Zaid (Student Fee)',
      fund_category: 'Mahana Dars-e-Nizami Fee',
      amount: 2500,
      payment_mode: 'Instant UPI QR',
      receipt_no: 'RCP-88220'
    }
  ];

  for (const c of chandaRecords) {
    const exists = queryOne('SELECT id FROM chanda_ledger WHERE id = ?', [c.id]);
    if (!exists) {
      execute(
        `INSERT INTO chanda_ledger (id, institute_id, student_or_donor, fund_category, amount, payment_mode, receipt_no)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [c.id, c.institute_id, c.student_or_donor, c.fund_category, c.amount, c.payment_mode, c.receipt_no]
      );
    }
  }

  // 10. Course Reviews
  const reviews = [
    {
      course_id: 'crs-tajweed-101',
      student_name: 'Ahmad Raza',
      rating: 5,
      maslak_accuracy: 'Authentic & Verified',
      feedback: 'Alhamdulillah, Qari Sahab ka Makharij samjhane ka tareeqa nihayat aasan aur mufeed hai.'
    }
  ];

  for (const r of reviews) {
    execute(
      `INSERT INTO course_reviews (course_id, student_name, rating, maslak_accuracy, feedback)
       VALUES (?, ?, ?, ?, ?)`,
      [r.course_id, r.student_name, r.rating, r.maslak_accuracy, r.feedback]
    );
  }

  console.log('Database seeded successfully with BRD personas, courses, and operations!');
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
