import React, { createContext, useState, useContext } from 'react';

// 1. Creamos el contexto
const AuthContext = createContext(null);

// 2. Creamos el "Proveedor" que envolverá nuestra aplicación
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);       // Almacenará la info del perfil de Google
  const [idToken, setIdToken] = useState(null); // Almacenará el token para las llamadas a la API

  const login = (userData, token) => {
    setUser(userData);
    setIdToken(token);
  };

  const logout = () => {
    setUser(null);
    setIdToken(null);
    // Aquí también podrías añadir la lógica para que Google "olvide" al usuario
  };

  return (
    <AuthContext.Provider value={{ user, idToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Creamos un "hook" personalizado para usar el contexto fácilmente
export const useAuth = () => {
  return useContext(AuthContext);
};