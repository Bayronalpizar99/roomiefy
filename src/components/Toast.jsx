import React, { useEffect } from 'react';
import './Toast.css';

const Toast = ({ visible, type = 'info', message = '', onClose, duration = 4000, position = 'bottom-right' }) => {
  useEffect(() => {
    if (!visible || !duration) return;
    const t = setTimeout(() => {
      onClose?.();
    }, duration);
    return () => clearTimeout(t);
  }, [visible, duration, onClose]);

  if (!visible) return null;

  return (
    <div className={`toast ${type ? `toast-${type}` : ''} ${position}`} role="alert" aria-live="assertive">
      <span>{message}</span>
      <button className="toast-close" aria-label="Cerrar" onClick={onClose}>×</button>
    </div>
  );
};

export default Toast;
