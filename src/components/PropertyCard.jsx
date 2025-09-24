import React from 'react';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import { Bed, Bath, Crop, Trash2, Edit } from 'lucide-react'; // 1. Importamos los nuevos iconos
import './PropertyCard.css';

// 2. Añadimos showActions y los handlers a las props
const PropertyCard = ({ property, view = 'grid', showActions = false, onDelete, onEdit }) => {
  const {
    property_photo, name, location, price, amenities, owner_name,
    owner_profile_pic, rating, bedrooms, bathrooms, square_meters,
  } = property;

  const amenitiesToShow = view === 'list' ? amenities : amenities.slice(0, 3);
  const hiddenAmenitiesCount = amenities.length - amenitiesToShow.length;

  const cardContent = (
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
        
        {/* --- INICIO DE CAMBIOS --- */}
        {/* 3. Mostramos los botones solo si showActions es true */}
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
        {/* --- FIN DE CAMBIOS --- */}
      </div>
    </div>
  );

  // 4. Si se muestran las acciones, no envolvemos la tarjeta en un Link para que los botones funcionen
  return showActions ? (
    <div className="property-card-link">{cardContent}</div>
  ) : (
    <Link to={`/propiedad/${property.id}`} state={{ property: property }} className={`property-card-link ${view === 'list' ? 'list-view-card' : ''}`}>
      {cardContent}
    </Link>
  );
};

export default PropertyCard;