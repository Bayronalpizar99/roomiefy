import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { AuthProvider } from "./context/AuthContext";
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
import { fetchProperties, deleteProperty, updateProperty } from './services/api';
import "./App.css";
import Toast from './components/Toast';

function App() {
  const { theme, toggleTheme } = useTheme();
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
      try {
        const { data, error } = await fetchProperties();
        setAllProperties(Array.isArray(data) ? data : []);
        if (error) {
          setToast({ visible: true, type: 'error', message: `No se pudieron cargar las propiedades. ${error}` });
        }
      } catch (e) {
        setAllProperties([]);
        setToast({ visible: true, type: 'error', message: 'No se pudieron cargar las propiedades. Fallo inesperado.' });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleAddProperty = (newProperty) => {
    setAllProperties(prev => [newProperty, ...prev]);
    setMyProperties(prev => [newProperty, ...prev]);
    setHasPublished(true);
  };

  const handleDeleteProperty = async (propertyId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta propiedad? Esta acción es permanente.')) {
      try {
        await deleteProperty(propertyId);
        setAllProperties(prev => prev.filter(p => p.id !== propertyId));
        setMyProperties(prev => prev.filter(p => p.id !== propertyId));
        alert('Propiedad eliminada exitosamente (simulado).');
      } catch (error) {
        console.error("Fallo al eliminar la propiedad:", error);
        alert(`No se pudo eliminar la propiedad: ${error.message}`);
      }
    }
  };

  const handleUpdateProperty = (propertyId, updatedProperty) => {
    const updateList = (list) => list.map(p => (String(p.id) === String(propertyId) ? updatedProperty : p));
    setAllProperties(prev => updateList(prev));
    setMyProperties(prev => updateList(prev));
  };

  const handleSearch = (query) => setSearchQuery(query);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (location.pathname === '/roomies') return;
    if (location.pathname === '/') setCurrentPage(1);
    else setSearchQuery('');
  }, [location.pathname]);

  return (
    <AuthProvider>
      <div className="app-layout">
        <Navbar
          toggleTheme={toggleTheme}
          onSearch={handleSearch}
          searchQuery={searchQuery}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          hasPublished={hasPublished}
        />
        <ScrollArea.Root className="main-content-area">
          <ScrollArea.Viewport className="scroll-area-viewport">
            <Routes>
              <Route path="/" element={<HomePage searchQuery={searchQuery} properties={allProperties} loading={loading} />} />
              <Route path="roomies" element={<RoomiesPage searchQuery={searchQuery} onSearchQueryChange={handleSearch} currentPage={currentPage} setCurrentPage={setCurrentPage} />} />
              <Route path="publicar" element={<PublishPage onAddProperty={handleAddProperty} />} />
              <Route path="/mis-propiedades" element={<MyPropertiesPage myProperties={myProperties} onDeleteProperty={handleDeleteProperty} />} />
              <Route 
                path="/propiedad/editar/:propertyId" 
                element={<EditPropertyPage myProperties={myProperties} onUpdateProperty={handleUpdateProperty} />} 
              />
              <Route path="/propiedad/:propertyId" element={<PropertyDetailPage />} />
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
    </AuthProvider>
  );
}

export default App;