/**
 * Obtiene los datos de las propiedades desde la API de Azure.
 */

const apiUrl = import.meta.env.VITE_API_URL;
const apiKey = import.meta.env.VITE_API_KEY;

export const fetchProperties = async () => {

  // Verificación para asegurar que las variables de entorno están cargadas
  if (!apiUrl || !apiKey) {
    console.error("Error: Las variables de entorno VITE_API_URL o VITE_API_KEY no están definidas.");
    return [];
  }

  try {

      const response = await fetch(apiUrl + 'properties', {

      method: "GET",
      headers: {
        // Estos encabezados son específicos de tu API, así que los mantenemos.
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": apiKey,
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      // Si la respuesta del servidor no es exitosa (ej. 401, 404, 500)
      throw new Error(`Error al obtener las propiedades: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Captura errores de red (ej. sin conexión) o el error lanzado arriba.
    console.error(error);
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