import React, { useEffect, useRef, useState } from 'react';
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const navigate = useNavigate();

  const [view, setView] = useState('grid');
  const [sortOrder, setSortOrder] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const roommatesPerPage = 8;
  const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });

  // Límites fijos solicitados
  const [minBudget, setMinBudget] = useState(100);
  const [maxBudget, setMaxBudget] = useState(2000);
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(99);

  const [filters, setFilters] = useState({
    location: searchQuery,
    priceRange: [100, 2000],
    ageRange: [18, 99],
    hasApartment: 'any',
    interests: new Set(),
    verifiedOnly: false,
    minCleanliness: 3,
    minSocial: 3,
  });
  
  useEffect(() => {
    /**
     * Detecta cambios en el tamaño de la ventana para alternar entre modo móvil y escritorio.
     * - Activa scroll infinito en móvil (<768px) y paginación en escritorio.
     */
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sincroniza filtros con cambios en searchQuery (ej. desde navegación).
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      location: searchQuery
    }));
    // Resetea a la primera página cuando cambia la búsqueda.
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    /**
     * Carga roommates desde la API basada en filtros, página y orden.
     * - Maneja scroll infinito en móvil (agrega resultados) y reemplazo en escritorio.
     * - Incluye fallback para paginación en cliente si la API devuelve más elementos.
     * - Muestra errores vía Toast y maneja estados de carga.
     */
    const loadRoommates = async () => {
      const appending = isMobile && currentPage > 1;
      if (appending) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
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
          // En scroll infinito, no limpiamos resultados previos para evitar parpadeo.
          if (!(isMobile && currentPage > 1)) {
            setRoommates([]);
            setTotalCount(null);
            setHasNextPage(false);
          }
          setToast({ visible: true, type: 'error', message: `No se pudieron cargar los roomies. ${error}` });
        } else {
          const rawItems = Array.isArray(data) ? data : [];
          const totalFromMeta = meta?.total;
          let total = Number.isFinite(totalFromMeta) ? Number(totalFromMeta) : null;

          // Fallback: paginación en cliente si la API devuelve más de lo solicitado.
          const sliceStart = (currentPage - 1) * roommatesPerPage;
          const needsClientPaging = rawItems.length > roommatesPerPage;
          const pageItems = needsClientPaging
            ? rawItems.slice(sliceStart, sliceStart + roommatesPerPage)
            : rawItems;

          // En móvil, agrega a la lista existente; en escritorio, reemplaza.
          if (isMobile && currentPage > 1) {
            setRoommates(prev => {
              const existingIds = new Set(prev.map((it) => it.id));
              const toAdd = pageItems.filter((it) => !existingIds.has(it.id));
              return [...prev, ...toAdd];
            });
          } else {
            setRoommates(pageItems);
          }

          // Calcula total y si hay más páginas.
          if (!Number.isFinite(total)) {
            if (needsClientPaging) {
              total = rawItems.length;
            }
          }
          setTotalCount(Number.isFinite(total) ? Number(total) : null);

          if (Number.isFinite(total)) {
            const totalPages = Math.ceil(total / roommatesPerPage);
            setHasNextPage(currentPage < totalPages);
          } else {
            // Fallback para determinar si hay más resultados.
            if (needsClientPaging) {
              setHasNextPage(sliceStart + pageItems.length < rawItems.length);
            } else {
              setHasNextPage(rawItems.length >= roommatesPerPage);
            }
          }
        }
      } catch (error) {
        console.error('Error al cargar roommates:', error);
        if (!(isMobile && currentPage > 1)) {
          setRoommates([]);
          setTotalCount(null);
          setHasNextPage(false);
        }
        setToast({ visible: true, type: 'error', message: `No se pudieron cargar los roomies. ${error}` });
      } finally {
        if (isMobile && currentPage > 1) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    };
    loadRoommates();
  }, [currentPage, filters, sortOrder, isMobile]);

  // Calcula páginas totales basado en totalCount del servidor.
  const totalPages = Number.isFinite(totalCount) ? Math.ceil(totalCount / roommatesPerPage) : null;

  /**
   * Maneja cambios de página con scroll al inicio de la lista.
   */
  const handlePageChange = (page) => {
    setCurrentPage(page);
    document.querySelector('.scroll-area-viewport')?.scrollTo(0, 0);
  };

  // Resetea lista y página cuando cambian filtros, orden o modo (móvil/desktop).
  useEffect(() => {
    setRoommates([]);
    setCurrentPage(1);
  }, [filters, sortOrder, isMobile]);

  // Scroll infinito en móvil usando IntersectionObserver.
  const loadMoreRef = useRef(null);
  useEffect(() => {
    if (!isMobile) return; // Solo activo en móvil.
    const target = loadMoreRef.current;
    if (!target) return;
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !loading && !loadingMore) {
        setCurrentPage((prev) => prev + 1);
      }
    }, { root: null, rootMargin: '200px', threshold: 0 });
    observer.observe(target);
    return () => observer.disconnect();
  }, [isMobile, hasNextPage, loading, loadingMore]);

  return (
    <div className="roomies-page">
      <FirstTimeHelp />
      <div className="roomies-container">
        {/* Filtros responsivos: botón en móvil con modal, sidebar en escritorio */}
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

        {/* Filtros en escritorio: sidebar sticky para filtros avanzados */}
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
          {/* Header: muestra conteo de resultados o mensaje de carga */}
          <div className="roomies-header">
            <Text size="2" color="gray">
              {Number.isFinite(totalCount)
                ? `${totalCount} ${totalCount === 1 ? 'roomie encontrado' : 'roomies encontrados'}`
                : `Mostrando ${roommates.length} resultados`}
            </Text>
          </div>

          {/* Controles: opciones de vista y ordenamiento */}
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
              {/* Lista de roommates: grid o list según vista seleccionada */}
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
              {/* Indicador y sentinel para scroll infinito en móvil */}
              {isMobile && (
                <>
                  {loadingMore && (
                    <div className="infinite-loader">Cargando más...</div>
                  )}
                  {/* Sentinel: activa carga automática cuando entra en viewport */}
                  <div ref={loadMoreRef} className="infinite-sentinel" aria-hidden="true" />
                </>
              )}
              
              {/* Paginación en escritorio: condicional según totalPages o hasNextPage */}
              {!isMobile && (Number.isFinite(totalPages) ? totalPages > 1 : (currentPage > 1 || hasNextPage)) && (
                <div className="pagination-container desktop-only">
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