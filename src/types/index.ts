export interface Media {
  id: string;
  type: 'movie' | 'series';
  title: string;
  file_path: string;
  metadata: any;
  added_at: string;
}

export interface Episode {
  id: string;
  series_id: string;
  season_number: number;
  episode_number: number;
  title: string;
  file_path: string;
  metadata: any;
}

export interface ElectronAPI {
  getAppVersion: () => Promise<string>;
  getSettings: () => Promise<string[]>;
  saveSettings: (dirs: string[]) => Promise<void>;
  scanDirectories: () => Promise<number>;
  getMedia: () => Promise<Media[]>;
  getEpisodes: (seriesId: string) => Promise<Episode[]>;
  clearData: () => Promise<void>;
  saveProgress: (mediaId: string, mediaType: 'movie' | 'episode' | 'series', progressSeconds: number, activeEpisodeId?: string) => Promise<void>;
  getProgress: (mediaId: string, activeEpisodeId?: string) => Promise<number>;
  getContinueWatching: () => Promise<any[]>;
  updateMediaTitle: (id: string, title: string) => Promise<void>;
  updateEpisodeTitle: (id: string, title: string) => Promise<void>;
  deleteMedia: (id: string) => Promise<void>;
  deleteEpisode: (id: string) => Promise<void>;
  selectSubtitle: () => Promise<{ filePath: string, content: string } | null>;
  loadSubtitleFile: (filePath: string) => Promise<string | null>;
  getSubtitleSettings: (mediaId: string) => Promise<{ file_path: string, delay: number, font_size: string } | null>;
  saveSubtitleSettings: (mediaId: string, filePath: string | null, delay: number, fontSize: string) => Promise<void>;
  getGlobalVolume: () => Promise<number>;
  saveGlobalVolume: (volume: number) => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
