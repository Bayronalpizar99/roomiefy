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
  const apiUrl = import.meta.env.VITE_API_URL;
  const apiKey = import.meta.env.VITE_API_KEY;

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
    const response = await fetch(apiUrl + '/conversations', {
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
    
    // Para desarrollo, devolvemos datos de ejemplo si la API no está disponible
    if (import.meta.env.DEV) {
      console.warn("Usando datos de ejemplo para conversaciones en modo desarrollo");
      return [
        {
          id: '1',
          name: 'Juan Pérez',
          avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
          lastMessage: '¿Está disponible el apartamento?',
          lastMessageTime: '10:30 AM',
          messages: [
            { id: '1', content: 'Hola, me interesa el apartamento que publicaste', sender: 'other', time: '10:25 AM' },
            { id: '2', content: '¿Está disponible el apartamento?', sender: 'other', time: '10:30 AM' },
          ]
        },
        {
          id: '2',
          name: 'María López',
          avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
          lastMessage: 'Gracias por la información',
          lastMessageTime: 'Ayer',
          messages: [
            { id: '1', content: 'Hola, ¿cuánto es el depósito?', sender: 'other', time: 'Ayer 15:40 PM' },
            { id: '2', content: 'El depósito es equivalente a un mes de renta', sender: 'me', time: 'Ayer 16:05 PM' },
            { id: '3', content: 'Gracias por la información', sender: 'other', time: 'Ayer 16:10 PM' },
          ]
        },
        {
          id: '3',
          name: 'Carlos Rodríguez',
          avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
          lastMessage: '¿Podemos agendar una visita?',
          lastMessageTime: '2 días',
          messages: [
            { id: '1', content: 'Me interesa el apartamento en la zona norte', sender: 'other', time: '2 días 09:15 AM' },
            { id: '2', content: 'Claro, está disponible para visitas', sender: 'me', time: '2 días 10:20 AM' },
            { id: '3', content: '¿Podemos agendar una visita?', sender: 'other', time: '2 días 11:45 AM' },
          ]
        }
      ];
    }
    
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