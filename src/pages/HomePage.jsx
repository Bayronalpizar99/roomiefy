import { useState, useEffect, useMemo } from 'react';
import PropertyCard from '../components/PropertyCard';
import Filters from '../components/Filters';
import ViewOptions from '../components/ViewOptions';
import Pagination from '../components/Pagination';
import * as Dialog from '@radix-ui/react-dialog';
import { MixerHorizontalIcon, Cross2Icon } from '@radix-ui/react-icons';
import { Button } from '@radix-ui/themes';
import './HomePage.css';
import WelcomeTourDialog from '../components/WelcomeTourDialog';


// CAMBIO 1: Recibimos 'properties' y 'loading' como props desde App.jsx
const HomePage = ({ searchQuery = '', properties: allProperties, loading }) => {
  const [view, setView] = useState('grid');
  const [sortOrder, setSortOrder] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 12;
  const [tourOpen, setTourOpen] = useState(false);
  
  const [filters, setFilters] = useState({
    location: searchQuery,
    price: 500,
    bedrooms: 'any',
    amenities: new Set(),
  });
  
  // Mostrar tour solo la primera vez que el usuario entra al HomePage
  useEffect(() => {
    try {
      const done = localStorage.getItem('roomiefy_welcome_tour_done');
      if (done !== 'true') setTourOpen(true);
    } catch (_) {
      setTourOpen(true);
    }
  }, []);

  const handleTourClose = () => {
    try {
      localStorage.setItem('roomiefy_welcome_tour_done', 'true');
    } catch (_) {}
    setTourOpen(false);
  };

  useEffect(() => {
    if (searchQuery !== undefined) {
      setFilters(prev => ({
        ...prev,
        location: searchQuery
      }));
      setCurrentPage(1);
    }
  }, [searchQuery]);

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
       {/* <-- 2. Componente añadido */}
      <WelcomeTourDialog 
        isOpen={tourOpen} 
        setIsOpen={setTourOpen} 
        handleClose={handleTourClose} 
      />
      {/* Filtros en móvil */}
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <Button 
            variant="soft" 
            className="mobile-filters-button"
            size="2"
          >
            <MixerHorizontalIcon /> Filtros
          </Button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="dialog-content mobile-filters-dialog">
            <div className="dialog-header">
              <Dialog.Title>Filtros</Dialog.Title>
              <Dialog.Close asChild>
                <button 
                  className="icon-button" 
                  aria-label="Cerrar"
                >
                  <Cross2Icon />
                </button>
              </Dialog.Close>
            </div>
            <div className="dialog-body">
              <Filters filters={filters} setFilters={setFilters} />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Filtros en escritorio */}
      <div className="desktop-filters">
        <Filters filters={filters} setFilters={setFilters} />
      </div>
      
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
