import React from 'react';
import { Filter, ChevronDownIcon, CheckIcon } from 'lucide-react';
import * as Label from '@radix-ui/react-label';
import * as Slider from '@radix-ui/react-slider';
import * as Select from '@radix-ui/react-select';
import * as Checkbox from '@radix-ui/react-checkbox';
import './Filters.css'; 

// 1. Aceptamos los filtros y sus funciones como props
const Filters = ({
  filters,
  setFilters,
}) => {
  
  const amenitiesList = [
    'Wi-Fi', 'Aire acondicionado', 'Cocina equipada', 'TV', 'Piscina', 'Gimnasio', 'Pet-Friendly'
  ];

  const bedroomOptions = [
    { value: 'any', label: 'Cualquiera' },
    { value: 'studio', label: 'Estudio' },
    { value: '1', label: '1 recámara' },
    { value: '2', label: '2 recámara' },
    { value: '3', label: '3 recámara' },
    { value: '4+', label: '4+ recámaras' },
  ];

  // 2. Funciones para manejar cambios en cada filtro
  const handleLocationChange = (e) => {
    setFilters(prev => ({ ...prev, location: e.target.value }));
  };

  const handlePriceChange = (value) => {
    setFilters(prev => ({ ...prev, price: value[0] }));
  };

  const handleBedroomsChange = (value) => {
    setFilters(prev => ({ ...prev, bedrooms: value }));
  };

  const handleAmenityChange = (amenity) => {
    setFilters(prev => {
      const newAmenities = new Set(prev.amenities);
      if (newAmenities.has(amenity)) {
        newAmenities.delete(amenity);
      } else {
        newAmenities.add(amenity);
      }
      return { ...prev, amenities: newAmenities };
    });
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      price: 500, // Valor máximo
      bedrooms: 'any',
      amenities: new Set(),
    });
  };

  return (
    <aside className="filters-container">
      <h2 className="filters-title">
        <Filter size={20} />
        <span>Filtros</span>
      </h2>

      {/* UBICACIÓN */}
      <div className="filter-group">
        <Label.Root htmlFor="location">Ubicación</Label.Root>
        <input 
          className="radix-input" 
          type="text" 
          id="location" 
          placeholder="Buscar en Costa Rica..." 
          value={filters.location}
          onChange={handleLocationChange}
        />
      </div>

      {/* RANGO DE PRECIO */}
      <div className="filter-group">
        <Label.Root>Precio (hasta ${filters.price})</Label.Root>
        {/* --- INICIO DE LA MODIFICACIÓN --- */}
        <Slider.Root 
          className="radix-slider-root" 
          value={[filters.price]} 
          onValueChange={handlePriceChange}
          max={500} 
          step={10}
        >
          <Slider.Track className="radix-slider-track">
            <Slider.Range className="radix-slider-range" />
          </Slider.Track>
          <Slider.Thumb className="radix-slider-thumb" aria-label="Precio" />
        </Slider.Root>
        {/* --- FIN DE LA MODIFICACIÓN --- */}
      </div>
      
      {/* RECÁMARAS */}
      <div className="filter-group">
        <Label.Root>Recámaras</Label.Root>
        <Select.Root value={filters.bedrooms} onValueChange={handleBedroomsChange}>
          <Select.Trigger className="radix-select-trigger">
            <Select.Value />
            <Select.Icon><ChevronDownIcon size={16} /></Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className="radix-select-content">
              <Select.Viewport>
                {bedroomOptions.map(opt => (
                  <Select.Item key={opt.value} value={opt.value} className="radix-select-item">
                    <Select.ItemText>{opt.label}</Select.ItemText>
                    <Select.ItemIndicator><CheckIcon /></Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>

      {/* COMODIDADES */}
      <div className="filter-group">
        <Label.Root>Comodidades</Label.Root>
        <div className="scrollable-amenities">
          <div className="checkbox-group">
            {amenitiesList.map(item => (
              <div key={item} className="checkbox-item">
                <Checkbox.Root 
                  className="radix-checkbox-root" 
                  id={item}
                  checked={filters.amenities.has(item)}
                  onCheckedChange={() => handleAmenityChange(item)}
                >
                  <Checkbox.Indicator className="radix-checkbox-indicator">
                    <CheckIcon size={16} strokeWidth={3} />
                  </Checkbox.Indicator>
                </Checkbox.Root>
                <Label.Root htmlFor={item} className="radix-checkbox-label">{item}</Label.Root>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <button className="clear-button" onClick={clearFilters}>Limpiar</button>
    </aside>
  );
};

export default Filters;