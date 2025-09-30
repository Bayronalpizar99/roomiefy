import React from 'react';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import { Bed, Bath, Crop, Trash2, Edit, Heart } from 'lucide-react'; 
import './PropertyCard.css';

const PropertyCard = ({ property, view = 'grid', showActions = false, onDelete, onEdit, isFavorite, onToggleFavorite }) => {
  const {
    id, property_photo, name, location, price, amenities, owner_name,
    owner_profile_pic, rating, bedrooms, bathrooms, square_meters,
  } = property;

  const amenitiesToShow = view === 'list' ? amenities : amenities.slice(0, 3);
  const hiddenAmenitiesCount = amenities.length - amenitiesToShow.length;

  const cardContent = (
    <div className="property-card">
      {}
      {}
      {typeof isFavorite !== 'undefined' && (
        <button
          className={`favorite-icon-button ${isFavorite ? 'favorited' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite(id);
          }}
          aria-label={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        >
          <Heart />
        </button>
      )}
      {}

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
        <p className="price">${price}/mes</p>
        <div className="owner-info">
          <div className="owner-details">
            <img src={owner_profile_pic} alt={owner_name} className="owner-pic" />
            <span>{owner_name}</span>
          </div>
          <StarRating rating={rating} />
        </div>
        
        {showActions && (
          <div className="card-actions">
            <button onClick={(e) => { e.preventDefault(); onEdit(); }} className="action-button edit-button">
              <Edit size={16} /> Modificar
            </button>
            <button onClick={(e) => { e.preventDefault(); onDelete(); }} className="action-button delete-button">
              <Trash2 size={16} /> Eliminar
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return showActions ? (
    <div className="property-card-link">{cardContent}</div>
  ) : (
    <Link to={`/propiedad/${property.id}`} state={{ property: property }} className={`property-card-link ${view === 'list' ? 'list-view-card' : ''}`}>
      {cardContent}
    </Link>
  );
};

export default PropertyCard;