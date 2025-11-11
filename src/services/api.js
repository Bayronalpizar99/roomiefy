/**
 * Obtiene los datos de las propiedades desde la API de Azure.
 * AHORA SOPORTA FILTROS DEL LADO DEL SERVIDOR.
 */

const apiUrl = import.meta.env.VITE_API_URL;
const apiKey = import.meta.env.VITE_API_KEY;

export const fetchProperties = async (options = {}) => {
  // Verificación para asegurar que las variables de entorno están cargadas
  if (!apiUrl) {
    // Variable de entorno VITE_API_URL no definida
    return { data: [], error: 'Configuración de API incompleta (VITE_API_URL).' };
  }
  if (!apiKey) {
    // Variable de entorno VITE_API_KEY no definida
    return { data: [], error: 'Configuración de API incompleta (VITE_API_KEY).' };
  }

  try {
    const {
      search,
      price,
      bedrooms,
      amenities,
      sort,
      page,
      pageSize
    } = options;

    const params = new URLSearchParams();
    const appendIfDefined = (key, value) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    };

    appendIfDefined('search', search);
    appendIfDefined('priceMax', price);
    
    if (bedrooms && bedrooms !== 'any') {
      appendIfDefined('bedrooms', bedrooms);
    }

    if (amenities && amenities.size > 0) {
      params.append('amenities', Array.from(amenities).join(','));
    }
    
    appendIfDefined('sort', sort);
    appendIfDefined('page', page);
    appendIfDefined('pageSize', pageSize);

    const url = apiUrl + 'properties' + (params.toString() ? `?${params.toString()}` : '');

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": apiKey,
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      let errorMsg = `Error al obtener las propiedades: ${response.status} ${response.statusText}`;
      if (response.status === 401 || response.status === 403) {
        errorMsg = "Error de autenticación: La API KEY es incorrecta o no tiene permisos.";
      } else if (response.status === 404) {
        errorMsg = "Error: La URL de la API no es válida o el recurso no existe.";
      }
      // Error en la respuesta de la API
      return { data: [], meta: null, error: errorMsg };
    }

    const body = await response.json();
    const items = Array.isArray(body)
      ? body
      : (body?.data ?? body?.items ?? body?.properties ?? []);

    const totalHeader = response.headers.get('X-Total-Count');
    const total = totalHeader != null
      ? Number(totalHeader)
      : (body?.total ?? body?.meta?.total ?? null);

    const meta = { total, page, pageSize };

    return { data: items, meta, error: null };
  } catch (error) {
    // Error de red o excepción
    return { data: [], meta: null, error: error?.message || 'Fallo de red al obtener propiedades.' };
  }
};


/**
 * Obtiene las conversaciones del usuario desde la API.
 */
export const fetchConversations = async () => {
  if (!apiUrl) {
    // Variable de entorno VITE_API_URL no definida
    return { data: [], error: 'Configuración de API incompleta (VITE_API_URL).' };
  }
  if (!apiKey) {
    // Variable de entorno VITE_API_KEY no definida
    return { data: [], error: 'Configuración de API incompleta (VITE_API_KEY).' };
  }

  try {
    let userId = null;
    try { userId = localStorage.getItem('roomiefy_user_id'); } catch (e) { /* noop */ }
    const qs = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    const response = await fetch("http://127.0.0.1:8000/" + 'conversations' + qs, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": apiKey,
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      let errorMsg = `Error al obtener las conversaciones: ${response.status} ${response.statusText}`;
      if (response.status === 401 || response.status === 403) {
        errorMsg = "Error de autenticación: La API KEY es incorrecta o no tiene permisos.";
      } else if (response.status === 404) {
        errorMsg = "Error: La URL de la API no es válida o el recurso no existe.";
      }
      // Error en la respuesta de la API
      return { data: [], error: errorMsg };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: [], error: error?.message || 'Fallo de red al obtener conversaciones.' };
  }
};

