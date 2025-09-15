import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

// Importa tus componentes y páginas
import { Navbar } from './components/Navbar';
import HomePage from './pages/HomePage.jsx';
import RoomiesPage from './pages/RoomiesPage.jsx';
import PublishPage from './pages/PublishPage.jsx';
import './App.css';

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
    // Contenedor principal que ocupa toda la pantalla y no tiene scroll
    <div className="app-layout">
      <Navbar toggleTheme={toggleTheme} />
      
      {/* Esta es el área de contenido que SÍ tendrá scroll */}
      <main className="main-content-area">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="roomies" element={<RoomiesPage />} />
          <Route path="publicar" element={<PublishPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;