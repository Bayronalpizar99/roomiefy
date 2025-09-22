import React, { useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import {
  Share2,
  Heart,
  Bed,
  Bath,
  Crop,
  ArrowLeft,
  MessageSquare,
  Phone,
} from 'lucide-react';
import StarRating from '../components/StarRating';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { addDays, format } from 'date-fns';

import './PropertyDetailPage.css';

const PropertyDetailPage = () => {
  const location = useLocation();
  const { property } = location.state || {};
  const { propertyId } = useParams();
  const navigate = useNavigate();

  const [isFavorited, setIsFavorited] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 7),
      key: 'selection',
    },
  ]);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert('¡Enlace copiado al portapapeles!');
    });
  };

  if (!property) {
    return (
      <div>
        Cargando información de la propiedad... (o propiedad no encontrada)
      </div>
    );
  }

  const formattedStartDate = format(dateRange[0].startDate, "dd/MM/yyyy");
  const formattedEndDate = format(dateRange[0].endDate, "dd/MM/yyyy");

  return (
    <div className="property-detail-container">
      <button className="back-btn-detail" onClick={() => navigate('/')}>
        <ArrowLeft size={18} /> Volver a las propiedades
      </button>

      {/* --- INICIO DE LA MODIFICACIÓN --- */}
      <div className="property-header">
        <h1 className="property-title">{property.name}</h1>
        <p className="property-location-detail">{property.location}</p>
      </div>
      {/* --- FIN DE LA MODIFICACIÓN --- */}

      <div className="property-main-image">
        <img src={property.property_photo} alt={property.name} />
      </div>

      <div className="property-content-layout">
        <div className="property-details-main">
          
          {/* El título y la ubicación se han movido arriba */}

          <div className="property-stats-detail">
            <span className="stat-item">
              <Bed size={20} /> {property.bedrooms} rec.
            </span>
            <span className="stat-item">
              <Bath size={20} /> {property.bathrooms}{' '}
              {property.bathrooms > 1 ? 'baños' : 'baño'}
            </span>
            <span className="stat-item">
              <Crop size={20} /> {property.square_meters} m²
            </span>
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

          <div className="section-divider"></div>

          <div className="property-owner-section">
            <h2>Propietario</h2>
            <div className="owner-card-main">
              <div className="owner-info-left">
                <img
                  src={property.owner_profile_pic}
                  alt={property.owner_name}
                />
                <div className="owner-info-detail">
                  <strong>{property.owner_name}</strong>
                  <StarRating rating={property.rating} />
                </div>
              </div>
              <div className="owner-actions">
                <button
                  className="owner-action-btn"
                  aria-label="Iniciar chat"
                >
                  <MessageSquare size={26} strokeWidth={2} />
                </button>
                <button
                  className="owner-action-btn"
                  aria-label="Contactar por teléfono"
                >
                  <Phone size={26} strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <aside className="property-sidebar">
          <div className="actions-box">
            <div className="price-per-night">
              <span className="price-amount">${property.price}</span>
              <span className="price-label">/ noche</span>
            </div>
            
            <div className="date-picker-container">
              <div className="calendar-wrapper">
                <div className="calendar-header">
                  <div className="header-item">
                    <strong>Fecha de inicio:</strong>
                    <span>{formattedStartDate}</span>
                  </div>
                   <div className="header-item">
                    <strong>Fecha de fin:</strong>
                    <span>{formattedEndDate}</span>
                  </div>
                </div>
                <DateRange
                  editableDateInputs={true}
                  onChange={(item) => setDateRange([item.selection])}
                  moveRangeOnFirstSelection={false}
                  ranges={dateRange}
                  minDate={new Date()}
                />
              </div>
            </div>
            
            <div className="action-buttons">
              <button className="action-btn primary reserve-btn">
                Reservar ahora
              </button>

              <button className="action-btn share-btn" onClick={handleShare}>
                <Share2 size={18} /> Compartir
              </button>
              <button
                className={`action-btn favorite-btn ${
                  isFavorited ? 'favorited' : ''
                }`}
                onClick={() => setIsFavorited(!isFavorited)}
              >
                <Heart size={18} /> {isFavorited ? 'Guardado' : 'Guardar'}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default PropertyDetailPage;