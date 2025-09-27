import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { useAuth } from "./context/AuthContext"; // Importa useAuth
import { Navbar } from "./components/Navbar";
import HomePage from "./pages/HomePage.jsx";
import RoomiesPage from "./pages/RoomiesPage.jsx";
import PublishPage from "./pages/PublishPage.jsx";
import MyPropertiesPage from './pages/MyPropertiesPage.jsx';
import EditPropertyPage from './pages/EditPropertyPage.jsx'; 
import PropertyDetailPage from "./pages/PropertyDetailPage.jsx";
import RoomieDetailPage from "./pages/RoomieDetailPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import { useTheme } from "./hooks/useTheme";
import LoginModal from './components/LoginModal';
import { fetchProperties, deleteProperty } from './services/api';
import "./App.css";
import Toast from './components/Toast';

function App() {
  const { toggleTheme } = useTheme();
  const { user } = useAuth(); // Obtiene el usuario actual del contexto
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  const [allProperties, setAllProperties] = useState([]);
  const [myProperties, setMyProperties] = useState([]);
  const [hasPublished, setHasPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const basePropertiesKey = 'roomify_base_properties';
      const userPropertiesKey = user ? `roomify_properties_${user.email}` : null;

      // 1. Carga las propiedades base desde la API (solo si no están en caché)
      let baseProperties = JSON.parse(localStorage.getItem(basePropertiesKey) || '[]');
      if (baseProperties.length === 0) {
        const { data, error } = await fetchProperties();
        if (!error && Array.isArray(data)) {
          baseProperties = data;
          localStorage.setItem(basePropertiesKey, JSON.stringify(baseProperties));
        }
      }

      // 2. Si hay un usuario, carga sus propiedades y las combina
      if (user && userPropertiesKey) {
        const userProperties = JSON.parse(localStorage.getItem(userPropertiesKey) || '[]');
        // Combina las propiedades del usuario con las base, dando prioridad a las del usuario.
        setAllProperties([...userProperties, ...baseProperties]);
      } else {
        // Si no hay usuario, solo muestra las propiedades base.
        setAllProperties(baseProperties);
      }

      setLoading(false);
    };

    loadData();
  }, [user]); 

  useEffect(() => {
    const userProperties = allProperties.filter(p => p.owner_name === 'Tú (Propietario)');
    setMyProperties(userProperties);
    setHasPublished(userProperties.length > 0);
  }, [allProperties]);

  // Guarda solo las propiedades DEL USUARIO en su clave de localStorage
  const saveUserProperties = (updatedProperties) => {
    if (user) {
      const userPropertiesKey = `roomify_properties_${user.email}`;
      const propertiesToSave = updatedProperties.filter(p => p.owner_name === 'Tú (Propietario)');
      localStorage.setItem(userPropertiesKey, JSON.stringify(propertiesToSave));
    }
  };

  const handleAddProperty = (newProperty) => {
    const updatedProperties = [newProperty, ...allProperties];
    setAllProperties(updatedProperties);
    saveUserProperties(updatedProperties);
  };

  const handleDeleteProperty = async (propertyId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta propiedad?')) {
      try {
        await deleteProperty(propertyId);
        const updatedProperties = allProperties.filter(p => p.id !== propertyId);
        setAllProperties(updatedProperties);
        saveUserProperties(updatedProperties);
        setToast({ visible: true, type: 'success', message: 'Propiedad eliminada.' });
      } catch (error) {
        setToast({ visible: true, type: 'error', message: `No se pudo eliminar: ${error.message}` });
      }
    }
  };

  const handleUpdateProperty = (propertyId, updatedProperty) => {
    const updatedProperties = allProperties.map(p => 
      String(p.id) === String(propertyId) ? updatedProperty : p
    );
    setAllProperties(updatedProperties);
    saveUserProperties(updatedProperties);
  };

  const handleSearch = (query) => setSearchQuery(query);

  return (
    <div className="app-layout">
      <Navbar
        toggleTheme={toggleTheme}
        onSearch={handleSearch}
        searchQuery={searchQuery}
        hasPublished={hasPublished}
      />
      <ScrollArea.Root className="main-content-area">
        <ScrollArea.Viewport className="scroll-area-viewport">
          <Routes>
            <Route path="/" element={<HomePage searchQuery={searchQuery} properties={allProperties} loading={loading} />} />
            <Route path="roomies" element={<RoomiesPage searchQuery={searchQuery} onSearchQueryChange={handleSearch} />} />
            <Route path="publicar" element={<PublishPage onAddProperty={handleAddProperty} />} />
            <Route path="/mis-propiedades" element={<MyPropertiesPage myProperties={myProperties} onDeleteProperty={handleDeleteProperty} />} />
            <Route 
              path="/propiedad/editar/:propertyId" 
              element={<EditPropertyPage myProperties={myProperties} onUpdateProperty={handleUpdateProperty} />} 
            />
            <Route path="/propiedad/:propertyId" element={<PropertyDetailPage allProperties={allProperties} loading={loading} />} />
            <Route path="/roomie/:roomieId" element={<RoomieDetailPage />} />
            <Route path="perfil" element={<ProfilePage />} />
            <Route path="chat" element={<ChatPage />} />
          </Routes>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar className="scroll-area-scrollbar" orientation="vertical">
            <ScrollArea.Thumb className="scroll-area-thumb" />
          </ScrollArea.Scrollbar>
      </ScrollArea.Root>
      <LoginModal />
      <Toast
        visible={toast.visible}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
        position="bottom-right"
      />
    </div>
  );
}

export default App;