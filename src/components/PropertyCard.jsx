import React from 'react';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import { Bed, Bath, Crop } from 'lucide-react';
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
    bedrooms,
    bathrooms,
    square_meters,
  } = property;

  return (
    <Link to={`/propiedad/${property.id}`} state={{ property: property }} className="property-card-link">
      <div className="property-card">
        <img src={property_photo} alt={name} className="property-image" />
        <div className="property-info">
          <h3>{name}</h3>
          <p className="location">{location}</p>
          
          {/* La descripción ha sido eliminada de aquí */}

          <div className="property-stats">
            <span className="stat-item"><Bed size={16} /> {bedrooms} rec.</span>
            <span className="stat-item"><Bath size={16} /> {bathrooms} {bathrooms > 1 ? 'baños' : 'baño'}</span>
            <span className="stat-item"><Crop size={16} /> {square_meters} m²</span>
          </div>
          <div className="amenities-list">
            {amenities.slice(0, 3).map((amenity, index) => (
              <span key={index} className="amenity-tag">{amenity}</span>
            ))}
            {amenities.length > 3 && (
              <span className="amenity-tag">+{amenities.length - 3}</span>
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