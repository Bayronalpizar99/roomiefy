import { useState, useEffect, useMemo } from 'react';
import PropertyCard from '../components/PropertyCard';
import Filters from '../components/Filters';
import ViewOptions from '../components/ViewOptions';
import Pagination from '../components/Pagination';
import './HomePage.css';

// CAMBIO 1: Recibimos 'properties' y 'loading' como props desde App.jsx
const HomePage = ({ searchQuery = '', properties: allProperties, loading }) => {
  const [view, setView] = useState('grid');
  const [sortOrder, setSortOrder] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 12;
  
  const [filters, setFilters] = useState({
    location: searchQuery,
    price: 500,
    bedrooms: 'any',
    amenities: new Set(),
  });
  
  useEffect(() => {
    if (searchQuery !== undefined) {
      setFilters(prev => ({
        ...prev,
        location: searchQuery
      }));
      setCurrentPage(1);
    }
  }, [searchQuery]);

  // CAMBIO 2: Eliminamos el useEffect que llamaba a fetchProperties. ¡Ya no es necesario aquí!

  const filteredProperties = useMemo(() => {
    let properties = [...allProperties];

    if (filters.location && filters.location.trim() !== '') {
      const searchTerm = filters.location.toLowerCase().trim();
      if (searchTerm) {
        properties = properties.filter(property => {
          const searchIn = [
            property.title || '',
            property.location || '',
            property.description || '',
            ...(property.amenities || [])
          ].join(' ').toLowerCase();
          
          return searchIn.includes(searchTerm);
        });
      }
    }

    properties = properties.filter(p => p.price <= filters.price);

    if (filters.bedrooms !== 'any') {
      properties = properties.filter(p => {
        const bedroomCount = p.bedrooms;
        const filterValue = filters.bedrooms;

        if (filterValue === 'studio') {
          return bedroomCount === 1;
        }
        if (filterValue === '4+') {
          return bedroomCount >= 4;
        }
        return bedroomCount === parseInt(filterValue);
      });
    }

    if (filters.amenities.size > 0) {
      properties = properties.filter(p => 
        [...filters.amenities].every(amenity => p.amenities.includes(amenity))
      );
    }

    switch (sortOrder) {
      case 'price-asc':
        return properties.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return properties.sort((a, b) => b.price - a.price);
      case 'rated':
        return properties.sort((a, b) => b.rating - a.rating);
      case 'recent':
      default:
        // CAMBIO 3: Usamos un fallback para el ID para evitar errores si no existe
        return properties.sort((a, b) => (b.id || 0) - (a.id || 0));
    }
  }, [allProperties, filters, sortOrder]);

  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);
  const currentProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * propertiesPerPage;
    return filteredProperties.slice(startIndex, startIndex + propertiesPerPage);
  }, [filteredProperties, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    document.querySelector('.scroll-area-viewport')?.scrollTo(0, 0);
  };
  
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortOrder]);

  return (
    <div className="homepage-layout"> 
      <Filters filters={filters} setFilters={setFilters} />
      
      <div className="properties-section">
        <h1>Encuentra tu próximo hogar 🏡</h1>
        <ViewOptions 
          view={view} 
          onViewChange={setView} 
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
        />
        {loading ? (
          <p className="loading-message">Cargando propiedades...</p>
        ) : (
          <>
            <main className={`properties-container ${view}-view`}>
              {currentProperties.length > 0 ? (
                currentProperties.map((property) => (
                  <PropertyCard 
                    key={property.id} 
                    property={property} 
                    view={view}
                  />
                ))
              ) : (
                <p className="no-properties-found">No se encontraron propiedades con estos filtros.</p>
              )}
            </main>
            
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;