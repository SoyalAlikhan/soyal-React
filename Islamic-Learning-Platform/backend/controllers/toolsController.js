// ============================================================================
// Al-Noor Islamic Learning Platform — Tools & Utilities Controller
// Astronomical Prayer Times Calculation, Great Circle Qibla Bearing, and
// Single-Session / Multi-Device Login Restriction (BRD Sections 15, 43, 44.1)
// ============================================================================

const { queryAll, queryOne, execute } = require('../database/db');
const crypto = require('crypto');

// Kaaba Coordinates in Makkah al-Mukarramah
const KAABA_LAT = 21.422487;
const KAABA_LNG = 39.826206;

// Predefined Global Islamic Cities Database with coordinates & timezones
const CITY_DATABASE = {
  jaipur: { name: 'Jaipur, India', lat: 26.9124, lng: 75.7873, tz: 5.5, country: 'India' },
  delhi: { name: 'New Delhi, India', lat: 28.6139, lng: 77.2090, tz: 5.5, country: 'India' },
  mumbai: { name: 'Mumbai, India', lat: 19.0760, lng: 72.8777, tz: 5.5, country: 'India' },
  lucknow: { name: 'Lucknow, India', lat: 26.8467, lng: 80.9462, tz: 5.5, country: 'India' },
  hyderabad: { name: 'Hyderabad, India', lat: 17.3850, lng: 78.4867, tz: 5.5, country: 'India' },
  bengaluru: { name: 'Bengaluru, India', lat: 12.9716, lng: 77.5946, tz: 5.5, country: 'India' },
  kolkata: { name: 'Kolkata, India', lat: 22.5726, lng: 88.3639, tz: 5.5, country: 'India' },
  karachi: { name: 'Karachi, Pakistan', lat: 24.8607, lng: 67.0011, tz: 5.0, country: 'Pakistan' },
  lahore: { name: 'Lahore, Pakistan', lat: 31.5497, lng: 74.3436, tz: 5.0, country: 'Pakistan' },
  islamabad: { name: 'Islamabad, Pakistan', lat: 33.6844, lng: 73.0479, tz: 5.0, country: 'Pakistan' },
  dhaka: { name: 'Dhaka, Bangladesh', lat: 23.8103, lng: 90.4125, tz: 6.0, country: 'Bangladesh' },
  dubai: { name: 'Dubai, UAE', lat: 25.2048, lng: 55.2708, tz: 4.0, country: 'UAE' },
  makkah: { name: 'Makkah, Saudi Arabia', lat: 21.4225, lng: 39.8262, tz: 3.0, country: 'Saudi Arabia' },
  medina: { name: 'Medina, Saudi Arabia', lat: 24.5247, lng: 39.5692, tz: 3.0, country: 'Saudi Arabia' },
  cairo: { name: 'Cairo, Egypt', lat: 30.0444, lng: 31.2357, tz: 2.0, country: 'Egypt' },
  istanbul: { name: 'Istanbul, Turkey', lat: 41.0082, lng: 28.9784, tz: 3.0, country: 'Turkey' },
  london: { name: 'London, UK', lat: 51.5074, lng: -0.1278, tz: 0.0, country: 'UK' },
  newyork: { name: 'New York, USA', lat: 40.7128, lng: -74.0060, tz: -5.0, country: 'USA' },
  toronto: { name: 'Toronto, Canada', lat: 43.6532, lng: -79.3832, tz: -5.0, country: 'Canada' },
  sydney: { name: 'Sydney, Australia', lat: -33.8688, lng: 151.2093, tz: 10.0, country: 'Australia' }
};

// Helper math conversions
const toRad = deg => (deg * Math.PI) / 180;
const toDeg = rad => (rad * 180) / Math.PI;

/**
 * Great-Circle Spherical Trigonometry Formula for Qibla
 * Azimuth bearing θ from location (lat, lng) to Kaaba (KAABA_LAT, KAABA_LNG):
 * tan(θ) = sin(Δλ) / (cos(φ) * tan(φ_k) - sin(φ) * cos(Δλ))
 */
