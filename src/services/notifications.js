/**
 * Servicio para comunicarse con el microservicio de notificaciones
 */

const NOTIFICATIONS_API_URL = import.meta.env.VITE_NOTIFICATIONS_API_URL || 'http://localhost:3001';

/**
 * Envía una notificación de favorito al microservicio
 * @param {Object} favoriteData - Datos del favorito
 * @param {string} favoriteData.propertyId - ID de la propiedad
 * @param {string} favoriteData.propertyTitle - Título/nombre de la propiedad
 * @param {string} favoriteData.propertyOwnerId - ID del propietario
 * @param {string} favoriteData.propertyOwnerEmail - Email del propietario
 * @param {string} favoriteData.favoritedBy - Nombre del usuario que marcó como favorita
 * @param {string} favoriteData.favoritedByEmail - Email del usuario que marcó como favorita
 */
export const sendFavoriteNotification = async (favoriteData) => {
  try {
    console.log('📤 Enviando notificación de favorito:', favoriteData);
    console.log('🔗 URL:', `${NOTIFICATIONS_API_URL}/api/notifications/favorite`);
    
    const response = await fetch(`${NOTIFICATIONS_API_URL}/api/notifications/favorite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(favoriteData),
    });

    console.log('📥 Respuesta recibida:', response.status, response.statusText);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('❌ Failed to send favorite notification:', error);
      console.error('Status:', response.status, response.statusText);
      return { success: false, error };
    }

    const data = await response.json();
    console.log('✅ Notificación enviada exitosamente:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error sending favorite notification:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      url: `${NOTIFICATIONS_API_URL}/api/notifications/favorite`
    });
    // No relanzamos el error - es no crítico
    return { success: false, error: error.message };
  }
};

/**
 * Obtiene las notificaciones de un usuario
 * @param {string} userId - ID del usuario
 * @param {Object} options - Opciones de consulta
 * @param {number} options.limit - Número máximo de notificaciones
 * @param {number} options.skip - Número de notificaciones a saltar (paginación)
 * @param {boolean|null} options.read - Filtrar por leídas (true), no leídas (false), o todas (null)
 */
export const getNotifications = async (userId, options = {}) => {
  try {
    const { limit = 50, skip = 0, read = null } = options;
    const params = new URLSearchParams();
    
    if (limit) params.append('limit', limit);
    if (skip) params.append('skip', skip);
    if (read !== null) params.append('read', read);

    const response = await fetch(
      `${NOTIFICATIONS_API_URL}/api/notifications/${userId}?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch notifications: ${response.status}`);
    }

    const data = await response.json();
    console.log('📥 Respuesta completa del microservicio:', data);
    
    // El microservicio devuelve: { success: true, data: [...], meta: {...} }
    // Asegurarnos de que siempre tengamos un array en data
    return { 
      success: true, 
      data: Array.isArray(data.data) ? data.data : [],
      meta: data.meta || null
    };
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    return { success: false, error: error.message, data: [], meta: null };
  }
};

/**
 * Obtiene el conteo de notificaciones no leídas de un usuario
 * @param {string} userId - ID del usuario
 */
export const getUnreadNotificationCount = async (userId) => {
  try {
    const response = await fetch(
      `${NOTIFICATIONS_API_URL}/api/notifications/${userId}/unread/count`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch unread count: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, count: data.count || 0 };
  } catch (error) {
    console.error('❌ Error fetching unread count:', error);
    return { success: false, count: 0, error: error.message };
  }
};

/**
 * Marca una notificación como leída
 * @param {string} notificationId - ID de la notificación
 * @param {string} userId - ID del usuario
 */
export const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const response = await fetch(
      `${NOTIFICATIONS_API_URL}/api/notifications/${notificationId}/read`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `Failed to mark as read: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Marca todas las notificaciones de un usuario como leídas
 * @param {string} userId - ID del usuario
 */
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const response = await fetch(
      `${NOTIFICATIONS_API_URL}/api/notifications/${userId}/read-all`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to mark all as read: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, modifiedCount: data.modifiedCount || 0 };
  } catch (error) {
    console.error('❌ Error marking all notifications as read:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Elimina una notificación
 * @param {string} notificationId - ID de la notificación
 * @param {string} userId - ID del usuario
 */
export const deleteNotification = async (notificationId, userId) => {
  try {
    const response = await fetch(
      `${NOTIFICATIONS_API_URL}/api/notifications/${notificationId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `Failed to delete: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Error deleting notification:', error);
    return { success: false, error: error.message };
  }
};

