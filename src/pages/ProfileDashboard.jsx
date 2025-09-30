import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { User, Home, Edit, Plus, Search, CheckCircle } from "lucide-react";
import * as Switch from "@radix-ui/react-switch";
import { fetchUserProfile, fetchUserProperties, updateSearchingStatus } from "../services/api";
import "./ProfileDashboard.css";

/**
 * ProfileDashboard: Dashboard personal del usuario con información básica y gestión de perfil.
 * 
 * - Muestra información básica del usuario (Google login + perfil completado).
 * - Barra de progreso si el perfil no está 100% completado.
 * - Botón condicional: "Completar perfil" o "Modificar perfil".
 * - Sección de propiedades publicadas o botón para agregar primera propiedad.
 * - Toggle para activar/desactivar búsqueda de roomie.
 */
const ProfileDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Cargar datos del perfil y propiedades
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [profileResponse, propertiesResponse] = await Promise.all([
          fetchUserProfile(),
          fetchUserProperties()
        ]);

        if (profileResponse.data) {
          setProfile(profileResponse.data);
          setIsSearching(profileResponse.data.isSearching || false);
        }

        if (propertiesResponse.data) {
          setProperties(propertiesResponse.data);
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Calcular progreso del perfil (0-100%)
  const calculateProgress = () => {
    if (!profile) return 0;

    const requiredFields = [
      'nombre',
      'edad',
      'ubicacion',
      'ocupacion',
      'descripcion',
      'tieneApartamento',
      'presupuesto',
      'nivelSocial',
      'nivelLimpieza',
      'aceptaFumadores',
      'aceptaMascotas',
      'aceptaInvitados',
      'intereses',
      'idiomas'
    ];

    const completedFields = requiredFields.filter(field => {
      const value = profile[field];
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') return value.trim() !== '';
      return value !== null && value !== undefined && value !== '';
    });

    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

  const progress = calculateProgress();
  const isProfileComplete = progress === 100;

  // Manejar cambio de estado de búsqueda
  const handleSearchingToggle = async (checked) => {
    if (!isProfileComplete) {
      alert("Debes completar tu perfil al 100% antes de activar la búsqueda de roomie.");
      return;
    }

    setUpdatingStatus(true);
    try {
      const response = await updateSearchingStatus(checked);
      if (response.data) {
        setIsSearching(checked);
      } else {
        alert("No se pudo actualizar el estado. Intenta de nuevo.");
      }
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      alert("Error al actualizar el estado. Intenta de nuevo.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-message">Cargando perfil...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header con información básica del usuario */}
      <div className="dashboard-header">
        <div className="user-info">
          <div className="profile-avatar">
            {user?.picture ? (
              <img src={user.picture} alt={user.name} />
            ) : (
              <User size={48} />
            )}
          </div>
          <div className="user-details">
            <h1>{user?.name || 'Usuario'}</h1>
            <p className="user-email">{user?.email}</p>
            {profile?.ocupacion && (
              <p className="user-occupation">{profile.ocupacion}</p>
            )}
          </div>
        </div>
        
        {/* Toggle de búsqueda de roomie */}
        {profile && (
          <div className="searching-toggle">
            <div className="toggle-content">
              <div className="toggle-info">
                <Search size={20} />
                <div>
                  <p className="toggle-label">Buscando roomie</p>
                  <p className="toggle-hint">
                    {isSearching 
                      ? "Visible en búsqueda de roomies" 
                      : "No visible en búsqueda de roomies"}
                  </p>
                </div>
              </div>
              <Switch.Root
                className="switch-root"
                checked={isSearching}
                onCheckedChange={handleSearchingToggle}
                disabled={!isProfileComplete || updatingStatus}
              >
                <Switch.Thumb className="switch-thumb" />
              </Switch.Root>
            </div>
            {!isProfileComplete && (
              <p className="toggle-warning">
                Completa tu perfil al 100% para activar esta opción
              </p>
            )}
          </div>
        )}
      </div>

      {/* Barra de progreso y acción del perfil */}
      <div className="profile-section card-surface">
        <div className="section-header">
          <h2>Mi perfil de roomie</h2>
          {isProfileComplete && <CheckCircle className="check-icon" size={24} />}
        </div>

        {!isProfileComplete && (
          <>
            <p className="progress-text">Progreso del perfil: {progress}%</p>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </>
        )}

        {profile?.descripcion && (
          <p className="profile-bio">{profile.descripcion}</p>
        )}

        <div className="profile-stats">
          {profile?.ubicacion && (
            <div className="stat-item">
              <span className="stat-label">Ubicación:</span>
              <span className="stat-value">{profile.ubicacion}</span>
            </div>
          )}
          {profile?.edad && (
            <div className="stat-item">
              <span className="stat-label">Edad:</span>
              <span className="stat-value">{profile.edad} años</span>
            </div>
          )}
          {profile?.presupuesto && (
            <div className="stat-item">
              <span className="stat-label">Presupuesto:</span>
              <span className="stat-value">${profile.presupuesto} USD/mes</span>
            </div>
          )}
        </div>

        <div className="profile-actions">
          {!profile || !isProfileComplete ? (
            <button
              className="btn primary"
              onClick={() => navigate('/perfil/form', { 
                state: { 
                  isEditMode: !!profile,
                  profileData: profile 
                } 
              })}
            >
              <Edit size={18} />
              {profile ? 'Completar perfil' : 'Crear perfil'}
            </button>
          ) : (
            <button
              className="btn secondary"
              onClick={() => navigate('/perfil/form', { 
                state: { 
                  isEditMode: true,
                  profileData: profile 
                } 
              })}
            >
              <Edit size={18} />
              Modificar perfil
            </button>
          )}
        </div>
      </div>

      {/* Sección de propiedades */}
      <div className="properties-section card-surface">
        <div className="section-header">
          <h2>Mis propiedades</h2>
          <Home size={24} />
        </div>

        {properties.length === 0 ? (
          <div className="empty-state">
            <p>Aún no has publicado ninguna propiedad</p>
            <button
              className="btn primary"
              onClick={() => navigate('/publicar')}
            >
              <Plus size={18} />
              Agregar tu primera propiedad
            </button>
          </div>
        ) : (
          <>
            <div className="properties-grid">
              {properties.map((property) => (
                <div key={property.id} className="property-card">
                  <div className="property-image">
                    {property.images?.[0] ? (
                      <img src={property.images[0]} alt={property.title} />
                    ) : (
                      <div className="property-placeholder">
                        <Home size={32} />
                      </div>
                    )}
                  </div>
                  <div className="property-info">
                    <h3>{property.title}</h3>
                    <p className="property-location">{property.location}</p>
                    <p className="property-price">${property.price} USD/mes</p>
                  </div>
                  <div className="property-actions">
                    <button
                      className="btn-small secondary"
                      onClick={() => navigate(`/propiedad/${property.id}`)}
                    >
                      Ver detalles
                    </button>
                    <button
                      className="btn-small secondary"
                      onClick={() => navigate(`/propiedad/editar/${property.id}`)}
                    >
                      <Edit size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              className="btn secondary"
              onClick={() => navigate('/publicar')}
            >
              <Plus size={18} />
              Agregar otra propiedad
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileDashboard;
