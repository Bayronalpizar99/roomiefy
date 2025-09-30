/**
 * Obtiene los datos de las propiedades desde la API de Azure.
 */

const apiUrl = import.meta.env.VITE_API_URL;
const apiKey = import.meta.env.VITE_API_KEY;

export const fetchProperties = async () => {
  // Verificación para asegurar que las variables de entorno están cargadas
  if (!apiUrl) {
    console.error("Error: La variable de entorno VITE_API_URL no está definida.");
    return { data: [], error: 'Configuración de API incompleta (VITE_API_URL).' };
  }
  if (!apiKey) {
    console.error("Error: La variable de entorno VITE_API_KEY no está definida.");
    return { data: [], error: 'Configuración de API incompleta (VITE_API_KEY).' };
  }

  try {
    const response = await fetch(apiUrl + 'properties', {
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
      console.error(errorMsg);
      return { data: [], error: errorMsg };
    }

    const data = await response.json();
    // --- CAMBIO CLAVE ---
    // Ahora la función devuelve un objeto con la data y el error
    return { data, error: null }; 
  } catch (error) {
    console.error("Error de red o excepción:", error);
    return { data: [], error: error?.message || 'Fallo de red al obtener propiedades.' };
  }
};

/**
 * Obtiene las conversaciones del usuario desde la API.
 */
export const fetchConversations = async () => {
  if (!apiUrl) {
    console.error("Error: La variable de entorno VITE_API_URL no está definida.");
    return { data: [], error: 'Configuración de API incompleta (VITE_API_URL).' };
  }
  if (!apiKey) {
    console.error("Error: La variable de entorno VITE_API_KEY no está definida.");
    return { data: [], error: 'Configuración de API incompleta (VITE_API_KEY).' };
  }

  try {
    const response = await fetch(apiUrl + 'conversations', {
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
      console.error(errorMsg);
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
      console.error(errorMsg);
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
      console.error(errorMsg);
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
export const sendMessage = async (conversationId, content) => {
  if (!apiUrl) {
    console.error("Error: La variable de entorno VITE_API_URL no está definida.");
    return null;
  }
  if (!apiKey) {
    console.error("Error: La variable de entorno VITE_API_KEY no está definida.");
    return null;
  }

  try {
    const response = await fetch(`${apiUrl}conversations/${conversationId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": apiKey,
        "Accept": "application/json"
      },
      body: JSON.stringify({ content })
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        console.error("Error de autenticación: La API KEY es incorrecta o no tiene permisos.");
      } else if (response.status === 404) {
        console.error("Error: La URL de la API no es válida o el recurso no existe.");
      } else {
        console.error(`Error al enviar el mensaje: ${response.status} ${response.statusText}`);
      }
      throw new Error(`Error al enviar el mensaje: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error de red o excepción al enviar el mensaje:", error);
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
    const response = await fetch(`${apiUrl}/properties`, {
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

  const response = await fetch(apiUrl + 'roomies', {
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
 * @returns {Promise<object|null>} La conversación creada o null si falla
 */
export const createConversation = async (userId, initialMessage = '') => {
  if (!apiUrl) {
    console.error("Error: La variable de entorno VITE_API_URL no está definida.");
    return null;
  }
  if (!apiKey) {
    console.error("Error: La variable de entorno VITE_API_KEY no está definida.");
    return null;
  }

  try {
    const conversationData = {
      participantId: userId,
      initialMessage: initialMessage
    };

    const response = await fetch(`${apiUrl}conversations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": apiKey,
        "Accept": "application/json"
      },
      body: JSON.stringify(conversationData)
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        console.error("Error de autenticación: La API KEY es incorrecta o no tiene permisos.");
      } else if (response.status === 404) {
        console.error("Error: La URL de la API no es válida o el recurso no existe.");
      } else {
        console.error(`Error al crear la conversación: ${response.status} ${response.statusText}`);
      }
      throw new Error(`Error al crear la conversación: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error de red o excepción al crear la conversación:", error);
    return null;
  }
};
/**
 * Obtiene los mensajes de una conversación específica.
 * @param {string|number} conversationId - El ID de la conversación.
 * @returns {Promise<Array|null>} Lista de mensajes o null si falla
 */
export const fetchMessages = async (conversationId) => {
  if (!apiUrl) {
    console.error("Error: La variable de entorno VITE_API_URL no está definida.");
    return { data: null, error: 'Configuración de API incompleta (VITE_API_URL).' };
  }
  if (!apiKey) {
    console.error("Error: La variable de entorno VITE_API_KEY no está definida.");
    return { data: null, error: 'Configuración de API incompleta (VITE_API_KEY).' };
  }

  try {
    const response = await fetch(`${apiUrl}conversations/${conversationId}/messages`, {
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
      console.error(errorMsg);
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
    console.error("Error: La variable de entorno VITE_API_URL no está definida.");
    return { data: null, error: 'Configuración de API incompleta (VITE_API_URL).' };
  }
  if (!apiKey) {
    console.error("Error: La variable de entorno VITE_API_KEY no está definida.");
    return { data: null, error: 'Configuración de API incompleta (VITE_API_KEY).' };
  }

  try {
    // Primer intento: endpoint plural
    let response = await fetch(`${apiUrl}conversations/${conversationId}`, {
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
      console.error(errorMsg);
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
    console.error("Error: La variable de entorno VITE_API_URL no está definida.");
    return null;
  }
  if (!apiKey) {
    console.error("Error: La variable de entorno VITE_API_KEY no está definida.");
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
        console.error("Error de autenticación: La API KEY es incorrecta o no tiene permisos.");
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
export const markConversationAsRead = async (conversationId) => {
  if (!apiUrl) {
    console.error("Error: La variable de entorno VITE_API_URL no está definida.");
    return false;
  }
  if (!apiKey) {
    console.error("Error: La variable de entorno VITE_API_KEY no está definida.");
    return false;
  }

  try {
    const response = await fetch(`${apiUrl}conversations/${conversationId}/read`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": apiKey,
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        console.error("Error de autenticación: La API KEY es incorrecta o no tiene permisos.");
      } else if (response.status === 404) {
        console.error("Error: La conversación no existe.");
      } else {
        console.error(`Error al marcar como leída la conversación: ${response.status} ${response.statusText}`);
      }
      throw new Error(`Error al marcar como leída la conversación: ${response.status} ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error("Error de red o excepción al marcar como leída la conversación:", error);
    return false;
  }
};

/**
 * Obtiene el perfil del usuario actual.
 * @returns {Promise<{data: object|null, error: string|null}>}
 */
export const fetchUserProfile = async () => {
  if (!apiUrl || !apiKey) {
    console.error("Error: Variables de entorno de API no definidas.");
    return { data: null, error: 'Configuración de API incompleta.' };
  }

  try {
    const response = await fetch(`${apiUrl}profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": apiKey,
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      const errorMsg = `Error al obtener el perfil: ${response.status} ${response.statusText}`;
      console.error(errorMsg);
      return { data: null, error: errorMsg };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: error?.message || 'Fallo de red al obtener el perfil.' };
  }
};

/**
 * Actualiza el perfil del usuario.
 * @param {object} profileData - Los nuevos datos del perfil.
 * @returns {Promise<{data: object|null, error: string|null}>}
 */
export const updateUserProfile = async (profileData) => {
  if (!apiUrl || !apiKey) {
    console.error("Error: Variables de entorno de API no definidas.");
    return { data: null, error: 'Configuración de API incompleta.' };
  }

  try {
    const response = await fetch(`${apiUrl}profile`, {
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
      console.error(errorMsg);
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
 * @returns {Promise<{data: object|null, error: string|null}>}
 */
export const updateSearchingStatus = async (isSearching) => {
  if (!apiUrl || !apiKey) {
    console.error("Error: Variables de entorno de API no definidas.");
    return { data: null, error: 'Configuración de API incompleta.' };
  }

  try {
    const response = await fetch(`${apiUrl}profile/searching`, {
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
      console.error(errorMsg);
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
export const fetchUserProperties = async () => {
  if (!apiUrl || !apiKey) {
    console.error("Error: Variables de entorno de API no definidas.");
    return { data: [], error: 'Configuración de API incompleta.' };
  }

  try {
    const response = await fetch(`${apiUrl}properties/user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": apiKey,
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      const errorMsg = `Error al obtener las propiedades del usuario: ${response.status} ${response.statusText}`;
      console.error(errorMsg);
      return { data: [], error: errorMsg };
    }

    const data = await response.json();
    return { data: Array.isArray(data) ? data : [], error: null };
  } catch (error) {
    console.error(error);
    return { data: [], error: error?.message || 'Fallo de red al obtener las propiedades.' };
  }
};