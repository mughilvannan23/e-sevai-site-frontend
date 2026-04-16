import React, { createContext, useContext, useState, useEffect } from 'react';

const ToastContext = createContext();

const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getStyles = () => {
    const base = {
      container: {
        position: 'relative',
        padding: '12px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        animation: visible ? 'slideIn 0.3s ease' : 'slideOut 0.3s ease',
        maxWidth: '400px',
        minWidth: '300px'
      },
      icon: {
        fontSize: '20px'
      },
      message: {
        flex: 1,
        fontSize: '14px',
        fontWeight: '500'
      },
      closeBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    };

    switch (type) {
      case 'success':
        return {
          ...base,
          container: {
            ...base.container,
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            color: '#155724'
          }
        };
      case 'error':
        return {
          ...base,
          container: {
            ...base.container,
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            color: '#721c24'
          }
        };
      case 'warning':
        return {
          ...base,
          container: {
            ...base.container,
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeeba',
            color: '#856404'
          }
        };
      default:
        return {
          ...base,
          container: {
            ...base.container,
            backgroundColor: '#d1ecf1',
            border: '1px solid #bee5eb',
            color: '#0c5460'
          }
        };
    }
  };

  const styles = getStyles();

  const getIcon = () => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      default: return 'ℹ';
    }
  };

  return (
    <>
      <style>
        {`
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
          @keyframes slideOut {
            from {
              transform: translateX(0);
              opacity: 1;
            }
            to {
              transform: translateX(100%);
              opacity: 0;
            }
          }
        `}
      </style>
      <div style={styles.container}>
        <span style={styles.icon}>{getIcon()}</span>
        <span style={styles.message}>{message}</span>
        <button
          style={styles.closeBtn}
          onClick={() => {
            setVisible(false);
            onClose?.();
          }}
        >
          ✕
        </button>
      </div>
    </>
  );
};

let toastIdCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 3000) => {
    const id = `toast_${++toastIdCounter}`;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const success = (message, duration) => addToast(message, 'success', duration);
  const error = (message, duration) => addToast(message, 'error', duration);
  const warning = (message, duration) => addToast(message, 'warning', duration);
  const info = (message, duration) => addToast(message, 'info', duration);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {toasts.map((toast) => (
          <Toast key={toast.id} message={toast.message} type={toast.type} duration={toast.duration} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default Toast;
