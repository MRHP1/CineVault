import React, { useState } from 'react';
import { Media } from '../types';
import MediaCard from '../components/MediaCard';

interface LibraryProps {
  mediaItems: Media[];
  onPlay: (media: Media) => void;
}

const Library: React.FC<LibraryProps> = ({ mediaItems, onPlay }) => {
  const [filter, setFilter] = useState<'all' | 'movie' | 'series'>('all');

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
      
      <div className="media-grid">
        {filteredItems.map(media => (
          <MediaCard key={media.id} media={media} onClick={onPlay} />
        ))}
      </div>
    </div>
  );
};

export default Library;
