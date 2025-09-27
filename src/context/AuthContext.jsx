import React, { createContext, useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("Para continuar, por favor inicia sesión.");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('roomify_user');
    const storedToken = localStorage.getItem('roomify_token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setIdToken(storedToken);
    }
  }, []);

  // Efecto para proteger rutas
  useEffect(() => {
    const protectedPaths = ['/chat', '/perfil', '/mis-propiedades', '/publicar'];
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
      }

      requireLogin(message);
      navigate('/', { replace: true });
    }
  }, [user, location, navigate]);

  const login = (userData, token) => {
    localStorage.setItem('roomify_user', JSON.stringify(userData));
    localStorage.setItem('roomify_token', token);
    setUser(userData);
    setIdToken(token);
    setIsLoginModalOpen(false);
  };

  // --- MODIFICACIÓN CLAVE ---
  // La función logout ahora solo limpia las credenciales, sin recargar la página.
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