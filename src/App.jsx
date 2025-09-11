// 1. Importa useState y useEffect
import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import RoomiesPage from './pages/RoomiesPage.jsx';
import PublishPage from './pages/PublishPage.jsx';
import './App.css';

function App() {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  // 2. Añade este efecto para cambiar la clase en el <body>
  useEffect(() => {
    document.body.className = ''; // Limpia clases anteriores
    document.body.classList.add(theme); // Añade la clase actual
  }, [theme]); // Se ejecuta cada vez que 'theme' cambia

  return (
    // 3. Ya no necesitas la clase aquí
    <div className="app-container">
      <Routes>
        <Route path="/" element={<HomePage toggleTheme={toggleTheme} />} />
        <Route path="/roomies" element={<RoomiesPage toggleTheme={toggleTheme} />} />
        <Route path="/publicar" element={<PublishPage toggleTheme={toggleTheme} />} />
      </Routes>
    </div>
  );
}

export default App;