import { useState, useEffect } from 'react';
import { fetchProperties } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import Filters from '../components/Filters'; // <-- 1. Importa el componente de filtros
import './HomePage.css';

const HomePage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const propertiesData = await fetchProperties();
      setProperties(propertiesData);
      setLoading(false);
    };

    loadData();
  }, []);

  return (
    // 2. Contenedor principal para el layout de dos columnas
    <div className="homepage-layout"> 
      <Filters /> {/* <-- 3. Añade el componente de filtros aquí */}
      
      {/* 4. Contenedor para el contenido derecho (título + tarjetas) */}
      <div className="main-content-area">
        <h1>Encuentra tu próximo hogar 🏡</h1>
        
        {loading ? (
          <p className="loading-message">Cargando propiedades...</p>
        ) : (
          <main className="properties-container">
            {properties.length > 0 ? (
              properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))
            ) : (
              <p>No se encontraron propiedades en este momento.</p>
            )}
          </main>
        )}
      </div>
    </div>
  );
};

export default HomePage;