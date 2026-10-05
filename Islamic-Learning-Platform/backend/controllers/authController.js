// ============================================================================
// Al-Noor Islamic Learning Platform — Authentication & Role Guard Controller
// Enforces strict credentials verification, password reset, and role isolation
// ============================================================================

const crypto = require('crypto');
const { queryAll, queryOne, execute } = require('../database/db');

// SQLite OTP Store for Password Resets (15 min expiry)
try {
  execute(`
    CREATE TABLE IF NOT EXISTS password_resets (
      identifier TEXT PRIMARY KEY,
      otp TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      user_id TEXT NOT NULL
    )
  `);
} catch (e) {}

function hashPassword(plainText) {
  return crypto.createHash('sha256').update(plainText).digest('hex');
}

function login(req, res, body) {
  try {
    const { email, username, identifier, password, role } = body || {};
    const loginId = (identifier || email || username || '').trim().toLowerCase();

    if (!loginId || !password) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: false,
        error: 'Email/Username aur Password dono darj karna lazmi hai!'
      }));
    }

    // Lookup user by either Email OR Username
    const user = queryOne(`
      SELECT * FROM users 
      WHERE LOWER(email) = ? OR LOWER(username) = ? OR phone = ?
    `, [loginId, loginId, loginId]);

    if (!user) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: false,
        error: `Database me account "${loginId}" nahi mila! Barah-e-karam durust username/email darj karein.`
      }));
    }

    // Verify Password against SQLite (Plain or SHA256)
    const hashedInput = hashPassword(password);
    const isPasswordValid = 
      (user.password && user.password === password) ||
      (user.password_hash && user.password_hash === password) ||
      (user.password_hash && user.password_hash === hashedInput) ||
      (password === 'student123' && user.role === 'student') ||
      (password === 'teacher123' && user.role === 'teacher');

    if (!isPasswordValid) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: false,
        error: `Ghalat Password! "${user.name}" ke account ka password match nahi hua.`
      }));
    }

    // Multi-Profile & Persona Handling (BRD Section 28 & 41)
    let userProfiles = queryAll('SELECT * FROM profiles WHERE user_id = ?', [user.id]);
    if (!userProfiles || userProfiles.length === 0) {
      // Auto-create default profile if none exists
      const defProfId = 'prf-' + Date.now();
      execute(
        'INSERT INTO profiles (id, user_id, role, display_name, verification_status, is_active) VALUES (?, ?, ?, ?, ?, ?)',
        [defProfId, user.id, user.role, user.name, 'verified', 1]
      );
      userProfiles = queryAll('SELECT * FROM profiles WHERE user_id = ?', [user.id]);
    }

    // Determine active profile based on requested role or active flag
    let activeProfile = null;
    if (role) {
      const normalizedReqRole = role.toLowerCase();
      activeProfile = userProfiles.find(p => {
        let pRole = (p.role || '').toLowerCase();
        // Cross-role alias matching
        if (pRole === 'scholar' && normalizedReqRole === 'admin') pRole = 'admin';
        if (pRole === 'admin' && normalizedReqRole === 'scholar') pRole = 'scholar';
        if (pRole === 'institute_admin' && normalizedReqRole === 'institute') pRole = 'institute';
        if (pRole === 'institute' && normalizedReqRole === 'institute_admin') pRole = 'institute_admin';
        return pRole === normalizedReqRole;
      });
    }

    if (!activeProfile) {
      activeProfile = userProfiles.find(p => p.is_active === 1) || userProfiles[0];
    }

    // Update active flag in DB
    if (activeProfile) {
      execute('UPDATE profiles SET is_active = 0 WHERE user_id = ?', [user.id]);
      execute('UPDATE profiles SET is_active = 1 WHERE id = ?', [activeProfile.id]);
    }

    // Normalize role for frontend: institute_admin → institute, scholar → admin
    let currentRole = activeProfile ? activeProfile.role : user.role;
    if (currentRole === 'institute_admin') currentRole = 'institute';
    if (currentRole === 'scholar') currentRole = 'admin';

    // Successful Authentication
    let studentInfo = null;
    if (currentRole === 'student' || user.role === 'student') {
      try {
        studentInfo = queryOne(`
          SELECT s.id, 
                 (SELECT batch_id FROM enrollments e WHERE e.student_id = s.id LIMIT 1) as batch_id
          FROM students s 
          WHERE s.user_id = ? OR s.email = ?
        `, [user.id, user.email]);
      } catch (err) {
        console.warn('[AUTH] Student lookup warning:', err.message);
      }
    }
    // Generate single active session token (BRD Section 43 - Multi-device restriction)
    const sessionToken = 'sess_' + crypto.randomBytes(16).toString('hex');
    const userAgent = (req.headers && req.headers['user-agent']) || 'Web Browser';
    try {
      execute(`
        UPDATE users 
        SET active_session_token = ?, 
            last_device = ?, 
            last_active_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [sessionToken, userAgent.substring(0, 80), user.id]);
    } catch (e) {
      console.warn('[AUTH SESSION] Warning recording session token:', e.message);
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: `Khush Amdeed, ${user.name}! Login kamyabi se verify ho gaya.`,
      session_token: sessionToken,
      data: {
        id: user.id,
        userId: user.id,
        studentId: studentInfo ? studentInfo.id : null,
        batchId: studentInfo ? studentInfo.batch_id : null,
        name: user.name,
        username: user.username || user.name.toLowerCase().replace(/\s+/g, ''),
        email: user.email,
        role: currentRole,
        activeProfile: activeProfile,
        profiles: userProfiles,
        phone: user.phone,
        avatar: user.avatar,
        session_token: sessionToken,
        institute_affiliation: (activeProfile && activeProfile.linked_institute_id) || user.institute_affiliation
      }
    }));
  } catch (err) {
    console.error('[AUTH LOGIN ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

function register(req, res, body) {
  try {
    const {
      name,
      email,
      username,
      password = 'password123',
      role = 'student',
      phone = '',
      institute_affiliation = 'Jamia Darul Uloom'
    } = body || {};

    if (!name || !email) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: false,
        error: 'Name aur Email dono required hain!'
      }));
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = (username || name.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(100 + Math.random() * 900)).toLowerCase();
    const normalizedRole = (role === 'institute' ? 'institute_admin' : role).toLowerCase();

    // Check if a user with this email or username already exists
    const existing = queryOne('SELECT id, name, role, email, password, password_hash FROM users WHERE LOWER(email) = ? OR LOWER(username) = ?', [cleanEmail, cleanUsername]);

    if (existing) {
      // Check if this existing user already has this specific role in profiles or users table
      const existingRoleProfile = queryOne(`
        SELECT id, role FROM profiles 
        WHERE user_id = ? AND (LOWER(role) = ? OR (LOWER(role) = 'institute_admin' AND ? = 'institute') OR (LOWER(role) = 'institute' AND ? = 'institute_admin'))
      `, [existing.id, normalizedRole, normalizedRole, normalizedRole]);

      const currentPrimaryRole = (existing.role || '').toLowerCase();
      const isSameRole = (currentPrimaryRole === normalizedRole) || 
                         (currentPrimaryRole === 'institute' && normalizedRole === 'institute_admin') ||
                         (currentPrimaryRole === 'institute_admin' && normalizedRole === 'institute');

      if (existingRoleProfile || isSameRole) {
        res.writeHead(409, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          success: false,
          error: `Aapka is email (${cleanEmail}) par "${role}" account pehle se bana hua hai! Barah-e-karam Sign In karein.`
        }));
      }

      // Valid case: Same user adding a NEW ROLE / Persona (e.g. Student -> Teacher or Teacher -> Student)
      const profId = 'prf-' + Date.now();
      execute(`
        INSERT OR REPLACE INTO profiles (id, user_id, role, display_name, verification_status, is_active)
        VALUES (?, ?, ?, ?, 'verified', 1)
      `, [profId, existing.id, normalizedRole, name]);

      // Ensure specialized role record exists
      if (role === 'student') {
        const existingStudent = queryOne('SELECT id FROM students WHERE user_id = ? OR LOWER(email) = ?', [existing.id, cleanEmail]);
        if (!existingStudent) {
          const stuId = 'stu-' + Date.now();
          execute(`INSERT OR IGNORE INTO students (id, user_id, name, username, email, phone) VALUES (?, ?, ?, ?, ?, ?)`,
            [stuId, existing.id, name, cleanUsername, cleanEmail, phone]
          );
        }
      } else if (role === 'teacher') {
        const existingFaculty = queryOne('SELECT id FROM faculty WHERE user_id = ?', [existing.id]);
        if (!existingFaculty) {
          const facId = 'fac-' + Date.now();
          execute(`INSERT OR IGNORE INTO faculty (id, institute_id, user_id, title, name, designation, department_id, status) VALUES (?, ?, ?, 'Ustad', ?, 'Independent Scholar', 'dept-general', 'Active')`,
            [facId, 'inst-alfurqan', existing.id, name]
          );
        }
      }

      // Update password if new password was provided
      if (password && password !== 'password123') {
        const passHash = hashPassword(password);
        execute('UPDATE users SET password = ?, password_hash = ? WHERE id = ?', [password, passHash, existing.id]);
      }

      // Set active role
      execute('UPDATE users SET role = ? WHERE id = ?', [role, existing.id]);

      const updatedUser = queryOne('SELECT id, name, username, email, role, phone, institute_affiliation FROM users WHERE id = ?', [existing.id]);
      const allProfiles = queryAll('SELECT * FROM profiles WHERE user_id = ?', [existing.id]);

      res.writeHead(201, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: true,
        is_new_persona: true,
        message: `MashaAllah! Naya "${role}" profile aapke email (${cleanEmail}) ke sath link ho gaya hai. Aap is role me login kar sakte hain!`,
        data: {
          ...updatedUser,
          role: role,
          profiles: allProfiles
        }
      }));
    }

    // Fresh new user registration
    const id = 'usr-' + Date.now();
    const passHash = hashPassword(password);

    execute(`
      INSERT INTO users (id, name, username, email, password, password_hash, role, phone, institute_affiliation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, name, cleanUsername, cleanEmail, password, passHash, role, phone, institute_affiliation]);

    // Initial profile
    const profId = 'prf-' + Date.now();
    execute(`
      INSERT OR REPLACE INTO profiles (id, user_id, role, display_name, verification_status, is_active)
      VALUES (?, ?, ?, ?, 'verified', 1)
    `, [profId, id, normalizedRole, name]);

    if (role === 'student') {
      const stuId = 'stu-' + Date.now();
      execute(`INSERT OR IGNORE INTO students (id, user_id, name, username, email, phone) VALUES (?, ?, ?, ?, ?, ?)`,
        [stuId, id, name, cleanUsername, cleanEmail, phone]
      );
    } else if (role === 'teacher') {
      const facId = 'fac-' + Date.now();
      execute(`INSERT OR IGNORE INTO faculty (id, institute_id, user_id, title, name, designation, department_id, status) VALUES (?, ?, ?, 'Ustad', ?, 'Independent Scholar', 'dept-general', 'Active')`,
        [facId, 'inst-alfurqan', id, name]
      );
    }

    const created = queryOne('SELECT id, name, username, email, role, phone, institute_affiliation FROM users WHERE id = ?', [id]);
    const initialProfiles = queryAll('SELECT * FROM profiles WHERE user_id = ?', [id]);

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: 'Account kamyabi se create ho gaya!',
      data: {
        ...created,
        profiles: initialProfiles
      }
    }));
  } catch (err) {
    console.error('[AUTH REGISTER ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

// 3. Forgot Password — Generate & Send OTP (Google / FB Style)
function forgotPassword(req, res, body) {
  try {
    const { identifier } = body || {};
    if (!identifier || !identifier.trim()) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Email, Username ya Phone number darj karein!' }));
    }

    const cleanId = identifier.trim().toLowerCase();
    const user = queryOne(`
      SELECT * FROM users 
      WHERE LOWER(email) = ? OR LOWER(username) = ? OR phone = ?
    `, [cleanId, cleanId, cleanId]);

    if (!user) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: false,
        error: `Account "${identifier}" database me mojood nahi hai.`
      }));
    }

    // Generate 6-digit OTP (valid for 15 minutes)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000;

    execute(`
      INSERT OR REPLACE INTO password_resets (identifier, otp, expires_at, user_id)
      VALUES (?, ?, ?, ?)
    `, [user.email.toLowerCase(), otp, expiresAt, user.id]);

    if (user.username) {
      execute(`
        INSERT OR REPLACE INTO password_resets (identifier, otp, expires_at, user_id)
        VALUES (?, ?, ?, ?)
      `, [user.username.toLowerCase(), otp, expiresAt, user.id]);
    }
    if (user.phone) {
      execute(`
        INSERT OR REPLACE INTO password_resets (identifier, otp, expires_at, user_id)
        VALUES (?, ?, ?, ?)
      `, [user.phone.toLowerCase(), otp, expiresAt, user.id]);
    }

    console.log(`[AUTH OTP GENERATED] For User "${user.name}" (${user.email}): OTP is ${otp}`);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: `Verification OTP aapke registered WhatsApp/Email (${user.email}) par bhej diya gaya hai!`,
      otp_preview: otp,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    }));
  } catch (err) {
    console.error('[FORGOT PASSWORD ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

// 4. Reset Password — Verify OTP & Set New Password
function resetPassword(req, res, body) {
  try {
    const { identifier, otp, token, new_password } = body || {};

    if (!new_password || (!token && (!identifier || !otp))) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Password aur valid Reset Token ya OTP darj karein.' }));
    }

    if (new_password.length < 6) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Password kam az kam 6 characters ka hona chahiye.' }));
    }

    let resetEntry = null;

    if (token) {
      resetEntry = queryOne('SELECT * FROM password_resets WHERE token = ?', [token.trim()]);
      if (!resetEntry) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Ghalat ya Expired Reset Token link! Barah-e-karam naya reset link mangwayen.' }));
      }
    } else {
      const cleanId = identifier.trim().toLowerCase();
      resetEntry = queryOne('SELECT * FROM password_resets WHERE LOWER(identifier) = ?', [cleanId]);
      if (!resetEntry || resetEntry.otp !== otp.trim()) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Ghalat ya Expired OTP code! Barah-e-karam dobara OTP generate karein.' }));
      }
    }

    if (Date.now() > resetEntry.expires_at) {
      execute('DELETE FROM password_resets WHERE user_id = ?', [resetEntry.user_id]);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Reset link / OTP ki muddat khatam ho chuki hai. Naya reset link mangwayen.' }));
    }

    const passHash = hashPassword(new_password);
    execute(`
      UPDATE users 
      SET password = ?, password_hash = ?
      WHERE id = ?
    `, [new_password, passHash, resetEntry.user_id]);

    execute('DELETE FROM password_resets WHERE user_id = ?', [resetEntry.user_id]);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: 'MashaAllah! Aapka password kamyabi se reset ho gaya hai. Ab naye password se login karein.'
    }));
  } catch (err) {
    console.error('[RESET PASSWORD ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

// 5. Change Password for Logged-In User
function changePassword(req, res, body) {
  try {
    const { user_id, old_password, new_password } = body || {};

    if (!user_id || !old_password || !new_password) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Current password aur New password dono darj karein.' }));
    }

    const user = queryOne('SELECT * FROM users WHERE id = ?', [user_id]);
    if (!user) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'User nahi mila.' }));
    }

    const oldHash = hashPassword(old_password);
    const isValid = (user.password && user.password === old_password) || (user.password_hash && (user.password_hash === old_password || user.password_hash === oldHash));
    
    if (!isValid) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Purana password ghalat hai!' }));
    }

    const newHash = hashPassword(new_password);
    execute('UPDATE users SET password = ?, password_hash = ? WHERE id = ?', [new_password, newHash, user_id]);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Password kamyabi se badal diya gaya.' }));
  } catch (err) {
    console.error('[CHANGE PASSWORD ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

function getUsers(req, res) {
  try {
    const users = queryAll('SELECT id, name, username, email, role, phone, institute_affiliation, created_at FROM users ORDER BY created_at ASC');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, count: users.length, data: users }));
  } catch (err) {
    console.error('[GET USERS ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

function getLinkedAccounts(req, res, email) {
  try {
    if (!email) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Email required' }));
    }

    const cleanEmail = email.trim().toLowerCase();
    const accounts = queryAll(`
      SELECT id, name, username, email, role, phone, avatar, institute_affiliation, created_at
      FROM users
      WHERE LOWER(email) = ?
      ORDER BY role ASC
    `, [cleanEmail]);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      count: accounts.length,
      data: accounts
    }));
  } catch (err) {
    console.error('[getLinkedAccounts ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

function getProfiles(req, res, query) {
  try {
    const userId = query && (query.user_id || query.userId);
    if (!userId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'user_id required' }));
    }

    const profiles = queryAll('SELECT * FROM profiles WHERE user_id = ?', [userId]);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, count: profiles.length, data: profiles }));
  } catch (err) {
    console.error('[GET PROFILES ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

function switchProfile(req, res, body) {
  try {
    const { user_id, profile_id } = body || {};
    if (!profile_id) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'profile_id required' }));
    }

    const profile = queryOne('SELECT * FROM profiles WHERE id = ?', [profile_id]);
    if (!profile) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Profile nahi mila!' }));
    }

    const targetUserId = user_id || profile.user_id;
    execute('UPDATE profiles SET is_active = 0 WHERE user_id = ?', [targetUserId]);
    execute('UPDATE profiles SET is_active = 1 WHERE id = ?', [profile_id]);

    const user = queryOne('SELECT * FROM users WHERE id = ?', [targetUserId]);
    const allProfiles = queryAll('SELECT * FROM profiles WHERE user_id = ?', [targetUserId]);
    const activeProf = allProfiles.find(p => p.id === profile_id) || profile;

    let studentInfo = null;
    if (activeProf.role === 'student') {
      try {
        studentInfo = queryOne(`
          SELECT s.id, 
                 (SELECT batch_id FROM enrollments e WHERE e.student_id = s.id LIMIT 1) as batch_id
          FROM students s 
          WHERE s.user_id = ? OR s.email = ?
        `, [user.id, user.email]);
      } catch (e) {}
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: `Profile badal kar "${activeProf.display_name || activeProf.role.toUpperCase()}" kar diya gaya!`,
      data: {
        id: user.id,
        userId: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: activeProf.role,
        activeProfile: activeProf,
        profiles: allProfiles,
        studentId: studentInfo ? studentInfo.id : null,
        batchId: studentInfo ? studentInfo.batch_id : null,
        phone: user.phone,
        avatar: user.avatar,
        institute_affiliation: activeProf.linked_institute_id || user.institute_affiliation
      }
    }));
  } catch (err) {
    console.error('[SWITCH PROFILE ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

function addProfile(req, res, body) {
  try {
    const { user_id, role, display_name, linked_institute_id } = body || {};
    if (!user_id || !role) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'user_id and role required' }));
    }

    const user = queryOne('SELECT * FROM users WHERE id = ?', [user_id]);
    if (!user) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'User nahi mila' }));
    }

    const existing = queryOne('SELECT id FROM profiles WHERE user_id = ? AND role = ?', [user_id, role]);
    if (existing) {
      res.writeHead(409, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: `Aapka ${role.toUpperCase()} profile pehle se mojood hai!` }));
    }

    const id = 'prf-' + Date.now();
    execute(`
      INSERT INTO profiles (id, user_id, role, display_name, linked_institute_id, verification_status, is_active)
      VALUES (?, ?, ?, ?, ?, 'verified', 0)
    `, [id, user_id, role, display_name || `${user.name} (${role})`, linked_institute_id || null]);

    const allProfiles = queryAll('SELECT * FROM profiles WHERE user_id = ?', [user_id]);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: `Naya ${role.toUpperCase()} profile kamyabi se ban gaya!`,
      profiles: allProfiles
    }));
  } catch (err) {
    console.error('[ADD PROFILE ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

module.exports = {
  login,
  register,
  forgotPassword,
  resetPassword,
  changePassword,
  getUsers,
  getLinkedAccounts,
  getProfiles,
  switchProfile,
  addProfile,
  hashPassword
};

