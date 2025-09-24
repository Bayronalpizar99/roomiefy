import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';
import { PlusCircledIcon } from '@radix-ui/react-icons';
import './HomePage.css'; // Reutilizamos algunos estilos

const MyPropertiesPage = ({ myProperties, onDeleteProperty }) => {
  const navigate = useNavigate();

  return (
    <div className="homepage-layout" style={{ display: 'block' }}>
      <div className="properties-section">
        {/* --- INICIO DE LA MODIFICACIÓN --- */}
        {/* Contenedor principal de la cabecera */}
        <div style={{
          display: 'grid',
          // Creamos 3 columnas: botón a la izq, título centrado, y un espacio vacío a la der
          gridTemplateColumns: '1fr auto 1fr', 
          alignItems: 'center',
          padding: '0 1rem', // Mantenemos el padding para alinear con las tarjetas
          marginBottom: '1.5rem'
        }}>
          {/* Columna 1: El botón */}
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

          {/* Columna 2: El título centrado */}
          <h1 style={{ margin: 0, justifySelf: 'center' }}>
            Mis Propiedades
          </h1>

          {/* Columna 3: Vacía, para mantener el título centrado */}
          <div></div>
        </div>
        {/* --- FIN DE LA MODIFICACIÓN --- */}

        {myProperties.length > 0 ? (
          <main className="properties-container grid-view">
            {myProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                view="grid"
                showActions={true}
                onDelete={() => onDeleteProperty(property.id)}
                onEdit={() => alert(`Funcionalidad de editar para "${property.name}" (próximamente)`)}
              />
            ))}
          </main>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <p className="no-properties-found">Aún no has publicado ninguna propiedad.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPropertiesPage;