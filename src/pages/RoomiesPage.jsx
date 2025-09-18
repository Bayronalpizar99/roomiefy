import React, { useEffect, useState, useMemo } from 'react';
import './PageStyles.css';
import './HomePage.css';
import RoommateCard from '../components/RoomieCard';
import { fetchRoommates } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Flex, Box, Text, Button, Badge } from '@radix-ui/themes';
import * as Dialog from '@radix-ui/react-dialog';
import { MixerHorizontalIcon, Cross2Icon } from '@radix-ui/react-icons';
import ViewOptions from '../components/ViewOptions';
import Pagination from '../components/Pagination';
import RoomieFilters from '../components/RoomieFilters';




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

        // Ordenar
        switch (sortOrder) {
            case 'price-asc': {
                return list.sort((a, b) => (a?.budget?.max ?? 0) - (b?.budget?.max ?? 0));
            }
            case 'price-desc': {
                return list.sort((a, b) => (b?.budget?.max ?? 0) - (a?.budget?.max ?? 0));
            }
            case 'rated': {
                return list.sort((a, b) => (b?.rating ?? 0) - (a?.rating ?? 0));
            }
            case 'recent':
            default: {
                return list.sort((a, b) => (b?.id ?? 0) - (a?.id ?? 0));
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

    if (loading) {
        return <p className="loading-message">Cargando roommates...</p>;
    }

    return (
        <div className="homepage-layout">
            <RoomieFilters 
                filters={filters} 
                setFilters={setFilters} 
                minBudget={minBudget} 
                maxBudget={maxBudget}
                minAge={minAge}
                maxAge={maxAge}
            />
            <div className="properties-section">
                <h1>Encuentra tu roomie ideal 🧑‍🤝‍🧑</h1>
                <ViewOptions
                    view={view}
                    setView={setView}
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                />

                <>
                    <main className={`properties-container ${view}-view`}>
                        {currentRoommates.length > 0 ? (
                            currentRoommates.map((roommate, idx) => (
                                <RoommateCard 
                                    key={roommate.id ?? idx} 
                                    roommate={roommate}
                                    view={view}
                                    onClick={(rm) => navigate(`/roomie/${rm.id}`, { state: { roommate: rm } })}
                                />
                            ))
                        ) : (
                            <p className="no-properties-found">No se encontraron roomies con estos filtros.</p>
                        )}
                    </main>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </>
            </div>
        </div>
    );
};

export default RoomiesPage;