/**
 * VaultHost workerd Edge Workers Management API Server
 * Lightweight standalone HTTP server for managing workerd worker scripts and configs.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.PORT || '8787', 10);
const WORKERS_DIR = process.env.WORKERS_DIR || '/app/workers';

// Ensure workers directory exists
if (!fs.existsSync(WORKERS_DIR)) {
  fs.mkdirSync(WORKERS_DIR, { recursive: true });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data, null, 2));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  try {
    // Health check
    if (pathname === '/health' && req.method === 'GET') {
      return sendJson(res, 200, {
        status: 'healthy',
        service: 'VaultHost Edge Workers Runtime (workerd)',
        workersDir: WORKERS_DIR,
        timestamp: new Date().toISOString()
      });
    }

    // List workers
    if (pathname === '/workers' && req.method === 'GET') {
      const files = fs.readdirSync(WORKERS_DIR);
      const workers = files.map((file) => {
        const filePath = path.join(WORKERS_DIR, file);
        const stats = fs.statSync(filePath);
        return {
          name: file.replace(/\.(js|capnp)$/, ''),
          filename: file,
          sizeBytes: stats.size,
          updatedAt: stats.mtime.toISOString()
        };
      });
      return sendJson(res, 200, { workers });
    }

    // Create or update worker
    if (pathname === '/workers' && req.method === 'POST') {
      const { name, script, config } = await readBody(req);
      if (!name) {
        return sendJson(res, 400, { error: 'Worker name is required' });
      }

      const safeName = name.replace(/[^a-zA-Z0-9_-]/g, '_');
      const scriptPath = path.join(WORKERS_DIR, `${safeName}.js`);
      fs.writeFileSync(scriptPath, script || '// Empty worker script\n', 'utf8');

      if (config) {
        const configPath = path.join(WORKERS_DIR, `${safeName}.capnp`);
        fs.writeFileSync(configPath, config, 'utf8');
      }

      return sendJson(res, 201, {
        message: 'Worker deployed successfully',
        worker: {
          name: safeName,
          scriptPath
        }
      });
    }

    // Delete worker
    if (pathname.startsWith('/workers/') && req.method === 'DELETE') {
      const name = pathname.replace('/workers/', '').trim();
      const safeName = name.replace(/[^a-zA-Z0-9_-]/g, '_');
      const scriptPath = path.join(WORKERS_DIR, `${safeName}.js`);
      const configPath = path.join(WORKERS_DIR, `${safeName}.capnp`);

      let deleted = false;
      if (fs.existsSync(scriptPath)) {
        fs.unlinkSync(scriptPath);
        deleted = true;
      }
      if (fs.existsSync(configPath)) {
        fs.unlinkSync(configPath);
        deleted = true;
      }

      if (deleted) {
        return sendJson(res, 200, { message: `Worker ${safeName} deleted` });
      }
      return sendJson(res, 404, { error: `Worker ${safeName} not found` });
    }

    // Default route
    sendJson(res, 200, {
      service: 'VaultHost workerd API',
      version: '1.0.0',
      routes: [
        'GET /health',
        'GET /workers',
        'POST /workers',
        'DELETE /workers/:name'
      ]
    });
  } catch (err) {
    sendJson(res, 500, { error: err.message });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`VaultHost workerd API server running on port ${PORT}`);
  console.log(`Workers directory: ${WORKERS_DIR}`);
});
