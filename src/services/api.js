/**
 * Obtiene los datos de las propiedades.
 * MODIFICADO: Esta función ahora apunta a Azure API Management.
 */

// --- URLs Y CLAVES ---
// Apunta al backend local de Spring Boot (ya no se usa en esta función)
// Apunta a Azure API Management para todas las demás funciones
const apiUrl = import.meta.env.VITE_API_URL;
const apiKey = import.meta.env.VITE_API_KEY;
const messagingApiUrl = import.meta.env.VITE_MESSAGING_API_URL || apiUrl;

const normalizeBaseUrl = (url) => {
  if (!url) return null;
  return url.endsWith('/') ? url : `${url}/`;
};

const messagingBaseUrl = normalizeBaseUrl(messagingApiUrl);

// --- FIN URLs Y CLAVES ---

export const fetchProperties = async (options = {}) => {
  if (!apiUrl || !apiKey) {
    console.error("Error: VITE_API_URL o VITE_API_KEY no están definidas.");
    return { data: [], error: 'Configuración de API incompleta (VITE_API_URL o VITE_API_KEY).' };
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

    const normalizeNumber = (value, fallback) => {
      if (value === undefined || value === null || value === '') return fallback;
      const parsed = Number(value);
      if (!Number.isFinite(parsed)) return fallback;
      return parsed;
    };

    let normalizedPage = normalizeNumber(page, 0);
    if (normalizedPage < 0) normalizedPage = 0;

    let normalizedSize = normalizeNumber(pageSize, 100);
    if (normalizedSize <= 0) normalizedSize = 100;
    if (normalizedSize > 500) normalizedSize = 500; // evita pedir páginas enormes por error

    const params = new URLSearchParams();
    const appendIfDefined = (key, value) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    };

    appendIfDefined('search', search);
    // Solo agregar priceMax si price no es null y es un número válido
    if (price !== null && price !== undefined && price !== '' && Number.isFinite(Number(price))) {
      params.append('priceMax', String(price));
    }

    if (bedrooms && bedrooms !== 'any') {
      appendIfDefined('bedrooms', bedrooms);
    }

    if (amenities && amenities.size > 0) {
      params.append('amenities', Array.from(amenities).join(','));
    }

    appendIfDefined('sort', sort);
    params.append('page', String(normalizedPage));
    params.append('size', String(normalizedSize));

    const url = apiUrl + '/properties' + (params.toString() ? `?${params.toString()}` : '');

    console.log('📡 [fetchProperties] URL:', url);
    console.log('📋 [fetchProperties] Parámetros:', params.toString());

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
      if (response.status === 404) {
        errorMsg = "Error: La URL de la API no es válida o el recurso no existe. (Revisa la URL)";
      }
      return { data: [], meta: null, error: errorMsg };
    }

    const body = await response.json();
    const totalHeader = response.headers.get('X-Total-Count');

    let items = [];
    let total = totalHeader != null ? Number(totalHeader) : null;
    let currentPage = normalizedPage;
    let currentSize = normalizedSize;
    let totalPages = null;

    if (Array.isArray(body)) {
      items = body;
      if (total == null) {
        total = body.length;
      }
    } else if (Array.isArray(body?.content)) {
      items = body.content;
      total = body.totalElements ?? body.total ?? total;
      totalPages = body.totalPages ?? body.total_pages ?? null;
      currentPage = body.number ?? body.page ?? currentPage;
      currentSize = body.size ?? body.pageSize ?? currentSize;
    } else {
      items = body?.data ?? body?.items ?? body?.properties ?? [];
      if (!Array.isArray(items)) {
        items = [];
      }
      if (total == null) {
        total = body?.total ?? body?.totalCount ?? body?.meta?.total ?? null;
      }
      if (body?.meta) {
        if (body.meta.page !== undefined) currentPage = body.meta.page;
        if (body.meta.pageSize !== undefined) currentSize = body.meta.pageSize;
        if (body.meta.totalPages !== undefined) totalPages = body.meta.totalPages;
      }
    }

    const meta = {
      total,
      page: currentPage,
      pageSize: currentSize,
      totalPages
    };

    console.log('📥 [fetchProperties] Respuesta del backend:', {
      totalItems: items.length,
      total: total,
      firstItemId: items[0]?.id,
      firstItemName: items[0]?.name
    });

    // (La lógica de procesamiento de amenities se queda igual)
    const processedItems = items.map(item => ({
      ...item,
      amenities: typeof item.amenities === 'string'
        ? item.amenities.split(',').map(a => a.trim())
        : (item.amenities || [])
    }));

    return { data: processedItems, meta, error: null };
  } catch (error) {
    // Error de red o excepción
    return { data: [], meta: null, error: error?.message || 'Fallo de red al obtener propiedades.' };
  }
};


