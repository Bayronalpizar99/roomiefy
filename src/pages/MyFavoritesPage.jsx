import React from 'react';
import { useAuth } from '../context/AuthContext';
import PropertyCard from '../components/PropertyCard';
import { Heart } from 'lucide-react';
import './HomePage.css'; // Reutilizamos estilos

const MyFavoritesPage = ({ allProperties }) => {
  const { favoriteIds, toggleFavorite } = useAuth();

  const favoriteProperties = allProperties.filter(property => favoriteIds.has(property.id));

  return (
    <div className="homepage-layout" style={{ display: 'block' }}>
      <div className="properties-section">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <Heart size={32} /> Mis Favoritos
          </h1>
          <p>Aquí encontrarás todas las propiedades que has guardado.</p>
        </div>

        {favoriteProperties.length > 0 ? (
          <main className="properties-container grid-view">
            {favoriteProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                view="grid"
                isFavorite={true}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </main>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <p className="no-properties-found">Aún no has guardado ninguna propiedad en tus favoritos.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyFavoritesPage;