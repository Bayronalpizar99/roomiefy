import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';

const LoginButton = () => {
  const { login } = useAuth();
  const googleButton = useRef(null);

  const handleCredentialResponse = (response) => {
    const idToken = response.credential;
    const userObject = jwtDecode(idToken);
    login(userObject, idToken);
  };

  useEffect(() => {
    if (window.google) {
      const isLightMode = document.body.classList.contains('light');
      const theme = isLightMode ? 'outline' : 'filled_black';
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse
      });
      window.google.accounts.id.renderButton(
        googleButton.current,
        { theme, size: "large" }
      );
    }
  }, []);

  return <div ref={googleButton} className="google-login-container"></div>;
};

export default LoginButton;