export const fetchRoommates = async (options = {}) => {
  if (!apiUrl || !apiKey) {
    console.error("Error: Las variables de entorno VITE_API_URL o VITE_API_KEY no están definidas.");
    return { data: [], error: 'Configuración de API incompleta (VITE_API_URL o VITE_API_KEY).' };
  }

  try {
    // Construcción tolerante del query string con filtros y paginación
    const {
      page,
      pageSize,
      search,
      priceMin,
      priceMax,
      ageMin,
      ageMax,
      hasApartment, // booleano o 'yes' | 'no' | 'any'
      verifiedOnly,
      minCleanliness,
      minSocial,
      interests, // Array o Set
      sort, // 'recent' | 'rated_desc' | 'price_asc' | 'price_desc', etc.
    } = options || {};

    const params = new URLSearchParams();
    const appendIfDefined = (key, value) => {
      if (value === undefined || value === null || value === '') return;
      params.append(key, String(value));
    };

    appendIfDefined('page', page);
    appendIfDefined('pageSize', pageSize);
    appendIfDefined('search', search);
    appendIfDefined('minBudget', priceMin);
    appendIfDefined('maxBudget', priceMax);
    appendIfDefined('minAge', ageMin);
    appendIfDefined('maxAge', ageMax);

    // Normalizar hasApartment
    if (hasApartment !== undefined && hasApartment !== null && hasApartment !== 'any') {
      const value = typeof hasApartment === 'string'
        ? (hasApartment === 'yes' ? 'true' : hasApartment === 'no' ? 'false' : '')
        : (hasApartment ? 'true' : 'false');
      if (value) params.append('hasApartment', value);
    }

    if (verifiedOnly !== undefined) appendIfDefined('verified', verifiedOnly ? 'true' : 'false');
    appendIfDefined('minCleanliness', minCleanliness);
    appendIfDefined('minSocial', minSocial);

    if (interests && (Array.isArray(interests) || interests instanceof Set)) {
      const list = Array.from(interests);
      if (list.length > 0) params.append('interests', list.join(','));
    }

    appendIfDefined('sort', sort);

    const url = apiUrl + 'roomies' + (params.toString() ? `?${params.toString()}` : '');

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": apiKey,
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      const errorMsg = `Error al obtener los roommates: ${response.status} ${response.statusText}`;
      // Error en la respuesta de la API
      return { data: [], error: errorMsg };
    }

    // Intentar leer total desde headers (e.g., X-Total-Count) o desde el cuerpo JSON
    const totalHeader = response.headers.get('X-Total-Count') || response.headers.get('x-total-count');
    const body = await response.json();

    // Tolerancia a diferentes formas de respuesta
    const items = Array.isArray(body)
      ? body
      : (body?.data ?? body?.items ?? body?.roomies ?? []);

    const total = totalHeader != null
      ? Number(totalHeader)
      : (body?.total ?? body?.totalCount ?? body?.meta?.total ?? null);

    const meta = (total != null || page != null || pageSize != null)
      ? { total: total ?? null, page: page ?? null, pageSize: pageSize ?? null }
      : undefined;

    return { data: items, meta, error: null };
  } catch (error) {
    console.error(error);
    return { data: [], error: error?.message || 'Fallo de red al obtener roommates.' };
  }
};

/**
 * Obtiene un roomie por su ID.
 * @param {string|number} roomieId
 * @returns {Promise<{data: object|null, error: string|null}>}
 */
export const fetchRoommateById = async (roomieId) => {
  if (!apiUrl || !apiKey) {
    console.error("Error: Las variables de entorno VITE_API_URL o VITE_API_KEY no están definidas.");
    return { data: null, error: 'Configuración de API incompleta (VITE_API_URL o VITE_API_KEY).' };
  }

  try {
    let response = await fetch(`${apiUrl}roomies/${roomieId}`, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": apiKey,
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      const errorMsg = `Error al obtener el roomie: ${response.status} ${response.statusText}`;
      // Error en la respuesta de la API
      return { data: null, error: errorMsg };
    }

    const body = await response.json();
    const item = Array.isArray(body) ? (body[0] ?? null) : (body?.data ?? body ?? null);
    return { data: item, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: error?.message || 'Fallo de red al obtener el roomie.' };
  }
};

/**
 * Envía un mensaje a una conversación específica.
 * @param {string|number} conversationId
 * @param {string} content
 * @returns {Promise<object|null>} El mensaje creado por el servidor o null si falla
 */
