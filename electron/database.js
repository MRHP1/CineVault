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

    CREATE TABLE IF NOT EXISTS subtitle_settings (
      media_id TEXT PRIMARY KEY,
      file_path TEXT,
      delay REAL DEFAULT 0,
      font_size TEXT DEFAULT '1em'
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
  
  try {
    db.exec('ALTER TABLE watch_progress ADD COLUMN active_episode_id TEXT;');
  } catch (e) {
    // Column already exists
  }
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

export function getSeriesByTitle(title) {
  const row = db.prepare('SELECT * FROM media WHERE type = ? AND title = ?').get('series', title);
  if (row) {
    return {
      ...row,
      metadata: JSON.parse(row.metadata || '{}')
    };
  }
  return null;
}

export function insertEpisode(episode) {
  const stmt = db.prepare('INSERT INTO episodes (id, series_id, season_number, episode_number, title, file_path, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)');
  stmt.run(episode.id || uuidv4(), episode.series_id, episode.season_number, episode.episode_number, episode.title, episode.file_path, JSON.stringify(episode.metadata || {}));
}

export function getEpisodes(seriesId) {
  return db.prepare('SELECT * FROM episodes WHERE series_id = ? ORDER BY season_number ASC, episode_number ASC').all(seriesId).map(row => ({
    ...row,
    metadata: JSON.parse(row.metadata || '{}')
  }));
}

export function clearMedia() {
  db.prepare('DELETE FROM episodes').run();
  db.prepare('DELETE FROM watch_progress').run();
  db.prepare('DELETE FROM media').run();
}

export function saveProgress(mediaId, mediaType, progressSeconds, activeEpisodeId = null) {
  const existing = db.prepare('SELECT id FROM watch_progress WHERE media_id = ?').get(mediaId);
  if (existing) {
    db.prepare('UPDATE watch_progress SET progress_seconds = ?, active_episode_id = ?, last_watched_at = CURRENT_TIMESTAMP WHERE media_id = ?').run(progressSeconds, activeEpisodeId, mediaId);
  } else {
    db.prepare('INSERT INTO watch_progress (id, media_id, media_type, progress_seconds, active_episode_id) VALUES (?, ?, ?, ?, ?)').run(uuidv4(), mediaId, mediaType, progressSeconds, activeEpisodeId);
  }
}

export function getProgress(mediaId, activeEpisodeId = null) {
  const row = db.prepare('SELECT progress_seconds, active_episode_id FROM watch_progress WHERE media_id = ?').get(mediaId);
  if (row) {
    if (activeEpisodeId && row.active_episode_id && row.active_episode_id !== activeEpisodeId) {
      return 0; // Changed episode, start from 0
    }
    return row.progress_seconds;
  }
  return 0;
}

export function getContinueWatching() {
  const rows = db.prepare(`
    SELECT wp.progress_seconds, wp.media_type, wp.media_id, wp.active_episode_id
    FROM watch_progress wp
    WHERE wp.progress_seconds > 5
    ORDER BY wp.last_watched_at DESC
    LIMIT 10
  `).all();
  
  return rows.map(row => {
    let item = null;
    let series = null;
    if (row.media_type === 'movie') {
      item = db.prepare('SELECT * FROM media WHERE id = ?').get(row.media_id);
    } else if (row.media_type === 'episode' || row.media_type === 'series') {
      series = db.prepare('SELECT * FROM media WHERE id = ?').get(row.media_id);
      if (row.active_episode_id) {
        item = db.prepare('SELECT * FROM episodes WHERE id = ?').get(row.active_episode_id);
      }
    }
    
    if (item) {
      item.metadata = JSON.parse(item.metadata || '{}');
      item.progress = row.progress_seconds;
      if (series) {
        item.series = series;
      }
      return item;
    }
    return null;
  }).filter(Boolean);
}

export function getGlobalVolume() {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('global_volume');
  if (row) return parseFloat(row.value);
  return 100;
}

export function saveGlobalVolume(volume) {
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('global_volume', volume.toString());
}

export function getSubtitleSettings(mediaId) {
  return db.prepare('SELECT * FROM subtitle_settings WHERE media_id = ?').get(mediaId);
}

export function saveSubtitleSettings(mediaId, filePath, delay, fontSize) {
  db.prepare('INSERT OR REPLACE INTO subtitle_settings (media_id, file_path, delay, font_size) VALUES (?, ?, ?, ?)').run(mediaId, filePath, delay, fontSize);
}

export function updateMediaTitle(id, newTitle) {
  db.prepare('UPDATE media SET title = ? WHERE id = ?').run(newTitle, id);
}

export function updateEpisodeTitle(id, newTitle) {
  db.prepare('UPDATE episodes SET title = ? WHERE id = ?').run(newTitle, id);
}

export function deleteMedia(id) {
  const episodes = db.prepare('SELECT id FROM episodes WHERE series_id = ?').all(id);
  for (const ep of episodes) {
    db.prepare('DELETE FROM watch_progress WHERE media_id = ?').run(ep.id);
  }
  db.prepare('DELETE FROM episodes WHERE series_id = ?').run(id);
  db.prepare('DELETE FROM watch_progress WHERE media_id = ?').run(id);
  db.prepare('DELETE FROM media WHERE id = ?').run(id);
}

export function deleteEpisode(id) {
  db.prepare('DELETE FROM watch_progress WHERE media_id = ?').run(id);
  db.prepare('DELETE FROM episodes WHERE id = ?').run(id);
}

export { db };
