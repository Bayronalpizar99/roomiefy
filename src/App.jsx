import { useState, useEffect } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';

// Importa tus componentes
import { Navbar } from './components/Navbar';
import HomePage from './pages/HomePage.jsx';
import RoomiesPage from './pages/RoomiesPage.jsx';
import PublishPage from './pages/PublishPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import './App.css';

// Componente de Layout que incluye el Navbar
const AppLayout = ({ toggleTheme }) => (
  <div className="page-layout">
    {/* El Navbar ahora es persistente y recibe la función para cambiar el tema */}
    <Navbar toggleTheme={toggleTheme} />
    
    {/* Outlet renderizará el componente de la ruta actual (HomePage, RoomiesPage, etc.) */}
    <main className="main-content">
      <Outlet />
    </main>
  </div>
);

function App() {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    document.body.className = '';
    document.body.classList.add(theme);
  }, [theme]);

  return (
    <div className="app-container">
      <Routes>
        {/* Todas las rutas ahora usan AppLayout como elemento principal */}
        <Route path="/" element={<AppLayout toggleTheme={toggleTheme} />}>
          {/* Estas son las rutas anidadas que se renderizarán en el Outlet */}
          <Route index element={<HomePage />} />
          <Route path="roomies" element={<RoomiesPage />} />
          <Route path="publicar" element={<PublishPage />} />
          <Route path="chat" element={<ChatPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;