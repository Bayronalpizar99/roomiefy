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
import { fetchNotifications } from '../services/api'; // 1. Importamos la nueva función

export const Navbar = ({ toggleTheme, onSearch, searchQuery = '', hasPublished }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // Estados existentes
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  // --- INICIO DE NUEVOS ESTADOS PARA NOTIFICACIONES ---
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  // --- FIN DE NUEVOS ESTADOS ---

  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
    setIsDropdownOpen(false);
  }, [user?.id]);
  
  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsDropdownOpen(prev => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const userMenu = document.querySelector('.user-menu');
      const mobileMenu = document.querySelector('.mobile-menu');
      const notificationsWrapper = document.querySelector('.notification-wrapper'); // Para cerrar notificaciones
      
      if (userMenu && !userMenu.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (mobileMenu && !mobileMenu.contains(event.target) && !event.target.closest('.mobile-menu-toggle')) {
        setIsMobileMenuOpen(false);
      }
      // Cerramos notificaciones si se hace clic fuera
      if (notificationsWrapper && !notificationsWrapper.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchVisible(false);
  }, [location.pathname]);

  const handleImageLoad = () => setImageLoaded(true);
  const handleImageError = () => setImageError(true);

  const getAvatarSrc = () => {
    if (!user) return null;
    if (imageError || !user.picture) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random&size=40`;
    }
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
  
  // --- NUEVA FUNCIÓN PARA MANEJAR NOTIFICACIONES ---
  const handleBellClick = async () => {
    if (showNotifications) {
      setShowNotifications(false);
      return;
    }
    setLoadingNotifications(true);
    setShowNotifications(true);
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const shouldShowSearch = () => location.pathname === '/' || location.pathname === '/roomies';
  const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);
  const toggleMobileSearch = () => setIsSearchVisible(prev => !prev);

  return (
    <NavigationMenu.Root className="navbar">
      <div className="navbar-left">
        <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <Cross1Icon /> : <HamburgerMenuIcon />}
        </button>
        <Link to="/" className="navbar-logo-link">
          <div className="navbar-logo">
            <img src={appLogo} alt="Logo de la aplicación" className="logo-image" />
          </div>
        </Link>
        <NavigationMenu.List className="navbar-links desktop-only">
          <NavigationMenu.Item>
            <Link to="/" className={location.pathname === "/" ? "active" : ""}>
              <HomeIcon /> Propiedades
            </Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <Link to="/roomies" className={location.pathname === "/roomies" ? "active" : ""}>
              <AvatarIcon /> Roomies
            </Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            {hasPublished ? (
              <Link to="/mis-propiedades" className={location.pathname === "/mis-propiedades" ? "active" : ""}>
                <PlusCircledIcon /> Mis propiedades
              </Link>
            ) : (
              <Link to="/publicar" className={location.pathname === "/publicar" ? "active" : ""}>
                <PlusCircledIcon /> Publicar
              </Link>
            )}
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </div>

      {shouldShowSearch() && (
        <div className="navbar-center desktop-only">
          <form className="search-bar" onSubmit={handleSearchSubmit}>
            <button type="submit" className="search-button"><MagnifyingGlassIcon /></button>
            <input type="text" placeholder={location.pathname.includes('roomies') ? "Buscar roomies..." : "Buscar propiedades..."} value={localSearchQuery} onChange={handleSearchChange}/>
          </form>
        </div>
      )}

      <div className="navbar-right">
        {shouldShowSearch() && ( <button className="icon-button mobile-search-toggle mobile-only" onClick={toggleMobileSearch} aria-label="Buscar"><MagnifyingGlassIcon /></button> )}
        <button className="icon-button" onClick={toggleTheme}><SunIcon /></button>
        <button className="icon-button desktop-only" onClick={() => navigate('/chat')}><ChatBubbleIcon /></button>

        {/* --- INICIO DE MODIFICACIONES EN LA CAMPANA --- */}
        <div className="notification-wrapper">
          <button className="icon-button desktop-only" onClick={handleBellClick}>
            <BellIcon />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>
          
          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notifications-header">
                <h3>Notificaciones</h3>
                <button onClick={() => alert("Funcionalidad 'Marcar como leído' próximamente")}>Marcar todo como leído</button>
              </div>
              <div className="notifications-list">
                {loadingNotifications ? (
                  <div className="notification-item loading">Cargando...</div>
                ) : notifications.length === 0 ? (
                  <div className="notification-item">No tienes notificaciones.</div>
                ) : (
                  notifications.map(notif => (
                    <div key={notif.id} className={`notification-item ${!notif.read ? 'unread' : ''}`} onClick={() => { setShowNotifications(false); navigate(notif.link); }}>
                      <p>{notif.text}</p>
                      <span className="time">{notif.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        {/* --- FIN DE MODIFICACIONES EN LA CAMPANA --- */}

        {user ? (
          <div className="user-menu">
            <div className={`user-avatar-container ${isDropdownOpen ? 'active' : ''}`} onClick={toggleDropdown} aria-expanded={isDropdownOpen} aria-haspopup="true" aria-label="Menú de usuario" style={{ cursor: 'pointer' }}>
              {avatarSrc && <img key={user.id || 'user-avatar'} src={avatarSrc} alt="User profile" className="user-avatar" onLoad={handleImageLoad} onError={handleImageError} style={{ opacity: imageLoaded ? 1 : 0, transition: 'opacity 0.2s ease-in-out' }} />}
              {!imageLoaded && !imageError && ( <div className="avatar-placeholder" /> )}
            </div>
            {isDropdownOpen && (
              <div className="user-dropdown open" role="menu">
                <button onClick={(e) => { e.stopPropagation(); setIsDropdownOpen(false); navigate('/perfil'); }} className="dropdown-item" role="menuitem">Mi perfil</button>
                <button onClick={(e) => { e.stopPropagation(); setIsDropdownOpen(false); logout(); }} className="dropdown-item" role="menuitem">Cerrar sesión</button>
              </div>
            )}
          </div>
        ) : <LoginButton />}
      </div>

      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-content">
            <NavigationMenu.List className="mobile-nav-links">
              <NavigationMenu.Item><Link to="/" className={location.pathname === "/" ? "active" : ""}> <HomeIcon /> Propiedades</Link></NavigationMenu.Item>
              <NavigationMenu.Item><Link to="/roomies" className={location.pathname === "/roomies" ? "active" : ""}><AvatarIcon /> Roomies</Link></NavigationMenu.Item>
              <NavigationMenu.Item>
                {hasPublished ? (<Link to="/mis-propiedades" className={location.pathname === "/mis-propiedades" ? "active" : ""}><PlusCircledIcon /> Mis propiedades</Link>) : (<Link to="/publicar" className={location.pathname === "/publicar" ? "active" : ""}><PlusCircledIcon /> Publicar</Link>)}
              </NavigationMenu.Item>
            </NavigationMenu.List>
            <div className="mobile-actions">
              <button className="mobile-action-button" onClick={() => navigate('/chat')}><ChatBubbleIcon /> Chat</button>
              <button className="mobile-action-button"><BellIcon /> Notificaciones<span className="notification-badge">3</span></button>
            </div>
          </div>
        </div>
      )}

      {isSearchVisible && shouldShowSearch() && (
        <div className="mobile-search">
          <form className="mobile-search-bar" onSubmit={handleSearchSubmit}>
            <button type="submit" className="search-button"><MagnifyingGlassIcon /></button>
            <input type="text" placeholder={location.pathname.includes('roomies') ? "Buscar roomies..." : "Buscar propiedades..."} value={localSearchQuery} onChange={handleSearchChange} autoFocus/>
            <button type="button" className="close-search-button" onClick={() => setIsSearchVisible(false)}><Cross1Icon /></button>
          </form>
        </div>
      )}
    </NavigationMenu.Root>
  );
};