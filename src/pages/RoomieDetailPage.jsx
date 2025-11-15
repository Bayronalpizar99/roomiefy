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
import { fetchRoommateById, createConversation } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './RoomieDetailPage.css';

/**
 * RoomieDetailPage: Página de detalle para un roommate específico.
 *
 * - Muestra información completa del roommate (perfil, presupuesto, fotos, intereses, etc.).
 * - Maneja carga de datos desde la API con soporte para datos pre-cargados desde navegación.
 * - Incluye funcionalidad para iniciar conversación vía chat.
 * - Usa estados para manejar loading y errores de forma robusta.
 *
 * Dependencias clave:
 * - `fetchRoommateById`: Carga datos del roommate por ID.
 * - `createConversation`: Crea una nueva conversación en el chat.
 * - `useAuth`: Para verificar autenticación y requerir login si es necesario.
 *
 * Flujo típico:
 * 1. Inicializa estados con datos opcionales de navegación (roommateFromState).
 * 2. Carga datos frescos de la API en useEffect para asegurar sincronización.
 * 3. Renderiza perfil con secciones condicionales basadas en datos disponibles.
 * 4. Maneja interacciones como contacto, con navegación a chat.
 */
const RoomieDetailPage = () => {
  const location = useLocation();
  const { roommate: roommateFromState } = location.state || {};
  const { roomieId } = useParams();
  const navigate = useNavigate();
  const { user, requireLogin } = useAuth();

  // Estados principales para manejar datos, carga y acciones.
  // roommateFromState permite renderizado inmediato si venimos de una lista.
  const [roommate, setRoommate] = useState(roommateFromState || null);
  const [loading, setLoading] = useState(!roommateFromState); // Evita spinner si ya hay datos.
  const [contacting, setContacting] = useState(false); // Para deshabilitar botón durante contacto.

  /**
   * Maneja el contacto con el roommate creando una conversación en el chat.
   * - Verifica autenticación y requiere login si no está logueado.
   * - Crea conversación con mensaje predeterminado.
   * - Navega al chat con detalles de la conversación o fallback general.
   */
  const handleContact = async () => {
    console.log('[handleContact] Iniciando...');

    // Si no está logueado, pedir login
    if (!user) {
      console.log('[handleContact] Usuario no autenticado, solicitando login...');
      requireLogin("Para contactar a este roomie, necesitas iniciar sesión.");
      return;
    }

    console.log('[handleContact] Usuario autenticado:', { userId: user?.id });
    console.log('[handleContact] Roommate ID:', roommate?.id);

    if (!roommate?.id) {
      console.error('[handleContact] Error: No se encontró el ID del roomie');
      return;
    }

    setContacting(true);
    console.log('[handleContact] Estado contacting establecido a true');

    try {
      // Crear conversación con mensaje predeterminado
      const defaultMessage = `¡Hola ${roommate?.name}! 👋 Me interesa compartir apartamento contigo. ¿Podemos conversar sobre los detalles?`;
      const targetId = roommate?.userId || roommate?.profileId || roommate?.id;
      console.log('[handleContact] Llamando a createConversation con:', {
        targetId,
        currentUserId: user.id,
        message: defaultMessage
      });

      const conversation = await createConversation(targetId, user.id, defaultMessage);
      console.log('[handleContact] Respuesta de createConversation:', conversation);

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
    /**
     * Carga los datos del roommate desde la API de forma asíncrona.
     * - Siempre refresca datos por ID para sincronizar con el servidor.
     * - Soporta datos iniciales (roommateFromState) para evitar loading innecesario.
     * - Maneja errores y establece estados en consecuencia.
     */
    const load = async () => {
      if (!roomieId) return; // No cargar si no hay ID.
      if (!roommateFromState && !roommate) setLoading(true); // Solo mostrar loading si no hay datos previos.
      try {
        const { data, error } = await fetchRoommateById(roomieId);
        if (error) {
          console.error(error);
          if (!roommateFromState && !roommate) setRoommate(null); // Fallback solo si no hay datos iniciales.
        } else {
          setRoommate(data || null);
        }
      } catch (e) {
        console.error(e);
        if (!roommateFromState && !roommate) setRoommate(null); // Manejo de errores solo sin datos previos.
      } finally {
        if (!roommateFromState && !roommate) setLoading(false); // Finalizar loading solo si empezó aquí.
      }
    };
    load();
  }, [roomieId]);

  /**
   * Genera el texto formateado para el presupuesto del roommate.
   * - Maneja rangos (min-max) o valores individuales desde roommate.budget.
   * - Usa formateo de moneda en español (MXN) para legibilidad.
   */
  const budgetText = useMemo(() => {
    const fmt = (n) => `$${new Intl.NumberFormat('es-MX').format(Number(n))}`;
    const min = roommate?.budget?.min ?? roommate?.profileBudget ?? null;
    const max = roommate?.budget?.max ?? roommate?.profileBudget ?? null;
    if (min != null && max != null && min !== max) return `${fmt(min)} - ${fmt(max)} MXN/mes`;
    if (max != null) return `${fmt(max)} MXN/mes`;
    return 'No especificado';
  }, [roommate]);

  // Niveles (solo si existen en los datos del roommate)
  const cleanlinessLevel = roommate?.cleanlinessLevel ?? null;
  const socialLevel = roommate?.socialLevel ?? null;

  const formatLevelLabel = useMemo(() => {
    return (value) => {
      if (value === null || value === undefined || value === '') return null;
      const num = Number(value);
      if (!Number.isNaN(num)) return `${num}/10`;
      return value;
    };
  }, []);

  const levelToPercent = useMemo(() => {
    return (value) => {
      if (value === null || value === undefined || value === '') return null;
      const num = Number(value);
      if (!Number.isNaN(num)) {
        return Math.max(0, Math.min(100, (num / 10) * 100));
      }
      const map = {
        'muy limpio': 100,
        limpio: 80,
        promedio: 50,
        relajado: 30,
        introvertido: 20,
        equilibrado: 50,
        extrovertido: 85,
      };
      const normalized = String(value).trim().toLowerCase();
      return map[normalized] ?? null;
    };
  }, []);

  // Etiquetas amigables si el backend envía niveles numéricos (1-5)
  const cleanlinessLabel = useMemo(() => formatLevelLabel(cleanlinessLevel), [formatLevelLabel, cleanlinessLevel]);

  const cleanlinessPercent = useMemo(() => {
    return levelToPercent(cleanlinessLevel);
  }, [levelToPercent, cleanlinessLevel]);

  const socialLabel = useMemo(() => {
    return formatLevelLabel(socialLevel);
  }, [formatLevelLabel, socialLevel]);

  const socialPercent = useMemo(() => {
    return levelToPercent(socialLevel);
  }, [levelToPercent, socialLevel]);

  // Nota: showLifestyleSection se calcula después de policyItems para evitar TDZ

  // Políticas dinámicas (solo si existen en los datos)
  const policyItems = useMemo(() => {
    const items = [];
    const pets = roommate?.acceptsPets;
    if (pets !== undefined) items.push({ key: 'pets', label: 'Mascotas', ok: !!pets });
    const smoke = roommate?.acceptsSmokers;
    if (smoke !== undefined) items.push({ key: 'smoke', label: 'Fumadores', ok: !!smoke });
    const guests = roommate?.acceptsGuests;
    if (guests !== undefined) items.push({ key: 'guests', label: 'Invitados', ok: !!guests });
    return items;
  }, [roommate]);

  /**
   * Genera una lista normalizada y deduplicada de idiomas del roommate.
   * - Recolecta idiomas de múltiples campos posibles (ej. languages, idiomas, profile.languages).
   * - Maneja arrays, objetos mapa y tipos mixtos para robustez contra datos inconsistentes.
   * - Usa helpers internos para procesar y normalizar valores.
   */
  const languageList = useMemo(() => {
    const acc = [];
    /**
     * Normaliza un valor a string, manejando tipos variados (string, number, object).
     * - Extrae propiedades comunes de objetos (ej. name, label) o serializa si es necesario.
     */
    const norm = (v) => {
      if (v == null) return null;
      if (typeof v === 'string') return v.trim();
      if (typeof v === 'number') return String(v);
      if (typeof v === 'object') {
        return (
          v.name || v.label || v.value || v.language || v.lang || v.code || v.id || JSON.stringify(v)
        );
      }
      return String(v);
    };
    /**
     * Añade idiomas desde un array, aplicando normalización y filtrando válidos.
     */
    const addArr = (arr) => {
      if (Array.isArray(arr)) {
        for (const it of arr) {
          const n = norm(it);
          if (n) acc.push(n);
        }
      }
    };
    /**
     * Añade idiomas desde un objeto mapa, extrayendo valores y normalizándolos.
     */
    const addObjMap = (obj) => {
      if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
        for (const v of Object.values(obj)) {
          const n = norm(v);
          if (n) acc.push(n);
        }
      }
    };

    // Recolectar idiomas de campos planos y anidados.
    addArr(roommate?.languages);
    addArr(roommate?.idiomas);
    addArr(roommate?.spokenLanguages);
    addArr(roommate?.langs);
    addObjMap(roommate?.languages);

    // Anidados en profile.
    // Normalizar y deduplicar.
    return Array.from(new Set(acc.map(s => String(s).trim()).filter(Boolean)));
  }, [roommate]);

  const showLifestyleSection = useMemo(() => {
    return (cleanlinessPercent != null) || (socialPercent != null) || policyItems.length > 0;
  }, [cleanlinessPercent, socialPercent, policyItems]);

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
          {/* Header: Información básica del roommate (nombre, edad, ocupación, rating, ubicación) */}
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

          {/* Presupuesto: Muestra el rango o valor dispuesto a pagar */}
          <section className="section card-surface">
            <div className="section-title">
              <DollarSign size={18} />
              <span>Presupuesto</span>
            </div>
            <div className="budget-amount">{budgetText}</div>
            <div className="muted small">Dispuesto a pagar</div>
          </section>

          {/* Preferencias y estilo de vida (solo si hay datos) */}
          {showLifestyleSection && (
            <section className="section card-surface">
              <h2>Preferencias y estilo de vida</h2>

              {cleanlinessPercent != null && (
                <div className="progress-row">
                  <div className="progress-labels">
                    <span>Nivel de limpieza</span>
                    <span className="muted">{cleanlinessLabel}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${cleanlinessPercent}%` }} />
                  </div>
                </div>
              )}

              {socialPercent != null && (
                <div className="progress-row">
                  <div className="progress-labels">
                    <span>Nivel social</span>
                    <span className="muted">{socialLabel}</span>
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

          {/* Idiomas */}
          <section className="section card-surface">
            <h2>Idiomas</h2>
            <div className="interests">
              {languageList.length ? (
                languageList.map((lang) => (
                  <span key={lang} className="tag">{lang}</span>
                ))
              ) : (
                <span className="muted">Sin idiomas especificados</span>
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