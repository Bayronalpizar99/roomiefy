import React from 'react';
import StarRating from './StarRating'; // Lo creamos a continuación
import './PropertyCard.css'; // Añadiremos estilos después

const PropertyCard = ({ property }) => {
  const {
    property_photo,
    name,
    location,
    price,
    amenities,
    owner_name,
    owner_profile_pic,
    rating,
  } = property;

  return (
    <div className="property-card">
      <img src={property_photo} alt={name} className="property-image" />
      <div className="property-info">
        <h3>{name}</h3>
        <p className="location">{location}</p>
        <StarRating rating={rating} />
        <p className="price">${price}/noche</p>
        <div className="owner-info">
          <img src={owner_profile_pic} alt={owner_name} className="owner-pic" />
          <span>{owner_name}</span>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;