import React from 'react';
import { Filter, ChevronDownIcon, CheckIcon } from 'lucide-react';

// Importa los componentes de Radix que vamos a usar
import * as Label from '@radix-ui/react-label';
import * as Slider from '@radix-ui/react-slider';
import * as Select from '@radix-ui/react-select';
import * as Checkbox from '@radix-ui/react-checkbox';

import './Filters.css'; 

const Filters = () => {
  const amenities = [
    { id: 'wifi', label: 'Wifi' },
    { id: 'cocina', label: 'Cocina equipada' },
    { id: 'lavadora', label: 'Lavadora' },
    { id: 'aire', label: 'Aire acondicionado' },
    { id: 'calefaccion', label: 'Calefacción' },
    { id: 'tv', label: 'Tv' },
    { id: 'gym', label: 'Gimnasio' },
    { id: 'pool', label: 'Piscina' },
  ];

  // Opciones para el selector de recámaras
  const bedroomOptions = [
    { value: 'any', label: 'Cualquiera' },
    { value: 'studio', label: 'Estudio' },
    { value: '1', label: '1 recámara' },
    { value: '2', label: '2 recámaras' },
    { value: '3', label: '3 recámaras' },
    { value: '4+', label: '4+ recámaras' },
  ];

  return (
    <aside className="filters-container">
      <h2 className="filters-title">
        <Filter size={20} />
        <span>Filtros</span>
      </h2>

      {/* --- UBICACIÓN --- */}
      <div className="filter-group">
        <Label.Root htmlFor="location">Ubicación</Label.Root>
        <input className="radix-input" type="text" id="location" placeholder="Ingresa una ubicación" />
      </div>

      {/* --- RANGO DE PRECIO (CON RADIX SLIDER) --- */}
      <div className="filter-group">
        <Label.Root>Rango de precio (mes)</Label.Root>
        <div className="price-range-labels">
          <span>$0</span>
          <span>$100</span>
        </div>
        <Slider.Root className="radix-slider-root" defaultValue={[50]} max={100} step={1}>
          <Slider.Track className="radix-slider-track">
            <Slider.Range className="radix-slider-range" />
          </Slider.Track>
          <Slider.Thumb className="radix-slider-thumb" />
        </Slider.Root>
      </div>
      
      {/* --- INICIO DE CAMBIOS: RECÁMARAS (CON RADIX SELECT) --- */}
      <div className="filter-group">
        <Label.Root>Recámaras</Label.Root>
        <Select.Root defaultValue="any">
          <Select.Trigger className="radix-select-trigger">
            <Select.Value placeholder="Selecciona..." />
            <Select.Icon>
              <ChevronDownIcon size={16} />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className="radix-select-content">
              <Select.Viewport>
                {bedroomOptions.map(option => (
                  <Select.Item key={option.value} value={option.value} className="radix-select-item">
                    <Select.ItemText>{option.label}</Select.ItemText>
                    <Select.ItemIndicator className="radix-select-item-indicator">
                      <CheckIcon size={16} />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>
      {/* --- FIN DE CAMBIOS --- */}

      {/* --- COMODIDADES (CON RADIX CHECKBOX) --- */}
      <div className="filter-group">
        <Label.Root>Comodidades</Label.Root>
        <div className="scrollable-amenities">
          <div className="checkbox-group">
            {amenities.map(item => (
              <div key={item.id} className="checkbox-item">
                <Checkbox.Root className="radix-checkbox-root" id={item.id}>
                  <Checkbox.Indicator className="radix-checkbox-indicator">
                    <CheckIcon size={16} strokeWidth={3} />
                  </Checkbox.Indicator>
                </Checkbox.Root>
                <Label.Root htmlFor={item.id} className="radix-checkbox-label">
                  {item.label}
                </Label.Root>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <button className="clear-button">Limpiar</button>
    </aside>
  );
};

export default Filters;