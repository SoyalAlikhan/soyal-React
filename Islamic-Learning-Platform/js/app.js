// Master Application Script with React 18
const { useState, useEffect, useRef } = React;

function App() {
  // Global State
  const [lang, setLang] = useState('ru'); // 'ru' (Roman Urdu), 'en', 'ur'
  const [role, setRole] = useState('student'); // 'student', 'teacher', 'admin'
  const [activeNav, setActiveNav] = useState('home');
  const [selectedDept, setSelectedDept] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
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
      status: "Upcoming",
      link: "https://meet.google.com/islamic-learn-demo"
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

  // Audio Recording Toggle
  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setRecordedAudioUrl(null);
    } else {
      setIsRecording(false);
      // Simulated audio playback URL from recitation source
      setRecordedAudioUrl("https://everyayah.com/data/Husary_128kbps/001001.mp3");
    }
  };

  const handleAudioSubmit = () => {
    if (!recordedAudioUrl) return;
    const newSub = {
      id: "sub-" + Date.now(),
      studentName: "Ahmad Raza (You)",
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
            <i className="fas fa-book-reader"></i> {t.navLibrary}
          </li>
          <li className={`nav-link ${activeNav === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveNav('dashboard'); setActiveCourse(null); }}>
            <i className="fas fa-user-graduate"></i> {t.navDashboard}
          </li>
        </ul>

        <div className="nav-controls">
          {/* Role Switcher */}
          <div className="role-pill">
            <button 
              className={`role-btn ${role === 'student' ? 'active' : ''}`} 
              onClick={() => setRole('student')}
              title="Switch to Student Portal"
            >
              <i className="fas fa-user"></i> {t.roleStudent}
            </button>
            <button 
              className={`role-btn ${role === 'teacher' ? 'active' : ''}`} 
              onClick={() => { setRole('teacher'); setActiveNav('teacher'); }}
              title="Switch to Teacher Evaluation Portal"
            >
              <i className="fas fa-chalkboard-teacher"></i> {t.roleTeacher}
            </button>
            <button 
              className={`role-btn ${role === 'admin' ? 'active' : ''}`} 
              onClick={() => { setRole('admin'); setActiveNav('admin'); }}
              title="Switch to Scholar Review & Admin Portal"
            >
              <i className="fas fa-user-shield"></i> {t.roleAdmin}
            </button>
          </div>

          {/* Language Selector */}
          <select 
            className="lang-select" 
            value={lang} 
            onChange={(e) => setLang(e.target.value)}
          >
            <option value="ru">Roman Urdu</option>
            <option value="en">English</option>
            <option value="ur">اردو (Urdu)</option>
          </select>
        </div>
      </nav>

      {/* 2. HERO BANNER (When on Home & No active course selected) */}
      {activeNav === 'home' && !activeCourse && (
        <header className="hero-section">
          <div className="hero-badge">
            <span className="badge badge-gold">
              <i className="fas fa-certificate"></i> {t.heroBadge}
            </span>
          </div>

          <div className="hero-verse">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ • اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ
          </div>

          <h1 className="hero-title">
            {t.heroTitlePrefix} <span className="highlight">{t.heroTitleHighlight}</span>
          </h1>

          <p className="hero-desc">
            {t.heroSubtitle}
          </p>

          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={() => {
              const el = document.getElementById('curriculum-grid');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}>
              <i className="fas fa-compass"></i> {t.heroExploreBtn}
            </button>
            <button className="btn btn-gold btn-lg" onClick={() => setActiveNav('dashboard')}>
              <i className="fas fa-user-circle"></i> {t.heroDashboardBtn}
            </button>
          </div>

          {/* Platform Statistics */}
          <div className="stats-bar">
            <div className="stat-item">
              <div className="stat-number">12,500+</div>
              <div className="stat-label">{t.statsLearners}</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">45+</div>
              <div className="stat-label">{t.statsCourses}</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">30+</div>
              <div className="stat-label">{t.statsScholars}</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">1,200+</div>
              <div className="stat-label">{t.statsBooks}</div>
            </div>
          </div>
        </header>
      )}

      {/* 3. MAIN CONTENT ROUTER */}
      <main className="app-container">

        {/* VIEW A: ACTIVE COURSE PLAYER (Interactive Lesson, Audio Tajweed Recorder & Quiz) */}
        {activeCourse && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <button className="btn btn-outline" onClick={() => setActiveCourse(null)}>
                <i className="fas fa-arrow-left"></i> {lang === 'ur' ? 'کورسز کی طرف واپس' : 'Back to Courses'}
              </button>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span className="badge badge-teal">
                  <i className="fas fa-tasks"></i> {courseProgress[activeCourse.id] || 0}% Completed
                </span>
                {(courseProgress[activeCourse.id] || 0) >= 80 && (
                  <button 
                    className="btn btn-gold btn-sm"
                    onClick={() => setCertModal({ isOpen: true, course: activeCourse, studentName: "Ahmad Raza", grade: "Mumtaz (A+)" })}
                  >
                    <i className="fas fa-award"></i> {t.viewCertificate}
                  </button>
                )}
              </div>
            </div>

            <div className="player-container">
              {/* Main Learning Area */}
              <div className="player-main">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div>
                    <span className="badge badge-gold" style={{ marginBottom: '8px' }}>
                      {activeCourse.level} • {activeCourse.duration}
                    </span>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
                      {activeCourse.lessons[activeLessonIndex]?.title || "Course Lesson"}
                    </h2>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                      <i className="fas fa-chalkboard-teacher"></i> Instructor: {activeCourse.instructor} | <i className="fas fa-check-double"></i> Reviewer: {activeCourse.scholarReviewer}
                    </div>
                  </div>
                </div>

                {/* Lesson Media / Quran Audio Bar */}
                <div className="glass-card" style={{ padding: '20px', marginBottom: '24px', background: 'rgba(6, 78, 59, 0.2)', borderColor: 'var(--border-accent)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="course-icon-box" style={{ width: '40px', height: '40px' }}>
                        <i className="fas fa-volume-up"></i>
                      </div>
                      <div>
                        <div style={{ fontWeight: 700 }}>Recitation Audio Reference (Shaykh Al-Husary)</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Listen carefully to the authentic Tajweed pronunciation before recording</div>
                      </div>
                    </div>
                  </div>
                  <audio 
                    controls 
                    style={{ width: '100%', borderRadius: '8px', outline: 'none' }}
                    src={activeCourse.lessons[activeLessonIndex]?.audioSample}
                  ></audio>
                </div>

                {/* Lesson Notes & Explanation */}
                <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fas fa-book"></i> {lang === 'ur' ? 'سبق کے نوٹس اور رہنمائی' : 'Lesson Notes & Explanation'}
                  </h3>
                  <p style={{ color: 'var(--text-primary)', fontSize: '1rem', lineHeight: '1.8' }}>
                    {activeCourse.lessons[activeLessonIndex]?.notes}
                  </p>
                </div>

                {/* INTERACTIVE TAJWEED AUDIO RECORDER (BRD Section 14) */}
                <div className="recorder-box">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span className="badge badge-ruby">
                      <i className="fas fa-microphone-alt"></i> BRD Section 14: Audio Recitation & Tajweed Practice
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '8px 0' }}>
                    {t.recordRecitation}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '580px', margin: '0 auto 16px' }}>
                    {t.audioPracticePrompt}
                  </p>

                  {/* Soundwave animation */}
                  <div className={`wave-animation ${isRecording ? 'recording-active' : ''}`}>
                    <div className="wave-bar"></div>
                    <div className="wave-bar"></div>
                    <div className="wave-bar"></div>
                    <div className="wave-bar"></div>
                    <div className="wave-bar"></div>
                    <div className="wave-bar"></div>
                    <div className="wave-bar"></div>
                    <div className="wave-bar"></div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    <button 
                      className={`btn ${isRecording ? 'btn-primary' : 'btn-gold'} btn-lg`}
                      onClick={toggleRecording}
                      style={{ minWidth: '180px' }}
                    >
                      <i className={`fas ${isRecording ? 'fa-stop-circle' : 'fa-microphone'}`}></i>
                      {isRecording ? `Stop (${recordingSeconds}s)` : t.recordRecitation}
                    </button>

                    {recordedAudioUrl && (
                      <button className="btn btn-primary btn-lg" onClick={handleAudioSubmit}>
                        <i className="fas fa-paper-plane"></i> {t.submitRecitation}
                      </button>
                    )}
                  </div>

                  {recordedAudioUrl && (
                    <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-emerald-light)' }}>
                        <i className="fas fa-check-circle"></i> Recitation Recorded! Listen back:
                      </span>
                      <audio controls src={recordedAudioUrl} style={{ height: '36px' }}></audio>
                    </div>
                  )}
                </div>

                {/* INTERACTIVE LESSON QUIZ (BRD Section 13) */}
                {activeCourse.lessons[activeLessonIndex]?.quiz && (
                  <div className="glass-card" style={{ padding: '24px', marginTop: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                        <i className="fas fa-question-circle" style={{ color: 'var(--color-accent-gold)' }}></i> {t.startQuiz} ({activeCourse.lessons[activeLessonIndex].quiz.length} Questions)
                      </h3>
                      {quizSubmitted && (
                        <span className={`badge ${quizScore >= 70 ? 'badge-emerald' : 'badge-ruby'}`}>
                          Score: {quizScore}% {quizScore >= 70 ? 'Passed' : 'Try Again'}
                        </span>
                      )}
                    </div>

                    {activeCourse.lessons[activeLessonIndex].quiz.map((q, qIndex) => (
                      <div key={qIndex} style={{ marginBottom: '20px', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.98rem', marginBottom: '12px' }}>
                          {qIndex + 1}. {q.question}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          {q.options.map((opt, optIndex) => {
                            const isSelected = quizAnswers[qIndex] === optIndex;
                            const isCorrect = q.answer === optIndex;
                            let btnBg = 'rgba(255,255,255,0.05)';
                            if (quizSubmitted) {
                              if (isCorrect) btnBg = 'rgba(16, 185, 129, 0.3)';
                              else if (isSelected && !isCorrect) btnBg = 'rgba(244, 63, 94, 0.3)';
                            } else if (isSelected) {
                              btnBg = 'rgba(20, 184, 166, 0.25)';
                            }

                            return (
                              <button
                                key={optIndex}
                                onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, [qIndex]: optIndex })}
                                style={{
                                  padding: '10px 14px',
                                  textAlign: 'left',
                                  background: btnBg,
                                  border: isSelected ? '1px solid var(--color-primary-light)' : '1px solid var(--border-subtle)',
                                  borderRadius: '8px',
                                  color: 'var(--text-primary)',
                                  cursor: quizSubmitted ? 'default' : 'pointer',
                                  fontSize: '0.88rem'
                                }}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                        {quizSubmitted && (
                          <div style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--color-emerald-light)' }}>
                            <i className="fas fa-info-circle"></i> <strong>Wazahat:</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    ))}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                      {!quizSubmitted ? (
                        <button 
                          className="btn btn-primary"
                          onClick={() => handleQuizSubmit(activeCourse.lessons[activeLessonIndex].quiz)}
                        >
                          <i className="fas fa-check"></i> Submit Quiz Answers
                        </button>
                      ) : (
                        <button 
                          className="btn btn-gold"
                          onClick={markLessonComplete}
                        >
                          <i className="fas fa-forward"></i> Complete & Next Lesson
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar: Course Curriculum Navigation */}
              <div className="player-sidebar">
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', color: 'var(--color-accent-gold)' }}>
                  <i className="fas fa-list-ol"></i> Course Modules ({activeCourse.lessons.length} Lessons)
                </h4>
                {activeCourse.lessons.map((lesson, idx) => (
                  <div 
                    key={lesson.id}
                    className={`lesson-list-item ${idx === activeLessonIndex ? 'active' : ''}`}
                    onClick={() => {
                      setActiveLessonIndex(idx);
                      setQuizAnswers({});
                      setQuizSubmitted(false);
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{idx + 1}. {lesson.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <i className="far fa-clock"></i> {lesson.duration}
                      </div>
                    </div>
                    {idx < activeLessonIndex ? (
                      <i className="fas fa-check-circle" style={{ color: 'var(--color-emerald)' }}></i>
                    ) : idx === activeLessonIndex ? (
                      <i className="fas fa-play-circle" style={{ color: 'var(--color-accent-gold)' }}></i>
                    ) : (
                      <i className="fas fa-lock" style={{ color: 'var(--text-muted)' }}></i>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW B: HOME CURRICULUM CATALOG */}
        {activeNav === 'home' && !activeCourse && (
          <div id="curriculum-grid">
            {/* Search & Filter Bar */}
            <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ position: 'relative', flex: '1', minWidth: '280px' }}>
                <i className="fas fa-search" style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--text-muted)' }}></i>
                <input 
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 44px',
                    borderRadius: '10px',
                    background: 'rgba(0,0,0,0.25)',
                    border: '1px solid var(--border-light)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '0.92rem'
                  }}
                />
              </div>

              {/* Department Quick Filter */}
              <div className="dept-tabs-wrapper" style={{ margin: 0, padding: 0 }}>
                <div className={`dept-tab ${selectedDept === 'all' ? 'active' : ''}`} onClick={() => setSelectedDept('all')}>
                  {t.allCourses}
                </div>
                <div className={`dept-tab ${selectedDept === 'quran' ? 'active' : ''}`} onClick={() => setSelectedDept('quran')}>
                  <i className="fas fa-quran"></i> {t.deptQuran}
                </div>
                <div className={`dept-tab ${selectedDept === 'kids' ? 'active' : ''}`} onClick={() => setSelectedDept('kids')}>
                  <i className="fas fa-child"></i> {t.deptKids}
                </div>
                <div className={`dept-tab ${selectedDept === 'women' ? 'active' : ''}`} onClick={() => setSelectedDept('women')}>
                  <i className="fas fa-female"></i> {t.deptWomen}
                </div>
                <div className={`dept-tab ${selectedDept === 'arabic' ? 'active' : ''}`} onClick={() => setSelectedDept('arabic')}>
                  <i className="fas fa-language"></i> {t.deptArabic}
                </div>
                <div className={`dept-tab ${selectedDept === 'islamic-studies' ? 'active' : ''}`} onClick={() => setSelectedDept('islamic-studies')}>
                  <i className="fas fa-mosque"></i> {t.deptIslamicStudies}
                </div>
                <div className={`dept-tab ${selectedDept === 'aalim' ? 'active' : ''}`} onClick={() => setSelectedDept('aalim')}>
                  <i className="fas fa-graduation-cap"></i> {t.deptAalim}
                </div>
              </div>
            </div>

            {/* Courses Grid */}
            <div className="courses-grid">
              {filteredCourses.map(course => {
                const isEnrolled = enrolledIds.includes(course.id);
                const prog = courseProgress[course.id] || 0;

                return (
                  <div key={course.id} className="course-card">
                    <div className="course-card-header">
                      <div className="course-icon-box">
                        <i className={
                          course.dept === 'quran' ? 'fas fa-book-open' :
                          course.dept === 'kids' ? 'fas fa-shapes' :
                          course.dept === 'women' ? 'fas fa-heart' :
                          course.dept === 'arabic' ? 'fas fa-pen-nib' :
                          course.dept === 'aalim' ? 'fas fa-university' : 'fas fa-star-and-crescent'
                        }></i>
                      </div>
                      <span className="badge badge-teal">
                        {course.level}
                      </span>
                    </div>

                    <div className="course-card-body">
                      {course.titleArabic && (
                        <div className="course-title-arabic">{course.titleArabic}</div>
                      )}
                      <h3 className="course-title">{course.title}</h3>
                      <p className="course-desc">{course.description}</p>

                      <div className="course-meta">
                        <span><i className="far fa-clock"></i> {course.duration}</span>
                        <span><i className="fas fa-layer-group"></i> {course.lessonsCount} Lessons</span>
                        <span><i className="fas fa-user-check"></i> {course.instructor.split(' ')[0]}</span>
                      </div>

                      {isEnrolled && (
                        <div style={{ marginTop: '14px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>{t.progress}</span>
                            <span style={{ color: 'var(--color-primary-light)', fontWeight: 700 }}>{prog}%</span>
                          </div>
                          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${prog}%`, height: '100%', background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent-gold))' }}></div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="course-card-footer">
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-accent-gold)' }}>
                        <i className="fas fa-shield-alt"></i> {course.reviewStatus}
                      </span>
                      {isEnrolled ? (
                        <button className="btn btn-primary btn-sm" onClick={() => handleEnroll(course.id)}>
                          <i className="fas fa-play"></i> {t.continueLearning}
                        </button>
                      ) : (
                        <button className="btn btn-gold btn-sm" onClick={() => handleEnroll(course.id)}>
                          <i className="fas fa-plus-circle"></i> {t.enrollNow}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW C: STUDENT DASHBOARD */}
        {activeNav === 'dashboard' && !activeCourse && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                  <i className="fas fa-user-graduate" style={{ color: 'var(--color-primary-light)' }}></i> {t.studentDashboard}
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Assalamu Alaikum, Ahmad Raza! Track your learning journey, recitation submissions, and certificates.
                </p>
              </div>
              <button 
                className="btn btn-gold"
                onClick={() => setCertModal({ isOpen: true, course: courses[0], studentName: "Ahmad Raza", grade: "Mumtaz (A+)" })}
              >
                <i className="fas fa-award"></i> {t.certificates}
              </button>
            </div>

            {/* Top Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase' }}>{t.myCourses}</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary-light)', marginTop: '6px' }}>{enrolledIds.length}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-emerald-light)' }}><i className="fas fa-check-circle"></i> Active & On Track</div>
              </div>
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase' }}>Tajweed Recitations</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-accent-gold)', marginTop: '6px' }}>{audioSubmissions.length}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>1 Graded, 1 Under Review</div>
              </div>
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase' }}>Average Quiz Score</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8', marginTop: '6px' }}>94%</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-emerald-light)' }}><i className="fas fa-arrow-up"></i> Outstanding Mastery</div>
              </div>
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase' }}>Upcoming Live Halaqah</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginTop: '10px' }}>Tonight 8:30 PM</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-accent-gold)' }}>Tajweed Rules with Qari Abdul Basit</div>
              </div>
            </div>

            {/* Enrolled Courses Progress */}
            <div className="glass-card" style={{ padding: '24px', marginBottom: '28px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>
                <i className="fas fa-book-reader"></i> My Learning In Progress
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

            {/* Audio Recitation Feedback History (BRD Section 14) */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>
                <i className="fas fa-microphone-alt"></i> My Tajweed Recitation Submissions & Teacher Feedback
              </h3>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Course & Sabaq</th>
                    <th>Submitted At</th>
                    <th>Status</th>
                    <th>Grade</th>
                    <th>Teacher Feedback & Tajweed Tags</th>
                  </tr>
                </thead>
                <tbody>
                  {audioSubmissions.map(sub => (
                    <tr key={sub.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{sub.courseTitle}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{sub.lessonTitle}</div>
                      </td>
                      <td>{sub.timestamp}</td>
                      <td>
                        <span className={`badge ${sub.status === 'Graded' ? 'badge-emerald' : 'badge-gold'}`}>
                          {sub.status}
                        </span>
                      </td>
                      <td><strong>{sub.grade || "—"}</strong></td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                          {sub.feedbackTags?.map((tag, i) => (
                            <span key={i} className="badge badge-teal" style={{ fontSize: '0.7rem' }}>{tag}</span>
                          ))}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{sub.teacherNote}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW D: TEACHER EVALUATION & LIVE CLASSES PORTAL (BRD Section 11 & 15) */}
        {role === 'teacher' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                  <i className="fas fa-chalkboard-teacher" style={{ color: 'var(--color-primary-light)' }}></i> {t.teacherPortal}
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Evaluate student recitations, give targeted Tajweed feedback (Makharij, Ghunnah, Madd), and host live sessions.
                </p>
              </div>
              <button className="btn btn-gold" onClick={() => {
                const title = prompt("Enter Live Class Topic:", "Weekly Tajweed Q&A & Nazra Correction");
                if (title) {
                  setLiveClasses([
                    ...liveClasses,
                    {
                      id: "live-" + Date.now(),
                      title,
                      instructor: "Sheikh Mansoor Al-Azhari (You)",
                      date: "Tonight 09:00 PM PKT",
                      enrolled: 25,
                      status: "Scheduled",
                      link: "https://meet.google.com/islamic-learn-demo"
                    }
                  ]);
                }
              }}>
                <i className="fas fa-video"></i> {t.scheduleClass}
              </button>
            </div>

            {/* Student Audio Recitation Grading Queue */}
            <div className="glass-card" style={{ padding: '24px', marginBottom: '28px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>
                <i className="fas fa-headphones"></i> Pending Tajweed Recitations to Evaluate
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

                  {/* Audio Player for Teacher */}
                  <div style={{ margin: '14px 0', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <audio controls src="https://everyayah.com/data/Husary_128kbps/001001.mp3" style={{ height: '36px', flex: 1 }}></audio>
                  </div>

                  {/* Targeted Feedback Tags */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Select Tajweed Feedback Tags:</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span className="feedback-tag selected">{t.tagMakharij}</span>
                      <span className="feedback-tag selected">{t.tagGhunnah}</span>
                      <span className="feedback-tag">{t.tagMadd}</span>
                      <span className="feedback-tag">{t.tagQalqalah}</span>
                      <span className="feedback-tag">{t.tagWaqf}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
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
                      <i className="fas fa-check-circle"></i> Grade Recitation & Submit Feedback
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Scheduled Live Sessions */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>
                <i className="fas fa-broadcast-tower"></i> {t.liveClasses}
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
                    <a href={live.link} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
                      <i className="fas fa-video"></i> {t.joinClass}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW E: ADMIN & SCHOLAR WORKFLOW PORTAL (BRD Section 20 & 21) */}
        {role === 'admin' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                  <i className="fas fa-user-shield" style={{ color: 'var(--color-accent-gold)' }}></i> {t.adminPortal}
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {t.contentWorkflow}: Content Author → Academic Review → Scholar Approval → Published.
                </p>
              </div>
            </div>

            {/* Platform Analytics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>TOTAL ENROLLMENTS</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary-light)' }}>14,820</div>
              </div>
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>COMPLETION RATE</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-accent-gold)' }}>88.4%</div>
              </div>
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>CERTIFICATES ISSUED</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8' }}>3,410</div>
              </div>
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>OPEN SOURCE SCHOLARS</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-emerald-light)' }}>32 Active</div>
              </div>
            </div>

            {/* Curriculum Review Workflow Table */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>
                <i className="fas fa-clipboard-check"></i> Course Moderation Pipeline
              </h3>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Course Title</th>
                    <th>Department</th>
                    <th>Author / Teacher</th>
                    <th>Assigned Scholar Reviewer</th>
                    <th>Current Status</th>
                    <th>Workflow Action</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map(course => (
                    <tr key={course.id}>
                      <td>
                        <strong>{course.title}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{course.titleArabic}</div>
                      </td>
                      <td>
                        <span className="badge badge-teal">{course.dept}</span>
                      </td>
                      <td>{course.instructor}</td>
                      <td>
                        <span style={{ color: 'var(--color-accent-gold)', fontWeight: 600 }}>
                          {course.scholarReviewer}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-emerald">
                          <i className="fas fa-check-circle"></i> {course.reviewStatus}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn btn-outline btn-sm"
                          onClick={() => alert(`Academic Audit for "${course.title}" passed. Verification seal stamped by ${course.scholarReviewer}.`)}
                        >
                          <i className="fas fa-stamp"></i> Verify Audit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW F: DIGITAL LIBRARY & RESEARCH (BRD Section 16 & 23) */}
        {activeNav === 'library' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                  <i className="fas fa-book-reader" style={{ color: 'var(--color-accent-gold)' }}></i> {t.navLibrary} & Research Manuscripts
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Authentic Islamic literature, Hadith sources, Tafseer, and research papers with complete citation metadata.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {(window.LIBRARY_DATA || []).map(book => (
                <div key={book.id} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <span className="badge badge-gold">{book.subject}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{book.pages} Pages</span>
                  </div>

                  <div className="arabic-text" style={{ fontSize: '1.2rem', color: 'var(--color-accent-gold-light)', marginBottom: '6px' }}>
                    {book.titleArabic}
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>
                    {book.title}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-primary-light)', fontWeight: 600, marginBottom: '10px' }}>
                    Author: {book.author}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', flex: 1, marginBottom: '16px' }}>
                    {book.description}
                  </p>

                  <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <i className="fas fa-balance-scale"></i> {book.license}
                    </span>
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => setLibraryModal({ isOpen: true, book })}
                    >
                      <i className="fas fa-book-open"></i> Read Excerpt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* 4. VERIFIABLE CERTIFICATE MODAL (BRD Section 19) */}
      {certModal.isOpen && (
        <div className="modal-overlay" onClick={() => setCertModal({ ...certModal, isOpen: false })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '820px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                <i className="fas fa-award" style={{ color: 'var(--color-accent-gold)' }}></i> {t.certificateOfCompletion}
              </h3>
              <button 
                onClick={() => setCertModal({ ...certModal, isOpen: false })}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '1.4rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <div className="modal-body">
              <div className="certificate-frame" id="printable-certificate">
                <div className="certificate-border-inner">
                  <div className="cert-header">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
                  <div className="cert-title">{t.certificateOfCompletion}</div>

                  <p style={{ fontSize: '0.95rem', color: '#475569', marginTop: '12px' }}>
                    {t.certifiedThat}
                  </p>

                  <div className="cert-name">
                    {certModal.studentName}
                  </div>

                  <p style={{ fontSize: '0.95rem', color: '#475569', maxWidth: '520px', margin: '0 auto' }}>
                    {t.hasCompleted}:
                  </p>

                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#064e3b', margin: '12px 0 6px' }}>
                    {certModal.course?.title || "Noorani Qaida & Harakat Foundation"}
                  </h3>
                  <div style={{ fontStyle: 'italic', color: '#d97706', fontWeight: 600 }}>
                    Grade: {certModal.grade} • Verified with Distinction
                  </div>

                  <div className="cert-footer-grid">
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>Qari Abdul Basit</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Chief Tajweed Examiner</div>
                    </div>

                    {/* QR Code Verification Preview */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '80px', height: '80px', background: '#064e3b', borderRadius: '8px', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                        <i className="fas fa-qrcode" style={{ fontSize: '3.5rem', color: '#ffffff' }}></i>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                        ID: ALN-2026-9821
                      </div>
                    </div>

                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>Mufti Muhammad Salman</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Scholar Accreditation Board</div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '18px' }}>
                    {t.issuedBy} • {t.verificationPrompt}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setCertModal({ ...certModal, isOpen: false })}>
                Close
              </button>
              <button className="btn btn-gold" onClick={() => window.print()}>
                <i className="fas fa-print"></i> Print / Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. LIBRARY EXCERPT MODAL */}
      {libraryModal.isOpen && libraryModal.book && (
        <div className="modal-overlay" onClick={() => setLibraryModal({ ...libraryModal, isOpen: false })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{libraryModal.book.title}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-accent-gold)' }}>{libraryModal.book.author}</div>
              </div>
              <button 
                onClick={() => setLibraryModal({ ...libraryModal, isOpen: false })}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '1.4rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="arabic-text" style={{ fontSize: '1.3rem', color: 'var(--color-accent-gold-light)', marginBottom: '14px', lineHeight: '2' }}>
                {libraryModal.book.titleArabic}
              </div>
              <div style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', fontSize: '0.95rem', lineHeight: '1.8' }}>
                <p><strong>Kitab ka Iqtibaas (Excerpt):</strong></p>
                <p style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>{libraryModal.book.excerpt}</p>
              </div>
              <div style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <strong>Edition:</strong> {libraryModal.book.edition} | <strong>License:</strong> {libraryModal.book.license}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setLibraryModal({ ...libraryModal, isOpen: false })}>
                Done Reading
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. FOOTER */}
      <footer style={{ marginTop: '64px', borderTop: '1px solid var(--border-subtle)', padding: '36px 24px', textAlign: 'center', background: 'rgba(4, 10, 18, 0.7)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary-light)', marginBottom: '8px' }}>
            {t.brandName}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '16px' }}>
            Open Source Islamic Education Platform developed per the BRD guidelines. Empowering learners globally with authentic, referenced, and scholar-reviewed Islamic curriculum.
          </p>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            © 2026 Al-Noor Open Source Academy • Quran, Tajweed, Fiqh, Arabic & Higher Islamic Studies
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
