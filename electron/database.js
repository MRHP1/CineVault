import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import fs from 'fs';

const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'cinevault.db');

// Ensure database directory exists
if (!fs.existsSync(userDataPath)) {
  fs.mkdirSync(userDataPath, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Initialize database schema
export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL, /* 'movie' or 'series' */
      title TEXT NOT NULL,
      file_path TEXT NOT NULL,
      metadata TEXT,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS episodes (
      id TEXT PRIMARY KEY,
      series_id TEXT NOT NULL,
      season_number INTEGER NOT NULL,
      episode_number INTEGER NOT NULL,
      title TEXT,
      file_path TEXT NOT NULL,
      metadata TEXT,
      FOREIGN KEY (series_id) REFERENCES media(id)
    );

    CREATE TABLE IF NOT EXISTS watch_progress (
      id TEXT PRIMARY KEY,
      media_id TEXT NOT NULL,
      media_type TEXT NOT NULL, /* 'movie' or 'episode' */
      progress_seconds REAL DEFAULT 0,
      duration_seconds REAL DEFAULT 0,
      is_watched INTEGER DEFAULT 0,
      last_watched_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
}

export function getSettings() {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('root_directories');
  if (row) {
    return JSON.parse(row.value);
  }
  return [];
}

export function saveSettings(directories) {
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('root_directories', JSON.stringify(directories));
}

// Simple GUID generator for SQLite
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Media Operations
export function insertMedia(media) {
  const stmt = db.prepare('INSERT INTO media (id, type, title, file_path, metadata) VALUES (?, ?, ?, ?, ?)');
  stmt.run(media.id || uuidv4(), media.type, media.title, media.file_path, JSON.stringify(media.metadata || {}));
}

export function getAllMedia() {
  return db.prepare('SELECT * FROM media ORDER BY added_at DESC').all().map(row => ({
    ...row,
    metadata: JSON.parse(row.metadata || '{}')
  }));
}

export { db };
