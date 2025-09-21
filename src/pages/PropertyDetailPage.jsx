import React, { useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Share2, Heart, Bed, Bath, Crop } from 'lucide-react';
import StarRating from '../components/StarRating';
import './PropertyDetailPage.css'; // Crearemos este archivo a continuación

const PropertyDetailPage = () => {
  // 1. Obtenemos los datos de la propiedad pasados desde la tarjeta
  const location = useLocation();
  const { property } = location.state || {};
  const { propertyId } = useParams(); // Obtenemos el ID de la URL

  // 2. Estado para el botón de favoritos
  const [isFavorited, setIsFavorited] = useState(false);

  // 3. Función para copiar el enlace al portapapeles
  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert('¡Enlace copiado al portapapeles!');
    });
  };

  // Si no hay datos de la propiedad (por ejemplo, al recargar la página), mostramos un mensaje
  if (!property) {
    return <div>Cargando información de la propiedad... (o propiedad no encontrada)</div>;
  }

  return (
    <div className="property-detail-container">
      {/* Sección de la imagen principal */}
      <div className="property-main-image">
        <img src={property.property_photo} alt={property.name} />
      </div>

      {/* Contenedor principal de la información */}
      <div className="property-content-layout">
        <div className="property-details-main">
          <h1 className="property-title">{property.name}</h1>
          <p className="property-location-detail">{property.location}</p>
          
          <div className="property-stats-detail">
            <span className="stat-item"><Bed size={20} /> {property.bedrooms} rec.</span>
            <span className="stat-item"><Bath size={20} /> {property.bathrooms} {property.bathrooms > 1 ? 'baños' : 'baño'}</span>
            <span className="stat-item"><Crop size={20} /> {property.square_meters} m²</span>
          </div>

          <div className="section-divider"></div>

          <div className="property-description-full">
            <h2>Descripción</h2>
            <p>{property.description}</p>
          </div>
          
          <div className="section-divider"></div>

          <div className="amenities-section">
            <h2>Comodidades</h2>
            <ul className="amenities-grid">
              {property.amenities.map((amenity, index) => (
                <li key={index}>{amenity}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Barra lateral con acciones y dueño */}
        <aside className="property-sidebar">
          <div className="actions-box">
            <div className="price-per-night">
              <span className="price-amount">${property.price}</span>
              <span className="price-label">/ noche</span>
            </div>
            <div className="action-buttons">
              <button className="action-btn share-btn" onClick={handleShare}>
                <Share2 size={18} /> Compartir
              </button>
              <button 
                className={`action-btn favorite-btn ${isFavorited ? 'favorited' : ''}`}
                onClick={() => setIsFavorited(!isFavorited)}
              >
                <Heart size={18} /> {isFavorited ? 'Guardado' : 'Guardar'}
              </button>
            </div>
            <div className="owner-card">
              <img src={property.owner_profile_pic} alt={property.owner_name} />
              <div className="owner-info-detail">
                <span>Anfitrión</span>
                <strong>{property.owner_name}</strong>
                <StarRating rating={property.rating} />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default PropertyDetailPage;