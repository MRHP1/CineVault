export interface Media {
  id: string;
  type: 'movie' | 'series';
  title: string;
  file_path: string;
  metadata: any;
  added_at: string;
}

export interface ElectronAPI {
  getAppVersion: () => Promise<string>;
  getSettings: () => Promise<string[]>;
  saveSettings: (dirs: string[]) => Promise<void>;
  scanDirectories: () => Promise<number>;
  getMedia: () => Promise<Media[]>;
  saveProgress: (mediaId: string, progressSeconds: number) => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
