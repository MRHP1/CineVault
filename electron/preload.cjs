const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (dirs) => ipcRenderer.invoke('save-settings', dirs),
  scanDirectories: () => ipcRenderer.invoke('scan-directories'),
  getMedia: () => ipcRenderer.invoke('get-media'),
  getEpisodes: (seriesId) => ipcRenderer.invoke('get-episodes', seriesId),
  clearData: () => ipcRenderer.invoke('clear-data'),
  saveProgress: (mediaId, mediaType, progressSeconds, activeEpisodeId) => ipcRenderer.invoke('save-progress', mediaId, mediaType, progressSeconds, activeEpisodeId),
  getProgress: (mediaId, activeEpisodeId) => ipcRenderer.invoke('get-progress', mediaId, activeEpisodeId),
  getContinueWatching: () => ipcRenderer.invoke('get-continue-watching'),
  updateMediaTitle: (id, title) => ipcRenderer.invoke('update-media-title', id, title),
  updateEpisodeTitle: (id, title) => ipcRenderer.invoke('update-episode-title', id, title),
  deleteMedia: (id) => ipcRenderer.invoke('delete-media', id),
  deleteEpisode: (id) => ipcRenderer.invoke('delete-episode', id),
  selectSubtitle: () => ipcRenderer.invoke('select-subtitle'),
  loadSubtitleFile: (filePath) => ipcRenderer.invoke('load-subtitle-file', filePath),
  getSubtitleSettings: (mediaId) => ipcRenderer.invoke('get-subtitle-settings', mediaId),
  saveSubtitleSettings: (mediaId, filePath, delay, fontSize) => ipcRenderer.invoke('save-subtitle-settings', mediaId, filePath, delay, fontSize),
  getGlobalVolume: () => ipcRenderer.invoke('get-global-volume'),
  saveGlobalVolume: (volume) => ipcRenderer.invoke('save-global-volume', volume)
});
