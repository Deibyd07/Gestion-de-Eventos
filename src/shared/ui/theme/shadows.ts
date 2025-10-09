/**
 * Sistema de Sombras - EventHub Design System
 * Basado en DESIGN_SYSTEM.md oficial
 */

// Sombras del Sistema
export const shadows = {
  none: 'none',
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.1)',    // Más usado
  '2xl': '0 25px 50px rgba(0, 0, 0, 0.25)',
} as const;

// Sombras Específicas del Sistema
export const systemShadows = {
  // Tarjetas
  card: {
    base: 'shadow-sm',
    hover: 'hover:shadow-md',
    glassmorphism: 'shadow-xl hover:shadow-2xl',
  },
  
  // Botones
  button: {
    base: 'shadow-sm',
    hover: 'hover:shadow-md',
    glassmorphism: 'shadow-xl hover:shadow-2xl',
  },
  
  // Modales
  modal: {
    overlay: 'shadow-2xl',
    content: 'shadow-2xl',
  },
  
  // Headers
  header: {
    main: 'shadow-xl',
    sidebar: 'shadow-xl',
  },
  
  // Dropdowns
  dropdown: {
    base: 'shadow-xl',
    hover: 'hover:shadow-2xl',
  },
} as const;

// Bordes del Sistema
export const borders = {
  // Bordes estándar
  base: 'border border-gray-200',
  light: 'border border-gray-100',
  dark: 'border border-gray-300',
  
  // Bordes glassmorphism
  glassmorphism: 'border border-white/20',
  glassmorphismLight: 'border border-white/10',
  glassmorphismDark: 'border border-white/30',
  
  // Bordes de estado
  success: 'border border-green-200',
  error: 'border border-red-200',
  warning: 'border border-yellow-200',
  info: 'border border-blue-200',
  
  // Bordes de color
  blue: 'border border-blue-200',
  purple: 'border border-purple-200',
  green: 'border border-green-200',
  orange: 'border border-orange-200',
} as const;

// Bordes Redondeados
export const borderRadius = {
  none: '0px',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px - Más usado
  '2xl': '1rem',    // 16px - Tarjetas
  '3xl': '1.5rem',  // 24px
  full: '9999px',   // Círculos
} as const;

// Clases CSS para uso directo
export const shadowClasses = {
  // Sombras básicas
  none: 'shadow-none',
  sm: 'shadow-sm',
  base: 'shadow',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
  
  // Sombras con hover
  hover: {
    sm: 'shadow-sm hover:shadow-md',
    md: 'shadow-md hover:shadow-lg',
    lg: 'shadow-lg hover:shadow-xl',
    xl: 'shadow-xl hover:shadow-2xl',
  },
  
  // Sombras glassmorphism
  glassmorphism: {
    base: 'shadow-xl',
    hover: 'shadow-xl hover:shadow-2xl',
    card: 'shadow-xl hover:shadow-2xl transition-all duration-200',
  },
} as const;

// Clases de bordes
export const borderClasses = {
  // Bordes estándar
  base: 'border border-gray-200',
  light: 'border border-gray-100',
  dark: 'border border-gray-300',
  
  // Bordes glassmorphism
  glassmorphism: 'border border-white/20',
  glassmorphismLight: 'border border-white/10',
  glassmorphismDark: 'border border-white/30',
  
  // Bordes de estado
  success: 'border border-green-200',
  error: 'border border-red-200',
  warning: 'border border-yellow-200',
  info: 'border border-blue-200',
  
  // Bordes de color
  blue: 'border border-blue-200',
  purple: 'border border-purple-200',
  green: 'border border-green-200',
  orange: 'border border-orange-200',
} as const;

// Clases de border radius
export const borderRadiusClasses = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  base: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  full: 'rounded-full',
} as const;

// Utilidades de sombras
export const getShadow = (size: keyof typeof shadows) => {
  return shadows[size];
};

export const getShadowClass = (size: keyof typeof shadows) => {
  return shadowClasses[size as keyof typeof shadowClasses];
};

export const getBorderClass = (type: keyof typeof borderClasses) => {
  return borderClasses[type];
};

export const getBorderRadiusClass = (size: keyof typeof borderRadiusClasses) => {
  return borderRadiusClasses[size];
};