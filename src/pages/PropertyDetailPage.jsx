import React, { useState, useEffect } from 'react';
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
import { fetchProperties } from '../services/api';
import './PropertyDetailPage.css';

const PropertyDetailPage = () => {
  const location = useLocation();
  const { propertyId } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(location.state?.property || null);
  const [loading, setLoading] = useState(!property);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const findProperty = async () => {
      if (property) return;

      setLoading(true);
      try {
        // --- INICIO DE LA CORRECCIÓN ---
        const result = await fetchProperties(); // 1. Recibimos el objeto { data, error }

        if (result.error) { // 2. Manejamos el caso de error primero
          console.error("Error al buscar la propiedad:", result.error);
          setProperty(null);
          return;
        }

        // 3. Extraemos el array del objeto 'data'. Asumimos que está en una clave 'properties'.
        // Si no está anidado, sería solo 'result.data'
        const propertiesArray = result.data.properties || result.data || [];
        
        // 4. Buscamos la propiedad en el array corregido
        const foundProperty = propertiesArray.find(p => p.id == propertyId);
        
        if (foundProperty) {
          setProperty(foundProperty);
        } else {
          setProperty(null); 
        }
        // --- FIN DE LA CORRECCIÓN ---

      } catch (error) {
        console.error("Error en el componente:", error);
      } finally {
        setLoading(false);
      }
    };

    findProperty();
  }, [propertyId, property]);

  // ... (El resto del componente sigue igual)

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert('¡Enlace copiado al portapapeles!');
    });
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
              <button className="action-btn primary reserve-btn">
                <MessageSquare size={18} /> Contactar propietario
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