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