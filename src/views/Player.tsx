import React, { useRef, useEffect } from 'react';
import { Media } from '../types';

interface PlayerProps {
  media: Media;
  onClose: () => void;
}

const Player: React.FC<PlayerProps> = ({ media, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // In a full implementation, we'd load watch progress here and set videoRef.current.currentTime
  }, [media]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = videoRef.current.currentTime;
      // Debounce this in a real app, but for MVP it's okay if it writes frequently, SQLite WAL is fast
      if (Math.floor(progress) % 5 === 0) { // save every 5 seconds
        window.electronAPI.saveProgress(media.id, progress);
      }
    }
  };

  return (
    <div className="player-container">
      <div className="player-header">
        <button className="back-btn" onClick={onClose}>
          &larr;
        </button>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{media.title}</h2>
      </div>
      
      {/* 
        Note: local file paths in Electron (when contextIsolation is true)
        need to be loaded either through a custom protocol (e.g. local://)
        or by bypassing webSecurity. For this MVP, we assume local file access works 
        or we'd need to set up a protocol handler in main.js
      */}
      <video
        ref={videoRef}
        src={`file://${media.file_path}`}
        controls
        autoPlay
        className="video-element"
        onTimeUpdate={handleTimeUpdate}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default Player;
