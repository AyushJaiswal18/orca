/**
 * Toast Notification Context
 * Provides toast notification functionality throughout the app
 */

import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

/**
 * Toast Provider Component
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type, duration };

    setToasts((prev) => [...prev, toast]);

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message, duration) => {
    return addToast(message, 'success', duration);
  }, [addToast]);

  const error = useCallback((message, duration) => {
    return addToast(message, 'error', duration);
  }, [addToast]);

  const info = useCallback((message, duration) => {
    return addToast(message, 'info', duration);
  }, [addToast]);

  const warning = useCallback((message, duration) => {
    return addToast(message, 'warning', duration);
  }, [addToast]);

  const value = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

/**
 * Toast Container Component
 */
const ToastContainer = () => {
  const { toasts, removeToast } = useContext(ToastContext);

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

/**
 * Individual Toast Component
 */
const Toast = ({ toast, onClose }) => {
  const getToastStyles = (type) => {
    const baseStyles = {
      padding: '12px 20px',
      borderRadius: '4px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      minWidth: '300px',
      maxWidth: '500px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      animation: 'slideIn 0.3s ease-out',
    };

    const typeStyles = {
      success: {
        backgroundColor: '#10b981',
        color: 'white',
      },
      error: {
        backgroundColor: '#ef4444',
        color: 'white',
      },
      info: {
        backgroundColor: '#3b82f6',
        color: 'white',
      },
      warning: {
        backgroundColor: '#f59e0b',
        color: 'white',
      },
    };

    return { ...baseStyles, ...typeStyles[type] };
  };

  return (
    <div style={getToastStyles(toast.type)}>
      <span>{toast.message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'inherit',
          cursor: 'pointer',
          fontSize: '18px',
          marginLeft: '10px',
          padding: '0',
          lineHeight: '1',
        }}
        aria-label="Close"
      >
        ×
      </button>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Hook to use toast notifications
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export default ToastContext;

