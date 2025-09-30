import React, { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
import '../pages/RoomiesPage.css';

const FirstTimeHelp = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('hasSeenRoomiesTutorial');
    if (!seen) {
      setIsOpen(true);
    }
    setHasSeenTutorial(!!seen);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('hasSeenRoomiesTutorial', 'true');
  };

  if (hasSeenTutorial) return null; // Don't render if tutorial has been seen

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content">
          <Dialog.Title>Bienvenido a la página de Roomies!</Dialog.Title>
          <Dialog.Description>
            Comienza con estos consejos:
          </Dialog.Description>
          <ul style={{ marginTop: '1rem', marginBottom: '1rem' }}>
          <li>Usa el botón de filtro (móvil) o la barra lateral (escritorio) para refinar tu búsqueda.</li>
          <li>Prueba la barra de búsqueda para encontrar roomies por nombre o ubicación.</li>
          <li>Cambia entre la vista de cuadrícula y lista usando las opciones de vista.</li>
          <li>Haz clic en una tarjeta de roomie para ver su perfil completo.</li>
          </ul>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <Dialog.Close asChild>
              <button onClick={handleClose} style={{ marginRight: '0.5rem', padding: '0.5rem 1rem', background: 'none', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius)', cursor: 'pointer' }}>
                Entendido
              </button>
            </Dialog.Close>
            <Dialog.Close asChild>
              <button aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>
                <Cross2Icon />
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default FirstTimeHelp;
