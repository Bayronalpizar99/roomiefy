import React, { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
import '../pages/RoomiesPage.css'; // Reuse existing styles for consistency

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
          <Dialog.Title>Welcome to the Roomies Page!</Dialog.Title>
          <Dialog.Description>
            Get started with these tips:
            <ul style={{ marginTop: '1rem' }}>
              <li>Use the filter button (mobile) or sidebar (desktop) to narrow your search.</li>
              <li>Try the search bar to find roomies by name or location.</li>
              <li>Switch between grid and list views using the view options.</li>
              <li>Click on a roomie card to view their full profile.</li>
            </ul>
          </Dialog.Description>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <Dialog.Close asChild>
              <button onClick={handleClose} style={{ marginRight: '0.5rem', padding: '0.5rem 1rem', background: 'none', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius)', cursor: 'pointer' }}>
                Got it!
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
