## Descripción del Proyecto
Roomiefy es una aplicación web diseñada para ayudar a los usuarios a encontrar y conectar con potenciales compañeros de cuarto de manera eficiente facilitando a los usuarios la búsqueda de habitaciones disponibles. Incluye una interfaz completamente responsiva, con filtros amigables para móviles y una barra de navegación dinámica, paginación para listados. Construido con React y Vite, prioriza la accesibilidad y el rendimiento en todos los dispositivos.

## Instrucciones de Despliegue Local
Para ejecutar Roomiefy localmente, siga estos pasos:
1. Clone el repositorio usando `git clone https://github.com/Bayronalpizar99/roomiefy.git` (reemplace con la URL de su repositorio si es diferente).
2. Navegue al directorio del proyecto.
3. Instale las dependencias con `npm install`.
4. Inicie el servidor de desarrollo con `npm run dev`.
5. Abra su navegador en la URL proporcionada (generalmente http://localhost:5173) para ver la aplicación.
6. Para una compilación de producción, ejecute `npm run build` para generar activos optimizados, y `npm run preview` para probar la compilación localmente.

## Capturas de pantalla del sistema en funcionamiento

### Login 
![alt text](/screenshots/image.png)

### Propiedades
![alt text](/screenshots/image-1.png)

### Chat
![alt text](/screenshots/image-2.png)

### Roomies
![alt text](/screenshots/image-3.png)

## Estructura del Repositorio
El repositorio está organizado de la siguiente manera:
- `src/`: Contiene todo el código fuente.
  - `pages/`: Alberga componentes de páginas como `HomePage.jsx`, `RoomiesPage.jsx` y `ChatPage.jsx`, cada uno manejando vistas específicas con diseños responsivos.
  - `components/`: Componentes de UI reutilizables, como `Pagination.jsx`, usados en varias páginas para mantener la consistencia.
  - `services/`: Archivos de servicios API, p.ej., `api.js`, que gestionan la obtención de datos y las interacción con el backend.
  - `App.jsx`: El componente principal de la aplicación que enruta y renderiza las páginas.
- `public/`: Activos estáticos como imágenes y favicons.
- `node_modules/`: Gestionado por npm, contiene todas las dependencias.
- Otros archivos como `package.json`, `vite.config.js` y este README.md manejan la configuración y la documentación.

## Créditos
Roomiefy utiliza varias bibliotecas y herramientas de código abierto. Las dependencias clave incluyen:
- React y React DOM para construir la interfaz de usuario.
- Vite para desarrollo rápido y empaquetado.
- Componentes de Radix UI para elementos de UI accesibles y personalizables.
- date-fns para el manejo de fechas.
- react-router-dom para la navegación.
- lucide-react para iconos.
- Otras utilidades como jwt-decode y react-date-range para características específicas.
![alt text](image.png)