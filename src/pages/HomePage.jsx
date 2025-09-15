import { useState, useEffect, useMemo } from 'react';
import { fetchProperties } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import Filters from '../components/Filters';
import ViewOptions from '../components/ViewOptions'; // Import the new component
import './HomePage.css';

const HomePage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid'); // 'grid' or 'list'
  const [sortOrder, setSortOrder] = useState('recent'); // 'recent', 'price-asc', 'price-desc'

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const propertiesData = await fetchProperties();
      setProperties(propertiesData);
      setLoading(false);
    };

    loadData();
  }, []);

  const sortedProperties = useMemo(() => {
    const sorted = [...properties];
    switch (sortOrder) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'recent':
      default:
        // Assuming 'id' represents recency. Higher id is newer.
        return sorted.sort((a, b) => b.id - a.id);
    }
  }, [properties, sortOrder]);


  return (
    <div className="homepage-layout"> 
      <Filters />
      
      <div className="properties-section">
        <h1>Encuentra tu próximo hogar 🏡</h1>
        
        {/* Add the ViewOptions component here */}
        <ViewOptions 
          view={view} 
          setView={setView} 
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />
        
        {loading ? (
          <p className="loading-message">Cargando propiedades...</p>
        ) : (
          <main className={`properties-container ${view}-view`}>
            {sortedProperties.length > 0 ? (
              sortedProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))
            ) : (
              <p>No se encontraron propiedades.</p>
            )}
          </main>
        )}
      </div>
    </div>
  );
};

export default HomePage;