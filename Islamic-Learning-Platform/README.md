# Al-Noor Open Source Islamic Learning Platform 🌙

> **An open-source, scholarly verified educational ecosystem** providing structured Islamic learning from Noorani Qaida to Advanced Aalimiyyah with interactive Tajweed voice evaluation, verified curriculum workflows, and a digital research library.

---

## 📖 Project Overview

This platform implements the complete **Business Requirements Document (BRD)** for an open-source Islamic education system. It provides an authentic, accessible, and high-quality learning experience for children, teens, women, adults, students of higher Islamic studies, and scholars.

### 🌟 Core Highlights

1. **Multi-Role Experience**:
   - **Student View**: Interactive course player, progress tracking, voice recitation recorder, instant-graded quizzes, and printable verified certificates.
   - **Teacher Portal**: Student recitation grading queue with targeted Tajweed feedback tags (*Makharij, Madd, Ghunnah, Qalqalah, Waqf*), live class scheduling, and Q&A.
   - **Admin & Scholar Review Portal**: Multi-tier moderation workflow (*Draft → Academic Review → Scholar Approved → Published*) and platform analytics.

2. **Full Curriculum Departments**:
   - **Quran & Tajweed**: Noorani Qaida, Nazra, Tajweed rules of Noon Sakin & Qalqalah, and Hifz revision.
   - **Interactive Audio Tajweed Recorder (BRD Section 14)**: Live microphone recitation recording with soundwave visualizer, playback, and teacher evaluation submission.
   - **Kids Academy (BRD Section 8)**: Age-tailored tracks (5–7, 8–10, 11–13, 14–17) with Kalimas, daily Duas, Namaz, and Islamic stories.
   - **Women's Section (BRD Section 9)**: Fiqh-e-Niswan (Taharat, Haiz, Nifas, Istihaza, Salah, Roza), Islamic Parenting, and Seerah of Sahabiyat.
   - **Arabic Department (BRD Section 6)**: 6 Levels from Huroof to Sarf (Tasreef/Abwab), Nahw (I'rab/Mubtada), and Balaghat.
   - **Aalim / Aalima Program (BRD Section 10)**: Dars-e-Nizami foundation curriculum.
   - **Islamic Digital Library & Research (BRD Section 16 & 23)**: Authentic Tafseer, Hadith, and Fiqh books with citation metadata, licensing, and excerpt reader.

3. **Verifiable Certificates (BRD Section 19)**:
   - Dynamic certificates featuring student name, course title, completion grade, official seals, and a verification QR code.

4. **Multi-Language Support (BRD Section 18)**:
   - Real-time language switching: **English**, **Roman Urdu**, and **Urdu (اردو)** with RTL layout.

---

## 📁 Project Structure

```
├── index.html                 # Self-contained React 18 web application entry point
├── css/
│   └── app.css                # Luxury Islamic aesthetic (Emerald, Gold, Glassmorphism)
├── js/
│   ├── app.js                 # React components, state router & audio recorder logic
│   └── data/
│       ├── translations.js    # Multi-language dictionary (English, Roman Urdu, Urdu)
│       ├── coursesData.js     # Authentic curriculum data across all BRD departments
│       └── libraryData.js     # Digital library catalog with metadata & excerpts
├── server.ps1                 # Lightweight local server & browser launcher
├── Open_Source_Islamic_Learning_Platform_BRD.pdf # Original BRD requirements
└── README.md                  # Project documentation
```

---

## 🚀 Quick Start & How to Run

### Method 1: Direct File Open
Simply double-click on `index.html` in your file explorer. It will open in Google Chrome, Microsoft Edge, or Firefox without needing any installation.

### Method 2: Local Server (Recommended)
Run the PowerShell launcher script:
```powershell
.\server.ps1
```
Then visit:
```
http://localhost:8080/
```

---

## 🛠️ Git & GitHub Setup

To push this repository to GitHub:

```bash
# 1. Initialize git repository
git init

# 2. Add all files
git add .

# 3. Commit
git commit -m "Initial commit: Open Source Islamic Learning Platform"

# 4. Set default branch to main
git branch -M main

# 5. Link to your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 6. Push to GitHub
git push -u origin main
```

---

## 📜 License & Accreditation
- Open-source educational project.
- Religious texts and content referenced according to classical Islamic scholarly sources.
