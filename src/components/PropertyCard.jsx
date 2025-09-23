// src/components/PropertyCard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import { Bed, Bath, Crop } from 'lucide-react';
import './PropertyCard.css';

// CAMBIO: Aceptamos el prop 'view', con 'grid' como valor por defecto
const PropertyCard = ({ property, view = 'grid' }) => {
  const {
    property_photo,
    name,
    location,
    price,
    amenities,
    owner_name,
    owner_profile_pic,
    rating,
    bedrooms,
    bathrooms,
    square_meters,
  } = property;

  // CAMBIO: Decidimos qué comodidades mostrar basándonos en la vista
  const amenitiesToShow = view === 'list' ? amenities : amenities.slice(0, 3);
  const hiddenAmenitiesCount = amenities.length - amenitiesToShow.length;

  return (
    // CAMBIO: Añadimos la clase 'list-view-card' para aplicar estilos específicos
    <Link to={`/propiedad/${property.id}`} state={{ property: property }} className={`property-card-link ${view === 'list' ? 'list-view-card' : ''}`}>
      <div className="property-card">
        <img src={property_photo} alt={name} className="property-image" />
        <div className="property-info">
          <h3>{name}</h3>
          <p className="location">{location}</p>
          
          <div className="property-stats">
            <span className="stat-item"><Bed size={16} /> {bedrooms} rec.</span>
            <span className="stat-item"><Bath size={16} /> {bathrooms} {bathrooms > 1 ? 'baños' : 'baño'}</span>
            <span className="stat-item"><Crop size={16} /> {square_meters} m²</span>
          </div>
          <div className="amenities-list">
            {amenitiesToShow.map((amenity, index) => (
              <span key={index} className="amenity-tag">{amenity}</span>
            ))}
            {hiddenAmenitiesCount > 0 && (
              <span className="amenity-tag">+{hiddenAmenitiesCount}</span>
            )}
          </div>
          <p className="price">${price}/noche</p>
          <div className="owner-info">
            <div className="owner-details">
              <img src={owner_profile_pic} alt={owner_name} className="owner-pic" />
              <span>{owner_name}</span>
            </div>
            <StarRating rating={rating} />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;