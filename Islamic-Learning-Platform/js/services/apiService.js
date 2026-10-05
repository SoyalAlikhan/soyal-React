// ============================================================================
// Al-Noor Islamic Learning Platform — Frontend API Client (Web & Mobile Shared)
// Seamlessly reads and writes to SQLite backend with silent fallback to memory
// ============================================================================

const API_BASE = (typeof window !== 'undefined' && window.location.origin && window.location.origin.startsWith('http')) 
  ? `${window.location.origin}/api/v1` 
  : 'http://localhost:8085/api/v1';

const apiService = {
  // 0. Authentication & Role-Guards
  login: async (credentials) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] login error:', err.message);
      return { success: false, error: 'Network error connecting to backend authentication.' };
    }
  },

  register: async (userData) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] register error:', err.message);
      return { success: false, error: 'Network error connecting to backend.' };
    }
  },

  getUsers: async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/users`);
      const data = await res.json();
      return data.success ? data.data : [];
    } catch (err) {
      console.warn('[API Service] getUsers error:', err.message);
      return [];
    }
  },

  forgotPassword: async (identifier) => {
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier })
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] forgotPassword error:', err.message);
      return { success: false, error: 'Network error requesting OTP.' };
    }
  },

  resetPassword: async (identifierOrPayload, otp, newPassword) => {
    try {
      let bodyData = {};
      if (typeof identifierOrPayload === 'object' && identifierOrPayload !== null) {
        bodyData = identifierOrPayload;
      } else {
        bodyData = { identifier: identifierOrPayload, otp, new_password: newPassword };
      }
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] resetPassword error:', err.message);
      return { success: false, error: 'Network error resetting password.' };
    }
  },

  changePassword: async (userId, oldPassword, newPassword) => {
    try {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, old_password: oldPassword, new_password: newPassword })
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] changePassword error:', err.message);
      return { success: false, error: 'Network error changing password.' };
    }
  },

  // 1. Health & Status
  checkHealth: async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return await res.json();
    } catch {
      return { status: 'offline' };
    }
  },

  // 2. Courses Catalog
  getCourses: async () => {
    try {
      const res = await fetch(`${API_BASE}/courses`);
      const data = await res.json();
      return data.success ? data.data : null;
    } catch (err) {
      console.warn('[API Service] getCourses fallback to mock:', err.message);
      return null;
    }
  },

  createCourse: async (courseData) => {
    try {
      const res = await fetch(`${API_BASE}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData)
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn('[API Service] createCourse error:', err.message);
      return { success: false, error: err.message };
    }
  },

  // 3. Batches & Halaqaat Schedulers
  getBatches: async () => {
    try {
      const res = await fetch(`${API_BASE}/batches`);
      const data = await res.json();
      return data.success ? data.data : null;
    } catch (err) {
      console.warn('[API Service] getBatches fallback:', err.message);
      return null;
    }
  },

  createBatch: async (batchData) => {
    try {
      const res = await fetch(`${API_BASE}/batches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batchData)
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] createBatch error:', err.message);
      return { success: false, error: err.message };
    }
  },

  // 3B. Live Classes & Scheduled Halaqaat
  getLiveClasses: async () => {
    try {
      const res = await fetch(`${API_BASE}/live-classes`);
      const data = await res.json();
      return data.success ? data.data : null;
    } catch (err) {
      console.warn('[API Service] getLiveClasses fallback:', err.message);
      return null;
    }
  },

  createLiveClass: async (classData) => {
    try {
      const res = await fetch(`${API_BASE}/live-classes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classData)
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] createLiveClass error:', err.message);
      return { success: false, error: err.message };
    }
  },

  deleteLiveClass: async (classId) => {
    try {
      const res = await fetch(`${API_BASE}/live-classes/${classId}`, {
        method: 'DELETE'
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] deleteLiveClass error:', err.message);
      return { success: false, error: err.message };
    }
  },

  // 4. Leave Applications
  getLeaves: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/leaves${query ? '?' + query : ''}`);
      const data = await res.json();
      return data.success ? data.data : null;
    } catch (err) {
      console.warn('[API Service] getLeaves fallback to mock:', err.message);
      return null;
    }
  },

  submitLeave: async (leaveData) => {
    try {
      const res = await fetch(`${API_BASE}/leaves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leaveData)
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] submitLeave error:', err.message);
      return { success: false, error: err.message };
    }
  },

  updateLeaveDecision: async (leaveId, decision, remarks) => {
    try {
      const res = await fetch(`${API_BASE}/leaves/${leaveId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, remarks })
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] updateLeaveDecision error:', err.message);
      return { success: false, error: err.message };
    }
  },

  // 5. Admissions Register
  getAdmissions: async () => {
    try {
      const res = await fetch(`${API_BASE}/admissions`);
      const data = await res.json();
      return data.success ? data.data : null;
    } catch (err) {
      console.warn('[API Service] getAdmissions fallback to mock:', err.message);
      return null;
    }
  },

  submitAdmission: async (admissionData) => {
    try {
      const res = await fetch(`${API_BASE}/admissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(admissionData)
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] submitAdmission error:', err.message);
      return { success: false, error: err.message };
    }
  },

  // 6. Faculty & Asateza Directory
  getFaculty: async () => {
    try {
      const res = await fetch(`${API_BASE}/faculty`);
      const data = await res.json();
      return data.success ? data.data : null;
    } catch (err) {
      console.warn('[API Service] getFaculty fallback:', err.message);
      return null;
    }
  },

  createFaculty: async (facultyData) => {
    try {
      const res = await fetch(`${API_BASE}/faculty`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(facultyData)
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] createFaculty error:', err.message);
      return { success: false, error: err.message };
    }
  },

  // 7. Chanda & Waqf Ledger
  getChandaLedger: async () => {
    try {
      const res = await fetch(`${API_BASE}/chanda`);
      const data = await res.json();
      return data.success ? data.data : null;
    } catch (err) {
      console.warn('[API Service] getChandaLedger fallback to mock:', err.message);
      return null;
    }
  },

  recordChanda: async (chandaData) => {
    try {
      const res = await fetch(`${API_BASE}/chanda`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chandaData)
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] recordChanda error:', err.message);
      return { success: false, error: err.message };
    }
  },

  // 8. 30s Heartbeat SDK Attendance
  sendHeartbeat: async (heartbeatData) => {
    try {
      const res = await fetch(`${API_BASE}/attendance/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(heartbeatData)
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] sendHeartbeat error:', err.message);
      return { success: false, error: err.message };
    }
  },

  // 9. Relational Students & Batch Enrollments
  getStudents: async () => {
    try {
      const res = await fetch(`${API_BASE}/students`);
      const data = await res.json();
      return data.success ? data.data : [];
    } catch (err) {
      console.warn('[API Service] getStudents fallback:', err.message);
      return [];
    }
  },

  getAvailableStudents: async (batchId) => {
    try {
      const url = batchId ? `${API_BASE}/students/available?batch_id=${encodeURIComponent(batchId)}` : `${API_BASE}/students/available`;
      const res = await fetch(url);
      const data = await res.json();
      return data.success ? data.data : [];
    } catch (err) {
      console.warn('[API Service] getAvailableStudents error:', err.message);
      return [];
    }
  },

  getBatchStudents: async (batchId) => {
    try {
      const url = batchId ? `${API_BASE}/batches/${encodeURIComponent(batchId)}/students` : `${API_BASE}/batch-students`;
      const res = await fetch(url);
      const data = await res.json();
      return data.success ? data.data : [];
    } catch (err) {
      console.warn('[API Service] getBatchStudents error:', err.message);
      return [];
    }
  },

  enrollStudentInBatch: async (batchId, studentId, paymentStatus = 'Paid') => {
    try {
      const payload = (typeof studentId === 'object' && studentId !== null)
        ? { batch_id: batchId, payment_status: paymentStatus, ...studentId }
        : { batch_id: batchId, student_id: studentId, payment_status: paymentStatus };
      const res = await fetch(`${API_BASE}/batch-students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] enrollStudentInBatch error:', err.message);
      return { success: false, error: err.message };
    }
  },

  removeStudentFromBatch: async (batchId, studentId) => {
    try {
      const res = await fetch(`${API_BASE}/batch-students/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch_id: batchId, student_id: studentId })
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] removeStudentFromBatch error:', err.message);
      return { success: false, error: err.message };
    }
  },

  createStudent: async (studentData) => {
    try {
      const res = await fetch(`${API_BASE}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] createStudent error:', err.message);
      return { success: false, error: err.message };
    }
  },

  // 4E. Homework & Assignments SQLite Engine
  getHomework: async (batchId, studentId) => {
    try {
      let url = `${API_BASE}/homework`;
      const params = [];
      if (batchId && batchId !== 'all') params.push(`batch_id=${encodeURIComponent(batchId)}`);
      if (studentId) params.push(`student_id=${encodeURIComponent(studentId)}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const res = await fetch(url);
      const data = await res.json();
      return data.success ? data.data : [];
    } catch (err) {
      console.warn('[API Service] getHomework fallback:', err.message);
      return [];
    }
  },

  createHomework: async (hwData) => {
    try {
      const res = await fetch(`${API_BASE}/homework`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hwData)
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] createHomework error:', err.message);
      return { success: false, error: err.message };
    }
  },

  deleteHomework: async (hwId) => {
    try {
      const res = await fetch(`${API_BASE}/homework/${encodeURIComponent(hwId)}`, {
        method: 'DELETE'
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] deleteHomework error:', err.message);
      return { success: false, error: err.message };
    }
  },

  submitHomework: async (hwId, submissionData) => {
    try {
      const res = await fetch(`${API_BASE}/homework/${encodeURIComponent(hwId)}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] submitHomework error:', err.message);
      return { success: false, error: err.message };
    }
  },

  gradeHomework: async (subId, gradeData) => {
    try {
      const res = await fetch(`${API_BASE}/homework/submissions/${encodeURIComponent(subId)}/grade`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gradeData)
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] gradeHomework error:', err.message);
      return { success: false, error: err.message };
    }
  },

  getStudentDashboard: async (studentId) => {
    try {
      const res = await fetch(`${API_BASE}/students/${encodeURIComponent(studentId)}/dashboard`);
      return await res.json();
    } catch (err) {
      console.warn('[API Service] getStudentDashboard error:', err.message);
      return { success: false, error: err.message };
    }
  },

  updateStudent: async (studentId, studentData) => {
    try {
      const res = await fetch(`${API_BASE}/students/${encodeURIComponent(studentId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] updateStudent error:', err.message);
      return { success: false, error: err.message };
    }
  },

  getLinkedAccounts: async (email) => {
    try {
      const res = await fetch(`${API_BASE}/auth/linked-accounts?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      return data.success ? data.data : [];
    } catch (err) {
      console.warn('[API Service] getLinkedAccounts error:', err.message);
      return [];
    }
  },

  getRecitations: async (batchId = null) => {
    try {
      const url = batchId ? `${API_BASE}/recitations?batch_id=${encodeURIComponent(batchId)}` : `${API_BASE}/recitations`;
      const res = await fetch(url);
      const data = await res.json();
      return data.success ? data.data : [];
    } catch (err) {
      console.warn('[API Service] getRecitations error:', err.message);
      return [];
    }
  },

  submitTajweedEvaluation: async (recitationId, evalData) => {
    try {
      const res = await fetch(`${API_BASE}/recitations/${encodeURIComponent(recitationId)}/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evalData)
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] submitTajweedEvaluation error:', err.message);
      return { success: false, error: err.message };
    }
  },

  // 10. Astronomical Prayer Times & Qibla
  getPrayerTimes: async (params = {}) => {
    try {
      const qs = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/tools/prayer-times${qs ? '?' + qs : ''}`);
      return await res.json();
    } catch (err) {
      console.warn('[API Service] getPrayerTimes error:', err.message);
      return { success: false, error: err.message };
    }
  },

  getQibla: async (params = {}) => {
    try {
      const qs = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/tools/qibla${qs ? '?' + qs : ''}`);
      return await res.json();
    } catch (err) {
      console.warn('[API Service] getQibla error:', err.message);
      return { success: false, error: err.message };
    }
  },

  // 11. Single-Session / Multi-Device Restriction (BRD Section 43)
  checkSession: async (userId, sessionToken) => {
    try {
      const res = await fetch(`${API_BASE}/auth/session-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, session_token: sessionToken })
      });
      return await res.json();
    } catch (err) {
      return { success: true, valid: true }; // network resilience
    }
  },

  simulateSecondDevice: async (userId, deviceName) => {
    try {
      const res = await fetch(`${API_BASE}/auth/simulate-second-device`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, device_name: deviceName })
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // 12. Payments, Certificates, Notifications & Moderation
  getPayments: async (studentId) => {
    try {
      const url = studentId ? `${API_BASE}/payments?student_id=${encodeURIComponent(studentId)}` : `${API_BASE}/payments`;
      const res = await fetch(url);
      const data = await res.json();
      return data.success ? data.data : [];
    } catch (err) {
      return [];
    }
  },

  createPayment: async (paymentData) => {
    try {
      const res = await fetch(`${API_BASE}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  getCertificates: async (studentId) => {
    try {
      const url = studentId ? `${API_BASE}/certificates?student_id=${encodeURIComponent(studentId)}` : `${API_BASE}/certificates`;
      const res = await fetch(url);
      const data = await res.json();
      return data.success ? data.data : [];
    } catch (err) {
      return [];
    }
  },

  createCertificate: async (certData) => {
    try {
      const res = await fetch(`${API_BASE}/certificates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(certData)
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  getReports: async (status) => {
    try {
      const url = status ? `${API_BASE}/reports?status=${encodeURIComponent(status)}` : `${API_BASE}/reports`;
      const res = await fetch(url);
      const data = await res.json();
      return data.success ? data.data : [];
    } catch (err) {
      return [];
    }
  },

  createReport: async (reportData) => {
    try {
      const res = await fetch(`${API_BASE}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  getDepartments: async () => {
    try {
      const res = await fetch(`${API_BASE}/departments`);
      const data = await res.json();
      return data.success ? data.data : [];
    } catch (err) {
      console.warn('[API Service] getDepartments error:', err.message);
      return [];
    }
  },

  getNotifications: async (userId) => {
    try {
      const url = userId ? `${API_BASE}/notifications?user_id=${userId}` : `${API_BASE}/notifications`;
      const res = await fetch(url);
      const data = await res.json();
      return data.success ? data.data : [];
    } catch (err) {
      console.warn('[API Service] getNotifications error:', err.message);
      return [];
    }
  },

  markNotificationRead: async (notifId = 'all') => {
    try {
      const res = await fetch(`${API_BASE}/notifications/${notifId}/read`, {
        method: 'POST'
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] markNotificationRead error:', err.message);
      return { success: false, error: err.message };
    }
  },

  createRecitation: async (recitationData) => {
    try {
      const res = await fetch(`${API_BASE}/recitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recitationData)
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] createRecitation error:', err.message);
      return { success: false, error: err.message };
    }
  },

  gradeRecitation: async (recitationId, gradeData) => {
    try {
      const res = await fetch(`${API_BASE}/recitations/${encodeURIComponent(recitationId)}/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gradeData)
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] gradeRecitation error:', err.message);
      return { success: false, error: err.message };
    }
  },

  // SMTP Settings & Live Testing
  getSmtpSettings: async () => {
    try {
      const res = await fetch(`${API_BASE}/settings/smtp`);
      return await res.json();
    } catch (err) {
      console.warn('[API Service] getSmtpSettings error:', err.message);
      return { success: false, error: err.message };
    }
  },

  saveSmtpSettings: async (settings) => {
    try {
      const res = await fetch(`${API_BASE}/settings/smtp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] saveSmtpSettings error:', err.message);
      return { success: false, error: err.message };
    }
  },

  testSmtpConnection: async (payload) => {
    try {
      const res = await fetch(`${API_BASE}/settings/smtp/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Service] testSmtpConnection error:', err.message);
      return { success: false, error: err.message };
    }
  }
};

// Export to window object for standalone React scripts
if (typeof window !== 'undefined') {
  window.apiService = apiService;
}
