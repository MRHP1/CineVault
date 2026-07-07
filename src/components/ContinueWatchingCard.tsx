import React from 'react';

interface ContinueWatchingCardProps {
  item: any;
  onClick: (item: any) => void;
}

const ContinueWatchingCard: React.FC<ContinueWatchingCardProps> = ({ item, onClick }) => {
  // item could be a movie or an episode with series attached
  const isEpisode = 'season_number' in item;
  
  const title = isEpisode && item.series 
    ? `${item.series.title} - S${item.season_number}E${item.episode_number}: ${item.title}`
    : item.title;

  const posterPath = isEpisode && item.series?.metadata?.poster_path
    ? item.series.metadata.poster_path
    : item.metadata?.poster_path;

  const posterUrl = posterPath 
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : null;

  // Assume duration is unknown, but if we had it, we could calculate percentage.
  // For now, we'll just show the time watched if we don't have duration.
  const progressText = item.progress > 60 
    ? `${Math.floor(item.progress / 60)}m watched` 
    : `${Math.floor(item.progress)}s watched`;

  return (
    <div 
      style={{
        position: 'relative',
        borderRadius: '8px',
        overflow: 'hidden',
        cursor: 'pointer',
        backgroundColor: 'var(--bg-secondary)',
        aspectRatio: '16/9',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        transition: 'transform 0.2s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      onClick={() => onClick(item)}
    >
      {posterUrl ? (
        <img 
          src={posterUrl} 
          alt={title} 
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} 
        />
      ) : (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(45deg, #1f1f1f, #2a2a2a)' }} />
      )}
      
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', paddingLeft: '4px' }}>
          ▶
        </div>
      </div>

      <div style={{ position: 'relative', padding: '15px', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {title}
        </h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{progressText}</span>
        </div>
        {/* Simple Progress Bar */}
        <div style={{ height: '4px', backgroundColor: '#333', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
          <div style={{ height: '100%', backgroundColor: 'var(--accent-color)', width: '50%' }} />
        </div>
      </div>
    </div>
  );
};

export default ContinueWatchingCard;
