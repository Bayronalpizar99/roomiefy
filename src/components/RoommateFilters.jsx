import React from 'react';
import './RoommateFilters.css';
import { Flex, Box, Text, Slider } from '@radix-ui/themes';
import { Search } from 'lucide-react';

// Define los valores iniciales para los filtros
export const initialFilters = {
    location: '',
    hasApartment: null,
    ageRange: { min: 18, max: 99 },
    budgetRange: { min: 50, max: 500 },
    cleanliness: 1,
    socialLevel: 1,
    petsOk: false,
    smokingOk: false,
    guestsOk: false,
    interests: [],
};

// Componente de filtros
export const RoommateFilters = ({ filters, onFiltersChange }) => {
    const handleLocationChange = (e) => {
        onFiltersChange({ ...filters, location: e.target.value });
    };

    const handleAgeMinChange = (e) => {
        onFiltersChange({ ...filters, ageRange: { ...filters.ageRange, min: parseInt(e.target.value) } });
    };

    const handleAgeMaxChange = (e) => {
        onFiltersChange({ ...filters, ageRange: { ...filters.ageRange, max: parseInt(e.target.value) } });
    };

    const handleBudgetMinChange = (e) => {
        onFiltersChange({ ...filters, budgetRange: { ...filters.budgetRange, min: parseInt(e.target.value) } });
    };

    const handleBudgetMaxChange = (e) => {
        onFiltersChange({ ...filters, budgetRange: { ...filters.budgetRange, max: parseInt(e.target.value) } });
    };

    const handleCleanlinessChange = (e) => {
        onFiltersChange({ ...filters, cleanliness: parseInt(e.target.value) });
    };

    const handleSocialLevelChange = (e) => {
        onFiltersChange({ ...filters, socialLevel: parseInt(e.target.value) });
    };

    const handleCheckboxChange = (field) => {
        onFiltersChange({ ...filters, [field]: !filters[field] });
    };

    const handleApartmentTypeChange = (e) => {
        const value = e.target.value;
        let hasApartment = null;
        if (value === 'con_apartamento') hasApartment = true;
        if (value === 'sin_apartamento') hasApartment = false;
        onFiltersChange({ ...filters, hasApartment });
    };

    return (
        <Box className="filter-container">
            <Text as="h3" size="3" weight="bold" mb="2">🔍 Filtros</Text>
            
            {/* Ubicación */}
            <Box mb="3">
                <Text as="label" size="2" weight="bold">Ubicación</Text>
                <div className="input-container">
                    <span className="input-icon"><Search size={16} /></span>
                    <input 
                        type="text"
                        placeholder="Ej: Santa Clara, Alajuela" 
                        value={filters.location} 
                        onChange={handleLocationChange}
                        className="text-input"
                    />
                </div>
            </Box>
            
            {/* Tipo de roomie */}
            <Box mb="3">
                <Text as="label" size="2" weight="bold">Tipo de roomie</Text>
                <select 
                    defaultValue="todos"
                    onChange={handleApartmentTypeChange}
                    className="select-input"
                >
                    <option value="todos">Todos</option>
                    <option value="con_apartamento">Con apartamento</option>
                    <option value="sin_apartamento">Sin apartamento</option>
                </select>
            </Box>
            
            {/* Edad */}
            <Box mb="3">
                <Flex justify="between" mb="1">
                    <Text as="label" size="2" weight="bold">Edad: {filters.ageRange.min} - {filters.ageRange.max}</Text>
                </Flex>
                <div className="range-inputs">
                    <input 
                        type="number" 
                        min="18" 
                        max="99" 
                        value={filters.ageRange.min}
                        onChange={handleAgeMinChange}
                        className="number-input"
                    />
                    <span>-</span>
                    <input 
                        type="number" 
                        min="18" 
                        max="99" 
                        value={filters.ageRange.max}
                        onChange={handleAgeMaxChange}
                        className="number-input"
                    />
                </div>
            </Box>
            
            {/* Presupuesto */}
            <Box mb="3">
                <Flex justify="between" mb="1">
                    <Text as="label" size="2" weight="bold">Presupuesto: ${filters.budgetRange.min} - ${filters.budgetRange.max}</Text>
                </Flex>
                <div className="range-inputs">
                    <input 
                        type="number" 
                        min="50" 
                        max="500" 
                        step="10"
                        value={filters.budgetRange.min}
                        onChange={handleBudgetMinChange}
                        className="number-input"
                    />
                    <span>-</span>
                    <input 
                        type="number" 
                        min="50" 
                        max="500" 
                        step="10"
                        value={filters.budgetRange.max}
                        onChange={handleBudgetMaxChange}
                        className="number-input"
                    />
                </div>
            </Box>
            
            {/* Nivel de limpieza mínimo */}
            <Box mb="3">
                <Flex justify="between" mb="1">
                    <Text as="label" size="2" weight="bold">Nivel de limpieza mínimo: {filters.cleanliness}</Text>
                </Flex>
                <input 
                    type="range" 
                    min="1" 
                    max="5" 
                    step="1"
                    value={filters.cleanliness}
                    onChange={handleCleanlinessChange}
                    className="range-slider"
                />
            </Box>
            
            {/* Nivel social mínimo */}
            <Box mb="3">
                <Flex justify="between" mb="1">
                    <Text as="label" size="2" weight="bold">Nivel social mínimo: {filters.socialLevel}</Text>
                </Flex>
                <Slider 
                    min={1}
                    max={5}
                    step={1}
                    onChange={handleSocialLevelChange}
                    className="range-slider"
                />
            </Box>
            
            {/* Preferencias */}
            <Box mb="3">
                <Text as="label" size="2" weight="bold" mb="2">Preferencias</Text>
                <Flex direction="column" gap="2">
                    <label className="checkbox-label">
                        <input 
                            type="checkbox" 
                            checked={filters.petsOk} 
                            onChange={() => handleCheckboxChange('petsOk')} 
                        /> 
                        Mascotas
                    </label>
                    <label className="checkbox-label">
                        <input 
                            type="checkbox" 
                            checked={filters.smokingOk} 
                            onChange={() => handleCheckboxChange('smokingOk')} 
                        /> 
                        Invitados
                    </label>
                    <label className="checkbox-label">
                        <input 
                            type="checkbox" 
                            checked={filters.guestsOk} 
                            onChange={() => handleCheckboxChange('guestsOk')} 
                        /> 
                        Fumadores
                    </label>
                </Flex>
            </Box>
        </Box>
    );
};

export default RoommateFilters;