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
  HamburgerMenuIcon,
  Cross1Icon,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

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

  // Cerrar los menús al hacer clic fuera de ellos
  useEffect(() => {
    const handleClickOutside = (event) => {
      const userMenu = document.querySelector('.user-menu');
      const mobileMenu = document.querySelector('.mobile-menu');
      
      if (userMenu && !userMenu.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      
      if (mobileMenu && !mobileMenu.contains(event.target) && !event.target.closest('.mobile-menu-toggle')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchVisible(false);
  }, [location.pathname]);

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

  // Función para alternar el menú móvil
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
    setIsSearchVisible(false);
  };

  // Función para alternar la búsqueda móvil
  const toggleMobileSearch = () => {
    setIsSearchVisible(prev => !prev);
    setIsMobileMenuOpen(false);
  };


  return (
    <NavigationMenu.Root className="navbar">
      <div className="navbar-left">
        {/* Botón de menú hamburguesa (solo móvil) */}
        <button 
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-label="Abrir menú de navegación"
        >
          {isMobileMenuOpen ? <Cross1Icon /> : <HamburgerMenuIcon />}
        </button>

        {/* Logo */}
        <Link to="/" className="navbar-logo-link">
          <div className="navbar-logo">
            <img src={appLogo} alt="Logo de la aplicación" className="logo-image" />
          </div>
        </Link>

        {/* Enlaces de navegación (desktop) */}
        <NavigationMenu.List className="navbar-links desktop-only">
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

      {/* Barra de búsqueda (desktop) */}
      {shouldShowSearch() && (
        <div className="navbar-center desktop-only">
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
        {/* Botón de búsqueda móvil */}
        {shouldShowSearch() && (
          <button 
            className="icon-button mobile-search-toggle mobile-only"
            onClick={toggleMobileSearch}
            aria-label="Buscar"
          >
            <MagnifyingGlassIcon />
          </button>
        )}

        {/* Botones de acción (siempre visibles) */}
        <button className="icon-button" onClick={toggleTheme}>
          <SunIcon />
        </button>

        <button className="icon-button desktop-only" onClick={() => navigate('/chat')}>
          <ChatBubbleIcon />
        </button>

        <button className="icon-button desktop-only">
          <BellIcon />
          <span className="notification-badge">3</span>
        </button>

        {/* Menú de usuario */}
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
      </div>

      {/* Menú móvil */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-content">
            <NavigationMenu.List className="mobile-nav-links">
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
            
            {/* Botones de acción en móvil */}
            <div className="mobile-actions">
              <button className="mobile-action-button" onClick={() => navigate('/chat')}>
                <ChatBubbleIcon /> Chat
              </button>
              <button className="mobile-action-button">
                <BellIcon /> Notificaciones
                <span className="notification-badge">3</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barra de búsqueda móvil */}
      {isSearchVisible && shouldShowSearch() && (
        <div className="mobile-search">
          <form className="mobile-search-bar" onSubmit={handleSearchSubmit}>
            <button type="submit" className="search-button">
              <MagnifyingGlassIcon />
            </button>
            <input 
              type="text" 
              placeholder={location.pathname.includes('roomies') ? "Buscar roomies..." : "Buscar propiedades..."}
              value={localSearchQuery}
              onChange={handleSearchChange}
              autoFocus
            />
            <button 
              type="button" 
              className="close-search-button"
              onClick={() => setIsSearchVisible(false)}
            >
              <Cross1Icon />
            </button>
          </form>
        </div>
      )}
    </NavigationMenu.Root>
  );
};
