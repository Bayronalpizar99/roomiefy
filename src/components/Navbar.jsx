import React, { useState, useEffect } from 'react';
import './Navbar.css';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { Link, useLocation } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  SunIcon,
  ChatBubbleIcon,
  BellIcon,
  HomeIcon,
  AvatarIcon,
  PlusCircledIcon,
} from "@radix-ui/react-icons";

import appLogo from "../assets/roomify2.png";
import { useAuth } from "../context/AuthContext";
import LoginButton from "./LoginButton";

export const Navbar = ({ toggleTheme, onSearch, searchQuery = '' }) => { 
  const location = useLocation();
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const { user, logout } = useAuth();
  // Update local state when searchQuery prop changes
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearchQuery(value);
    // Only trigger search when user stops typing (debounce could be added here)
    if (location.pathname.includes('roomies')) {
      onSearch?.(value);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch?.(localSearchQuery);
  };

  return (
    <NavigationMenu.Root className="navbar">
      <div className="navbar-left">
        
        {/* --- INICIO DE LA MODIFICACIÓN --- */}
        <Link to="/" className="navbar-logo-link">
          <div className="navbar-logo">
            <img src={appLogo} alt="Logo de la aplicación" className="logo-image" />
          </div>
        </Link>
        {/* --- FIN DE LA MODIFICACIÓN --- */}

        <NavigationMenu.List className="navbar-links">
          <NavigationMenu.Item>
            <Link to="/" className={location.pathname === "/" ? "active" : ""}>
              <HomeIcon /> Propiedades
            </Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <Link
              to="/roomies"
              className={location.pathname === "/roomies" ? "active" : ""}
            >
              <AvatarIcon /> Roomies
            </Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <Link
              to="/publicar"
              className={location.pathname === "/publicar" ? "active" : ""}
            >
              <PlusCircledIcon /> Publicar
            </Link>
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </div>

      <div className="navbar-center">
        <form className="search-bar" onSubmit={handleSearchSubmit}>
          <button type="submit" className="search-button">
            <MagnifyingGlassIcon />
          </button>
          <input 
            type="text" 
            placeholder={location.pathname.includes('roomies') ? "Buscar roomies..." : "Buscar..."}
            value={localSearchQuery}
            onChange={handleSearchChange}
          />
        </form>
      </div>

      <div className="navbar-right">
        <button className="icon-button" onClick={toggleTheme}>
          <SunIcon />
        </button>
        <button className="icon-button">
          <ChatBubbleIcon />
        </button>
        <button className="icon-button">
          <BellIcon />
          <span className="notification-badge">3</span>
        </button>

        {/* --- INICIO DE LA MODIFICACIÓN --- */}
        {user ? (
          <div className="user-menu">
            {" "}
            {/* Contenedor para el menú */}
            <img
              src={user.picture}
              alt="Avatar de usuario"
              className="user-avatar"
            />
            <div className="dropdown-menu">
              {" "}
              {/* Menú desplegable */}
              <div className="dropdown-header">
                <strong>{user.name}</strong>
                <span>{user.email}</span>
              </div>
              <Link to="/perfil" className="dropdown-item">
                <AvatarIcon /> Mi Perfil
              </Link>
              <button onClick={logout} className="dropdown-item">
                Salir
              </button>
            </div>
          </div>
        ) : (
          <LoginButton />
        )}
      </div>
    </NavigationMenu.Root>
  );
};
