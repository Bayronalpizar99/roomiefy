import React from 'react';
import { Filter, ChevronDownIcon, CheckIcon } from 'lucide-react';
import * as Label from '@radix-ui/react-label';
import * as Slider from '@radix-ui/react-slider';
import * as Select from '@radix-ui/react-select';
import * as Checkbox from '@radix-ui/react-checkbox';
import './Filters.css';

const RoomieFilters = ({ filters, setFilters, minBudget = 100, maxBudget = 2000, minAge = 18, maxAge = 99 }) => {
  const formatAmount = (n) => `$${new Intl.NumberFormat('es-MX').format(Number(n ?? 0))}`;
  const interestsList = [
    'Deportes',
    'Música',
    'Cocina',
    'Tecnología',
    'Lectura',
    'Viajes',
    'Películas',
  ];

  const hasApartmentOptions = [
    { value: 'any', label: 'Cualquiera' },
    { value: 'yes', label: 'Sí tiene' },
    { value: 'no', label: 'No tiene' },
  ];

  const handleLocationChange = (e) => {
    setFilters((prev) => ({ ...prev, location: e.target.value }));
  };

  const handleBudgetRangeChange = (value) => {
    // value = [min, max]
    setFilters((prev) => ({ ...prev, priceRange: value }));
  };

  const handleAgeRangeChange = (value) => {
    setFilters((prev) => ({ ...prev, ageRange: value }));
  };

  const handleHasApartmentChange = (value) => {
    setFilters((prev) => ({ ...prev, hasApartment: value }));
  };

  const handleInterestChange = (interest) => {
    setFilters((prev) => {
      const newInterests = new Set(prev.interests);
      if (newInterests.has(interest)) newInterests.delete(interest);
      else newInterests.add(interest);
      return { ...prev, interests: newInterests };
    });
  };

  const handleVerifiedChange = () => {
    setFilters((prev) => ({ ...prev, verifiedOnly: !prev.verifiedOnly }));
  };

  const handleMinCleanlinessChange = (value) => {
    setFilters((prev) => ({ ...prev, minCleanliness: value[0] }));
  };

  const handleMinSocialChange = (value) => {
    setFilters((prev) => ({ ...prev, minSocial: value[0] }));
  };

  const clearFilters = () => {
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
          placeholder="Buscar ciudad o zona..."
          value={filters.location}
          onChange={handleLocationChange}
        />
      </div>

      {/* EDAD */}
      <div className="filter-group">
        <Label.Root>
          Edad: {filters.ageRange?.[0] ?? minAge} - {filters.ageRange?.[1] ?? maxAge} años
        </Label.Root>
        <Slider.Root
          className="radix-slider-root"
          radius="full"
          value={filters.ageRange ?? [minAge, maxAge]}
          onValueChange={handleAgeRangeChange}
          min={minAge}
          max={maxAge}
          step={1}
        >
          <Slider.Track className="radix-slider-track">
            <Slider.Range className="radix-slider-range" />
          </Slider.Track>
          <Slider.Thumb className="radix-slider-thumb" aria-label="Edad mínima" />
          <Slider.Thumb className="radix-slider-thumb" aria-label="Edad máxima" />
        </Slider.Root>
      </div>

      {/* PRESUPUESTO */}
      <div className="filter-group">
        <Label.Root>
          Presupuesto: {formatAmount(filters.priceRange?.[0] ?? minBudget)} - {formatAmount(filters.priceRange?.[1] ?? maxBudget)}
        </Label.Root>
        <Slider.Root
          className="radix-slider-root"
          radius="full"
          value={filters.priceRange ?? [minBudget, maxBudget]}
          onValueChange={handleBudgetRangeChange}
          min={minBudget}
          max={maxBudget}
          step={10}
        >
          <Slider.Track className="radix-slider-track">
            <Slider.Range className="radix-slider-range" />
          </Slider.Track>
          <Slider.Thumb className="radix-slider-thumb" aria-label="Presupuesto mínimo" />
          <Slider.Thumb className="radix-slider-thumb" aria-label="Presupuesto máximo" />
        </Slider.Root>
      </div>

      {/* LIMPIEZA MÍNIMA */}
      <div className="filter-group">
        <Label.Root>Nivel de limpieza mínimo: {filters.minCleanliness}/5</Label.Root>
        <Slider.Root
          className="radix-slider-root"
          radius="full"
          value={[filters.minCleanliness]}
          onValueChange={handleMinCleanlinessChange}
          min={1}
          max={5}
          step={1}
        >
          <Slider.Track className="radix-slider-track">
            <Slider.Range className="radix-slider-range" />
          </Slider.Track>
          <Slider.Thumb className="radix-slider-thumb" aria-label="Nivel de limpieza mínimo" />
        </Slider.Root>
      </div>

      {/* SOCIAL MÍNIMO */}
      <div className="filter-group">
        <Label.Root>Nivel social mínimo: {filters.minSocial}/5</Label.Root>
        <Slider.Root
          className="radix-slider-root"
          radius="full"
          value={[filters.minSocial]}
          onValueChange={handleMinSocialChange}
          min={1}
          max={5}
          step={1}
        >
          <Slider.Track className="radix-slider-track">
            <Slider.Range className="radix-slider-range" />
          </Slider.Track>
          <Slider.Thumb className="radix-slider-thumb" aria-label="Nivel social mínimo" />
        </Slider.Root>
      </div>

      {/* TIENE CASA */}
      <div className="filter-group">
        <Label.Root>¿Tiene casa?</Label.Root>
        <Select.Root value={filters.hasApartment} onValueChange={handleHasApartmentChange}>
          <Select.Trigger className="radix-select-trigger">
            <Select.Value />
            <Select.Icon>
              <ChevronDownIcon size={16} />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className="radix-select-content">
              <Select.Viewport>
                {hasApartmentOptions.map((opt) => (
                  <Select.Item key={opt.value} value={opt.value} className="radix-select-item">
                    <Select.ItemText>{opt.label}</Select.ItemText>
                    <Select.ItemIndicator>
                      <CheckIcon />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>

      {/* VERIFICADO */}
      <div className="filter-group">
        <div className="checkbox-item">
          <Checkbox.Root
            className="radix-checkbox-root"
            id="verifiedOnly"
            checked={filters.verifiedOnly}
            onCheckedChange={handleVerifiedChange}
          >
            <Checkbox.Indicator className="radix-checkbox-indicator">
              <CheckIcon size={16} strokeWidth={3} />
            </Checkbox.Indicator>
          </Checkbox.Root>
          <Label.Root htmlFor="verifiedOnly" className="radix-checkbox-label">
            Solo verificados
          </Label.Root>
        </div>
      </div>

      {/* INTERESES */}
      <div className="filter-group">
        <Label.Root>Intereses</Label.Root>
        <div className="scrollable-amenities">
          <div className="checkbox-group">
            {interestsList.map((item) => (
              <div key={item} className="checkbox-item">
                <Checkbox.Root
                  className="radix-checkbox-root"
                  id={item}
                  checked={filters.interests.has(item)}
                  onCheckedChange={() => handleInterestChange(item)}
                >
                  <Checkbox.Indicator className="radix-checkbox-indicator">
                    <CheckIcon size={16} strokeWidth={3} />
                  </Checkbox.Indicator>
                </Checkbox.Root>
                <Label.Root htmlFor={item} className="radix-checkbox-label">
                  {item}
                </Label.Root>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button className="clear-button" onClick={clearFilters}>
        Limpiar
      </button>
    </aside>
  );
};

export default RoomieFilters;
