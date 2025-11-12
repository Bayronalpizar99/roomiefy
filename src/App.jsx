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
import { fetchProperties, deleteProperty } from './services/api';
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

  // Estado para los filtros de propiedades, ahora en App.jsx
  const [filters, setFilters] = useState({
    location: '',
    price: 500,
    bedrooms: 'any',
    amenities: new Set(),
  });

  // useEffect para cargar propiedades cuando los filtros o el usuario cambian
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const userPropertiesKey = user ? `roomify_properties_${user.email}` : null;
      let localUserProperties = [];
      if (user && userPropertiesKey) {
        localUserProperties = JSON.parse(localStorage.getItem(userPropertiesKey) || '[]');
      }

      // Pasar los filtros a la API
      const { data: apiProperties, error } = await fetchProperties({
        search: filters.location || searchQuery,
        price: filters.price,
        bedrooms: filters.bedrooms,
        amenities: filters.amenities,
      });

      if (error) {
        setToast({ visible: true, type: 'error', message: `No se pudieron cargar las propiedades: ${error}` });
        setAllProperties(localUserProperties);
      } else {
        // Combinar propiedades de la API con las locales del usuario
        const combined = [...localUserProperties, ...apiProperties];
        // Eliminar duplicados si los hubiera
        const uniqueProperties = Array.from(new Map(combined.map(p => [p.id, p])).values());
        setAllProperties(uniqueProperties);
      }

      setLoading(false);
    };

    loadData();
  }, [user, filters, searchQuery]);

  useEffect(() => {
    const userProperties = allProperties.filter(p => p.owner_name === 'Tú (Propietario)');
    setMyProperties(userProperties);
    setHasPublished(userProperties.length > 0);
  }, [allProperties]);

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
    saveUserProperties(updatedProperties);
  };

  const handleSearch = (query) => setSearchQuery(query);

  useEffect(() => {
    const isRoomies = location.pathname === '/roomies';
  }, [location.pathname]);

  return (
    <div className="app-layout">
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
          <Route path="publicar" element={<PublishPage onAddProperty={handleAddProperty} />} />
          <Route path="/mis-propiedades" element={<MyPropertiesPage myProperties={myProperties} onDeleteProperty={handleDeleteProperty} />} />
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