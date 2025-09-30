# 🔴 DATOS SIMULADOS PARA PRUEBAS - IMPORTANTE 🔴

## Ubicación de los datos simulados

Este archivo documenta la ubicación de todos los datos simulados agregados para probar cómo se vería el perfil completado al 100%.

### Archivo: `api.js`

#### 1. Función `fetchUserProfile()` (líneas ~708-736)
**Qué hace:** Simula un perfil de usuario completado al 100% con todos los campos requeridos.

**Datos incluidos:**
- Información personal (nombre, edad, email, ubicación, ocupación)
- Descripción personal
- Foto de perfil
- Preferencias de vivienda (tiene apartamento, presupuesto)
- Niveles sociales y de limpieza
- Preferencias (fumadores, mascotas, invitados)
- Intereses y idiomas

**Para eliminar:**
1. Busca el comentario: `// 🔴 DATOS SIMULADOS PARA PRUEBA - ELIMINAR DESPUÉS 🔴`
2. Elimina desde ese comentario hasta el comentario: `// 🔴 FIN DE DATOS SIMULADOS 🔴`
3. Elimina la línea: `return { data: MOCK_COMPLETED_PROFILE, error: null };`

#### 2. Función `fetchUserProperties()` (líneas ~844-871)
**Qué hace:** Simula 2 propiedades del usuario para mostrar en el dashboard.

**Datos incluidos:**
- 2 propiedades con títulos, ubicaciones, precios e imágenes

**Para eliminar:**
1. Busca el comentario: `// 🔴 DATOS SIMULADOS PARA PRUEBA - ELIMINAR DESPUÉS 🔴`
2. Elimina desde ese comentario hasta el comentario: `// 🔴 FIN DE DATOS SIMULADOS 🔴`
3. Elimina la línea: `return { data: MOCK_USER_PROPERTIES, error: null };`

## Instrucciones de limpieza rápida

### Opción 1: Buscar y eliminar manualmente
1. Abre `src/services/api.js`
2. Busca (Ctrl+F): `🔴 DATOS SIMULADOS`
3. Encontrarás 2 bloques claramente marcados
4. Elimina cada bloque completo incluyendo los comentarios delimitadores

### Opción 2: Buscar todas las líneas con early return
Busca en `api.js` las siguientes líneas y elimínalas junto con sus bloques de datos mock:
- `return { data: MOCK_COMPLETED_PROFILE, error: null };`
- `return { data: MOCK_USER_PROPERTIES, error: null };`

## Verificación después de eliminar

Después de eliminar los datos simulados, verifica que:
1. ✅ No quedan comentarios con 🔴
2. ✅ No quedan constantes que empiecen con `MOCK_`
3. ✅ Las funciones `fetchUserProfile` y `fetchUserProperties` hacen llamadas reales a la API
4. ✅ La aplicación funciona correctamente con datos reales o vacíos

## ⚠️ ADVERTENCIA

**NO DEJAR ESTOS DATOS EN PRODUCCIÓN**

Estos datos son únicamente para desarrollo local y pruebas visuales. Elimínalos antes de:
- Hacer commit al repositorio
- Hacer deploy a producción
- Compartir el código con el equipo

---

**Creado:** Para simular perfil completado y visualizar el dashboard
**Ubicación de este archivo:** `src/services/MOCK_DATA_README.md`
