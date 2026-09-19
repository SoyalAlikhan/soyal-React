// ============================================================================
// Al-Noor Islamic Learning Platform — Relational Database Connection (node:sqlite)
// High-performance, zero-external-software C-speed SQLite engine built into Node v26
// ============================================================================

const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'alnoor_lms.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

// Initialize Database Instance
const db = new DatabaseSync(DB_PATH);

// Initialize Tables from Schema if needed
function initSchema() {
  if (fs.existsSync(SCHEMA_PATH)) {
    const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf8');
    db.exec(schemaSql);
  }
}

initSchema();

// Helper: Query multiple rows
function queryAll(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    return stmt.all(...params);
  } catch (err) {
    console.error(`[DB ERROR - queryAll] SQL: ${sql}`, err.message);
    throw err;
  }
}

// Helper: Query a single row
function queryOne(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    return stmt.get(...params) || null;
  } catch (err) {
    console.error(`[DB ERROR - queryOne] SQL: ${sql}`, err.message);
    throw err;
  }
}

// Helper: Execute INSERT, UPDATE, DELETE
function execute(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    return stmt.run(...params);
  } catch (err) {
    console.error(`[DB ERROR - execute] SQL: ${sql}`, err.message);
    throw err;
  }
}

// Helper: List all tables with live row counts
function listTablesWithCounts() {
  const tables = queryAll(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name NOT LIKE 'sqlite_%'
    ORDER BY name ASC
  `);
  
  return tables.map(t => {
    try {
      const countResult = queryOne(`SELECT COUNT(*) as count FROM "${t.name}"`);
      return {
        table: t.name,
        rowCount: countResult ? countResult.count : 0
      };
    } catch {
      return { table: t.name, rowCount: 0 };
    }
  });
}

module.exports = {
  db,
  queryAll,
  queryOne,
  execute,
  listTablesWithCounts
};
