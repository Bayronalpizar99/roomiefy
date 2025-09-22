# 🎨 Sistema de Tema con Persistencia

Este sistema permite cambiar entre tema claro y oscuro con persistencia automática usando localStorage.

## 🚀 **Características**

- ✅ **Persistencia**: El tema se guarda en localStorage y persiste después de recargar
- ✅ **Preferencia del sistema**: Detecta automáticamente la preferencia del usuario
- ✅ **Sincronización**: Se actualiza automáticamente si cambia la preferencia del sistema
- ✅ **Fácil de usar**: Hook simple con funciones útiles

## 📦 **Instalación**

El hook ya está implementado en `src/hooks/useTheme.js`.

## 🔧 **Uso básico**

```javascript
import { useTheme } from '../hooks/useTheme';

function MiComponente() {
  const { theme, toggleTheme, isDark, isLight } = useTheme();

  return (
    <div>
      <p>Tema actual: {theme}</p>
      <button onClick={toggleTheme}>
        Cambiar a {isDark ? 'claro' : 'oscuro'}
      </button>
    </div>
  );
}
```

## 📚 **API del Hook**

### **Valores retornados:**
- `theme`: `'light'` | `'dark'` - Tema actual
- `isDark`: `boolean` - Verdadero si el tema es oscuro
- `isLight`: `boolean` - Verdadero si el tema es claro

### **Funciones:**
- `setTheme(newTheme)`: Cambia el tema (usa 'light' o 'dark')
- `toggleTheme()`: Alterna entre claro y oscuro

## 🎯 **Ejemplos de uso**

### **En un componente:**
```javascript
const { theme, setTheme, isDark } = useTheme();

// Aplicar clase CSS condicional
<div className={isDark ? 'dark-mode' : 'light-mode'}>
  Contenido
</div>

// Cambiar tema
<button onClick={() => setTheme('dark')}>
  Modo oscuro
</button>
```

### **En CSS con variables:**
```css
:root {
  --bg-color: #ffffff;
  --text-color: #000000;
}

.dark {
  --bg-color: #1a1a1a;
  --text-color: #ffffff;
}

body {
  background-color: var(--bg-color);
  color: var(--text-color);
}
```

### **Detectar cambios de tema:**
```javascript
const { theme } = useTheme();

useEffect(() => {
  if (theme === 'dark') {
    // Hacer algo en modo oscuro
    console.log('Modo oscuro activado');
  }
}, [theme]);
```

## 🔄 **Ciclo de vida del tema**

1. **Al cargar la página:**
   - Revisa localStorage primero
   - Si no hay tema guardado, usa la preferencia del sistema
   - Aplica el tema al documento

2. **Al cambiar el tema:**
   - Se guarda en localStorage
   - Se aplica inmediatamente al documento
   - Se notifica a todos los componentes suscritos

3. **Al cambiar la preferencia del sistema:**
   - Solo afecta si el usuario no ha elegido manualmente un tema
   - Se actualiza automáticamente

## 🗂️ **Archivos involucrados**

- `src/hooks/useTheme.js` - Hook principal
- `src/App.jsx` - Implementación en la aplicación principal

## 🧪 **Testing**

Para probar la persistencia:
1. Cambia el tema
2. Recarga la página
3. Cierra y abre el navegador
4. El tema debería mantenerse igual

## 🔧 **Configuración avanzada**

Si necesitas personalizar el comportamiento:

```javascript
// Cambiar la key de localStorage
const THEME_STORAGE_KEY = 'mi-app-theme';

// Cambiar el tema por defecto
const getInitialTheme = () => {
  return localStorage.getItem(THEME_STORAGE_KEY) || 'light';
};
```
