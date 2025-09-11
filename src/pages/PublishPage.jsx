import React from 'react';
import './PageStyles.css';

// NO necesitas importar Navbar ni recibir 'toggleTheme'
const PublishPage = () => {
  return (
    // Renderiza solo el contenido específico de la página
    <>
      <h1>Publicar una Propiedad</h1>
      <p>Completa el formulario para añadir tu propiedad a la lista.</p>
      
      {/* Aquí es donde eventualmente irá tu formulario */}
      <div className="card-placeholder">
        <p>(Formulario próximamente)</p>
      </div>
    </>
  );
};

export default PublishPage;