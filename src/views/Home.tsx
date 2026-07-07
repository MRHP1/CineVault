import React from 'react';
import { Media } from '../types';
import MediaCard from '../components/MediaCard';

interface HomeProps {
  mediaItems: Media[];
  onPlay: (media: Media) => void;
}

const Home: React.FC<HomeProps> = ({ mediaItems, onPlay }) => {
  // Simple logic to show a few items as recently added
  const recentlyAdded = mediaItems.slice(0, 10);

  return (
    <div className="view-container">
      <h2 className="view-title">Continue Watching</h2>
      {/* In a complete app, we'd filter media Items based on watch progress */}
      <p style={{ color: '#b3b3b3', marginBottom: '2rem' }}>
        Start watching something to see it here!
      </p>

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
