import { useState, useEffect, useMemo } from 'react';
import PropertyCard from '../components/PropertyCard';
import Filters from '../components/Filters';
import ViewOptions from '../components/ViewOptions';
import Pagination from '../components/Pagination';
import * as Dialog from '@radix-ui/react-dialog';
import { MixerHorizontalIcon, Cross2Icon } from '@radix-ui/react-icons';
import { Button } from '@radix-ui/themes';
import { useAuth } from '../context/AuthContext';
import './HomePage.css';
import WelcomeTourDialog from '../components/WelcomeTourDialog';

const HomePage = ({ properties, loading, filters, setFilters }) => {
  const { favoriteIds, toggleFavorite } = useAuth();
  const [view, setView] = useState('grid');
  const [sortOrder, setSortOrder] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 12;
  const [tourOpen, setTourOpen] = useState(false);
  
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

  // La lógica de filtrado del lado del cliente se ha eliminado
  // Ahora las propiedades ya vienen filtradas desde App.jsx

  const sortedProperties = useMemo(() => {
    let sorted = [...properties];
    switch (sortOrder) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rated':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'recent':
      default:
        // Asumiendo que la API ya los devuelve ordenados por defecto
        return sorted;
    }
  }, [properties, sortOrder]);


  const totalPages = Math.ceil(sortedProperties.length / propertiesPerPage);
  const currentProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * propertiesPerPage;
    return sortedProperties.slice(startIndex, startIndex + propertiesPerPage);
  }, [sortedProperties, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    document.querySelector('.scroll-area-viewport')?.scrollTo(0, 0);
  };
  
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortOrder]);

  return (
    <div className="homepage-layout"> 
      <WelcomeTourDialog 
        isOpen={tourOpen} 
        setIsOpen={setTourOpen} 
        handleClose={handleTourClose} 
      />
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
                    isFavorite={favoriteIds.has(property.id)}
                    onToggleFavorite={(id, propertyData) => toggleFavorite(id, propertyData || property)}
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