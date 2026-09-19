// Database Visualizer & Explorer Controller
// Enables direct browser-based inspection of all database tables, columns, and records
const { queryAll, queryOne, execute } = require('../database/db');

// Whitelist of valid application tables
function getValidTables() {
  const rows = queryAll("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
  return rows.map(r => r.name);
}

function getDatabaseOverview(req, res) {
  try {
    const validTables = getValidTables();
    const overview = validTables.map(tableName => {
      const countResult = queryOne(`SELECT COUNT(*) as count FROM "${tableName}"`);
      const columns = queryAll(`PRAGMA table_info("${tableName}")`);
      return {
        name: tableName,
        rowCount: countResult ? countResult.count : 0,
        columns: columns.map(c => ({ name: c.name, type: c.type, pk: !!c.pk }))
      };
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, database: 'alnoor_lms.db', tables: overview }));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

function getTableRecords(req, res, tableName, queryParams = {}) {
  try {
    const validTables = getValidTables();
    if (!validTables.includes(tableName)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: `Invalid table: ${tableName}` }));
    }

    const limit = parseInt(queryParams.limit, 10) || 50;
    const page = parseInt(queryParams.page, 10) || 1;
    const offset = (page - 1) * limit;
    const search = queryParams.search ? queryParams.search.trim() : '';

    const columns = queryAll(`PRAGMA table_info("${tableName}")`);
    const countResult = queryOne(`SELECT COUNT(*) as total FROM "${tableName}"`);
    const totalRows = countResult ? countResult.total : 0;

    let sql = `SELECT * FROM "${tableName}"`;
    const params = [];

    if (search) {
      const textCols = columns.filter(c => c.type.includes('TEXT') || c.type.includes('CHAR'));
      if (textCols.length > 0) {
        const searchConditions = textCols.map(c => `"${c.name}" LIKE ?`).join(' OR ');
        sql += ` WHERE ${searchConditions}`;
        textCols.forEach(() => params.push(`%${search}%`));
      }
    }

    sql += ` LIMIT ${limit} OFFSET ${offset}`;
    const rows = queryAll(sql, params);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      table: tableName,
      totalRows,
      page,
      limit,
      columns: columns.map(c => c.name),
      rows
    }));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

function executeConsoleQuery(req, res, body) {
  try {
    const rawSql = (body.query || '').trim();
    if (!rawSql) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Query cannot be empty' }));
    }

    const firstWord = rawSql.split(/\s+/)[0].toUpperCase();
    if (['SELECT', 'PRAGMA', 'EXPLAIN'].includes(firstWord)) {
      const rows = queryAll(rawSql);
      const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, type: 'SELECT', rowCount: rows.length, columns, rows }));
    } else {
      const result = execute(rawSql);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, type: firstWord, affectedRows: result.changes }));
    }
  } catch (err) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

module.exports = {
  getDatabaseOverview,
  getTableRecords,
  executeConsoleQuery
};
