import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [idToken, setIdToken] = useState(null);
  
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("Para continuar, por favor inicia sesión.");

  useEffect(() => {
    const storedUser = localStorage.getItem('roomify_user');
    const storedToken = localStorage.getItem('roomify_token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setIdToken(storedToken);
    }
  }, []);

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
    closeLoginModal,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};