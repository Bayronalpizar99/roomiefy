import React, { useState, useEffect } from 'react'; 
import { useNavigate, Link } from 'react-router-dom'; 
import PropertyCard from '../components/PropertyCard';
import { PlusCircledIcon } from '@radix-ui/react-icons';
import './HomePage.css'; 
import { useAuth } from '../context/AuthContext'; 
import { fetchUserProperties, deleteProperty } from '../services/api'; 

// 1. ELIMINAMOS 'myProperties' Y 'onDeleteProperty' DE LOS PROPS
const MyPropertiesPage = () => {
  const navigate = useNavigate();
  const { user, accessToken } = useAuth(); // <-- ¡Añade accessToken!

  // 2. AÑADIMOS ESTADO LOCAL PARA DATOS, CARGA Y ERRORES
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 3. USAMOS useEffect PARA BUSCAR LOS DATOS CUANDO EL COMPONENTE SE CARGA
  useEffect(() => {
    const loadProperties = async () => {
      // No hacemos nada si el usuario no ha cargado
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        // Usamos user.id (no user.email) para la llamada a la API
        const { data, error: apiError } = await fetchUserProperties(user.id); 
        
        if (apiError) {
          throw new Error(apiError);
        }
        setProperties(data); // Guardamos los datos en el estado local
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, [user]); // Este efecto se vuelve a ejecutar si el 'user' cambia

  // 4. AÑADIMOS NUESTRA PROPIA LÓGICA DE ELIMINACIÓN
  const handleDelete = async (propertyId) => {
    // Usamos 'confirm' (el prompt nativo) en lugar de 'window.confirm'
    if (!confirm("¿Estás seguro de que quieres eliminar esta propiedad?")) {
      return;
    }
    
    try {
      await deleteProperty(propertyId, accessToken); // <-- ¡Pasa el token!
      // Actualizamos el estado local para quitar la propiedad eliminada
      setProperties(prevProperties => 
        prevProperties.filter(property => property.id !== propertyId)
      );
    } catch (err) {
      setError(err.message);
    }
  };

  // 5. MANEJAMOS LOS ESTADOS DE CARGA Y ERROR
  if (loading) {
    return <div className="loading-container" style={{ textAlign: 'center', padding: '4rem' }}>Cargando tus propiedades...</div>;
  }

  if (error) {
    return <div className="error-container" style={{ textAlign: 'center', padding: '4rem' }}>Error: {error}</div>;
  }

  // 6. RENDERIZAMOS EL JSX, AHORA USANDO EL ESTADO LOCAL 'properties'
  return (
    <div className="homepage-layout" style={{ display: 'block' }}>
      <div className="properties-section">
        {/* Contenedor principal de la cabecera (tu código original) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr', 
          alignItems: 'center',
          padding: '0 1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ justifySelf: 'start' }}>
            <button
              className="form-button"
              style={{
                padding: '12px 22px',
                fontSize: '1rem',
                width: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onClick={() => navigate('/publicar')}
            >
              <PlusCircledIcon width="20" height="20" />
              Publicar Nueva Propiedad
            </button>
          </div>
          <h1 style={{ margin: 0, justifySelf: 'center' }}>
            Mis Propiedades
          </h1>
          <div></div>
        </div>

        {/* Usamos el estado local 'properties' en lugar de 'myProperties' */}
        {properties.length > 0 ? (
          <main className="properties-container grid-view">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                view="grid"
                showActions={true}
                // Usamos nuestra función local 'handleDelete'
                onDelete={() => handleDelete(property.id)}
                onEdit={() => navigate(`/propiedad/editar/${property.id}`)}
              />
            ))}
          </main>
        ) : (
          // Mensaje mejorado cuando no hay propiedades
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <p className="no-properties-found">Aún no has publicado ninguna propiedad.</p>
            <Link to="/publicar" className="form-button" style={{ textDecoration: 'none', display: 'inline-flex', marginTop: '1rem' }}>
              Publicar mi primera propiedad
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPropertiesPage;