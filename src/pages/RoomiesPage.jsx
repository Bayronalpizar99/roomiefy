import React from 'react';
import { Navbar } from '../components/Navbar';
import './PageStyles.css';

// 1. Recibe 'toggleTheme' como prop
const RoomiesPage = ({ toggleTheme }) => {
  return (
    <div className="page-layout">
      {/* 2. Pásalo a la Navbar */}
      <Navbar toggleTheme={toggleTheme} />
      <main className="main-content">
        <h1>Página de Roomies</h1>
        <p>Aquí podrás encontrar roomies</p>
        <div className="card-placeholder"></div>
      </main>
    </div>
  );
};

export default RoomiesPage;