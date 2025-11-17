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
  const [unreadCountFromAPI, setUnreadCountFromAPI] = useState(0);

  const mapNotificationToNavbarFormat = (notif) => {
    let link = '/';
    
    // Intentar construir el link desde diferentes fuentes
    if (notif.type === 'PROPERTY_FAVORITED') {
      // Prioridad 1: notif.data.propertyId
      if (notif.data?.propertyId) {
        link = `/propiedad/${notif.data.propertyId}`;
      }
      // Prioridad 2: Buscar en otros lugares
      else if (notif.propertyId) {
        link = `/propiedad/${notif.propertyId}`;
      }
    }
    
    // Log para debugging
    if (link === '/') {
      console.warn('⚠️ [mapNotificationToNavbarFormat] No se pudo construir link para notificación:', {
        type: notif.type,
        hasData: !!notif.data,
        dataPropertyId: notif.data?.propertyId,
        propertyId: notif.propertyId,
        fullNotif: notif
      });
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
          // Intentar con email primero, luego con ID
          const userIds = [
            user.email,
            user.id,
            user.sub
          ].filter(Boolean); // Filtrar valores undefined/null

          console.log('🔔 Cargando notificaciones del microservicio para userIds:', userIds);
          console.log('🔍 Debug - user object completo:', user);
          
          // Intentar obtener notificaciones con cada identificador posible
          let allNotifications = [];
          for (const userId of userIds) {
            if (!userId) continue;
            
            try {
              // Solo cargar notificaciones no leídas
              const result = await getNotifications(userId, { limit: 20, read: false });
              console.log(`📥 Resultado para userId "${userId}":`, result);
              
              if (result.success !== false && result.data) {
                // Combinar notificaciones, evitando duplicados
                const newNotifications = result.data.filter(
                  n => !allNotifications.some(existing => 
                    String(existing._id || existing.id) === String(n._id || n.id)
                  )
                );
                allNotifications = [...allNotifications, ...newNotifications];
              }
            } catch (err) {
              console.warn(`⚠️ Error al obtener notificaciones para userId "${userId}":`, err);
            }
          }

          console.log('📊 Total de notificaciones encontradas (combinadas):', allNotifications.length);

          if (allNotifications.length > 0 || userIds.length > 0) {
            // Ordenar por fecha más reciente
            allNotifications.sort((a, b) => {
              const dateA = new Date(a.createdAt || a.created_at || 0);
              const dateB = new Date(b.createdAt || b.created_at || 0);
              return dateB - dateA;
            });
            
            const mappedNotifications = allNotifications.map(mapNotificationToNavbarFormat);
            console.log('✅ Notificaciones mapeadas:', mappedNotifications.length);
            setNotifications(mappedNotifications);
            return; 
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
        // Intentar con email primero, luego con ID
        const userIds = [
          user.email,
          user.id,
          user.sub
        ].filter(Boolean);

        let allNotifications = [];
        for (const uid of userIds) {
          if (!uid) continue;
          
          try {
            // Solo cargar notificaciones no leídas
            const result = await getNotifications(uid, { limit: 20, read: false });
            if (result.success !== false && result.data) {
              // Combinar notificaciones, evitando duplicados
              const newNotifications = result.data.filter(
                n => !allNotifications.some(existing => 
                  String(existing._id || existing.id) === String(n._id || n.id)
                )
              );
              allNotifications = [...allNotifications, ...newNotifications];
            }
          } catch (err) {
            console.warn(`⚠️ Error al actualizar notificaciones para userId "${uid}":`, err);
          }
        }

        // Ordenar por fecha más reciente
        allNotifications.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.created_at || 0);
          const dateB = new Date(b.createdAt || b.created_at || 0);
          return dateB - dateA;
        });

        const mappedNotifications = allNotifications.map(mapNotificationToNavbarFormat);
        setNotifications(mappedNotifications);
        
      } catch (error) {
        console.error("Error al actualizar notificaciones:", error);
      }
    };

    const updateUnreadCount = async () => {
      try {
        // Intentar con email primero, luego con ID
        const userIds = [
          user.email,
          user.id,
          user.sub
        ].filter(Boolean);

        let totalCount = 0;
        for (const uid of userIds) {
          if (!uid) continue;
          
          try {
            const result = await getUnreadNotificationCount(uid);
            if (result.success) {
              totalCount = Math.max(totalCount, result.count || 0);
            }
          } catch (err) {
            console.warn(`⚠️ Error al obtener conteo para userId "${uid}":`, err);
          }
        }

        setUnreadCountFromAPI(totalCount);
      } catch (error) {
        console.error("Error al actualizar conteo de no leídas:", error);
      }
    };

    updateNotifications();
    updateUnreadCount();
    const interval = setInterval(() => {
      updateNotifications();
      updateUnreadCount();
    }, 30000); 
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
      // Intentar con email primero, luego con ID
      const userIds = [
        user.email,
        user.id,
        user.sub
      ].filter(Boolean);

      if (userIds.length > 0) {
        // Intentar cargar del microservicio con todos los identificadores posibles
        let allNotifications = [];
        for (const uid of userIds) {
          try {
            // Solo cargar notificaciones no leídas
            const result = await getNotifications(uid, { limit: 50, read: false });
            console.log(`🔔 Resultado para userId "${uid}":`, result);

            if (result.success !== false && result.data) {
              // Combinar notificaciones, evitando duplicados
              const newNotifications = result.data.filter(
                n => !allNotifications.some(existing => 
                  String(existing._id || existing.id) === String(n._id || n.id)
                )
              );
              allNotifications = [...allNotifications, ...newNotifications];
            }
          } catch (err) {
            console.warn(`⚠️ Error al obtener notificaciones para userId "${uid}":`, err);
          }
        }

        // Ordenar por fecha más reciente
        allNotifications.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.created_at || 0);
          const dateB = new Date(b.createdAt || b.created_at || 0);
          return dateB - dateA;
        });

        const mappedNotifications = allNotifications.map(mapNotificationToNavbarFormat);
        console.log('✅ Notificaciones cargadas (combinadas):', mappedNotifications.length);
        setNotifications(mappedNotifications);
      } else {
        // Si no hay userId, mostrar array vacío
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
        // Eliminar todas las notificaciones de la lista inmediatamente (optimistic update)
        setNotifications([]);
        setUnreadCountFromAPI(0);
        
        const result = await markAllNotificationsAsRead(userId);
        if (result.success) {
          console.log('✅ Todas las notificaciones marcadas como leídas en el backend');
          // Recargar notificaciones no leídas (debería estar vacío ahora)
          const userIds = [user.email, user.id, user.sub].filter(Boolean);
          Promise.all(userIds.map(uid => getNotifications(uid, { limit: 20, read: false })))
            .then(results => {
              let allNotifications = [];
              results.forEach(result => {
                if (result.success && result.data) {
                  allNotifications = [...allNotifications, ...result.data];
                }
              });
              // Eliminar duplicados
              const uniqueNotifications = allNotifications.filter((n, index, self) =>
                index === self.findIndex(t => (t._id || t.id) === (n._id || n.id))
              );
              // Ordenar por fecha
              uniqueNotifications.sort((a, b) => {
                const dateA = new Date(a.createdAt || a.created_at || 0);
                const dateB = new Date(b.createdAt || b.created_at || 0);
                return dateB - dateA;
              });
              const mappedNotifications = uniqueNotifications.map(mapNotificationToNavbarFormat);
              setNotifications(mappedNotifications);
              
              // Actualizar conteo
              Promise.all(userIds.map(uid => getUnreadNotificationCount(uid)))
                .then(countResults => {
                  const maxCount = Math.max(...countResults.map(r => r.count || 0), 0);
                  setUnreadCountFromAPI(maxCount);
                })
                .catch(err => console.error('Error al actualizar conteo:', err));
            })
            .catch(err => console.error('Error al recargar notificaciones:', err));
        } else {
          // Si falla, recargar notificaciones
          const userIds = [user.email, user.id, user.sub].filter(Boolean);
          Promise.all(userIds.map(uid => getNotifications(uid, { limit: 20, read: false })))
            .then(results => {
              let allNotifications = [];
              results.forEach(result => {
                if (result.success && result.data) {
                  allNotifications = [...allNotifications, ...result.data];
                }
              });
              const uniqueNotifications = allNotifications.filter((n, index, self) =>
                index === self.findIndex(t => (t._id || t.id) === (n._id || n.id))
              );
              uniqueNotifications.sort((a, b) => {
                const dateA = new Date(a.createdAt || a.created_at || 0);
                const dateB = new Date(b.createdAt || b.created_at || 0);
                return dateB - dateA;
              });
              const mappedNotifications = uniqueNotifications.map(mapNotificationToNavbarFormat);
              setNotifications(mappedNotifications);
            })
            .catch(err => console.error('Error al recargar notificaciones:', err));
        }
      }
    } catch (error) {
      console.error("Error al marcar todas como leídas:", error);
      alert("Error al marcar como leídas. Por favor, intenta de nuevo.");
      // Recargar notificaciones en caso de error
      const userIds = [user.email, user.id, user.sub].filter(Boolean);
      Promise.all(userIds.map(uid => getNotifications(uid, { limit: 20, read: false })))
        .then(results => {
          let allNotifications = [];
          results.forEach(result => {
            if (result.success && result.data) {
              allNotifications = [...allNotifications, ...result.data];
            }
          });
          const uniqueNotifications = allNotifications.filter((n, index, self) =>
            index === self.findIndex(t => (t._id || t.id) === (n._id || n.id))
          );
          uniqueNotifications.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.created_at || 0);
            const dateB = new Date(b.createdAt || b.created_at || 0);
            return dateB - dateA;
          });
          const mappedNotifications = uniqueNotifications.map(mapNotificationToNavbarFormat);
          setNotifications(mappedNotifications);
        })
        .catch(err => console.error('Error al recargar notificaciones:', err));
    }
  };

  const handleNotificationClick = (notification, event) => {
    // Prevenir propagación del evento
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    console.log('🔔 [handleNotificationClick] Notificación clickeada:', notification);
    
    // Cerrar el dropdown primero
    setShowNotifications(false);

    // Obtener datos necesarios
    const notificationId = notification.id || notification.rawNotification?._id || notification.rawNotification?.id;
    const userId = user?.email || user?.id || user?.sub;
    
    console.log('🔍 [handleNotificationClick] notificationId:', notificationId);
    console.log('🔍 [handleNotificationClick] userId:', userId);
    console.log('🔍 [handleNotificationClick] notification.link:', notification.link);
    console.log('🔍 [handleNotificationClick] rawNotification:', notification.rawNotification);

    // Determinar la ruta de navegación
    let navigationPath = '/';
    
    // Prioridad 1: Usar el link ya construido
    if (notification.link && notification.link !== '/') {
      navigationPath = notification.link;
      console.log('✅ [handleNotificationClick] Usando notification.link:', navigationPath);
    } 
    // Prioridad 2: Construir desde rawNotification.data.propertyId
    else if (notification.rawNotification?.data?.propertyId) {
      navigationPath = `/propiedad/${notification.rawNotification.data.propertyId}`;
      console.log('✅ [handleNotificationClick] Construido desde rawNotification.data.propertyId:', navigationPath);
    }
    // Prioridad 3: Intentar desde notification.rawNotification directamente (por si data no existe)
    else if (notification.rawNotification?.propertyId) {
      navigationPath = `/propiedad/${notification.rawNotification.propertyId}`;
      console.log('✅ [handleNotificationClick] Construido desde rawNotification.propertyId:', navigationPath);
    }
    else {
      console.warn('⚠️ [handleNotificationClick] No se pudo determinar el link de la notificación:', {
        link: notification.link,
        hasRawNotification: !!notification.rawNotification,
        rawNotificationData: notification.rawNotification?.data,
        rawNotificationPropertyId: notification.rawNotification?.propertyId,
        fullNotification: notification
      });
    }
    
    console.log('🧭 [handleNotificationClick] Navegando a:', navigationPath);
    
    // Navegar inmediatamente (síncrono)
    try {
      navigate(navigationPath);
      console.log('✅ [handleNotificationClick] Navegación ejecutada');
    } catch (error) {
      console.error('❌ [handleNotificationClick] Error al navegar:', error);
    }

    // Marcar como leída en segundo plano
    if (notificationId && userId) {
      console.log('📝 [handleNotificationClick] Marcando como leída...');
      
      // Eliminar la notificación de la lista inmediatamente (optimistic update)
      setNotifications(prev => {
        const filtered = prev.filter(n => n.id !== notificationId);
        console.log('🗑️ [handleNotificationClick] Notificación eliminada de la lista. Restantes:', filtered.length);
        return filtered;
      });
      
      // Actualizar conteo local
      if (unreadCountFromAPI > 0) {
        setUnreadCountFromAPI(prev => {
          const newCount = Math.max(0, prev - 1);
          console.log('📊 [handleNotificationClick] Conteo actualizado:', newCount);
          return newCount;
        });
      }

      // Marcar como leída en el backend (no bloquea la navegación)
      markNotificationAsRead(notificationId, userId)
        .then(result => {
          console.log('📥 [handleNotificationClick] Resultado de markNotificationAsRead:', result);
          if (result.success) {
            console.log('✅ [handleNotificationClick] Notificación marcada como leída en el backend');
            
            // Actualizar conteo de no leídas
            const userIds = [user.email, user.id, user.sub].filter(Boolean);
            Promise.all(userIds.map(uid => getUnreadNotificationCount(uid)))
              .then(countResults => {
                const maxCount = Math.max(...countResults.map(r => r.count || 0), 0);
                console.log('📊 [handleNotificationClick] Conteo actualizado desde API:', maxCount);
                setUnreadCountFromAPI(maxCount);
              })
              .catch(err => console.error('❌ [handleNotificationClick] Error al actualizar conteo:', err));
            
            // Recargar solo notificaciones no leídas para sincronizar con el backend
            Promise.all(userIds.map(uid => getNotifications(uid, { limit: 20, read: false })))
              .then(results => {
                let allNotifications = [];
                results.forEach(result => {
                  if (result.success && result.data) {
                    allNotifications = [...allNotifications, ...result.data];
                  }
                });
                // Eliminar duplicados
                const uniqueNotifications = allNotifications.filter((n, index, self) =>
                  index === self.findIndex(t => (t._id || t.id) === (n._id || n.id))
                );
                // Ordenar por fecha
                uniqueNotifications.sort((a, b) => {
                  const dateA = new Date(a.createdAt || a.created_at || 0);
                  const dateB = new Date(b.createdAt || b.created_at || 0);
                  return dateB - dateA;
                });
                const mappedNotifications = uniqueNotifications.map(mapNotificationToNavbarFormat);
                console.log('🔄 [handleNotificationClick] Notificaciones recargadas:', mappedNotifications.length);
                setNotifications(mappedNotifications);
              })
              .catch(err => console.error('❌ [handleNotificationClick] Error al recargar notificaciones:', err));
          } else {
            console.error('❌ [handleNotificationClick] Error al marcar notificación como leída:', result.error);
            // Revertir el cambio optimista si falla - volver a agregar la notificación
            setNotifications(prev => {
              // Verificar que no esté ya en la lista
              const exists = prev.some(n => n.id === notificationId);
              if (!exists) {
                console.log('↩️ [handleNotificationClick] Revirtiendo cambio optimista, agregando notificación de vuelta');
                return [...prev, notification];
              }
              return prev;
            });
            if (unreadCountFromAPI >= 0) {
              setUnreadCountFromAPI(prev => prev + 1);
            }
          }
        })
        .catch(error => {
          console.error("❌ [handleNotificationClick] Error al marcar notificación como leída:", error);
          // Revertir el cambio optimista si falla - volver a agregar la notificación
          setNotifications(prev => {
            // Verificar que no esté ya en la lista
            const exists = prev.some(n => n.id === notificationId);
            if (!exists) {
              console.log('↩️ [handleNotificationClick] Revirtiendo cambio optimista (catch), agregando notificación de vuelta');
              return [...prev, notification];
            }
            return prev;
          });
          if (unreadCountFromAPI >= 0) {
            setUnreadCountFromAPI(prev => prev + 1);
          }
        });
    } else {
      console.warn('⚠️ [handleNotificationClick] No se puede marcar como leída - notificationId o userId faltante');
    }
  };

  // Usar el conteo del API si está disponible, sino usar el conteo local
  const unreadCount = unreadCountFromAPI > 0 ? unreadCountFromAPI : notifications.filter(n => !n.read).length;
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
                    ) : (() => {
                      // Filtrar solo notificaciones no leídas
                      const unreadNotifications = notifications.filter(n => !n.read);
                      return unreadNotifications.length === 0 ? (
                        <div className="notification-item">No tienes notificaciones nuevas.</div>
                      ) : (
                        unreadNotifications.map(notif => (
                          <div
                            key={notif.id}
                            className="notification-item unread"
                            onClick={(e) => handleNotificationClick(notif, e)}
                            style={{ cursor: 'pointer' }}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleNotificationClick(notif, e);
                              }
                            }}
                          >
                            <p>{notif.text}</p>
                            <span className="time">{notif.time}</span>
                          </div>
                        ))
                      );
                    })()}
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