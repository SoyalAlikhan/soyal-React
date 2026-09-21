-- ============================================================================
-- Al-Noor Open Source Islamic Learning Platform — Relational Database Schema
-- Fully Compliant with Islamic LMS BRD v2.0 (Sections 03, 11, 13, 18, 19, 19A)
-- Database Engine: SQLite / PostgreSQL Compatible Standard SQL
-- ============================================================================

-- 1. Users & Personas Table (Students, Teachers, Institute Admins, Scholars)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT DEFAULT 'sha256_mock_hash_alnoor',
    role TEXT NOT NULL CHECK(role IN ('student', 'teacher', 'institute', 'scholar', 'admin')),
    phone TEXT,
    avatar TEXT,
    institute_affiliation TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Institutes & Madaris Table (Jamia / Madrasa Hub)
CREATE TABLE IF NOT EXISTS institutes (
    id TEXT PRIMARY KEY,
    legal_name TEXT NOT NULL,
    arabic_name TEXT,
    nazim_name TEXT NOT NULL,
    waqf_id TEXT,
    city TEXT DEFAULT 'Karachi / Deoband',
    country TEXT DEFAULT 'India / Pakistan',
    subdomain TEXT UNIQUE,
    bank_account TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Academic Departments (Shoba-jaat & Wings)
CREATE TABLE IF NOT EXISTS departments (
    id TEXT PRIMARY KEY,
    institute_id TEXT NOT NULL,
    title_en TEXT NOT NULL,
    title_ur TEXT NOT NULL,
    arabic_name TEXT,
    nazim_name TEXT,
    gender_policy TEXT CHECK(gender_policy IN ('All', 'Male Only', 'Strict Pardah Female Only')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE
);

-- 4. Asateza & Faculty Directory
CREATE TABLE IF NOT EXISTS faculty (
    id TEXT PRIMARY KEY,
    institute_id TEXT NOT NULL,
    user_id TEXT,
    title TEXT DEFAULT 'Ustad',
    name TEXT NOT NULL,
    designation TEXT NOT NULL,
    department_id TEXT,
    sanad_details TEXT,
    monthly_hadya INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE
);

-- 5. Courses Catalog
CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    institute_id TEXT,
    instructor_name TEXT NOT NULL,
    department_id TEXT,
    title TEXT NOT NULL,
    arabic_title TEXT,
    level TEXT CHECK(level IN ('Mubtadi (Beginner)', 'Mutawassit (Intermediate)', 'Muntahi (Advanced)')),
    tuition_type TEXT CHECK(tuition_type IN ('Monthly Madrasa', 'One-time Dars', '100% Free Waqf')),
    fee_amount INTEGER DEFAULT 0,
    duration TEXT,
    mode TEXT DEFAULT 'Interactive Live Halaqah',
    approval_status TEXT DEFAULT 'Approved',
    description TEXT,
    kitab_hawala TEXT,
    course_type TEXT,
    rating REAL DEFAULT 5.0,
    students_count INTEGER DEFAULT 0,
    lessons_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Batches & Halaqaat Schedulers
CREATE TABLE IF NOT EXISTS batches (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL,
    batch_code TEXT NOT NULL,
    title TEXT NOT NULL,
    schedule_days TEXT NOT NULL,
    class_time TEXT NOT NULL,
    max_talaba INTEGER DEFAULT 30,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- 6B. Scheduled Live Classes (Direct Teacher & Halaqah Scheduling)
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
);

-- 7. Talaba Admissions Register (Dakhila)
CREATE TABLE IF NOT EXISTS admissions (
    id TEXT PRIMARY KEY,
    institute_id TEXT NOT NULL,
    roll_number TEXT UNIQUE NOT NULL,
    student_name TEXT NOT NULL,
    guardian_name TEXT,
    guardian_phone TEXT,
    department_id TEXT,
    darja TEXT,
    fee_status TEXT CHECK(fee_status IN ('Paid', 'Due', '100% Waqf')),
    monthly_fee INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE
);

-- 8. Student Course Enrollments & 7-Day Shariah Escrow
CREATE TABLE IF NOT EXISTS enrollments (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    batch_id TEXT,
    escrow_status TEXT DEFAULT 'Active 7-Day Hold',
    payment_status TEXT DEFAULT 'Paid',
    payment_method TEXT DEFAULT 'UPI / Card',
    waiver_code TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- 9. 30s Heartbeat SDK Attendance Engine Logs
CREATE TABLE IF NOT EXISTS attendance_heartbeats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    class_session_id TEXT NOT NULL,
    in_class_seconds INTEGER NOT NULL DEFAULT 0,
    attendance_score_pct INTEGER NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'Present',
    heartbeat_time DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 10. Madrasa Leave (Chutti) Applications & Approvals
CREATE TABLE IF NOT EXISTS leave_applications (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    course_title TEXT NOT NULL,
    assigned_teacher TEXT NOT NULL,
    approver_role TEXT NOT NULL,
    leave_type TEXT NOT NULL,
    from_date TEXT NOT NULL,
    to_date TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'Pending Ustad Review ⏳',
    ustad_remarks TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 11. Student Tajweed Tilawat Audio Submissions & Grading
CREATE TABLE IF NOT EXISTS recitations (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    course_title TEXT NOT NULL,
    surah_name TEXT NOT NULL,
    verses TEXT NOT NULL,
    audio_url TEXT,
    duration TEXT,
    student_notes TEXT,
    teacher_feedback TEXT,
    tajweed_score INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Pending Evaluation',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 12. Mahana Chanda & Waqf Ledger (Interest-free)
CREATE TABLE IF NOT EXISTS chanda_ledger (
    id TEXT PRIMARY KEY,
    institute_id TEXT NOT NULL,
    student_or_donor TEXT NOT NULL,
    fund_category TEXT NOT NULL,
    amount INTEGER NOT NULL,
    payment_mode TEXT NOT NULL,
    receipt_no TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (institute_id) REFERENCES institutes(id)
);

-- 13. Student Course Ratings & Authentic Maslak Feedback
CREATE TABLE IF NOT EXISTS course_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    maslak_accuracy TEXT NOT NULL,
    feedback TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 14. Shariah Board Fatwa Review Sign-offs
CREATE TABLE IF NOT EXISTS scholar_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id TEXT NOT NULL,
    scholar_name TEXT NOT NULL,
    authentic_matn INTEGER DEFAULT 1,
    no_music INTEGER DEFAULT 1,
    consensus_compliance INTEGER DEFAULT 1,
    female_pardah INTEGER DEFAULT 1,
    decision TEXT NOT NULL,
    fatwa_remarks TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_courses_dept ON courses(department_id);
CREATE INDEX IF NOT EXISTS idx_admissions_inst ON admissions(institute_id);
CREATE INDEX IF NOT EXISTS idx_leaves_student ON leave_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_leaves_teacher ON leave_applications(assigned_teacher);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance_heartbeats(student_id);
