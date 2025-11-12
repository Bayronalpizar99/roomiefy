import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import HomePage from "./pages/HomePage.jsx";
import RoomiesPage from "./pages/RoomiesPage.jsx";
import PublishPage from "./pages/PublishPage.jsx";
import MyPropertiesPage from './pages/MyPropertiesPage.jsx';
import MyFavoritesPage from './pages/MyFavoritesPage';
import EditPropertyPage from './pages/EditPropertyPage.jsx';
import PropertyDetailPage from "./pages/PropertyDetailPage.jsx";
import RoomieDetailPage from "./pages/RoomieDetailPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import ProfileForm from "./pages/ProfileForm.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import { useTheme } from "./hooks/useTheme";
import LoginModal from './components/LoginModal';
import { fetchProperties, deleteProperty, fetchUserProperties } from './services/api'; 
import "./App.css";
import Toast from './components/Toast';
import Footer from './components/Footer';

function App() {
  const { toggleTheme } = useTheme();
  const { user } = useAuth(); // Obtenemos el usuario del contexto
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  const [allProperties, setAllProperties] = useState([]);
  const [myProperties, setMyProperties] = useState([]); // Estado para "Mis Propiedades"
  const [hasPublished, setHasPublished] = useState(false); // Estado para el Navbar
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });


  const [filters, setFilters] = useState({
      location: '',
      price: 5000, 
      bedrooms: 'any',
      amenities: new Set(),
  });

  // 2. useEffect #1: Carga TODAS las propiedades (para el Home)
  // Se ejecuta cuando cambian los filtros o la búsqueda
  useEffect(() => {
    const loadAllProperties = async () => {
      setLoading(true);
      try {
        const { data: apiProperties, error } = await fetchProperties({
          search: filters.location || searchQuery,
          price: filters.price,
          bedrooms: filters.bedrooms,
          amenities: filters.amenities,
        });

        if (error) {
          throw new Error(error);
        }
        setAllProperties(apiProperties);
      } catch (err) {
        setToast({ visible: true, type: 'error', message: `No se pudieron cargar las propiedades: ${err.message}` });
      } finally {
        setLoading(false);
      }
    };

    loadAllProperties();
  }, [filters, searchQuery]); // Depende solo de los filtros

  //  3. useEffect #2: Carga MIS propiedades (para el Navbar y "Mis Propiedades")
  // Se ejecuta SOLO cuando el 'user' cambia (login o logout)
  useEffect(() => {
    const loadUserProperties = async () => {
      if (user) {
        // Si hay usuario, busca sus propiedades
        const { data, error } = await fetchUserProperties(user.id);
        if (error) {
          setToast({ visible: true, type: 'error', message: `No se pudieron cargar tus propiedades: ${error}` });
          setMyProperties([]);
          setHasPublished(false);
        } else {
          // Actualizamos el estado de 'myProperties' Y el estado del 'Navbar'
          setMyProperties(data);
          setHasPublished(data.length > 0);
        }
      } else {
        // Si el usuario cierra sesión, limpiamos todo
        setMyProperties([]);
        setHasPublished(false);
      }
    };

    loadUserProperties();
  }, [user]); // ¡Esta dependencia es la clave!

  
  // 4. Lógica para AÑADIR (actualiza AMBOS estados)
  const handleAddProperty = (newProperty) => {
    // Añade la nueva propiedad a la lista de 'allProperties'
    setAllProperties(prev => [newProperty, ...prev]);
    // Añade la nueva propiedad a la lista de 'myProperties'
    setMyProperties(prev => [newProperty, ...prev]);
    // Actualiza el estado del Navbar
    setHasPublished(true);
  };

  // 5. Lógica para BORRAR (actualiza AMBOS estados)
  const handleDeleteProperty = async (propertyId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta propiedad?')) {
      try {
        await deleteProperty(propertyId); // Llama a la API

        // ctualiza la lista 'allProperties' (para el Home)
        setAllProperties(prev => prev.filter(p => p.id !== propertyId));

        // Actualiza la lista 'myProperties' (para "Mis Propiedades")
        const updatedMyProperties = myProperties.filter(p => p.id !== propertyId);
        setMyProperties(updatedMyProperties);
        
        // Actualiza el estado del Navbar si ya no quedan propiedades
        setHasPublished(updatedMyProperties.length > 0);
        
        setToast({ visible: true, type: 'success', message: 'Propiedad eliminada.' });
      } catch (error) {
        setToast({ visible: true, type: 'error', message: `No se pudo eliminar: ${error.message}` });
      }
    }
  };

  const handleUpdateProperty = (propertyId, updatedProperty) => {
      // 1. Actualiza la lista 'allProperties' (para el Home)
      setAllProperties(prev => 
        prev.map(p => String(p.id) === String(propertyId) ? updatedProperty : p)
      );
      // 2. Actualiza la lista 'myProperties' (para "Mis Propiedades")
      setMyProperties(prev => 
        prev.map(p => String(p.id) === String(propertyId) ? updatedProperty : p)
      );
      // 3. Muestra una notificación de éxito
      setToast({ visible: true, type: 'success', message: 'Propiedad actualizada.' });
    };

  const handleSearch = (query) => setSearchQuery(query);

  return (
    <div className="app-layout">
      {/* 6. El Navbar ahora recibe el estado 'hasPublished' actualizado */}
      <Navbar
        onSearch={handleSearch}
        searchQuery={searchQuery}
        hasPublished={hasPublished}
      />

      <div className="content-wrapper">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                properties={allProperties}
                loading={loading}
                filters={filters}
                setFilters={setFilters}
              />
            }
          />
          <Route path="roomies" element={<RoomiesPage searchQuery={searchQuery} onSearchQueryChange={handleSearch} />} />
          
          {/* 7. Las rutas ahora reciben las funciones y estados correctos */}
          <Route 
            path="publicar" 
            element={<PublishPage onAddProperty={handleAddProperty} />} 
          />
          <Route 
            path="/mis-propiedades" 
            element={<MyPropertiesPage myProperties={myProperties} onDeleteProperty={handleDeleteProperty} />} 
          />
          <Route
            path="/propiedad/editar/:propertyId"
            element={<EditPropertyPage myProperties={myProperties} onUpdateProperty={handleUpdateProperty} />}
          />
          <Route
            path="/favoritos"
            element={<MyFavoritesPage allProperties={allProperties} />}
          />
          <Route path="/propiedad/:propertyId" element={<PropertyDetailPage allProperties={allProperties} loading={loading} />} />
          <Route path="/roomie/:roomieId" element={<RoomieDetailPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/perfil/form" element={<ProfileForm />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </div>
      <Footer />

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