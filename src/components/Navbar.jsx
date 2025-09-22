import React, { useState, useEffect } from 'react';
import './Navbar.css';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const { user, logout } = useAuth();
  const [imageError, setImageError] = useState(false);

  // Update local state when searchQuery prop changes
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  // Reset image state when user changes
  useEffect(() => {
    setImageError(false);
  }, [user]);

  const handleImageLoad = () => {
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const getAvatarSrc = () => {
    if (imageError || !user?.picture) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random&size=40`;
    }
    return user.picture;
  };

  // Only show loading state when user exists but we haven't determined if image works
  const showLoadingState = user && !imageError && user.picture;

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch?.(localSearchQuery);
  };

  // Función para determinar si mostrar la barra de búsqueda
  const shouldShowSearch = () => {
    return location.pathname === '/' || location.pathname === '/roomies';
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

      {shouldShowSearch() && (
        <div className="navbar-center">
          <form className="search-bar" onSubmit={handleSearchSubmit}>
            <button type="submit" className="search-button">
              <MagnifyingGlassIcon />
            </button>
            <input 
              type="text" 
              placeholder={location.pathname.includes('roomies') ? "Buscar roomies..." : "Buscar propiedades..."}
              value={localSearchQuery}
              onChange={handleSearchChange}
            />
          </form>
        </div>
      )}

      <div className="navbar-right">
        <button className="icon-button" onClick={toggleTheme}>
          <SunIcon />
        </button>

        <button className="icon-button" onClick={() => navigate('/chat')}><ChatBubbleIcon /></button>

        <button className="icon-button">
          <BellIcon />
          <span className="notification-badge">3</span>
        </button>

        {/* --- INICIO DE LA MODIFICACIÓN --- */}
        {user ? (
          <div className="user-menu">
            <img
              src={getAvatarSrc()}
              alt="Avatar de usuario"
              className={`user-avatar ${showLoadingState ? 'loading' : ''}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
            <div className="dropdown-menu">
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
        {/* --- FIN DE LA MODIFICACIÓN --- */}
      </div>
    </NavigationMenu.Root>
  );
};
