import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState(
    "Para continuar, por favor inicia sesión."
  );
  const [isInitializing, setIsInitializing] = useState(true);

  const [favoriteIds, setFavoriteIds] = useState(new Set());

  useEffect(() => {
    if (user) {
      const storedFavorites = localStorage.getItem(
        `roomify_favorites_${user.email}`
      );
      if (storedFavorites) {
        setFavoriteIds(new Set(JSON.parse(storedFavorites)));
      }
    } else {
      setFavoriteIds(new Set()); 
    }
  }, [user]);

  const toggleFavorite = useCallback(
    async (propertyId, propertyData = null) => {
      if (!user) {
        requireLogin("Debes iniciar sesión para guardar favoritos.");
        return;
      }

      const wasFavorited = favoriteIds.has(propertyId);
      const isAdding = !wasFavorited;

      setFavoriteIds((prevIds) => {
        const newIds = new Set(prevIds);
        if (wasFavorited) {
          newIds.delete(propertyId);
        } else {
          newIds.add(propertyId);
        }
        localStorage.setItem(
          `roomify_favorites_${user.email}`,
          JSON.stringify(Array.from(newIds))
        );
        return newIds;
      });

      if (isAdding && propertyData) {
        console.log(' Agregando favorito, enviando notificación...', {
          propertyId,
          propertyData,
          user,
        });

        try {
          const { sendFavoriteNotification } = await import('../services/notifications.js');

          const ownerId =
            propertyData.ownerId ||
            propertyData.owner_id ||
            (propertyData.owner_name === 'Tú (Propietario)' ? user.email : 'unknown');

          let ownerEmail =
            propertyData.ownerEmail ||
            propertyData.owner_email;

          if (!ownerEmail && ownerId && ownerId !== 'unknown') {

            if (String(ownerId).includes('@')) {
              ownerEmail = String(ownerId);
            } else {
              ownerEmail = String(ownerId);
            }
          }

          if (!ownerEmail || ownerEmail === 'no-email@example.com') {
            ownerEmail = ownerId && ownerId !== 'unknown' ? String(ownerId) : 'no-email@example.com';
            console.log('⚠️ No se encontró ownerEmail, usando ownerId como identificador:', ownerEmail);
          }

          const isOwnProperty =
            propertyData.owner_name === 'Tú (Propietario)' ||
            (ownerId && ownerId !== 'unknown' && (
              String(ownerId) === String(user.id) ||
              String(ownerId) === String(user.email)
            )) ||
            (ownerEmail && ownerEmail !== 'no-email@example.com' && ownerEmail !== 'unknown' && user.email &&
              String(ownerEmail).toLowerCase() === String(user.email).toLowerCase());

          if (isOwnProperty) {
            console.log(' El propietario es el usuario actual, no se envía notificación', {
              ownerId,
              ownerEmail,
              userId: user.id,
              userEmail: user.email,
              ownerName: propertyData.owner_name,
              reason: propertyData.owner_name === 'Tú (Propietario)' ? 'owner_name check' :
                (String(ownerId) === String(user.id) || String(ownerId) === String(user.email)) ? 'ownerId match' :
                  'ownerEmail match'
            });
            return;
          }

          console.log('Propiedad no es del usuario actual, se enviará notificación', {
            ownerId,
            ownerEmail,
            userId: user.id,
            userEmail: user.email
          });

          const notificationData = {
            propertyId: String(propertyData.id || propertyId),
            propertyTitle: propertyData.name || propertyData.title || 'Propiedad',
            propertyOwnerId: ownerId,
            propertyOwnerEmail: ownerEmail,
            favoritedBy:
              user.name || user.displayName || user.email?.split('@')[0] || 'Usuario',
            favoritedByEmail: user.email || '',
          };

          console.log(' Datos de notificación preparados:', notificationData);
          console.log(' Debug - ownerId:', ownerId, 'ownerEmail:', ownerEmail);
          console.log(' Debug - propertyData completo:', propertyData);
          console.log(' Debug - user actual:', { email: user.email, id: user.id, sub: user.sub });
          console.log(' Debug - ¿Es propiedad propia?', isOwnProperty);

          const result = await sendFavoriteNotification(notificationData);

          console.log(' Resultado de sendFavoriteNotification:', result);

          if (result.success) {
            console.log(' Notificación enviada correctamente');
          } else {
            console.warn(' No se pudo enviar notificación:', result.error);
          }
        } catch (error) {
          console.error(' Error al enviar notificación de favorito:', error);
        }
      } else {
        if (!isAdding) {
          console.log('🗑️ Quitando favorito - no se envía notificación');
        }
        if (!propertyData) {
          console.warn(
            ' No hay datos de propiedad - no se puede enviar notificación',
            { propertyId }
          );
        }
      }
    },
    [user, favoriteIds]
  );

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("roomify_user");
    const storedToken = localStorage.getItem("roomify_token");

    if (storedUser && storedToken) {
      const parsedUser = JSON.parse(storedUser);

      // Ensure the user has an ID
      if (!parsedUser.id) {
        const userId = parsedUser.sub || parsedUser.userId || parsedUser.email || Date.now().toString();
        parsedUser.id = userId;
        // Update user in localStorage
        localStorage.setItem('roomify_user', JSON.stringify(parsedUser));
      }

      console.log('[Auth] Usuario cargado desde localStorage:', parsedUser);
      setUser(parsedUser);

      // Use the most appropriate token setter depending on your codebase
      if (typeof setAccessToken === "function") {
        setAccessToken(storedToken);
      } else if (typeof setIdToken === "function") {
        setIdToken(storedToken);
      }
    }

    // Marcar la inicialización como completa después de un breve delay
    setTimeout(() => {
      console.log('[Auth] Inicialización completada');
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

    const protectedPaths = [
      "/chat",
      "/perfil",
      "/mis-propiedades",
      "/publicar",
      "/favoritos",
    ];
    const pathIsProtected = protectedPaths.some((path) =>
      location.pathname.startsWith(path)
    );

    if (!user && pathIsProtected) {
      let message = "Debes iniciar sesión para acceder a esta página.";
      if (location.pathname === "/chat") {
        message = "Inicia sesión para ver tus mensajes.";
      } else if (location.pathname === "/perfil") {
        message = "Inicia sesión para ver tu perfil.";
      } else if (location.pathname === "/mis-propiedades") {
        message = "Inicia sesión para ver tus propiedades.";
      } else if (location.pathname === "/publicar") {
        message = "Inicia sesión para poder publicar.";
      } else if (location.pathname === "/favoritos") {
        message = "Inicia sesión para ver tus propiedades favoritas.";
      }

      requireLogin(message);
      navigate("/", { replace: true });
    }
  }, [user, location, navigate, isInitializing]);

  const login = (userData, token) => {
    // Asegurarse de que el ID del usuario esté disponible
    const userWithId = {
      ...userData,
      // Usar el ID de la fuente más confiable disponible
      id: userData?.id || userData?.sub || userData?.userId || userData?.email || Date.now().toString()
    };

    console.log('[Auth] Iniciando sesión con usuario:', userWithId);

    localStorage.setItem('roomify_user', JSON.stringify(userWithId));
    localStorage.setItem('roomify_token', token);

    // Guardar el ID por separado para fácil acceso
    if (userWithId.id) {
      localStorage.setItem('roomiefy_user_id', String(userWithId.id));
    }

    setUser(userWithId);
    setAccessToken(token);
    setIsLoginModalOpen(false);
  };

  const logout = () => {
    localStorage.removeItem('roomify_user');
    localStorage.removeItem('roomify_token');
    try { localStorage.removeItem('roomiefy_user_id'); } catch (e) { /* noop */ }
    setUser(null);
    setAccessToken(null);
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
    accessToken,
    login,
    logout,
    isLoginModalOpen,
    modalMessage,
    requireLogin,
    closeLoginModal,
    favoriteIds,
    toggleFavorite,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
