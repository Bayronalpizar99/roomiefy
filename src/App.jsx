// src/App.jsx

import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { AuthProvider } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import HomePage from "./pages/HomePage.jsx";
import RoomiesPage from "./pages/RoomiesPage.jsx";
import PublishPage from "./pages/PublishPage.jsx";
import PropertyDetailPage from "./pages/PropertyDetailPage.jsx";
import RoomieDetailPage from "./pages/RoomieDetailPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import { useTheme } from "./hooks/useTheme";
import { fetchProperties } from './services/api'; // <--- 1. Importamos la función de la API
import "./App.css";


function App() {
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  // --- INICIO DE CAMBIOS ---
  // 2. Creamos un estado central para las propiedades
  const [allProperties, setAllProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // 3. Cargamos las propiedades una sola vez, aquí en App.jsx
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const propertiesData = await fetchProperties();
      setAllProperties(propertiesData);
      setLoading(false);
    };
    loadData();
  }, []);

  // 4. Creamos una función para añadir una nueva propiedad a nuestra lista central
  const handleAddProperty = (newProperty) => {
    setAllProperties(prevProperties => [newProperty, ...prevProperties]);
  };
  // --- FIN DE CAMBIOS ---

  const handleSearch = (query) => {
    setSearchQuery(query);
  };
  
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (location.pathname === '/roomies') {
      return;
    } else if (location.pathname === '/') {
      setCurrentPage(1);
    } else {
      setSearchQuery('');
    }
  }, [location.pathname]);

  return (
    <AuthProvider>
      <div className="app-layout">
        <Navbar
          toggleTheme={toggleTheme}
          onSearch={handleSearch}
          searchQuery={searchQuery}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />

        <ScrollArea.Root className="main-content-area">
          <ScrollArea.Viewport className="scroll-area-viewport">
            <Routes>
              {/* 5. Pasamos la lista de propiedades y el estado de carga a HomePage */}
              <Route path="/" element={<HomePage searchQuery={searchQuery} properties={allProperties} loading={loading} />} />
              <Route
                path="roomies"
                element={
                  <RoomiesPage
                    searchQuery={searchQuery}
                    onSearchQueryChange={handleSearch}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                  />
                }
              />
              {/* 6. Pasamos la función para añadir propiedades a PublishPage */}
              <Route path="publicar" element={<PublishPage onAddProperty={handleAddProperty} />} />
              <Route
                path="/propiedad/:propertyId"
                element={<PropertyDetailPage />}
              />
              <Route path="/roomie/:roomieId" element={<RoomieDetailPage />} />
              <Route path="perfil" element={<ProfilePage />} />
              <Route path="chat" element={<ChatPage />} />
            </Routes>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar
            className="scroll-area-scrollbar"
            orientation="vertical"
          >
            <ScrollArea.Thumb className="scroll-area-thumb" />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
      </div>
    </AuthProvider>
   );
}

export default App;