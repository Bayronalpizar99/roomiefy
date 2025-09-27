import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [idToken, setIdToken] = useState(null);
  
  // Estados para controlar el modal
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("Para continuar, por favor inicia sesión.");

  // --- INICIO DE LA MODIFICACIÓN ---
  // Este useEffect se ejecuta una sola vez cuando la aplicación carga.
  // Su propósito es restaurar la sesión si encuentra datos en localStorage.
  useEffect(() => {
    const storedUser = localStorage.getItem('roomify_user');
    const storedToken = localStorage.getItem('roomify_token');

    if (storedUser && storedToken) {
      // Si encontramos datos, los cargamos en el estado de la aplicación.
      setUser(JSON.parse(storedUser));
      setIdToken(storedToken);
    }
  }, []); // El array vacío [] asegura que esto solo se ejecute al montar el componente.

  const login = (userData, token) => {
    // 1. Guardar la sesión en localStorage para que persista.
    localStorage.setItem('roomify_user', JSON.stringify(userData));
    localStorage.setItem('roomify_token', token);
    
    // 2. Actualizar el estado de React para que la UI reaccione.
    setUser(userData);
    setIdToken(token);
    setIsLoginModalOpen(false); // Cierra el modal automáticamente al iniciar sesión
  };

  const logout = () => {
    // 1. Limpiar la sesión de localStorage.
    localStorage.removeItem('roomify_user');
    localStorage.removeItem('roomify_token');
    
    // 2. Limpiar el estado de React.
    setUser(null);
    setIdToken(null);
  };
  // --- FIN DE LA MODIFICACIÓN ---

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