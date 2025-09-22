import React, { useEffect, useState, useMemo } from 'react';
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

const RoomiesPage = ({ searchQuery = '', onSearchQueryChange }) => {
  const [allRoommates, setAllRoommates] = useState([]);  
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const [view, setView] = useState('grid');
  const [sortOrder, setSortOrder] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const roommatesPerPage = 12;

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
        const data = await fetchRoommates();
        if (data && data.length > 0) {
          // Mantenemos los rangos fijos solicitados
          setFilters(prev => ({ ...prev, priceRange: [minBudget, maxBudget], ageRange: [minAge, maxAge] }));
          setAllRoommates(data);
        }
      } catch (error) {
        console.error('Error al cargar roommates:', error);
        setAllRoommates([]);
      } finally {
        setLoading(false);
      }
    };
    loadRoommates();
  }, []);

  const filteredRoommates = useMemo(() => {
    let list = [...allRoommates];

    // Search functionality - search in name, location, bio, and interests
    if (filters.location) {
      const searchTerm = filters.location.toLowerCase().trim();
      if (searchTerm) {
        list = list.filter(roommate => {
          const searchIn = [
            roommate.name || '',
            roommate.location || '',
            roommate.bio || '',
            ...(roommate.interests || []).join(' ')
          ].join(' ').toLowerCase();
          
          return searchIn.includes(searchTerm);
        });
      }
    }

    // Presupuesto: rango que se solape con el seleccionado
    list = list.filter(r => {
      const rbMin = r?.budget?.min ?? r?.budget ?? 0;
      const rbMax = r?.budget?.max ?? r?.budget ?? rbMin;
      const [fMin, fMax] = filters.priceRange;
      return !(rbMax < fMin || rbMin > fMax);
    });

    // Edad dentro del rango seleccionado (si se conoce)
    list = list.filter(r => {
      const age = r?.age;
      if (!Number.isFinite(age)) return true;
      const [aMin, aMax] = filters.ageRange;
      return age >= aMin && age <= aMax;
    });

    // Tiene casa
    if (filters.hasApartment !== 'any') {
      const desired = filters.hasApartment === 'yes';
      list = list.filter(r => Boolean(r?.hasApartment) === desired);
    }

    // Solo verificados
    if (filters.verifiedOnly) {
      list = list.filter(r => Boolean(r?.verified));
    }

    // Filtros de niveles mínimos (si existen)
    list = list.filter(r => {
      const cleanScore = r?.cleanlinessScore ?? ({
        'Muy limpio': 5,
        'Limpio': 4,
        'Promedio': 3,
        'Relajado': 2,
        'Desordenado': 1,
      }[r?.cleanlinessLevel] ?? null);
      if (cleanScore !== null && cleanScore < (filters.minCleanliness ?? 1)) return false;

      const socialScore = r?.socialScore ?? ({
        'Introvertido': 2,
        'Equilibrado': 3,
        'Extrovertido': 5,
      }[r?.socialLevel] ?? null);
      if (socialScore !== null && socialScore < (filters.minSocial ?? 1)) return false;
      return true;
    });

    // Intereses: todos los seleccionados deben estar presentes
    if (filters.interests.size > 0) {
      list = list.filter(r => {
        const interests = r?.interests || [];
        return [...filters.interests].every(it => interests.includes(it));
      });
    }

      // Crear una copia del array para no mutar el estado original
    const sortedList = [...list];
    
    // Ordenar según la opción seleccionada
    switch (sortOrder) {
      case 'price-asc': {
        return sortedList.sort((a, b) => {
          const aPrice = a?.budget?.max ?? 0;
          const bPrice = b?.budget?.max ?? 0;
          return aPrice - bPrice;
        });
      }
      case 'price-desc': {
        return sortedList.sort((a, b) => {
          const aPrice = a?.budget?.max ?? 0;
          const bPrice = b?.budget?.max ?? 0;
          return bPrice - aPrice;
        });
      }
      case 'rated': {
        return sortedList.sort((a, b) => {
          const aRating = a?.rating ?? 0;
          const bRating = b?.rating ?? 0;
          if (aRating === bRating) {
            // Si tienen el mismo rating, ordenar por ID (más reciente primero)
            return (b?.id ?? 0) - (a?.id ?? 0);
          }
          return bRating - aRating;
        });
      }
      case 'recent':
      default: {
        return sortedList.sort((a, b) => (b?.id ?? 0) - (a?.id ?? 0));
      }
    }
  }, [allRoommates, filters, sortOrder]);

  const totalPages = Math.ceil(filteredRoommates.length / roommatesPerPage) || 1;
  const currentRoommates = useMemo(() => {
    const startIndex = (currentPage - 1) * roommatesPerPage;
    return filteredRoommates.slice(startIndex, startIndex + roommatesPerPage);
  }, [filteredRoommates, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    document.querySelector('.scroll-area-viewport')?.scrollTo(0, 0);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortOrder]);

  return (
    <div className="roomies-page">
      <div className="roomies-container">
        {/* Filtros en móvil */}
        <Dialog.Root>
          <Dialog.Trigger asChild>
            <Button 
              variant="soft" 
              className="mobile-filters"
              size="2"
            >
              <MixerHorizontalIcon /> Filtros
            </Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="dialog-overlay" />
            <Dialog.Content className="dialog-content" style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90vw',
              maxWidth: '500px',
              maxHeight: '85vh',
              padding: '1.5rem',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--border-radius-lg)',
              boxShadow: 'var(--shadow-4)',
              overflowY: 'auto'
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
              {filteredRoommates.length} {filteredRoommates.length === 1 ? 'roomie encontrado' : 'roomies encontrados'}
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
          ) : filteredRoommates.length === 0 ? (
            <div className="no-results">
              <Text as="p" mb="3">No se encontraron roomies que coincidan con tu búsqueda.</Text>
              <Button 
                variant="soft" 
                onClick={() => {
                  setFilters({
                    location: '',
                    priceRange: [minBudget, maxBudget],
                    ageRange: [minAge, maxAge],
                    hasApartment: 'any',
                    interests: new Set(),
                    verifiedOnly: false,
                    minCleanliness: 3,
                    minSocial: 3,
                  });
                  onSearchQueryChange?.('');
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          ) : (
            <>
              <div className={view === 'grid' ? 'roomies-grid' : 'roomies-list'}>
                {currentRoommates.map((roommate) => (
                  <RoommateCard 
                    key={roommate.id} 
                    roommate={roommate} 
                    view={view}
                    onClick={() => navigate(`/roomie/${roommate.id}`)}
                  />
                ))}
              </div>
              
              {totalPages > 1 && (
                <div className="pagination-container">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomiesPage;