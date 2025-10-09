/**
 * Alert Component - EventHub Design System
 * Basado en DESIGN_SYSTEM.md oficial
 */

import React from 'react';
import { cn } from '../../utils/cn';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

export interface AlertProps {
  children: React.ReactNode;
  variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  className?: string;
  onClose?: () => void;
}

const alertVariants = {
  success: {
    container: 'bg-green-50 border-l-4 border-green-500',
    icon: 'text-green-500',
    title: 'text-green-800',
    content: 'text-green-700',
  },
  error: {
    container: 'bg-red-50 border-l-4 border-red-500',
    icon: 'text-red-500',
    title: 'text-red-800',
    content: 'text-red-700',
  },
  warning: {
    container: 'bg-yellow-50 border-l-4 border-yellow-500',
    icon: 'text-yellow-500',
    title: 'text-yellow-800',
    content: 'text-yellow-700',
  },
  info: {
    container: 'bg-blue-50 border-l-4 border-blue-500',
    icon: 'text-blue-500',
    title: 'text-blue-800',
    content: 'text-blue-700',
  },
} as const;

const alertIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
} as const;

export const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  title,
  className,
  onClose,
}) => {
  const Icon = alertIcons[variant];
  const variantStyles = alertVariants[variant];

  return (
    <div
      className={cn(
        'p-4 rounded-r-xl',
        variantStyles.container,
        className
      )}
    >
      <div className="flex">
        <Icon className={cn('w-5 h-5', variantStyles.icon)} />
        <div className="ml-3 flex-1">
          {title && (
            <p className={cn('text-sm font-medium', variantStyles.title)}>
              {title}
            </p>
          )}
          <div className={cn('text-sm', variantStyles.content)}>
            {children}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={cn(
              'ml-4 text-gray-400 hover:text-gray-600 transition-colors duration-200'
            )}
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// Alert con acción
export interface AlertWithActionProps extends AlertProps {
  actionText?: string;
  onAction?: () => void;
  actionVariant?: 'primary' | 'secondary';
}

export const AlertWithAction: React.FC<AlertWithActionProps> = ({
  children,
  variant = 'info',
  title,
  actionText,
  onAction,
  actionVariant = 'primary',
  className,
  onClose,
}) => {
  const Icon = alertIcons[variant];
  const variantStyles = alertVariants[variant];

  const actionButtonClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  };

  return (
    <div
      className={cn(
        'p-4 rounded-r-xl',
        variantStyles.container,
        className
      )}
    >
      <div className="flex">
        <Icon className={cn('w-5 h-5', variantStyles.icon)} />
        <div className="ml-3 flex-1">
          {title && (
            <p className={cn('text-sm font-medium', variantStyles.title)}>
              {title}
            </p>
          )}
          <div className={cn('text-sm', variantStyles.content)}>
            {children}
          </div>
          {actionText && onAction && (
            <div className="mt-3">
              <button
                onClick={onAction}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-md transition-colors duration-200',
                  actionButtonClasses[actionVariant]
                )}
              >
                {actionText}
              </button>
            </div>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// Alert desmontable
export interface DismissibleAlertProps extends AlertProps {
  onDismiss?: () => void;
  dismissible?: boolean;
}

export const DismissibleAlert: React.FC<DismissibleAlertProps> = ({
  children,
  variant = 'info',
  title,
  onDismiss,
  dismissible = true,
  className,
}) => {
  const Icon = alertIcons[variant];
  const variantStyles = alertVariants[variant];

  return (
    <div
      className={cn(
        'p-4 rounded-r-xl',
        variantStyles.container,
        className
      )}
    >
      <div className="flex">
        <Icon className={cn('w-5 h-5', variantStyles.icon)} />
        <div className="ml-3 flex-1">
          {title && (
            <p className={cn('text-sm font-medium', variantStyles.title)}>
              {title}
            </p>
          )}
          <div className={cn('text-sm', variantStyles.content)}>
            {children}
          </div>
        </div>
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
