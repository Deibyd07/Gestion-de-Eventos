/**
 * Toast Component - EventHub Design System
 * Basado en DESIGN_SYSTEM.md oficial
 */

import React, { useEffect, useState } from 'react';
import { cn } from '../../utils/cn';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastProps {
  children: React.ReactNode;
  variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  className?: string;
  onClose?: () => void;
  show?: boolean;
}

const toastVariants = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'text-green-600',
    title: 'text-green-800',
    content: 'text-green-700',
    closeButton: 'text-green-600 hover:text-green-800',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-600',
    title: 'text-red-800',
    content: 'text-red-700',
    closeButton: 'text-red-600 hover:text-red-800',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: 'text-yellow-600',
    title: 'text-yellow-800',
    content: 'text-yellow-700',
    closeButton: 'text-yellow-600 hover:text-yellow-800',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    title: 'text-blue-800',
    content: 'text-blue-700',
    closeButton: 'text-blue-600 hover:text-blue-800',
  },
} as const;

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
} as const;

const toastPositions = {
  'top-right': 'fixed top-4 right-4 z-50',
  'top-left': 'fixed top-4 left-4 z-50',
  'bottom-right': 'fixed bottom-4 right-4 z-50',
  'bottom-left': 'fixed bottom-4 left-4 z-50',
  'top-center': 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50',
  'bottom-center': 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50',
} as const;

export const Toast: React.FC<ToastProps> = ({
  children,
  variant = 'info',
  title,
  duration = 5000,
  position = 'bottom-right',
  className,
  onClose,
  show = true,
}) => {
  const [isVisible, setIsVisible] = useState(show);
  const Icon = toastIcons[variant];
  const variantStyles = toastVariants[variant];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) {
          setTimeout(onClose, 300); // Esperar a que termine la animación
        }
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'rounded-lg shadow-lg border p-4 max-w-sm w-full mx-4 animate-slide-in',
        variantStyles.bg,
        variantStyles.border,
        toastPositions[position],
        className
      )}
    >
      <div className="flex items-start">
        <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', variantStyles.icon)} />
        <div className="ml-3 flex-1">
          {title && (
            <p className={cn('text-sm font-semibold', variantStyles.title)}>
              {title}
            </p>
          )}
          <p className={cn('text-sm', title ? 'mt-1' : '', variantStyles.content)}>
            {children}
          </p>
        </div>
        {onClose && (
          <button
            onClick={() => {
              setIsVisible(false);
              if (onClose) {
                setTimeout(onClose, 300);
              }
            }}
            className={cn('ml-4 flex-shrink-0 transition-colors duration-200', variantStyles.closeButton)}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// Toast Container para manejar múltiples toasts
export interface ToastContainerProps {
  children: React.ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  className?: string;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  children,
  position = 'bottom-right',
  className,
}) => {
  return (
    <div
      className={cn(
        'fixed z-50 space-y-2',
        position === 'top-right' && 'top-4 right-4',
        position === 'top-left' && 'top-4 left-4',
        position === 'bottom-right' && 'bottom-4 right-4',
        position === 'bottom-left' && 'bottom-4 left-4',
        position === 'top-center' && 'top-4 left-1/2 transform -translate-x-1/2',
        position === 'bottom-center' && 'bottom-4 left-1/2 transform -translate-x-1/2',
        className
      )}
    >
      {children}
    </div>
  );
};

// Hook para manejar toasts
export interface ToastOptions {
  variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Array<ToastProps & { id: string }>>([]);

  const addToast = (message: string, options: ToastOptions = {}) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastProps & { id: string } = {
      id,
      children: message,
      variant: options.variant || 'info',
      title: options.title,
      duration: options.duration || 5000,
      position: options.position || 'bottom-right',
      onClose: () => removeToast(id),
    };

    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAll = () => {
    setToasts([]);
  };

  return {
    toasts,
    addToast,
    removeToast,
    clearAll,
  };
};
