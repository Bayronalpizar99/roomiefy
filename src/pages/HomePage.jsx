import { useState, useEffect, useMemo } from 'react';
import { fetchProperties } from '../services/api';
import PropertyCard from '../components/PropertyCard';
<<<<<<< Updated upstream
import Filters from '../components/Filters';
import ViewOptions from '../components/ViewOptions';
import Pagination from '../components/Pagination';
import './HomePage.css';
=======
import './PublishStyles.css'; // Asegúrate de tener estilos para la página
>>>>>>> Stashed changes

const HomePage = () => {
  const [allProperties, setAllProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [view, setView] = useState('grid');
  const [sortOrder, setSortOrder] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 12;
  
  const [filters, setFilters] = useState({
    location: '',
    price: 500,
    bedrooms: 'any',
    amenities: new Set(),
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const propertiesData = await fetchProperties();
      setAllProperties(propertiesData);
      setLoading(false);
    };
    loadData();
  }, []);

  const filteredProperties = useMemo(() => {
    let properties = [...allProperties];

    // 1. Filtrar por ubicación
    if (filters.location) {
      properties = properties.filter(p => 
        p.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // 2. Filtrar por precio
    properties = properties.filter(p => p.price <= filters.price);

    // --- INICIO DE CAMBIOS: Lógica para filtrar por recámaras ---
    if (filters.bedrooms !== 'any') {
      properties = properties.filter(p => {
        const bedroomCount = p.bedrooms;
        const filterValue = filters.bedrooms;

        if (filterValue === 'studio') {
          // Asumimos que un estudio equivale a 1 recámara para fines del filtro
          return bedroomCount === 1;
        }
        if (filterValue === '4+') {
          return bedroomCount >= 4;
        }
        // Comparamos el número de recámaras (convirtiendo el filtro a número)
        return bedroomCount === parseInt(filterValue);
      });
    }
    // --- FIN DE CAMBIOS ---

    // 4. Filtrar por comodidades
    if (filters.amenities.size > 0) {
      properties = properties.filter(p => 
        [...filters.amenities].every(amenity => p.amenities.includes(amenity))
      );
    }

    // 5. Ordenar
    switch (sortOrder) {
      case 'price-asc':
        return properties.sort((a, b) => a.price - a.price);
      case 'price-desc':
        return properties.sort((a, b) => b.price - a.price);
      case 'rated':
        return properties.sort((a, b) => b.rating - a.rating);
      case 'recent':
      default:
        return properties.sort((a, b) => b.id - a.id);
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
          setView={setView} 
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />
        {loading ? (
          <p className="loading-message">Cargando propiedades...</p>
        ) : (
          <>
            <main className={`properties-container ${view}-view`}>
              {currentProperties.length > 0 ? (
                currentProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
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