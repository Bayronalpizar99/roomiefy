import React, { useEffect, useState, useMemo } from 'react';
import './PageStyles.css';
import './HomePage.css';
import RoommateCard from '../components/RoomieCard';
import { fetchRoommates } from '../services/api';
import { Flex, Box, Text, Button, Badge } from '@radix-ui/themes';
import * as Dialog from '@radix-ui/react-dialog';
import { MixerHorizontalIcon, Cross2Icon } from '@radix-ui/react-icons';
import ViewOptions from '../components/ViewOptions';
import Pagination from '../components/Pagination';
import RoomieFilters from '../components/RoomieFilters';




const RoomiesPage = () => {
    const [allRoommates, setAllRoommates] = useState([]);  
    const [loading, setLoading] = useState(true);
    
    const [view, setView] = useState('grid');
    const [sortOrder, setSortOrder] = useState('recent');
    const [currentPage, setCurrentPage] = useState(1);
    const roommatesPerPage = 12;

    const [maxBudget, setMaxBudget] = useState(500);

    const [filters, setFilters] = useState({
        location: '',
        price: maxBudget,
        hasApartment: 'any',
        interests: new Set(),
        verifiedOnly: false,
    });

    useEffect(() => {
        const loadRoommates = async () => {
            setLoading(true);
            try {
                const data = await fetchRoommates();
                if (data && data.length > 0) {
                    const max = Math.max(...data.map(r => r?.budget?.max ?? 0));
                    setMaxBudget(max);
                    setFilters(prev => ({ ...prev, price: max }));
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

        // Ubicación
        if (filters.location) {
            const q = filters.location.toLowerCase();
            list = list.filter(r => (r.location || '').toLowerCase().includes(q));
        }

        // Presupuesto máximo (usamos budget.max cuando exista, si no budget o price equivalente)
        list = list.filter(r => {
            const maxBudget = r?.budget?.max ?? r?.budget ?? 0;
            return maxBudget <= filters.price;
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
        return <p className="text-center mt-4">Cargando roommates...</p>;
    }

    return (
        <div className="homepage-layout">
            <RoomieFilters filters={filters} setFilters={setFilters} maxBudget={maxBudget} />
            <div className="properties-section">
                <h1>Encuentra tu roomie ideal</h1>
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
                                <RoommateCard key={roommate.id ?? idx} roommate={roommate} />
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