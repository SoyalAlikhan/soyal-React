// Comprehensive Course Catalog implementing all BRD Sections
window.COURSES_DATA = [
  // ================= 1. QURAN & TAJWEED =================
  {
    id: "quran-101",
    dept: "quran",
    title: "Noorani Qaida & Harakat Foundation",
    titleArabic: "القاعدة النورانية ومخارج الحروف",
    level: "Beginner",
    duration: "6 Weeks",
    lessonsCount: 16,
    instructor: "Qari Abdul Basit Siddiqui",
    scholarReviewer: "Mufti Muhammad Salman",
    reviewStatus: "Published",
    enrolledCount: 1420,
    rating: 4.9,
    description: "Beginners ke liye huroof ki pehchan, makharij ka sahi talaffuz, harakat (zabr, zair, pesh) aur tanween ki mashq.",
    lessons: [
      {
        id: "les-q1",
        title: "Lesson 1: Mufradaat (Single Letters) & Makharij",
        duration: "18 mins",
        audioSample: "https://everyayah.com/data/Husary_128kbps/001001.mp3",
        notes: "Halq (throat), Zaban (tongue) aur Hont (lips) se ada hone wale 29 huroof ki sahi simt aur awaz.",
        quiz: [
          {
            question: "Harf 'خ' (Kha) aur 'غ' (Ghain) kahan se ada hote hain?",
            options: ["Aqsa-e-Halq (Throat bottom)", "Adna-e-Halq (Top of throat)", "Wasat-e-Halq (Middle throat)", "Zaban ki nok se"],
            answer: 1,
            explanation: "Kha aur Ghain Adna-e-Halq yani gale ke oopri hisse se ada hote hain."
          },
          {
            question: "Huroof-e-Halaqi ki kul tadaad kitni hai?",
            options: ["4", "6", "8", "10"],
            answer: 1,
            explanation: "Huroof-e-Halaqi 6 hain: ء ه ع ح غ خ"
          }
        ]
      },
      {
        id: "les-q2",
        title: "Lesson 2: Murakkabaat (Compound Letters)",
        duration: "22 mins",
        audioSample: "https://everyayah.com/data/Husary_128kbps/001002.mp3",
        notes: "Mili hui shaklein: Alif, Ba, Ta, Sa ko mukhtalif murakkab shaklon mein pehchan'na.",
        quiz: [
          {
            question: "Jab Baa kisi doosre harf ke sath jurta hai to kitne nukte rehte hain?",
            options: ["Neeche 1 nukta", "Ooper 2 nukte", "Ooper 1 nukta", "Neeche 2 nukte"],
            answer: 0,
            explanation: "Baa ki pehchan hamesha neeche 1 nukta hona hai."
          }
        ]
      },
      {
        id: "les-q3",
        title: "Lesson 3: Harakat (Zabr, Zair, Pesh)",
        duration: "20 mins",
        audioSample: "https://everyayah.com/data/Husary_128kbps/001003.mp3",
        notes: "Harakat ko baghair kheenche, jhatka diye baghair ma'roof parhna.",
        quiz: [
          {
            question: "Harakat wale harf ko kitna kheenchna chahiye?",
            options: ["1 Alif ke barabar", "2 Alif ke barabar", "Bilkul nahi kheenchna", "Aadha Alif"],
            answer: 2,
            explanation: "Harakat ko bilkul nahi kheenchte, jaldi aur ma'roof parhte hain."
          }
        ]
      }
    ]
  },
  {
    id: "quran-102",
    dept: "quran",
    title: "Tajweed Foundation & Rules of Noon Sakin",
    titleArabic: "أحكام التجويد والنون الساكنة والتنوين",
    level: "Intermediate",
    duration: "8 Weeks",
    lessonsCount: 24,
    instructor: "Qari Mansoor Al-Azhari",
    scholarReviewer: "Dr. Farooq Khan",
    reviewStatus: "Published",
    enrolledCount: 980,
    rating: 4.8,
    description: "Izhar, Idgham, Iqlab aur Ikhfa ke mukammal qawaid ba-ma audio mashq aur aayat par tatbeeq.",
    lessons: [
      {
        id: "les-tj1",
        title: "Lesson 1: Ahkam-e-Noon Sakin & Izhar-e-Halaqi",
        duration: "25 mins",
        audioSample: "https://everyayah.com/data/Husary_128kbps/001004.mp3",
        notes: "Noon Sakin ya Tanween ke baad Huroof-e-Halaqi (ء ه ع ح غ خ) aayein to Izhar hoga (ghunnah nahi hoga).",
        quiz: [
          {
            question: "Lafz 'مِنْ خَوْفٍ' mein Noon Sakin par kaunsa qaidah lagta hai?",
            options: ["Idgham", "Ikhfa", "Izhar-e-Halaqi", "Iqlab"],
            answer: 2,
            explanation: "Noon Sakin ke baad 'خ' (harf-e-halaqi) aane ki wajah se Izhar-e-Halaqi hoga."
          }
        ]
      },
      {
        id: "les-tj2",
        title: "Lesson 2: Huroof-e-Qalqalah (ق ط ب ج د)",
        duration: "20 mins",
        audioSample: "https://everyayah.com/data/Husary_128kbps/112001.mp3",
        notes: "Qutub Jad: Jab ye huroof sakin hon to unme awaz palat kar aati hai.",
        quiz: [
          {
            question: "Qalqalah ke kul kitne huroof hain?",
            options: ["3", "5", "7", "6"],
            answer: 1,
            explanation: "Qalqalah ke 5 huroof hain jo majmooa 'قُطْبُ جَدٍّ' mein jama hain."
          }
        ]
      }
    ]
  },
  {
    id: "quran-103",
    dept: "quran",
    title: "Hifz-ul-Quran & Revision Track",
    titleArabic: "حفظ القرآن الكريم والمراجعة المنهجية",
    level: "Advanced",
    duration: "Ongoing",
    lessonsCount: 30,
    instructor: "Hafiz Muhammad Umair",
    scholarReviewer: "Maulana Tariq Masood",
    reviewStatus: "Published",
    enrolledCount: 650,
    rating: 5.0,
    description: "Sabaq, Sabqi aur Manzil ka structured dars, rozana yaad-dahani aur audio recording assessment.",
    lessons: [
      {
        id: "les-hf1",
        title: "Lesson 1: Juz 30 Memorization — Surah An-Naba to An-Nazi'at",
        duration: "30 mins",
        audioSample: "https://everyayah.com/data/Husary_128kbps/078001.mp3",
        notes: "Mutashabihat ka dhyan, har aayat ko 10 martaba dohrana aur ustaad ko sunana.",
        quiz: [
          {
            question: "Surah An-Naba quran kareem ke konse pare mein hai?",
            options: ["29th", "30th", "28th", "1st"],
            answer: 1,
            explanation: "Surah An-Naba 30we (Aamma) pare ki pehli surah hai."
          }
        ]
      }
    ]
  },

  // ================= 2. KIDS ACADEMY =================
  {
    id: "kids-501",
    dept: "kids",
    title: "Kids Academy (Age 5–7): Kalimas & Daily Duas",
    titleArabic: "أكاديمية الأطفال: الكلمات والأدعية والقصص",
    level: "Kids (5-7)",
    duration: "4 Weeks",
    lessonsCount: 12,
    instructor: "Muallimah Zainab Fatima",
    scholarReviewer: "Mufti Muhammad Salman",
    reviewStatus: "Published",
    enrolledCount: 890,
    rating: 4.9,
    description: "Bacho ke liye 6 Kalimas, khana khane ki dua, sonay ki dua, walidain ka adab aur pyari kahaniyaan.",
    lessons: [
      {
        id: "les-k1",
        title: "Lesson 1: Pehla Kalima Tayyab & Meaning",
        duration: "12 mins",
        audioSample: "https://everyayah.com/data/Husary_128kbps/001001.mp3",
        notes: "لَا إِلٰهَ إِلَّا اللهُ مُحَمَّدٌ رَسُولُ اللهِ - Allah ke siwa koi ibadat ke layaq nahi, Muhammad ﷺ Allah ke rasool hain.",
        quiz: [
          {
            question: "Pehle Kalime ka kya naam hai?",
            options: ["Kalima Shahadat", "Kalima Tayyab", "Kalima Tamjeed", "Kalima Tauheed"],
            answer: 1,
            explanation: "Pehle kalime ko 'Kalima Tayyab' kehte hain."
          }
        ]
      },
      {
        id: "les-k2",
        title: "Lesson 2: Daily Islamic Manners (Bismillah & Salam)",
        duration: "15 mins",
        audioSample: "https://everyayah.com/data/Husary_128kbps/001002.mp3",
        notes: "Har nek kaam se pehle Bismillah parhna aur aapas mein Salam (Assalamu Alaikum) aam karna.",
        quiz: [
          {
            question: "Salam ka jawab kaise diya jata hai?",
            options: ["Shukriya", "Wa Alaikum Assalam Wa Rahmatullahi Wa Barakatuh", "Khush Raho", "Good Morning"],
            answer: 1,
            explanation: "Sunnat tareeqa hai ke 'Wa Alaikum Assalam Wa Rahmatullahi Wa Barakatuh' kahein."
          }
        ]
      }
    ]
  },
  {
    id: "kids-502",
    dept: "kids",
    title: "Kids Academy (Age 8–10): Namaz & Seerah Stories",
    titleArabic: "تعليم الصلاة وقصص السيرة النبوية للأطفال",
    level: "Kids (8-10)",
    duration: "8 Weeks",
    lessonsCount: 18,
    instructor: "Maulana Bilal Ahmad",
    scholarReviewer: "Dr. Farooq Khan",
    reviewStatus: "Published",
    enrolledCount: 740,
    rating: 4.85,
    description: "Wudu ka amli tareeqa, 5 Namazon ke auqat o rak'atein, Tashahhud, Durood-e-Ibrahim aur Nabi Kareem ﷺ ka bachpan.",
    lessons: [
      {
        id: "les-k3",
        title: "Lesson 1: Wudu ke 4 Farz",
        duration: "16 mins",
        audioSample: "https://everyayah.com/data/Husary_128kbps/001005.mp3",
        notes: "1. Chehra dhona, 2. Kohniyon samet hath dhona, 3. Chothai sar ka masah, 4. Takhno samet paon dhona.",
        quiz: [
          {
            question: "Wudu mein kitne farz hain?",
            options: ["3", "4", "6", "7"],
            answer: 1,
            explanation: "Wudu mein 4 farz hain jinka quran mein zikr aaya hai."
          }
        ]
      }
    ]
  },
  {
    id: "kids-503",
    dept: "kids",
    title: "Kids Academy (Age 14–17): Modern Challenges & Islamic Ethics",
    titleArabic: "الشباب والقيم الإسلامية في العصر الحديث",
    level: "Teens (14-17)",
    duration: "10 Weeks",
    lessonsCount: 20,
    instructor: "Dr. Hamza Ali",
    scholarReviewer: "Mufti Muhammad Salman",
    reviewStatus: "Published",
    enrolledCount: 520,
    rating: 4.95,
    description: "Digital media ka sahi istemal, shukook o shubhat ka aqli o naqli jawab, namaz ki pabandi aur dosti ke usool.",
    lessons: [
      {
        id: "les-k4",
        title: "Lesson 1: Purpose of Life & Tawheed in 21st Century",
        duration: "24 mins",
        audioSample: "https://everyayah.com/data/Husary_128kbps/001006.mp3",
        notes: "Kainaat ka nizam, khaliq ki zaat par yaqeen aur science o islam ka haseen rishta.",
        quiz: [
          {
            question: "Insaan ki takhliq ka bunyadi maqsad kya hai?",
            options: ["Sirf daulat kamana", "Allah Ta'ala ki ibadat aur ita'at", "Duniya ghoomna", "Shohrat pana"],
            answer: 1,
            explanation: "Surah Adh-Dhariyat mein farmaya: 'Maine Jinno aur Insaano ko sirf apni ibadat ke liye paida kiya'."
          }
        ]
      }
    ]
  },

  // ================= 3. WOMEN'S SECTION =================
  {
    id: "women-301",
    dept: "women",
    title: "Fiqh-e-Niswan: Taharat, Haiz, Nifas & Salah",
    titleArabic: "فقه النسوان: الطهارة والحيض والنفاس والصلاة",
    level: "All Levels",
    duration: "6 Weeks",
    lessonsCount: 15,
    instructor: "Aalima Maryam Siddiqa",
    scholarReviewer: "Muftia Asma Qasim",
    reviewStatus: "Published",
    enrolledCount: 1100,
    rating: 4.95,
    description: "Khawateen ke makhsoos masael, taharat ke ahkam, haiz o nifas ke qawaid aur namaz ke farayez ki ba-sanad wazahat.",
    lessons: [
      {
        id: "les-w1",
        title: "Lesson 1: Taharat ke Bunyadi Ahkam o Aqsaam",
        duration: "22 mins",
        audioSample: "https://everyayah.com/data/Husary_128kbps/001001.mp3",
        notes: "Najasat-e-Ghaleeza aur Khafeefa ki wazahat, ghusl ke 3 farz aur pakizgi ki ahmiyat.",
        quiz: [
          {
            question: "Ghusl mein kitne farz hain?",
            options: ["2 Farz", "3 Farz (Kulli, Naak mein pani, Poore jism par pani bahana)", "4 Farz", "5 Farz"],
            answer: 1,
            explanation: "Ghusl ke 3 farz hain: achhi tarah kulli karna, naak ki narm haddi tak pani pahunchana, poore badan par pani bahana."
          }
        ]
      },
      {
        id: "les-w2",
        title: "Lesson 2: Haiz, Nifas aur Istihaza mein Farq",
        duration: "28 mins",
        audioSample: "https://everyayah.com/data/Husary_128kbps/001002.mp3",
        notes: "Muddath, ahkam-e-namaz o roza aur istihaza ki halat mein ibadat ke qawaid.",
        quiz: [
          {
            question: "Istihaza ki halat mein roza aur namaz ka kya hukm hai?",
            options: ["Namaz aur Roza dono maaf hain", "Har namaz ke liye wuzu karke namaz parhna aur roza rakhna wajib hai", "Sirf qaza karni hogi", "Ghusl har roz farz hai"],
            answer: 1,
            explanation: "Istihaza beemari ka khoon hai, isme har namaz ke waqt taza wuzu karke namaz ada ki jayegi aur roza bhi rakha jayega."
          }
        ]
      }
    ]
  },
  {
    id: "women-302",
    dept: "women",
    title: "Islamic Parenting & Tarbiyah of Children",
    titleArabic: "تربية الأولاد في ضوء الإسلام",
    level: "Intermediate",
    duration: "8 Weeks",
    lessonsCount: 16,
    instructor: "Dr. Ayesha Munir",
    scholarReviewer: "Mufti Muhammad Salman",
    reviewStatus: "Published",
    enrolledCount: 680,
    rating: 4.9,
    description: "Nabi-e-Kareem ﷺ ki sirat ki roshni mein bachon ki shakhsiyat saazi, adab, jazbati rehnumai aur deeni parwarish.",
    lessons: [
      {
        id: "les-w3",
        title: "Lesson 1: Aulaad ki Taleem o Tarbiyat ke Nabawi Usool",
        duration: "26 mins",
        audioSample: "https://everyayah.com/data/Husary_128kbps/001003.mp3",
        notes: "Pyaar o shafqat, nafsiyat ko samajhna aur misaal ban kar sikhana.",
        quiz: [
          {
            question: "Nabi Kareem ﷺ ne bachon ko kis umr mein namaz ka hukm dene ki hidayat farmayi?",
            options: ["5 saal", "7 saal", "10 saal", "12 saal"],
            answer: 1,
            explanation: "Hadith ke mutabiq 7 saal ki umr mein bachon ko namaz ki aadat dalne ka hukm diya jaye."
          }
        ]
      }
    ]
  },
  {
    id: "women-303",
    dept: "women",
    title: "Seerah of Sahabiyat (Noble Women of Islam)",
    titleArabic: "سير الصحابيات الجليلات رضي الله عنهن",
    level: "All Levels",
    duration: "6 Weeks",
    lessonsCount: 14,
    instructor: "Ustaadha Khadija Begum",
    scholarReviewer: "Dr. Farooq Khan",
    reviewStatus: "Published",
    enrolledCount: 820,
    rating: 5.0,
    description: "Hazrat Khadija, Hazrat Aisha, Hazrat Fatima aur deegar azeem Sahabiyat R.A. ke imaan-afrooz waqiat.",
    lessons: [
      {
        id: "les-w4",
        title: "Lesson 1: Sayyida Khadijah Al-Kubra R.A. — The Pillar of Support",
        duration: "25 mins",
        audioSample: "https://everyayah.com/data/Husary_128kbps/001004.mp3",
        notes: "Aap ka tijarati muamlaat, sabr, nabi kareem ﷺ par sab se pehle imaan lana aur azeem qurbaniyan.",
        quiz: [
          {
            question: "Islam mein sab se pehli shakhsiyat jinhone imaan qabool kiya wo kaun theen?",
            options: ["Hazrat Aisha R.A.", "Hazrat Khadijah R.A.", "Hazrat Fatima R.A.", "Hazrat Sumayyah R.A."],
            answer: 1,
            explanation: "Ummul Momineen Hazrat Khadijah R.A. ne sab se pehle Islam qabool farmaya."
          }
        ]
      }
    ]
  },

  // ================= 4. ARABIC DEPARTMENT =================
  {
    id: "arabic-201",
    dept: "arabic",
    title: "Arabic Level 1: Huroof, Vocabulary & Greetings",
    titleArabic: "المستوى الأول: الحروف والمفردات والتحيات",
    level: "Beginner",
    duration: "6 Weeks",
    lessonsCount: 18,
    instructor: "Ustadh Zayd Al-Yamani",
    scholarReviewer: "Dr. Farooq Khan",
    reviewStatus: "Published",
    enrolledCount: 1350,
    rating: 4.88,
    description: "Bunyadi arabi alfaaz, rozmarrah ke jumlay, ta'aruf, haal-ahwaal poochna aur aam ashya ke naam.",
    lessons: [
      {
        id: "les-ar1",
        title: "Lesson 1: Ta'aruf aur Daily Greetings (التحيات والتعارف)",
        duration: "20 mins",
        audioSample: "https://everyayah.com/data/Husary_128kbps/001001.mp3",
        notes: "مرحبا، كيف حالك؟ أنا بخير والحمد لله. ما اسمك؟ اسمي أحمد.",
        quiz: [
          {
            question: "'كيف حالك؟' (Kaifa Haluka?) ka matlab kya hai?",
            options: ["Aap kahan ja rahe hain?", "Aap ka kya haal hai?", "Aap ka kya naam hai?", "Shukriya"],
            answer: 1,
            explanation: "Kaifa Haluka ka matlab hota hai 'Aap ka kya haal hai?'."
          }
        ]
      }
    ]
  },
  {
    id: "arabic-202",
    dept: "arabic",
    title: "Arabic Level 3 — Sarf: Wazan, Abwab & Tasreef",
    titleArabic: "علم الصرف: الميزان الصرفي، الأوزان وأبواب الأفعال",
    level: "Intermediate",
    duration: "10 Weeks",
    lessonsCount: 22,
    instructor: "Maulana Rashid Noori",
    scholarReviewer: "Mufti Muhammad Salman",
    reviewStatus: "Published",
    enrolledCount: 760,
    rating: 4.92,
    description: "Af'aal ki gardanein (Mazi, Muzare, Amar, Nahi), Abwab-e-Sulasi Mujarrad aur Ism Fa'il/Maf'ool banana.",
    lessons: [
      {
        id: "les-ar2",
        title: "Lesson 1: Mizan Sarfi & Sulasi Mujarrad ke 6 Abwab",
        duration: "30 mins",
        audioSample: "https://everyayah.com/data/Husary_128kbps/001002.mp3",
        notes: "فَعَلَ يَفْعُلُ (نَصَرَ يَنْصُرُ)، فَعَلَ يَفْعِلُ (ضَرَبَ يَضْرِبُ)، فَعَلَ يَفْعَلُ (فَتَحَ يَفْتَحُ).",
        quiz: [
          {
            question: "Fa'ala Yaf'ulu (فَعَلَ يَفْعُلُ) kis baab ka wazan hai?",
            options: ["Baab Nasara Yansuru", "Baab Zaraba Yazribu", "Baab Sami'a Yasma'u", "Baab Karuma Yakrumu"],
            answer: 0,
            explanation: "Fa'ala Yaf'ulu 'Baab Nasara Yansuru' ka wazan hai."
          }
        ]
      }
    ]
  },
  {
    id: "arabic-203",
    dept: "arabic",
    title: "Arabic Level 4 — Nahw: I'rab, Mubtada, Khabar & Jumla",
    titleArabic: "علم النحو: الإعراب، المبتدأ والخبر، الجملة الاسمية والفعلية",
    level: "Intermediate / Advanced",
    duration: "12 Weeks",
    lessonsCount: 26,
    instructor: "Dr. Farooq Khan",
    scholarReviewer: "Mufti Muhammad Salman",
    reviewStatus: "Published",
    enrolledCount: 610,
    rating: 4.96,
    description: "Marfoo'at, Mansubaat, Majrooraat, Jumla Ismiyyah aur Fi'liyyah ki tarkeeb aur Quranic ayat ka i'rab.",
    lessons: [
      {
        id: "les-ar3",
        title: "Lesson 1: Jumla Ismiyyah — Mubtada aur Khabar ke Qawaid",
        duration: "32 mins",
        audioSample: "https://everyayah.com/data/Husary_128kbps/001003.mp3",
        notes: "Mubtada aam tor par marifa aur marfoo hota hai, jabke khabar nakirah aur marfoo hoti hai. Jaise: اَلْعِلْمُ نُوْرٌ.",
        quiz: [
          {
            question: "Jumla 'اَلْعِلْمُ نُوْرٌ' mein 'اَلْعِلْمُ' kya hai?",
            options: ["Fa'il", "Mubtada", "Khabar", "Maf'ool"],
            answer: 1,
            explanation: "Al-Ilmu jumla ke shuru mein marifa ism hai, isliye ye Mubtada hai."
          }
        ]
      }
    ]
  },

  // ================= 5. ISLAMIC STUDIES =================
  {
    id: "is-401",
    dept: "islamic-studies",
    title: "Aqeedah Tahawiyyah & Foundations of Faith",
    titleArabic: "العقيدة الطحاوية وأصول الإيمان عند أهل السنة",
    level: "Intermediate",
    duration: "8 Weeks",
    lessonsCount: 20,
    instructor: "Maulana Mufti Salman",
    scholarReviewer: "Dr. Farooq Khan",
    reviewStatus: "Published",
    enrolledCount: 940,
    rating: 4.97,
    description: "Imam Tahawi ki mashhoor kitab ki roshni mein Ahl-e-Sunnat wal Jama'at ke sahih aqaid ki tafseel.",
    lessons: [
      {
        id: "les-is1",
        title: "Lesson 1: Tawheed-e-Bari Ta'ala & Sifaat-e-Ilahiyyah",
        duration: "28 mins",
        audioSample: "https://everyayah.com/data/Husary_128kbps/112001.mp3",
        notes: "Allah Ta'ala ek hai, uska koi shareek nahi, na uski misal hai aur na wo kisi cheez ka mohtaj hai.",
        quiz: [
          {
            question: "Imam Tahawi R.A. kis daur ke azeem muhaddith aur faqeeh the?",
            options: ["Pehli sadi hijri", "Teesri sadi hijri", "Saatwin sadi hijri", "Daswin sadi hijri"],
            answer: 1,
            explanation: "Imam Abu Ja'far at-Tahawi teesri sadi hijri (239-321 AH) ke azeem aalim the."
          }
        ]
      }
    ]
  },
  {
    id: "is-402",
    dept: "islamic-studies",
    title: "40 Ahadith of Imam An-Nawawi (Arba'een)",
    titleArabic: "الأربعون النووية مع شرح المعاني وفقه الحديث",
    level: "All Levels",
    duration: "8 Weeks",
    lessonsCount: 20,
    instructor: "Dr. Farooq Khan",
    scholarReviewer: "Mufti Muhammad Salman",
    reviewStatus: "Published",
    enrolledCount: 1250,
    rating: 5.0,
    description: "Deen ke 40 ahem tareen sutoon par mushtamil hadith e mubaraka, sanad o matn ki tashreeh aur aam zindagi mein amli nizam.",
    lessons: [
      {
        id: "les-is2",
        title: "Lesson 1: Hadith 1 — Innamal A'maalu Bin-Niyyaat (إنما الأعمال بالنيات)",
        duration: "25 mins",
        audioSample: "https://everyayah.com/data/Husary_128kbps/001001.mp3",
        notes: "A'maal ka daromadar niyyat par hai. Ikhlas ki ahmiyat aur riyakari se bachne ki takeed.",
        quiz: [
          {
            question: "Hadith 'Innamal A'maalu Bin-Niyyaat' ke rawi kaunse sahabi hain?",
            options: ["Hazrat Abu Hurairah R.A.", "Hazrat Umar bin Al-Khattab R.A.", "Hazrat Ali R.A.", "Hazrat Anas bin Malik R.A."],
            answer: 1,
            explanation: "Ye mashhoor hadith Ameerul Momineen Hazrat Umar bin Al-Khattab R.A. se marwi hai."
          }
        ]
      }
    ]
  },

  // ================= 6. AALIM / AALIMA HIGHER STUDIES =================
  {
    id: "aalim-601",
    dept: "aalim",
    title: "Dars-e-Nizami Year 1: Arabic Foundation & Sarf/Nahw",
    titleArabic: "السنة الأولى من العالمية: الصرف والنحو والفقه المبدئي",
    level: "Higher Studies",
    duration: "1 Year",
    lessonsCount: 60,
    instructor: "Sheikhul Hadith Maulana Qasim",
    scholarReviewer: "Ulema Academic Board",
    reviewStatus: "Published",
    enrolledCount: 420,
    rating: 4.98,
    description: "Meezan-us-Sarf, Ilm-us-Seegha, Hidayat-un-Nahw aur Qudoori ke ibtedayi abwab ka aalimana nisaab.",
    lessons: [
      {
        id: "les-alm1",
        title: "Lesson 1: Tareekh-e-Tadween-e-Nahw aur Zaroorat",
        duration: "45 mins",
        audioSample: "https://everyayah.com/data/Husary_128kbps/001001.mp3",
        notes: "Hazrat Ali R.A. ka Hazrat Abu Al-Aswad Ad-Du'ali ko qawaid-e-nahw murattab karne ka hukm.",
        quiz: [
          {
            question: "Ilm-e-Nahw ka baani kisko qarar diya jata hai?",
            options: ["Sibawayh", "Hazrat Abu Al-Aswad Ad-Du'ali", "Imam Khalil bin Ahmad", "Imam Kisai"],
            answer: 1,
            explanation: "Hazrat Abu Al-Aswad Ad-Du'ali ne Hazrat Ali R.A. ke mashware par Ilm-e-Nahw ki bunyad rakhi."
          }
        ]
      }
    ]
  },

  // ================= 7. RESEARCH & METHODOLOGY =================
  {
    id: "res-701",
    dept: "research",
    title: "Takhrij-ul-Hadith & Authentic Source Verification",
    titleArabic: "طرق تخريج الحديث ودراسة الأسانيد وتحقيق المصادر",
    level: "Advanced Research",
    duration: "6 Weeks",
    lessonsCount: 15,
    instructor: "Dr. Muhammad Tahir Al-Azhari",
    scholarReviewer: "Scholar Review Panel",
    reviewStatus: "Published",
    enrolledCount: 310,
    rating: 4.94,
    description: "Kutub-e-Sittah aur Masaneed mein hadith daryaft karne ke tariqay, Asma-ur-Rijal aur Jarh-o-Ta'deel ki bunyadiyat.",
    lessons: [
      {
        id: "les-res1",
        title: "Lesson 1: Introduction to Takhrij via Matn and Sahabi",
        duration: "35 mins",
        audioSample: "https://everyayah.com/data/Husary_128kbps/001001.mp3",
        notes: "Al-Mu'jam Al-Mufahras li-Alfaz Al-Hadith aur Shamila ke zariye hadith talash karne ka manhaj.",
        quiz: [
          {
            question: "Kutub-e-Sittah mein kitni mashhoor hadith ki kitabein aati hain?",
            options: ["4", "5", "6", "9"],
            answer: 2,
            explanation: "Kutub-e-Sittah (Sihah Sittah) 6 kitabein hain: Sahih Bukhari, Sahih Muslim, Sunan Abi Dawood, Jami Tirmidhi, Sunan Nasai, Sunan Ibn Majah."
          }
        ]
      }
    ]
  }
];
