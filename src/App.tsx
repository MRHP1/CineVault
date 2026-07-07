import { useState, useEffect } from 'react';
import './index.css';
import type { Media, Episode } from './types';
import Sidebar from './components/Sidebar';
import Home from './views/Home';
import Library from './views/Library';
import Settings from './views/Settings';
import Player from './views/Player';
import SeriesDetail from './views/SeriesDetail';

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'library' | 'settings' | 'player' | 'series-detail'>('home');
  const [mediaItems, setMediaItems] = useState<Media[]>([]);
  const [activeMedia, setActiveMedia] = useState<Media | null>(null);
  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(null);

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

  const handleMediaClick = (media: Media) => {
    setActiveMedia(media);
    if (media.type === 'series') {
      setCurrentView('series-detail');
    } else {
      setActiveEpisode(null);
      setCurrentView('player');
    }
  };

  const playEpisode = (episode: Episode) => {
    setActiveEpisode(episode);
    setCurrentView('player');
  };

  return (
    <div className="app-container">
      {currentView !== 'player' && (
        <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      )}
      <main className="main-content">
        {currentView === 'home' && <Home mediaItems={mediaItems} onPlay={handleMediaClick} onPlayEpisode={playEpisode} />}
        {currentView === 'library' && <Library mediaItems={mediaItems} onPlay={handleMediaClick} onPlayEpisode={playEpisode} />}
        {currentView === 'settings' && <Settings onScanComplete={loadMedia} />}
        
        {currentView === 'series-detail' && activeMedia && (
          <SeriesDetail 
            series={activeMedia} 
            onPlayEpisode={playEpisode} 
            onBack={() => setCurrentView('library')} 
          />
        )}

        {currentView === 'player' && activeMedia && (
          <Player 
            media={activeEpisode || activeMedia} 
            onClose={() => setCurrentView(activeEpisode ? 'series-detail' : 'home')} 
          />
        )}
      </main>
    </div>
  );
}

export default App;
