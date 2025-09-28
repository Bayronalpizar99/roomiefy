import React, { useState } from 'react';
import './WelcomeTourDialog.css';
import * as Dialog from '@radix-ui/react-dialog';
import { HomeIcon, UploadIcon, PersonIcon, ChatBubbleIcon, ChevronRightIcon, Cross2Icon } from '@radix-ui/react-icons';

// Lista de pasos para el tour
const steps = [
  {
    id: 1,
    title: 'Explora Propiedades',
    description: 'Encuentra el lugar perfecto. Mira apartamentos en alquiler y contacta al dueño directamente para más detalles.',
    icon: <HomeIcon className="step-icon" />,
    actionText: 'Ir a Explorar',
  },
  {
    id: 2,
    title: 'Publica tu Apartamento',
    description: '¿Tienes un espacio? Sube tu anuncio de forma rápida y espera a que los demás lo descubran por zona.',
    icon: <UploadIcon className="step-icon" />,
    actionText: 'Crear Anuncio',
  },
  {
    id: 3,
    title: 'Busca tu Roomie',
    description: 'Conecta con la gente adecuada. Publica tu perfil indicando si tienes o buscas apartamento.',
    icon: <PersonIcon className="step-icon" />,
  },
  {
    id: 4,
    title: 'Conecta y Cierra el Trato',
    description: 'Una vez que encuentres tu match, contacta directamente con dueños o roomies para acordar los detalles.',
    icon: <ChatBubbleIcon className="step-icon" />,
    actionText: '¡Listo para empezar!',
  },
];

const WelcomeTourDialog = ({ isOpen, setIsOpen, handleClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const currentStepData = steps.find((step) => step.id === currentStep);
  const totalSteps = steps.length;
  const isLastStep = currentStep === totalSteps;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose?.();
    }
  };

  const handleSkip = () => {
    handleClose?.();
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose?.();
        else setIsOpen?.(true);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content welcome-tour-dialog">
          <Dialog.Title className="dialog-title-centered">
            ¡Bienvenido a Roomiefy! 🎉
          </Dialog.Title>

          <div className="step-indicator">Paso {currentStep} de {totalSteps}</div>

          <div className="step-content-container">
            {currentStepData?.icon}
            <h3 className="step-title">{currentStepData?.title}</h3>
            <p className="step-description">{currentStepData?.description}</p>

            {currentStep === 3 && (
              <div className="roomie-options">
                <p>Elige tu rol:</p>
                <button className="option-button">
                  <span className="bullet-point">🏠</span> Tengo apartamento, busco roomie
                </button>
                <button className="option-button">
                  <span className="bullet-point">🔍</span> Busco apartamento, busco roomie
                </button>
              </div>
            )}

            <hr className="step-separator" />

            <div className="dialog-actions-footer">
              {!isLastStep && (
                <button
                  onClick={handleSkip}
                  className="skip-button"
                  style={{ background: 'none', border: 'none', color: 'gray', cursor: 'pointer', padding: '0.5rem' }}
                >
                  Saltar Tour
                </button>
              )}

              <button
                onClick={handleNext}
                className={`primary-action-button ${isLastStep ? 'finish-button' : ''}`}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: isLastStep ? 'var(--color-primary)' : 'var(--color-secondary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--border-radius)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                }}
              >
                {isLastStep ? currentStepData?.actionText : `Siguiente`}
                {!isLastStep && <ChevronRightIcon style={{ marginLeft: '0.5rem' }} />}
              </button>
            </div>
          </div>

          <Dialog.Close asChild>
            <button aria-label="Cerrar" className="close-button" onClick={handleClose}>
              <Cross2Icon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default WelcomeTourDialog;