import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import * as Slider from "@radix-ui/react-slider";
import { fetchProfileOptions, createRoomieProfile, updateUserProfile } from "../services/api";
import "./ProfileStyles.css";

const steps = ["Personal", "Vivienda", "Preferencias", "Intereses"];

/**
 * ProfileForm: Formulario para crear o editar el perfil de roomie.
 * - Soporta modo creación (nuevo perfil) y modo edición (perfil existente).
 * - Formulario multi-paso con validación en cada paso.
 * - Integra con la API para guardar datos.
 */
const ProfileForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determinar si estamos en modo edición
  const isEditMode = location.state?.isEditMode || false;
  const existingProfile = location.state?.profileData || null;

  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [allIntereses, setAllIntereses] = useState([]);
  const [allIdiomas, setAllIdiomas] = useState([]);
  const [nuevoInteres, setNuevoInteres] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    edad: "",
    email: "",
    ubicacion: "",
    ocupacion: "",
    descripcion: "",
    foto: null,
    fotoPreview: null,
    tieneApartamento: "",
    presupuesto: 100,
    nivelSocial: 5,
    nivelLimpieza: 5,
    aceptaFumadores: "",
    aceptaMascotas: "",
    aceptaInvitados: "",
    intereses: [],
    idiomas: [],
  });

  // Inicializar con datos del perfil existente si estamos editando
  useEffect(() => {
    if (isEditMode && existingProfile) {
      setFormData({
        nombre: existingProfile.nombre || "",
        edad: existingProfile.edad?.toString() || "",
        email: existingProfile.email || user?.email || "",
        ubicacion: existingProfile.ubicacion || "",
        ocupacion: existingProfile.ocupacion || "",
        descripcion: existingProfile.descripcion || "",
        foto: null,
        fotoPreview: existingProfile.foto || user?.picture || null,
        tieneApartamento: existingProfile.tieneApartamento || "",
        presupuesto: existingProfile.presupuesto || 100,
        nivelSocial: existingProfile.nivelSocial || 5,
        nivelLimpieza: existingProfile.nivelLimpieza || 5,
        aceptaFumadores: existingProfile.aceptaFumadores || "",
        aceptaMascotas: existingProfile.aceptaMascotas || "",
        aceptaInvitados: existingProfile.aceptaInvitados || "",
        intereses: existingProfile.intereses || [],
        idiomas: existingProfile.idiomas || [],
      });
    } else if (user) {
      setFormData((prev) => ({
        ...prev,
        nombre: prev.nombre || user.name || "",
        email: prev.email || user.email || "",
        fotoPreview: prev.fotoPreview || user.picture || null,
      }));
    }
  }, [user, isEditMode, existingProfile]);

  useEffect(() => {
    const loadOptions = async () => {
      const { intereses, idiomas } = await fetchProfileOptions();
      setAllIntereses(intereses);
      setAllIdiomas(idiomas);
    };
    loadOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
      const maxSize = 2 * 1024 * 1024; // 2MB

      if (!validTypes.includes(file.type)) {
        alert("Solo se permiten imágenes en formato JPG, JPEG, PNG o WEBP.");
        return;
      }

      if (file.size > maxSize) {
        alert("El archivo no debe superar los 2MB.");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        foto: file,
        fotoPreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Crear un objeto con los datos del formulario
      const data = { ...formData };

      // Usar la foto existente (ej. de Google) si no se cargó una nueva
      if (!data.foto && data.fotoPreview) {
        data.foto = data.fotoPreview;
      }

      if (!data.avatar && data.foto) {
        data.avatar = data.foto;
      }

      const payload = { ...data };
      delete payload.fotoPreview;
      
      // Establecer isSearching en false por defecto cuando se complete el formulario
      payload.isSearching = false;

      if (isEditMode) {
        await updateUserProfile(payload, user?.id);
        alert("Perfil actualizado con éxito");
      } else {
        // Pasar el ID del usuario al crear un nuevo perfil
        await createRoomieProfile(payload, user?.id);
        alert("Perfil creado con éxito");
      }
      
      navigate("/perfil");
    } catch (err) {
      console.error(err);
      alert(`Error al ${isEditMode ? 'actualizar' : 'crear'} perfil, vuelve a intentarlo`);
    } finally {
      setLoading(false);
    }
  };

  const validateStep = () => {
    const newErrors = {};

    if (step === 0) {
      if (!formData.nombre.trim()) {
        newErrors.nombre = "El nombre es obligatorio";
      } else if (/\d/.test(formData.nombre)) {
        newErrors.nombre = "El nombre no puede contener números";
      }

      if (!formData.edad.trim()) {
        newErrors.edad = "La edad es obligatoria";
      } else if (isNaN(formData.edad)) {
        newErrors.edad = "La edad debe ser un número";
      } else if (parseInt(formData.edad, 10) < 18) {
        newErrors.edad = "Debes ser mayor de 18 años";
      } else if (parseInt(formData.edad, 10) > 100) {
        newErrors.edad = "Debes ser menor de 100 años";
      }

      if (!formData.ubicacion.trim())
        newErrors.ubicacion = "La ubicación es obligatoria";

      if (!formData.ocupacion.trim())
        newErrors.ocupacion = "La ocupación es obligatoria";

      if (!formData.descripcion.trim())
        newErrors.descripcion = "La descripción es obligatoria";
    }

    if (step === 1) {
      if (!formData.tieneApartamento)
        newErrors.tieneApartamento = "Selecciona una opción";
      if (!formData.presupuesto)
        newErrors.presupuesto = "Define tu presupuesto";
    }
    if (step === 2) {
      if (!formData.aceptaFumadores)
        newErrors.aceptaFumadores = "Selecciona una opción";
      if (!formData.aceptaMascotas)
        newErrors.aceptaMascotas = "Selecciona una opción";
      if (!formData.aceptaInvitados)
        newErrors.aceptaInvitados = "Selecciona una opción";
    }
    if (step === 3) {
      if (!formData.intereses || formData.intereses.length === 0) {
        newErrors.intereses = "Selecciona al menos un interés";
      }
      if (!formData.idiomas || formData.idiomas.length === 0) {
        newErrors.idiomas = "Selecciona al menos un idioma";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleSubmit(e);
    }
  };

  const handleStepClick = (index) => {
    if (index === step) return;

    if (index > step) {
      if (!validateStep()) return;
    }

    setStep(index);
  };

  const handleBack = (e) => {
    e.preventDefault();
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const toggleSelection = (name, value) => {
    setFormData((prev) => {
      const current = prev[name] || [];
      return {
        ...prev,
        [name]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  };

  return (
    <div className="perfil-form-container">
      <button className="back-button" onClick={() => navigate("/perfil")}>
        ← Volver al perfil
      </button>
      <h2>{isEditMode ? 'Editar perfil de roomie' : 'Crear perfil de roomie'}</h2>
      <p className="progress-text">Progreso de perfil</p>

      {/* Barra de progreso */}
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${((step + 1) / steps.length) * 100}%` }}
        ></div>
      </div>

      {/* Tabs */}
      <div className="steps-tabs">
        {steps.map((s, i) => (
          <button
            key={s}
            type="button"
            className={`step-tab ${i === step ? "active" : ""}`}
            onClick={() => handleStepClick(i)}
          >
            {s}
          </button>
        ))}
      </div>

      <form className="perfil-form" onSubmit={handleSubmit}>
        {step === 0 && (
          <>
            <div className="form-group foto-upload-group">
              <label>Foto de perfil</label>

              <div className="foto-upload-wrapper">
                {formData.fotoPreview ? (
                  <img
                    src={formData.fotoPreview}
                    alt="Preview"
                    className="foto-preview"
                  />
                ) : (
                  <div className="foto-placeholder">
                    <span>Sube tu foto</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="foto-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Nombre Completo *</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className={errors.nombre ? "input-error" : ""}
                />
                {errors.nombre && <p className="error-text">{errors.nombre}</p>}
              </div>

              <div className="form-group">
                <label>Edad *</label>
                <input
                  type="text"
                  id="edad"
                  name="edad"
                  value={formData.edad}
                  onChange={handleChange}
                  className={errors.edad ? "input-error" : ""}
                />
                {errors.edad && <p className="error-text">{errors.edad}</p>}
              </div>
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                readOnly
              />
            </div>

            <div className="form-group">
              <label>Ubicación *</label>
              <input
                type="text"
                name="ubicacion"
                value={formData.ubicacion}
                onChange={handleChange}
                placeholder="Ej. Ciudad Quesada, Alajuela"
                maxLength={50}
                className={errors.ubicacion ? "input-error" : ""}
              />
              {errors.ubicacion && (
                <p className="error-text">{errors.ubicacion}</p>
              )}
            </div>

            <div className="form-group">
              <label>Ocupación *</label>
              <input
                type="text"
                name="ocupacion"
                value={formData.ocupacion}
                onChange={handleChange}
                placeholder="Ej. Estudiante, Ingeniero, Diseñador..."
                maxLength={50}
                className={errors.ocupacion ? "input-error" : ""}
              />
              {errors.ocupacion && (
                <p className="error-text">{errors.ocupacion}</p>
              )}
            </div>

            <div className="form-group">
              <label>Descripción personal *</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Cuéntanos sobre ti, tus pasatiempos, qué buscas en un roomie..."
                maxLength={150}
                className={errors.descripcion ? "input-error" : ""}
              />
              {errors.descripcion && (
                <p className="error-text">{errors.descripcion}</p>
              )}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="form-group">
              <label>¿Tienes apartamento?</label>
              <div className="radio-group">
                <label
                  className={`radio-option ${
                    formData.tieneApartamento === "si" ? "active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="tieneApartamento"
                    value="si"
                    checked={formData.tieneApartamento === "si"}
                    onChange={handleRadioChange}
                  />
                  Sí, busco roomie
                </label>

                <label
                  className={`radio-option ${
                    formData.tieneApartamento === "no" ? "active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="tieneApartamento"
                    value="no"
                    checked={formData.tieneApartamento === "no"}
                    onChange={handleRadioChange}
                  />
                  No, busco apartamento
                </label>
              </div>
              {errors.tieneApartamento && (
                <p className="error-text">{errors.tieneApartamento}</p>
              )}
            </div>

            <div className="form-group">
              <label>Presupuesto (USD)</label>
              <div className="range-wrapper">
                <Slider.Root
                  className="slider-root"
                  value={[formData.presupuesto]}
                  min={100}
                  max={2000}
                  step={10}
                  onValueChange={([value]) =>
                    setFormData((prev) => ({ ...prev, presupuesto: value }))
                  }
                >
                  <Slider.Track className="slider-track">
                    <Slider.Range className="slider-range" />
                  </Slider.Track>
                  <Slider.Thumb className="slider-thumb" />
                </Slider.Root>
                <div className="range-value">${formData.presupuesto}</div>
              </div>
              {errors.presupuesto && (
                <p className="error-text">{errors.presupuesto}</p>
              )}
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <div className="form-group">
              <label>Nivel social</label>
              <div className="range-wrapper">
                <Slider.Root
                  className="slider-root"
                  value={[formData.nivelSocial]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={([value]) =>
                    setFormData((prev) => ({ ...prev, nivelSocial: value }))
                  }
                >
                  <Slider.Track className="slider-track">
                    <Slider.Range className="slider-range" />
                  </Slider.Track>
                  <Slider.Thumb className="slider-thumb" />
                </Slider.Root>
                <div className="range-value">{formData.nivelSocial}/10</div>
              </div>
            </div>

            <div className="form-group">
              <label>Nivel de limpieza</label>
              <div className="range-wrapper">
                <Slider.Root
                  className="slider-root"
                  value={[formData.nivelLimpieza]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={([value]) =>
                    setFormData((prev) => ({ ...prev, nivelLimpieza: value }))
                  }
                >
                  <Slider.Track className="slider-track">
                    <Slider.Range className="slider-range" />
                  </Slider.Track>
                  <Slider.Thumb className="slider-thumb" />
                </Slider.Root>
                <div className="range-value">{formData.nivelLimpieza}/10</div>
              </div>
            </div>

            <div className="form-group">
              <label>¿Aceptas fumadores?</label>
              <div className="radio-group">
                <label
                  className={`radio-option ${
                    formData.aceptaFumadores === "si" ? "active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="aceptaFumadores"
                    value="si"
                    checked={formData.aceptaFumadores === "si"}
                    onChange={handleRadioChange}
                  />
                  Sí
                </label>
                <label
                  className={`radio-option ${
                    formData.aceptaFumadores === "no" ? "active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="aceptaFumadores"
                    value="no"
                    checked={formData.aceptaFumadores === "no"}
                    onChange={handleRadioChange}
                  />
                  No
                </label>
              </div>
              {errors.aceptaFumadores && (
                <p className="error-text">{errors.aceptaFumadores}</p>
              )}
            </div>

            <div className="form-group">
              <label>¿Aceptas mascotas?</label>
              <div className="radio-group">
                <label
                  className={`radio-option ${
                    formData.aceptaMascotas === "si" ? "active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="aceptaMascotas"
                    value="si"
                    checked={formData.aceptaMascotas === "si"}
                    onChange={handleRadioChange}
                  />
                  Sí
                </label>
                <label
                  className={`radio-option ${
                    formData.aceptaMascotas === "no" ? "active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="aceptaMascotas"
                    value="no"
                    checked={formData.aceptaMascotas === "no"}
                    onChange={handleRadioChange}
                  />
                  No
                </label>
              </div>
              {errors.aceptaMascotas && (
                <p className="error-text">{errors.aceptaMascotas}</p>
              )}
            </div>

            <div className="form-group">
              <label>¿Aceptas invitados?</label>
              <div className="radio-group">
                <label
                  className={`radio-option ${
                    formData.aceptaInvitados === "si" ? "active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="aceptaInvitados"
                    value="si"
                    checked={formData.aceptaInvitados === "si"}
                    onChange={handleRadioChange}
                  />
                  Sí
                </label>
                <label
                  className={`radio-option ${
                    formData.aceptaInvitados === "no" ? "active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="aceptaInvitados"
                    value="no"
                    checked={formData.aceptaInvitados === "no"}
                    onChange={handleRadioChange}
                  />
                  No
                </label>
              </div>
              {errors.aceptaInvitados && (
                <p className="error-text">{errors.aceptaInvitados}</p>
              )}
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <div className="form-group">
              <label htmlFor="intereses">Intereses</label>
              <p className="form-hint">
                Selecciona tus intereses y pasatiempos para encontrar roomies
                compatibles
              </p>

              <div
                className="chips-container"
                role="group"
                aria-label="Intereses disponibles"
              >
                {allIntereses.map((interes) => (
                  <button
                    type="button"
                    key={interes.id}
                    className={`chip ${
                      formData.intereses.includes(interes.label) ? "active" : ""
                    }`}
                    aria-pressed={formData.intereses.includes(interes.label)}
                    onClick={() => toggleSelection("intereses", interes.label)}
                  >
                    {interes.label}
                  </button>
                ))}

                {formData.intereses
                  .filter((i) => !allIntereses.some((opt) => opt.label === i))
                  .map((custom, idx) => (
                    <button
                      type="button"
                      key={`custom-${idx}`}
                      className={`chip ${
                        formData.intereses.includes(custom) ? "active" : ""
                      }`}
                      aria-pressed={formData.intereses.includes(custom)}
                      onClick={() => toggleSelection("intereses", custom)}
                    >
                      {custom}
                    </button>
                  ))}
              </div>
              {errors.intereses && (
                <p className="error-text">{errors.intereses}</p>
              )}

              <div className="chip-input">
                <input
                  type="text"
                  value={nuevoInteres}
                  onChange={(e) => setNuevoInteres(e.target.value)}
                  placeholder="Escribe un interés y presiona 'Agregar'"
                  maxLength={20}
                  className="chip-text-input"
                />
                <button
                  type="button"
                  className="chip add-chip"
                  onClick={() => {
                    const trimmed = nuevoInteres.trim();

                    if (!trimmed) return;
                    if (formData.intereses.length >= 20) {
                      alert(
                        "Solo puedes agregar hasta 15 intereses personalizados."
                      );
                      return;
                    }
                    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,20}$/.test(trimmed)) {
                      alert(
                        "El interés debe tener solo letras, entre 3 y 20 caracteres."
                      );
                      return;
                    }
                    if (
                      formData.intereses.includes(trimmed) ||
                      allIntereses.some((opt) => opt.label === trimmed)
                    ) {
                      alert("Ese interés ya está en la lista.");
                      return;
                    }

                    toggleSelection("intereses", trimmed);
                    setNuevoInteres("");
                  }}
                >
                  Agregar
                </button>
              </div>
            </div>

            <hr className="section-divider" />

            <div className="form-group">
              <label htmlFor="idiomas">Idiomas</label>
              <p className="form-hint">Idiomas que hablas</p>
              <div
                className="chips-container"
                role="group"
                aria-label="Idiomas disponibles"
              >
                {allIdiomas.map((idioma) => (
                  <button
                    type="button"
                    key={idioma.id}
                    className={`chip ${
                      formData.idiomas.includes(idioma.label) ? "active" : ""
                    }`}
                    aria-pressed={formData.idiomas.includes(idioma.label)}
                    onClick={() => toggleSelection("idiomas", idioma.label)}
                  >
                    {idioma.label}
                  </button>
                ))}

                <button
                  type="button"
                  className={`chip ${
                    formData.idiomas.includes("Otro") ? "active" : ""
                  }`}
                  aria-pressed={formData.idiomas.includes("Otro")}
                  onClick={() => toggleSelection("idiomas", "Otro")}
                >
                  Otro
                </button>
              </div>
              {errors.idiomas && <p className="error-text">{errors.idiomas}</p>}
            </div>
          </>
        )}

        {/* Botones */}
        <div className="form-buttons">
          <button
            type="button"
            onClick={() => navigate("/perfil")}
            className="btn cancel"
          >
            Cancelar
          </button>
          <div className="btn-group">
            {step > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="btn secondary"
              >
                Atrás
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              className="btn primary"
              disabled={loading}
            >
              {loading
                ? "Guardando..."
                : step === steps.length - 1
                ? "Finalizar"
                : "Siguiente"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
