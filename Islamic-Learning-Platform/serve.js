// ============================================================================
// Al-Noor Open Source Islamic Learning Platform — Master Server & API Gateway
// Serves Static Frontend, RESTful JSON APIs (/api/v1/...), and Database Explorer
// ============================================================================

const http = require('http');
const fs = require('fs');
const path = require('path');
const { handleApiRequest } = require('./backend/routes/apiRoutes');

let PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8085;

const server = http.createServer((req, res) => {
  const reqUrl = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = reqUrl.pathname;
  const query = Object.fromEntries(reqUrl.searchParams.entries());

  // 1. Database Explorer GUI View
  if (pathname === '/db-explorer' || pathname === '/db-explorer/' || pathname === '/db-explorer.html' || pathname === '/admin/database') {
    const explorerPath = path.join(__dirname, 'db-explorer.html');
    const fallbackPath = path.join(__dirname, 'backend', 'views', 'dbExplorer.html');
    const targetPath = fs.existsSync(explorerPath) ? explorerPath : fallbackPath;
    if (fs.existsSync(targetPath)) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return fs.createReadStream(targetPath).pipe(res);
    }
  }

  // 2. RESTful JSON APIs (/api/v1/...)
  if (pathname.startsWith('/api/v1/')) {
    let rawBody = '';
    req.on('data', chunk => {
      rawBody += chunk;
    });

    req.on('end', () => {
      let parsedBody = {};
      if (rawBody.trim()) {
        try {
          parsedBody = JSON.parse(rawBody);
        } catch {
          parsedBody = {};
        }
      }
      return handleApiRequest(req, res, pathname, query, parsedBody);
    });
    return;
  }

  // 3. Static Assets & Frontend Files
  let file = pathname === '/' ? 'index.html' : pathname.slice(1);
  let filePath = path.join(__dirname, decodeURIComponent(file));

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.end('404 Not Found');
  }

  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.mp3': 'audio/mpeg',
    '.pdf': 'application/pdf',
    '.ico': 'image/x-icon'
  };

  res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
  res.setHeader('Access-Control-Allow-Origin', '*');
  fs.createReadStream(filePath).pipe(res);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`[WARNING] Port ${PORT} is in use. Automatically trying port ${PORT + 1}...`);
    PORT = PORT + 1;
    setTimeout(() => {
      server.listen(PORT);
    }, 200);
  } else {
    console.error('[SERVER ERROR]', err);
  }
});

server.listen(PORT, () => {
  console.log(`==========================================================`);
  console.log(`  Al-Noor Master Server running at: http://localhost:${PORT}/`);
  console.log(`  Database Explorer: http://localhost:${PORT}/db-explorer.html`);
  console.log(`  REST APIs active at: http://localhost:${PORT}/api/v1/`);
  console.log(`==========================================================`);
});
