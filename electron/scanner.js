import fs from 'fs';
import path from 'path';
import { insertMedia } from './database.js';

const VIDEO_EXTENSIONS = ['.mp4', '.mkv', '.avi', '.webm', '.mov'];

export function scanDirectories(directories) {
  let filesFound = [];

  for (const dir of directories) {
    if (fs.existsSync(dir)) {
      walkSync(dir, filesFound);
    }
  }

  // Very basic regex to distinguish movies from series
  // e.g., Show.S01E02.mp4
  const seriesRegex = /[sS]\d{2}[eE]\d{2}/;

  for (const file of filesFound) {
    const filename = path.basename(file);
    const type = seriesRegex.test(filename) ? 'series' : 'movie';
    // For series, a real app would extract series name, season, episode and link it properly
    // This is a simple implementation
    
    insertMedia({
      type,
      title: filename.replace(path.extname(filename), ''),
      file_path: file,
      metadata: {}
    });
  }

  return filesFound.length;
}

function walkSync(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      filelist = walkSync(filepath, filelist);
    } else {
      if (VIDEO_EXTENSIONS.includes(path.extname(filepath).toLowerCase())) {
        filelist.push(filepath);
      }
    }
  }
  return filelist;
}
