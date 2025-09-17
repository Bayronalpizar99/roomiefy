import React, { useEffect, useState } from 'react';
import './PageStyles.css';
import { RoommateFilters, initialFilters } from '../components/RoommateFilters';
import RoommateCard from '../components/RoomieCard';
import { fetchRoommates } from '../services/api';
import { Flex, Box, Text } from '@radix-ui/themes';

const RoomiesPage = () => {
    const [allRoommates, setAllRoommates] = useState([]); // Almacena todos los datos sin filtrar
    const [filteredRoommates, setFilteredRoommates] = useState([]); // Almacena los datos filtrados
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState(initialFilters);

    useEffect(() => {
        const loadRoommates = async () => {
            setLoading(true);
            try {
                const data = await fetchRoommates();
                if (data && data.length > 0) {
                    setAllRoommates(data); // Guarda todos los datos originales
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

    // Effect para aplicar los filtros cada vez que cambian los filtros o los roommates
    useEffect(() => {
        const applyFilters = () => {
            const newFilteredRoommates = allRoommates.filter(roomie => {
                // Lógica de filtrado
                const matchesLocation = !filters.location || roomie.location.toLowerCase().includes(filters.location.toLowerCase());
                
                // Filtro de tipo de roomie (con o sin apartamento)
                let matchesApartment = true;
                if (filters.hasApartment !== null) {
                    matchesApartment = roomie.hasApartment === filters.hasApartment;
                }
                
                // Filtro de edad
                const matchesAge = roomie.age >= filters.ageRange.min && roomie.age <= filters.ageRange.max;
                
                // Filtro de presupuesto
                const matchesBudget = (
                    roomie.budget && 
                    roomie.budget.min <= filters.budgetRange.max && 
                    roomie.budget.max >= filters.budgetRange.min
                );
                
                // Filtros de nivel de limpieza y social
                const matchesCleanliness = roomie.cleanliness >= filters.cleanliness;
                const matchesSocialLevel = roomie.socialLevel >= filters.socialLevel;
                
                // Filtros de preferencias
                const matchesPets = !filters.petsOk || (roomie.petsOk === true);
                const matchesSmoking = !filters.smokingOk || (roomie.smokingOk === true);
                const matchesGuests = !filters.guestsOk || (roomie.guestsOk === true);
                
                // Filtro de intereses
                const matchesInterests = filters.interests.length === 0 || 
                    (roomie.interests && filters.interests.some(interest => roomie.interests.includes(interest)));

                return matchesLocation && matchesApartment && matchesAge && matchesBudget && 
                       matchesCleanliness && matchesSocialLevel && 
                       matchesPets && matchesSmoking && matchesGuests && matchesInterests;
            });
            setFilteredRoommates(newFilteredRoommates);
        };

        applyFilters();
    }, [filters, allRoommates]);

    const handleCardClick = (roommate) => {
        console.log('Roommate seleccionado:', roommate);
        // Aquí puedes agregar navegación o lógica al hacer click en un roommate
    };

    if (loading) {
        return <p className="text-center mt-4">Cargando roommates...</p>;
    }

    return (
        <Box p="4">
            <Flex gap="4" direction={{ initial: 'column', md: 'row' }}>
                {/* Columna de filtros */}
                <Box width={{ initial: '100%', md: '300px' }} flexShrink="0">
                    <RoommateFilters filters={filters} onFiltersChange={setFilters} />
                </Box>

                {/* Columna de resultados */}
                <Box flexGrow="1">
                    <Flex wrap="wrap" gap="4" justify="start">
                        {filteredRoommates.length > 0 ? (
                            filteredRoommates.map(roommate => (
                                <Box key={roommate.id} width={{ initial: '100%', sm: 'calc(50% - 16px)', lg: 'calc(50% - 16px)' }}>
                                    <RoommateCard
                                        roommate={roommate}
                                        onClick={handleCardClick}
                                    />
                                </Box>
                            ))
                        ) : (
                            <Text size="4" align="center" color="gray" width="100%">
                                No se encontraron roommates con los filtros aplicados.
                            </Text>
                        )}
                    </Flex>
                </Box>
            </Flex>
        </Box>
    );
};

export default RoomiesPage;