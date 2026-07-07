import React, { useState, useEffect } from 'react';
import type { Media, Episode } from '../types';
import MediaCard from '../components/MediaCard';
import ContinueWatchingCard from '../components/ContinueWatchingCard';

interface LibraryProps {
  mediaItems: Media[];
  onPlay: (media: Media) => void;
  onPlayEpisode: (episode: Episode) => void;
}

const Library: React.FC<LibraryProps> = ({ mediaItems, onPlay, onPlayEpisode }) => {
  const [filter, setFilter] = useState<'all' | 'movie' | 'series'>('all');
  const [continueWatching, setContinueWatching] = useState<(Media | Episode)[]>([]);

  useEffect(() => {
    window.electronAPI.getContinueWatching().then(setContinueWatching).catch(console.error);
  }, []);

  const filteredItems = mediaItems.filter(item => filter === 'all' || item.type === filter);

  return (
    <div className="view-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 className="view-title" style={{ margin: 0 }}>My Library</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className={`btn ${filter === 'all' ? '' : 'btn-secondary'}`} onClick={() => setFilter('all')}>All</button>
          <button className={`btn ${filter === 'movie' ? '' : 'btn-secondary'}`} onClick={() => setFilter('movie')}>Movies</button>
          <button className={`btn ${filter === 'series' ? '' : 'btn-secondary'}`} onClick={() => setFilter('series')}>Series</button>
        </div>
      </div>
      
      {continueWatching.length > 0 && filter === 'all' && (
        <>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Continue Watching</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {continueWatching.map((item) => (
              <ContinueWatchingCard 
                key={item.id} 
                item={item} 
                onClick={(it) => 'season_number' in it ? onPlayEpisode(it as Episode) : onPlay(it as Media)} 
              />
            ))}
          </div>
        </>
      )}

      <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>All Content</h3>
      <div className="media-grid">
        {filteredItems.map(media => (
          <MediaCard key={media.id} media={media} onClick={onPlay} />
        ))}
      </div>
    </div>
  );
};

export default Library;
