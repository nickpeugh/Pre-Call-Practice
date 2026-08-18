import express from 'express';
import path from 'path';
import fs from 'fs';

// Static host for the Carvana x ADESA Onboarding Tracker bundle.
//
// The app under deploy/ is a self-contained static build (relative paths, no
// build step). Its backend integration routes (Okta / Slack / email / shared
// checklists) are documented in deploy/INTEGRATION.md and are stood up against
// Carvana infra separately; until a Host API base URL is configured in the app,
// it runs fully in its built-in demo / local-storage mode.

const PORT = Number(process.env.PORT) || 3000;
const STATIC_DIR = path.join(process.cwd(), 'deploy');
const INDEX_HTML = path.join(STATIC_DIR, 'index.html');

const app = express();

// Request logging
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Allow embedding (e.g. Google Sites) and keep home-screen install headers simple.
app.use((_req, res, next) => {
  res.setHeader('Content-Security-Policy', 'frame-ancestors *;');
  res.removeHeader('X-Frame-Options');
  next();
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'onboarding-tracker', env: process.env.NODE_ENV || 'development' });
});

// Serve the static bundle. Every asset path in the app is relative to the root.
app.use(express.static(STATIC_DIR, { index: 'index.html', extensions: ['html'] }));

// Fallback: any non-file route returns the app shell.
app.get('*', (_req, res) => {
  res.sendFile(INDEX_HTML);
});

console.log('--- Onboarding Tracker static server starting ---');
console.log('Serving from:', STATIC_DIR);
if (fs.existsSync(INDEX_HTML)) {
  console.log('Confirmed: index.html present.');
} else {
  console.error('CRITICAL: deploy/index.html NOT found at', INDEX_HTML);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
