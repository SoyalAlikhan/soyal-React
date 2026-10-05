const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const { queryOne, execute } = require('../database/db');

let cachedTransporter = null;
let cachedFromAddress = null;

function getDbSetting(key) {
  try {
    const row = queryOne('SELECT value FROM system_settings WHERE key = ?', [key]);
    return row ? row.value : null;
  } catch (e) {
    return null;
  }
}

function setDbSetting(key, val) {
  try {
    execute('INSERT OR REPLACE INTO system_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)', [key, val]);
  } catch (e) {
    console.warn(`[DB SETTING ERROR] Failed to save ${key}:`, e.message);
  }
}

function reloadTransporter() {
  cachedTransporter = null;
  cachedFromAddress = null;
  console.log('[EMAIL SERVICE] Transporter cache cleared for dynamic reload.');
}

async function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  // 1. Check for real SMTP settings in database (UI configured)
  const dbHost = getDbSetting('smtp_host');
  const dbUser = getDbSetting('smtp_user');
  const dbPass = getDbSetting('smtp_pass');
  const dbPort = getDbSetting('smtp_port');
  const dbSecure = getDbSetting('smtp_secure');
  const dbFromName = getDbSetting('smtp_from_name');
  const dbFromEmail = getDbSetting('smtp_from_email');

  // 2. Check for real SMTP settings in environment as fallback
  const host = dbHost || process.env.SMTP_HOST;
  const user = dbUser || process.env.SMTP_USER;
  const pass = dbPass || process.env.SMTP_PASS;
  const port = parseInt(dbPort || process.env.SMTP_PORT || '587', 10);
  const secure = dbSecure ? dbSecure === 'true' : (port === 465);

  const fromName = dbFromName || 'School of Deeni Ilm';
  const fromEmail = dbFromEmail || user || 'no-reply@alnoor.edu';
  cachedFromAddress = `"${fromName}" <${fromEmail}>`;

  if (host && user && pass) {
    try {
      cachedTransporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass }
      });
      console.log(`[EMAIL SERVICE] Connected to real production SMTP host: ${host} (User: ${user}, Port: ${port}, Secure: ${secure})`);
      return cachedTransporter;
    } catch (err) {
      console.error('[EMAIL SERVICE] Production SMTP creation error:', err.message);
    }
  }

  // 3. Fallback: Ethereal test sandbox
  try {
    const testAccount = await nodemailer.createTestAccount();
    cachedTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    console.log(`[EMAIL SERVICE] Initialized fallback test SMTP delivery via Ethereal: ${testAccount.user}`);
    return cachedTransporter;
  } catch (err) {
    console.warn(`[EMAIL SERVICE] Fallback transporter warning: ${err.message}`);
    cachedTransporter = nodemailer.createTransport({
      jsonTransport: true
    });
    return cachedTransporter;
  }
}

function getSmtpConfig() {
  const host = getDbSetting('smtp_host') || process.env.SMTP_HOST || '';
  const port = getDbSetting('smtp_port') || process.env.SMTP_PORT || '465';
  const secure = getDbSetting('smtp_secure') !== null ? (getDbSetting('smtp_secure') === 'true') : (port === '465');
  const user = getDbSetting('smtp_user') || process.env.SMTP_USER || '';
  const pass = getDbSetting('smtp_pass') || process.env.SMTP_PASS || '';
  const fromName = getDbSetting('smtp_from_name') || 'Al-Furqan Academy & School of Deeni Ilm';
  const fromEmail = getDbSetting('smtp_from_email') || user || '';

  const isLive = !!(host && user && pass);
  return {
    host,
    port,
    secure,
    user,
    pass_configured: !!pass,
    has_password: !!pass,
    from_name: fromName,
    from_email: fromEmail,
    is_live: isLive,
    is_sandbox: !isLive
  };
}

