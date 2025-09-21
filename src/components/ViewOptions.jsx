import React from 'react';
import { LayoutGrid, List } from 'lucide-react';
import * as Select from '@radix-ui/react-select';
import { ChevronDownIcon, CheckIcon } from '@radix-ui/react-icons';
import './ViewOptions.css';

const ViewOptions = ({ view, setView, sortOrder, setSortOrder }) => {
  return (
    <div className="view-options-container">
      <div className="view-switcher">
        <button 
          className={`view-btn ${view === 'grid' ? 'active' : ''}`} 
          onClick={() => setView('grid')}
          aria-label="Grid View"
        >
          <LayoutGrid size={20} />
        </button>
        <button 
          className={`view-btn ${view === 'list' ? 'active' : ''}`} 
          onClick={() => setView('list')}
          aria-label="List View"
        >
          <List size={20} />
        </button>
      </div>

      <Select.Root value={sortOrder} onValueChange={setSortOrder}>
        <Select.Trigger className="sort-trigger">
          <Select.Value />
          <Select.Icon>
            <ChevronDownIcon />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className="sort-content">
            <Select.Viewport>
              {/* --- INICIO DE CAMBIOS --- */}
              <Select.Item value="recent" className="sort-item">
                <Select.ItemText>Más recientes</Select.ItemText>
                <Select.ItemIndicator><CheckIcon /></Select.ItemIndicator>
              </Select.Item>
              <Select.Item value="price-asc" className="sort-item">
                <Select.ItemText>Precio: menor a mayor</Select.ItemText>
                <Select.ItemIndicator><CheckIcon /></Select.ItemIndicator>
              </Select.Item>
              <Select.Item value="price-desc" className="sort-item">
                <Select.ItemText>Precio: mayor a menor</Select.ItemText>
                <Select.ItemIndicator><CheckIcon /></Select.ItemIndicator>
              </Select.Item>
              <Select.Item value="rated" className="sort-item">
                <Select.ItemText>Mejor calificados</Select.ItemText>
                <Select.ItemIndicator><CheckIcon /></Select.ItemIndicator>
              </Select.Item>
              {/* --- FIN DE CAMBIOS --- */}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
};

export default ViewOptions;