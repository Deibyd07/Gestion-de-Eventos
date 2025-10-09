/**
 * Button Component - EventHub Design System
 * Basado en DESIGN_SYSTEM.md oficial
 */

import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'critical';
  size?: 'sm' | 'md' | 'lg';
  function?: 'export' | 'create' | 'update' | 'import' | 'notify';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

// Variantes de botón por función
const functionVariants = {
  export: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl px-6 py-2.5 font-medium shadow-sm hover:shadow-md transition-all duration-200 hover:from-blue-600 hover:to-purple-700',
  create: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl px-6 py-2.5 font-medium shadow-sm hover:shadow-md transition-all duration-200 hover:from-green-600 hover:to-emerald-700',
  update: 'bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl px-6 py-2.5 font-medium shadow-sm hover:shadow-md transition-all duration-200 hover:from-orange-600 hover:to-red-700',
  import: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl px-6 py-2.5 font-medium shadow-sm hover:shadow-md transition-all duration-200 hover:from-gray-600 hover:to-gray-700',
  notify: 'bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl px-6 py-2.5 font-medium shadow-sm hover:shadow-md transition-all duration-200 hover:from-purple-600 hover:to-pink-700',
} as const;

// Variantes estándar
const standardVariants = {
  primary: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl px-6 py-2.5 font-medium shadow-sm hover:shadow-md transition-all duration-200 hover:from-blue-600 hover:to-purple-700',
  secondary: 'bg-white/10 backdrop-blur-sm text-white rounded-xl px-6 py-2.5 font-medium border border-white/20 hover:bg-white/20 transition-all duration-200',
  tertiary: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-xl transition-all duration-200',
  ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-xl transition-all duration-200',
  critical: 'bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-sm text-red-700 rounded-xl border border-red-200 hover:from-red-500/30 hover:to-red-600/30 hover:text-red-800 transition-all duration-200 shadow-sm hover:shadow-md',
} as const;

// Tamaños
const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-2.5 text-base',
  lg: 'px-8 py-3 text-lg',
} as const;

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  function: functionType,
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  className,
  onClick,
  type = 'button',
}) => {
  // Determinar la variante a usar
  const buttonVariant = functionType ? functionVariants[functionType] : standardVariants[variant];
  
  // Clases de estado
  const stateClasses = {
    disabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
    loading: loading ? 'cursor-wait' : '',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        buttonVariant,
        sizes[size],
        stateClasses.disabled,
        stateClasses.loading,
        className
      )}
    >
      {loading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}
      
      {children}
      
      {!loading && icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  );
};

// Botón con icono específico
export interface IconButtonProps {
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'critical';
  size?: 'sm' | 'md' | 'lg';
  function?: 'export' | 'create' | 'update' | 'import' | 'notify';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variant = 'primary',
  size = 'md',
  function: functionType,
  loading = false,
  disabled = false,
  className,
  onClick,
  type = 'button',
  'aria-label': ariaLabel,
}) => {
  // Determinar la variante a usar
  const buttonVariant = functionType ? functionVariants[functionType] : standardVariants[variant];
  
  // Tamaños para iconos
  const iconSizes = {
    sm: 'p-2',
    md: 'p-2.5',
    lg: 'p-3',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-xl',
        buttonVariant,
        iconSizes[size],
        'disabled:opacity-50 disabled:cursor-not-allowed',
        loading ? 'cursor-wait' : '',
        className
      )}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        icon
      )}
    </button>
  );
};

// Botón de acción crítica
export interface CriticalButtonProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export const CriticalButton: React.FC<CriticalButtonProps> = ({
  children,
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  className,
  onClick,
  type = 'button',
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
        'bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-sm text-red-700 rounded-xl border border-red-200 hover:from-red-500/30 hover:to-red-600/30 hover:text-red-800 shadow-sm hover:shadow-md',
        sizes[size],
        'disabled:opacity-50 disabled:cursor-not-allowed',
        loading ? 'cursor-wait' : '',
        className
      )}
    >
      {loading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      )}
      
      {!loading && icon && (
        <span className="mr-2">{icon}</span>
      )}
      
      {children}
    </button>
  );
};