function calculateQibla(lat, lng) {
  const phi1 = toRad(lat);
  const phi2 = toRad(KAABA_LAT);
  const deltaLambda = toRad(KAABA_LNG - lng);

  const y = Math.sin(deltaLambda);
  const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(deltaLambda);

  let qiblaBearing = toDeg(Math.atan2(y, x));
  qiblaBearing = (qiblaBearing + 360) % 360;

  // Haversine formula for distance in kilometers
  const R = 6371; // Earth radius in km
  const dLat = toRad(KAABA_LAT - lat);
  const dLng = toRad(KAABA_LNG - lng);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = Math.round(R * c);

  // Compass quadrant name
  const directions = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW', 'N'
  ];
  const dirIndex = Math.round(qiblaBearing / 22.5);
  const compassDirection = directions[dirIndex % 16];

  return {
    bearing: Math.round(qiblaBearing * 10) / 10,
    direction: compassDirection,
    distanceKm: distanceKm,
    formattedDistance: distanceKm.toLocaleString() + ' km'
  };
}

/**
 * Astronomical Solar Calculations for Islamic Prayer Times
 * Accurately calculates Fajr (18°), Shurooq, Zuhr, Asr (Hanafi shadow 2 / Shafi'i shadow 1), Maghrib, Isha (18°)
 */
