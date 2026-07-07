import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (dirs) => ipcRenderer.invoke('save-settings', dirs),
  scanDirectories: () => ipcRenderer.invoke('scan-directories'),
  getMedia: () => ipcRenderer.invoke('get-media'),
  saveProgress: (mediaId, progressSeconds) => ipcRenderer.invoke('save-progress', mediaId, progressSeconds)
});
