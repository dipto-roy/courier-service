'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ToastContainer, ToastProps } from '../components/feedback/Toast';

type ToastVariant = 'default' | 'success' | 'error' | 'warning';

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextType {
  toast: (options: ToastOptions) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (options: ToastOptions) => {
      const id = Math.random().toString(36).substring(7);
      const duration = options.duration ?? 5000;

      const newToast: ToastProps = {
        id,
        title: options.title,
        description: options.description,
        variant: options.variant ?? 'default',
        onClose: () => removeToast(id),
      };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toast = useCallback(
    (options: ToastOptions) => {
      addToast(options);
    },
    [addToast]
  );

  const success = useCallback(
    (message: string, title?: string) => {
      addToast({
        title: title || 'Success',
        description: message,
        variant: 'success',
      });
    },
    [addToast]
  );

  const error = useCallback(
    (message: string, title?: string) => {
      addToast({
        title: title || 'Error',
        description: message,
        variant: 'error',
      });
    },
    [addToast]
  );

  const warning = useCallback(
    (message: string, title?: string) => {
      addToast({
        title: title || 'Warning',
        description: message,
        variant: 'warning',
      });
    },
    [addToast]
  );

  const info = useCallback(
    (message: string, title?: string) => {
      addToast({
        title: title || 'Info',
        description: message,
        variant: 'default',
      });
    },
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
