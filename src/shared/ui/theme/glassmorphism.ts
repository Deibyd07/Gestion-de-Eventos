/**
 * Sistema Glassmorphism - EventHub Design System
 * Basado en DESIGN_SYSTEM.md oficial
 */

// Glassmorphism Estándar
export const glassmorphism = {
  // Panel Principal
  panel: {
    base: 'bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20',
    hover: 'hover:shadow-2xl transition-all duration-200',
  },

  // Tarjetas Estadísticas
  card: {
    base: 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg',
    green: 'bg-gradient-to-br from-green-50 to-green-100 border border-green-200',
    purple: 'bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200',
    orange: 'bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200',
  },

  // Fondos de Página
  background: {
    base: 'bg-gradient-to-br from-gray-50/80 to-blue-50/80 backdrop-blur-sm',
  },

  // Headers y Navegación
  header: {
    main: 'bg-gradient-to-r from-purple-600/90 via-purple-600/90 to-blue-500/90 backdrop-blur-md shadow-xl border-b border-white/20',
    sidebar: 'bg-white/80 backdrop-blur-md shadow-xl border-r border-white/20',
  },

  // Overlays y Modales
  overlay: {
    background: 'bg-black/50 backdrop-blur-sm',
    modal: 'bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20',
    dropdown: 'bg-white/95 backdrop-blur-lg rounded-xl shadow-xl border border-white/20',
  },
} as const;

// Clases CSS Reutilizables
export const glassmorphismClasses = {
  // Glassmorphism para paneles
  panel: 'bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20',
  
  // Glassmorphism para tarjetas
  card: 'bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl',
  
  // Glassmorphism para botones
  button: 'backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-200',
  
  // Header glassmorphism
  header: 'bg-gradient-to-r from-purple-600/90 via-purple-600/90 to-blue-500/90 backdrop-blur-md shadow-xl',
  
  // Fondo de página glassmorphism
  background: 'bg-gradient-to-br from-gray-50/80 to-blue-50/80 backdrop-blur-sm',
} as const;

// Variantes de color para tarjetas glassmorphism
export const glassmorphismVariants = {
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

// Utilidades para aplicar glassmorphism
export const applyGlassmorphism = (variant: keyof typeof glassmorphismVariants = 'blue') => {
  const variantStyles = glassmorphismVariants[variant];
  return `bg-gradient-to-br ${variantStyles.background} border ${variantStyles.border} rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg`;
};

export const getGlassmorphismClass = (type: keyof typeof glassmorphismClasses) => {
  return glassmorphismClasses[type];
};
