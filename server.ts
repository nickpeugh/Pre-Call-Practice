import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';

const db = new Database('database.sqlite');

// Initialize the database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    empId TEXT,
    location TEXT,
    scenarioId TEXT,
    transcript TEXT,
    scores TEXT,
    summary TEXT,
    rating INTEGER,
    createdAt TEXT
  )
`);

async function startServer() {
  console.log('--- Server Starting ---');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('Working Directory:', process.cwd());

  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Request logging middleware
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', env: process.env.NODE_ENV });
  });

  // Middleware to allow embedding in Google Sites and enable microphone permissions
  app.use((req, res, next) => {
    // Set CSP to allow any site to frame this app (most compatible for Google Sites)
    res.setHeader('Content-Security-Policy', "frame-ancestors *;");
    // Explicitly allow microphone usage in iframes
    res.setHeader('Permissions-Policy', 'microphone=*');
    // Ensure X-Frame-Options doesn't block the embed
    res.removeHeader('X-Frame-Options');
    next();
  });

  // API Routes
  app.get('/api/sessions', (req, res) => {
    try {
      const { empId } = req.query;
      if (!empId) {
        return res.status(400).json({ error: 'empId is required' });
      }
      const sessions = db.prepare('SELECT * FROM sessions WHERE empId = ? ORDER BY createdAt DESC').all(empId);
      // Parse JSON strings back into objects
      const parsedSessions = sessions.map((s: any) => ({
        ...s,
        transcript: JSON.parse(s.transcript),
        scores: JSON.parse(s.scores),
      }));
      res.json(parsedSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      res.status(500).json({ error: 'Failed to fetch sessions' });
    }
  });

  app.post('/api/sessions', (req, res) => {
    try {
      const session = req.body;
      const stmt = db.prepare(`
        INSERT INTO sessions (id, empId, location, scenarioId, transcript, scores, summary, rating, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        session.id,
        session.empId,
        session.location,
        session.scenarioId,
        JSON.stringify(session.transcript),
        JSON.stringify(session.scores),
        session.summary,
        session.rating,
        session.createdAt
      );
      
      res.status(201).json({ status: 'ok' });
    } catch (error) {
      console.error('Error saving session:', error);
      res.status(500).json({ error: 'Failed to save session' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    const indexPath = path.join(distPath, 'index.html');
    
    console.log('Production mode: Serving static files from', distPath);
    if (fs.existsSync(indexPath)) {
      console.log('Confirmed: index.html exists at', indexPath);
    } else {
      console.error('CRITICAL: index.html NOT found at', indexPath);
    }

    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(indexPath);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
