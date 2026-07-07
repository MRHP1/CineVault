import React, { useEffect, useState } from 'react';
import type { Media, Episode } from '../types';

interface SeriesDetailProps {
  series: Media;
  onPlayEpisode: (episode: Episode) => void;
  onBack: () => void;
}

const SeriesDetail: React.FC<SeriesDetailProps> = ({ series, onPlayEpisode, onBack }) => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState<string>('');

  useEffect(() => {
    const loadEpisodes = async () => {
      try {
        const data = await window.electronAPI.getEpisodes(series.id);
        setEpisodes(data);
        if (data.length > 0) {
          const firstSeason = Math.min(...data.map(e => e.season_number)).toString();
          setSelectedSeason(firstSeason);
        }
      } catch (err) {
        console.error('Failed to load episodes:', err);
      } finally {
        setLoading(false);
      }
    };
    loadEpisodes();
  }, [series.id]);

  // Group episodes by season
  const seasons = episodes.reduce((acc, episode) => {
    if (!acc[episode.season_number]) acc[episode.season_number] = [];
    acc[episode.season_number].push(episode);
    return acc;
  }, {} as Record<number, Episode[]>);

  const posterUrl = series.metadata?.poster_path 
    ? `https://image.tmdb.org/t/p/w500${series.metadata.poster_path}`
    : null;

  return (
    <div className="view-container" style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header Banner */}
      <div style={{ position: 'relative', height: '300px', backgroundColor: '#222' }}>
        <button onClick={onBack} style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10, background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer' }}>
          &larr; Back
        </button>
        {posterUrl && (
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${posterUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.3 }} />
        )}
        <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', padding: '40px', background: 'linear-gradient(to top, var(--bg-primary), transparent)' }}>
          <h1 style={{ fontSize: '3rem', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>{series.title}</h1>
        </div>
      </div>

      {/* Episodes List */}
      <div style={{ padding: '40px', overflowY: 'auto', flex: 1 }}>
        {loading ? (
          <p>Loading episodes...</p>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Episodes</h2>
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'white',
                  border: '1px solid #333',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                {Object.keys(seasons).sort((a, b) => parseInt(a) - parseInt(b)).map(season => (
                  <option key={season} value={season}>Season {season}</option>
                ))}
              </select>
            </div>
            
            {selectedSeason && seasons[parseInt(selectedSeason)] && (
              <div style={{ display: 'grid', gap: '10px' }}>
                {seasons[parseInt(selectedSeason)].map(episode => (
                  <div 
                    key={episode.id} 
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }}
                    onClick={() => onPlayEpisode(episode)}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#333')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')}
                  >
                    <div>
                      <span style={{ color: 'var(--text-secondary)', marginRight: '15px' }}>{episode.episode_number}</span>
                      <span style={{ fontWeight: 600 }}>{episode.title}</span>
                    </div>
                    <button className="btn" style={{ padding: '5px 15px', fontSize: '0.9rem' }}>Play</button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SeriesDetail;
