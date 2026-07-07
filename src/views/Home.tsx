import React, { useEffect, useState } from 'react';
import type { Media, Episode } from '../types';
import MediaCard from '../components/MediaCard';
import ContinueWatchingCard from '../components/ContinueWatchingCard';

interface HomeProps {
  mediaItems: Media[];
  onPlay: (media: Media) => void;
  onPlayEpisode: (episode: Episode) => void;
}

const Home: React.FC<HomeProps> = ({ mediaItems, onPlay, onPlayEpisode }) => {
  const [continueWatching, setContinueWatching] = useState<(Media | Episode)[]>([]);

  useEffect(() => {
    window.electronAPI.getContinueWatching().then(setContinueWatching).catch(console.error);
  }, []);

  // Simple logic to show a few items as recently added
  const recentlyAdded = mediaItems.slice(0, 10);

  return (
    <div className="view-container">
      <h2 className="view-title">Continue Watching</h2>
      {continueWatching.length === 0 ? (
        <p style={{ color: '#b3b3b3', marginBottom: '2rem' }}>
          Start watching something to see it here!
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {continueWatching.map((item) => (
            <ContinueWatchingCard 
              key={item.id} 
              item={item} 
              onClick={(it) => 'season_number' in it ? onPlayEpisode(it as Episode) : onPlay(it as Media)} 
            />
          ))}
        </div>
      )}

      <h2 className="view-title">Recently Added</h2>
      <div className="media-grid">
        {recentlyAdded.map(media => (
          <MediaCard key={media.id} media={media} onClick={onPlay} />
        ))}
      </div>
    </div>
  );
};

export default Home;
