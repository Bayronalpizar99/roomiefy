
const apiUrl = import.meta.env.VITE_API_URL; 
const apiKey = import.meta.env.VITE_API_KEY; 
const notificationsApiUrl = import.meta.env.VITE_NOTIFICATIONS_API_URL; 

const useApiManagement = !!apiUrl && !!apiKey;
const baseUrl = useApiManagement ? apiUrl : notificationsApiUrl;
const apiPrefix = useApiManagement ? '/notifications' : '/api/notifications';

if (import.meta.env.MODE === 'development') {
  console.log(' [Notifications] Usando API Management:', useApiManagement);
  console.log(' [Notifications] Base URL:', baseUrl);
  console.log(' [Notifications] API Prefix:', apiPrefix);
}

/**
 * @param {Object} favoriteData 
 * @param {string} favoriteData.propertyId 
 * @param {string} favoriteData.propertyTitle 
 * @param {string} favoriteData.propertyOwnerId 
 * @param {string} favoriteData.propertyOwnerEmail 
 * @param {string} favoriteData.favoritedBy 
 * @param {string} favoriteData.favoritedByEmail 
 */
export const sendFavoriteNotification = async (favoriteData) => {
  try {
    const url = `${baseUrl}${apiPrefix}/favorite`;
    console.log(' [sendFavoriteNotification] Usando API Management:', useApiManagement);
    console.log(' [sendFavoriteNotification] URL:', url);
    console.log(' [sendFavoriteNotification] Enviando notificación de favorito:', favoriteData);
    console.log(' [sendFavoriteNotification] Payload completo:', JSON.stringify(favoriteData, null, 2));

    const headers = {
      'Content-Type': 'application/json',
    };

    if (useApiManagement && apiKey) {
      headers['Ocp-Apim-Subscription-Key'] = apiKey;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(favoriteData),
    });

    console.log(' [sendFavoriteNotification] Respuesta recibida:', response.status, response.statusText);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error(' Failed to send favorite notification:', error);
      console.error('Status:', response.status, response.statusText);
      return { success: false, error };
    }

    const data = await response.json();
    console.log(' Notificación enviada exitosamente:', data);
    return { success: true, data };
  } catch (error) {
    console.error(' Error sending favorite notification:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      url: `${baseUrl}${apiPrefix}/favorite`
    });
    return { success: false, error: error.message };
  }
};

/**
 * @param {string} userId 
 * @param {Object} options 
 * @param {number} options.limit 
 * @param {number} options.skip 
 * @param {boolean|null} options.read 
 */
export const getNotifications = async (userId, options = {}) => {
  try {
    const { limit = 50, skip = 0, read = null } = options;
    const params = new URLSearchParams();

    if (limit) params.append('limit', limit);
    if (skip) params.append('skip', skip);
    if (read !== null) params.append('read', read);

    const url = `${baseUrl}${apiPrefix}/${userId}?${params.toString()}`;
    const headers = {
      'Content-Type': 'application/json',
    };

    if (useApiManagement && apiKey) {
      headers['Ocp-Apim-Subscription-Key'] = apiKey;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch notifications: ${response.status}`);
    }

    const data = await response.json();
    console.log(' Respuesta completa del microservicio:', data);

    return {
      success: true,
      data: Array.isArray(data.data) ? data.data : [],
      meta: data.meta || null
    };
  } catch (error) {
    console.error(' Error fetching notifications:', error);
    return { success: false, error: error.message, data: [], meta: null };
  }
};

/**
 * @param {string} userId 
 */
export const getUnreadNotificationCount = async (userId) => {
  try {
    const url = `${baseUrl}${apiPrefix}/${userId}/unread/count`;
    const headers = {
      'Content-Type': 'application/json',
    };

    if (useApiManagement && apiKey) {
      headers['Ocp-Apim-Subscription-Key'] = apiKey;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch unread count: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, count: data.count || 0 };
  } catch (error) {
    console.error(' Error fetching unread count:', error);
    return { success: false, count: 0, error: error.message };
  }
};

/**
 * Marca una notificación como leída
 * @param {string} notificationId 
 * @param {string} userId 
 */
export const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const url = `${baseUrl}${apiPrefix}/${notificationId}/read`;
    console.log(' [markNotificationAsRead] Usando API Management:', useApiManagement);
    console.log(' [markNotificationAsRead] Enviando request:', {
      url,
      method: 'PATCH',
      notificationId,
      userId
    });

    const headers = {
      'Content-Type': 'application/json',
    };

    if (useApiManagement && apiKey) {
      headers['Ocp-Apim-Subscription-Key'] = apiKey;
    }

    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ userId }),
    });

    console.log(' [markNotificationAsRead] Respuesta recibida:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error(' [markNotificationAsRead] Error en respuesta:', errorData);
      throw new Error(errorData.error || `Failed to mark as read: ${response.status}`);
    }

    const data = await response.json();
    console.log(' [markNotificationAsRead] Notificación marcada exitosamente:', data);
    return { success: true, data: data.data };
  } catch (error) {
    console.error(' [markNotificationAsRead] Error completo:', error);
    console.error(' [markNotificationAsRead] Error message:', error.message);
    console.error(' [markNotificationAsRead] Error stack:', error.stack);
    return { success: false, error: error.message };
  }
};

/**
 * @param {string} userId 
 */
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const url = `${baseUrl}${apiPrefix}/${userId}/read-all`;
    const headers = {
      'Content-Type': 'application/json',
    };

    if (useApiManagement && apiKey) {
      headers['Ocp-Apim-Subscription-Key'] = apiKey;
    }

    const response = await fetch(url, {
      method: 'PATCH',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to mark all as read: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, modifiedCount: data.modifiedCount || 0 };
  } catch (error) {
    console.error('  Error marking all notifications as read:', error);
    return { success: false, error: error.message };
  }
};

/**
 * @param {string} notificationId 
 * @param {string} userId 
 */
export const deleteNotification = async (notificationId, userId) => {
  try {
    const url = `${baseUrl}${apiPrefix}/${notificationId}`;
    const headers = {
      'Content-Type': 'application/json',
    };

    if (useApiManagement && apiKey) {
      headers['Ocp-Apim-Subscription-Key'] = apiKey;
    }

    const response = await fetch(url, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `Failed to delete: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error(' Error deleting notification:', error);
    return { success: false, error: error.message };
  }
};

