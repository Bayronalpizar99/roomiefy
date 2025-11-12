import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './PublishStyles.css';
import * as Checkbox from '@radix-ui/react-checkbox';
import { CheckIcon, UploadIcon } from '@radix-ui/react-icons';
import { createProperty } from '../services/api';
import placeholderImage from '../assets/placeholder.jpg';
// 1. OBTENEMOS 'user' Y 'requireLogin' DE useAuth
import { useAuth } from '../context/AuthContext'; 

const Label = { Root: (props) => <label {...props} /> };

export function CheckboxField({ id, checked, onCheckedChange, children, required = false }) {
  return (
    <div className="cbx">
      <Checkbox.Root
        id={id}
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(!!v)}
        className="cbx-root"
        required={required ? true : undefined}
      >
        <Checkbox.Indicator className="cbx-indicator">
          <CheckIcon />
        </Checkbox.Indicator>
      </Checkbox.Root>

      <Label.Root htmlFor={id} className="cbx-label">
        {children}{required && <span aria-hidden="true"> *</span>}
      </Label.Root>
    </div>
  );
}

export function FileUploadBox({
  id = 'media',
  label = 'Fotos y videos',
  required = false,
  multiple = true,
  accept = 'image/*,video/*',
  onFiles,
}) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);

  const openFile = () => inputRef.current?.click();

  const handleFiles = useCallback(
    (fileList) => {
      const arr = Array.from(fileList).filter(
        (f) => f.type.startsWith('image/') || f.type.startsWith('video/')
      );
      setFiles(arr);
      onFiles?.(arr);
    },
    [onFiles]
  );

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer?.files?.length) handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  return (
    <div
      className={`file-upload-box${isDragging ? ' dragging' : ''}`}
      onClick={openFile}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      <input
        ref={inputRef}
        id={id}
        type="file"
        multiple={multiple}
        accept={accept}
        required={required}
        style={{ display: 'none' }}
        onChange={(e) => handleFiles(e.target.files)}
      />
      <UploadIcon style={{ width: 24, height: 24, marginBottom: 8 }} />
      <p>Arrastra y suelta tus archivos aquí o haz clic para seleccionar</p>
      <span>{label}</span>
      {files.length > 0 && (
        <ul>
          {files.map((file, idx) => (
            <li key={idx}>{file.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* Página */
const PublishPage = ({ onAddProperty }) => {
  const navigate = useNavigate();
  const { user, requireLogin, accessToken } = useAuth(); 
  const MIN = 1;
  const MAX = 10;

  const [formData, setFormData] = useState({
    title: '',
    location: '',
    description: '',
    price: '',
    area: '',
    bedrooms: MIN,
    bathrooms: MIN,
    files: [],
    wifi: false,
    garage: false,
    laundry: false,
    pool: false,
    centrico: false,
    acceptTerms: false,
  });

  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if ((name === 'price' || name === 'area') && value.startsWith('-')) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (uploadedFiles) => {
    setFormData((prev) => ({ ...prev, files: uploadedFiles }));
  };
  
  // 3. FUNCIÓN 'handleSubmit' MODIFICADA
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 3a. GUARDIA DE AUTENTICACIÓN
    if (!user) {
      requireLogin('Debes iniciar sesión para publicar una propiedad.');
      return;
    }

    if (Number(formData.price) < 0 || (formData.area && Number(formData.area) < 0)) {
      alert('El precio y el área no pueden ser negativos.');
      return;
    }
  
    setSubmitting(true);
  
    // --- 👇 AQUÍ ESTÁ LA CORRECCIÓN ---
    // 3b. CONVERTIMOS AMENITIES A STRING (con los nombres exactos del filtro)
    const amenitiesList = Object.entries({
      wifi: formData.wifi,
      garage: formData.garage,
      laundry: formData.laundry,
      pool: formData.pool,
      centrico: formData.centrico,
    })
    .filter(([, v]) => v)
    .map(([k]) => {
        // Mapeo explícito para coincidir con los filtros
        if (k === 'wifi') return 'Wi-Fi'; // 👈 Corrección
        if (k === 'laundry') return 'Cuarto de lavado';
        if (k === 'centrico') return 'Céntrico';
        if (k === 'pool') return 'Piscina';
        if (k === 'garage') return 'Garage';
        return k.charAt(0).toUpperCase() + k.slice(1);
    });
    // --- FIN DE LA CORRECCIÓN ---
    
    const amenitiesString = amenitiesList.join(','); // "Wi-Fi,Garage,Piscina"

    // 3c. CREAMOS EL PAYLOAD QUE COINCIDE CON EL BACKEND
    const payload = {
      // Mapeamos los campos del formulario al backend
      name: formData.title,         // title -> name
      location: formData.location,
      description: formData.description,
      price: Number(formData.price),
      square_meters: formData.area === '' ? 100 : Number(formData.area), // area -> square_meters (con un default)
      bedrooms: Number(formData.bedrooms),
      bathrooms: Number(formData.bathrooms),
      amenities: amenitiesString,   // Enviamos el string

      // 3d. ✨ INYECTAMOS LOS DATOS DEL USUARIO ✨
      ownerId: user.id,
      owner_name: user.name,
      owner_profile_pic: user.picture,

      // 3e. Campos hardcodeados (el backend los necesita)
      // TODO: Implementar subida de archivos real a Azure Blob Storage
      property_photo: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750", 
      rating: 5 // Asignamos un rating default
    };
  
    try {
      // 4. LLAMAMOS A LA API CON EL PAYLOAD COMPLETO
      const apiResponse = await createProperty(payload, accessToken); // <-- ¡Pasa el token!
  
      // 5. ACTUALIZAMOS EL ESTADO (usando onAddProperty)
      // Creamos el objeto para el estado local, usando los datos reales del 'user'
      const newPropertyForState = {
        ...payload,
        id: apiResponse.id || `local-${Date.now()}`, // Usamos el ID de la DB
        property_photo: payload.property_photo, // Usamos la foto que enviamos
        amenities: amenitiesList, // El estado local SÍ usa un array
        square_meters: payload.square_meters,
        name: payload.name,
        // Los campos ownerId, owner_name, y owner_profile_pic ya están en 'payload'
      };
  
      onAddProperty(newPropertyForState);
      alert('¡Propiedad publicada! Serás redirigido a tus propiedades.');
      navigate('/mis-propiedades');
  
    } catch (err) {
      console.error(err);
      alert(`Fallo al enviar: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <h1>Publicar una Propiedad</h1>
      <p>Completa el formulario para añadir tu propiedad a la lista.</p>

      <form onSubmit={handleSubmit} className='publish-form' noValidate>
        <div className="form-row">
            <div className="form-field">
              <Label.Root className="form-label">Título de la publicación *</Label.Root>
              <input
                type="text"
                name="title" // El formulario usa 'title'
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Ej: Apartamento cómodo en Florencia"
                className="form-input"
                required
              />
            </div>
            <div className="form-field">
              <Label.Root className="form-label">Ubicación *</Label.Root>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Ej: Centro, 1 km antes del parque"
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-row-numeric">
            <div className="form-field">
              <Label.Root className="form-label">Precio *</Label.Root>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="Ej: 250000"
                className="form-input"
                pattern="[0-9]*"
                inputMode="numeric"
                required
              />
            </div>

            <div className="form-field">
              <Label.Root className="form-label">Habitaciones</Label.Root>
              <input
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleInputChange}
                className="form-input"
                min={MIN}
                max={MAX}
                step={1}
              />
            </div>

            <div className="form-field">
              <Label.Root className="form-label">Baños</Label.Root>
              <input
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleInputChange}
                className="form-input"
                min={MIN}
                max={MAX}
                step={1}
              />
            </div>

            <div className="form-field">
              <Label.Root className="form-label">Área (m²)</Label.Root>
              <input
                type="text"
                name="area" // El formulario usa 'area'
                value={formData.area}
                onChange={handleInputChange}
                placeholder="Ej: 80"
                className="form-input"
                pattern="[0-9]*"
                inputMode="numeric"
              />
            </div>
          </div>

          <div className="form-field">
            <Label.Root className="form-label">Descripción de la propiedad</Label.Root>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Descripción de la propiedad..."
              rows={4}
              className="form-textarea"
            />
          </div>

          <Label.Root className="form-label">Comodidades</Label.Root>
          <div className="checkbox-row">
            <CheckboxField id="wifi" checked={formData.wifi} onCheckedChange={(val) => handleCheckboxChange('wifi', val)}>WIFI</CheckboxField>
            <CheckboxField id="garage" checked={formData.garage} onCheckedChange={(val) => handleCheckboxChange('garage', val)}>Garage</CheckboxField>
            <CheckboxField id="laundry" checked={formData.laundry} onCheckedChange={(val) => handleCheckboxChange('laundry', val)}>Cuarto de lavado</CheckboxField>
            <CheckboxField id="pool" checked={formData.pool} onCheckedChange={(val) => handleCheckboxChange('pool', val)}>Piscina</CheckboxField>
            <CheckboxField id="centrico" checked={formData.centrico} onCheckedChange={(val) => handleCheckboxChange('centrico', val)}>Céntrico</CheckboxField>
          </div>

          <FileUploadBox required onFiles={handleFileChange} />

          <div className="form-buttons-row">
            <button type="submit" className="form-button" disabled={submitting}>
              {submitting ? 'Enviando…' : 'Publicar propiedad'}
            </button>
            <button type="button" className="form-button2" onClick={() => navigate(-1)}>
              Cancelar
            </button>
          </div>
      </form>
    </>
  );
};

export default PublishPage;