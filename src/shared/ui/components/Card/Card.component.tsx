/**
 * Card Component - EventHub Design System
 * Basado en DESIGN_SYSTEM.md oficial
 */

import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'standard' | 'glassmorphism' | 'statistical';
  color?: 'blue' | 'green' | 'purple' | 'orange';
  hover?: boolean;
  className?: string;
  onClick?: () => void;
}

// Variantes de tarjeta
const cardVariants = {
  standard: 'bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200',
  glassmorphism: 'bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-6 hover:shadow-2xl transition-all duration-200',
  statistical: 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-6',
} as const;

// Variantes de color para tarjetas estadísticas
const statisticalColors = {
  blue: {
    background: 'from-blue-50 to-blue-100',
    border: 'border-blue-200',
    icon: 'bg-blue-100 text-blue-600',
  },
  green: {
    background: 'from-green-50 to-green-100',
    border: 'border-green-200',
    icon: 'bg-green-100 text-green-600',
  },
  purple: {
    background: 'from-purple-50 to-purple-100',
    border: 'border-purple-200',
    icon: 'bg-purple-100 text-purple-600',
  },
  orange: {
    background: 'from-orange-50 to-orange-100',
    border: 'border-orange-200',
    icon: 'bg-orange-100 text-orange-600',
  },
} as const;

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'standard',
  color = 'blue',
  hover = true,
  className,
  onClick,
}) => {
  const baseClasses = cardVariants[variant];
  
  // Aplicar color específico para tarjetas estadísticas
  const colorClasses = variant === 'statistical' ? 
    `bg-gradient-to-br ${statisticalColors[color].background} border ${statisticalColors[color].border}` : 
    '';

  return (
    <div
      className={cn(
        baseClasses,
        colorClasses,
        hover && 'hover:shadow-2xl',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// Tarjeta estadística específica
export interface StatisticalCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    type: 'positive' | 'negative' | 'neutral';
  };
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange';
  className?: string;
}

export const StatisticalCard: React.FC<StatisticalCardProps> = ({
  title,
  value,
  change,
  icon,
  color = 'blue',
  className,
}) => {
  const colorStyles = statisticalColors[color];
  
  const changeColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600',
  };

  return (
    <div
      className={cn(
        'bg-gradient-to-br',
        colorStyles.background,
        'border',
        colorStyles.border,
        'rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-6',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className="flex items-center mt-2">
              <span className={cn('text-sm font-medium', changeColors[change.type])}>
                {change.value}
              </span>
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-lg', colorStyles.icon)}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Tarjeta con header y footer
export interface CardWithSectionsProps {
  header?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'standard' | 'glassmorphism';
  className?: string;
}

export const CardWithSections: React.FC<CardWithSectionsProps> = ({
  header,
  children,
  footer,
  variant = 'standard',
  className,
}) => {
  const baseClasses = variant === 'glassmorphism' 
    ? 'bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl'
    : 'bg-white rounded-xl shadow-sm border border-gray-200';

  return (
    <div className={cn(baseClasses, className)}>
      {header && (
        <div className="px-6 py-4 border-b border-gray-200">
          {header}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
};

// Tarjeta de métrica con icono
export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange';
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = 'blue',
  trend,
  className,
}) => {
  const colorStyles = statisticalColors[color];
  
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600',
  };

  return (
    <div
      className={cn(
        'bg-gradient-to-br',
        colorStyles.background,
        'border',
        colorStyles.border,
        'rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-6',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <span className={cn('text-sm font-medium', trendColors[trend.direction])}>
                {trend.value}
              </span>
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-lg', colorStyles.icon)}>
          {icon}
        </div>
      </div>
    </div>
  );
};