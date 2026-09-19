// Mahana Chanda, Waqf & Fee Ledger Controller
const { queryAll, queryOne, execute } = require('../database/db');

function getChandaLedger(req, res) {
  try {
    const ledger = queryAll('SELECT * FROM chanda_ledger ORDER BY created_at DESC');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, count: ledger.length, data: ledger }));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

function recordChanda(req, res, body) {
  try {
    const id = 'CH-' + Date.now();
    const receipt_no = 'RCP-' + Math.floor(10000 + Math.random() * 90000);
    const {
      institute_id = 'inst-darululoom-1',
      student_or_donor,
      fund_category,
      amount,
      payment_mode = 'Instant UPI QR'
    } = body;

    execute(`
      INSERT INTO chanda_ledger (id, institute_id, student_or_donor, fund_category, amount, payment_mode, receipt_no)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, institute_id, student_or_donor, fund_category, parseInt(amount, 10), payment_mode, receipt_no]);

    const created = queryOne('SELECT * FROM chanda_ledger WHERE id = ?', [id]);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Fee/Chanda recorded successfully', data: created }));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

module.exports = {
  getChandaLedger,
  recordChanda
};
