import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flex, Box, Text, Button, Badge, Heading } from '@radix-ui/themes';
import * as Dialog from '@radix-ui/react-dialog';
import { MixerHorizontalIcon, Cross2Icon } from '@radix-ui/react-icons';
import RoommateCard from '../components/RoomieCard';
import { fetchRoommates } from '../services/api';
import ViewOptions from '../components/ViewOptions';
import Pagination from '../components/Pagination';
import RoomieFilters from '../components/RoomieFilters';
import './RoomiesPage.css';
import FirstTimeHelp from '../components/FirstTimeHelp';
import Toast from '../components/Toast';

const RoomiesPage = ({ searchQuery = '', onSearchQueryChange }) => {
  const [roommates, setRoommates] = useState([]);
  const [totalCount, setTotalCount] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const [view, setView] = useState('grid');
  const [sortOrder, setSortOrder] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const roommatesPerPage = 12;
  const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });

  // Límites fijos solicitados
  const [minBudget, setMinBudget] = useState(100);
  const [maxBudget, setMaxBudget] = useState(2000);
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(99);

  const [filters, setFilters] = useState({
    location: searchQuery, // Initialize with searchQuery
    priceRange: [100, 2000],
    ageRange: [18, 99],
    hasApartment: 'any',
    interests: new Set(),
    verifiedOnly: false,
    minCleanliness: 3,
    minSocial: 3,
  });
  
  // Update filters when searchQuery changes
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      location: searchQuery
    }));
    // Reset to first page when search changes
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    const loadRoommates = async () => {
      setLoading(true);
      try {
        const sortMap = {
          'recent': 'recent',
          'rated': 'rated_desc',
          'price-asc': 'price_asc',
          'price-desc': 'price_desc',
        };

        const { data, meta, error } = await fetchRoommates({
          page: currentPage,
          pageSize: roommatesPerPage,
          search: filters.location,
          priceMin: filters.priceRange?.[0],
          priceMax: filters.priceRange?.[1],
          ageMin: filters.ageRange?.[0],
          ageMax: filters.ageRange?.[1],
          hasApartment: filters.hasApartment,
          verifiedOnly: filters.verifiedOnly,
          minCleanliness: filters.minCleanliness,
          minSocial: filters.minSocial,
          interests: filters.interests ? Array.from(filters.interests) : [],
          sort: sortMap[sortOrder] || 'recent',
        });

        if (error) {
          setRoommates([]);
          setTotalCount(null);
          setHasNextPage(false);
          setToast({ visible: true, type: 'error', message: `No se pudieron cargar los roomies. ${error}` });
        } else {
          const items = Array.isArray(data) ? data : [];
          setRoommates(items);
          const total = meta?.total ?? null;
          setTotalCount(Number.isFinite(total) ? Number(total) : null);
          if (Number.isFinite(total)) {
            const totalPages = Math.ceil(total / roommatesPerPage);
            setHasNextPage(currentPage < totalPages);
          } else {
            // Fallback: si no sabemos el total, estimamos siguiente página por tamaño de página
            setHasNextPage(items.length === roommatesPerPage);
          }
        }
      } catch (error) {
        console.error('Error al cargar roommates:', error);
        setRoommates([]);
        setTotalCount(null);
        setHasNextPage(false);
      } finally {
        setLoading(false);
      }
    };
    loadRoommates();
  }, [currentPage, filters, sortOrder]);

  // Paginación basada en servidor
  const totalPages = Number.isFinite(totalCount) ? Math.ceil(totalCount / roommatesPerPage) : null;

  const handlePageChange = (page) => {
    setCurrentPage(page);
    document.querySelector('.scroll-area-viewport')?.scrollTo(0, 0);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortOrder]);

  return (
    <div className="roomies-page">
      <FirstTimeHelp />
      <div className="roomies-container">
        {/* Filtros en móvil */}
        <Dialog.Root>
          <Dialog.Trigger asChild>
            <Button 
              variant="soft" 
              color="purple"
              className="mobile-filters-button"
              size="2"
            >
              <MixerHorizontalIcon /> Filtros
            </Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="dialog-overlay" />
            <Dialog.Content className="dialog-content mobile-filters-dialog" style={{
              zIndex: 100,
              width: '90vw',
              maxWidth: '500px',
              maxHeight: '85vh'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <Dialog.Title style={{ margin: 0 }}>Filtros</Dialog.Title>
                <Dialog.Close asChild>
                  <button 
                    className="icon-button" 
                    aria-label="Cerrar"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-text)',
                      '&:hover': {
                        backgroundColor: 'var(--color-border)'
                      }
                    }}
                  >
                    <Cross2Icon />
                  </button>
                </Dialog.Close>
              </div>
              <div className="dialog-body">
                <RoomieFilters 
                  filters={filters} 
                  setFilters={setFilters} 
                  minBudget={minBudget}
                  maxBudget={maxBudget}
                  minAge={minAge}
                  maxAge={maxAge}
                />
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        {/* Filtros en escritorio */}
        <div className="desktop-filters">
          <RoomieFilters 
            filters={filters} 
            setFilters={setFilters} 
            minBudget={minBudget}
            maxBudget={maxBudget}
            minAge={minAge}
            maxAge={maxAge}
          />
        </div>

        <div className="roomies-results">
          <div className="roomies-header">
            <Heading as="h1" size="6" mb="2">Encuentra tu Roomie Ideal</Heading>
            <Text size="2" color="gray">
              {Number.isFinite(totalCount)
                ? `${totalCount} ${totalCount === 1 ? 'roomie encontrado' : 'roomies encontrados'}`
                : `Mostrando ${roommates.length} resultados`}
            </Text>
          </div>

          <div className="roomies-controls">
            <ViewOptions 
              view={view} 
              onViewChange={setView} 
              sortOrder={sortOrder}
              onSortChange={setSortOrder}
            />
          </div>

          {loading ? (
            <div className="loading-message">Cargando roomies...</div>
          ) : roommates.length === 0 ? (
            <div className="no-results">
              <Text as="p" mb="3">No se encontraron roomies que coincidan con tu búsqueda.</Text>
            </div>
          ) : (
            <>
              <div className={view === 'grid' ? 'roomies-grid' : 'roomies-list'}>
                {roommates.map((roommate) => (
                  <RoommateCard 
                    key={roommate.id} 
                    roommate={roommate} 
                    view={view}
                    onClick={() => navigate(`/roomie/${roommate.id}`)}
                  />
                ))}
              </div>
              
              {(Number.isFinite(totalPages) ? totalPages > 1 : (currentPage > 1 || hasNextPage)) && (
                <div className="pagination-container">
                  {Number.isFinite(totalPages) ? (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={(page) => {
                        setCurrentPage(page);
                        document.querySelector('.scroll-area-viewport')?.scrollTo(0, 0);
                      }}
                    />
                  ) : (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={0}
                      hasPrev={currentPage > 1}
                      hasNext={hasNextPage}
                      hideNumbers
                      onPageChange={(page) => {
                        setCurrentPage(page);
                        document.querySelector('.scroll-area-viewport')?.scrollTo(0, 0);
                      }}
                    />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Toast
        visible={toast.visible}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
        position="bottom-right"
      />
    </div>
  );
};

export default RoomiesPage;