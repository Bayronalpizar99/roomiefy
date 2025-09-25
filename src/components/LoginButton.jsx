import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';

const LoginButton = () => {
  const { login } = useAuth();
  const googleButton = useRef(null);
  const [isLightMode, setIsLightMode] = useState(false);

  const handleCredentialResponse = (response) => {
    const idToken = response.credential;
    const userObject = jwtDecode(idToken);
    login(userObject, idToken);
  };

  // Efecto para detectar cambios en el tema
  useEffect(() => {
    const checkTheme = () => {
      setIsLightMode(document.body.classList.contains('light'));
    };

    // Verificar el tema inicial
    checkTheme();

    // Configurar un observador para detectar cambios en el tema
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.body, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });

    return () => observer.disconnect();
  }, []);

  // Efecto para inicializar el botón de Google
  useEffect(() => {
    if (window.google) {
      // Limpiar el botón anterior si existe
      if (googleButton.current) {
        googleButton.current.innerHTML = '';
      }

      // Inicializar el botón con el tema correcto
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        use_fedcm_for_prompt: true
      });

      // Renderizar el botón con el tema adecuado
      try {
        window.google.accounts.id.renderButton(
          googleButton.current,
          { 
            theme: isLightMode ? 'outline' : 'filled_blue',
            size: 'large',
            width: googleButton.current?.offsetWidth || 240,
            text: 'signin_with',
            shape: 'pill',
            logo_alignment: 'left'
          }
        );
      } catch (error) {
        console.error('Error al renderizar el botón de Google:', error);
      }
    }
  }, [isLightMode]);

  return (
    <div 
      ref={googleButton} 
      className="google-login-container"
      style={{
        minWidth: '200px',
        height: '42px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    />
  );
};

export default LoginButton;