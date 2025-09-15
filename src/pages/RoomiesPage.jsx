// src/pages/RoomiesPage.jsx
import React from 'react';
import './PageStyles.css';
import RoomieCard from '../components/RoomieCard';

// YA NO NECESITAS IMPORTAR NI RENDERIZAR LA NAVBAR AQUÍ
// Tampoco necesitas recibir 'toggleTheme'

const RoomiesPage = () => {
  return (
    <>
      <RoomieCard/>
    </>
  );
};

export default RoomiesPage;