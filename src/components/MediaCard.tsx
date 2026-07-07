import React from 'react';
import { Media } from '../types';

interface MediaCardProps {
  media: Media;
  onClick: (media: Media) => void;
}

const MediaCard: React.FC<MediaCardProps> = ({ media, onClick }) => {
  const posterUrl = media.metadata?.poster_path 
    ? `https://image.tmdb.org/t/p/w500${media.metadata.poster_path}`
    : null;

  return (
    <div className="media-card" onClick={() => onClick(media)}>
      {posterUrl ? (
        <img src={posterUrl} alt={media.title} className="media-poster" />
      ) : (
        <div className="media-placeholder">{media.title}</div>
      )}
      <div className="media-overlay">
        <h4 className="media-title">{media.title}</h4>
      </div>
    </div>
  );
};

export default MediaCard;
