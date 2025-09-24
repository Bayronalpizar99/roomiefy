import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [idToken, setIdToken] = useState(null);
  
  // Estados para controlar el modal
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("Para continuar, por favor inicia sesión.");

  const login = (userData, token) => {
    setUser(userData);
    setIdToken(token);
    setIsLoginModalOpen(false); // Cierra el modal automáticamente al iniciar sesión
  };

  const logout = () => {
    setUser(null);
    setIdToken(null);
  };

  // Función para abrir el modal desde cualquier parte de la app
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