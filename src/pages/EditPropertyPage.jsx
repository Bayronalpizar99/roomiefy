import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { updateProperty } from '../services/api';
import { CheckboxField, FileUploadBox } from './PublishPage'; 
import './PublishStyles.css'; 
import { useAuth } from '../context/AuthContext'; 

const EditPropertyPage = ({ myProperties, onUpdateProperty }) => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();

  const [propertyToEdit, setPropertyToEdit] = useState(null);
  const [formData, setFormData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // 3. useEffect para cargar los datos en el formulario
  useEffect(() => {
    const property = myProperties.find(p => String(p.id) === String(propertyId));
    if (property) {
      setPropertyToEdit(property); // Guarda la propiedad original

      // Convierte el string/array de amenities a un Set para los checkboxes
      const amenitiesSet = new Set(
        Array.isArray(property.amenities)
          ? property.amenities 
          // Si es un string (de la API), conviértelo
          : typeof property.amenities === 'string'
            ? property.amenities.split(',').map(a => a.trim())
            : []
      );
      
      // 4. Mapea los datos del backend al 'formData' del formulario
      setFormData({
        title: property.name || '', // Backend 'name' -> Form 'title'
        location: property.location || '',
        description: property.description || '',
        price: property.price || '',
        area: property.square_meters || '', // Backend 'square_meters' -> Form 'area'
        bedrooms: property.bedrooms || 1,
        bathrooms: property.bathrooms || 1,
        files: [],
        
        // 👇 --- CORRECCIÓN #1: Aquí ---
        // Comprobamos el string exacto "Wi-Fi" (con guion)
        wifi: amenitiesSet.has('Wi-Fi'),
        garage: amenitiesSet.has('Garage'),
        laundry: amenitiesSet.has('Cuarto de lavado'),
        pool: amenitiesSet.has('Piscina'),
        centrico: amenitiesSet.has('Céntrico'),
      });
    } else {
      alert("Propiedad no encontrada o no te pertenece.");
      navigate('/mis-propiedades');
    }
  }, [propertyId, myProperties, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (uploadedFiles) => {
    setFormData((prev) => ({ ...prev, files: uploadedFiles }));
  };

  // --- 6. handleSubmit MODIFICADO ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verificación de seguridad
    if (!user || user.id !== propertyToEdit.ownerId) {
        alert("No tienes permiso para editar esta propiedad.");
        return;
    }

    setSubmitting(true);
    const amenitiesList = Object.entries({
      wifi: formData.wifi,
      garage: formData.garage,
      laundry: formData.laundry,
      pool: formData.pool,
      centrico: formData.centrico,
    }).filter(([, v]) => v).map(([k]) => {
        if (k === 'wifi') return 'Wi-Fi'; // 👈 Corrección
        if (k === 'laundry') return 'Cuarto de lavado';
        if (k === 'centrico') return 'Céntrico';
        if (k === 'pool') return 'Piscina';
        if (k === 'garage') return 'Garage';
        return k.charAt(0).toUpperCase() + k.slice(1);
    });
    const amenitiesString = amenitiesList.join(',');
    // --- Fin de la Corrección #2 ---

    // 8. CREA EL PAYLOAD CORRECTO (que coincide con el backend)
    const payload = {
      // Campos editables (mapeados)
      name: formData.title,         // form 'title' -> backend 'name'
      location: formData.location,
      description: formData.description,
      price: Number(formData.price),
      square_meters: Number(formData.area), // form 'area' -> backend 'square_meters'
      bedrooms: Number(formData.bedrooms),
      bathrooms: Number(formData.bathrooms),
      amenities: amenitiesString,
      
      // Campos NO editables (los preservamos)
      id: propertyToEdit.id,
      ownerId: propertyToEdit.ownerId,
      owner_name: propertyToEdit.owner_name,
      owner_profile_pic: propertyToEdit.owner_profile_pic,
      rating: propertyToEdit.rating,
      // TODO: La lógica de subida de fotos es separada. Por ahora, preservamos la foto original.
      property_photo: propertyToEdit.property_photo 
    };

    try {
      // 9. Llama a la API (la función que ya corregimos)
      const apiResponse = await updateProperty(propertyId, payload, accessToken);

      // 10. Actualiza el estado global en App.jsx
      // (Convertimos el string 'amenities' de la API de nuevo a un array para el estado de React)
      const updatedPropertyForState = {
        ...apiResponse,
        amenities: apiResponse.amenities ? apiResponse.amenities.split(',').map(a => a.trim()) : [],
      };
      
      onUpdateProperty(propertyId, updatedPropertyForState);
      
      alert('Propiedad actualizada exitosamente.');
      navigate('/mis-propiedades');
    } catch (err) {
      console.error(err);
      alert(`Fallo al actualizar: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!formData) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando datos de la propiedad...</div>;
  }

  return (
    <>
      <h1>Editar Propiedad</h1>
      <p>Modifica los detalles de tu propiedad y guarda los cambios.</p>
      <form onSubmit={handleSubmit} className='publish-form' noValidate>
        {/* El resto del formulario es igual, usando los componentes helpers */}
        <div className="form-row">
            <div className="form-field">
            <label className="form-label">Título de la publicación *</label>
            <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
            </div>
            <div className="form-field">
            <label className="form-label">Ubicación *</label>
            <input type="text" name="location" value={formData.location} onChange={handleInputChange} required />
            </div>
        </div>
        <div className="form-row-numeric">
            <div className="form-field">
                <label className="form-label">Precio *</label>
                <input type="number" name="price" value={formData.price} onChange={handleInputChange} required />
            </div>
            <div className="form-field">
                <label className="form-label">Habitaciones</label>
                <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleInputChange} min="1" />
            </div>
            <div className="form-field">
                <label className="form-label">Baños</label>
                <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleInputChange} min="1" />
            </div>
            <div className="form-field">
                <label className="form-label">Área (m²)</label>
                <input type="number" name="area" value={formData.area} onChange={handleInputChange} />
            </div>
        </div>
        <div className="form-field">
            <label className="form-label">Descripción de la propiedad</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} rows={4} />
        </div>
        <label className="form-label">Comodidades</label>
        <div className="checkbox-row">
            <CheckboxField id="wifi" checked={formData.wifi} onCheckedChange={(val) => handleCheckboxChange('wifi', val)}>WIFI</CheckboxField>
            <CheckboxField id="garage" checked={formData.garage} onCheckedChange={(val) => handleCheckboxChange('garage', val)}>Garage</CheckboxField>
            <CheckboxField id="laundry" checked={formData.laundry} onCheckedChange={(val) => handleCheckboxChange('laundry', val)}>Cuarto de lavado</CheckboxField>
            <CheckboxField id="pool" checked={formData.pool} onCheckedChange={(val) => handleCheckboxChange('pool', val)}>Piscina</CheckboxField>
            <CheckboxField id="centrico" checked={formData.centrico} onCheckedChange={(val) => handleCheckboxChange('centrico', val)}>Céntrico</CheckboxField>
        </div>
        
        {/* Deshabilitamos la subida de archivos en la edición por ahora */}
        {/* <FileUploadBox onFiles={handleFileChange} /> */}
        
        <div className="form-buttons-row">
            <button type="submit" className="form-button" disabled={submitting}>
            {submitting ? 'Guardando…' : 'Guardar Cambios'}
            </button>
            <button type="button" className="form-button2" onClick={() => navigate('/mis-propiedades')}>
            Cancelar
            </button>
        </div>
      </form>
    </>
  );
};

export default EditPropertyPage;