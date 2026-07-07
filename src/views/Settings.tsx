import React, { useState, useEffect } from 'react';
import type { Media, Episode } from '../types';

interface SettingsProps {
  onScanComplete: () => void;
}
const Settings: React.FC<SettingsProps> = ({ onScanComplete }) => {
  const [directories, setDirectories] = useState<string[]>([]);
  const [newDir, setNewDir] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [expandedSeries, setExpandedSeries] = useState<string | null>(null);
  const [seriesEpisodes, setSeriesEpisodes] = useState<Episode[]>([]);
  const [globalVolume, setGlobalVolume] = useState(100);

  useEffect(() => {
    loadSettings();
    loadMediaList();
    window.electronAPI.getGlobalVolume().then(setGlobalVolume).catch(console.error);
  }, []);

  const loadMediaList = async () => {
    const m = await window.electronAPI.getMedia();
    setMediaList(m);
  };

  const toggleSeries = async (id: string) => {
    if (expandedSeries === id) {
      setExpandedSeries(null);
      setSeriesEpisodes([]);
    } else {
      setExpandedSeries(id);
      const eps = await window.electronAPI.getEpisodes(id);
      setSeriesEpisodes(eps);
    }
  };

  const handleEditTitle = async (id: string, currentTitle: string, isEpisode: boolean = false) => {
    const newTitle = window.prompt('Enter new title:', currentTitle);
    if (newTitle && newTitle !== currentTitle) {
      if (isEpisode) {
        await window.electronAPI.updateEpisodeTitle(id, newTitle);
      } else {
        await window.electronAPI.updateMediaTitle(id, newTitle);
      }
      loadMediaList();
      onScanComplete(); // trigger app reload
      if (isEpisode && expandedSeries) {
        const eps = await window.electronAPI.getEpisodes(expandedSeries);
        setSeriesEpisodes(eps);
      }
    }
  };

  const handleDeleteMedia = async (id: string, title: string, isEpisode: boolean = false) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      if (isEpisode) {
        await window.electronAPI.deleteEpisode(id);
      } else {
        await window.electronAPI.deleteMedia(id);
      }
      loadMediaList();
      onScanComplete();
      if (isEpisode && expandedSeries) {
        const eps = await window.electronAPI.getEpisodes(expandedSeries);
        setSeriesEpisodes(eps);
      }
    }
  };

  const loadSettings = async () => {
    try {
      const dirs = await window.electronAPI.getSettings();
      setDirectories(dirs || []);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleAddDir = async () => {
    if (newDir && !directories.includes(newDir)) {
      const updatedDirs = [...directories, newDir];
      setDirectories(updatedDirs);
      await window.electronAPI.saveSettings(updatedDirs);
      setNewDir('');
    }
  };

  const handleRemoveDir = async (dirToRemove: string) => {
    const updatedDirs = directories.filter(d => d !== dirToRemove);
    setDirectories(updatedDirs);
    await window.electronAPI.saveSettings(updatedDirs);
  };

  const handleScan = async () => {
    setIsScanning(true);
    try {
      await window.electronAPI.scanDirectories();
      onScanComplete();
      alert('Scan complete!');
    } catch (error) {
      console.error('Scan failed:', error);
      alert('Scan failed.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleClearData = async () => {
    const confirm1 = window.confirm('Are you sure you want to clear all library data? This will remove all movies, series, and watch progress.');
    if (confirm1) {
      const confirm2 = window.confirm('Are you absolutely sure? This cannot be undone.');
      if (confirm2) {
        try {
          await window.electronAPI.clearData();
          onScanComplete(); // trigger reload on UI
          alert('Library data cleared successfully.');
        } catch (error) {
          console.error('Failed to clear data:', error);
          alert('Failed to clear data.');
        }
      }
    }
  };

  return (
    <div className="view-container">
      <h2 className="view-title">Settings</h2>

      <div className="settings-section">
        <h3>Media Library Folders</h3>
        <p style={{ color: '#b3b3b3', marginBottom: '1rem', fontSize: '0.9rem' }}>
          Add absolute paths to your media folders (e.g., C:\Users\YourName\Videos)
        </p>

        <ul className="dir-list">
          {directories.map((dir, index) => (
            <li key={index} className="dir-item">
              <span>{dir}</span>
              <button
                className="btn btn-secondary"
                style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                onClick={() => handleRemoveDir(dir)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            className="input-field"
            style={{ marginBottom: 0 }}
            placeholder="Add new directory path..."
            value={newDir}
            onChange={(e) => setNewDir(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddDir()}
          />
          <button className="btn" onClick={handleAddDir}>Add</button>
        </div>
      </div>

      <div className="settings-section">
        <h3>Library Operations</h3>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            className="btn"
            onClick={handleScan}
            disabled={isScanning}
          >
            {isScanning ? 'Scanning...' : 'Scan Library Now'}
          </button>

          <button
            className="btn"
            onClick={handleClearData}
            style={{ backgroundColor: '#dc3545' }}
          >
            Clear Library Data
          </button>
        </div>
      </div>

      <div className="settings-section">
        <h3>TMDB API Key</h3>
        <p style={{ color: '#b3b3b3', marginBottom: '1rem', fontSize: '0.9rem' }}>
          To automatically fetch beautiful posters and metadata for your movies and series, you need a free TMDB API key.
          <br /><br />
          1. Go to <a href="https://www.themoviedb.org/signup" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-color)' }}>themoviedb.org/signup</a> and create an account.<br />
          2. Navigate to your Account Settings &gt; API and register for a Developer key.<br />
          3. Paste the "API Read Access Token" or "API Key (v3 auth)" below.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="password"
            className="input-field"
            style={{ marginBottom: 0 }}
            placeholder="Enter TMDB API Key..."
          />
          <button className="btn">Save Key</button>
        </div>
      </div>

      <div className="settings-section">
        <h3>Manage Library Content</h3>
        <p style={{ color: '#b3b3b3', marginBottom: '1rem', fontSize: '0.9rem' }}>
          Edit titles or delete specific media items from your library.
        </p>
        <ul className="dir-list">
          {mediaList.map((media) => (
            <li key={media.id} style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', marginBottom: '8px', padding: '10px', borderRadius: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: 600 }}>{media.title}</span>
                  <span style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>{media.type}</span>
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  {media.type === 'series' && (
                    <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => toggleSeries(media.id)}>
                      {expandedSeries === media.id ? 'Hide Episodes' : 'Show Episodes'}
                    </button>
                  )}
                  <button className="btn" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => handleEditTitle(media.id, media.title)}>Edit Title</button>
                  <button className="btn" style={{ padding: '4px 8px', fontSize: '0.8rem', backgroundColor: '#dc3545' }} onClick={() => handleDeleteMedia(media.id, media.title)}>Delete</button>
                </div>
              </div>

              {expandedSeries === media.id && (
                <div style={{ marginTop: '10px', paddingLeft: '15px', borderLeft: '2px solid #444' }}>
                  {seriesEpisodes.length === 0 ? <p style={{ fontSize: '0.8rem', color: '#888' }}>No episodes found.</p> : null}
                  {seriesEpisodes.map((ep) => (
                    <div key={ep.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px', padding: '5px', backgroundColor: '#2a2a2a', borderRadius: '3px' }}>
                      <span style={{ fontSize: '0.9rem' }}>S{ep.season_number}E{ep.episode_number}: {ep.title}</span>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button className="btn btn-secondary" style={{ padding: '2px 6px', fontSize: '0.75rem' }} onClick={() => handleEditTitle(ep.id, ep.title, true)}>Edit</button>
                        <button className="btn btn-secondary" style={{ padding: '2px 6px', fontSize: '0.75rem', backgroundColor: '#5c1b22' }} onClick={() => handleDeleteMedia(ep.id, ep.title, true)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="settings-section">
        <h3>Playback Preferences</h3>
        <p style={{ color: '#b3b3b3', marginBottom: '1rem', fontSize: '0.9rem' }}>
          Adjust the default audio volume for all movies and series.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span>Global Volume: {globalVolume}%</span>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={globalVolume} 
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setGlobalVolume(val);
              window.electronAPI.saveGlobalVolume(val);
            }} 
            style={{ flex: 1 }}
          />
        </div>
      </div>
    </div>
  );
};

export default Settings;