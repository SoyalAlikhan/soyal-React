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
  }
};

// Export to window object for standalone React scripts
if (typeof window !== 'undefined') {
  window.apiService = apiService;
}
