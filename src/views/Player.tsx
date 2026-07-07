import React, { useRef, useEffect, useState } from 'react';
import type { Media, Episode } from '../types';

interface PlayerProps {
  media: Media | Episode;
  onClose: () => void;
}

const Player: React.FC<PlayerProps> = ({ media, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [rawVtt, setRawVtt] = useState<string | null>(null);
  const [subtitleUrl, setSubtitleUrl] = useState<string | null>(null);
  const [subtitleDelay, setSubtitleDelay] = useState<number>(0);
  const [fontSize, setFontSize] = useState<string>('1em');
  const [subtitleFilePath, setSubtitleFilePath] = useState<string | null>(null);

  const saveSettings = (path: string | null, delay: number, size: string) => {
    window.electronAPI.saveSubtitleSettings(media.id, path, delay, size).catch(console.error);
  };

  useEffect(() => {
    window.electronAPI.getGlobalVolume().then((vol) => {
      if (videoRef.current) {
        videoRef.current.volume = vol / 100;
      }
    }).catch(console.error);

    const isEpisode = 'season_number' in media;
    // For episodes, fetch progress against the series ID and active episode ID
    const mediaId = isEpisode ? media.series_id : media.id;
    const activeEpisodeId = isEpisode ? media.id : undefined;

    window.electronAPI.getProgress(mediaId, activeEpisodeId).then((progress) => {
      if (videoRef.current && progress > 0) {
        videoRef.current.currentTime = progress;
      }
    }).catch(err => console.error("Failed to load progress:", err));

    window.electronAPI.getSubtitleSettings(media.id).then((settings) => {
      if (settings) {
        if (settings.delay !== undefined) setSubtitleDelay(settings.delay);
        if (settings.font_size) setFontSize(settings.font_size);
        if (settings.file_path) {
          setSubtitleFilePath(settings.file_path);
          window.electronAPI.loadSubtitleFile(settings.file_path).then(content => {
            if (content) setRawVtt(content);
          }).catch(console.error);
        }
      }
    }).catch(console.error);
  }, [media]);

  useEffect(() => {
    if (rawVtt) {
      const applyVttDelay = (vtt: string, delaySeconds: number) => {
        if (delaySeconds === 0) return vtt;
        return vtt.replace(/(\d{2,}:)?(\d{2}):(\d{2})\.(\d{3})/g, (match, h, m, s, ms) => {
          let hours = h ? parseInt(h) : 0;
          let minutes = parseInt(m);
          let seconds = parseInt(s);
          let milliseconds = parseInt(ms);
          
          let totalMs = hours * 3600000 + minutes * 60000 + seconds * 1000 + milliseconds;
          totalMs += delaySeconds * 1000;
          if (totalMs < 0) totalMs = 0;
          
          let newH = Math.floor(totalMs / 3600000);
          totalMs %= 3600000;
          let newM = Math.floor(totalMs / 60000);
          totalMs %= 60000;
          let newS = Math.floor(totalMs / 1000);
          let newMs = totalMs % 1000;
          
          return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}:${newS.toString().padStart(2, '0')}.${newMs.toString().padStart(3, '0')}`;
        });
      };

      const newVtt = applyVttDelay(rawVtt, subtitleDelay);
      const blob = new Blob([newVtt], { type: 'text/vtt' });
      const url = URL.createObjectURL(blob);
      setSubtitleUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setSubtitleUrl(null);
    }
  }, [rawVtt, subtitleDelay]);

  const loadSubtitle = async () => {
    try {
      const res = await window.electronAPI.selectSubtitle();
      if (res) {
        setRawVtt(res.content);
        setSubtitleDelay(0);
        setSubtitleFilePath(res.filePath);
        saveSettings(res.filePath, 0, fontSize);
      }
    } catch (err) {
      console.error('Failed to load subtitle:', err);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = videoRef.current.currentTime;
      if (Math.floor(progress) % 5 === 0) { // save every 5 seconds
        const isEpisode = 'season_number' in media;
        if (isEpisode) {
          window.electronAPI.saveProgress(media.series_id, 'series', progress, media.id);
        } else {
          window.electronAPI.saveProgress(media.id, 'movie', progress);
        }
      }
    }
  };

  return (
    <div className="player-container">
      <div className="player-header">
        <button className="back-btn" onClick={onClose}>
          &larr;
        </button>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, flex: 1, marginLeft: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{media.title}</h2>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {rawVtt && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ fontSize: '0.8rem' }}>Sync ({subtitleDelay > 0 ? `+${subtitleDelay}` : subtitleDelay}s):</span>
                <input 
                  type="range" min="-10" max="10" step="0.5" 
                  value={subtitleDelay} 
                  onChange={e => {
                    const val = parseFloat(e.target.value);
                    setSubtitleDelay(val);
                    saveSettings(subtitleFilePath, val, fontSize);
                  }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ fontSize: '0.8rem' }}>Size:</span>
                <select 
                  value={fontSize} 
                  onChange={e => {
                    const val = e.target.value;
                    setFontSize(val);
                    saveSettings(subtitleFilePath, subtitleDelay, val);
                  }} 
                  style={{ background: '#333', color: 'white', border: 'none', padding: '3px', borderRadius: '4px' }}
                >
                  <option value="0.5em">Extra Small</option>
                  <option value="0.75em">Small</option>
                  <option value="1em">Normal</option>
                  <option value="1.5em">Large</option>
                  <option value="2em">Extra Large</option>
                </select>
              </div>
            </>
          )}
          <button className="btn" onClick={loadSubtitle} style={{ padding: '5px 15px', fontSize: '0.9rem' }}>
            {rawVtt ? 'Change Subtitle' : 'Load Subtitle'}
          </button>
        </div>
      </div>
      
      {/* 
        Note: local file paths in Electron (when contextIsolation is true)
        need to be loaded either through a custom protocol (e.g. local://)
        or by bypassing webSecurity. For this MVP, we assume local file access works 
        or we'd need to set up a protocol handler in main.js
      */}
      <style>{`
        ::cue {
          font-size: ${fontSize};
        }
      `}</style>
      <video
        ref={videoRef}
        src={`file://${media.file_path}`}
        controls
        autoPlay
        className="video-element"
        onTimeUpdate={handleTimeUpdate}
      >
        {subtitleUrl && <track kind="subtitles" src={subtitleUrl} default />}
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default Player;
