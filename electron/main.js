import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import electronIsDev from 'electron-is-dev';
import { initDB, getSettings, saveSettings, getAllMedia, db } from './database.js';
import { scanDirectories } from './scanner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
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

ipcMain.handle('save-progress', (event, mediaId, progressSeconds) => {
  const stmt = db.prepare('INSERT OR REPLACE INTO watch_progress (id, media_id, media_type, progress_seconds) VALUES (?, ?, ?, ?)');
  stmt.run(mediaId, mediaId, 'movie', progressSeconds);
});