/**
 * Obtiene las conversaciones del usuario desde la API.
 */
export const fetchConversations = async (userId) => {
  if (!apiUrl) {
    // Variable de entorno VITE_API_URL no definida
    return { data: [], error: 'Configuración de API incompleta (VITE_API_URL).' };
  }
  if (!apiKey) {
    // Variable de entorno VITE_API_KEY no definida
    return { data: [], error: 'Configuración de API incompleta (VITE_API_KEY).' };
  }
  if (!userId) {
    console.error("Error: fetchConversations requiere un userId para consultar el backend.");
    return { data: [], error: 'ID de usuario no proporcionado.' };
  }
  if (!messagingBaseUrl) {
    console.error("Error: VITE_MESSAGING_API_URL no está definida y no se puede reutilizar VITE_API_URL.");
    return { data: [], error: 'Configuración de API de mensajería incompleta.' };
  }

  const params = new URLSearchParams({ userId: String(userId) }).toString();

  try {
    const response = await fetch(`${messagingBaseUrl}conversations?${params}`, {
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
  const baseUrl = apiUrl;
  if (!baseUrl) {
    console.error("Error: No se definió la URL base para roomies (VITE_ROOMIES_API_URL o VITE_API_URL).");
    return { data: [], error: 'Configuración de API incompleta (VITE_ROOMIES_API_URL o VITE_API_URL).' };
  }

  if (!apiKey) {
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

    if (apiKey) {
      headers["Ocp-Apim-Subscription-Key"] = apiKey;
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorMsg = `Error al obtener los roommates: ${response.status} ${response.statusText}`;
      // Error en la respuesta de la API
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
  const baseUrl = apiUrl;
  if (!baseUrl) {
    console.error("Error: No se definió la URL base para roomies (VITE_ROOMIES_API_URL o VITE_API_URL).");
    return { data: null, error: 'Configuración de API incompleta (VITE_ROOMIES_API_URL o VITE_API_URL).' };
  }

  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  if (!apiKey) {
    console.error("Error: La variable de entorno VITE_API_KEY no está definida para consumir el backend de Azure.");
    return { data: null, error: 'Configuración de API incompleta (VITE_API_KEY).' };
  }

  try {
    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };

    if (apiKey) {
      headers["Ocp-Apim-Subscription-Key"] = apiKey;
    }

    const response = await fetch(`${normalizedBaseUrl}profile/${roomieId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorMsg = `Error al obtener el roomie: ${response.status} ${response.statusText}`;
      // Error en la respuesta de la API
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
export const sendMessage = async (conversationId, content, senderId) => {
  if (!apiUrl) {
    // Variable de entorno VITE_API_URL no definida
    return null;
  }
  if (!apiKey) {
    // Variable de entorno VITE_API_KEY no definida
    return null;
  }

  if (!messagingBaseUrl) {
    console.error("Error: La variable de entorno VITE_MESSAGING_API_URL no está definida.");
    return null;
  }
  if (!senderId) {
    console.error("Error: Se requiere el ID del remitente para enviar mensajes.");
    return null;
  }

  try {
    const response = await fetch(`${messagingBaseUrl}conversations/${conversationId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": apiKey,
        "Accept": "application/json"
      },
      body: JSON.stringify({ content, sender_id: senderId })
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

/**
 * Crea una nueva propiedad enviando los datos a la API.
 * MODIFICADO: Esta función ahora apunta a Azure API Management (apiUrl)
 * y requiere un token de autenticación.
 * @param {object} propertyData - Los datos de la propiedad a crear.
 * @param {string} accessToken - El token JWT del usuario (de useAuth).
 * @returns {Promise<object>} La propiedad creada (respuesta del backend).
 */
export const createProperty = async (propertyData, accessToken) => {
  // 1. Verificamos la URL de APIM, la API Key y el Token
  if (!apiUrl || !apiKey) {
    console.error("Error: VITE_API_URL o VITE_API_KEY no están definidas.");
    throw new Error("La configuración de la API no está completa.");
  }
  if (!accessToken) {
    console.error("Error: Se requiere un token de acceso para crear una propiedad.");
    throw new Error("Autenticación requerida.");
  }

  try {
    console.log('📤 [createProperty] Enviando request a:', `${apiUrl}/properties`);
    console.log('📦 [createProperty] Payload:', JSON.stringify(propertyData, null, 2));

    // 2. Usamos la URL de APIM
    // Asumimos que la operación POST es /properties
    const response = await fetch(`${apiUrl}/properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 3. AÑADIMOS la API Key de APIM
        'Ocp-Apim-Subscription-Key': apiKey,
        // 4. AÑADIMOS el token de autorización para el backend
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(propertyData),
    });

    console.log('📥 [createProperty] Respuesta recibida:', response.status, response.statusText);

    if (!response.ok) {
      // Si la respuesta no es 2xx (ej. 401, 403, 500)
      const errorText = await response.text();
      console.error('❌ [createProperty] Error del servidor:', response.status, errorText);
      throw new Error(`Error al crear la propiedad: ${response.status} ${errorText}`);
    }

    // Si la respuesta es 201 (Created) o 200 (OK)
    const responseData = await response.json();
    console.log('✅ [createProperty] Propiedad creada exitosamente:', responseData);
    return responseData;

  } catch (error) {
    console.error("❌ [createProperty] Excepción al crear la propiedad:", error);
    throw error; // Re-lanzamos el error
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
 * Elimina una propiedad por su ID.
 * MODIFICADO: Esta función ahora apunta a Azure API Management (apiUrl)
 * y requiere un token de autenticación.
 * @param {string | number} propertyId - El ID de la propiedad a eliminar.
 * @param {string} accessToken - El token JWT del usuario (de useAuth).
 */
export const deleteProperty = async (propertyId, accessToken) => {
  // 1. Verificamos la URL de APIM, la API Key y el Token
  if (!apiUrl || !apiKey) {
    console.error("Error: VITE_API_URL o VITE_API_KEY no están definidas.");
    throw new Error("La configuración de la API no está completa.");
  }
  if (!accessToken) {
    console.error("Error: Se requiere un token de acceso para eliminar una propiedad.");
    throw new Error("Autenticación requerida.");
  }

  try {
    // 2. Usamos la URL de APIM y el ID
    const response = await fetch(`${apiUrl}/properties/${propertyId}`, {
      method: 'DELETE', // 👈 3. Usamos el método DELETE
      headers: {
        // 4. AÑADIMOS la API Key de APIM
        'Ocp-Apim-Subscription-Key': apiKey,
        // 5. AÑADIMOS el token de autorización para el backend
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    // 6. Un 'DELETE' exitoso usualmente devuelve 204 No Content
    if (!response.ok) {
      // Si la respuesta no es 2xx (ej. 401, 403, 404)
      const errorText = await response.text();
      throw new Error(`Error al eliminar la propiedad: ${response.status} ${errorText}`);
    }

    // Si la respuesta es 204 (No Content) o 200 (OK)
    return { success: true };

  } catch (error) {
    console.error("Excepción al eliminar la propiedad:", error);
    throw error; // Re-lanzamos el error
  }
};

/**
 * Actualiza una propiedad existente.
 * MODIFICADO: Esta función ahora apunta a Azure API Management (apiUrl)
 * y requiere un token de autenticación.
 * @param {string|number} propertyId - El ID de la propiedad a modificar.
 * @param {object} propertyData - Los nuevos datos de la propiedad.
 * @param {string} accessToken - El token JWT del usuario (de useAuth).
 * @returns {Promise<object>} La propiedad actualizada (respuesta del backend).
 */
export const updateProperty = async (propertyId, propertyData, accessToken) => {
  // 1. Verificamos la URL de APIM, la API Key y el Token
  if (!apiUrl || !apiKey) {
    console.error("Error: VITE_API_URL o VITE_API_KEY no están definidas.");
    throw new Error("La configuración de la API no está completa.");
  }
  if (!accessToken) {
    console.error("Error: Se requiere un token de acceso para actualizar una propiedad.");
    throw new Error("Autenticación requerida.");
  }

  try {
    // 2. Usamos la URL de APIM, el ID y el método PUT
    const response = await fetch(`${apiUrl}/properties/${propertyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // 3. AÑADIMOS la API Key de APIM
        'Ocp-Apim-Subscription-Key': apiKey,
        // 4. AÑADIMOS el token de autorización para el backend
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(propertyData), // 5. Enviamos los nuevos datos
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error updating property: ${response.status} ${errorText}`);
    }

    // El backend devuelve la propiedad actualizada
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
 * @param {string|number} participantId - El ID del usuario con el que crear la conversación.
 * @param {string} currentUserId - El ID del usuario actual.
 * @param {string} initialMessage - El mensaje inicial para la conversación.
 * @returns {Promise<object>} Objeto con la respuesta o información de error
 */
export const createConversation = async (participantId, currentUserId, initialMessage = '') => {
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

  if (!messagingBaseUrl) {
    console.error("Error: La variable de entorno VITE_MESSAGING_API_URL no está definida.");
    return { error: "Error de configuración: URL de mensajería no definida." };
  }

  try {
    const conversationData = {
      participantId,
      currentUserId,
      initialMessage: initialMessage
    };

    const response = await fetch(`${messagingBaseUrl}conversations`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': apiKey,
        'Accept': 'application/json'
      },
      body: JSON.stringify(conversationData)
    });

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

  if (!messagingBaseUrl) {
    console.error("Error: La variable de entorno VITE_MESSAGING_API_URL no está definida.");
    return { data: null, error: 'Configuración de API de mensajería incompleta.' };
  }

  try {
    const response = await fetch(`${messagingBaseUrl}conversations/${conversationId}/messages`, {
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

  if (!messagingBaseUrl) {
    console.error("Error: La variable de entorno VITE_MESSAGING_API_URL no está definida.");
    return { data: null, error: 'Configuración de API de mensajería incompleta.' };
  }

  try {
    // Primer intento: endpoint plural
    let response = await fetch(`${messagingBaseUrl}conversations/${conversationId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": apiKey,
        "Accept": "application/json"
      }
    });

    // Si falla por 404/405, intentar con endpoint singular
    if (!response.ok && (response.status === 404 || response.status === 405)) {
      response = await fetch(`${messagingBaseUrl}conversation/${conversationId}`, {
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

  if (!messagingBaseUrl) {
    console.error("Error: La variable de entorno VITE_MESSAGING_API_URL no está definida.");
    return null;
  }

  try {
    const response = await fetch(`${messagingBaseUrl}messages/${messageId}/status`, {
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

  if (!messagingBaseUrl) {
    console.error("Error: La variable de entorno VITE_MESSAGING_API_URL no está definida.");
    return { ok: false, error: "Error de configuración: URL de mensajería no definida." };
  }

  try {
    const params = new URLSearchParams({ user_id: String(userId) }).toString();
    const response = await fetch(`${messagingBaseUrl}conversations/${conversationId}/read?${params}`, {
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
    const response = await fetch(`${apiUrl}profile/profile/${userId}`, {
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
 * @param {string} userId - ID único del usuario (Google ID)
 * @returns {Promise<{data: object|null, error: string|null}>}
 */
export const updateUserProfile = async (profileData, userId) => {
  if (!apiUrl || !apiKey) {
    console.error("Error: Variables de entorno de API no definidas.");
    return { data: null, error: 'Configuración de API incompleta.' };
  }

  try {
    const response = await fetch(`${apiUrl}profile/profile/${userId}`, {
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
 * @param {string} userId - ID único del usuario (Google ID)
 * @returns {Promise<{data: object|null, error: string|null}>}
 */
export const updateSearchingStatus = async (isSearching, userId) => {
  if (!apiUrl || !apiKey) {
    console.error("Error: Variables de entorno de API no definidas.");
    return { data: null, error: 'Configuración de API incompleta.' };
  }

  try {
    const response = await fetch(`${apiUrl}profile/profile/searching/${userId}`, {
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
 * MODIFICADO: Esta función ahora apunta a Azure API Management (apiUrl)
 * @returns {Promise<{data: array, error: string|null}>}
 */
export const fetchUserProperties = async (userid) => {
  // 1. Verificamos la URL de APIM y la API Key
  if (!apiUrl || !apiKey) {
    console.error("Error: VITE_API_URL o VITE_API_KEY no están definidas.");
    return { data: [], error: 'Configuración de API incompleta.' };
  }

  // Pequeña verificación extra
  if (!userid) {
    console.error("Error: Se requiere un ID de usuario para fetchUserProperties.");
    return { data: [], error: 'ID de usuario no proporcionado.' };
  }

  try {
    // 2. Usamos apiUrl (APIM)
    // Asumimos que VITE_API_URL es la base (ej. https://apimanagementsam.azure-api.net)
    // y que tu operación en APIM es /properties/my-properties/{userid}
    const response = await fetch(`${apiUrl}/properties/my-properties/${userid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // 3. AÑADIMOS LA API KEY para Azure API Management
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
    const items = Array.isArray(data) ? data : [];

    // 4. El procesamiento de amenities se mantiene (es correcto)
    const processedItems = items.map(item => ({
      ...item,
      amenities: typeof item.amenities === 'string'
        ? item.amenities.split(',').map(a => a.trim())
        : (item.amenities || [])
    }));

    return { data: processedItems, error: null };
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
