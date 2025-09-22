import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import * as ScrollArea from '@radix-ui/react-scroll-area';

// 1. Importa el AuthProvider
import { AuthProvider } from "./context/AuthContext";

// Importa tus componentes y páginas
import { Navbar } from "./components/Navbar";
import HomePage from "./pages/HomePage.jsx";
import RoomiesPage from "./pages/RoomiesPage.jsx";
import PublishPage from "./pages/PublishPage.jsx";
import PropertyDetailPage from "./pages/PropertyDetailPage.jsx";
import RoomieDetailPage from "./pages/RoomieDetailPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import "./App.css";


function App() {
  const [theme, setTheme] = useState('light');
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    document.body.className = "";
    document.body.classList.add(theme);
  }, [theme]);

  // Clear search when navigating between roomies and home pages
  useEffect(() => {
    if (location.pathname === '/roomies') {
      // Si estamos en roomies, mantener la búsqueda
      return;
    } else if (location.pathname === '/') {
      // Si estamos en home, mantener la búsqueda pero reiniciar la página
      setCurrentPage(1);
    } else {
      // En otras páginas, limpiar la búsqueda
      setSearchQuery('');
    }
  }, [location.pathname]);

  return (

    // 2. Envuelve toda la aplicación con AuthProvider
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
              <Route path="/" element={<HomePage searchQuery={searchQuery} />} />
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
              <Route path="publicar" element={<PublishPage />} />
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
