/**
 * Obtiene los datos de las propiedades desde la API de Azure.
 */
export const fetchProperties = async () => {
  // En Vite, las variables de entorno se acceden con import.meta.env
  // y deben empezar con el prefijo VITE_ en tu archivo .env
  const apiUrl = import.meta.env.VITE_API_URL ;
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
    const response = await fetch(apiUrl + '/properties', {
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