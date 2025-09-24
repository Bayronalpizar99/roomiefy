// src/App.jsx

import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { AuthProvider } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import HomePage from "./pages/HomePage.jsx";
import RoomiesPage from "./pages/RoomiesPage.jsx";
import PublishPage from "./pages/PublishPage.jsx";
import MyPropertiesPage from './pages/MyPropertiesPage.jsx'; // 1. Importamos la nueva página
import PropertyDetailPage from "./pages/PropertyDetailPage.jsx";
import RoomieDetailPage from "./pages/RoomieDetailPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import { useTheme } from "./hooks/useTheme";
import { fetchProperties } from './services/api';
import "./App.css";

function App() {
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  // --- INICIO DE CAMBIOS ---
  const [allProperties, setAllProperties] = useState([]);
  const [myProperties, setMyProperties] = useState([]); // 2. Estado para las propiedades del usuario
  const [hasPublished, setHasPublished] = useState(false); // 3. Estado para saber si ya publicó
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const propertiesData = await fetchProperties();
      setAllProperties(propertiesData);
      setLoading(false);
    };
    loadData();
  }, []);

  // 4. Actualizamos la función para añadir a AMBAS listas
  const handleAddProperty = (newProperty) => {
    setAllProperties(prev => [newProperty, ...prev]);
    setMyProperties(prev => [newProperty, ...prev]);
    setHasPublished(true); // Marcamos que el usuario ya ha publicado
  };

  // 5. Creamos una función para eliminar de AMBAS listas
  const handleDeleteProperty = (propertyId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta propiedad? Esta acción es permanente.')) {
        setAllProperties(prev => prev.filter(p => p.id !== propertyId));
        setMyProperties(prev => prev.filter(p => p.id !== propertyId));
    }
  };
  // --- FIN DE CAMBIOS ---

  const handleSearch = (query) => setSearchQuery(query);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (location.pathname === '/roomies') return;
    if (location.pathname === '/') setCurrentPage(1);
    else setSearchQuery('');
  }, [location.pathname]);

  return (
    <AuthProvider>
      <div className="app-layout">
        {/* 6. Pasamos el estado 'hasPublished' a la Navbar */}
        <Navbar
          toggleTheme={toggleTheme}
          onSearch={handleSearch}
          searchQuery={searchQuery}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          hasPublished={hasPublished}
        />

        <ScrollArea.Root className="main-content-area">
          <ScrollArea.Viewport className="scroll-area-viewport">
            <Routes>
              <Route path="/" element={<HomePage searchQuery={searchQuery} properties={allProperties} loading={loading} />} />
              <Route path="roomies" element={<RoomiesPage searchQuery={searchQuery} onSearchQueryChange={handleSearch} currentPage={currentPage} setCurrentPage={setCurrentPage} />} />
              <Route path="publicar" element={<PublishPage onAddProperty={handleAddProperty} />} />
              
              {/* 7. Añadimos la nueva ruta para "Mis propiedades" */}
              <Route path="/mis-propiedades" element={<MyPropertiesPage myProperties={myProperties} onDeleteProperty={handleDeleteProperty} />} />
              
              <Route path="/propiedad/:propertyId" element={<PropertyDetailPage />} />
              <Route path="/roomie/:roomieId" element={<RoomieDetailPage />} />
              <Route path="perfil" element={<ProfilePage />} />
              <Route path="chat" element={<ChatPage />} />
            </Routes>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar className="scroll-area-scrollbar" orientation="vertical">
            <ScrollArea.Thumb className="scroll-area-thumb" />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
      </div>
    </AuthProvider>
  );
}

export default App;