export const sendMessage = async (conversationId, content, senderId = null) => {
  if (!apiUrl) {
    // Variable de entorno VITE_API_URL no definida
    return null;
  }
  if (!apiKey) {
    // Variable de entorno VITE_API_KEY no definida
    return null;
  }

  try {
    // Obtener el ID del usuario actual si no se proporciona
    let currentUserId = senderId;
    if (!currentUserId) {
      try {
        currentUserId = localStorage.getItem('roomiefy_user_id');
      } catch (e) {
        // Error al obtener el ID del usuario
      }
    }

    const payload = { 
      content,
      sender_id: currentUserId || 'unknown'
    };

    const response = await fetch(`http://127.0.0.1:8000/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": apiKey,
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        // Error de autenticación
      } else if (response.status === 404) {
        // Recurso no encontrado
      } else {
        // Error al enviar mensaje
      }
      throw new Error(`Error al enviar el mensaje: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Error de red al enviar mensaje
    return null;
  }
};

export const fetchProfileOptions = async () => {
  if (!apiUrl || !apiKey) {
    console.error("Error: Las variables de entorno VITE_API_URL o VITE_API_KEY no están definidas.");
    return { intereses: [], idiomas: [] };
  }

  try {
    const response = await fetch(apiUrl + 'profile/interests', {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": apiKey,
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Error al obtener opciones de perfil: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      intereses: data?.intereses || [],
      idiomas: data?.idiomas || []
    };
  } catch (error) {
    console.error(error);
    return { intereses: [], idiomas: [] };
  }
};

// --- CÓDIGO NUEVO INTEGRADO ---

/**
 * Crea una nueva propiedad enviando los datos a la API.
 * @param {object} propertyData - Los datos de la propiedad a crear.
 * @returns {Promise<object>} La respuesta de la API.
 */
export const createProperty = async (propertyData) => {
  if (!apiUrl || !apiKey) {
    console.error("Error: VITE_API_URL o VITE_API_KEY no están definidas.");
    throw new Error("La configuración de la API no está completa.");
  }

  try {
    const response = await fetch(`${apiUrl}properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': apiKey,
      },
      body: JSON.stringify(propertyData),
    });

    // El mock service responde con 201 Created y puede no tener un cuerpo JSON.
    // Si la respuesta es exitosa (como 201), no intentamos leerla como JSON.
    if (response.status === 201) {
      return { success: true, status: 201 };
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al crear la propiedad: ${response.status} ${errorText}`);
    }

    // Para un backend real, probablemente querrías devolver el JSON.
    return await response.json();
  } catch (error) {
    console.error("Excepción al crear la propiedad:", error);
    throw error; // Re-lanzamos el error para que el componente lo pueda manejar.
  }
};

/* Realiza un Post para crear un nuevo perfil de roomie con los datos de ProfilePage */
export const createRoomieProfile = async (profileData) => {
  const formData = new FormData();
  Object.keys(profileData).forEach((key) => {
    if (key !== "foto" && key !== "fotoPreview") formData.append(key, profileData[key]);
  });
  if (profileData.foto) formData.append("foto", profileData.foto, profileData.foto.name);

  const response = await fetch(apiUrl + 'profile', {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    let errorText;
    try {
      const data = await response.json();
      errorText = data?.message || JSON.stringify(data);
    } catch {
      errorText = await response.text();
    }
    throw new Error(`Error al crear el perfil: ${response.status} - ${errorText}`);
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return await response.json();
  } else {
    return { message: "Perfil creado correctamente" };
  }
};

/**
 * Elimina una propiedad por su ID llamando a la API.
 * @param {string|number} propertyId - El ID de la propiedad a eliminar.
 * @returns {Promise<object>} Un objeto indicando el éxito de la operación.
 */
export const deleteProperty = async (propertyId) => {
  if (!apiUrl || !apiKey) throw new Error("Configuración de API incompleta.");
  try {
    const response = await fetch(`${apiUrl}properties/${propertyId}`, { // URL corregida
      method: 'DELETE',
      headers: { 'Ocp-Apim-Subscription-Key': apiKey },
    });
    if (response.status === 204) return { success: true, status: 204 };
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al eliminar la propiedad: ${response.status} ${errorText}`);
    }
    return response;
  } catch (error) {
    console.error("Excepción en deleteProperty:", error);
    throw error;
  }
};


/**
 * Actualiza una propiedad existente.
 * @param {string|number} propertyId - El ID de la propiedad a modificar.
 * @param {object} propertyData - Los nuevos datos de la propiedad.
 * @returns {Promise<object>} La respuesta de la API.
 */
export const updateProperty = async (propertyId, propertyData) => {
    if (!apiUrl || !apiKey) throw new Error("API config incomplete.");
    try {
        const response = await fetch(`${apiUrl}properties/${propertyId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Ocp-Apim-Subscription-Key': apiKey },
            body: JSON.stringify(propertyData),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error updating property: ${response.status} ${errorText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Exception in updateProperty:", error);
        throw error;
    }
};

 /**
 * Obtiene la lista de notificaciones del usuario.
 * @returns {Promise<Array>} Una lista de notificaciones.
 */
export const fetchNotifications = async () => {
  if (!apiUrl || !apiKey) {
    console.error("Error: Variables de entorno de API no definidas.");
    return [];
  }
  try {
    // La URL se construye usando el sufijo 'notifications' que definiste en Azure
    const response = await fetch(`${apiUrl}notifications`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": apiKey,
        "Accept": "application/json"
      }
    });
    if (!response.ok) {
      throw new Error(`Error al obtener las notificaciones: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Excepción en fetchNotifications:", error);
    return []; // Devuelve un array vacío si hay un error
  }
};

/**
 * Crea una nueva conversación con un usuario específico.
 * @param {string|number} userId - El ID del usuario con el que crear la conversación.
 * @param {string} initialMessage - El mensaje inicial para la conversación.
 * @returns {Promise<object>} Objeto con la respuesta o información de error
 */
/**
 * Crea una nueva conversación con un usuario específico.
 * @param {string|number} userId - El ID del usuario con el que crear la conversación.
 * @param {string} currentUserId - El ID del usuario actual.
 * @param {string} initialMessage - El mensaje inicial para la conversación.
 * @returns {Promise<object>} Objeto con la respuesta o información de error
 */
export const createConversation = async (userId, currentUserId, initialMessage = '') => {
  console.log('[createConversation] Iniciando con parámetros:', { userId, currentUserId, initialMessage });
  
  if (!apiUrl) {
    const errorMsg = "Error: La variable de entorno VITE_API_URL no está definida.";
    console.error(errorMsg);
    return { error: errorMsg };
  }

  if (!currentUserId) {
    const errorMsg = "Error: No se proporcionó el ID del usuario actual.";
    console.error(errorMsg);
    return { error: errorMsg };
  }

  // Formato correcto que espera el backend
  const payload = {
    participantId: String(userId),
    currentUserId: String(currentUserId),
    initialMessage: initialMessage
  };

  try {
    console.log('[createConversation] Enviando payload al servidor:', payload);
    
    const apiUrl = 'http://127.0.0.1:8000/conversations';
    console.log('[createConversation] URL de la API:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    console.log('[createConversation] Estado de la respuesta:', response.status);
    
    console.log('[createConversation] Respuesta recibida, estado:', response.status);

    const responseData = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      console.error('Error al crear la conversación:', {
        status: response.status,
        statusText: response.statusText,
        response: responseData
      });
      return { 
        error: 'Error al crear la conversación',
        status: response.status,
        details: responseData
      };
    }
    
    // Forzar una recarga de las conversaciones después de crear una nueva
    if (responseData && responseData.id) {
      // Opcional: puedes forzar una recarga de las conversaciones aquí
      // o manejar la actualización en el componente que llama a esta función
      console.log('Conversación creada exitosamente:', responseData);
    }
    
    return responseData;
  } catch (error) {
    console.error('Excepción al crear la conversación:', error);
    return { 
      error: 'Error de conexión',
      message: error.message 
    };
  }
};  
/**
 * Obtiene los mensajes de una conversación específica.
 * @param {string|number} conversationId - El ID de la conversación.
 * @returns {Promise<Array|null>} Lista de mensajes o null si falla
 */
export const fetchMessages = async (conversationId) => {
  if (!apiUrl) {
    // Variable de entorno VITE_API_URL no definida
    return { data: null, error: 'Configuración de API incompleta (VITE_API_URL).' };
  }
  if (!apiKey) {
    // Variable de entorno VITE_API_KEY no definida
    return { data: null, error: 'Configuración de API incompleta (VITE_API_KEY).' };
  }

  try {
    const response = await fetch(`http://127.0.0.1:8000/conversations/${conversationId}/messages`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": apiKey,
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      let errorMsg = `Error al obtener los mensajes: ${response.status} ${response.statusText}`;
      if (response.status === 401 || response.status === 403) {
        errorMsg = "Error de autenticación: La API KEY es incorrecta o no tiene permisos.";
      } else if (response.status === 404) {
        errorMsg = "Error: La conversación no existe o no se puede acceder.";
      }
      // Error en la respuesta de la API
      return { data: null, error: errorMsg };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error("Error de red o excepción al obtener los mensajes:", error);
    return { data: null, error: error?.message || 'Fallo de red al obtener mensajes.' };
  }
};

/**
 * Obtiene una conversación específica con sus mensajes.
 * @param {string|number} conversationId - El ID de la conversación.
 * @returns {Promise<object|null>} La conversación completa con mensajes o null si falla
 */
export const fetchConversation = async (conversationId) => {
  if (!apiUrl) {
    // Variable de entorno VITE_API_URL no definida
    return { data: null, error: 'Configuración de API incompleta (VITE_API_URL).' };
  }
  if (!apiKey) {
    // Variable de entorno VITE_API_KEY no definida
    return { data: null, error: 'Configuración de API incompleta (VITE_API_KEY).' };
  }

  try {
    // Primer intento: endpoint plural
    let response = await fetch(`http://127.0.0.1:8000/conversations/${conversationId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": apiKey,
        "Accept": "application/json"
      }
    });

    // Si falla por 404/405, intentar con endpoint singular
    if (!response.ok && (response.status === 404 || response.status === 405)) {
      response = await fetch(`${apiUrl}conversation/${conversationId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Ocp-Apim-Subscription-Key": apiKey,
          "Accept": "application/json"
        }
      });
    }

    if (!response.ok) {
      let errorMsg = `Error al obtener la conversación: ${response.status} ${response.statusText}`;
      if (response.status === 401 || response.status === 403) {
        errorMsg = "Error de autenticación: La API KEY es incorrecta o no tiene permisos.";
      } else if (response.status === 404) {
        errorMsg = "Error: La conversación no existe.";
      }
      // Error en la respuesta de la API
      return { data: null, error: errorMsg };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error("Error de red o excepción al obtener la conversación:", error);
    return { data: null, error: error?.message || 'Fallo de red al obtener la conversación.' };
  }
};

/**
 * Actualiza el estado de un mensaje (leído, entregado, etc).
 * @param {string|number} messageId - El ID del mensaje.
 * @param {string} status - El nuevo estado ('read', 'delivered', 'sent').
 * @returns {Promise<object|null>} El mensaje actualizado o null si falla
 */
export const updateMessageStatus = async (messageId, status) => {
  if (!apiUrl) {
    // Variable de entorno VITE_API_URL no definida
    return null;
  }
  if (!apiKey) {
    // Variable de entorno VITE_API_KEY no definida
    return null;
  }

  try {
    const response = await fetch(`${apiUrl}messages/${messageId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": apiKey,
        "Accept": "application/json"
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        // Error de autenticación
      } else if (response.status === 404) {
        console.error("Error: El mensaje no existe.");
      } else {
        console.error(`Error al actualizar el estado del mensaje: ${response.status} ${response.statusText}`);
      }
      throw new Error(`Error al actualizar el estado del mensaje: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error de red o excepción al actualizar el estado del mensaje:", error);
    return null;
  }
};

/**
 * Marca todos los mensajes de una conversación como leídos.
 * @param {string|number} conversationId - El ID de la conversación.
 * @returns {Promise<boolean>} True si se actualizó correctamente, false si falla
 */
/**
 * Marca los mensajes de una conversación como leídos
 * @param {string|number} conversationId - ID de la conversación
 * @param {string} userId - ID del usuario actual
 * @returns {Promise<{ok: boolean, updated_count?: number, error?: string}>}
 */
export const markConversationAsRead = async (conversationId, userId) => {
  if (!apiUrl) {
    // Variable de entorno VITE_API_URL no definida
    return { ok: false, error: "Error de configuración: URL de API no definida" };
  }
  if (!apiKey) {
    // Variable de entorno VITE_API_KEY no definida
    return { ok: false, error: "Error de configuración: API KEY no definida" };
  }
  if (!userId) {
    console.error("Error: Se requiere el ID del usuario");
    return { ok: false, error: "Se requiere el ID del usuario" };
  }

  try {
    const response = await fetch(`http://127.0.0.1:8000/conversations/${conversationId}/read?user_id=${encodeURIComponent(userId)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": apiKey,
        "Accept": "application/json"
      }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      let errorMessage = `Error al marcar como leída la conversación: ${response.status} ${response.statusText}`;
      
      if (response.status === 400) {
        errorMessage = data.detail || 'Faltan parámetros requeridos';
      } else if (response.status === 401 || response.status === 403) {
        errorMessage = 'No tienes permiso para realizar esta acción';
      } else if (response.status === 404) {
        errorMessage = 'La conversación no existe';
      }
      
      console.error(errorMessage);
      return { ok: false, error: errorMessage };
    }

    return { ok: true, ...data };
  } catch (error) {
    console.error("Error de red o excepción al marcar como leída la conversación:", error);
    return { data: null, error: error?.message || 'Fallo de red al marcar como leída la conversación.' };
  }
};

/**
 * Obtiene el Perfíl del usuario actual.
 * @param {string} userid - ID único del usuario (email)
 * @returns {Promise<{data: object|null, error: string|null}>}
 */
export const fetchUserProfile = async (userid) => {
  if (!apiUrl || !apiKey) {
    console.error("Error: Variables de entorno de API no definidas.");
    return { data: null, error: 'Configuración de API incompleta.' };
  }

  try {
    const response = await fetch(`${apiUrl}profile/${userid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": apiKey,
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      const errorMsg = `Error al obtener el Perfíl: ${response.status} ${response.statusText}`;
      // Error en la respuesta de la API
      return { data: null, error: errorMsg };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: error?.message || 'Fallo de red al obtener el Perfíl.' };
  }
};

/**
 * Actualiza el Perfíl del usuario.
 * @param {object} profileData - Los nuevos datos del Perfíl.
{{ ... }}
 */
export const updateUserProfile = async (profileData, userid) => {
  if (!apiUrl || !apiKey) {
    console.error("Error: Variables de entorno de API no definidas.");
    return { data: null, error: 'Configuración de API incompleta.' };
  }

  try {
    const response = await fetch(`${apiUrl}profile/${userid}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": apiKey,
        "Accept": "application/json"
      },
      body: JSON.stringify(profileData)
    });

    if (!response.ok) {
      const errorMsg = `Error al actualizar el perfil: ${response.status} ${response.statusText}`;
      // Error en la respuesta de la API
      return { data: null, error: errorMsg };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: error?.message || 'Fallo de red al actualizar el perfil.' };
  }
};

/**
 * Actualiza el estado de búsqueda de roomie del usuario.
 * @param {boolean} isSearching - True si está buscando roomie, false si no.
 * @param {string} userid - ID único del usuario (email)
 * @returns {Promise<{data: object|null, error: string|null}>}
 */
export const updateSearchingStatus = async (isSearching, userid) => {
  if (!apiUrl || !apiKey) {
    console.error("Error: Variables de entorno de API no definidas.");
    return { data: null, error: 'Configuración de API incompleta.' };
  }

  try {
    const response = await fetch(`${apiUrl}profile/searching/${userid}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": apiKey,
        "Accept": "application/json"
      },
      body: JSON.stringify({ isSearching })
    });

    if (!response.ok) {
      const errorMsg = `Error al actualizar el estado de búsqueda: ${response.status} ${response.statusText}`;
      // Error en la respuesta de la API
      return { data: null, error: errorMsg };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: error?.message || 'Fallo de red al actualizar el estado de búsqueda.' };
  }
};

/**
 * Obtiene las propiedades del usuario actual.
 * @returns {Promise<{data: array, error: string|null}>}
 */
export const fetchUserProperties = async (userid) => {
  if (!apiUrl || !apiKey) {
    console.error("Error: Variables de entorno de API no definidas.");
    return { data: [], error: 'Configuración de API incompleta.' };
  }
  console.log("El valor de apiUrl es:", apiUrl); 
  try {
    const response = await fetch(`${apiUrl}properties/${userid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": apiKey,
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      const errorMsg = `Error al obtener las propiedades del usuario: ${response.status} ${response.statusText}`;
      // Error en la respuesta de la API
      return { data: [], error: errorMsg };
    }

    const data = await response.json();
    return { data: Array.isArray(data) ? data : [], error: null };
  } catch (error) {
    console.error(error);
    return { data: [], error: error?.message || 'Fallo de red al obtener las propiedades.' };
  }
};

//TO DO: asegurarse de que las apis que lo necesiten envien el id del usuario
//ejemplo: fetchUserProperties(userid); 

//TO DO: Reviasar las apis en azure 