function calculatePrayerTimes(lat, lng, tz, date = new Date(), method = 'hanafi') {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Julian Day
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  const jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  const d = jd - 2451545.0; // days since J2000.0

  // Mean Solar Coordinates
  const g = (357.529 + 0.98560028 * d) % 360;
  const q = (280.459 + 0.98564736 * d) % 360;
  const L = (q + 1.915 * Math.sin(toRad(g)) + 0.020 * Math.sin(toRad(2 * g))) % 360;
  const e = 23.439 - 0.00000036 * d; // obliquity of ecliptic

  // Sun Declination and Equation of Time (EoT)
  const sinDec = Math.sin(toRad(e)) * Math.sin(toRad(L));
  const dec = Math.asin(sinDec); // solar declination in radians
  const RA = toDeg(Math.atan2(Math.cos(toRad(e)) * Math.sin(toRad(L)), Math.cos(toRad(L)))) / 15;
  const EoT = (q / 15) - RA; // in hours

  // Solar Noon (Zuhr) in local hours
  const solarNoon = 12 + tz - (lng / 15) - EoT;

  // Hour Angle Function for altitude angle alpha (in degrees)
  function hourAngle(alpha) {
    const latRad = toRad(lat);
    const cosHA = (Math.sin(toRad(alpha)) - Math.sin(latRad) * Math.sin(dec)) / (Math.cos(latRad) * Math.cos(dec));
    if (cosHA > 1) return null; // Sun never reaches this altitude
    if (cosHA < -1) return null;
    return toDeg(Math.acos(cosHA)) / 15; // in hours
  }

  // 1. Fajr (Sun at -18° altitude)
  const fajrHA = hourAngle(-18) || 1.8;
  const fajrTime = solarNoon - fajrHA;

  // 2. Sunrise / Shurooq (Sun at -0.833° altitude for atmospheric refraction)
  const sunHA = hourAngle(-0.833) || 6.0;
  const sunriseTime = solarNoon - sunHA;

  // 3. Zuhr (Solar Noon + small safety buffer of 2 minutes)
  const zuhrTime = solarNoon + (2 / 60);

  // 4. Asr:
  // Hanafi: shadow = 2 + tan(|lat - dec|)
  // Shafi'i: shadow = 1 + tan(|lat - dec|)
  const shadowFactor = (method.toLowerCase() === 'shafii' || method.toLowerCase() === 'shafi') ? 1 : 2;
  const noonShadow = Math.tan(Math.abs(toRad(lat) - dec));
  const asrAlt = toDeg(Math.atan(1 / (shadowFactor + noonShadow)));
  const asrHA = hourAngle(asrAlt) || 3.0;
  const asrTime = solarNoon + asrHA;

  // 5. Maghrib (Sunset: Sun at -0.833° altitude)
  const maghribTime = solarNoon + sunHA;

  // 6. Isha (Sun at -18° altitude)
  const ishaTime = solarNoon + fajrHA;

  // Helper format decimal hours (e.g. 5.5 -> "05:30 AM")
  function formatHours(h) {
    let norm = (h % 24 + 24) % 24;
    const hours = Math.floor(norm);
    const mins = Math.round((norm - hours) * 60);
    const safeHours = mins === 60 ? hours + 1 : hours;
    const safeMins = mins === 60 ? 0 : mins;
    const period = safeHours >= 12 ? 'PM' : 'AM';
    const h12 = safeHours % 12 === 0 ? 12 : safeHours % 12;
    const mm = safeMins < 10 ? '0' + safeMins : safeMins;
    return `${h12}:${mm} ${period}`;
  }

  function getRawMinutes(h) {
    let norm = (h % 24 + 24) % 24;
    return Math.floor(norm) * 60 + Math.round((norm - Math.floor(norm)) * 60);
  }

  // Calculate Hijri Date Approximation
  const hijriMonths = [
    'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani', 'Jumada al-Awwal',
    'Jumada al-Thani', 'Rajab', 'Sha\'ban', 'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
  ];
  const hijriYear = Math.floor((year - 622) * 1.030684) + 1;
  const hijriDay = ((day + 15) % 29) + 1;
  const hijriMonthName = hijriMonths[(month + 2) % 12];
  const hijriDateString = `${hijriDay} ${hijriMonthName} ${hijriYear} AH`;

  // Determine current active/next prayer
  const now = new Date();
  const currentTotalMins = now.getHours() * 60 + now.getMinutes();

  const schedule = [
    { key: 'fajr', name: 'Fajr (Dawn)', time: formatHours(fajrTime), mins: getRawMinutes(fajrTime), note: 'Until Sunrise' },
    { key: 'sunrise', name: 'Sunrise (Shurooq)', time: formatHours(sunriseTime), mins: getRawMinutes(sunriseTime), note: 'Ishraq & Chasht window begins' },
    { key: 'zuhr', name: 'Zuhr (Midday)', time: formatHours(zuhrTime), mins: getRawMinutes(zuhrTime), note: 'Until Asr' },
    { key: 'asr', name: `Asr (${method === 'shafii' ? 'Shafi\'i' : 'Hanafi'})`, time: formatHours(asrTime), mins: getRawMinutes(asrTime), note: 'Late afternoon' },
    { key: 'maghrib', name: 'Maghrib (Sunset)', time: formatHours(maghribTime), mins: getRawMinutes(maghribTime), note: 'Immediately after sunset' },
    { key: 'isha', name: 'Isha (Night)', time: formatHours(ishaTime), mins: getRawMinutes(ishaTime), note: 'Followed by Witr Wajib' }
  ];

  let nextPrayer = schedule.find(p => p.mins > currentTotalMins) || schedule[0];
  let diffMins = nextPrayer.mins - currentTotalMins;
  if (diffMins < 0) diffMins += 24 * 60; // Next day's Fajr
  const hoursRemaining = Math.floor(diffMins / 60);
  const minsRemaining = diffMins % 60;
  const countdownText = hoursRemaining > 0 
    ? `${hoursRemaining}h ${minsRemaining}m` 
    : `${minsRemaining}m`;

  return {
    hijriDate: hijriDateString,
    gregorianDate: date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    method: method === 'shafii' ? 'Shafi\'i (Mithl 1)' : 'Hanafi (Mithlayn 2)',
    nextPrayerKey: nextPrayer.key,
    nextPrayerName: nextPrayer.name,
    countdown: countdownText,
    schedule: schedule
  };
}

// ============================================================================
// Controller Endpoints
// ============================================================================