function saveSmtpConfig({ host, port, secure, user, pass, from_name, from_email }) {
  if (host !== undefined) setDbSetting('smtp_host', host.trim());
  if (port !== undefined) setDbSetting('smtp_port', port.toString().trim());
  if (secure !== undefined) setDbSetting('smtp_secure', secure ? 'true' : 'false');
  if (user !== undefined) setDbSetting('smtp_user', user.trim());
  if (pass !== undefined && pass.trim().length > 0) setDbSetting('smtp_pass', pass.trim());
  if (from_name !== undefined) setDbSetting('smtp_from_name', from_name.trim());
  if (from_email !== undefined) setDbSetting('smtp_from_email', from_email.trim());

  reloadTransporter();
  return getSmtpConfig();
}

async function testSmtpConnection(testTo, customSettings = null) {
  let transporter;
  let fromAddr;

  if (customSettings && customSettings.host && customSettings.user) {
    const port = parseInt(customSettings.port || '465', 10);
    const secure = customSettings.secure !== undefined ? customSettings.secure : (port === 465);
    transporter = nodemailer.createTransport({
      host: customSettings.host.trim(),
      port,
      secure,
      auth: {
        user: customSettings.user.trim(),
        pass: customSettings.pass ? customSettings.pass.trim() : (getDbSetting('smtp_pass') || '')
      }
    });
    fromAddr = `"${customSettings.from_name || 'Al-Noor Platform'}" <${customSettings.from_email || customSettings.user}>`;
  } else {
    transporter = await getTransporter();
    fromAddr = cachedFromAddress || '"School of Deeni Ilm" <no-reply@alnoor.edu>';
  }

  // 1. Verify connection
  await transporter.verify();

  // 2. Send actual test email
  const info = await transporter.sendMail({
    from: fromAddr,
    to: testTo,
    subject: '✦ Test Email from Islamic Learning Platform (SMTP Verified)',
    text: `Assalamu Alaikum,\n\nYeh test email yeh tasdeeq karne ke liye bheja gaya hai ke aapka SMTP server live emails bhejne ke liye 100% kamyab tareeqe se connect ho chuka hai.\n\nTimestamp: ${new Date().toLocaleString()}\n\nJazakAllahu Khaira.`,
    html: `
      <div style="font-family:'Segoe UI', Tahoma, sans-serif;max-width:560px;margin:20px auto;background:#fff;border-radius:8px;border:1px solid #e1e7e4;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
        <div style="background:#0E1613;padding:20px 24px;border-bottom:3px solid #AD8A32;text-align:center;">
          <div style="font-size:20px;font-weight:700;color:#AD8A32;">✦ Islamic Learning Platform ✦</div>
          <div style="font-size:12px;color:#9aa8a1;margin-top:4px;">Live SMTP Email Service Active</div>
        </div>
        <div style="padding:24px;">
          <h3 style="color:#157254;margin-top:0;">✅ SMTP Connection &amp; Delivery Test Successful!</h3>
          <p style="font-size:14px;color:#394840;line-height:1.6;">
            Assalamu Alaikum wa Rahmatullahi wa Barakatuh,<br><br>
            Yeh email tasdeeq karta hai ke aapka SMTP Mail Server configuration kamyabi se verify ho chuka hai. Ab tamam student enrollments aur faculty teacher appointments par real email unke inbox me pohnchenge.
          </p>
          <div style="background:#f9faf9;border:1px solid #e5ece8;padding:12px 16px;border-radius:6px;font-size:12px;color:#57655e;margin:16px 0;">
            <b>Sent To:</b> ${testTo}<br>
            <b>Sent At:</b> ${new Date().toLocaleString()}<br>
            <b>Status:</b> Delivered to Real Mailbox
          </div>
        </div>
        <div style="background:#f3f5f4;padding:14px 24px;text-align:center;font-size:11px;color:#78857f;">
          JazakAllahu Khaira · School of Deeni Ilm &amp; Al-Furqan Academy
        </div>
      </div>
    `
  });

  return {
    success: true,
    messageId: info.messageId,
    previewUrl: nodemailer.getTestMessageUrl(info) || null
  };
}

/**
 * Dispatch official Welcome Email with Course, Batch, Username, Temp Password, and Password Reset Link
 */
