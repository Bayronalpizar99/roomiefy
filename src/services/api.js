/**
 * Obtiene los datos de las propiedades desde la API de Azure.
 * AHORA SOPORTA FILTROS DEL LADO DEL SERVIDOR.
 */

const apiUrl = import.meta.env.VITE_API_URL;
const apiKey = import.meta.env.VITE_API_KEY;
const roomiesApiUrl = import.meta.env.VITE_ROOMIES_API_URL;

export const fetchProperties = async (options = {}) => {
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
      console.error(errorMsg);
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
    console.error("Error de red o excepción:", error);
    return { data: [], meta: null, error: error?.message || 'Fallo de red al obtener propiedades.' };
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
  const baseUrl = roomiesApiUrl || apiUrl;
  if (!baseUrl) {
    console.error("Error: No se definió la URL base para roomies (VITE_ROOMIES_API_URL o VITE_API_URL).");
    return { data: [], error: 'Configuración de API incompleta (VITE_ROOMIES_API_URL o VITE_API_URL).' };
  }

  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const usingAzureBackend = !roomiesApiUrl;

  if (usingAzureBackend && !apiKey) {
    console.error("Error: La variable de entorno VITE_API_KEY no está definida para consumir el backend de Azure.");
    return { data: [], error: 'Configuración de API incompleta (VITE_API_KEY).' };
  }

  try {
    // Construcción tolerante del query string con filtros y paginación
    const {
      page,
      pageSize,
      search,
      minBudget,
      maxBudget,
      minAge,
      maxAge,
      hasApartment,
      verified,
      minCleanliness,
      minSocial,
      interests,
      sort, // 'recent' | 'rating' | 'age' | 'budget'
    } = options || {};

    const params = new URLSearchParams();
    const appendIfDefined = (key, value) => {
      if (value === undefined || value === null || value === '') return;
      if ((key === 'minCleanliness' || key === 'minSocial') && value === 0) return;
      params.append(key, String(value));
    };

    appendIfDefined('page', page);
    appendIfDefined('pageSize', pageSize);
    appendIfDefined('search', search);
    // Solo enviar filtros de presupuesto y edad si NO son los valores por defecto
    // Valores por defecto: minBudget=100, maxBudget=2000, minAge=18, maxAge=99
    if (minBudget !== undefined && minBudget !== null && minBudget !== 100) {
      appendIfDefined('minBudget', minBudget);
    }
    if (maxBudget !== undefined && maxBudget !== null && maxBudget !== 2000) {
      appendIfDefined('maxBudget', maxBudget);
    }
    // No enviar minAge si es 18 (el valor mínimo por defecto)
    if (minAge !== undefined && minAge !== null && minAge !== 18) {
      appendIfDefined('minAge', minAge);
    }
    // No enviar maxAge si es 99 (el valor máximo por defecto)
    if (maxAge !== undefined && maxAge !== null && maxAge !== 99) {
      appendIfDefined('maxAge', maxAge);
    }
    // Solo enviar hasApartment si NO es 'any'
    if (hasApartment !== undefined && hasApartment !== null && hasApartment !== 'any') {
      const value = typeof hasApartment === 'string'
        ? (hasApartment === 'yes' ? 'true' : hasApartment === 'no' ? 'false' : '')
        : (hasApartment ? 'true' : 'false');
      if (value) params.append('hasApartment', value);
    }

    // Solo enviar verified si es true (no enviar false que es el default)
    if (verified === true) {
      params.append('verified', 'true');
    }
    
    // Solo enviar si son mayores a 0
    appendIfDefined('minCleanliness', minCleanliness);
    appendIfDefined('minSocial', minSocial);
    
    // Solo enviar intereses si hay alguno seleccionado
    if (interests && (Array.isArray(interests) || interests instanceof Set)) {
      const list = Array.from(interests);
      if (list.length > 0) params.append('interests', list.join(','));
    }

    // Solo enviar sort si no es 'recent' (el default)
    if (sort && sort !== 'recent') {
      appendIfDefined('sort', sort);
    }

    const url = apiUrl + 'roomies' + (params.toString() ? `?${params.toString()}` : '');

    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };

    if (usingAzureBackend && apiKey) {
      headers["Ocp-Apim-Subscription-Key"] = apiKey;
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorMsg = `Error al obtener los roommates: ${response.status} ${response.statusText}`;
      console.error(errorMsg);
      return { data: [], error: errorMsg };
    }

    // Intentar leer total desde headers (e.g., X-Total-Count) o desde el cuerpo JSON
    const totalHeader = response.headers.get('X-Total-Count') || response.headers.get('x-total-count');
    const body = await response.json();

    // Adaptación a la nueva estructura de respuesta del backend real
    // La respuesta tiene formato: { status: 200, body: { roomies: [...], total: X, page: Y, pageSize: Z, totalPages: W } }
    let items = [];
    let total = null;
    let currentPage = page;
    let currentPageSize = pageSize;
    let totalPages = null;

    if (body.status && body.body) {
      // Nuevo formato del backend real con wrapper
      items = body.body.roomies || [];
      total = body.body.total ?? null;
      currentPage = body.body.page ?? page;
      currentPageSize = body.body.pageSize ?? pageSize;
      totalPages = body.body.totalPages ?? null;
    } else if (body.roomies) {
      // Formato directo sin wrapper de status
      items = body.roomies || [];
      total = body.total ?? null;
      currentPage = body.page ?? page;
      currentPageSize = body.pageSize ?? pageSize;
      totalPages = body.totalPages ?? null;
    } else {
      // Fallback para otros formatos de respuesta
      items = Array.isArray(body)
        ? body
        : (body?.data ?? body?.items ?? []);

      total = totalHeader != null
        ? Number(totalHeader)
        : (body?.total ?? body?.totalCount ?? body?.meta?.total ?? null);
    }

    const meta = {
      total: total ?? null,
      page: currentPage ?? null,
      pageSize: currentPageSize ?? null,
      totalPages: totalPages ?? null
    };

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
  const baseUrl = roomiesApiUrl || apiUrl;
  if (!baseUrl) {
    console.error("Error: No se definió la URL base para roomies (VITE_ROOMIES_API_URL o VITE_API_URL).");
    return { data: null, error: 'Configuración de API incompleta (VITE_ROOMIES_API_URL o VITE_API_URL).' };
  }

  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const usingAzureBackend = !roomiesApiUrl;

  if (usingAzureBackend && !apiKey) {
    console.error("Error: La variable de entorno VITE_API_KEY no está definida para consumir el backend de Azure.");
    return { data: null, error: 'Configuración de API incompleta (VITE_API_KEY).' };
  }

  try {
    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };

    if (usingAzureBackend && apiKey) {
      headers["Ocp-Apim-Subscription-Key"] = apiKey;
    }

    const response = await fetch(`${normalizedBaseUrl}profile/${roomieId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorMsg = `Error al obtener el roomie: ${response.status} ${response.statusText}`;
      console.error(errorMsg);
      return { data: null, error: errorMsg };
    }

    const body = await response.json();

    const extractProfile = (payload) => {
      if (!payload) return null;
      if (payload.status && payload.body) {
        return payload.body.roomie || payload.body.profile || payload.body;
      }
      if (payload.data) return payload.data;
      return payload;
    };

    const profile = extractProfile(body);

    if (!profile) {
      return { data: null, error: 'Perfil vacío en la respuesta.' };
    }

    const toBoolean = (value) => {
      if (value === undefined || value === null) return undefined;
      if (typeof value === 'boolean') return value;
      const normalized = String(value).trim().toLowerCase();
      if (['si', 'sí', 'yes', 'true', '1'].includes(normalized)) return true;
      if (['no', 'false', '0'].includes(normalized)) return false;
      return undefined;
    };

    const toNumber = (value) => {
      if (value === undefined || value === null || value === '') return null;
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    };

    const toArray = (value) => {
      if (!value) return [];
      if (Array.isArray(value)) return value.filter(Boolean);
      return [value].filter(Boolean);
    };

    const presupuesto = toNumber(profile.presupuesto ?? profile.profileBudget);
    const rawBudget = profile.budget || {};
    const budgetMin = toNumber(rawBudget.min ?? presupuesto);
    const budgetMax = toNumber(rawBudget.max ?? rawBudget.min ?? presupuesto);
    const budget = budgetMin != null || budgetMax != null
      ? {
          min: budgetMin ?? budgetMax ?? null,
          max: budgetMax ?? budgetMin ?? null,
        }
      : null;

    const normalized = {
      id: profile.profileId || profile.user_id || profile.userId || roomieId,
      profileId: profile.profileId ?? null,
      userId: profile.user_id ?? profile.userId ?? null,
      name: profile.nombre ?? profile.name ?? '',
      age: toNumber(profile.edad ?? profile.age),
      avatar: profile.foto ?? profile.avatar ?? '',
      verified: profile.verified ?? false,
      reviews: profile.reviews ?? 0,
      rating: profile.rating ?? 0,
      hasApartment: toBoolean(profile.tieneApartamento ?? profile.hasApartment) ?? false,
      budget: budget ?? { min: presupuesto, max: presupuesto },
      profileBudget: presupuesto,
      bio: profile.descripcion ?? profile.bio ?? '',
      interests: toArray(profile.intereses ?? profile.interests),
      location: profile.ubicacion ?? profile.location ?? '',
      email: profile.email ?? '',
      occupation: profile.ocupacion ?? profile.occupation ?? '',
      socialLevel: toNumber(profile.nivelSocial ?? profile.socialLevel),
      cleanlinessLevel: toNumber(profile.nivelLimpieza ?? profile.cleanlinessLevel),
      acceptsSmokers: toBoolean(profile.aceptaFumadores ?? profile.acceptsSmokers) ?? false,
      acceptsPets: toBoolean(profile.aceptaMascotas ?? profile.acceptsPets) ?? false,
      acceptsGuests: toBoolean(profile.aceptaInvitados ?? profile.acceptsGuests) ?? false,
      languages: toArray(profile.idiomas ?? profile.languages),
      isSearching: toBoolean(profile.isSearching) ?? false,
      raw: profile,
    };

    return { data: normalized, error: null };
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
export const createRoomieProfile = async (formData, userId) => {
  // Crear un objeto con los datos del perfil
  const profileData = {};
  
  // Si es un FormData, convertirlo a objeto
  if (formData instanceof FormData) {
    formData.forEach((value, key) => {
      // Manejar los campos que son JSON stringified
      if (key === 'intereses' || key === 'idiomas') {
        try {
          profileData[key] = JSON.parse(value);
        } catch (e) {
          profileData[key] = value;
        }
      } else {
        profileData[key] = value;
      }
    });
  } else {
    // Si ya es un objeto, copiarlo directamente
    Object.assign(profileData, formData);
  }
  
  // Asegurarse de que el user_id esté incluido
  if (userId) {
    profileData.user_id = userId;
  }

  const response = await fetch(apiUrl + 'profile', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": apiKey,
      "Accept": "application/json"
    },
    body: JSON.stringify(profileData),
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
    const response = await fetch(`${apiUrl}properties/${propertyId}`, {
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
    return { data: null, error: error?.message || 'Fallo de red al marcar como leída la conversación.' };
  }
};

/**
 * Obtiene el Perfíl del usuario actual.
 * @param {string} userId - ID único del usuario (opcional, si no se proporciona, se obtendrá del contexto de autenticación)
 * @returns {Promise<{data: object|null, error: string|null}>}
 */
export const fetchUserProfile = async (userId = null) => {
  if (!apiUrl || !apiKey) {
    console.error("Error: Variables de entorno de API no definidas.");
    return { data: null, error: 'Configuración de API incompleta.' };
  }

  // Si no se proporciona un userId, intentamos obtenerlo del contexto de autenticación
  if (!userId && typeof window !== 'undefined' && window._authContext) {
    const { user } = window._authContext;
    if (user && user.id) {
      userId = user.id;
    }
  }

  if (!userId) {
    console.error("Error: No se proporcionó un ID de usuario y no se pudo obtener del contexto de autenticación.");
    return { data: null, error: 'ID de usuario no disponible.' };
  }

  try {
    const response = await fetch(`http://localhost:3000/profile/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": apiKey,
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      const errorMsg = `Error al obtener el Perfíl: ${response.status} ${response.statusText}`;
      console.error(errorMsg);
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
 * @param {string} userId - ID único del usuario (Google ID)
 * @returns {Promise<{data: object|null, error: string|null}>}
 */
export const updateUserProfile = async (profileData, userId) => {
  if (!apiUrl || !apiKey) {
    console.error("Error: Variables de entorno de API no definidas.");
    return { data: null, error: 'Configuración de API incompleta.' };
  }

  try {
    const response = await fetch(`http://localhost:3000/profile/${userId}`, {
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
 * @param {string} userId - ID único del usuario (Google ID)
 * @returns {Promise<{data: object|null, error: string|null}>}
 */
export const updateSearchingStatus = async (isSearching, userId) => {
  if (!apiUrl || !apiKey) {
    console.error("Error: Variables de entorno de API no definidas.");
    return { data: null, error: 'Configuración de API incompleta.' };
  }

  try {
    const response = await fetch(`http://localhost:3000/profile/searching/${userId}`, {
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
export const fetchUserProperties = async (userid) => {
  if (!apiUrl || !apiKey) {
    console.error("Error: Variables de entorno de API no definidas.");
    return { data: [], error: 'Configuración de API incompleta.' };
  }
  console.log("El valor de apiUrl es:", apiUrl); 
  try {
    const response = await fetch(`${apiUrl}properties/my-properties/${userid}`, {
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

export const loginWithGoogle = async (idToken) => {
  const response = await fetch(`${apiUrl}auth/google/login`, { 
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      "Ocp-Apim-Subscription-Key": apiKey
    },
    body: JSON.stringify({ idToken: idToken }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error en el inicio de sesión');
  }

  return await response.json(); // Devuelve { accessToken, user }
};