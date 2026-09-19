// Al-Noor Open Source Islamic Learning Platform — Master React 18 Application
// Fully Compliant with Islamic LMS BRD v2.0
const { useState, useEffect, useRef } = React;

function App() {
  // Global Language & Role Session State
  const [lang, setLang] = useState('ru'); // 'ru' (Roman Urdu), 'en', 'ur'
  const [activeNav, setActiveNav] = useState('dashboard');
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

  // Active User Session State (Defaults to Student for instant student dashboard)
  const [currentUser, setCurrentUser] = useState(personas.student);

  // Authentication & Multi-Step Onboarding Modal State
  const [authModal, setAuthModal] = useState({
    isOpen: false,
    mode: 'signup', // 'login' or 'signup'
    roleTab: 'student', // 'student', 'teacher', 'institute', 'admin'
    step: 1 // Stepper: 1, 2, 3, 4
  });

  // Auth Form Fields State (Detailed Multi-Step Fields)
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    age: '19',
    gender: 'Male',
    city: 'Mumbai / Lahore',
    country: 'India / Pakistan',
    languages: 'Urdu, Arabic, English',
    goal: 'Quran Padhna / Nazra',
    guardianName: '',
    guardianEmail: '',
    guardianPhone: '',
    guardianConsent: false,
    // Teacher specific fields
    qualification: 'Fazil Dars-e-Nizami',
    darulUloom: 'Darul Uloom Deoband / Nadwatul Ulama',
    sanadYear: '2021',
    specialization: 'Quran & Tajweed',
    demoVideoUrl: 'https://youtube.com/watch?v=demo-tajweed-lesson',
    uploadedSanadName: '',
    uploadedGovtIdName: '',
    payoutUpi: 'qari.basit@okhdfcbank',
    shariahUndertaking: true,
    childSafetyAccepted: true,
    // Institute specific fields
    instituteName: 'Jamia Darul Uloom Markaz',
    waqfRegNo: 'WQF-2026-9812',
    foundedYear: '1984',
    nazimName: 'Maulana Ibrahim Qasmi',
    subdomain: 'darululoom',
    departmentsSelected: ['Hifz', 'Dars-e-Nizami', 'Banat']
  });

  // Homework Submission Modal State
  const [hwModal, setHwModal] = useState({
    isOpen: false,
    homework: null,
    notes: '',
    fileName: ''
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
    classStatus: "Live",
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
      }
    ]
  });

  // Course Creation Studio State (BRD Flow 3)
  const [courseStudio, setCourseStudio] = useState({
    isOpen: false,
    title: "",
    titleArabic: "",
    dept: "quran",
    courseType: "live",
    feeModel: "free",
    price: "0",
    level: "Beginner",
    language: "Urdu",
    kitabHawala: "Al-Muqaddimah Al-Jazariyyah, Babul Makharij (Imam Ibn Al-Jazari)",
    modulesCount: "4",
    lessonsCount: "16",
    genderRestriction: "all"
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

  // Filtered Courses
  const filteredCourses = courses.filter(course => {
    const matchesDept = selectedDept === 'all' || course.dept === selectedDept;
    const matchesSearch = !searchQuery || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.titleArabic && course.titleArabic.includes(searchQuery));
    return matchesDept && matchesSearch;
  });

  // Dedicated Persona Switcher Handler (Enforces strict panel isolation)
  const handleSwitchPersona = (roleKey) => {
    const p = personas[roleKey];
    setCurrentUser(p);
    setActiveCourse(null);
    if (roleKey === 'student') {
      setActiveNav('dashboard');
    } else if (roleKey === 'teacher') {
      setActiveNav('teacher');
    } else if (roleKey === 'institute') {
      setActiveNav('institute');
    } else if (roleKey === 'admin') {
      setActiveNav('admin');
    }
  };

  // Multi-Step Onboarding Form Submit Handler
  const handleMultiStepSubmit = (e) => {
    e.preventDefault();
    if (authModal.mode === 'login') {
      // Pick matching persona
      handleSwitchPersona(authModal.roleTab);
      alert(lang === 'ur' ? "کامیابی سے داخل ہو گئے۔ خوش آمدید!" : "Kamyabi se dakhil ho gaye. Khush Aamdeed!");
    } else {
      // Register New Profile from Multi-step Wizard
      const role = authModal.roleTab;
      const newUser = {
        id: "usr-" + Date.now(),
        name: authForm.name || (role === 'institute' ? authForm.instituteName : "New Registered User"),
        role: role,
        email: authForm.email,
        age: authForm.age,
        gender: authForm.gender,
        goal: authForm.goal,
        qualification: authForm.qualification,
        specialization: authForm.specialization,
        verificationLevel: role === 'teacher' ? "Verified Teacher Candidate (Under Scholar Review)" : undefined,
        probationStatus: role === 'teacher' ? "Probation: 0/3 Courses, 0/5 Classes Monitored" : undefined,
        avatarIcon: role === 'student' ? "fa-user-graduate" : role === 'teacher' ? "fa-chalkboard-teacher" : role === 'institute' ? "fa-mosque" : "fa-user-shield",
        instituteAffiliation: role === 'institute' ? authForm.instituteName : "Independent"
      };
      setCurrentUser(newUser);
      setActiveCourse(null);
      if (role === 'student') setActiveNav('dashboard');
      else if (role === 'teacher') setActiveNav('teacher');
      else if (role === 'institute') setActiveNav('institute');
      else setActiveNav('admin');
      
      alert(lang === 'ur' ? "آپ کا ملٹی اسٹیپ رجسٹریشن فارم کامیابی سے جمع ہو گیا ہے!" : "Aapka multi-step registration form mukammal ho gaya hai aur account activate ho chuka hai!");
    }
    setAuthModal({ ...authModal, isOpen: false, step: 1 });
  };

  // Add Teacher to Institute Handler
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
    alert("Madrasa me naya ustaad kamyabi se shamil kar diya gaya hai!");
  };

  // Create Course Handler
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
        { id: 2, title: "Lesson 2: Core Rules & Text Analysis", duration: "35 min" }
      ]
    };
    setCourses([newCourseObj, ...courses]);
    setCourseStudio({ ...courseStudio, isOpen: false });
    alert("Course kamyabi se Academic aur Scholar Review ke liye submit ho chuka hai!");
  };

  // Homework Submit Handler
  const handleHwSubmit = (e) => {
    e.preventDefault();
    if (!hwModal.homework) return;
    setHomeworkList(homeworkList.map(h => 
      h.id === hwModal.homework.id 
        ? { ...h, mySubmissionStatus: "Submitted", feedback: "Submission received. Pending teacher evaluation." } 
        : h
    ));
    setHwModal({ isOpen: false, homework: null, notes: '', fileName: '' });
    alert("Homework assignment kamyabi se submit ho gaya!");
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
          
          {/* Role-Specific Direct Navigation */}
          {currentUser.role === 'student' && (
            <li className={`nav-link ${activeNav === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveNav('dashboard'); setActiveCourse(null); }}>
              <i className="fas fa-user-graduate"></i> My Learning Dashboard
            </li>
          )}

          {currentUser.role === 'teacher' && (
            <li className={`nav-link ${activeNav === 'teacher' ? 'active' : ''}`} onClick={() => { setActiveNav('teacher'); setActiveCourse(null); }}>
              <i className="fas fa-chalkboard-teacher"></i> Teacher Studio & Academy
            </li>
          )}

          {currentUser.role === 'institute' && (
            <li className={`nav-link ${activeNav === 'institute' ? 'active' : ''}`} onClick={() => { setActiveNav('institute'); setActiveCourse(null); }}>
              <i className="fas fa-mosque"></i> Madrasa Operations Hub
            </li>
          )}

          {currentUser.role === 'admin' && (
            <li className={`nav-link ${activeNav === 'admin' ? 'active' : ''}`} onClick={() => { setActiveNav('admin'); setActiveCourse(null); }}>
              <i className="fas fa-user-shield"></i> Scholar Review Pipeline
            </li>
          )}

          <li className={`nav-link ${selectedDept === 'quran' ? 'active' : ''}`} onClick={() => { setActiveNav('home'); setSelectedDept('quran'); setActiveCourse(null); }}>
            <i className="fas fa-book-open"></i> {t.navQuran}
          </li>
          <li className={`nav-link ${selectedDept === 'women' ? 'active' : ''}`} onClick={() => { setActiveNav('home'); setSelectedDept('women'); setActiveCourse(null); }}>
            <i className="fas fa-female"></i> {t.navWomen}
          </li>
          <li className={`nav-link ${activeNav === 'library' ? 'active' : ''}`} onClick={() => { setActiveNav('library'); setActiveCourse(null); }}>
            <i className="fas fa-book"></i> {t.navLibrary}
          </li>
        </ul>

        <div className="nav-actions">
          {/* User Profile Chip (Opens Multi-Step Auth Modal) */}
          <div 
            onClick={() => setAuthModal({ isOpen: true, mode: 'signup', roleTab: currentUser.role, step: 1 })}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              padding: '6px 14px', 
              background: 'rgba(255,255,255,0.08)', 
              borderRadius: '99px', 
              cursor: 'pointer',
              border: '1px solid var(--border-light)',
              transition: 'var(--transition-fast)'
            }}
            title="Click to Open Registration Form / Profile"
          >
            <i className={`fas ${currentUser.avatarIcon}`} style={{ color: 'var(--color-primary-light)' }}></i>
            <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>{currentUser.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-accent-gold)' }}>
                {currentUser.role === 'student' ? 'Student Account' : currentUser.role === 'teacher' ? 'Independent Teacher' : currentUser.role === 'institute' ? 'Madrasa Admin' : 'Scholar Reviewer'}
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

      {/* 2. BRD ROLE PERSONA SWITCHER BAR */}
      <div className="persona-switcher-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
            <i className="fas fa-id-badge"></i> Active Role View:
          </span>
        </div>

        <div className="persona-btn-group">
          <button 
            className={`persona-pill ${currentUser.role === 'student' ? 'active' : ''}`}
            onClick={() => handleSwitchPersona('student')}
          >
            <i className="fas fa-user-graduate"></i> 🎓 Student Panel (Ahmad Raza)
          </button>
          <button 
            className={`persona-pill ${currentUser.role === 'teacher' ? 'active' : ''}`}
            onClick={() => handleSwitchPersona('teacher')}
          >
            <i className="fas fa-chalkboard-teacher"></i> 👨‍🏫 Teacher Studio (Qari Abdul Basit)
          </button>
          <button 
            className={`persona-pill institute ${currentUser.role === 'institute' ? 'active' : ''}`}
            onClick={() => handleSwitchPersona('institute')}
          >
            <i className="fas fa-mosque"></i> 🏛️ Madrasa / Jamia (Jamia Darul Uloom)
          </button>
          <button 
            className={`persona-pill scholar ${currentUser.role === 'admin' ? 'active' : ''}`}
            onClick={() => handleSwitchPersona('admin')}
          >
            <i className="fas fa-user-shield"></i> ⚖️ Scholar Reviewer (Mufti Tariq)
          </button>
        </div>

        <button 
          className="btn btn-gold btn-sm"
          style={{ padding: '5px 12px', fontSize: '0.78rem' }}
          onClick={() => setAuthModal({ isOpen: true, mode: 'signup', roleTab: currentUser.role, step: 1 })}
        >
          <i className="fas fa-file-alt"></i> Complete Registration Forms
        </button>
      </div>

      {/* 3. HERO SECTION (HOME VIEW ONLY) */}
      {activeNav === 'home' && !activeCourse && (
        <section className="hero-section">
          <div className="hero-badge">
            <i className="fas fa-star-and-crescent"></i> {t.heroBadge}
          </div>
          <h1 className="hero-title">
            {t.heroTitlePrefix} <br />
            <span className="highlight">{t.heroTitleHighlight}</span>
          </h1>
          <p className="hero-subtitle">{t.heroSubtitle}</p>

          <div className="hero-cta-group">
            <button className="btn btn-primary btn-lg" onClick={() => {
              const el = document.getElementById('curriculum-grid');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}>
              <i className="fas fa-compass"></i> Explore Courses
            </button>
            <button className="btn btn-gold btn-lg" onClick={() => handleSwitchPersona(currentUser.role)}>
              <i className="fas fa-th-large"></i> Go to My Dedicated Portal
            </button>
          </div>
        </section>
      )}

      {/* 4. MAIN CONTAINER WITH STRICT ROLE ISOLATION */}
      <main className="main-content">
        
        {/* =========================================================================
            PANEL 1: STUDENT LEARNING HUB (ONLY VISIBLE TO STUDENTS)
           ========================================================================= */}
        {currentUser.role === 'student' && activeNav === 'dashboard' && !activeCourse && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <span className="badge badge-teal" style={{ marginBottom: '6px' }}>Student Learning Portal</span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                  <i className="fas fa-user-graduate" style={{ color: 'var(--color-primary-light)' }}></i> Welcome, {currentUser.name}!
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Islamic Learning Track: <strong>{currentUser.goal}</strong> • Institution: <strong>{currentUser.instituteAffiliation}</strong>
                </p>
              </div>
              <button 
                className="btn btn-gold"
                onClick={() => setCertModal({ isOpen: true, course: courses[0], studentName: currentUser.name, grade: "Mumtaz (A+)" })}
              >
                <i className="fas fa-award"></i> View Verifiable Certificate
              </button>
            </div>

            {/* Student 4 Key Stats Widgets */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase' }}>1. Continue Learning</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary-light)', marginTop: '6px' }}>{enrolledIds.length} Courses</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-emerald-light)' }}><i className="fas fa-check-circle"></i> Active & Progressing</div>
              </div>
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase' }}>2. Aaj Ki Live Classes</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f43f5e', marginTop: '10px' }}>Tajweed Halaqah</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-emerald-light)' }}>LIVE NOW (Auto Attendance)</div>
              </div>
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase' }}>3. Pending Work</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-accent-gold)', marginTop: '6px' }}>1 Homework</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Due Tomorrow 11:59 PM</div>
              </div>
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase' }}>4. Meri Attendance</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-emerald-light)', marginTop: '6px' }}>88%</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-emerald-light)' }}>Eligible for Sanad (Req 75%)</div>
              </div>
            </div>

            {/* Student Widget 5: Madrasa Daily Hifz Logbook */}
            <div className="glass-card" style={{ padding: '24px', marginBottom: '28px', border: '1px solid var(--border-gold)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                    <i className="fas fa-book-reader" style={{ color: 'var(--color-accent-gold)' }}></i> Madrasa Daily Hifz Register (Sabaq, Sabqi, Manzil)
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Rozana ka record: Ustaad se tasdeeq shuda hifz register.
                  </div>
                </div>
                <div className="hifz-stamp">
                  {hifzRecord.teacherSeal}
                </div>
              </div>

              <div className="hifz-register">
                <div className="hifz-entry-box">
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Naya Sabaq</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, margin: '6px 0' }}>{hifzRecord.sabaq}</div>
                  <span className="badge badge-emerald">{hifzRecord.sabaqGrade}</span>
                </div>
                <div className="hifz-entry-box">
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sabqi (Pichla Sabaq)</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, margin: '6px 0' }}>{hifzRecord.sabqi}</div>
                  <span className="badge badge-teal">{hifzRecord.sabqiGrade}</span>
                </div>
                <div className="hifz-entry-box">
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Manzil (Daur)</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, margin: '6px 0' }}>{hifzRecord.manzil}</div>
                  <span className="badge badge-gold">{hifzRecord.manzilGrade}</span>
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: '10px', marginTop: '14px', fontSize: '0.85rem' }}>
                <strong>Ustaad Remarks:</strong> {hifzRecord.teacherRemarks}
              </div>
            </div>

            {/* Student Widget 6: Homework & Assignments (With Submit Form) */}
            <div className="glass-card" style={{ padding: '24px', marginBottom: '28px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>
                <i className="fas fa-tasks"></i> Pending Homework & Assignments (BRD Section 10)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                {homeworkList.map(hw => (
                  <div key={hw.id} style={{ background: 'rgba(0,0,0,0.25)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{hw.title}</h4>
                      <span className={`badge ${hw.mySubmissionStatus === 'Submitted' ? 'badge-emerald' : 'badge-gold'}`}>
                        {hw.mySubmissionStatus}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '8px 0 12px' }}>
                      Course: {hw.course} • Due: {hw.dueDate} • Max Marks: {hw.maxMarks}
                    </div>
                    {hw.feedback && (
                      <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--color-emerald-light)', marginBottom: '12px' }}>
                        <strong>Feedback:</strong> {hw.feedback}
                      </div>
                    )}
                    {hw.mySubmissionStatus === 'Pending' ? (
                      <button className="btn btn-primary btn-sm" onClick={() => setHwModal({ isOpen: true, homework: hw, notes: '', fileName: '' })}>
                        <i className="fas fa-upload"></i> Submit Assignment Form
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-emerald-light)' }}>
                        <i className="fas fa-check-circle"></i> Completed & Graded ({hw.myGrade || "Evaluated"})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Student Widget 7: Continue Learning Courses */}
            <div className="glass-card" style={{ padding: '24px', marginBottom: '28px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>
                <i className="fas fa-book-open"></i> Enrolled Courses (Continue Learning)
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
                      <i className="fas fa-play"></i> Continue Learning
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Student Widget 8: Fees & Receipts */}
            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                    <i className="fas fa-receipt"></i> Monthly Madrasa Fee Status (Sep 2026)
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Shariah-compliant fee processing. Receipt ID: <code>REC-2026-SEP-091</code>
                  </p>
                </div>
                <button className="btn btn-outline btn-sm" onClick={() => alert("Downloaded PDF Fee Receipt: REC-2026-SEP-091")}>
                  <i className="fas fa-file-pdf"></i> Download Official Receipt
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            PANEL 2: INDIVIDUAL TEACHER STUDIO & MINI ACADEMY (ONLY VISIBLE TO TEACHER)
           ========================================================================= */}
        {currentUser.role === 'teacher' && activeNav === 'teacher' && !activeCourse && (
          <div>
            {/* Mini Academy Header Banner */}
            <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <span className="badge badge-gold" style={{ marginBottom: '6px' }}>Independent Educator Workspace</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
                      <i className="fas fa-chalkboard-teacher" style={{ color: 'var(--color-primary-light)' }}></i> {currentUser.name}
                    </h2>
                    <span className="badge badge-emerald">{currentUser.verificationLevel}</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Specialization: <strong>{currentUser.specialization}</strong> • Sanad: <strong>{currentUser.qualification}</strong>
                  </p>
                  <div style={{ fontSize: '0.84rem', color: 'var(--color-accent-gold)', marginTop: '4px' }}>
                    <i className="fas fa-globe"></i> Public Mini Academy URL: <code>/{currentUser.academySlug}</code>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-gold" onClick={() => setCourseStudio({ ...courseStudio, isOpen: true })}>
                    <i className="fas fa-plus-circle"></i> Create Course (Kitab Hawala)
                  </button>
                  <button className="btn btn-primary" onClick={() => alert("Scheduled new recurring daily live class!")}>
                    <i className="fas fa-calendar-plus"></i> Schedule Recurring Live Class
                  </button>
                </div>
              </div>

              {/* Probation & Payout Status (BRD Section 05) */}
              <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid var(--border-gold)', borderRadius: '10px', padding: '12px 16px', marginTop: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem' }}>
                    <strong>Probation Gate:</strong> {currentUser.probationStatus}
                  </span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--color-emerald-light)' }}>
                    <i className="fas fa-shield-alt"></i> Paid Courses & Direct Payout Unlocked
                  </span>
                </div>
              </div>
            </div>

            {/* LIVE AUTO ATTENDANCE ENGINE SIMULATOR */}
            <div className="attendance-sim-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="heartbeat-dot"></span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                      Live Auto Attendance Engine (SDK 30s Heartbeat)
                    </h3>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Class: <strong>{attendanceEngine.classTitle}</strong> (40 Min) • Attendance Threshold: <strong>{attendanceEngine.attendanceThreshold}%</strong>
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={() => alert("Simulated net glitch: Ahmad Raza disconnected (timeout) -> reconnected 5 min later.")}
                  >
                    Simulate Net Glitch
                  </button>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => alert("Class ended. Attendance percentage calculated automatically per BRD Flow 6!")}
                  >
                    Finalize Attendance
                  </button>
                </div>
              </div>

              {/* Attendance Table */}
              <table className="custom-table" style={{ background: 'rgba(0,0,0,0.3)', marginTop: '16px' }}>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Join Time</th>
                    <th>Timeline</th>
                    <th>Duration</th>
                    <th>%</th>
                    <th>Auto Status</th>
                    <th>Flags</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceEngine.sessions.map(sess => (
                    <tr key={sess.id}>
                      <td><strong>{sess.studentName}</strong></td>
                      <td>{sess.joinTime}</td>
                      <td>{sess.exitTime} -> {sess.rejoinTime}</td>
                      <td>{sess.totalDurationMin} min</td>
                      <td><strong>{sess.attendancePercent}%</strong></td>
                      <td>
                        <span className={`badge ${sess.status === 'Present' ? 'badge-emerald' : 'badge-ruby'}`}>
                          {sess.status}
                        </span>
                      </td>
                      <td>
                        {sess.flag === 'network_unstable' ? (
                          <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>Net Unstable</span>
                        ) : (
                          <span>—</span>
                        )}
                      </td>
                      <td>
                        <button 
                          className="btn btn-outline btn-sm"
                          style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                          onClick={() => {
                            const reason = prompt("Enter manual override reason:", "Excused due to technical disruption.");
                            if (reason) alert(`Audit log recorded override: "${reason}"`);
                          }}
                        >
                          Override
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Recitation Grading Queue */}
            <div className="glass-card" style={{ padding: '24px', margin: '24px 0' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>
                <i className="fas fa-microphone-alt"></i> Student Tajweed Recitations to Evaluate
              </h3>
              {audioSubmissions.map(sub => (
                <div key={sub.id} style={{ padding: '16px', background: 'rgba(0,0,0,0.25)', borderRadius: '12px', marginBottom: '14px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-primary-light)' }}>
                        {sub.studentName}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {sub.courseTitle} • {sub.lessonTitle}
                      </div>
                    </div>
                    <span className={`badge ${sub.status === 'Graded' ? 'badge-emerald' : 'badge-gold'}`}>
                      {sub.status}
                    </span>
                  </div>

                  <div style={{ margin: '12px 0' }}>
                    <audio controls src="https://everyayah.com/data/Husary_128kbps/001001.mp3" style={{ height: '36px', width: '100%' }}></audio>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    <span className="feedback-tag selected">Makharij Corrected</span>
                    <span className="feedback-tag selected">Ghunnah</span>
                    <span className="feedback-tag">Madd</span>
                    <span className="feedback-tag">Qalqalah</span>
                    <span className="feedback-tag">Waqf</span>
                  </div>

                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      const note = prompt("Enter teacher remarks for student:", "MashaAllah, good recitation. Maintain proper Ghunnah duration.");
                      if (note) {
                        setAudioSubmissions(audioSubmissions.map(s => s.id === sub.id ? { ...s, status: "Graded", grade: "Mumtaz (A)", teacherNote: note } : s));
                        alert("Evaluation submitted!");
                      }
                    }}
                  >
                    Grade & Submit Voice/Text Feedback
                  </button>
                </div>
              ))}
            </div>

            {/* Payout & Earnings Wallet */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>
                <i className="fas fa-wallet" style={{ color: 'var(--color-accent-gold)' }}></i> Teacher Payout Wallet
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '14px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>NET EARNINGS</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{teacherEarnings.netEarnings}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Platform Cut: {teacherEarnings.platformFee}</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '14px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>ESCROW HOLD (7-DAYS)</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-accent-gold)' }}>{teacherEarnings.inEscrow}</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '14px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>READY FOR PAYOUT</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-emerald-light)' }}>{teacherEarnings.readyForPayout}</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '14px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>PAYOUT ACCOUNT</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '4px' }}>{teacherEarnings.payoutAccount}</div>
                  <button className="btn btn-outline btn-sm" style={{ marginTop: '8px' }} onClick={() => alert("Payout request processed!")}>
                    Request Payout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            PANEL 3: INSTITUTE / MADARIS OPERATIONS HUB (ONLY VISIBLE TO MADRASA)
           ========================================================================= */}
        {currentUser.role === 'institute' && activeNav === 'institute' && !activeCourse && (
          <div>
            <div className="glass-card" style={{ padding: '28px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
                  <div style={{ 
                    width: '68px', height: '68px', borderRadius: '16px', 
                    background: 'linear-gradient(135deg, #0284c7, #0369a1)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    fontSize: '2rem', color: '#ffffff', border: '2px solid #38bdf8' 
                  }}>
                    <i className="fas fa-mosque"></i>
                  </div>
                  <div>
                    <span className="badge badge-teal" style={{ marginBottom: '4px' }}>Madrasa Administration</span>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>{currentUser.name}</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.9rem' }}>
                      Nazim-e-Ala: <strong>{currentUser.principal}</strong> • Waqf Reg ID: <code>{currentUser.waqfRegId}</code>
                    </p>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-accent-gold)' }}>
                      Subdomain: <code>https://{currentUser.subdomain}</code>
                    </div>
                  </div>
                </div>

                <button className="btn btn-primary" onClick={() => setAddTeacherModal(true)}>
                  <i className="fas fa-user-plus"></i> + Add Teacher to Madrasa
                </button>
              </div>

              {/* Madrasa Metric Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginTop: '24px' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>AFFILIATED TEACHERS</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary-light)' }}>{facultyList.length}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-emerald-light)' }}>Sanad Verified</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>ENROLLED TALABA</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-accent-gold)' }}>{currentUser.totalStudents}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>5 Active Departments</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>MONTHLY CHANDA/FEES</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8' }}>{currentUser.monthlyChanda}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-emerald-light)' }}>Waqf Quota Included</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>AVG ATTENDANCE</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-emerald-light)' }}>91.4%</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>SDK Calculated</div>
                </div>
              </div>
            </div>

            {/* Institute Tabs */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-light)', marginBottom: '24px' }}>
              <button className={`btn ${instituteTab === 'faculty' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setInstituteTab('faculty')}>
                Affiliated Faculty ({facultyList.length})
              </button>
              <button className={`btn ${instituteTab === 'departments' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setInstituteTab('departments')}>
                Departments & Batches (5)
              </button>
              <button className={`btn ${instituteTab === 'roster' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setInstituteTab('roster')}>
                Talaba Directory & Fees
              </button>
            </div>

            {/* TAB 1: FACULTY MANAGEMENT */}
            {instituteTab === 'faculty' && (
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
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.2)', padding: '8px 10px', borderRadius: '8px', marginBottom: '12px' }}>
                      <div><strong>Sanad:</strong> {teacher.sanad}</div>
                      <div style={{ marginTop: '4px' }}><strong>Batches:</strong> {teacher.batches.join(', ')}</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                      <span className="badge badge-emerald">{teacher.studentsCount} Talaba</span>
                      <button className="btn btn-outline btn-sm" onClick={() => alert(`Opening assignments for ${teacher.name}`)}>
                        Manage Batches
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 2: DEPARTMENTS */}
            {instituteTab === 'departments' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                <div className="glass-card" style={{ padding: '20px' }}>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-primary-light)' }}>
                    Shoba-e-Hifz-ul-Quran
                  </h4>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '6px 0 10px' }}>
                    Daily Sabaq, Sabqi, Manzil. Head: Hafiz Muhammad Bilal. 43 Talaba.
                  </p>
                </div>
                <div className="glass-card" style={{ padding: '20px' }}>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-accent-gold)' }}>
                    Dars-e-Nizami (Aalimiyyah)
                  </h4>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '6px 0 10px' }}>
                    Sarf, Nahw, Fiqh (Hidayah), Hadith (Mishkat). Head: Mufti Salman. 78 Talaba.
                  </p>
                </div>
                <div className="glass-card" style={{ padding: '20px' }}>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f43f5e' }}>
                    Shoba-e-Banat (Girls Wing)
                  </h4>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '6px 0 10px' }}>
                    Fiqh-e-Niswan & Aalima Course. Head: Aalima Maryam. Strictly Female Faculty.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: TALABA ROSTER */}
            {instituteTab === 'roster' && (
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>
                  Madrasa Talaba Register & Mahana Fees
                </h3>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Roll No</th>
                      <th>Student Name</th>
                      <th>Department</th>
                      <th>Fees</th>
                      <th>Status</th>
                      <th>Last Paid</th>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            PANEL 4: SCHOLAR REVIEWER & MODERATION (ONLY VISIBLE TO SCHOLAR)
           ========================================================================= */}
        {currentUser.role === 'admin' && activeNav === 'admin' && !activeCourse && (
          <div>
            <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
              <span className="badge badge-gold" style={{ marginBottom: '6px' }}>Shariah Board Pipeline</span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                <i className="fas fa-user-shield" style={{ color: 'var(--color-accent-gold)' }}></i> Curriculum Moderation & Hawala Verification Queue
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                Active Scholar Reviewer: <strong>{currentUser.name}</strong> • {currentUser.designation}
              </p>
            </div>

            <div className="glass-card" style={{ padding: '24px' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Shoba</th>
                    <th>Teacher</th>
                    <th>Kitab Hawala / Citation</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map(c => (
                    <tr key={c.id}>
                      <td><strong>{c.title}</strong></td>
                      <td><span className="badge badge-teal">{c.dept}</span></td>
                      <td>{c.instructor}</td>
                      <td><code style={{ fontSize: '0.75rem' }}>{c.kitabHawala || "Classical Corpus Reference"}</code></td>
                      <td><span className="badge badge-gold">{c.status || "Published"}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="btn btn-primary btn-sm" onClick={() => alert(`Course "${c.title}" approved!`)}>
                            Approve
                          </button>
                          <button className="btn btn-outline btn-sm" onClick={() => alert(`Requested revisions for "${c.title}"`)}>
                            Revisions
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
            PUBLIC COURSES GRID (HOME ONLY)
           ========================================================================= */}
        {activeNav === 'home' && !activeCourse && (
          <section id="curriculum-grid" style={{ marginTop: '36px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Explore All Courses</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Authentic, scholar-verified Islamic learning tracks.</p>
              </div>
              <input 
                type="text" 
                className="form-input" 
                style={{ width: '260px', padding: '8px 14px' }}
                placeholder="Search courses, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
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
                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => handleEnroll(course.id)}>
                      {enrolledIds.includes(course.id) ? "Continue Learning" : "Enroll Now"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* =========================================================================
            ACTIVE LESSON PLAYER & AUDIO RECORDER
           ========================================================================= */}
        {activeCourse && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <button className="btn btn-outline btn-sm" onClick={() => setActiveCourse(null)}>
                <i className="fas fa-arrow-left"></i> Back to Dashboard
              </button>
            </div>

            <div className="glass-card" style={{ padding: '28px' }}>
              <span className="badge badge-teal">{activeCourse.dept}</span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '8px 0' }}>{activeCourse.title}</h2>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Instructor: <strong>{activeCourse.instructor}</strong>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '14px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-primary-light)' }}>
                  {activeCourse.lessons[activeLessonIndex]?.title || "Lesson Details"}
                </h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                  {activeCourse.lessons[activeLessonIndex]?.description || "Practice lesson material with tajweed rules."}
                </p>

                {/* Audio Tajweed Recorder */}
                <div style={{ background: 'rgba(13, 148, 136, 0.08)', border: '1px solid var(--border-accent)', borderRadius: '12px', padding: '18px', margin: '20px 0' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-accent-gold)' }}>
                    <i className="fas fa-microphone-alt"></i> Live Audio Tajweed Recitation Recorder
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '12px', flexWrap: 'wrap' }}>
                    <button className={`btn ${isRecording ? 'btn-ruby' : 'btn-primary'}`} onClick={toggleRecording}>
                      <i className={`fas ${isRecording ? 'fa-stop' : 'fa-microphone'}`}></i>
                      {isRecording ? ` Stop (${recordingSeconds}s)` : "Record Recitation"}
                    </button>
                    {recordedAudioUrl && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                        <audio controls src={recordedAudioUrl} style={{ height: '36px', flex: 1 }}></audio>
                        <button className="btn btn-gold" onClick={handleAudioSubmit}>
                          <i className="fas fa-paper-plane"></i> Submit for Review
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <button className="btn btn-primary btn-sm" onClick={markLessonComplete}>
                  Mark Complete & Next <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            DIGITAL LIBRARY
           ========================================================================= */}
        {activeNav === 'library' && (
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '16px' }}>Digital Research Library</h2>
            <div className="courses-grid">
              {(window.LIBRARY_DATA || []).map(b => (
                <div key={b.id} className="course-card">
                  <div className="course-card-body">
                    <span className="badge badge-gold">{b.category}</span>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '8px 0' }}>{b.title}</h3>
                    <div className="course-card-arabic">{b.titleArabic}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '8px 0' }}>
                      Author: <strong>{b.author}</strong>
                    </div>
                    <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setLibraryModal({ isOpen: true, book: b })}>
                      Read Excerpt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          MODALS & MULTI-STEP FORMS (BRD COMPLIANT)
         ========================================================================= */}

      {/* 1. COMPREHENSIVE MULTI-STEP ONBOARDING WIZARD */}
      {authModal.isOpen && (
        <div className="auth-overlay" onClick={() => setAuthModal({ ...authModal, isOpen: false })}>
          <div className="auth-modal modal-wizard" onClick={(e) => e.stopPropagation()}>
            <button className="auth-close-btn" onClick={() => setAuthModal({ ...authModal, isOpen: false })}>
              <i className="fas fa-times"></i>
            </button>

            {/* Modal Header */}
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-primary-light)' }}>
                {authModal.mode === 'signup' ? "BRD v2.0 Multi-Step Registration" : "Portal Access (Log In)"}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Structured Onboarding for Students, Independent Teachers & Madaris
              </p>
            </div>

            {/* Role Tabs */}
            <div className="auth-role-tabs">
              <button 
                type="button" 
                className={`auth-role-tab ${authModal.roleTab === 'student' ? 'active' : ''}`}
                onClick={() => setAuthModal({ ...authModal, roleTab: 'student', step: 1 })}
              >
                <i className="fas fa-user-graduate"></i> Student
              </button>
              <button 
                type="button" 
                className={`auth-role-tab ${authModal.roleTab === 'teacher' ? 'active' : ''}`}
                onClick={() => setAuthModal({ ...authModal, roleTab: 'teacher', step: 1 })}
              >
                <i className="fas fa-chalkboard-teacher"></i> Teacher
              </button>
              <button 
                type="button" 
                className={`auth-role-tab ${authModal.roleTab === 'institute' ? 'active' : ''}`}
                onClick={() => setAuthModal({ ...authModal, roleTab: 'institute', step: 1 })}
              >
                <i className="fas fa-mosque"></i> Madrasa
              </button>
            </div>

            {/* Stepper Progress Bar (Signup Only) */}
            {authModal.mode === 'signup' && (
              <div className="form-stepper">
                <div className="stepper-connector">
                  <div className="stepper-progress" style={{ width: `${((authModal.step - 1) / (authModal.roleTab === 'student' ? 2 : 3)) * 100}%` }}></div>
                </div>

                <div className={`step-item ${authModal.step >= 1 ? 'active' : ''} ${authModal.step > 1 ? 'completed' : ''}`} onClick={() => setAuthModal({ ...authModal, step: 1 })}>
                  <div className="step-circle">{authModal.step > 1 ? "✓" : "1"}</div>
                  <div className="step-label">{authModal.roleTab === 'teacher' ? 'Personal' : authModal.roleTab === 'institute' ? 'Madrasa' : 'Profile'}</div>
                </div>

                <div className={`step-item ${authModal.step >= 2 ? 'active' : ''} ${authModal.step > 2 ? 'completed' : ''}`} onClick={() => setAuthModal({ ...authModal, step: 2 })}>
                  <div className="step-circle">{authModal.step > 2 ? "✓" : "2"}</div>
                  <div className="step-label">{authModal.roleTab === 'teacher' ? 'Sanad & Docs' : authModal.roleTab === 'institute' ? 'Nazim' : 'Goals'}</div>
                </div>

                <div className={`step-item ${authModal.step >= 3 ? 'active' : ''} ${authModal.step > 3 ? 'completed' : ''}`} onClick={() => setAuthModal({ ...authModal, step: 3 })}>
                  <div className="step-circle">{authModal.step > 3 ? "✓" : "3"}</div>
                  <div className="step-label">{authModal.roleTab === 'teacher' ? 'Specialization' : authModal.roleTab === 'institute' ? 'Shobajat' : 'Safety'}</div>
                </div>

                {authModal.roleTab !== 'student' && (
                  <div className={`step-item ${authModal.step >= 4 ? 'active' : ''}`} onClick={() => setAuthModal({ ...authModal, step: 4 })}>
                    <div className="step-circle">4</div>
                    <div className="step-label">{authModal.roleTab === 'teacher' ? 'Undertaking' : 'Subdomain'}</div>
                  </div>
                )}
              </div>
            )}

            {/* FORM BODY */}
            <form onSubmit={handleMultiStepSubmit}>
              {/* === TEACHER 4-STEP WIZARD === */}
              {authModal.roleTab === 'teacher' && authModal.mode === 'signup' && (
                <div>
                  {authModal.step === 1 && (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="form-group">
                          <label className="form-label">Full Name</label>
                          <input type="text" className="form-input" placeholder="e.g. Qari Abdul Basit" required value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Email</label>
                          <input type="email" className="form-input" placeholder="teacher@domain.com" required value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="form-group">
                          <label className="form-label">Gender (Mandatory for Women's Routing)</label>
                          <select className="form-select" value={authForm.gender} onChange={(e) => setAuthForm({ ...authForm, gender: e.target.value })}>
                            <option value="Male">Male (Mardo ke courses)</option>
                            <option value="Female">Female (Strictly Khawateen Wing)</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">City & Country</label>
                          <input type="text" className="form-input" value={authForm.city} onChange={(e) => setAuthForm({ ...authForm, city: e.target.value })} />
                        </div>
                      </div>
                    </div>
                  )}

                  {authModal.step === 2 && (
                    <div>
                      <div className="form-group">
                        <label className="form-label">Islamic Qualification / Sanad</label>
                        <input type="text" className="form-input" placeholder="e.g. Aalim / Alima / Qari / Hafiz" value={authForm.qualification} onChange={(e) => setAuthForm({ ...authForm, qualification: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Darul Uloom / Jamia Name & Sanad Year</label>
                        <input type="text" className="form-input" placeholder="e.g. Darul Uloom Deoband (2021)" value={authForm.darulUloom} onChange={(e) => setAuthForm({ ...authForm, darulUloom: e.target.value })} />
                      </div>
                      <div className="file-drop-zone" onClick={() => setAuthForm({ ...authForm, uploadedSanadName: "Sanad_Al_Aalamiyyah_Verified.pdf" })}>
                        <i className="fas fa-file-upload file-drop-icon"></i>
                        <div style={{ fontWeight: 600 }}>Click to Upload Ijazah / Sanad Scan (PDF/JPG)</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Sirf Scholar verification team dekhegi</div>
                        {authForm.uploadedSanadName && (
                          <div style={{ color: 'var(--color-emerald-light)', marginTop: '8px', fontSize: '0.85rem' }}>
                            <i className="fas fa-check-circle"></i> {authForm.uploadedSanadName} (Ready)
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {authModal.step === 3 && (
                    <div>
                      <div className="form-group">
                        <label className="form-label">Teaching Specialization</label>
                        <select className="form-select" value={authForm.specialization} onChange={(e) => setAuthForm({ ...authForm, specialization: e.target.value })}>
                          <option>Quran & Tajweed (Makharij o Qirat)</option>
                          <option>Dars-e-Nizami (Sarf, Nahw, Fiqh, Hadith)</option>
                          <option>Women Section (Fiqh-e-Niswan)</option>
                          <option>Hifz-ul-Quran (Sabaq, Sabqi, Manzil)</option>
                          <option>Arabic Language & Morphology</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Demo Lesson Video Link (5-10 min)</label>
                        <input type="text" className="form-input" placeholder="https://youtube.com/... or Google Drive link" value={authForm.demoVideoUrl} onChange={(e) => setAuthForm({ ...authForm, demoVideoUrl: e.target.value })} />
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Quality & talaffuz review ke liye zaroori hai.</div>
                      </div>
                    </div>
                  )}

                  {authModal.step === 4 && (
                    <div>
                      <div className="form-group">
                        <label className="form-label">Payout UPI / Bank Details (Shariah 10% Cut)</label>
                        <input type="text" className="form-input" value={authForm.payoutUpi} onChange={(e) => setAuthForm({ ...authForm, payoutUpi: e.target.value })} />
                      </div>
                      <div style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '12px', borderRadius: '10px', margin: '14px 0', fontSize: '0.82rem' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input type="checkbox" checked={authForm.shariahUndertaking} onChange={(e) => setAuthForm({ ...authForm, shariahUndertaking: e.target.checked })} />
                          <span><strong>Content Authenticity Undertaking:</strong> Main tasdeeq karta hoon ke har sabaq me asal kitaab ka hawala diya jayega.</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
                          <input type="checkbox" checked={authForm.childSafetyAccepted} onChange={(e) => setAuthForm({ ...authForm, childSafetyAccepted: e.target.checked })} />
                          <span><strong>Child Safety Policy:</strong> 13 saal se kam umr ke talaba ke sath koi private unmonitored chat nahi hogi.</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* === MADRASA 4-STEP WIZARD === */}
              {authModal.roleTab === 'institute' && authModal.mode === 'signup' && (
                <div>
                  {authModal.step === 1 && (
                    <div>
                      <div className="form-group">
                        <label className="form-label">Madrasa / Jamia Name</label>
                        <input type="text" className="form-input" placeholder="e.g. Jamia Darul Uloom Markaz" value={authForm.instituteName} onChange={(e) => setAuthForm({ ...authForm, instituteName: e.target.value })} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="form-group">
                          <label className="form-label">Waqf / Registration No.</label>
                          <input type="text" className="form-input" value={authForm.waqfRegNo} onChange={(e) => setAuthForm({ ...authForm, waqfRegNo: e.target.value })} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Campus / City</label>
                          <input type="text" className="form-input" value={authForm.city} onChange={(e) => setAuthForm({ ...authForm, city: e.target.value })} />
                        </div>
                      </div>
                    </div>
                  )}

                  {authModal.step === 2 && (
                    <div>
                      <div className="form-group">
                        <label className="form-label">Nazim-e-Ala / Principal Name</label>
                        <input type="text" className="form-input" value={authForm.nazimName} onChange={(e) => setAuthForm({ ...authForm, nazimName: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Official Madrasa Email</label>
                        <input type="email" className="form-input" placeholder="admin@madrasa.org" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} />
                      </div>
                    </div>
                  )}

                  {authModal.step === 3 && (
                    <div>
                      <label className="form-label">Madrasa Shobajat Setup</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '8px 0 16px' }}>
                        <label><input type="checkbox" defaultChecked /> Shoba-e-Hifz-ul-Quran</label>
                        <label><input type="checkbox" defaultChecked /> Dars-e-Nizami (Aalim)</label>
                        <label><input type="checkbox" defaultChecked /> Shoba-e-Banat (Girls)</label>
                        <label><input type="checkbox" defaultChecked /> Kids Maktab Shoba</label>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Estimated Initial Faculty (Teachers)</label>
                        <input type="number" className="form-input" defaultValue="4" />
                      </div>
                    </div>
                  )}

                  {authModal.step === 4 && (
                    <div>
                      <div className="form-group">
                        <label className="form-label">Branded Subdomain Chooser</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>https://</span>
                          <input type="text" className="form-input" value={authForm.subdomain} onChange={(e) => setAuthForm({ ...authForm, subdomain: e.target.value })} style={{ width: '160px' }} />
                          <span style={{ color: 'var(--text-muted)' }}>.alnoor.edu</span>
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Free Sadaqah/Zakat Quota Percentage</label>
                        <select className="form-select">
                          <option>10% Sadaqah Free Quota</option>
                          <option>20% Sadaqah Free Quota</option>
                          <option>100% Free Waqf Education</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* === STUDENT 3-STEP WIZARD === */}
              {authModal.roleTab === 'student' && authModal.mode === 'signup' && (
                <div>
                  {authModal.step === 1 && (
                    <div>
                      <div className="form-group">
                        <label className="form-label">Student Name</label>
                        <input type="text" className="form-input" placeholder="e.g. Ahmad Raza" value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="form-group">
                          <label className="form-label">Age</label>
                          <input type="number" className="form-input" value={authForm.age} onChange={(e) => setAuthForm({ ...authForm, age: e.target.value })} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Gender (Mandatory)</label>
                          <select className="form-select" value={authForm.gender} onChange={(e) => setAuthForm({ ...authForm, gender: e.target.value })}>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {authModal.step === 2 && (
                    <div>
                      <div className="form-group">
                        <label className="form-label">Primary Islamic Learning Goal</label>
                        <select className="form-select" value={authForm.goal} onChange={(e) => setAuthForm({ ...authForm, goal: e.target.value })}>
                          <option>Quran Padhna / Nazra with Tajweed</option>
                          <option>Hifz-ul-Quran (Sabaq/Sabqi/Manzil)</option>
                          <option>Dars-e-Nizami (Aalimiyyah Program)</option>
                          <option>Arabic Language (Sarf & Nahw)</option>
                          <option>Fiqh-e-Niswan (Female Fiqh)</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input type="email" className="form-input" placeholder="student@domain.com" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} />
                      </div>
                    </div>
                  )}

                  {authModal.step === 3 && (
                    <div>
                      {parseInt(authForm.age) < 13 ? (
                        <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244,63,94,0.3)', padding: '14px', borderRadius: '12px' }}>
                          <div style={{ fontSize: '0.9rem', color: '#fb7185', fontWeight: 700, marginBottom: '6px' }}>
                            <i className="fas fa-shield-alt"></i> Under 13 Child Safety Notice (BRD Section 16)
                          </div>
                          <div className="form-group">
                            <label className="form-label">Guardian / Parent Name</label>
                            <input type="text" className="form-input" placeholder="Father / Mother Name" value={authForm.guardianName} onChange={(e) => setAuthForm({ ...authForm, guardianName: e.target.value })} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Guardian Phone / Email</label>
                            <input type="text" className="form-input" placeholder="Guardian contact for OTP" value={authForm.guardianEmail} onChange={(e) => setAuthForm({ ...authForm, guardianEmail: e.target.value })} />
                          </div>
                        </div>
                      ) : (
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                          <i className="fas fa-check-circle" style={{ fontSize: '2rem', color: '#10b981', marginBottom: '8px' }}></i>
                          <div style={{ fontWeight: 700 }}>Profile Completed!</div>
                          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            Click below to finish registration and enter your personalized student learning dashboard.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* === LOGIN SIMPLE FORM === */}
              {authModal.mode === 'login' && (
                <div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-input" placeholder="name@domain.com" required value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input type="password" className="form-input" placeholder="••••••••" required value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} />
                  </div>
                </div>
              )}

              {/* Wizard Navigation Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
                {authModal.mode === 'signup' && authModal.step > 1 ? (
                  <button type="button" className="btn btn-outline" onClick={() => setAuthModal({ ...authModal, step: authModal.step - 1 })}>
                    <i className="fas fa-arrow-left"></i> Previous Step
                  </button>
                ) : (
                  <div></div>
                )}

                {authModal.mode === 'signup' && authModal.step < (authModal.roleTab === 'student' ? 3 : 4) ? (
                  <button type="button" className="btn btn-primary" onClick={() => setAuthModal({ ...authModal, step: authModal.step + 1 })}>
                    Next Step <i className="fas fa-arrow-right"></i>
                  </button>
                ) : (
                  <button type="submit" className="btn btn-gold">
                    <i className="fas fa-check"></i> {authModal.mode === 'signup' ? "Complete Registration" : "Log In to Portal"}
                  </button>
                )}
              </div>
            </form>

            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.84rem' }}>
              {authModal.mode === 'signup' ? (
                <span>Already have an account? <a href="#login" style={{ color: 'var(--color-primary-light)', fontWeight: 600 }} onClick={(e) => { e.preventDefault(); setAuthModal({ ...authModal, mode: 'login' }); }}>Log in</a></span>
              ) : (
                <span>Need an account? <a href="#signup" style={{ color: 'var(--color-primary-light)', fontWeight: 600 }} onClick={(e) => { e.preventDefault(); setAuthModal({ ...authModal, mode: 'signup', step: 1 }); }}>Register with Multi-step Wizard</a></span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. HOMEWORK ASSIGNMENT SUBMISSION FORM */}
      {hwModal.isOpen && hwModal.homework && (
        <div className="auth-overlay" onClick={() => setHwModal({ isOpen: false, homework: null, notes: '', fileName: '' })}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <button className="auth-close-btn" onClick={() => setHwModal({ isOpen: false, homework: null, notes: '', fileName: '' })}>
              <i className="fas fa-times"></i>
            </button>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '4px' }}>
              Submit Homework: {hwModal.homework.title}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Course: {hwModal.homework.course} • Max Marks: {hwModal.homework.maxMarks}
            </p>

            <form onSubmit={handleHwSubmit}>
              <div className="form-group">
                <label className="form-label">Written Answer / Explanation Notes</label>
                <textarea className="form-textarea" rows="4" placeholder="Apna jawab ya explanation likhein..." value={hwModal.notes} onChange={(e) => setHwModal({ ...hwModal, notes: e.target.value })}></textarea>
              </div>

              <div className="file-drop-zone" onClick={() => setHwModal({ ...hwModal, fileName: "Tajweed_Written_Assignment.pdf" })}>
                <i className="fas fa-cloud-upload-alt file-drop-icon"></i>
                <div style={{ fontWeight: 600 }}>Attach Assignment File (PDF / JPG / MP3)</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Max size: 25MB (BRD Section 10)</div>
                {hwModal.fileName && (
                  <div style={{ color: 'var(--color-emerald-light)', marginTop: '8px', fontSize: '0.85rem' }}>
                    <i className="fas fa-check-circle"></i> {hwModal.fileName} attached
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>
                <i className="fas fa-paper-plane"></i> Submit to Teacher for Grading
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. ADD TEACHER MODAL FOR MADRASA */}
      {addTeacherModal && (
        <div className="auth-overlay" onClick={() => setAddTeacherModal(false)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <button className="auth-close-btn" onClick={() => setAddTeacherModal(false)}>
              <i className="fas fa-times"></i>
            </button>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px' }}>
              Add Teacher to Madrasa Faculty
            </h3>
            <form onSubmit={handleAddTeacherToInstitute}>
              <div className="form-group">
                <label className="form-label">Teacher Full Name</label>
                <input type="text" className="form-input" placeholder="e.g. Maulana Muhammad Anas" required value={newTeacherForm.name} onChange={(e) => setNewTeacherForm({ ...newTeacherForm, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Designation</label>
                <input type="text" className="form-input" placeholder="e.g. Ustad-e-Hadees / Muallim-e-Hifz" required value={newTeacherForm.designation} onChange={(e) => setNewTeacherForm({ ...newTeacherForm, designation: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Sanad</label>
                <input type="text" className="form-input" placeholder="e.g. Al-Shahadat-ul-Aalamiyyah" required value={newTeacherForm.sanad} onChange={(e) => setNewTeacherForm({ ...newTeacherForm, sanad: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                Add Teacher
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. COURSE STUDIO MODAL */}
      {courseStudio.isOpen && (
        <div className="auth-overlay" onClick={() => setCourseStudio({ ...courseStudio, isOpen: false })}>
          <div className="auth-modal" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <button className="auth-close-btn" onClick={() => setCourseStudio({ ...courseStudio, isOpen: false })}>
              <i className="fas fa-times"></i>
            </button>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px' }}>
              Create New Course (BRD Flow 3)
            </h3>
            <form onSubmit={handleCreateCourseSubmit}>
              <div className="form-group">
                <label className="form-label">Course Title</label>
                <input type="text" className="form-input" placeholder="e.g. Ahkam-e-Tajweed & Makharij" required value={courseStudio.title} onChange={(e) => setCourseStudio({ ...courseStudio, title: e.target.value })} />
              </div>
              <div className="kitab-hawala-box">
                <label className="form-label" style={{ color: 'var(--color-accent-gold)' }}>
                  <i className="fas fa-scroll"></i> Kitab ka Hawala / Authentic Source Reference (Mandatory)
                </label>
                <input type="text" className="form-input" placeholder="e.g. Al-Jazariyyah, Durr-e-Mukhtar, Hidayah" required value={courseStudio.kitabHawala} onChange={(e) => setCourseStudio({ ...courseStudio, kitabHawala: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-gold" style={{ width: '100%', marginTop: '10px' }}>
                Submit for Scholar Review
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. VERIFIABLE CERTIFICATE MODAL */}
      {certModal.isOpen && (
        <div className="auth-overlay" onClick={() => setCertModal({ ...certModal, isOpen: false })}>
          <div className="auth-modal" style={{ maxWidth: '650px', border: '2px solid var(--border-gold)' }} onClick={(e) => e.stopPropagation()}>
            <button className="auth-close-btn" onClick={() => setCertModal({ ...certModal, isOpen: false })}>
              <i className="fas fa-times"></i>
            </button>
            <div style={{ textAlign: 'center', border: '2px dashed var(--border-gold)', padding: '24px', borderRadius: '14px' }}>
              <div style={{ fontSize: '1.8rem', color: 'var(--color-accent-gold)', marginBottom: '8px' }}>
                <i className="fas fa-certificate"></i>
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-accent-gold)' }}>
                Official Certificate of Course Completion
              </h3>
              <div style={{ margin: '16px 0' }}>
                <div>This certifies that the student</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: '4px 0' }}>{certModal.studentName}</div>
                <div>has mastered the curriculum of</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-primary-light)', marginTop: '4px' }}>
                  {certModal.course ? certModal.course.title : "Noorani Qaida & Tajweed"}
                </div>
                <div style={{ marginTop: '8px', color: 'var(--color-emerald-light)' }}>
                  Grade: <strong>{certModal.grade}</strong> • Attendance: <strong>92% (Met 75% Rule)</strong>
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-gold)', paddingTop: '12px' }}>
                Certificate ID: <code>CERT-2026-00892</code> • Verification: <code>alnoor.edu/verify/00892</code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. DIGITAL LIBRARY MODAL */}
      {libraryModal.isOpen && libraryModal.book && (
        <div className="auth-overlay" onClick={() => setLibraryModal({ isOpen: false, book: null })}>
          <div className="auth-modal" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <button className="auth-close-btn" onClick={() => setLibraryModal({ isOpen: false, book: null })}>
              <i className="fas fa-times"></i>
            </button>
            <span className="badge badge-gold">{libraryModal.book.category}</span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '8px 0 4px' }}>{libraryModal.book.title}</h3>
            <div className="course-card-arabic">{libraryModal.book.titleArabic}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Author: <strong>{libraryModal.book.author}</strong>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '10px', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: '16px' }}>
              {libraryModal.book.excerpt || "Verified scholarly manuscript excerpt."}
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
            Islamic LMS BRD v2.0 Compliant Platform • Dedicated Portals for Students, Independent Teachers, Connected Madaris & Scholar Review Board.
          </p>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            © 2026 Al-Noor Open Source Academy • Quran, Tajweed, Fiqh, Arabic & Live Auto Attendance Engine
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