async function sendWelcomeEmail({
  to,
  studentName,
  instituteName,
  courseTitle,
  batchTitle,
  batchCode,
  classTime,
  scheduleDays,
  instructorName,
  courseLevel,
  courseMode,
  courseDuration,
  courseFee,
  courseDescription,
  username,
  tempPassword,
  isExistingStudent = false,
  resetUrl
}) {
  try {
    const transporter = await getTransporter();
    const instTitle = instituteName || 'School of Deeni Ilm';

    const subject = isExistingStudent
      ? `✦ Course Enrollment Confirmation — ${courseTitle} (${batchTitle})`
      : `✦ Welcome to ${instTitle} — Enrolled in ${courseTitle} (${batchTitle})`;

    const batchCodeDisplay = batchCode ? ` (${batchCode})` : '';
    const levelDisplay = courseLevel || 'Mubtadi / All Levels';
    const modeDisplay = courseMode || 'Interactive Live Halaqah';
    const daysDisplay = scheduleDays || 'Mon, Wed, Fri';
    const durationDisplay = courseDuration || 'Ongoing';
    const feeDisplay = courseFee || 'Standard Madrasa';
    const descRow = courseDescription ? `
      <div style="margin-top:12px;padding-top:10px;border-top:1px dashed #e9e4d0;font-size:12.5px;color:#4f5d56;line-height:1.5;">
        <b style="color:#0E1613;">Course Overview:</b> ${courseDescription}
      </div>` : '';

    const credsCard = isExistingStudent ? `
      <div class="card">
        <div class="card-title">🔐 Student Portal Access</div>
        <div class="info-row"><span class="info-label">Portal URL:</span><span class="info-val"><a href="http://localhost:8085" style="color:#157254;text-decoration:none;font-weight:700;">http://localhost:8085</a></span></div>
        <div class="info-row"><span class="info-label">Username / Login ID:</span><span class="info-val" style="color:#157254;">${username}</span></div>
        <div class="info-row"><span class="info-label">Registered Email:</span><span class="info-val">${to}</span></div>
        <div class="info-row"><span class="info-label">Password:</span><span class="info-val" style="color:#0E1613;">Aapka pehle se moujood password chalega (Existing Password)</span></div>
      </div>
    ` : `
      <div class="card">
        <div class="card-title">🔐 Student Portal Credentials</div>
        <div class="info-row"><span class="info-label">Username / Login ID:</span><span class="info-val" style="color:#157254;">${username}</span></div>
        <div class="info-row"><span class="info-label">Email:</span><span class="info-val">${to}</span></div>
        <div class="info-row"><span class="info-label">Temporary Password:</span><span class="info-val">${tempPassword || 'Student@2026'}</span></div>
      </div>
    `;

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7f9f8; margin: 0; padding: 20px; color: #1c2621; }
          .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 10px; border: 1px solid #e1e7e4; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.05); }
          .header { background: #0E1613; padding: 24px 30px; text-align: center; border-bottom: 3px solid #AD8A32; }
          .brand { font-size: 22px; font-weight: 700; color: #AD8A32; letter-spacing: 0.5px; }
          .subbrand { font-size: 13px; color: #9aa8a1; margin-top: 4px; }
          .content { padding: 30px; }
          .greeting { font-size: 18px; font-weight: 700; color: #0E1613; margin-bottom: 10px; }
          .badge { display: inline-block; background: rgba(21,114,84,0.1); color: #157254; font-weight: 700; font-size: 12px; padding: 5px 12px; border-radius: 4px; margin-bottom: 18px; border: 1px solid rgba(21,114,84,0.2); }
          .card { background: #fdfcf7; border: 1px solid #e9e4d0; border-radius: 8px; padding: 18px; margin: 20px 0; }
          .card-title { font-size: 14px; font-weight: 700; color: #AD8A32; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; border-bottom: 1px solid #e9e4d0; padding-bottom: 6px; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13.5px; }
          .info-label { color: #57655e; font-weight: 600; }
          .info-val { color: #0E1613; font-weight: 700; text-align: right; }
          .btn-reset { display: block; text-align: center; background: #157254; color: #ffffff !important; padding: 14px 24px; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 15px; margin: 25px 0 15px; letter-spacing: 0.5px; }
          .url-box { font-size: 11px; color: #6b7771; word-break: break-all; background: #f3f5f4; padding: 10px; border-radius: 4px; border: 1px solid #e1e7e4; }
          .footer { background: #f3f5f4; padding: 18px 30px; text-align: center; font-size: 12px; color: #78857f; border-top: 1px solid #e1e7e4; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="brand">✦ ${instTitle} ✦</div>
            <div class="subbrand">Open Islamic Learning &amp; Verified Scholars</div>
          </div>
          <div class="content">
            <div class="greeting">Assalamu Alaikum wa Rahmatullahi wa Barakatuh, ${studentName}!</div>
            <span class="badge">${isExistingStudent ? '🎉 Naye Course me Dakhila Mukammal' : 'Official Admission &amp; Enrollment Confirmation'}</span>
            
            <p style="font-size:14px;line-height:1.6;color:#394840;">
              Mubarak ho! Aapko <b>${instTitle}</b> ke naye course <b>${courseTitle}</b> ke batch <b>${batchTitle}</b> me shamil kar liya gaya hai. Naye course ki mukammal tafseelat darj zail hain:
            </p>

            <div class="card">
              <div class="card-title">📚 Course &amp; Batch Tafseelat (Details)</div>
              <div class="info-row"><span class="info-label">Institute / Idara:</span><span class="info-val">${instTitle}</span></div>
              <div class="info-row"><span class="info-label">Course Title:</span><span class="info-val">${courseTitle}</span></div>
              <div class="info-row"><span class="info-label">Batch:</span><span class="info-val">${batchTitle}${batchCodeDisplay}</span></div>
              <div class="info-row"><span class="info-label">Ustad / Teacher:</span><span class="info-val">${instructorName}</span></div>
              <div class="info-row"><span class="info-label">Class Timings:</span><span class="info-val" style="color:#157254;">${classTime}</span></div>
              <div class="info-row"><span class="info-label">Schedule Days:</span><span class="info-val">${daysDisplay}</span></div>
              <div class="info-row"><span class="info-label">Level &amp; Mode:</span><span class="info-val">${levelDisplay} · ${modeDisplay}</span></div>
              <div class="info-row"><span class="info-label">Duration:</span><span class="info-val">${durationDisplay}</span></div>
              <div class="info-row"><span class="info-label">Fee Model:</span><span class="info-val">${feeDisplay}</span></div>
              ${descRow}
            </div>

            ${credsCard}

            <p style="font-size:13.5px;color:#394840;line-height:1.5;">
              ${isExistingStudent ? 'Aap apne puraane password se login kar sakte hain ya agar naya password banana chahein to niche diye gaye link par click karein:' : 'Barah-e-karam niche diye gaye button par click karke foran apna naya secret password set karein:'}
            </p>

            <a href="${resetUrl}" class="btn-reset" target="_blank">🔑 ${isExistingStudent ? 'Update / Reset Password' : 'Set Your Password Now'}</a>

            <div style="font-size:12px;color:#57655e;margin-top:14px;">Direct portal / reset link:</div>
            <div class="url-box">${resetUrl}</div>

            <p style="font-size:12px;color:#85928b;margin-top:12px;"><i>Note: Yeh link 7 din ke liye valid hai.</i></p>
          </div>
          <div class="footer">
            JazakAllahu Khaira · ${instTitle} Administration<br>
            DPDP Compliant &amp; Shariah Regulated Islamic Learning Platform
          </div>
        </div>
      </body>
      </html>
    `;

    const textBody = `Assalamu Alaikum ${studentName},\n\n` +
      `Mubarak ho! Aapko ${instTitle} ke naye course "${courseTitle}" ke batch "${batchTitle}"${batchCodeDisplay} me shamil kar liya gaya hai.\n\n` +
      `📚 COURSE & BATCH DETAILS:\n` +
      `• Institute: ${instTitle}\n` +
      `• Course: ${courseTitle}\n` +
      `• Batch: ${batchTitle}${batchCodeDisplay}\n` +
      `• Ustad / Teacher: ${instructorName}\n` +
      `• Class Timings: ${classTime}\n` +
      `• Schedule Days: ${daysDisplay}\n` +
      `• Level & Mode: ${levelDisplay} · ${modeDisplay}\n` +
      `• Duration: ${durationDisplay}\n` +
      `• Fee Model: ${feeDisplay}\n` +
      (courseDescription ? `• Overview: ${courseDescription}\n\n` : `\n`) +
      `🔐 LOGIN ACCESS:\n` +
      `• Portal: http://localhost:8085\n` +
      `• Username: ${username}\n` +
      `• Password: ${isExistingStudent ? '(Aapka pehle se tay shuda password)' : (tempPassword || 'Student@2026')}\n\n` +
      `🔑 Password Reset Link (Valid for 7 days):\n${resetUrl}\n\n` +
      `JazakAllahu Khaira,\n${instTitle} Administration`;

    const info = await transporter.sendMail({
      from: `"${instTitle}" <no-reply@alnoor.edu>`,
      to: to,
      subject: subject,
      text: textBody,
      html: htmlBody
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`[EMAIL DISPATCH SUCCESS] Sent to: ${to} (Message ID: ${info.messageId})`);
    if (previewUrl) {
      console.log(`[EMAIL PREVIEW URL] View delivered email live: ${previewUrl}`);
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: previewUrl || null
    };
  } catch (err) {
    console.error(`[EMAIL DISPATCH ERROR] Failed to send email to ${to}:`, err.message);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Dispatch official Faculty Welcome Email to Teacher added by Institute Admin
 */
async function sendFacultyWelcomeEmail({
  to,
  teacherName,
  instituteName = 'Al-Furqan Islamic Academy',
  departmentName = 'Shoba-e-Tajweed',
  designation = 'Senior Ustad / Faculty Member',
  sanadDetails = 'Fazil Dars-e-Nizami',
  monthlyHadya = '25000',
  username,
  tempPassword,
  resetUrl
}) {
  try {
    const transporter = await getTransporter();

    const subject = `Welcome to ${instituteName} — Faculty Appointment & Login Credentials`;

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7f9f8; margin: 0; padding: 20px; color: #1c2621; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; border: 1px solid #e1e7e4; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.05); }
          .header { background: #0E1613; padding: 24px 30px; text-align: center; border-bottom: 3px solid #AD8A32; }
          .brand { font-size: 22px; font-weight: 700; color: #AD8A32; letter-spacing: 0.5px; }
          .subbrand { font-size: 13px; color: #9aa8a1; margin-top: 4px; }
          .content { padding: 30px; }
          .greeting { font-size: 18px; font-weight: 700; color: #0E1613; margin-bottom: 12px; }
          .badge { display: inline-block; background: rgba(173,138,50,0.15); color: #8A6B1F; font-weight: 700; font-size: 12px; padding: 4px 10px; border-radius: 4px; margin-bottom: 20px; }
          .card { background: #fdfcf7; border: 1px solid #e9e4d0; border-radius: 8px; padding: 18px; margin: 20px 0; }
          .card-title { font-size: 14px; font-weight: 700; color: #AD8A32; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; border-bottom: 1px solid #e9e4d0; padding-bottom: 6px; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13.5px; }
          .info-label { color: #57655e; font-weight: 600; }
          .info-val { color: #0E1613; font-weight: 700; }
          .btn-reset { display: block; text-align: center; background: #AD8A32; color: #ffffff !important; padding: 14px 24px; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 15px; margin: 25px 0 15px; letter-spacing: 0.5px; }
          .url-box { font-size: 11px; color: #6b7771; word-break: break-all; background: #f3f5f4; padding: 10px; border-radius: 4px; border: 1px solid #e1e7e4; }
          .footer { background: #f3f5f4; padding: 18px 30px; text-align: center; font-size: 12px; color: #78857f; border-top: 1px solid #e1e7e4; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="brand">✦ ${instituteName} ✦</div>
            <div class="subbrand">Asateza Faculty Onboarding &amp; Academic Portal</div>
          </div>
          <div class="content">
            <div class="greeting">Assalamu Alaikum wa Rahmatullahi wa Barakatuh, ${teacherName}!</div>
            <span class="badge">Official Asateza / Teacher Appointment</span>
            
            <p style="font-size:14px;line-height:1.6;color:#394840;">
              Mubarak ho! <b>${instituteName}</b> ke Institute Admin ne aapko Asateza Faculty me shamil kiya hai. Aapka official teacher portal account activate ho chuka hai:
            </p>

            <div class="card">
              <div class="card-title">🏛️ Faculty Appointment Details</div>
              <div class="info-row"><span class="info-label">Institute:</span><span class="info-val">${instituteName}</span></div>
              <div class="info-row"><span class="info-label">Designation:</span><span class="info-val">${designation}</span></div>
              <div class="info-row"><span class="info-label">Department:</span><span class="info-val">${departmentName}</span></div>
              <div class="info-row"><span class="info-label">Sanad / Credential:</span><span class="info-val">${sanadDetails}</span></div>
              <div class="info-row"><span class="info-label">Monthly Hadya:</span><span class="info-val">₹${monthlyHadya}</span></div>
            </div>

            <div class="card">
              <div class="card-title">🔐 Teacher Portal Login Credentials</div>
              <div class="info-row"><span class="info-label">Institute Username:</span><span class="info-val" style="color:#157254;">${username}</span></div>
              <div class="info-row"><span class="info-label">Registered Email:</span><span class="info-val">${to}</span></div>
              <div class="info-row"><span class="info-label">Temporary Password:</span><span class="info-val">${tempPassword || 'Teacher@2026'}</span></div>
            </div>

            <p style="font-size:13.5px;color:#394840;line-height:1.5;">
              Barah-e-karam niche diye gaye button par click karke apna password set karein aur apne batches aur classes ko manage karein:
            </p>

            <a href="${resetUrl}" class="btn-reset" target="_blank">🔑 Set Your Teacher Password</a>

            <div style="font-size:12px;color:#57655e;margin-top:14px;">Direct link:</div>
            <div class="url-box">${resetUrl}</div>

            <p style="font-size:12px;color:#85928b;margin-top:12px;"><i>Note: Yeh secure password reset link 7 din ke liye valid hai.</i></p>
          </div>
          <div class="footer">
            JazakAllahu Khaira · ${instituteName} Idarah &amp; Administration<br>
            DPDP Compliant &amp; Shariah Regulated Islamic Learning Platform
          </div>
        </div>
      </body>
      </html>
    `;

    const textBody = `Assalamu Alaikum ${teacherName},\n\n` +
      `Aapko ${instituteName} me Asateza Faculty ke taur par shamil kar liya gaya hai.\n\n` +
      `Institute: ${instituteName}\n` +
      `Designation: ${designation}\n` +
      `Department: ${departmentName}\n` +
      `Sanad Details: ${sanadDetails}\n` +
      `Monthly Hadya: ₹${monthlyHadya}\n\n` +
      `Username: ${username}\n` +
      `Temporary Password: ${tempPassword || 'Teacher@2026'}\n\n` +
      `Password Reset Link (Valid for 7 days):\n${resetUrl}\n\n` +
      `JazakAllahu Khaira,\n${instituteName} Administration`;

    const info = await transporter.sendMail({
      from: `"${instituteName}" <faculty@alnoor.edu>`,
      to: to,
      subject: subject,
      text: textBody,
      html: htmlBody
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`[FACULTY EMAIL DISPATCH SUCCESS] Sent to: ${to} (Message ID: ${info.messageId})`);
    if (previewUrl) {
      console.log(`[FACULTY EMAIL PREVIEW URL] View delivered email live: ${previewUrl}`);
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: previewUrl || null
    };
  } catch (err) {
    console.error(`[FACULTY EMAIL DISPATCH ERROR] Failed to send email to ${to}:`, err.message);
    return {
      success: false,
      error: err.message
    };
  }
}

module.exports = {
  sendWelcomeEmail,
  sendFacultyWelcomeEmail,
  getTransporter,
  getSmtpConfig,
  saveSmtpConfig,
  testSmtpConnection,
  reloadTransporter
};