function getPrayerTimesHandler(req, res, query) {
  try {
    let lat = 26.9124;
    let lng = 75.7873;
    let tz = 5.5;
    let cityName = 'Jaipur, India';
    let method = (query && query.method) || 'hanafi';

    if (query && query.city && CITY_DATABASE[query.city.toLowerCase()]) {
      const c = CITY_DATABASE[query.city.toLowerCase()];
      lat = c.lat;
      lng = c.lng;
      tz = c.tz;
      cityName = c.name;
    } else if (query && query.lat && query.lng) {
      lat = parseFloat(query.lat);
      lng = parseFloat(query.lng);
      tz = query.tz ? parseFloat(query.tz) : 5.5;
      cityName = query.city_name || `Custom Coordinates (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`;
    }

    const prayerData = calculatePrayerTimes(lat, lng, tz, new Date(), method);
    const qiblaData = calculateQibla(lat, lng);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      city: cityName,
      lat,
      lng,
      timezone: tz,
      ...prayerData,
      qibla: qiblaData,
      availableCities: Object.entries(CITY_DATABASE).map(([k, v]) => ({ key: k, name: v.name, country: v.country }))
    }));
  } catch (err) {
    console.error('[PRAYER TIMES ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

function getQiblaHandler(req, res, query) {
  try {
    let lat = 26.9124;
    let lng = 75.7873;
    let cityName = 'Jaipur, India';

    if (query && query.city && CITY_DATABASE[query.city.toLowerCase()]) {
      const c = CITY_DATABASE[query.city.toLowerCase()];
      lat = c.lat;
      lng = c.lng;
      cityName = c.name;
    } else if (query && query.lat && query.lng) {
      lat = parseFloat(query.lat);
      lng = parseFloat(query.lng);
      cityName = query.city_name || `Lat: ${lat.toFixed(2)}°, Lng: ${lng.toFixed(2)}°`;
    }

    const qiblaData = calculateQibla(lat, lng);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      city: cityName,
      lat,
      lng,
      ...qiblaData,
      kaaba: { lat: KAABA_LAT, lng: KAABA_LNG, location: 'Makkah al-Mukarramah' },
      availableCities: Object.entries(CITY_DATABASE).map(([k, v]) => ({ key: k, name: v.name }))
    }));
  } catch (err) {
    console.error('[QIBLA ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

/**
 * Single-Session / Multi-Device Login Restriction (BRD Section 43)
 * Validates whether the active session token on server still matches the client's token.
 */
function sessionCheckHandler(req, res, body) {
  try {
    const { user_id, session_token } = body || {};
    if (!user_id || !session_token) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'user_id and session_token required' }));
    }

    const user = queryOne('SELECT id, name, active_session_token, last_active_at, last_device FROM users WHERE id = ?', [user_id]);
    if (!user) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'User account not found' }));
    }

    // If active_session_token is not set or matches current session
    if (!user.active_session_token || user.active_session_token === session_token) {
      // Refresh last active timestamp
      execute('UPDATE users SET last_active_at = CURRENT_TIMESTAMP WHERE id = ?', [user_id]);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: true,
        valid: true,
        message: 'Active session verified'
      }));
    }

    // MULTI-DEVICE LOGIN RESTRICTION TRIGGERED!
    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      valid: false,
      session_terminated: true,
      error: 'Multi-Device Login Detected',
      message: `Aapka account "${user.name}" kisi doosre browser ya device se sign in ho chuka hai. BRD Section 43 (Multi-Device Login Restriction) ke tehat ek waqt me sirf ek active session allow hai. Aapko logout kiya gaya hai.`,
      last_device: user.last_device || 'Another Device',
      last_active_at: user.last_active_at
    }));
  } catch (err) {
    console.error('[SESSION CHECK ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

/**
 * Simulate Login from another device to test BRD Section 43 enforcement
 */
function simulateSecondDeviceLoginHandler(req, res, body) {
  try {
    const { user_id, device_name = 'Mobile App (iPhone 15 / Android)' } = body || {};
    if (!user_id) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'user_id required' }));
    }

    const newSessionToken = 'sess_' + crypto.randomBytes(16).toString('hex');
    execute(`
      UPDATE users 
      SET active_session_token = ?, 
          last_device = ?,
          last_active_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [newSessionToken, device_name, user_id]);

    const user = queryOne('SELECT id, name, active_session_token FROM users WHERE id = ?', [user_id]);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: `Simulated second device sign-in successful. Active session token replaced on server for "${user.name}". Previous device session will be invalidated within 5 seconds!`,
      new_session_token: newSessionToken,
      device: device_name
    }));
  } catch (err) {
    console.error('[SIMULATE SECOND DEVICE ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

module.exports = {
  getPrayerTimesHandler,
  getQiblaHandler,
  sessionCheckHandler,
  simulateSecondDeviceLoginHandler,
  CITY_DATABASE,
  calculatePrayerTimes,
  calculateQibla
};
