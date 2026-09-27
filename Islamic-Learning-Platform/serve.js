// ============================================================================
// Al-Noor Open Source Islamic Learning Platform — Master Server & API Gateway
// Serves Static Frontend, RESTful JSON APIs (/api/v1/...), and Database Explorer
// ============================================================================

const http = require('http');
const fs = require('fs');
const path = require('path');
const { handleApiRequest } = require('./backend/routes/apiRoutes');

// The project was originally dependent on remote React/Babel CDNs.  Keep the
// development server self-contained by serving the already-installed local
// React build and compiling the inline JSX on demand.
const viteDepsDir = path.resolve(__dirname, '..', '01viteReact', 'node_modules', '.vite', 'deps');
const babel = require(path.resolve(__dirname, '..', '01basicreact', 'node_modules', '@babel', 'core'));
const reactPreset = require(path.resolve(__dirname, '..', '01basicreact', 'node_modules', '@babel', 'preset-react'));
let compiledAppBundle = null;

function getCompiledAppBundle() {
  if (compiledAppBundle) return compiledAppBundle;

  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  const match = html.match(/<script type="text\/plain" id="app-jsx-source">\s*([\s\S]*?)\s*<\/script>/);
  if (!match) throw new Error('Application JSX source was not found.');

  compiledAppBundle = babel.transformSync(match[1], {
    presets: [[reactPreset, { runtime: 'classic' }]]
  }).code;
  return compiledAppBundle;
}

let PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8085;

const server = http.createServer((req, res) => {
  const reqUrl = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = reqUrl.pathname;
  const query = Object.fromEntries(reqUrl.searchParams.entries());

  // Local, pre-bundled React modules used by index.html's module bootstrap.
  if (pathname.startsWith('/vendor/')) {
    const filename = path.basename(pathname);
    const vendorFile = path.join(viteDepsDir, filename);
    if (/^[\w.-]+\.js$/.test(filename) && fs.existsSync(vendorFile)) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      return fs.createReadStream(vendorFile).pipe(res);
    }
    res.statusCode = 404;
    return res.end('Vendor module not found');
  }

  // Compile JSX once per server process. This removes the browser's dependency
  // on the Babel CDN, which otherwise leaves the page blank when offline.
  if (pathname === '/js/app.bundle.js') {
    try {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      return res.end(getCompiledAppBundle());
    } catch (err) {
      res.statusCode = 500;
      return res.end(`Unable to compile application: ${err.message}`);
    }
  }

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
      try {
        // Hot-reload backend controllers and routes on every API call
        Object.keys(require.cache).forEach(k => {
          if (k.includes('backend' + path.sep + 'controllers') || k.includes('backend' + path.sep + 'routes')) {
            delete require.cache[k];
          }
        });
        const { handleApiRequest: freshHandler } = require('./backend/routes/apiRoutes');
        return freshHandler(req, res, pathname, query, parsedBody);
      } catch (err) {
        return handleApiRequest(req, res, pathname, query, parsedBody);
      }
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
