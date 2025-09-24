/**
 * Obtiene los datos de las propiedades desde la API de Azure.
 */

const apiUrl = import.meta.env.VITE_API_URL;
const apiKey = import.meta.env.VITE_API_KEY;

export const fetchProperties = async () => {


  // Verificación para asegurar que las variables de entorno están cargadas
  if (!apiUrl) {
    console.error("Error: La variable de entorno VITE_API_URL no está definida.");
    return [];
  }
  if (!apiKey) {
    console.error("Error: La variable de entorno VITE_API_KEY no está definida.");
    return [];
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
      // Mensaje de error más detallado según el código de estado
      if (response.status === 401 || response.status === 403) {
        console.error("Error de autenticación: La API KEY es incorrecta o no tiene permisos.");
      } else if (response.status === 404) {
        console.error("Error: La URL de la API no es válida o el recurso no existe.");
      } else {
        console.error(`Error al obtener las propiedades: ${response.status} ${response.statusText}`);
      }
      throw new Error(`Error al obtener las propiedades: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Captura errores de red (ej. sin conexión) o el error lanzado arriba.
    console.error("Error de red o excepción:", error);
    return []; // Devuelve un array vacío para que la UI no se rompa.
  }
};

/**
 * Obtiene las conversaciones del usuario desde la API.
 */
export const fetchConversations = async () => {

  // Verificación para asegurar que las variables de entorno están cargadas
  if (!apiUrl) {
    console.error("Error: La variable de entorno VITE_API_URL no está definida.");
    return [];
  }
  if (!apiKey) {
    console.error("Error: La variable de entorno VITE_API_KEY no está definida.");
    return [];
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
      if (response.status === 401 || response.status === 403) {
        console.error("Error de autenticación: La API KEY es incorrecta o no tiene permisos.");
      } else if (response.status === 404) {
        console.error("Error: La URL de la API no es válida o el recurso no existe.");
      } else {
        console.error(`Error al obtener las conversaciones: ${response.status} ${response.statusText}`);
      }
      throw new Error(`Error al obtener las conversaciones: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error de red o excepción:", error);

    return []; // Devuelve un array vacío para que la UI no se rompa.
  }
};

export const fetchRoommates = async () => {
  // Verificación para asegurar que las variables de entorno están cargadas
  if (!apiUrl || !apiKey) {
    console.error("Error: Las variables de entorno VITE_API_URL o VITE_API_KEY no están definidas.");
    return [];
  }

  try {
    const response = await fetch(apiUrl + 'roomies', {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": apiKey,
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Error al obtener los roommates: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Retornar data directamente, asumimos que la API devuelve un array
    return data;
  } catch (error) {
    console.error(error);
    return []; // Devuelve un array vacío si falla
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