import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { loginWithGoogle } from "../services/api";

const LoginButton = () => {
  const { login } = useAuth();
  const googleButton = useRef(null);
  const [isLightMode, setIsLightMode] = useState(false);

  const handleCredentialResponse = async (response) => {
    try {
      const idToken = response.credential;
      const backendResponse = await loginWithGoogle(idToken);
      login(backendResponse.user, backendResponse.accessToken);
    } catch (error) {
      console.error("Error during Google login:", error);
      alert(
        "No se pudo iniciar sesión con Google. Por favor, intenta de nuevo."
      );
    }
  };

  // Efecto para detectar cambios en el tema
  useEffect(() => {
    const checkTheme = () => {
      setIsLightMode(document.body.classList.contains("light"));
    };

    // Verificar el tema inicial
    checkTheme();

    // Configurar un observador para detectar cambios en el tema
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Efecto para inicializar el botón de Google
  useEffect(() => {
    if (window.google) {
      // Limpiar el botón anterior si existe
      if (googleButton.current) {
        googleButton.current.innerHTML = "";
      }

      // Inicializar el botón con el tema correcto
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        use_fedcm_for_prompt: true,
      });

      // Renderizar el botón con el tema adecuado
      try {
        window.google.accounts.id.renderButton(googleButton.current, {
          theme: isLightMode ? "outline" : "filled_blue",
          size: "large",
          width: googleButton.current?.offsetWidth || 240,
          text: "signin_with",
          shape: "pill",
          logo_alignment: "left",
        });
      } catch (error) {
        console.error("Error al renderizar el botón de Google:", error);
      }
    }
  }, [isLightMode]);

  return (
    <div
      ref={googleButton}
      className="google-login-container"
      style={{
        minWidth: "200px",
        height: "42px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    />
  );
};

export default LoginButton;
