import React from 'react';
import { Navbar } from '../components/Navbar';
import './PageStyles.css';

// 1. Recibe 'toggleTheme' como prop
const PublishPage = ({ toggleTheme }) => {
  return (
    <div className="page-layout">
      {/* 2. Pásalo a la Navbar */}
      <Navbar toggleTheme={toggleTheme} />
      <main className="main-content">
        <h1>Publicar una Propiedad</h1>
        <p>Completa el formulario para añadir tu propiedad a la lista.</p>
        <div className="card-placeholder"></div>
      </main>
    </div>
  );
};

export default PublishPage;