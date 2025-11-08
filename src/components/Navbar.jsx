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
  PersonIcon,
  PlusCircledIcon,
  HamburgerMenuIcon,
  Cross1Icon,
} from "@radix-ui/react-icons";

import appLogo from "../assets/roomify2.png";
import { useAuth } from "../context/AuthContext";
import { fetchNotifications } from '../services/api';
import { getNotifications, getUnreadNotificationCount, markNotificationAsRead, markAllNotificationsAsRead } from '../services/notifications';

export const Navbar = ({ toggleTheme, onSearch, searchQuery = '', hasPublished }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, requireLogin } = useAuth();

  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const mapNotificationToNavbarFormat = (notif) => {
    let link = '/';
    if (notif.type === 'PROPERTY_FAVORITED' && notif.data?.propertyId) {
      link = `/propiedad/${notif.data.propertyId}`;
    }

    const formatTime = (createdAt) => {
      if (!createdAt) return 'hace un momento';
      const date = new Date(createdAt);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'hace un momento';
      if (diffMins < 60) return `hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
      if (diffHours < 24) return `hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
      if (diffDays < 7) return `hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    };

    return {
      id: notif._id || notif.id,
      text: notif.message || notif.title,
      time: formatTime(notif.createdAt),
      read: notif.read || false,
      link: link,
      rawNotification: notif 
    };
  };

  useEffect(() => {
    const loadInitialNotifications = async () => {
      if (user) {
        try {
          const userId = user.email || user.id || user.sub;
          if (userId) {
            console.log('🔔 Cargando notificaciones del microservicio para:', userId);
            const result = await getNotifications(userId, { limit: 20 });
            console.log('📥 Resultado del microservicio:', result);

            if (result.success !== false) {
              const notificationsData = result.data || [];
              const mappedNotifications = notificationsData.map(mapNotificationToNavbarFormat);
              console.log('✅ Notificaciones mapeadas:', mappedNotifications.length);
              setNotifications(mappedNotifications);
              return; 
            }
          }

         
          console.warn('⚠️ Usando fallback a API antigua (no debería pasar si el microservicio está disponible)');
          const data = await fetchNotifications();
          setNotifications(data);
        } catch (error) {
          console.error("❌ Error al cargar notificaciones iniciales:", error);
          
          if (error.message?.includes('microservicio') || error.message?.includes('localhost:3001')) {
            console.log('📭 Microservicio no disponible, mostrando array vacío');
            setNotifications([]);
          } else {
            try {
              const data = await fetchNotifications();
              setNotifications(data);
            } catch (fallbackError) {
              console.error("Error en fallback de notificaciones:", fallbackError);
              setNotifications([]);
            }
          }
        }
      } else {
        setNotifications([]);
        setShowNotifications(false);
      }
    };

    loadInitialNotifications();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const userId = user.email || user.id || user.sub;
    if (!userId) return;

    const updateNotifications = async () => {
      try {
        const result = await getNotifications(userId, { limit: 20 });
        if (result.success !== false) {
          const notificationsData = result.data || [];
          const mappedNotifications = notificationsData.map(mapNotificationToNavbarFormat);
          setNotifications(mappedNotifications);
        }
        
      } catch (error) {
        console.error("Error al actualizar notificaciones:", error);
      }
    };
    updateNotifications();
    const interval = setInterval(updateNotifications, 30000); 
    return () => clearInterval(interval);
  }, [user]);

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
      const notificationsWrapper = document.querySelector('.notification-wrapper');

      if (userMenu && !userMenu.contains(event.target)) setIsDropdownOpen(false);
      if (mobileMenu && !mobileMenu.contains(event.target) && !event.target.closest('.mobile-menu-toggle')) setIsMobileMenuOpen(false);
      if (notificationsWrapper && !notificationsWrapper.contains(event.target)) setShowNotifications(false);
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
    setLocalSearchQuery(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch?.(localSearchQuery);
  };

  const handlePublishClick = (event) => {
    if (!user) {
      event.preventDefault();
      requireLogin("Debes iniciar sesión para publicar una propiedad.");
    }
  };

  const handleBellClick = async () => {
    if (showNotifications) {
      setShowNotifications(false);
      return;
    }

    if (!user) {
      requireLogin("Inicia sesión para ver tus notificaciones.");
      return;
    }

    setLoadingNotifications(true);
    setShowNotifications(true);

    try {
      const userId = user.email || user.id || user.sub;
      if (userId) {
        // Intentar cargar del microservicio
        const result = await getNotifications(userId, { limit: 50 });
        console.log('🔔 Resultado al hacer clic en campana:', result);

        // Si el microservicio responde exitosamente (incluso con array vacío), usar esos datos
        if (result.success !== false) {
          const notificationsData = result.data || [];
          const mappedNotifications = notificationsData.map(mapNotificationToNavbarFormat);
          console.log('✅ Notificaciones cargadas:', mappedNotifications.length);
          setNotifications(mappedNotifications);
        } else {
          // Solo si el microservicio falló explícitamente
          console.warn('⚠️ Microservicio falló, usando array vacío');
          setNotifications([]);
        }
      } else {
        // Si no hay userId, mostrar array vacío (no usar API antigua con datos mockeados)
        console.warn('⚠️ No hay userId, mostrando array vacío');
        setNotifications([]);
      }
    } catch (error) {
      console.error("❌ Error al cargar notificaciones:", error);
      // No hacer fallback, mostrar array vacío para evitar datos mockeados
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;

    try {
      const userId = user.email || user.id || user.sub;
      if (userId) {
        const result = await markAllNotificationsAsRead(userId);
        if (result.success) {
          // Actualizar estado local
          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        }
      }
    } catch (error) {
      console.error("Error al marcar todas como leídas:", error);
      alert("Error al marcar como leídas. Por favor, intenta de nuevo.");
    }
  };

  const handleNotificationClick = async (notification) => {
    setShowNotifications(false);

    // Si la notificación tiene rawNotification, marcarla como leída
    if (notification.rawNotification && !notification.read) {
      try {
        const userId = user?.email || user?.id || user?.sub;
        if (userId && notification.id) {
          await markNotificationAsRead(notification.id, userId);
          // Actualizar estado local
          setNotifications(prev =>
            prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
          );
        }
      } catch (error) {
        console.error("Error al marcar notificación como leída:", error);
      }
    }

    navigate(notification.link);
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const shouldShowSearch = () => location.pathname === '/' || location.pathname === '/roomies';
  const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);
  const toggleMobileSearch = () => setIsSearchVisible(prev => !prev);

  return (
    <NavigationMenu.Root className="navbar">
      <div className="navbar-left">
        <button className="mobile-menu-toggle" onClick={toggleMobileMenu} aria-label="Abrir menú de navegación">
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
              <Link to="/mis-propiedades" onClick={handlePublishClick} className={location.pathname === "/mis-propiedades" ? "active" : ""}>
                <PlusCircledIcon /> Mis propiedades
              </Link>
            ) : (
              <Link to="/publicar" onClick={handlePublishClick} className={location.pathname === "/publicar" ? "active" : ""}>
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
            <input type="text" placeholder={location.pathname.includes('roomies') ? "Buscar roomies..." : "Buscar propiedades..."} value={localSearchQuery} onChange={handleSearchChange} />
          </form>
        </div>
      )}

      <div className="navbar-right">
        {shouldShowSearch() && (<button className="icon-button mobile-search-toggle mobile-only" onClick={toggleMobileSearch} aria-label="Buscar"><MagnifyingGlassIcon /></button>)}
        <button className="icon-button" onClick={toggleTheme}><SunIcon /></button>

        {/* --- INICIO DE LA MODIFICACIÓN (VISTA ESCRITORIO) --- */}
        {/* Solo muestra los siguientes botones si hay un usuario logueado */}
        {user && (
          <>
            <button className="icon-button desktop-only" onClick={() => navigate('/chat')}><ChatBubbleIcon /></button>
            <div className="notification-wrapper">
              <button className="icon-button desktop-only" onClick={handleBellClick}>
                <BellIcon />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </button>
              {showNotifications && (
                <div className="notifications-dropdown">
                  <div className="notifications-header">
                    <h3>Notificaciones</h3>
                    {notifications.some(n => !n.read) && (
                      <button onClick={handleMarkAllAsRead}>Marcar todo como leído</button>
                    )}
                  </div>
                  <div className="notifications-list">
                    {loadingNotifications ? (
                      <div className="notification-item loading">Cargando...</div>
                    ) : notifications.length === 0 ? (
                      <div className="notification-item">No tienes notificaciones.</div>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          className={`notification-item ${!notif.read ? 'unread' : ''}`}
                          onClick={() => handleNotificationClick(notif)}
                        >
                          <p>{notif.text}</p>
                          <span className="time">{notif.time}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
        {/* --- FIN DE LA MODIFICACIÓN --- */}

        {user ? (
          <div className="user-menu">
            <div className={`user-avatar-container ${isDropdownOpen ? 'active' : ''}`} onClick={toggleDropdown} aria-expanded={isDropdownOpen} aria-haspopup="true" aria-label="Menú de usuario" style={{ cursor: 'pointer' }}>
              {avatarSrc && <img key={user.id || 'user-avatar'} src={avatarSrc} alt="User profile" className="user-avatar" onLoad={handleImageLoad} onError={handleImageError} style={{ opacity: imageLoaded ? 1 : 0 }} />}
              {!imageLoaded && !imageError && (<div className="avatar-placeholder" />)}
            </div>
            {isDropdownOpen && (
              <div className="user-dropdown open" role="menu">
                <button onClick={(e) => { e.stopPropagation(); setIsDropdownOpen(false); navigate('/perfil'); }} className="dropdown-item" role="menuitem">Mi perfil</button>
                <button onClick={(e) => { e.stopPropagation(); setIsDropdownOpen(false); navigate('/favoritos'); }} className="dropdown-item" role="menuitem">Mis Favoritos</button>
                <button onClick={(e) => { e.stopPropagation(); setIsDropdownOpen(false); logout(); }} className="dropdown-item" role="menuitem">Cerrar sesión</button>
              </div>
            )}
          </div>
        ) : (
          <button
            className="icon-button"
            onClick={() => requireLogin("Inicia sesión para acceder a tu perfil y publicar.")}
            aria-label="Iniciar sesión"
          >
            <PersonIcon />
          </button>
        )}
      </div>

      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-content">
            <NavigationMenu.List className="mobile-nav-links">
              <NavigationMenu.Item><Link to="/" className={location.pathname === "/" ? "active" : ""}> <HomeIcon /> Propiedades</Link></NavigationMenu.Item>
              <NavigationMenu.Item><Link to="/roomies" className={location.pathname === "/roomies" ? "active" : ""}><AvatarIcon /> Roomies</Link></NavigationMenu.Item>
              <NavigationMenu.Item>
                {hasPublished ? (<Link to="/mis-propiedades" onClick={handlePublishClick} className={location.pathname === "/mis-propiedades" ? "active" : ""}><PlusCircledIcon /> Mis propiedades</Link>) : (<Link to="/publicar" onClick={handlePublishClick} className={location.pathname === "/publicar" ? "active" : ""}><PlusCircledIcon /> Publicar</Link>)}
              </NavigationMenu.Item>
            </NavigationMenu.List>

            {/* --- INICIO DE LA MODIFICACIÓN (VISTA MÓVIL) --- */}
            {/* Muestra estas acciones solo si el usuario está logueado */}
            {user && (
              <div className="mobile-actions">
                <button className="mobile-action-button" onClick={() => navigate('/chat')}><ChatBubbleIcon /> Chat</button>
                <button className="mobile-action-button" onClick={handleBellClick}>
                  <BellIcon /> Notificaciones
                  {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                </button>
              </div>
            )}
            {/* --- FIN DE LA MODIFICACIÓN --- */}

          </div>
        </div>
      )}

      {isSearchVisible && shouldShowSearch() && (
        <div className="mobile-search">
          <form className="mobile-search-bar" onSubmit={handleSearchSubmit}>
            <button type="submit" className="search-button"><MagnifyingGlassIcon /></button>
            <input type="text" placeholder={location.pathname.includes('roomies') ? "Buscar roomies..." : "Buscar propiedades..."} value={localSearchQuery} onChange={handleSearchChange} autoFocus />
            <button type="button" className="close-search-button" onClick={() => setIsSearchVisible(false)}><Cross1Icon /></button>
          </form>
        </div>
      )}
    </NavigationMenu.Root>
  );
};