import { useState, useEffect } from 'react';
import { fetchProperties } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import './HomePage.css'; // Asegúrate de tener estilos para la página

const HomePage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // useEffect para cargar los datos de la API cuando el componente se monta
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const propertiesData = await fetchProperties();
      setProperties(propertiesData);
      setLoading(false);
    };

    loadData();
  }, []); // El array vacío asegura que esto se ejecute solo una vez

  return (
    // Ya no se necesita un <div> contenedor extra ni el header
    <>
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
    </>
  );
};

export default HomePage;