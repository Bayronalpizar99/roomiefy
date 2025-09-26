import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import {
  Star,
  MapPin,
  Verified,
  MessageCircle,
  Mail,
  CheckCircle2,
  XCircle,
  DollarSign,
  ArrowLeft,
} from 'lucide-react';
import * as Avatar from '@radix-ui/react-avatar';
import { fetchRoommates } from '../services/api';
import { createConversation } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './RoomieDetailPage.css';

const RoomieDetailPage = () => {
  const location = useLocation();
  const { roommate: roommateFromState } = location.state || {};
  const { roomieId } = useParams();
  const navigate = useNavigate();
  const { user, requireLogin } = useAuth();

  // --- INICIO DE LA CORRECCIÓN ---
  // 1. Se inicializa el estado 'roommate' con los datos de roommateFromState si existen.
  const [roommate, setRoommate] = useState(roommateFromState || null);
  // 2. El estado de 'loading' ahora depende de si los datos ya llegaron.
  const [loading, setLoading] = useState(!roommateFromState);
  const [contacting, setContacting] = useState(false);
  // --- FIN DE LA CORRECCIÓN ---

  const handleContact = async () => {
    // Si no está logueado, pedir login
    if (!user) {
      requireLogin("Para contactar a este roomie, necesitas iniciar sesión.");
      return;
    }

    setContacting(true);

    try {
      // Crear conversación con mensaje predeterminado
      const defaultMessage = `¡Hola ${roommate?.name}! 👋 Me interesa compartir apartamento contigo. ¿Podemos conversar sobre los detalles?`;
      const conversation = await createConversation(roommate.id, defaultMessage);

      if (conversation && conversation.id) {
        // Navegar al chat con la conversación seleccionada
        navigate('/chat', {
          state: {
            selectedConversation: conversation,
            prefilledMessage: defaultMessage
          }
        });
      } else {
        // Si falla la creación de conversación, navegar al chat general
        navigate('/chat');
      }
    } catch (error) {
      console.error('Error al crear conversación:', error);
      // En caso de error, navegar al chat general
      navigate('/chat');
    } finally {
      setContacting(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      // 3. Si ya tenemos un roommate en el estado, no hacemos nada.
      if (roommate) return;
      
      setLoading(true);
      try {
        const list = await fetchRoommates();
        const found = list.find((r) => String(r.id) === String(roomieId));
        setRoommate(found || null);
      } catch (e) {
        console.error(e);
        setRoommate(null);
      } finally {
        setLoading(false);
      }
    };
    load();
    // 4. La dependencia ahora es el estado local 'roommate'.
  }, [roomieId, roommate]);

  const budgetText = useMemo(() => {
    const fmt = (n) => `$${new Intl.NumberFormat('es-MX').format(Number(n))}`;
    const min = roommate?.budget?.min ?? roommate?.budget ?? null;
    const max = roommate?.budget?.max ?? roommate?.budget ?? null;
    if (min != null && max != null) return `${fmt(min)} - ${fmt(max)} MXN/mes`;
    if (max != null) return `Hasta ${fmt(max)} MXN/mes`;
    if (min != null) return `Desde ${fmt(min)} MXN/mes`;
    return 'No especificado';
  }, [roommate]);

  // Niveles (solo si existen en los datos del roommate)
  const cleanlinessLevel = roommate?.cleanlinessLevel ?? null;
  const socialLevel = roommate?.socialLevel ?? null;

  const cleanlinessPercent = useMemo(() => {
    const map = {
      'Muy limpio': 100,
      'Limpio': 80,
      'Promedio': 50,
      'Relajado': 30,
    };
    if (!cleanlinessLevel) return null;
    return map[cleanlinessLevel] ?? null;
  }, [cleanlinessLevel]);

  const socialPercent = useMemo(() => {
    const map = {
      'Introvertido': 20,
      'Equilibrado': 50,
      'Extrovertido': 85,
    };
    if (!socialLevel) return null;
    return map[socialLevel] ?? null;
  }, [socialLevel]);

  // Galería de fotos del apartamento (solo datos reales si existen)
  const apartmentPhotos = useMemo(() => {
    let photos = [];
    if (Array.isArray(roommate?.apartmentPhotos)) photos = roommate.apartmentPhotos;
    else if (Array.isArray(roommate?.apartment?.photos)) photos = roommate.apartment.photos;
    else if (Array.isArray(roommate?.photos)) photos = roommate.photos;
    return Array.isArray(photos) ? photos : [];
  }, [roommate]);

  // Políticas dinámicas (solo si existen en los datos)
  const policyItems = useMemo(() => {
    const items = [];
    const pets = roommate?.allowsPets ?? roommate?.petsAllowed ?? roommate?.petFriendly;
    if (pets !== undefined) items.push({ key: 'pets', label: 'Mascotas', ok: !!pets });
    const smoke = roommate?.allowsSmoking ?? roommate?.smokingAllowed ?? roommate?.smoker;
    if (smoke !== undefined) items.push({ key: 'smoke', label: 'Fumadores', ok: !!smoke });
    const guests = roommate?.allowsGuests ?? roommate?.guestsAllowed;
    if (guests !== undefined) items.push({ key: 'guests', label: 'Invitados', ok: !!guests });
    return items;
  }, [roommate]);

  if (loading) {
    return <div className="roomie-detail-container">Cargando perfil...</div>;
  }

  if (!roommate) {
    return <div className="roomie-detail-container">No se encontró el perfil.</div>;
  }

  return (
    <div className="roomie-detail-container">
      <div className="roomie-content-layout">
        {/* Columna izquierda: contenido principal */}
        <div className="roomie-main">
          {/* Back button */}
          <div className="back-row">
            <button
              className="back-btn"
              onClick={() => {
                if (window.history.length > 2) navigate(-1);
                else navigate('/roomies');
              }}
            >
              <ArrowLeft size={18} /> Volver
            </button>
          </div>
          {/* Header */}
          <div className="roomie-header card-surface">
            <div className="roomie-header-top">
              <div className="roomie-avatar-wrap">
                <Avatar.Root className="roomie-avatar">
                  <Avatar.Image src={roommate?.avatar || ''} alt={roommate?.name || 'Usuario'} />
                  <Avatar.Fallback>{roommate?.name?.[0] || '?'}</Avatar.Fallback>
                </Avatar.Root>
                {roommate?.verified && <Verified className="roomie-verified" />}
              </div>

              <div className="roomie-name-block">
                <div className="roomie-name-row">
                  <h1>{roommate?.name}</h1>
                  {!roommate?.hasApartment && (
                    <span className="pill pill-soft">Busca apartamento</span>
                  )}
                </div>
                <div className="roomie-meta-row">
                  {roommate?.age && <span>{roommate.age} años</span>}
                  {roommate?.occupation && <span>{roommate.occupation}</span>}
                  {roommate?.memberSince && <span>Miembro desde {roommate.memberSince}</span>}
                </div>

                <div className="roomie-rating-row">
                  <Star className="star" />
                  <strong>{roommate?.rating ?? 0}</strong>
                  <span className="muted">({roommate?.reviews ?? 0} reseñas)</span>
                </div>

                <div className="roomie-location-row">
                  <MapPin />
                  <span className="muted">{roommate?.location}</span>
                </div>
              </div>
            </div>

            {roommate?.bio && (
              <p className="roomie-bio">
                {roommate.bio}
              </p>
            )}
          </div>

          {/* Presupuesto */}
          <section className="section card-surface">
            <div className="section-title">
              <DollarSign size={18} />
              <span>Presupuesto</span>
            </div>
            <div className="budget-amount">{budgetText}</div>
            <div className="muted small">Dispuesto a pagar</div>
          </section>

          {/* Fotos del apartamento (solo si tiene y hay fotos) */}
          {roommate?.hasApartment && apartmentPhotos.length > 0 && (
            <section className="section card-surface">
              <h2>Fotos del apartamento</h2>
              <div className="photo-grid">
                {apartmentPhotos.map((src, idx) => (
                  <img key={idx} className="photo" src={src} alt={`Foto del apartamento ${idx + 1}`} loading="lazy" />
                ))}
              </div>
            </section>
          )}

          {/* Preferencias y estilo de vida (solo si hay datos) */}
          {(cleanlinessLevel || socialLevel || policyItems.length > 0) && (
            <section className="section card-surface">
              <h2>Preferencias y estilo de vida</h2>

              {cleanlinessLevel && cleanlinessPercent != null && (
                <div className="progress-row">
                  <div className="progress-labels">
                    <span>Nivel de limpieza</span>
                    <span className="muted">{cleanlinessLevel}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${cleanlinessPercent}%` }} />
                  </div>
                </div>
              )}

              {socialLevel && socialPercent != null && (
                <div className="progress-row">
                  <div className="progress-labels">
                    <span>Nivel social</span>
                    <span className="muted">{socialLevel}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill light" style={{ width: `${socialPercent}%` }} />
                  </div>
                </div>
              )}

              {policyItems.length > 0 && (
                <div className="policies">
                  {policyItems.map((p) => (
                    <div key={p.key} className={`policy-chip ${p.ok ? 'ok' : 'bad'}`}>
                      {p.ok ? <CheckCircle2 /> : <XCircle />} {p.label}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Intereses */}
          <section className="section card-surface">
            <h2>Intereses</h2>
            <div className="interests">
              {roommate?.interests?.length ? (
                roommate.interests.map((tag) => (
                  <span key={tag} className="tag">{tag}</span>
                ))
              ) : (
                <span className="muted">Sin intereses especificados</span>
              )}
            </div>
          </section>
        </div>

        {/* Columna derecha: contacto */}
        <aside className="roomie-sidebar">
          <div className="contact-card">
            <h3>Contactar</h3>
            <button
              className="btn primary"
              onClick={handleContact}
              disabled={contacting}
            >
              <MessageCircle size={18} />
              {contacting ? 'Iniciando conversación...' : 'Enviar mensaje'}
            </button>
            <button className="btn"><Mail size={18} /> Email</button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default RoomieDetailPage;