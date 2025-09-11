/**
 * Obtiene los datos de las propiedades desde la API de Azure.
 */
export const fetchProperties = async () => {
  // En Vite, las variables de entorno se acceden con import.meta.env
  // y deben empezar con el prefijo VITE_ en tu archivo .env
  const apiUrl = import.meta.env.VITE_API_URL;
  const apiKey = import.meta.env.VITE_API_KEY;

  // Verificación para asegurar que las variables de entorno están cargadas
  if (!apiUrl || !apiKey) {
    console.error("Error: Las variables de entorno VITE_API_URL o VITE_API_KEY no están definidas.");
    return [];
  }

  try {
    const response = await fetch(apiUrl, {
      // El método GET es el predeterminado, pero lo mantenemos por claridad si lo prefieres.
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