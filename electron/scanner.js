import fs from 'fs';
import path from 'path';
import { insertMedia, getSeriesByTitle, insertEpisode, clearMedia } from './database.js';

const VIDEO_EXTENSIONS = ['.mp4', '.mkv', '.avi', '.webm', '.mov'];

export function scanDirectories(directories) {
  clearMedia(); // Clear DB before re-scanning to apply the new parser

  let filesFound = [];
  for (const dir of directories) {
    if (fs.existsSync(dir)) {
      walkSync(dir, filesFound);
    }
  }

  const seriesRegex = /[sS](\d{1,2})[eE](\d{1,2})/;

  function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function cleanTitle(text) {
    let cleaned = text.replace(/\./g, ' ')
                      .replace(/1080p|720p|2160p|4k|x265|x264|HEVC|10bit|AAC|5\.1|BluRay|Vyndros/gi, '')
                      .replace(/\[.*?\]|\(.*?\)/g, '') // Remove brackets like (2015)
                      .replace(/\s+/g, ' ')
                      .trim();
    cleaned = cleaned.replace(/^[-_]+|[-_]+$/g, '').trim();
    return cleaned;
  }

  for (const file of filesFound) {
    const filename = path.basename(file, path.extname(file));
    const match = filename.match(seriesRegex);

    if (match) {
      const season = parseInt(match[1], 10);
      const episode = parseInt(match[2], 10);
      
      let seriesName = '';
      const parentDir = path.basename(path.dirname(file));
      const grandParentDir = path.basename(path.dirname(path.dirname(file)));
      
      if (parentDir.toLowerCase().includes('season')) {
        seriesName = cleanTitle(grandParentDir);
      } else {
        seriesName = cleanTitle(parentDir);
      }
      
      if (!seriesName || seriesName.toLowerCase() === 'series') {
        const textBeforeEpisode = filename.substring(0, match.index);
        seriesName = cleanTitle(textBeforeEpisode);
      }

      let seriesRecord = getSeriesByTitle(seriesName);
      if (!seriesRecord) {
        seriesRecord = {
          id: uuidv4(),
          type: 'series',
          title: seriesName,
          file_path: path.dirname(file),
          metadata: {}
        };
        insertMedia(seriesRecord);
      }

      let episodeTitle = filename.substring(match.index + match[0].length);
      episodeTitle = cleanTitle(episodeTitle);
      if (!episodeTitle) episodeTitle = `Episode ${episode}`;
      
      // e.g. "eps1 0 hellofriend mov" -> remove "mov" since it was part of the original filename format
      episodeTitle = episodeTitle.replace(/mov$|mkv$|mp4$/i, '').trim();

      insertEpisode({
        id: uuidv4(),
        series_id: seriesRecord.id,
        season_number: season,
        episode_number: episode,
        title: episodeTitle,
        file_path: file,
        metadata: {}
      });

    } else {
      insertMedia({
        id: uuidv4(),
        type: 'movie',
        title: cleanTitle(filename),
        file_path: file,
        metadata: {}
      });
    }
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
