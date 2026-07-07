import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import electronIsDev from 'electron-is-dev';
import { initDB, getSettings, saveSettings, getAllMedia, db, getEpisodes, clearMedia, saveProgress, getProgress, getContinueWatching, updateMediaTitle, updateEpisodeTitle, deleteMedia, deleteEpisode, getGlobalVolume, saveGlobalVolume, getSubtitleSettings, saveSubtitleSettings } from './database.js';
import { scanDirectories } from './scanner.js';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false // Disable web security for local file access if needed, though protocol intercept is safer
    },
    autoHideMenuBar: true,
  });

  if (electronIsDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  initDB();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers
ipcMain.handle('get-app-version', () => app.getVersion());

ipcMain.handle('get-settings', () => getSettings());
ipcMain.handle('save-settings', (event, dirs) => saveSettings(dirs));

ipcMain.handle('scan-directories', () => {
  const dirs = getSettings();
  return scanDirectories(dirs);
});

ipcMain.handle('get-media', () => getAllMedia());
ipcMain.handle('get-episodes', (event, seriesId) => getEpisodes(seriesId));
ipcMain.handle('clear-data', () => clearMedia());

ipcMain.handle('save-progress', (event, mediaId, mediaType, progressSeconds, activeEpisodeId) => {
  saveProgress(mediaId, mediaType, progressSeconds, activeEpisodeId);
});

ipcMain.handle('get-progress', (event, mediaId, activeEpisodeId) => getProgress(mediaId, activeEpisodeId));
ipcMain.handle('get-continue-watching', () => getContinueWatching());
ipcMain.handle('update-media-title', (event, id, title) => updateMediaTitle(id, title));
ipcMain.handle('update-episode-title', (event, id, title) => updateEpisodeTitle(id, title));
ipcMain.handle('delete-media', (event, id) => deleteMedia(id));
ipcMain.handle('delete-episode', (event, id) => deleteEpisode(id));
ipcMain.handle('get-global-volume', () => getGlobalVolume());
ipcMain.handle('save-global-volume', (event, volume) => saveGlobalVolume(volume));

ipcMain.handle('get-subtitle-settings', (event, mediaId) => getSubtitleSettings(mediaId));
ipcMain.handle('save-subtitle-settings', (event, mediaId, filePath, delay, fontSize) => saveSubtitleSettings(mediaId, filePath, delay, fontSize));

const readAndConvertSubtitle = (filePath) => {
  if (filePath.endsWith('.srt')) {
    const srtContent = fs.readFileSync(filePath, 'utf-8');
    let vttContent = 'WEBVTT\n\n' + srtContent
      .replace(/\r\n|\r/g, '\n')
      .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');
    return vttContent;
  } else if (filePath.endsWith('.vtt')) {
    return fs.readFileSync(filePath, 'utf-8');
  }
  return null;
};

ipcMain.handle('load-subtitle-file', (event, filePath) => {
  try {
    return readAndConvertSubtitle(filePath);
  } catch (err) {
    console.error("Failed to load saved subtitle:", err);
    return null;
  }
});

ipcMain.handle('select-subtitle', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Subtitles', extensions: ['vtt', 'srt'] }
    ]
  });
  
  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  
  const filePath = result.filePaths[0];
  const content = readAndConvertSubtitle(filePath);
  return content ? { filePath, content } : null;
});
