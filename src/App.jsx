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
  const { user } = useAuth(); 
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  const [allProperties, setAllProperties] = useState([]);
  const [myProperties, setMyProperties] = useState([]); 
  const [hasPublished, setHasPublished] = useState(false); 
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });


  const [filters, setFilters] = useState({
    location: '',
    price: null, 
    bedrooms: 'any',
    amenities: new Set(),
  });

  useEffect(() => {
    const loadAllProperties = async () => {
      setLoading(true);
      try {
        console.log('🔄 Cargando propiedades con filtros:', {
          search: filters.location || searchQuery,
          price: filters.price,
          bedrooms: filters.bedrooms
        });

        const { data: apiProperties, error } = await fetchProperties({
          search: filters.location || searchQuery,
          price: filters.price,
          bedrooms: filters.bedrooms,
          amenities: filters.amenities,
        });

        if (error) {
          throw new Error(error);
        }

        console.log('✅ Propiedades cargadas:', apiProperties.length);
        setAllProperties(apiProperties);
      } catch (err) {
        console.error(' Error al cargar propiedades:', err);
        setToast({ visible: true, type: 'error', message: `No se pudieron cargar las propiedades: ${err.message}` });
      } finally {
        setLoading(false);
      }
    };

    loadAllProperties();
  }, [filters, searchQuery]); 

  useEffect(() => {
    const loadUserProperties = async () => {
      if (user) {
        const { data, error } = await fetchUserProperties(user.id);
        if (error) {
          setToast({ visible: true, type: 'error', message: `No se pudieron cargar tus propiedades: ${error}` });
          setMyProperties([]);
          setHasPublished(false);
        } else {
          setMyProperties(data);
          setHasPublished(data.length > 0);
        }
      } else {
        setMyProperties([]);
        setHasPublished(false);
      }
    };

    loadUserProperties();
  }, [user]); 

  const handleAddProperty = async (newProperty) => {

    setAllProperties(prev => [newProperty, ...prev]);
    setMyProperties(prev => [newProperty, ...prev]);
    setHasPublished(true);

    try {
      console.log(' Recargando propiedades desde el backend después de crear...');
      const { data: apiProperties, error } = await fetchProperties({
      });

      if (!error && apiProperties) {
        setAllProperties(apiProperties);
        console.log(' Propiedades recargadas desde el backend:', apiProperties.length);
        console.log(' IDs de propiedades recargadas:', apiProperties.map(p => p.id));
      } else {
        console.error(' Error al recargar propiedades:', error);
      }
    } catch (err) {
      console.warn(' No se pudieron recargar las propiedades, pero la propiedad ya está en el estado local:', err);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta propiedad?')) {
      try {
        await deleteProperty(propertyId); 

        setAllProperties(prev => prev.filter(p => p.id !== propertyId));

        const updatedMyProperties = myProperties.filter(p => p.id !== propertyId);
        setMyProperties(updatedMyProperties);

        setHasPublished(updatedMyProperties.length > 0);

        setToast({ visible: true, type: 'success', message: 'Propiedad eliminada.' });
      } catch (error) {
        setToast({ visible: true, type: 'error', message: `No se pudo eliminar: ${error.message}` });
      }
    }
  };

  const handleUpdateProperty = (propertyId, updatedProperty) => {
    setAllProperties(prev =>
      prev.map(p => String(p.id) === String(propertyId) ? updatedProperty : p)
    );
    setMyProperties(prev =>
      prev.map(p => String(p.id) === String(propertyId) ? updatedProperty : p)
    );
    setToast({ visible: true, type: 'success', message: 'Propiedad actualizada.' });
  };

  const handleSearch = (query) => setSearchQuery(query);

  return (
    <div className="app-layout">
      {/* El Navbar ahora recibe el estado 'hasPublished' actualizado */}
      <Navbar
        toggleTheme={toggleTheme}
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

          {/*  Las rutas ahora reciben las funciones y estados correctos */}
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