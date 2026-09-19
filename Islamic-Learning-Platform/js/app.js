// Al-Noor Open Source Islamic Learning Platform — Master React 18 Application
// Fully Compliant with Islamic LMS BRD v2.0
const { useState, useEffect, useRef } = React;

function App() {
  // Global Language & Role Session State
  const [lang, setLang] = useState('ru'); // 'ru' (Roman Urdu), 'en', 'ur'
  const [activeNav, setActiveNav] = useState('home');
  const [selectedDept, setSelectedDept] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Available Demo Personas per BRD v2.0
  const personas = {
    student: {
      id: "usr-student-1",
      name: "Ahmad Raza",
      role: "student",
      email: "ahmad.raza@example.com",
      age: 19,
      gender: "Male",
      goal: "Tajweed & Arabic Mastery",
      under13Consent: false,
      attendancePercent: 88,
      avatarIcon: "fa-user-graduate",
      instituteAffiliation: "Jamia Darul Uloom (Talib-e-Ilm)"
    },
    teacher: {
      id: "usr-teacher-1",
      name: "Qari Abdul Basit Siddiqui",
      role: "teacher",
      email: "qari.basit@alnoor.edu",
      specialization: "Tajweed, Qirat & Hifz",
      qualification: "Fazil Darul Uloom & Sanad-e-Qirat Saba",
      verificationLevel: "Verified Teacher ✅",
      probationStatus: "Completed (3/3 Courses, 5/5 Classes Monitored - Rating 4.9)",
      academySlug: "academy/qari-abdul-basit",
      studentsCount: 142,
      avatarIcon: "fa-chalkboard-teacher",
      instituteAffiliation: "Independent & Visiting Jamia Faculty"
    },
    institute: {
      id: "usr-inst-1",
      name: "Jamia Darul Uloom Markaz",
      role: "institute",
      email: "admin@jamiadarululoom.edu",
      principal: "Maulana Ibrahim Qasmi (Nazim-e-Ala)",
      waqfRegId: "WQF-2026-9812",
      city: "Lucknow / Karachi",
      totalFaculty: 4,
      totalStudents: 280,
      departmentsCount: 5,
      monthlyChanda: "₹1,42,000",
      avatarIcon: "fa-mosque",
      subdomain: "darululoom.alnoor.edu"
    },
    admin: {
      id: "usr-scholar-1",
      name: "Mufti Tariq Masood",
      role: "admin",
      email: "mufti.tariq@reviewboard.org",
      designation: "Head of Shariah Curriculum Review Board",
      sanad: "Darul Uloom Karachi (Mufti & Academic Reviewer)",
      avatarIcon: "fa-user-shield",
      reviewsHandled: 48
    }
  };

  // Active User Session State
  const [currentUser, setCurrentUser] = useState(personas.student);

  // Authentication Modal State
  const [authModal, setAuthModal] = useState({
    isOpen: false,
    mode: 'login', // 'login' or 'signup'
    roleTab: 'student' // 'student', 'teacher', 'institute', 'admin'
  });

  // Auth Form Fields State
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    age: '18',
    gender: 'Male',
    goal: 'Quran Padhna / Nazra',
    guardianEmail: '',
    qualification: '',
    darulUloom: '',
    specialization: 'Quran & Tajweed',
    demoVideoUrl: '',
    instituteName: '',
    waqfRegNo: '',
    city: ''
  });

  // Institute Tab Selection State
  const [instituteTab, setInstituteTab] = useState('faculty'); // 'faculty', 'departments', 'roster', 'attendance'

  // Affiliated Faculty List for Institute (Madrasa Hierarchy - BRD Section 03 & 04)
  const [facultyList, setFacultyList] = useState([
    {
      id: "fac-1",
      name: "Maulana Qari Abdul Basit",
      designation: "Head Ustad-e-Tajweed & Qirat",
      sanad: "Al-Shahadat-ul-Aalamiyyah & Qirat-e-Saba",
      department: "Quran o Tajweed",
      studentsCount: 95,
      batches: ["Hifz Morning Batch A", "Tajweed Foundation"],
      status: "Active",
      gender: "Male"
    },
    {
      id: "fac-2",
      name: "Mufti Muhammad Salman",
      designation: "Shaykh-ul-Hadith & Senior Mufti",
      sanad: "Darul Uloom Deoband (Takhassus Fil Fiqh)",
      department: "Dars-e-Nizami (Aalim)",
      studentsCount: 78,
      batches: ["Hidayah / Fiqh Foundation", "Mishkat-ul-Masabih"],
      status: "Active",
      gender: "Male"
    },
    {
      id: "fac-3",
      name: "Aalima Maryam Siddiqa",
      designation: "Director Banat (Women's Wing)",
      sanad: "Wifaq-ul-Madaris Al-Arabia (Mumtaz)",
      department: "Women Section (Fiqh-e-Niswan)",
      studentsCount: 64,
      batches: ["Taharat & Fiqh-e-Niswan", "Seerah of Sahabiyat"],
      status: "Active",
      gender: "Female"
    },
    {
      id: "fac-4",
      name: "Hafiz Muhammad Bilal",
      designation: "Muallim-e-Hifz & Sabaq Reciter",
      sanad: "Hafiz & Qari (Sanad-e-Hifz)",
      department: "Hifz-ul-Quran",
      studentsCount: 43,
      batches: ["Hifz Evening Batch", "Nazra Revision"],
      status: "Active",
      gender: "Male"
    }
  ]);

  // Add Teacher Modal for Institute
  const [addTeacherModal, setAddTeacherModal] = useState(false);
  const [newTeacherForm, setNewTeacherForm] = useState({
    name: '',
    designation: 'Ustad-e-Tajweed',
    sanad: 'Dars-e-Nizami / Hafiz',
    department: 'Quran o Tajweed',
    gender: 'Male',
    batch: 'Morning Batch'
  });

  // Madrasa Student Roster & Mahana Chanda/Fee
  const [madrasaStudents, setMadrasaStudents] = useState([
    { rollNo: "TAL-101", name: "Muhammad Zaid", dept: "Hifz-ul-Quran", feeStatus: "Paid", amount: "₹1,500/mo", lastPaid: "10 Sep 2026", scholarship: false },
    { rollNo: "TAL-102", name: "Abdullah Tariq", dept: "Dars-e-Nizami", feeStatus: "Due", amount: "₹2,000/mo", lastPaid: "12 Aug 2026", scholarship: false },
    { rollNo: "TAL-103", name: "Fatima Noor", dept: "Women Section", feeStatus: "Paid", amount: "₹1,200/mo", lastPaid: "08 Sep 2026", scholarship: false },
    { rollNo: "TAL-104", name: "Ibrahim Khan", dept: "Kids Maktab", feeStatus: "Scholarship", amount: "₹0 (Sadaqah)", lastPaid: "100% Waqf Funded", scholarship: true },
    { rollNo: "TAL-105", name: "Ahmad Raza", dept: "Quran o Tajweed", feeStatus: "Paid", amount: "₹1,500/mo", lastPaid: "05 Sep 2026", scholarship: false }
  ]);

  // Madrasa Hifz Daily Logbook (BRD Section 11)
  const [hifzRecord, setHifzRecord] = useState({
    studentName: "Ahmad Raza",
    date: "Today, 19 Sep 2026",
    sabaq: "Para 4 (Al-Imran: 92-105) — 1 Page",
    sabaqGrade: "Mumtaz (A+)",
    sabqi: "Para 3 (Last 3 Rukoo)",
    sabqiGrade: "Jayyid Jiddan (A)",
    manzil: "Para 1 (Full Revision)",
    manzilGrade: "Pukhta (Solid)",
    teacherRemarks: "MashaAllah, Huroof aur harakaat ki adayigi bilkul pukhta hai. Daur behtareen chal raha hai.",
    teacherSeal: "Qari Abdul Basit Siddiqui (Muallim-e-Hifz)"
  });

  // Auto Attendance Engine State & Live Simulation (BRD Flow 6 & 7)
  const [attendanceEngine, setAttendanceEngine] = useState({
    classId: "live-tajweed-101",
    classTitle: "Interactive Tajweed Halaqah: Huroof-e-Musta'liyah",
    teacher: "Qari Abdul Basit Siddiqui",
    scheduledDurationMin: 40,
    attendanceThreshold: 75,
    classStatus: "Live", // "Scheduled", "Live", "Ended"
    heartbeatSeconds: 15,
    isHeartbeatRunning: true,
    sessions: [
      {
        id: "sess-1",
        studentName: "Ahmad Raza (You)",
        joinTime: "18:00",
        exitTime: "18:14",
        rejoinTime: "18:19",
        finalLeaveTime: "18:40",
        totalDurationMin: 35,
        attendancePercent: 87.5,
        status: "Present",
        flag: "network_unstable",
        overrideReason: ""
      },
      {
        id: "sess-2",
        studentName: "Muhammad Zaid",
        joinTime: "18:00",
        exitTime: "18:40",
        rejoinTime: "—",
        finalLeaveTime: "18:40",
        totalDurationMin: 40,
        attendancePercent: 100,
        status: "Present",
        flag: "None",
        overrideReason: ""
      },
      {
        id: "sess-3",
        studentName: "Bilal Khan",
        joinTime: "18:00",
        exitTime: "18:12",
        rejoinTime: "—",
        finalLeaveTime: "18:12",
        totalDurationMin: 12,
        attendancePercent: 30,
        status: "Absent",
        flag: "early_exit",
        overrideReason: ""
      },
      {
        id: "sess-4",
        studentName: "Zainab Ali",
        joinTime: "—",
        exitTime: "—",
        rejoinTime: "—",
        finalLeaveTime: "—",
        totalDurationMin: 0,
        attendancePercent: 0,
        status: "Absent",
        flag: "never_joined",
        overrideReason: ""
      }
    ]
  });

  // Course Creation Studio State (BRD Flow 3)
  const [courseStudio, setCourseStudio] = useState({
    isOpen: false,
    title: "",
    titleArabic: "",
    dept: "quran",
    courseType: "live", // "self_paced", "live", "hybrid", "one_to_one"
    feeModel: "free", // "free", "monthly", "one_time"
    price: "0",
    level: "Beginner",
    language: "Urdu",
    kitabHawala: "Al-Muqaddimah Al-Jazariyyah, Babul Makharij (Imam Ibn Al-Jazari)",
    modulesCount: "4",
    lessonsCount: "16",
    genderRestriction: "all" // "all", "female_only"
  });

  // Recurring Live Class Scheduler State (BRD Flow 5)
  const [schedulerModal, setSchedulerModal] = useState({
    isOpen: false,
    batch: "Tajweed Halaqah Batch A",
    title: "Daily Nazra & Makharij Correction",
    frequency: "Daily", // "Daily", "Mon-Fri", "Weekly"
    durationWeeks: 12,
    threshold: 75
  });

  // Homework & Assignments State (BRD Section 10 & Flow 8)
  const [homeworkList, setHomeworkList] = useState([
    {
      id: "hw-1",
      title: "Noon Sakin o Tanween: Izhar & Ikhfa Identification in Surah Al-Baqarah",
      course: "Tajweed Foundation",
      dueDate: "Tomorrow, 11:59 PM",
      maxMarks: 20,
      submissionsCount: 18,
      mySubmissionStatus: "Submitted",
      myGrade: "19/20 (Mumtaz)",
      feedback: "JazakAllahu Khaira. Makharij aur Gunnah ki alamat ki nishandehi behtareen ki hai."
    },
    {
      id: "hw-2",
      title: "Sarf Exercise: Complete Gardan of Baab Nasara-Yansuru with Ma'na",
      course: "Arabic Morphology (Sarf)",
      dueDate: "22 Sep 2026",
      maxMarks: 25,
      submissionsCount: 14,
      mySubmissionStatus: "Pending",
      myGrade: null,
      feedback: null
    }
  ]);

  // Teacher Earnings & Payout Wallet (BRD Section 13)
  const [teacherEarnings, setTeacherEarnings] = useState({
    totalRevenue: "₹48,500",
    platformFee: "₹4,850 (10%)",
    netEarnings: "₹43,650",
    inEscrow: "₹6,200 (7-Day Shariah Hold)",
    readyForPayout: "₹37,450",
    payoutAccount: "UPI: qari.basit@okhdfcbank"
  });

  // Learning Flow State
  const [courses, setCourses] = useState(window.COURSES_DATA || []);
  const [enrolledIds, setEnrolledIds] = useState(['quran-101', 'women-301', 'kids-501']);
  const [activeCourse, setActiveCourse] = useState(null);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [courseProgress, setCourseProgress] = useState({
    'quran-101': 75,
    'women-301': 40,
    'kids-501': 90
  });

  // Audio Reciter & Tajweed Submissions State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
  const [audioSubmissions, setAudioSubmissions] = useState([
    {
      id: "sub-1",
      studentName: "Muhammad Zaid",
      courseTitle: "Noorani Qaida & Harakat",
      lessonTitle: "Lesson 1: Mufradaat & Halq Letters",
      timestamp: "Today, 10:15 AM",
      status: "Graded",
      grade: "Mumtaz (A+)",
      feedbackTags: ["Makharij Perfect", "Clear Voice"],
      teacherNote: "MashaAllah, Halq ke tamam 6 huroof ka talaffuz bilkul sahi ada kiya hai."
    },
    {
      id: "sub-2",
      studentName: "Fatima Noor",
      courseTitle: "Tajweed Foundation",
      lessonTitle: "Ahkam-e-Noon Sakin & Izhar",
      timestamp: "Yesterday",
      status: "Pending Review",
      feedbackTags: ["Needs Review"],
      teacherNote: "Pending teacher listening and feedback."
    }
  ]);

  // Live Classes State
  const [liveClasses, setLiveClasses] = useState([
    {
      id: "live-1",
      title: "Interactive Tajweed Halaqah: Huroof-e-Musta'liyah",
      instructor: "Qari Abdul Basit Siddiqui",
      date: "Today, 08:30 PM PKT",
      enrolled: 48,
      status: "LIVE NOW",
      link: "#auto-attendance"
    },
    {
      id: "live-2",
      title: "Fiqh-e-Niswan Live Masael & Q&A Session",
      instructor: "Aalima Maryam Siddiqa",
      date: "Tomorrow, 05:00 PM PKT",
      enrolled: 72,
      status: "Upcoming",
      link: "https://meet.google.com/islamic-learn-demo"
    }
  ]);

  // Modals State
  const [certModal, setCertModal] = useState({ isOpen: false, course: null, studentName: "Ahmad Raza", grade: "Mumtaz (95%)" });
  const [libraryModal, setLibraryModal] = useState({ isOpen: false, book: null });

  // Quiz State for Active Lesson
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Translation Helper
  const t = window.TRANSLATIONS[lang] || window.TRANSLATIONS.en;

  // Recording Timer
  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => setRecordingSeconds(prev => prev + 1), 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  // Heartbeat Simulator for Auto Attendance Engine
  useEffect(() => {
    let interval;
    if (attendanceEngine.isHeartbeatRunning && attendanceEngine.classStatus === "Live") {
      interval = setInterval(() => {
        setAttendanceEngine(prev => ({
          ...prev,
          heartbeatSeconds: (prev.heartbeatSeconds + 1) % 30
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [attendanceEngine.isHeartbeatRunning, attendanceEngine.classStatus]);

  // Audio Recording Toggle
  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setRecordedAudioUrl(null);
    } else {
      setIsRecording(false);
      setRecordedAudioUrl("https://everyayah.com/data/Husary_128kbps/001001.mp3");
    }
  };

  const handleAudioSubmit = () => {
    if (!recordedAudioUrl) return;
    const newSub = {
      id: "sub-" + Date.now(),
      studentName: currentUser.name + " (You)",
      courseTitle: activeCourse ? activeCourse.title : "Tajweed Foundation",
      lessonTitle: activeCourse ? activeCourse.lessons[activeLessonIndex].title : "Surah Al-Fatiha Recitation",
      timestamp: "Just Now",
      status: "Pending Review",
      feedbackTags: ["Submitted for Review"],
      teacherNote: "Your audio has been submitted to the teacher grading queue."
    };
    setAudioSubmissions([newSub, ...audioSubmissions]);
    setRecordedAudioUrl(null);
    alert(lang === 'ur' ? "آپ کی تلاوت کامیابی سے استاد کو بھیج دی گئی ہے۔" : "Aapki tilawat kamyabi se review ke liye submit ho chuki hai!");
  };

  // Course Enrollment
  const handleEnroll = (courseId) => {
    if (!enrolledIds.includes(courseId)) {
      setEnrolledIds([...enrolledIds, courseId]);
      setCourseProgress({ ...courseProgress, [courseId]: 10 });
    }
    const found = courses.find(c => c.id === courseId);
    if (found) {
      setActiveCourse(found);
      setActiveLessonIndex(0);
      setQuizAnswers({});
      setQuizSubmitted(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Filtered Courses
  const filteredCourses = courses.filter(course => {
    const matchesDept = selectedDept === 'all' || course.dept === selectedDept;
    const matchesSearch = !searchQuery || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.titleArabic && course.titleArabic.includes(searchQuery));
    return matchesDept && matchesSearch;
  });

  // Complete Lesson
  const markLessonComplete = () => {
    if (!activeCourse) return;
    const currentProgress = courseProgress[activeCourse.id] || 0;
    const increment = Math.round(100 / (activeCourse.lessons.length || 1));
    const newProgress = Math.min(100, currentProgress + increment);
    setCourseProgress({ ...courseProgress, [activeCourse.id]: newProgress });
    if (activeLessonIndex < activeCourse.lessons.length - 1) {
      setActiveLessonIndex(activeLessonIndex + 1);
      setQuizAnswers({});
      setQuizSubmitted(false);
    }
  };

  // Submit Quiz
  const handleQuizSubmit = (quizQuestions) => {
    if (!quizQuestions || quizQuestions.length === 0) return;
    let correct = 0;
    quizQuestions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.answer) correct++;
    });
    const finalScore = Math.round((correct / quizQuestions.length) * 100);
    setQuizScore(finalScore);
    setQuizSubmitted(true);
  };

  // Handle Auth Form Submission
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (authModal.mode === 'login') {
      // Pick matching persona or create mock
      if (authModal.roleTab === 'student') setCurrentUser(personas.student);
      else if (authModal.roleTab === 'teacher') setCurrentUser(personas.teacher);
      else if (authModal.roleTab === 'institute') setCurrentUser(personas.institute);
      else setCurrentUser(personas.admin);
      alert(lang === 'ur' ? "کامیابی سے داخل ہو گئے۔ خوش آمدید!" : "Kamyabi se dakhil ho gaye. Khush Aamdeed!");
    } else {
      // Register new profile
      const newRole = authModal.roleTab;
      const newUser = {
        id: "usr-" + Date.now(),
        name: authForm.name || (newRole === 'institute' ? authForm.instituteName : "New User"),
        role: newRole,
        email: authForm.email,
        age: authForm.age,
        gender: authForm.gender,
        goal: authForm.goal,
        specialization: authForm.specialization,
        qualification: authForm.qualification,
        verificationLevel: newRole === 'teacher' ? "Basic Verified (ID Verified)" : undefined,
        probationStatus: newRole === 'teacher' ? "Probation: 0/3 Courses, 0/5 Classes" : undefined,
        avatarIcon: newRole === 'student' ? "fa-user-graduate" : newRole === 'teacher' ? "fa-chalkboard-teacher" : newRole === 'institute' ? "fa-mosque" : "fa-user-shield",
        instituteAffiliation: newRole === 'institute' ? authForm.instituteName : "Independent"
      };
      setCurrentUser(newUser);
      alert(lang === 'ur' ? "آپ کا نیا اکاؤنٹ کامیابی سے بن گیا ہے!" : "Aapka naya account kamyabi se ban gaya hai!");
    }
    setAuthModal({ ...authModal, isOpen: false });
  };

  // Switch persona handler
  const handleSwitchPersona = (roleKey) => {
    const p = personas[roleKey];
    setCurrentUser(p);
    if (roleKey === 'institute') {
      setActiveNav('institute');
    } else {
      setActiveNav('dashboard');
    }
  };

  // Handle Add Teacher to Institute
  const handleAddTeacherToInstitute = (e) => {
    e.preventDefault();
    if (!newTeacherForm.name) return;
    const newFaculty = {
      id: "fac-" + Date.now(),
      name: newTeacherForm.name,
      designation: newTeacherForm.designation,
      sanad: newTeacherForm.sanad,
      department: newTeacherForm.department,
      studentsCount: 0,
      batches: [newTeacherForm.batch],
      status: "Active",
      gender: newTeacherForm.gender
    };
    setFacultyList([newFaculty, ...facultyList]);
    setAddTeacherModal(false);
    setNewTeacherForm({
      name: '',
      designation: 'Ustad-e-Tajweed',
      sanad: 'Dars-e-Nizami / Hafiz',
      department: 'Quran o Tajweed',
      gender: 'Male',
      batch: 'Morning Batch'
    });
    alert(lang === 'ur' ? "مدرسہ میں نیا استاد کامیابی سے شامل کر دیا گیا ہے۔" : "Madrasa me naya ustaad kamyabi se shamil kar diya gaya hai!");
  };

  // Handle Create Course & Submit for Review (BRD Flow 3)
  const handleCreateCourseSubmit = (e) => {
    e.preventDefault();
    if (!courseStudio.title) return;
    const newCourseObj = {
      id: "course-" + Date.now(),
      title: courseStudio.title,
      titleArabic: courseStudio.titleArabic || "دورة تعليمية جديدة",
      dept: courseStudio.dept,
      instructor: currentUser.name,
      level: courseStudio.level,
      duration: "8 Weeks",
      studentsCount: 0,
      rating: 5.0,
      status: "Academic Review (48h)",
      feeModel: courseStudio.feeModel,
      price: courseStudio.price,
      kitabHawala: courseStudio.kitabHawala,
      courseType: courseStudio.courseType,
      description: `Structured course referencing classical sources: ${courseStudio.kitabHawala}. Prepared for authentic Islamic learning.`,
      lessons: [
        { id: 1, title: "Lesson 1: Introduction & Asal Sanad", duration: "25 min" },
        { id: 2, title: "Lesson 2: Core Rules & Text Analysis", duration: "35 min" },
        { id: 3, title: "Lesson 3: Practical Recitation / Application", duration: "40 min" }
      ]
    };
    setCourses([newCourseObj, ...courses]);
    setCourseStudio({ ...courseStudio, isOpen: false });
    alert(lang === 'ur' ? "کورس کامیابی سے علمی و شرعی جائزے کے لیے بھیج دیا گیا ہے۔" : "Course kamyabi se Academic aur Scholar Review ke liye submit ho chuka hai!");
  };

  return (
    <div className={lang === 'ur' ? 'urdu-mode' : ''} dir={lang === 'ur' ? 'rtl' : 'ltr'}>
      {/* 1. TOP NAVBAR */}
      <nav className="navbar">
        <div className="nav-brand" onClick={() => { setActiveCourse(null); setActiveNav('home'); }}>
          <div className="brand-icon">
            <i className="fas fa-quran"></i>
          </div>
          <div>
            <div className="brand-title">{t.brandName}</div>
            <div className="brand-subtitle">{t.brandSubtitle}</div>
          </div>
        </div>

        <ul className="nav-links">
          <li className={`nav-link ${activeNav === 'home' && !activeCourse ? 'active' : ''}`} onClick={() => { setActiveNav('home'); setActiveCourse(null); }}>
            <i className="fas fa-home"></i> {t.navHome}
          </li>
          <li className={`nav-link ${selectedDept === 'quran' ? 'active' : ''}`} onClick={() => { setActiveNav('home'); setSelectedDept('quran'); setActiveCourse(null); }}>
            <i className="fas fa-book-open"></i> {t.navQuran}
          </li>
          <li className={`nav-link ${selectedDept === 'kids' ? 'active' : ''}`} onClick={() => { setActiveNav('home'); setSelectedDept('kids'); setActiveCourse(null); }}>
            <i className="fas fa-child"></i> {t.navKids}
          </li>
          <li className={`nav-link ${selectedDept === 'women' ? 'active' : ''}`} onClick={() => { setActiveNav('home'); setSelectedDept('women'); setActiveCourse(null); }}>
            <i className="fas fa-female"></i> {t.navWomen}
          </li>
          <li className={`nav-link ${selectedDept === 'arabic' ? 'active' : ''}`} onClick={() => { setActiveNav('home'); setSelectedDept('arabic'); setActiveCourse(null); }}>
            <i className="fas fa-language"></i> {t.navArabic}
          </li>
          <li className={`nav-link ${activeNav === 'library' ? 'active' : ''}`} onClick={() => { setActiveNav('library'); setActiveCourse(null); }}>
            <i className="fas fa-book"></i> {t.navLibrary}
          </li>
          
          {/* Role-Sensitive Navigation Links */}
          <li className={`nav-link ${activeNav === 'dashboard' && currentUser.role === 'student' ? 'active' : ''}`} onClick={() => { setActiveNav('dashboard'); setActiveCourse(null); }}>
            <i className="fas fa-user-graduate"></i> {t.navDashboard}
          </li>
          {currentUser.role === 'institute' && (
            <li className={`nav-link ${activeNav === 'institute' ? 'active' : ''}`} onClick={() => { setActiveNav('institute'); setActiveCourse(null); }}>
              <i className="fas fa-mosque"></i> {t.navInstitute}
            </li>
          )}
          {currentUser.role === 'teacher' && (
            <li className={`nav-link ${activeNav === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveNav('dashboard'); setActiveCourse(null); }}>
              <i className="fas fa-chalkboard-teacher"></i> {t.teacherPortal}
            </li>
          )}
          {currentUser.role === 'admin' && (
            <li className={`nav-link ${activeNav === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveNav('dashboard'); setActiveCourse(null); }}>
              <i className="fas fa-user-shield"></i> {t.adminPortal}
            </li>
          )}
        </ul>

        <div className="nav-actions">
          {/* Active User Chip & Auth Modal Trigger */}
          <div 
            onClick={() => setAuthModal({ isOpen: true, mode: 'login', roleTab: currentUser.role })}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              padding: '6px 12px', 
              background: 'rgba(255,255,255,0.06)', 
              borderRadius: '99px', 
              cursor: 'pointer',
              border: '1px solid var(--border-light)'
            }}
            title="Click to Log in / Register with different credentials"
          >
            <i className={`fas ${currentUser.avatarIcon}`} style={{ color: 'var(--color-primary-light)' }}></i>
            <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>{currentUser.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-accent-gold)' }}>
                {currentUser.role === 'student' ? 'Talib-e-Ilm' : currentUser.role === 'teacher' ? 'Ustaad' : currentUser.role === 'institute' ? 'Madrasa Admin' : 'Scholar Reviewer'}
              </div>
            </div>
            <i className="fas fa-chevron-down" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}></i>
          </div>

          {/* Language Switcher */}
          <div className="lang-switcher">
            <button className={`lang-btn ${lang === 'ru' ? 'active' : ''}`} onClick={() => setLang('ru')}>Roman</button>
            <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>EN</button>
            <button className={`lang-btn ${lang === 'ur' ? 'active' : ''}`} onClick={() => setLang('ur')}>اردو</button>
          </div>
        </div>
      </nav>

      {/* 2. BRD v2.0 QUICK ROLE & PERSONA SWITCHER BAR */}
      <div className="persona-switcher-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
            <i className="fas fa-id-badge"></i> {t.demoBadge}
          </span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
            {t.quickPersona}:
          </span>
        </div>

        <div className="persona-btn-group">
          <button 
            className={`persona-pill ${currentUser.role === 'student' ? 'active' : ''}`}
            onClick={() => handleSwitchPersona('student')}
          >
            <i className="fas fa-user-graduate"></i> {t.roleStudent} (Ahmad Raza)
          </button>
          <button 
            className={`persona-pill ${currentUser.role === 'teacher' ? 'active' : ''}`}
            onClick={() => handleSwitchPersona('teacher')}
          >
            <i className="fas fa-chalkboard-teacher"></i> {t.roleIndividualTeacher} (Qari Abdul Basit)
          </button>
          <button 
            className={`persona-pill institute ${currentUser.role === 'institute' ? 'active' : ''}`}
            onClick={() => handleSwitchPersona('institute')}
          >
            <i className="fas fa-mosque"></i> {t.roleInstitute} (Jamia Darul Uloom)
          </button>
          <button 
            className={`persona-pill scholar ${currentUser.role === 'admin' ? 'active' : ''}`}
            onClick={() => handleSwitchPersona('admin')}
          >
            <i className="fas fa-user-shield"></i> {t.roleScholar} (Mufti Tariq)
          </button>
        </div>

        <button 
          className="btn btn-outline btn-sm"
          style={{ padding: '4px 10px', fontSize: '0.76rem' }}
          onClick={() => setAuthModal({ isOpen: true, mode: 'signup', roleTab: currentUser.role })}
        >
          <i className="fas fa-user-plus"></i> {t.signup} / {t.login}
        </button>
      </div>

      {/* 3. HERO SECTION (HOME VIEW) */}
      {activeNav === 'home' && !activeCourse && (
        <section className="hero-section">
          <div className="hero-badge">
            <i className="fas fa-star-and-crescent"></i> {t.heroBadge}
          </div>
          <h1 className="hero-title">
            {t.heroTitlePrefix} <br />
            <span className="highlight">{t.heroTitleHighlight}</span>
          </h1>
          <p className="hero-subtitle">
            {t.heroSubtitle}
          </p>

          <div className="hero-cta-group">
            <button className="btn btn-primary btn-lg" onClick={() => {
              const el = document.getElementById('curriculum-grid');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}>
              <i className="fas fa-compass"></i> {t.heroExploreBtn}
            </button>
            <button className="btn btn-gold btn-lg" onClick={() => {
              if (currentUser.role === 'institute') setActiveNav('institute');
              else setActiveNav('dashboard');
            }}>
              <i className="fas fa-th-large"></i> {t.heroDashboardBtn}
            </button>
          </div>

          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-number">14,800+</div>
              <div className="stat-label">{t.statsLearners}</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">48+</div>
              <div className="stat-label">{t.statsCourses}</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">32</div>
              <div className="stat-label">{t.statsScholars}</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">120+</div>
              <div className="stat-label">{t.statsMadaris}</div>
            </div>
          </div>
        </section>
      )}

      {/* 4. MAIN CONTENT CONTAINER */}
      <main className="main-content">
        
        {/* =========================================================================
            VIEW: INSTITUTE / MADARIS PORTAL (BRD Section 03, 04, 20 & Marketplace)
            Multi-Teacher Management, Departments, Talaba Roster, and Chanda
           ========================================================================= */}
        {activeNav === 'institute' && currentUser.role === 'institute' && !activeCourse && (
          <div>
            {/* Institute Header Banner */}
            <div className="glass-card" style={{ padding: '28px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
                  <div style={{ 
                    width: '70px', height: '70px', borderRadius: '16px', 
                    background: 'linear-gradient(135deg, #0284c7, #0369a1)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    fontSize: '2rem', color: '#ffffff', border: '2px solid #38bdf8' 
                  }}>
                    <i className="fas fa-mosque"></i>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>{currentUser.name}</h2>
                      <span className="badge badge-teal"><i className="fas fa-check-double"></i> Registered Waqf</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.9rem' }}>
                      <i className="fas fa-map-marker-alt"></i> {currentUser.city} • Nazim-e-Ala: <strong>{currentUser.principal}</strong> • Reg ID: <code>{currentUser.waqfRegId}</code>
                    </p>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-accent-gold)', marginTop: '2px' }}>
                      Sub-domain: <code>https://{currentUser.subdomain}</code> (Branded Marketplace Space)
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-primary" onClick={() => setAddTeacherModal(true)}>
                    <i className="fas fa-user-plus"></i> {t.addTeacherBtn}
                  </button>
                  <button className="btn btn-outline" onClick={() => alert("Madrasa Branded Subdomain Settings: Updated!")}>
                    <i className="fas fa-cog"></i> Settings
                  </button>
                </div>
              </div>

              {/* Madrasa Metric Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginTop: '24px' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>AFFILIATED TEACHERS</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary-light)' }}>{facultyList.length}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-emerald-light)' }}>100% Sanad Verified</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>ENROLLED TALABA</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-accent-gold)' }}>{currentUser.totalStudents}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Across 5 Departments</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>MAHANA CHANDA / FEES</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8' }}>{currentUser.monthlyChanda}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-emerald-light)' }}>15% Sadaqah Quota</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>AVG ATTENDANCE RATE</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-emerald-light)' }}>91.4%</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Auto SDK Calculated</div>
                </div>
              </div>
            </div>

            {/* Institute Tabs Bar */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-light)', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
              <button 
                className={`btn ${instituteTab === 'faculty' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setInstituteTab('faculty')}
              >
                <i className="fas fa-users-cog"></i> {t.affiliatedTeachers} ({facultyList.length})
              </button>
              <button 
                className={`btn ${instituteTab === 'departments' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setInstituteTab('departments')}
              >
                <i className="fas fa-layer-group"></i> {t.departments} (5)
              </button>
              <button 
                className={`btn ${instituteTab === 'roster' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setInstituteTab('roster')}
              >
                <i className="fas fa-user-graduate"></i> {t.studentRoster} & {t.feesManagement}
              </button>
              <button 
                className={`btn ${instituteTab === 'attendance' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setInstituteTab('attendance')}
              >
                <i className="fas fa-clipboard-check"></i> Madrasa Attendance Matrix
              </button>
            </div>

            {/* TAB 1: AFFILIATED TEACHERS / MULTI-TEACHER ROSTER */}
            {instituteTab === 'faculty' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                    <i className="fas fa-chalkboard-teacher" style={{ color: 'var(--color-primary-light)' }}></i> Madrasa ke Asateza o Muallimeen (Faculty)
                  </h3>
                  <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    Madrasa ke tehet multiple teachers ko assign karein aur unki classes monitor karein.
                  </span>
                </div>

                <div className="institute-faculty-grid">
                  {facultyList.map(teacher => (
                    <div key={teacher.id} className="faculty-card">
                      <div className="faculty-header">
                        <div className="faculty-avatar">
                          <i className="fas fa-user-tie"></i>
                        </div>
                        <div>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{teacher.name}</h4>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-accent-gold)', fontWeight: 600 }}>
                            {teacher.designation}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{teacher.gender} • {teacher.department}</div>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '12px', background: 'rgba(0,0,0,0.2)', padding: '8px 10px', borderRadius: '8px' }}>
                        <div><strong>Sanad:</strong> {teacher.sanad}</div>
                        <div style={{ marginTop: '4px' }}><strong>Batches:</strong> {teacher.batches.join(', ')}</div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                        <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
                          <i className="fas fa-user-check"></i> {teacher.studentsCount} Talaba
                        </span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="btn btn-outline btn-sm" onClick={() => alert(`${teacher.name} ki timetable & batch setting khul gayi!`)}>
                            <i className="fas fa-edit"></i> Edit
                          </button>
                          <button className="btn btn-primary btn-sm" onClick={() => {
                            setCurrentUser(personas.teacher);
                            setActiveNav('dashboard');
                          }}>
                            <i className="fas fa-sign-in-alt"></i> Login As
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: MADRASA DEPARTMENTS & BATCHES */}
            {instituteTab === 'departments' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                <div className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-primary-light)' }}>
                      <i className="fas fa-quran"></i> Shoba-e-Hifz-ul-Quran
                    </h4>
                    <span className="badge badge-teal">Daily Classes</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '8px 0 12px' }}>
                    Rozana Sabaq, Sabqi, aur Manzil ka dars. Daur ki takmeel par Hifz sanad.
                  </p>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <div><strong>Head Ustad:</strong> Hafiz Muhammad Bilal</div>
                    <div><strong>Active Batches:</strong> Morning (6:00 AM), Evening (4:30 PM)</div>
                    <div><strong>Total Hifz Talaba:</strong> 43 Students</div>
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-accent-gold)' }}>
                      <i className="fas fa-graduation-cap"></i> Dars-e-Nizami (Aalimiyyah)
                    </h4>
                    <span className="badge badge-gold">8 Year Track</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '8px 0 12px' }}>
                    Sarf, Nahw, Fiqh (Hidayah, Quduri), Usool, Hadith (Mishkat, Sihah Sitta).
                  </p>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <div><strong>Head Ustad:</strong> Mufti Muhammad Salman</div>
                    <div><strong>Active Batches:</strong> Sania, Salisa, Dora-e-Hadith</div>
                    <div><strong>Total Talaba:</strong> 78 Students</div>
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f43f5e' }}>
                      <i className="fas fa-female"></i> Shoba-e-Banat (Girls Wing)
                    </h4>
                    <span className="badge badge-ruby">Strictly Female Asateza</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '8px 0 12px' }}>
                    Aalima Course, Fiqh-e-Niswan, Taharat, aur Seerah of Sahabiyat.
                  </p>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <div><strong>Head Aalima:</strong> Aalima Maryam Siddiqa</div>
                    <div><strong>Active Batches:</strong> Banat Foundation & Niswan Halaqah</div>
                    <div><strong>Total Talibaat:</strong> 64 Students</div>
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#38bdf8' }}>
                      <i className="fas fa-child"></i> Kids Maktab Shoba
                    </h4>
                    <span className="badge badge-teal">Age 5-12</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '8px 0 12px' }}>
                    Noorani Qaida, Kalimas, Namaz, Masnoon Duas, aur Akhlaq.
                  </p>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <div><strong>Head Muallim:</strong> Maulana Qari Abdul Basit</div>
                    <div><strong>Active Batches:</strong> Afternoon Maktab</div>
                    <div><strong>Total Kids:</strong> 95 Students</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: TALABA ROSTER & MAHANA CHANDA/FEE MANAGEMENT */}
            {instituteTab === 'roster' && (
              <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                    <i className="fas fa-coins"></i> Talaba Directory & Mahana Chanda (Fee Register)
                  </h3>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-gold btn-sm" onClick={() => alert("Monthly Fee Reminder SMS/WhatsApp Sent to Pending Students!")}>
                      <i className="fas fa-paper-plane"></i> Send Fee Reminder
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => alert("Exporting Talaba Roster & Fee Ledger to Excel/PDF...")}>
                      <i className="fas fa-file-export"></i> Export PDF/Excel
                    </button>
                  </div>
                </div>

                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Roll No</th>
                      <th>Talib-e-Ilm (Name)</th>
                      <th>Shoba (Dept)</th>
                      <th>Mahana Fees</th>
                      <th>Status</th>
                      <th>Aakhri Adaigi</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {madrasaStudents.map(st => (
                      <tr key={st.rollNo}>
                        <td><code>{st.rollNo}</code></td>
                        <td><strong>{st.name}</strong></td>
                        <td>{st.dept}</td>
                        <td>{st.amount}</td>
                        <td>
                          <span className={`badge ${st.feeStatus === 'Paid' ? 'badge-emerald' : st.feeStatus === 'Due' ? 'badge-ruby' : 'badge-gold'}`}>
                            {st.feeStatus}
                          </span>
                        </td>
                        <td>{st.lastPaid}</td>
                        <td>
                          <button 
                            className="btn btn-outline btn-sm" 
                            style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                            onClick={() => alert(`Receipt generated for ${st.name} (${st.rollNo}) - Status: ${st.feeStatus}`)}
                          >
                            <i className="fas fa-receipt"></i> Raseed
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 4: MADRASA ATTENDANCE MATRIX */}
            {instituteTab === 'attendance' && (
              <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                    <i className="fas fa-clipboard-list"></i> Madrasa-Wide Auto Attendance Matrix
                  </h3>
                  <button className="btn btn-primary btn-sm" onClick={() => alert("Downloading Monthly Madrasa Attendance Report...")}>
                    <i className="fas fa-download"></i> Download Monthly Report (PDF)
                  </button>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Video SDK Heartbeats ke mutabiq har class ki hazri auto-calculate hoti hai. 75%+ par Present mark hota hai.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                  <div style={{ background: 'rgba(0,0,0,0.25)', padding: '14px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>TODAY'S CLASSES</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>8 Conducted</div>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.25)', padding: '14px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>STUDENTS PRESENT</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-emerald-light)' }}>256 (91.4%)</div>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.25)', padding: '14px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>PARTIAL SESSIONS</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-accent-gold)' }}>14 (Net Glitch)</div>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.25)', padding: '14px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>UNEXCUSED ABSENT</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-ruby)' }}>10 Students</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            VIEW: INDIVIDUAL TEACHER / MINI ACADEMY PORTAL (BRD Section 05, 09, 10, 11)
            Course Builder, Recurring Live Classes, Auto Attendance Engine, Audio Grading
           ========================================================================= */}
        {activeNav === 'dashboard' && currentUser.role === 'teacher' && !activeCourse && (
          <div>
            {/* Mini Academy Header */}
            <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                      <i className="fas fa-chalkboard-teacher" style={{ color: 'var(--color-primary-light)' }}></i> {currentUser.name}
                    </h2>
                    <span className="badge badge-emerald">{currentUser.verificationLevel}</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {currentUser.specialization} • Sanad: <strong>{currentUser.qualification}</strong>
                  </p>
                  <div style={{ fontSize: '0.84rem', color: 'var(--color-accent-gold)', marginTop: '4px' }}>
                    <i className="fas fa-globe"></i> Public Mini Academy: <code>/{currentUser.academySlug}</code>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-gold" onClick={() => setCourseStudio({ ...courseStudio, isOpen: true })}>
                    <i className="fas fa-plus-circle"></i> {t.courseBuilder}
                  </button>
                  <button className="btn btn-primary" onClick={() => setSchedulerModal({ ...schedulerModal, isOpen: true })}>
                    <i className="fas fa-calendar-plus"></i> Schedule Recurring Live Class
                  </button>
                </div>
              </div>

              {/* Probation & Reputation Box (BRD Section 05) */}
              <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid var(--border-gold)', borderRadius: '10px', padding: '12px 16px', marginTop: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>Probation Status</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginLeft: '8px' }}>
                      {currentUser.probationStatus}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--color-emerald-light)' }}>
                    <i className="fas fa-shield-alt"></i> Payout & Paid Courses Unlocked
                  </span>
                </div>
              </div>
            </div>

            {/* LIVE AUTO ATTENDANCE ENGINE SIMULATOR (BRD Section 09 & Flow 6/7) */}
            <div className="attendance-sim-box" id="auto-attendance">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="heartbeat-dot"></span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                      {t.autoAttendance}: Real-Time SDK Heartbeat & Attendance Monitor
                    </h3>
                    <span className="badge badge-ruby" style={{ fontSize: '0.72rem' }}>LIVE SIMULATION</span>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Class: <strong>{attendanceEngine.classTitle}</strong> (40 Min) • Required Threshold: <strong>{attendanceEngine.attendanceThreshold}%</strong>
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      alert("Simulating Student Ahmad Raza Net Drop & Reconnect event (Webhook: participantLeft -> timeout -> rejoin).");
                    }}
                  >
                    <i className="fas fa-wifi"></i> Simulate Net Glitch
                  </button>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      alert("Class Ended. Total duration calculated. Present/Partial/Absent status finalized per BRD Flow 6!");
                    }}
                  >
                    <i className="fas fa-stop-circle"></i> End Class & Finalize
                  </button>
                </div>
              </div>

              {/* Heartbeat Status Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '14px 0 10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <div>SDK Join/Leave Stream • Heartbeat: <strong>Ping every 30s</strong> (Next ping in: {30 - attendanceEngine.heartbeatSeconds}s)</div>
                <div>Threshold: <strong>75% (30 min / 40 min)</strong></div>
              </div>

              {/* Live Attendance Table with Auto Status & Override (Flow 6) */}
              <table className="custom-table" style={{ background: 'rgba(0,0,0,0.3)' }}>
                <thead>
                  <tr>
                    <th>Talib-e-Ilm (Student)</th>
                    <th>Join Time</th>
                    <th>Exit / Rejoin Timeline</th>
                    <th>Total Active</th>
                    <th>Hazri %</th>
                    <th>Auto Status</th>
                    <th>Flags</th>
                    <th>Manual Override</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceEngine.sessions.map(sess => (
                    <tr key={sess.id}>
                      <td><strong>{sess.studentName}</strong></td>
                      <td>{sess.joinTime}</td>
                      <td>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {sess.exitTime} {sess.rejoinTime !== '—' ? `-> Rejoin: ${sess.rejoinTime}` : ''}
                        </span>
                      </td>
                      <td>{sess.totalDurationMin} min</td>
                      <td>
                        <strong>{sess.attendancePercent}%</strong>
                        <div style={{ width: '60px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '3px' }}>
                          <div style={{ width: `${sess.attendancePercent}%`, height: '100%', background: sess.attendancePercent >= 75 ? '#10b981' : sess.attendancePercent >= 30 ? '#f59e0b' : '#f43f5e' }}></div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${sess.status === 'Present' ? 'badge-emerald' : sess.status === 'Partial' ? 'badge-gold' : 'badge-ruby'}`}>
                          {sess.status}
                        </span>
                      </td>
                      <td>
                        {sess.flag === 'network_unstable' ? (
                          <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                            <i className="fas fa-exclamation-triangle"></i> Net Unstable
                          </span>
                        ) : sess.flag === 'early_exit' ? (
                          <span className="badge badge-ruby" style={{ fontSize: '0.7rem' }}>Early Exit</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td>
                        <button 
                          className="btn btn-outline btn-sm"
                          style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                          onClick={() => {
                            const reason = prompt("Enter manual override reason (Mandatory for audit log):", "Student informed prior due to electricity outage.");
                            if (reason) {
                              alert(`Audit Log Recorded: Status manually adjusted with reason: "${reason}"`);
                            }
                          }}
                        >
                          <i className="fas fa-edit"></i> Override
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Teacher Earnings & Payout Wallet (BRD Section 13) */}
            <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                  <i className="fas fa-wallet" style={{ color: 'var(--color-accent-gold)' }}></i> Teacher Payout Wallet & Revenue Split
                </h3>
                <span className="badge badge-teal">Shariah Compliant (Interest-Free)</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '16px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>TOTAL COURSE REVENUE</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{teacherEarnings.totalRevenue}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Platform Cut: {teacherEarnings.platformFee}</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '16px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>7-DAY ESCROW HOLD</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-accent-gold)' }}>{teacherEarnings.inEscrow}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Student guarantee period</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '16px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>AVAILABLE FOR PAYOUT</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-emerald-light)' }}>{teacherEarnings.readyForPayout}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Direct to Bank / UPI</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '16px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>PAYOUT ACCOUNT</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '6px' }}>{teacherEarnings.payoutAccount}</div>
                  <button className="btn btn-outline btn-sm" style={{ marginTop: '8px' }} onClick={() => alert("Payout request sent to platform accountant!")}>
                    Request Payout
                  </button>
                </div>
              </div>
            </div>

            {/* Recitation Grading Queue (BRD Section 11) */}
            <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>
                <i className="fas fa-microphone-alt"></i> Pending Tajweed Recitations to Evaluate
              </h3>
              {audioSubmissions.map(sub => (
                <div key={sub.id} style={{ padding: '16px', background: 'rgba(0,0,0,0.25)', borderRadius: '12px', marginBottom: '14px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary-light)' }}>
                        <i className="fas fa-user-graduate"></i> {sub.studentName}
                      </div>
                      <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                        {sub.courseTitle} • {sub.lessonTitle}
                      </div>
                    </div>
                    <span className={`badge ${sub.status === 'Graded' ? 'badge-emerald' : 'badge-gold'}`}>
                      {sub.status}
                    </span>
                  </div>

                  <div style={{ margin: '14px 0', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <audio controls src="https://everyayah.com/data/Husary_128kbps/001001.mp3" style={{ height: '36px', flex: 1 }}></audio>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Targeted Tajweed Mistake Tags (BRD Section 11):</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span className="feedback-tag selected">{t.tagMakharij}</span>
                      <span className="feedback-tag selected">{t.tagGhunnah}</span>
                      <span className="feedback-tag">{t.tagMadd}</span>
                      <span className="feedback-tag">{t.tagQalqalah}</span>
                      <span className="feedback-tag">{t.tagWaqf}</span>
                      <span className="feedback-tag">{t.tagIkhfa}</span>
                      <span className="feedback-tag">{t.tagIdgham}</span>
                    </div>
                  </div>

                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      const note = prompt("Enter targeted feedback for student:", "MashaAllah, good recitation. Maintain proper Ghunnah duration.");
                      if (note) {
                        setAudioSubmissions(audioSubmissions.map(s => s.id === sub.id ? { ...s, status: "Graded", grade: "Mumtaz (A)", teacherNote: note, feedbackTags: ["Makharij Checked", "Ghunnah Improved"] } : s));
                        alert("Evaluation submitted to student!");
                      }
                    }}
                  >
                    <i className="fas fa-check-circle"></i> Grade Recitation & Submit Voice/Text Feedback
                  </button>
                </div>
              ))}
            </div>

            {/* Assignments & Homework Manager (BRD Section 10) */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                  <i className="fas fa-tasks"></i> Homework & Assignments Management (BRD Section 10)
                </h3>
                <button className="btn btn-gold btn-sm" onClick={() => {
                  const title = prompt("Enter Homework Title:", "Tajweed Written Test: Ahkam of Meem Sakin");
                  if (title) {
                    setHomeworkList([...homeworkList, {
                      id: "hw-" + Date.now(),
                      title,
                      course: "Tajweed Foundation",
                      dueDate: "Next Week",
                      maxMarks: 20,
                      submissionsCount: 0,
                      mySubmissionStatus: "Assigned",
                      myGrade: null,
                      feedback: null
                    }]);
                    alert("New Assignment published to enrolled students!");
                  }
                }}>
                  <i className="fas fa-plus"></i> Create New Homework
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
                {homeworkList.map(hw => (
                  <div key={hw.id} style={{ background: 'rgba(0,0,0,0.25)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{hw.title}</h4>
                      <span className="badge badge-teal">Due: {hw.dueDate}</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '6px 0 10px' }}>
                      Course: {hw.course} • Max Marks: {hw.maxMarks}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-accent-gold)' }}>
                        {hw.submissionsCount} Submissions Received
                      </span>
                      <button className="btn btn-outline btn-sm" onClick={() => alert(`Reviewing submissions for "${hw.title}"`)}>
                        Review & Grade
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW: STUDENT DASHBOARD (BRD Section 08: 8 Core Widgets + Hifz Logbook)
           ========================================================================= */}
        {activeNav === 'dashboard' && currentUser.role === 'student' && !activeCourse && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                  <i className="fas fa-user-graduate" style={{ color: 'var(--color-primary-light)' }}></i> {t.studentDashboard}
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Assalamu Alaikum, {currentUser.name}! Learning Track: <strong>{currentUser.goal}</strong> ({currentUser.instituteAffiliation})
                </p>
              </div>
              <button 
                className="btn btn-gold"
                onClick={() => setCertModal({ isOpen: true, course: courses[0], studentName: currentUser.name, grade: "Mumtaz (A+)" })}
              >
                <i className="fas fa-award"></i> {t.certificates}
              </button>
            </div>

            {/* 8 BRD SECTION 08 WIDGETS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase' }}>1. Continue Learning</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary-light)', marginTop: '6px' }}>{enrolledIds.length} Courses</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-emerald-light)' }}><i className="fas fa-check-circle"></i> On Track</div>
              </div>
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase' }}>2. Aaj Ki Live Classes</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f43f5e', marginTop: '10px' }}>Tajweed Halaqah</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-emerald-light)' }}>LIVE NOW (Auto Attendance)</div>
              </div>
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase' }}>3. Pending Work</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-accent-gold)', marginTop: '6px' }}>1 Homework</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Due Tomorrow</div>
              </div>
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase' }}>4. Meri Attendance</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-emerald-light)', marginTop: '6px' }}>88%</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-emerald-light)' }}>Eligible for Sanad (Req 75%)</div>
              </div>
            </div>

            {/* WIDGET 5: MADRASA HIFZ LOGBOOK (BRD Section 11 - Sabaq, Sabqi, Manzil) */}
            <div className="glass-card" style={{ padding: '24px', marginBottom: '28px', border: '1px solid var(--border-gold)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                    <i className="fas fa-book-reader" style={{ color: 'var(--color-accent-gold)' }}></i> {t.hifzTracker} (Madrasa Daily Log)
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Madrasa terminology: <strong>Sabaq</strong> (Naya Sabaq), <strong>Sabqi</strong> (Pichla Sabaq), <strong>Manzil</strong> (Daur-e-Qadeem)
                  </div>
                </div>
                <div className="hifz-stamp">
                  {hifzRecord.teacherSeal}
                </div>
              </div>

              <div className="hifz-register">
                <div className="hifz-entry-box">
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.sabaq}</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, margin: '6px 0' }}>{hifzRecord.sabaq}</div>
                  <span className="badge badge-emerald">{hifzRecord.sabaqGrade}</span>
                </div>
                <div className="hifz-entry-box">
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.sabqi}</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, margin: '6px 0' }}>{hifzRecord.sabqi}</div>
                  <span className="badge badge-teal">{hifzRecord.sabqiGrade}</span>
                </div>
                <div className="hifz-entry-box">
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.manzil}</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, margin: '6px 0' }}>{hifzRecord.manzil}</div>
                  <span className="badge badge-gold">{hifzRecord.manzilGrade}</span>
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: '10px', marginTop: '14px', fontSize: '0.85rem' }}>
                <strong>Ustaad's Note:</strong> {hifzRecord.teacherRemarks}
              </div>
            </div>

            {/* WIDGET 6: LIVE CLASSES & JOIN ENGINE */}
            <div className="glass-card" style={{ padding: '24px', marginBottom: '28px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>
                <i className="fas fa-video"></i> Aaj ki Live Classes & Halaqah
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                {liveClasses.map(live => (
                  <div key={live.id} style={{ padding: '16px', background: 'rgba(0,0,0,0.25)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                    <span className="badge badge-ruby" style={{ marginBottom: '8px' }}>
                      <i className="fas fa-circle" style={{ fontSize: '0.6rem' }}></i> {live.status}
                    </span>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '6px 0' }}>{live.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                      Instructor: {live.instructor} | Date: {live.date}
                    </p>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        alert("Joined Live Class! Auto Attendance Engine heartbeat started (JoinTime recorded, 30s ping active). Status will calculate automatically.");
                      }}
                    >
                      <i className="fas fa-video"></i> {t.joinClass}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* WIDGET 7: CONTINUE LEARNING COURSES */}
            <div className="glass-card" style={{ padding: '24px', marginBottom: '28px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>
                <i className="fas fa-book-open"></i> Zer-e-Taleem Courses (Continue Learning)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                {courses.filter(c => enrolledIds.includes(c.id)).map(c => (
                  <div key={c.id} style={{ padding: '16px', background: 'rgba(0,0,0,0.25)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{c.title}</h4>
                      <span className="badge badge-teal">{courseProgress[c.id] || 0}%</span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '8px 0 12px' }}>
                      Instructor: {c.instructor}
                    </p>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
                      <div style={{ width: `${courseProgress[c.id] || 0}%`, height: '100%', background: 'linear-gradient(90deg, var(--color-primary-light), var(--color-accent-gold))' }}></div>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => handleEnroll(c.id)}>
                      <i className="fas fa-play"></i> {t.continueLearning}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* WIDGET 8: FEES, RECEIPTS & CERTIFICATES */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              <div className="glass-card" style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>
                  <i className="fas fa-receipt"></i> Mahana Fees & Raseed (Receipts)
                </h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                  Monthly Fee Status: <span className="badge badge-emerald">PAID (Sep 2026)</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Amount: ₹1,500/month • Gateway: Shariah compliant interest-free transfer.
                </p>
                <button className="btn btn-outline btn-sm" style={{ marginTop: '10px' }} onClick={() => alert("Official PDF Fee Receipt Downloaded: REC-2026-SEP-091")}>
                  <i className="fas fa-file-pdf"></i> Download Official Receipt
                </button>
              </div>

              <div className="glass-card" style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>
                  <i className="fas fa-shield-alt"></i> Child Safety & Guardian Link
                </h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                  Age: <strong>19 Years</strong> (Adult Student)
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Under 13 accounts require mandatory guardian OTP consent. Women's section classes are strictly instructed by verified female scholars.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW: SCHOLAR REVIEWER & ADMIN PIPELINE (BRD Section 07, 18)
           ========================================================================= */}
        {activeNav === 'dashboard' && currentUser.role === 'admin' && !activeCourse && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                  <i className="fas fa-user-shield" style={{ color: 'var(--color-accent-gold)' }}></i> {t.adminPortal}
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Active Reviewer: <strong>{currentUser.name}</strong> • {currentUser.designation}
                </p>
              </div>
            </div>

            {/* Moderation Pipeline Table (BRD Flow 3) */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>
                <i className="fas fa-clipboard-check"></i> Course Moderation & Hawala Verification Queue
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                BRD Requirement: Religious content (Aqeedah, Fiqh, Hadith, Tafseer) cannot be published without Scholar Review (5-7 days) and authentic kitab hawala.
              </p>

              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Course Title</th>
                    <th>Shoba</th>
                    <th>Teacher</th>
                    <th>Kitab Hawala / Reference</th>
                    <th>Current Status</th>
                    <th>Review Decision</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map(course => (
                    <tr key={course.id}>
                      <td><strong>{course.title}</strong></td>
                      <td><span className="badge badge-teal">{course.dept}</span></td>
                      <td>{course.instructor}</td>
                      <td><code style={{ fontSize: '0.75rem' }}>{course.kitabHawala || "Classical Dars-e-Nizami Corpus"}</code></td>
                      <td>
                        <span className={`badge ${course.status === 'Published' ? 'badge-emerald' : 'badge-gold'}`}>
                          {course.status || "Published"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            className="btn btn-primary btn-sm"
                            style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                            onClick={() => {
                              alert(`Course "${course.title}" has been Scholar Approved & Published to Catalog!`);
                            }}
                          >
                            Approve
                          </button>
                          <button 
                            className="btn btn-outline btn-sm"
                            style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                            onClick={() => {
                              const note = prompt("Enter required revisions/comments for teacher:", "Hawala page number and edition must be mentioned clearly.");
                              if (note) alert(`Returned to teacher with note: "${note}"`);
                            }}
                          >
                            Changes
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW: PUBLIC COURSE CATALOGUE (HOME VIEW)
           ========================================================================= */}
        {activeNav === 'home' && !activeCourse && (
          <section id="curriculum-grid" style={{ marginTop: '36px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{t.allCourses}</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Authentic, scholar-verified Islamic learning tracks.</p>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ width: '260px', padding: '8px 14px' }}
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="courses-grid">
              {filteredCourses.map(course => (
                <div key={course.id} className="course-card">
                  <div className="course-card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span className="badge badge-teal">{course.dept}</span>
                      <span className="badge badge-gold"><i className="fas fa-star"></i> {course.rating}</span>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '8px 0' }}>{course.title}</h3>
                    {course.titleArabic && (
                      <div className="course-card-arabic">{course.titleArabic}</div>
                    )}
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '8px 0 14px', flex: 1 }}>
                      {course.description}
                    </p>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                      <div><i className="fas fa-chalkboard-teacher"></i> {course.instructor}</div>
                      <div><i className="fas fa-clock"></i> {course.duration} • {course.lessons?.length || 4} Lessons</div>
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => handleEnroll(course.id)}>
                      {enrolledIds.includes(course.id) ? t.continueLearning : t.enrollNow}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* =========================================================================
            VIEW: ACTIVE COURSE PLAYER & AUDIO TAJWEED RECORDER
           ========================================================================= */}
        {activeCourse && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <button className="btn btn-outline btn-sm" onClick={() => setActiveCourse(null)}>
                <i className="fas fa-arrow-left"></i> Back to Courses
              </button>
            </div>

            <div className="glass-card" style={{ padding: '28px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <span className="badge badge-teal">{activeCourse.dept}</span>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '8px 0' }}>{activeCourse.title}</h2>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Instructor: <strong>{activeCourse.instructor}</strong>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary-light)' }}>
                    {courseProgress[activeCourse.id] || 0}%
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Curriculum Completed</div>
                </div>
              </div>

              {/* Lesson Viewer */}
              <div style={{ marginTop: '24px', background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '14px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary-light)' }}>
                  {activeCourse.lessons[activeLessonIndex]?.title || "Lesson Details"}
                </h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                  {activeCourse.lessons[activeLessonIndex]?.description || "Read and practice the lesson material with authentic tajweed rules."}
                </p>

                {/* Interactive Audio Tajweed Recorder (BRD Section 11 & 14) */}
                <div style={{ background: 'rgba(13, 148, 136, 0.08)', border: '1px solid var(--border-accent)', borderRadius: '12px', padding: '20px', margin: '20px 0' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-accent-gold)' }}>
                    <i className="fas fa-microphone-alt"></i> Live Audio Tajweed Recitation Recorder
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '6px 0 14px' }}>
                    {t.audioPracticePrompt}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    <button 
                      className={`btn ${isRecording ? 'btn-ruby' : 'btn-primary'}`}
                      onClick={toggleRecording}
                    >
                      <i className={`fas ${isRecording ? 'fa-stop' : 'fa-microphone'}`}></i>
                      {isRecording ? ` Stop Recording (${recordingSeconds}s)` : t.recordRecitation}
                    </button>

                    {recordedAudioUrl && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                        <audio controls src={recordedAudioUrl} style={{ height: '36px', flex: 1 }}></audio>
                        <button className="btn btn-gold" onClick={handleAudioSubmit}>
                          <i className="fas fa-paper-plane"></i> {t.submitRecitation}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                  <button 
                    className="btn btn-outline btn-sm"
                    disabled={activeLessonIndex === 0}
                    onClick={() => setActiveLessonIndex(activeLessonIndex - 1)}
                  >
                    Previous Lesson
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={markLessonComplete}>
                    Mark Complete & Next <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW: DIGITAL LIBRARY
           ========================================================================= */}
        {activeNav === 'library' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                <i className="fas fa-book" style={{ color: 'var(--color-primary-light)' }}></i> {t.navLibrary}
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                Authentic, scholarly verified classical Islamic books, manuscripts, and reference texts.
              </p>
            </div>

            <div className="courses-grid">
              {(window.LIBRARY_DATA || []).map(book => (
                <div key={book.id} className="course-card">
                  <div className="course-card-body">
                    <span className="badge badge-gold">{book.category}</span>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '8px 0' }}>{book.title}</h3>
                    <div className="course-card-arabic" style={{ fontSize: '1.3rem' }}>{book.titleArabic}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '8px 0' }}>
                      Author: <strong>{book.author}</strong>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px', flex: 1 }}>
                      {book.description}
                    </p>
                    <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setLibraryModal({ isOpen: true, book })}>
                      <i className="fas fa-book-reader"></i> Read Excerpt & Hawala
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          MODALS SECTION
         ========================================================================= */}

      {/* 1. AUTHENTICATION & LOGIN/SIGNUP MODAL (STUDENT, TEACHER, INSTITUTE, SCHOLAR) */}
      {authModal.isOpen && (
        <div className="auth-overlay" onClick={() => setAuthModal({ ...authModal, isOpen: false })}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <button className="auth-close-btn" onClick={() => setAuthModal({ ...authModal, isOpen: false })}>
              <i className="fas fa-times"></i>
            </button>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary-light)' }}>
                {authModal.mode === 'login' ? t.login : t.signup}
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Islamic LMS BRD v2.0 Multi-Role Access Platform
              </p>
            </div>

            {/* Role Selection Tabs */}
            <div className="auth-role-tabs">
              <button 
                type="button"
                className={`auth-role-tab ${authModal.roleTab === 'student' ? 'active' : ''}`}
                onClick={() => setAuthModal({ ...authModal, roleTab: 'student' })}
              >
                <i className="fas fa-user-graduate"></i> Student
              </button>
              <button 
                type="button"
                className={`auth-role-tab ${authModal.roleTab === 'teacher' ? 'active' : ''}`}
                onClick={() => setAuthModal({ ...authModal, roleTab: 'teacher' })}
              >
                <i className="fas fa-chalkboard-teacher"></i> Teacher
              </button>
              <button 
                type="button"
                className={`auth-role-tab ${authModal.roleTab === 'institute' ? 'active' : ''}`}
                onClick={() => setAuthModal({ ...authModal, roleTab: 'institute' })}
              >
                <i className="fas fa-mosque"></i> Madrasa
              </button>
              <button 
                type="button"
                className={`auth-role-tab ${authModal.roleTab === 'admin' ? 'active' : ''}`}
                onClick={() => setAuthModal({ ...authModal, roleTab: 'admin' })}
              >
                <i className="fas fa-user-shield"></i> Scholar
              </button>
            </div>

            {/* Dynamic Form per Role */}
            <form onSubmit={handleAuthSubmit}>
              {authModal.roleTab === 'institute' && (
                <div className="form-group">
                  <label className="form-label">Madrasa / Jamia Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Jamia Darul Uloom Markaz"
                    required
                    value={authForm.instituteName}
                    onChange={(e) => setAuthForm({ ...authForm, instituteName: e.target.value })}
                  />
                </div>
              )}

              {authModal.mode === 'signup' && authModal.roleTab !== 'institute' && (
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Muhammad Zaid"
                    required
                    value={authForm.name}
                    onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="name@domain.com"
                  required
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="••••••••"
                  required
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                />
              </div>

              {/* Student Specialized Onboarding Fields */}
              {authModal.mode === 'signup' && authModal.roleTab === 'student' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Age</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        value={authForm.age}
                        onChange={(e) => setAuthForm({ ...authForm, age: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Gender (Mandatory)</label>
                      <select 
                        className="form-select"
                        value={authForm.gender}
                        onChange={(e) => setAuthForm({ ...authForm, gender: e.target.value })}
                      >
                        <option value="Male">Male (Mardo ke liye)</option>
                        <option value="Female">Female (Khawateen ke liye)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Primary Islamic Learning Goal</label>
                    <select 
                      className="form-select"
                      value={authForm.goal}
                      onChange={(e) => setAuthForm({ ...authForm, goal: e.target.value })}
                    >
                      <option>Quran Padhna / Nazra</option>
                      <option>Hifz-ul-Quran</option>
                      <option>Dars-e-Nizami (Aalimiyyah)</option>
                      <option>Arabi Zaban o Adab</option>
                      <option>Fiqh-e-Niswan (Khawateen)</option>
                    </select>
                  </div>

                  {parseInt(authForm.age) < 13 && (
                    <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', padding: '12px', borderRadius: '10px', marginBottom: '14px' }}>
                      <div style={{ fontSize: '0.82rem', color: '#fb7185', fontWeight: 600 }}>
                        <i className="fas fa-shield-alt"></i> Under 13 Child Safety Notice (BRD Section 16)
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Guardian verification email will be required before live class participation.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Teacher Specialized Onboarding Fields */}
              {authModal.mode === 'signup' && authModal.roleTab === 'teacher' && (
                <div>
                  <div className="form-group">
                    <label className="form-label">Qualifications / Sanad</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Aalim / Alima / Qari / Hafiz / Sanad Darul Uloom"
                      value={authForm.qualification}
                      onChange={(e) => setAuthForm({ ...authForm, qualification: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Teaching Specialization</label>
                    <select 
                      className="form-select"
                      value={authForm.specialization}
                      onChange={(e) => setAuthForm({ ...authForm, specialization: e.target.value })}
                    >
                      <option>Quran & Tajweed</option>
                      <option>Dars-e-Nizami (Fiqh & Hadith)</option>
                      <option>Arabic Language (Sarf & Nahw)</option>
                      <option>Hifz-ul-Quran</option>
                      <option>Women Section (Female Teacher)</option>
                    </select>
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                {authModal.mode === 'login' ? "Dakhil Hon (Log In)" : "Naya Account Banao (Register)"}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.85rem' }}>
              {authModal.mode === 'login' ? (
                <span>
                  Naya account banana hai?{" "}
                  <a href="#register" style={{ color: 'var(--color-primary-light)', fontWeight: 600 }} onClick={(e) => { e.preventDefault(); setAuthModal({ ...authModal, mode: 'signup' }); }}>
                    Yahan Register Karein
                  </a>
                </span>
              ) : (
                <span>
                  Pehle se account hai?{" "}
                  <a href="#login" style={{ color: 'var(--color-primary-light)', fontWeight: 600 }} onClick={(e) => { e.preventDefault(); setAuthModal({ ...authModal, mode: 'login' }); }}>
                    Yahan Log In Karein
                  </a>
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. ADD TEACHER MODAL FOR MADRASA / INSTITUTE */}
      {addTeacherModal && (
        <div className="auth-overlay" onClick={() => setAddTeacherModal(false)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <button className="auth-close-btn" onClick={() => setAddTeacherModal(false)}>
              <i className="fas fa-times"></i>
            </button>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px' }}>
              <i className="fas fa-user-plus" style={{ color: 'var(--color-primary-light)' }}></i> Madrasa me Naye Ustaad Shamil Karein
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Apne idare ke tehet ustaad jodein taake woh classes le sakein aur attendance record ho sake.
            </p>

            <form onSubmit={handleAddTeacherToInstitute}>
              <div className="form-group">
                <label className="form-label">Ustaad ka Naam</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Maulana Muhammad Anas"
                  required
                  value={newTeacherForm.name}
                  onChange={(e) => setNewTeacherForm({ ...newTeacherForm, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Uhda / Designation</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Ustad-e-Hadees / Muallim-e-Hifz"
                  required
                  value={newTeacherForm.designation}
                  onChange={(e) => setNewTeacherForm({ ...newTeacherForm, designation: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Sanad / Darul Uloom</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Al-Shahadat-ul-Aalamiyyah (Darul Uloom)"
                  required
                  value={newTeacherForm.sanad}
                  onChange={(e) => setNewTeacherForm({ ...newTeacherForm, sanad: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Madrasa Shoba (Department)</label>
                <select 
                  className="form-select"
                  value={newTeacherForm.department}
                  onChange={(e) => setNewTeacherForm({ ...newTeacherForm, department: e.target.value })}
                >
                  <option>Quran o Tajweed</option>
                  <option>Dars-e-Nizami (Aalim)</option>
                  <option>Women Section (Fiqh-e-Niswan)</option>
                  <option>Hifz-ul-Quran</option>
                  <option>Kids Maktab</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                <i className="fas fa-check"></i> Ustaad Shamil Karein
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. COURSE STUDIO MODAL (WITH KITAB HAWALA - BRD FLOW 3) */}
      {courseStudio.isOpen && (
        <div className="auth-overlay" onClick={() => setCourseStudio({ ...courseStudio, isOpen: false })}>
          <div className="auth-modal" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <button className="auth-close-btn" onClick={() => setCourseStudio({ ...courseStudio, isOpen: false })}>
              <i className="fas fa-times"></i>
            </button>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px' }}>
              <i className="fas fa-book" style={{ color: 'var(--color-accent-gold)' }}></i> Naya Course Banao (BRD Flow 3)
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Course create karne ke baad Scholar Review ke liye jayega aur tasdeeq ke baad hi live hoga.
            </p>

            <form onSubmit={handleCreateCourseSubmit}>
              <div className="form-group">
                <label className="form-label">Course Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Ahkam-e-Tajweed & Makharij Foundation"
                  required
                  value={courseStudio.title}
                  onChange={(e) => setCourseStudio({ ...courseStudio, title: e.target.value })}
                />
              </div>

              <div className="kitab-hawala-box">
                <label className="form-label" style={{ color: 'var(--color-accent-gold)' }}>
                  <i className="fas fa-scroll"></i> Kitab ka Hawala / Authentic Reference (Mandatory)
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Al-Jazariyyah, Durr-e-Mukhtar, Hidayah, Noor-ul-Idah"
                  required
                  value={courseStudio.kitabHawala}
                  onChange={(e) => setCourseStudio({ ...courseStudio, kitabHawala: e.target.value })}
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  BRD Rule: Deeni masael bina kitab ke hawale ke shaya nahi honge.
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Course Delivery Type</label>
                  <select 
                    className="form-select"
                    value={courseStudio.courseType}
                    onChange={(e) => setCourseStudio({ ...courseStudio, courseType: e.target.value })}
                  >
                    <option value="live">Live Classes (Auto Attendance)</option>
                    <option value="self_paced">Self-Paced (Recorded Lessons)</option>
                    <option value="hybrid">Hybrid (Live + Recorded)</option>
                    <option value="one_to_one">1-on-1 Personalized</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Fees Model</label>
                  <select 
                    className="form-select"
                    value={courseStudio.feeModel}
                    onChange={(e) => setCourseStudio({ ...courseStudio, feeModel: e.target.value })}
                  >
                    <option value="free">Free (Sadaqah-e-Jariyah - 0% Cut)</option>
                    <option value="monthly">Madrasa Monthly Fees</option>
                    <option value="one_time">One-Time Enrolment</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-gold" style={{ width: '100%', marginTop: '10px' }}>
                <i className="fas fa-paper-plane"></i> {t.submitReview}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. VERIFIABLE CERTIFICATE MODAL */}
      {certModal.isOpen && (
        <div className="auth-overlay" onClick={() => setCertModal({ ...certModal, isOpen: false })}>
          <div className="auth-modal" style={{ maxWidth: '650px', border: '2px solid var(--border-gold)' }} onClick={(e) => e.stopPropagation()}>
            <button className="auth-close-btn" onClick={() => setCertModal({ ...certModal, isOpen: false })}>
              <i className="fas fa-times"></i>
            </button>

            <div style={{ textAlign: 'center', border: '2px dashed var(--border-gold)', padding: '24px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.04)' }}>
              <div style={{ fontSize: '1.8rem', color: 'var(--color-accent-gold)', marginBottom: '8px' }}>
                <i className="fas fa-certificate"></i>
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-accent-gold)' }}>
                {t.certificateOfCompletion}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {t.issuedBy}
              </p>

              <div style={{ margin: '20px 0' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t.certifiedThat}</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', margin: '6px 0' }}>
                  {certModal.studentName}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t.hasCompleted}</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-primary-light)', marginTop: '4px' }}>
                  {certModal.course ? certModal.course.title : "Noorani Qaida & Advanced Tajweed Rules"}
                </div>
                <div style={{ marginTop: '8px', fontSize: '0.9rem', color: 'var(--color-emerald-light)' }}>
                  Grade: <strong>{certModal.grade}</strong> • Hazri: <strong>92% (Met 75% Rule)</strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-gold)', paddingTop: '16px', marginTop: '16px' }}>
                <div style={{ textAlign: 'left', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <div>{t.certId}: <code>CERT-2026-00892</code></div>
                  <div>Verification: <code>alnoor.edu/verify/00892</code></div>
                </div>
                <button className="btn btn-gold btn-sm" onClick={() => alert("Certificate PDF Downloaded!")}>
                  <i className="fas fa-download"></i> Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. LIBRARY BOOK EXCERPT MODAL */}
      {libraryModal.isOpen && libraryModal.book && (
        <div className="auth-overlay" onClick={() => setLibraryModal({ isOpen: false, book: null })}>
          <div className="auth-modal" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <button className="auth-close-btn" onClick={() => setLibraryModal({ isOpen: false, book: null })}>
              <i className="fas fa-times"></i>
            </button>
            <span className="badge badge-gold">{libraryModal.book.category}</span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '8px 0 4px' }}>{libraryModal.book.title}</h3>
            <div className="course-card-arabic" style={{ fontSize: '1.4rem' }}>{libraryModal.book.titleArabic}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Musannif: <strong>{libraryModal.book.author}</strong> • Sanad: {libraryModal.book.era || "Classical Era"}
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '10px', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: '16px' }}>
              {libraryModal.book.excerpt || "Authentic verified manuscript excerpt available for registered researchers."}
            </div>

            <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setLibraryModal({ isOpen: false, book: null })}>
              Close Reader
            </button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer style={{ marginTop: '64px', borderTop: '1px solid var(--border-subtle)', padding: '36px 24px', textAlign: 'center', background: 'rgba(4, 10, 18, 0.7)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary-light)', marginBottom: '8px' }}>
            {t.brandName}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '16px' }}>
            Islamic LMS BRD v2.0 Compliant Open Source Platform • Multi-Role Architecture: Students, Independent Educators, Connected Madaris & Scholarly Review Board.
          </p>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            © 2026 Al-Noor Open Source Academy • Quran, Tajweed, Fiqh, Arabic, Hifz Logbook & Live Auto Attendance Engine
          </div>
        </div>
      </footer>
    </div>
  );
}

// Render Master Application to DOM
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
