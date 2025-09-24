// src/components/LoginModal.jsx

import React from 'react';
import { useAuth } from '../context/AuthContext';
import LoginButton from './LoginButton';
import { Cross1Icon } from '@radix-ui/react-icons';
import './LoginModal.css';

const LoginModal = () => {
  const { isLoginModalOpen, closeLoginModal, modalMessage } = useAuth();

  if (!isLoginModalOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={closeLoginModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={closeLoginModal}>
          <Cross1Icon />
        </button>
        <h3>Iniciar Sesión</h3>
        <p>{modalMessage}</p>
        <div className="modal-login-button-container">
          <LoginButton />
        </div>
      </div>
    </div>
  );
};

export default LoginModal;