import React from 'react';

const icons = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
  warning: '⚠️'
};

export const ToastContainer = ({ toasts = [] }) => {
  return (
    <div className="toast-container" id="toastContainer" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type || 'info'}`}>
          <span>{icons[toast.type] || 'ℹ️'}</span>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
};
