import React, { useState, useEffect } from 'react';

interface SettingsProps {
  onScanComplete: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onScanComplete }) => {
  const [directories, setDirectories] = useState<string[]>([]);
  const [newDir, setNewDir] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

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
        <button 
          className="btn" 
          onClick={handleScan} 
          disabled={isScanning}
        >
          {isScanning ? 'Scanning...' : 'Scan Library Now'}
        </button>
      </div>

      <div className="settings-section">
        <h3>TMDB API Key</h3>
        <p style={{ color: '#b3b3b3', marginBottom: '1rem', fontSize: '0.9rem' }}>
          To automatically fetch beautiful posters and metadata for your movies and series, you need a free TMDB API key.
          <br /><br />
          1. Go to <a href="https://www.themoviedb.org/signup" target="_blank" rel="noreferrer" style={{color: 'var(--accent-color)'}}>themoviedb.org/signup</a> and create an account.<br />
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
    </div>
  );
};

export default Settings;
