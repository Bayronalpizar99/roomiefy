import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import * as ScrollArea from '@radix-ui/react-scroll-area';

// Importa tus componentes y páginas
import { Navbar } from './components/Navbar';
import HomePage from './pages/HomePage.jsx';
import RoomiesPage from './pages/RoomiesPage.jsx';
import PublishPage from './pages/PublishPage.jsx';
import PropertyDetailPage from './pages/PropertyDetailPage.jsx'; // 1. Importa la nueva página
import RoomieDetailPage from './pages/RoomieDetailPage.jsx';
import './App.css';

function App() {
  const [theme, setTheme] = useState('light');
  // ... (el resto de tu lógica de App no cambia)
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    document.body.className = '';
    document.body.classList.add(theme);
  }, [theme]);

  return (
    <div className="app-layout">
      <Navbar toggleTheme={toggleTheme} />
      
      <ScrollArea.Root className="main-content-area">
        <ScrollArea.Viewport className="scroll-area-viewport">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="roomies" element={<RoomiesPage />} />
            <Route path="publicar" element={<PublishPage />} />
            {/* 2. Añade la nueva ruta dinámica */}
            <Route path="/propiedad/:propertyId" element={<PropertyDetailPage />} />
            <Route path="/roomie/:roomieId" element={<RoomieDetailPage />} />
          </Routes>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar className="scroll-area-scrollbar" orientation="vertical">
          <ScrollArea.Thumb className="scroll-area-thumb" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </div>
  );
}

export default App;