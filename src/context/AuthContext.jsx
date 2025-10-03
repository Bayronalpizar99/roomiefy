import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("Para continuar, por favor inicia sesión.");
  const [isInitializing, setIsInitializing] = useState(true);
  
  // --- LÓGICA DE FAVORITOS INTEGRADA ---
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  // Cargar favoritos desde localStorage cuando el usuario cambia
  useEffect(() => {
    if (user) {
      const storedFavorites = localStorage.getItem(`roomify_favorites_${user.email}`);
      if (storedFavorites) {
        setFavoriteIds(new Set(JSON.parse(storedFavorites)));
      }
    } else {
      setFavoriteIds(new Set()); // Limpiar favoritos si no hay usuario
    }
  }, [user]);

  // Función para añadir/quitar de favoritos
  const toggleFavorite = useCallback((propertyId) => {
    if (!user) {
      requireLogin("Debes iniciar sesión para guardar favoritos.");
      return;
    }
    
    setFavoriteIds(prevIds => {
      const newIds = new Set(prevIds);
      if (newIds.has(propertyId)) {
        newIds.delete(propertyId);
      } else {
        newIds.add(propertyId);
      }
      // Guardar en localStorage
      localStorage.setItem(`roomify_favorites_${user.email}`, JSON.stringify(Array.from(newIds)));
      return newIds;
    });
  }, [user]);
  // --- FIN DE LÓGICA DE FAVORITOS ---

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('roomify_user');
    const storedToken = localStorage.getItem('roomify_token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setIdToken(storedToken);
    }
    
    // Marcar la inicialización como completa después de un breve delay
    // para asegurar que el usuario se haya cargado desde localStorage
    setTimeout(() => {
      setIsInitializing(false);
    }, 100);
  }, []);

  // Cerrar el modal automáticamente cuando el usuario inicia sesión
  useEffect(() => {
    if (user && isLoginModalOpen) {
      setIsLoginModalOpen(false);
    }
  }, [user, isLoginModalOpen]);

  // Efecto para proteger rutas
  useEffect(() => {
    // No ejecutar protección hasta que la inicialización haya terminado
    if (isInitializing) return;

    const protectedPaths = ['/chat', '/perfil', '/mis-propiedades', '/publicar', '/favoritos'];
    const pathIsProtected = protectedPaths.some(path => location.pathname.startsWith(path));

    if (!user && pathIsProtected) {
      let message = 'Debes iniciar sesión para acceder a esta página.';
      if (location.pathname === '/chat') {
        message = 'Inicia sesión para ver tus mensajes.';
      } else if (location.pathname === '/perfil') {
        message = 'Inicia sesión para ver tu perfil.';
      } else if (location.pathname === '/mis-propiedades') {
        message = 'Inicia sesión para ver tus propiedades.';
      } else if (location.pathname === '/publicar') {
        message = 'Inicia sesión para poder publicar.';
      } else if (location.pathname === '/favoritos') {
        message = 'Inicia sesión para ver tus propiedades favoritas.';
      }

      requireLogin(message);
      navigate('/', { replace: true });
    }
  }, [user, location, navigate, isInitializing]);

  const login = (userData, token) => {
    localStorage.setItem('roomify_user', JSON.stringify(userData));
    localStorage.setItem('roomify_token', token);
    setUser(userData);
    setIdToken(token);
    setIsLoginModalOpen(false);
  };

  const logout = () => {
    localStorage.removeItem('roomify_user');
    localStorage.removeItem('roomify_token');
    setUser(null);
    setIdToken(null);
  };

  const requireLogin = (message) => {
    setModalMessage(message || "Para continuar, por favor inicia sesión.");
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const value = {
    user,
    idToken,
    login,
    logout,
    isLoginModalOpen,
    modalMessage,
    requireLogin,
    closeLoginModal,
    favoriteIds,
    toggleFavorite,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}