import React from 'react';
import StarRating from './StarRating';
import './PropertyCard.css';

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
        
        {/* Las estrellas ya no van aquí */}
        
        <div className="amenities-list">
          {amenities.slice(0, 3).map((amenity, index) => (
            <span key={index} className="amenity-tag">{amenity}</span>
          ))}
          {amenities.length > 3 && (
            <span className="amenity-tag">+{amenities.length - 3}</span>
          )}
        </div>

        <p className="price">${price}/noche</p>

        {/* --- INICIO DE CAMBIOS --- */}
        <div className="owner-info">
          {/* 1. Nuevo div para agrupar la foto y el nombre */}
          <div className="owner-details">
            <img src={owner_profile_pic} alt={owner_name} className="owner-pic" />
            <span>{owner_name}</span>
          </div>
          {/* 2. Movemos las estrellas aquí */}
          <StarRating rating={rating} />
        </div>
        {/* --- FIN DE CAMBIOS --- */}

      </div>
    </div>
  );
};

export default PropertyCard;