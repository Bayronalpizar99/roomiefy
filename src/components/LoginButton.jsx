import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode'; // Necesitarás instalar esta librería

const LoginButton = () => {
  const { login } = useAuth();
  const googleButton = useRef(null);

  const handleCredentialResponse = (response) => {
    console.log("Encoded JWT ID token: " + response.credential);
    const idToken = response.credential;
    const userObject = jwtDecode(idToken);
    console.log("User Info:", userObject);
    login(userObject, idToken);
  };

  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: '681304602799-9i8eg92knveth1hnmfiom0cm4t0ee6pv.apps.googleusercontent.com', // Tu ID de cliente
        callback: handleCredentialResponse
      });
      window.google.accounts.id.renderButton(
        googleButton.current,
        { theme: "outline", size: "large" }
      );
    }
  }, []);

  return <div ref={googleButton}></div>;
};

export default LoginButton;