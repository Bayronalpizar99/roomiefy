// src/pages/RoomiesPage.jsx
import React from 'react';
import './PageStyles.css';

// YA NO NECESITAS IMPORTAR NI RENDERIZAR LA NAVBAR AQUÍ
// Tampoco necesitas recibir 'toggleTheme'

const RoomiesPage = () => {
  return (
    <>
      <h1>Página de Roomies</h1>
      <p>Aquí podrás encontrar roomies</p>
      <div className="card-placeholder"></div>
    </>
  );
};

export default RoomiesPage;