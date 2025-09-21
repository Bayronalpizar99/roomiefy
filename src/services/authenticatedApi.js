/**
 * Este archivo contiene las llamadas a la API que requieren
 * que el usuario haya iniciado sesión con Google.
 */
const apiUrl = import.meta.env.VITE_API_URL;

/**
 * Función genérica para realizar llamadas a endpoints protegidos.
 * @param {string} endpoint - El endpoint de la API al que se llamará (ej: 'profile', 'properties/new').
 * @param {string} idToken - El JWT ID token del usuario autenticado.
 * @param {object} options - Opciones adicionales para fetch (ej: method, body).
 * @returns {Promise<any>} La respuesta de la API en formato JSON.
 */
export const callProtectedApi = async (endpoint, idToken, options = {}) => {
  if (!apiUrl) {
    console.error("Error: VITE_API_URL no está definida.");
    throw new Error("La URL de la API no está configurada.");
  }
  if (!idToken) {
    console.error("Error: No se proporcionó un idToken para la llamada a la API.");
    throw new Error("Usuario no autenticado.");
  }

  const config = {
    method: 'GET', // Método por defecto
    ...options,    // Sobrescribe con las opciones que pases
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await fetch(`${apiUrl}/${endpoint}`, config);

    if (!response.ok) {
      throw new Error(`Error de API: ${response.status} ${response.statusText}`);
    }

    // No intenta parsear JSON si la respuesta no tiene contenido (ej. un 204 No Content)
    if (response.status === 204) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Fallo al llamar al endpoint protegido ${endpoint}:`, error);
    throw error;
  }
};