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
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Update local state when searchQuery prop changes
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  // Reset image states when user changes
  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
    setIsDropdownOpen(false);
  }, [user?.id]); // Usamos user?.id para que solo se reinicie cuando cambie el usuario
  
  // Función para alternar el menú desplegable
  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsDropdownOpen(prev => !prev);
  };

  // Cerrar el menú al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      const userMenu = document.querySelector('.user-menu');
      if (userMenu && !userMenu.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleImageLoad = () => {
    setImageError(false);
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const getAvatarSrc = () => {
    // Si no hay usuario, retornar null para no mostrar ninguna imagen
    if (!user) return null;
    
    // Si hay un error o no hay imagen de perfil, usar el avatar por defecto
    if (imageError || !user.picture) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random&size=40`;
    }
    
    // Devolver la imagen de perfil
    return user.picture;
  };

  const avatarSrc = getAvatarSrc();

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
            <div 
              className={`user-avatar-container ${isDropdownOpen ? 'active' : ''}`}
              onClick={toggleDropdown}
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
              aria-label="Menú de usuario"
              style={{ cursor: 'pointer' }}
            >
              {avatarSrc && (
                <img
                  key={user.id || 'user-avatar'}
                  src={avatarSrc}
                  alt="User profile"
                  className="user-avatar"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  style={{
                    opacity: imageLoaded ? 1 : 0,
                    transition: 'opacity 0.2s ease-in-out'
                  }}
                />
              )}
              {!imageLoaded && !imageError && (
                <div className="avatar-placeholder" />
              )}
            </div>
            
            {isDropdownOpen && (
              <div 
                className="user-dropdown open"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu-button"
              >
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDropdownOpen(false);
                    navigate('/perfil');
                  }} 
                  className="dropdown-item"
                  role="menuitem"
                >
                 Mi perfil
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDropdownOpen(false);
                    logout();
                  }} 
                  className="dropdown-item"
                  role="menuitem"
                >
                 Cerrar sesión
                </button>
              </div>
            )}
          </div>
        ) : (
          <LoginButton />
        )}
        {/* --- FIN DE LA MODIFICACIÓN --- */}
      </div>
    </NavigationMenu.Root>
  );
};
