import React from 'react';
import { Navbar } from '../components/Navbar';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="homepage-layout">
      <Navbar />
      <main className="main-content">
        <h1>Bienvenido a Tu Aplicación</h1>
        <p>Este es el contenido principal de tu página. ¡Puedes empezar a construir desde aquí!</p>
        <div className="card-placeholder"></div>
        <div className="card-placeholder"></div>
        <div className="card-placeholder"></div>
      </main>
    </div>
  );
};

export default HomePage;
