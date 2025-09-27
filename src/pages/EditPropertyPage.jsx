import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { updateProperty } from '../services/api';
import { CheckboxField, FileUploadBox } from './PublishPage';
import './PublishStyles.css';
import placeholderImage from '../assets/placeholder.jpg'; // Importa la imagen local

const EditPropertyPage = ({ myProperties, onUpdateProperty }) => {
  const { propertyId } = useParams();
  const navigate = useNavigate();

  const [propertyToEdit, setPropertyToEdit] = useState(null);
  const [formData, setFormData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const property = myProperties.find(p => String(p.id) === String(propertyId));
    if (property) {
      setPropertyToEdit(property);
      setFormData({
        title: property.name || property.title || '',
        location: property.location || '',
        description: property.description || '',
        price: property.price || '',
        area: property.square_meters || property.area || '',
        bedrooms: property.bedrooms || 1,
        bathrooms: property.bathrooms || 1,
        files: [],
        wifi: property.amenities.includes('wifi'),
        garage: property.amenities.includes('garage'),
        laundry: property.amenities.includes('laundry'),
        pool: property.amenities.includes('pool'),
        centrico: property.amenities.includes('centrico'),
      });
    } else {
      alert("Propiedad no encontrada.");
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

  // --- INICIO DE LA MODIFICACIÓN ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Lógica para manejar la imagen
    let newImagePreviewUrl = propertyToEdit.property_photo || placeholderImage;
    if (formData.files.length > 0) {
      // Si se subió un nuevo archivo, lo convertimos a Base64
      try {
        newImagePreviewUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(formData.files[0]);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
        });
      } catch (error) {
        console.error("Error al leer el nuevo archivo de imagen:", error);
      }
    }

    const payload = {
      title: formData.title,
      location: formData.location,
      description: formData.description,
      price: Number(formData.price),
      area: formData.area === '' ? null : Number(formData.area),
      bedrooms: Number(formData.bedrooms),
      bathrooms: Number(formData.bathrooms),
      amenities: Object.entries({
        wifi: formData.wifi,
        garage: formData.garage,
        laundry: formData.laundry,
        pool: formData.pool,
        centrico: formData.centrico,
      }).filter(([, v]) => v).map(([k]) => k),
      files: formData.files.map((f) => f.name),
    };

    try {
      await updateProperty(propertyId, payload);

      const updatedPropertyForState = {
        ...propertyToEdit,
        ...payload,
        name: payload.title,
        square_meters: payload.area,
        property_photo: newImagePreviewUrl, // <-- Usamos la URL de la nueva imagen
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
  // --- FIN DE LA MODIFICACIÓN ---

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
        <FileUploadBox onFiles={handleFileChange} />
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