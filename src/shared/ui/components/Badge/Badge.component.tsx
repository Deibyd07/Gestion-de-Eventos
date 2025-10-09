/**
 * Badge Component - EventHub Design System
 * Basado en DESIGN_SYSTEM.md oficial
 */

import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'error' | 'warning' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const badgeVariants = {
  success: 'bg-green-100 text-green-800 border border-green-200',
  error: 'bg-red-100 text-red-800 border border-red-200',
  warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  info: 'bg-blue-100 text-blue-800 border border-blue-200',
  neutral: 'bg-gray-100 text-gray-800 border border-gray-200',
} as const;

const badgeSizes = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1 text-xs',
  lg: 'px-4 py-2 text-sm',
} as const;

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className,
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        badgeVariants[variant],
        badgeSizes[size],
        className
      )}
    >
      {children}
    </span>
  );
};

// Badge con icono
export interface BadgeWithIconProps extends BadgeProps {
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const BadgeWithIcon: React.FC<BadgeWithIconProps> = ({
  children,
  icon,
  iconPosition = 'left',
  variant = 'neutral',
  size = 'md',
  className,
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        badgeVariants[variant],
        badgeSizes[size],
        className
      )}
    >
      {icon && iconPosition === 'left' && (
        <span className="mr-1">{icon}</span>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <span className="ml-1">{icon}</span>
      )}
    </span>
  );
};

// Badge de estado específico
export interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusVariants = {
  active: 'bg-green-100 text-green-800 border border-green-200',
  inactive: 'bg-gray-100 text-gray-800 border border-gray-200',
  pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  completed: 'bg-blue-100 text-blue-800 border border-blue-200',
  cancelled: 'bg-red-100 text-red-800 border border-red-200',
} as const;

const statusLabels = {
  active: 'Activo',
  inactive: 'Inactivo',
  pending: 'Pendiente',
  completed: 'Completado',
  cancelled: 'Cancelado',
} as const;

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className,
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        statusVariants[status],
        badgeSizes[size],
        className
      )}
    >
      {statusLabels[status]}
    </span>
  );
};

// Badge de rol
export interface RoleBadgeProps {
  role: 'admin' | 'organizer' | 'attendee';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const roleVariants = {
  admin: 'bg-purple-100 text-purple-800 border border-purple-200',
  organizer: 'bg-blue-100 text-blue-800 border border-blue-200',
  attendee: 'bg-green-100 text-green-800 border border-green-200',
} as const;

const roleLabels = {
  admin: 'Administrador',
  organizer: 'Organizador',
  attendee: 'Asistente',
} as const;

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  size = 'md',
  className,
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        roleVariants[role],
        badgeSizes[size],
        className
      )}
    >
      {roleLabels[role]}
    </span>
  );
};
