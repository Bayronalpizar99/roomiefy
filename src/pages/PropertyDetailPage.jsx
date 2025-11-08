import React, { useMemo, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { Share2, Heart, Bed, Bath, Crop, ArrowLeft, MessageSquare, Phone } from 'lucide-react';
import StarRating from '../components/StarRating';
import { createConversation } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './PropertyDetailPage.css';

const PropertyDetailPage = ({ allProperties, loading }) => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { user, requireLogin, favoriteIds, toggleFavorite } = useAuth(); // Se añaden favoriteIds y toggleFavorite
  const [isContacting, setIsContacting] = useState(false);

  const property = useMemo(() => {
    return allProperties.find(p => String(p.id) === String(propertyId));
  }, [propertyId, allProperties]);

  // isFavorited ahora se deriva del contexto
  const isFavorited = property ? favoriteIds.has(property.id) : false;
  
  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert('¡Enlace copiado al portapapeles!');
    });
  };

  const handleContactOwner = async () => {
    if (!user) {
      requireLogin("Para contactar al propietario, necesitas iniciar sesión.");
      return;
    }
    
    const ownerId = property?.ownerId || 'user-123';

    setIsContacting(true);
    try {
      const defaultMessage = `¡Hola ${property.owner_name}! Estoy interesado/a en tu propiedad "${property.name}" y me gustaría saber más. ¿Podemos conversar?`;
      const conversation = await createConversation(ownerId, defaultMessage);

      if (conversation && conversation.id) {
        navigate('/chat', {
          state: {
            selectedConversation: conversation,
            prefilledMessage: defaultMessage
          }
        });
      } else {
        navigate('/chat');
      }
    } catch (error) {
      console.error('Error al iniciar la conversación:', error);
      navigate('/chat');
    } finally {
      setIsContacting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Cargando información de la propiedad...
      </div>
    );
  }

  if (!property) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Propiedad no encontrada.
      </div>
    );
  }

  return (
    <div className="property-detail-container">
      <button className="back-btn-detail" onClick={() => navigate('/')}>
        <ArrowLeft size={18} /> Volver 
      </button>

      <div className="property-header">
        <h1 className="property-title">{property.name}</h1>
        <p className="property-location-detail">{property.location}</p>
      </div>
      
      <div className="property-main-image">
        <img src={property.property_photo} alt={property.name} />
      </div>

      <div className="property-content-layout">
        <div className="property-details-main">
          
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

          <div className="detail-section-card">
            <h2>Descripción</h2>
            <p>{property.description}</p>
          </div>

          <div className="detail-section-card">
            <h2>Comodidades</h2>
            <ul className="amenities-grid">
              {property.amenities.map((amenity, index) => (
                <li key={index}>{amenity}</li>
              ))}
            </ul>
          </div>
          
          <div className="detail-section-card">
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
              <span className="price-label">/ mes</span>
            </div>
            
            <div className="action-buttons">
              <button 
                className="action-btn primary reserve-btn" 
                onClick={handleContactOwner}
                disabled={isContacting}
              >
                <MessageSquare size={18} /> 
                {isContacting ? 'Iniciando...' : 'Contactar propietario'}
              </button>
              <button className="action-btn share-btn" onClick={handleShare}>
                <Share2 size={18} /> Compartir
              </button>
              <button
                className={`action-btn favorite-btn ${
                  isFavorited ? 'favorited' : ''
                }`}
                // El onClick ahora llama a la función del contexto con los datos de la propiedad
                onClick={() => toggleFavorite(property.id, property)}
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