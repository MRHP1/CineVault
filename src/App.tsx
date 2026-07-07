import { useState, useEffect } from 'react';
import './index.css';
import { Media } from './types';
import Sidebar from './components/Sidebar';
import Home from './views/Home';
import Library from './views/Library';
import Settings from './views/Settings';
import Player from './views/Player';

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'library' | 'settings' | 'player'>('home');
  const [mediaItems, setMediaItems] = useState<Media[]>([]);
  const [activeMedia, setActiveMedia] = useState<Media | null>(null);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      const items = await window.electronAPI.getMedia();
      setMediaItems(items);
    } catch (error) {
      console.error('Error loading media:', error);
    }
  };

  const playMedia = (media: Media) => {
    setActiveMedia(media);
    setCurrentView('player');
  };

  return (
    <div className="app-container">
      {currentView !== 'player' && (
        <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      )}
      <main className="main-content">
        {currentView === 'home' && <Home mediaItems={mediaItems} onPlay={playMedia} />}
        {currentView === 'library' && <Library mediaItems={mediaItems} onPlay={playMedia} />}
        {currentView === 'settings' && <Settings onScanComplete={loadMedia} />}
        {currentView === 'player' && activeMedia && (
          <Player media={activeMedia} onClose={() => setCurrentView('home')} />
        )}
      </main>
    </div>
  );
}

export default App;
