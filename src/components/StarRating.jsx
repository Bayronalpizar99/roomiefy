import React from 'react';

const StarRating = ({ rating }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    // Si el índice es menor o igual a la calificación, es una estrella llena
    stars.push(<span key={i} className={i <= rating ? 'star filled' : 'star'}>&#9733;</span>);
  }
  return <div className="star-rating">{stars}</div>;
};

export default StarRating;