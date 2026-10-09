#!/usr/bin/env node
// Optional backend for the sponsorship page. Zero dependencies, Node 18+.
//
//   node server/server.js                # serves ../site on http://localhost:8080
//   PORT=3000 node server/server.js
//   ADMIN_TOKEN=secret node server/server.js   # enables GET /api/claims
//   CLAIM_WEBHOOK_URL=https://hooks.slack.com/... node server/server.js  # forwards each claim
//
// Set "claimEndpoint": "/api/claims" in site/config.json so the page posts here.
// Claims are appended to data/claims.jsonl (one JSON object per line).
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT || 8080);
const SITE_DIR = path.resolve(process.env.SITE_DIR || path.join(__dirname, '..', 'site'));
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(__dirname, '..', 'data'));
const CLAIMS_FILE = path.join(DATA_DIR, 'claims.jsonl');
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';
const WEBHOOK = process.env.CLAIM_WEBHOOK_URL || '';
const MAX_BODY = 20 * 1024;

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.glb': 'model/gltf-binary', '.gltf': 'model/gltf+json', '.hdr': 'image/vnd.radiance', '.wasm': 'application/wasm',
  '.txt': 'text/plain; charset=utf-8', '.md': 'text/markdown; charset=utf-8', '.woff2': 'font/woff2',
};

// very small per-IP rate limit for the claim endpoint: 10 requests per 10 minutes
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  arr.push(now); hits.set(ip, arr);
  return arr.length > 10;
}

function send(res, code, body, type = 'application/json; charset=utf-8', extra = {}) {
  const buf = typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body);
  res.writeHead(code, { 'Content-Type': type, 'Content-Length': Buffer.byteLength(buf), 'X-Content-Type-Options': 'nosniff', ...extra });
  res.end(buf);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', (c) => { size += c.length; if (size > MAX_BODY) { reject(new Error('too large')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function validateClaim(b) {
  const errors = [];
  const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
  const out = {
    spotId: Number(b.spotId), spot: str(b.spot, 120), location: str(b.location, 160), priceUsd: Number(b.priceUsd) || null,
    company: str(b.company, 120), name: str(b.name, 120), email: str(b.email, 200), website: str(b.website, 300), message: str(b.message, 2000),
    page: str(b.page, 300),
  };
  if (!Number.isInteger(out.spotId) || out.spotId < 1) errors.push('spotId');
  if (!out.company) errors.push('company');
  if (!out.name) errors.push('name');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(out.email)) errors.push('email');
  return { out, errors };
}

async function forward(claim) {
  if (!WEBHOOK || typeof fetch !== 'function') return;
  try {
    await fetch(WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: `New sponsorship request: spot ${claim.spotId} (${claim.spot}) from ${claim.company}, ${claim.name} <${claim.email}>`, claim }) });
  } catch (e) { console.error('webhook failed', e.message); }
}

async function handleApi(req, res, url) {
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString().split(',')[0].trim();
  if (url.pathname === '/api/claims' && req.method === 'POST') {
    if (limited(ip)) return send(res, 429, { ok: false, error: 'Too many requests. Try again later.' });
    let body;
    try { body = JSON.parse(await readBody(req)); } catch (e) { return send(res, 400, { ok: false, error: 'Invalid JSON body' }); }
    const { out, errors } = validateClaim(body || {});
    if (errors.length) return send(res, 422, { ok: false, error: 'Missing or invalid: ' + errors.join(', ') });
    const record = { ...out, receivedAt: new Date().toISOString(), ip };
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.appendFileSync(CLAIMS_FILE, JSON.stringify(record) + '\n');
    console.log(`[claim] spot ${record.spotId} ${record.spot} <- ${record.company} (${record.email})`);
    forward(record);
    return send(res, 200, { ok: true });
  }
  if (url.pathname === '/api/claims' && req.method === 'GET') {
    if (!ADMIN_TOKEN || req.headers.authorization !== `Bearer ${ADMIN_TOKEN}`) return send(res, 401, { ok: false, error: 'Unauthorized' });
    const lines = fs.existsSync(CLAIMS_FILE) ? fs.readFileSync(CLAIMS_FILE, 'utf8').trim().split('\n').filter(Boolean) : [];
    return send(res, 200, lines.map((l) => JSON.parse(l)));
  }
  if (url.pathname === '/api/health') return send(res, 200, { ok: true });
  return send(res, 404, { ok: false, error: 'Not found' });
}

function serveStatic(req, res, url) {
  let rel = decodeURIComponent(url.pathname);
  if (rel.endsWith('/')) rel += 'index.html';
  const file = path.normalize(path.join(SITE_DIR, rel));
  if (!file.startsWith(SITE_DIR + path.sep) && file !== SITE_DIR) return send(res, 403, 'Forbidden', 'text/plain');
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) return send(res, 404, 'Not found', 'text/plain');
    const ext = path.extname(file).toLowerCase();
    const type = MIME[ext] || 'application/octet-stream';
    const cache = ext === '.html' || ext === '.json' ? 'no-cache' : 'public, max-age=604800';
    res.writeHead(200, { 'Content-Type': type, 'Content-Length': st.size, 'Cache-Control': cache, 'X-Content-Type-Options': 'nosniff' });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname.startsWith('/api/')) return handleApi(req, res, url).catch((e) => send(res, 500, { ok: false, error: e.message }));
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed', 'text/plain');
  serveStatic(req, res, url);
});
server.listen(PORT, () => console.log(`Serving ${SITE_DIR} on http://localhost:${PORT}  (claims -> ${CLAIMS_FILE})`));
