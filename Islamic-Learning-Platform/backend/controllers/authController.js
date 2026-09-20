// ============================================================================
// Al-Noor Islamic Learning Platform — Authentication & Role Guard Controller
// Enforces strict credentials verification & prevents cross-role authorization leaks
// ============================================================================

const { queryAll, queryOne, execute } = require('../database/db');

function login(req, res, body) {
  try {
    const { email, password, role } = body || {};

    if (!email || !password) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: false,
        error: 'Email aur Password dono darj karna lazmi hai!'
      }));
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = queryOne('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);

    if (!user) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: false,
        error: `Database me email "${email}" ka koi account nahi mila! Barah-e-karam durust credentials darj karein.`
      }));
    }

    // Verify Password against SQLite
    const isPasswordValid = (user.password && user.password === password) ||
      (user.password_hash && user.password_hash === password);

    if (!isPasswordValid) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: false,
        error: `Ghalat Password! "${user.name}" ke account ka password match nahi hua.`
      }));
    }

    // Strict Role Enforcement (BRD Section 03 & Role Isolation)
    if (role) {
      const normalizedReqRole = role.toLowerCase();
      let normalizedUserRole = (user.role || '').toLowerCase();
      
      // Map scholar/admin interchangeably
      if (normalizedUserRole === 'scholar' && normalizedReqRole === 'admin') normalizedUserRole = 'admin';
      if (normalizedUserRole === 'admin' && normalizedReqRole === 'scholar') normalizedUserRole = 'scholar';

      if (normalizedUserRole !== normalizedReqRole) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          success: false,
          error: `[ROLES MISMATCH] Yeh account "${user.role.toUpperCase()}" ke taur par registered hai. Aap "${role.toUpperCase()}" portal me is ID se login nahi kar sakte! Barah-e-karam sahi role select karein.`
        }));
      }
    }

    // Successful Authentication
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: `Khush Amdeed, ${user.name}! Login kamyabi se verify ho gaya.`,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        institute_affiliation: user.institute_affiliation
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
    const existing = queryOne('SELECT id FROM users WHERE LOWER(email) = ?', [cleanEmail]);

    if (existing) {
      res.writeHead(409, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: false,
        error: `Yeh email "${cleanEmail}" pehle se registered hai! Barah-e-karam Login karein.`
      }));
    }

    const id = 'usr-' + Date.now();
    execute(`
      INSERT INTO users (id, name, email, password, role, phone, institute_affiliation)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, name, cleanEmail, password, role, phone, institute_affiliation]);

    const created = queryOne('SELECT id, name, email, role, phone, institute_affiliation FROM users WHERE id = ?', [id]);

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: 'Account kamyabi se create ho gaya!',
      data: created
    }));
  } catch (err) {
    console.error('[AUTH REGISTER ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

function getUsers(req, res) {
  try {
    const users = queryAll('SELECT id, name, email, role, phone, institute_affiliation, created_at FROM users ORDER BY created_at ASC');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, count: users.length, data: users }));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

module.exports = {
  login,
  register,
  getUsers
};
