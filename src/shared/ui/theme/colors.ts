/**
 * Sistema de Colores - EventHub Design System
 * Basado en DESIGN_SYSTEM.md oficial
 */

export const colors = {
  // Púrpura (Brand Primary)
  purple: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7', // Principal
    600: '#9333EA', // Acción
    700: '#7E22CE',
    800: '#6B21A8',
    900: '#581C87',
  },

  // Azul (Brand Secondary)
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6', // Principal
    600: '#2563EB', // Acción
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // Verde (Éxito/Crear)
  green: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E', // Éxito
    600: '#16A34A', // Crear
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },

  // Emerald para gradientes
  emerald: {
    600: '#059669', // Gradiente
    700: '#047857', // Gradiente Hover
  },

  // Rojo (Error/Actualizar)
  red: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444', // Error
    600: '#DC2626', // Actualizar
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  // Naranja (Advertencia/Energía)
  orange: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316', // Advertencia
    600: '#EA580C', // Actualizar
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
  },

  // Amarillo (Alerta)
  yellow: {
    50: '#FEFCE8',
    100: '#FEF9C3',
    200: '#FEF08A',
    300: '#FDE047',
    400: '#FACC15',
    500: '#EAB308', // Alerta
    600: '#CA8A04',
    700: '#A16207',
    800: '#854D0E',
    900: '#713F12',
  },

  // Rosa (Comunicación)
  pink: {
    50: '#FDF2F8',
    100: '#FCE7F3',
    200: '#FBCFE8',
    300: '#F9A8D4',
    400: '#F472B6',
    500: '#EC4899', // Principal
    600: '#DB2777', // Acción
    700: '#BE185D',
    800: '#9D174D',
    900: '#831843',
  },

  // Índigo (Glassmorphism)
  indigo: {
    50: '#EEF2FF',
    100: '#E0E7FF', // Glassmorphism
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1',
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },

  // Grises
  gray: {
    50: '#F9FAFB', // Fondos claros
    100: '#F3F4F6',
    200: '#E5E7EB', // Bordes
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280', // Texto secundario
    600: '#4B5563', // Texto principal
    700: '#374151',
    800: '#1F2937', // Texto oscuro
    900: '#111827', // Texto muy oscuro
  },

  // Blanco y Negro
  white: '#FFFFFF',
  black: '#000000',
} as const;

// Transparencias específicas del sistema
export const transparencies = {
  white: {
    5: 'rgba(255, 255, 255, 0.05)',
    10: 'rgba(255, 255, 255, 0.1)',
    20: 'rgba(255, 255, 255, 0.2)',
    30: 'rgba(255, 255, 255, 0.3)',
    80: 'rgba(255, 255, 255, 0.8)',
    90: 'rgba(255, 255, 255, 0.9)',
    95: 'rgba(255, 255, 255, 0.95)',
    98: 'rgba(255, 255, 255, 0.98)',
  },
  gray: {
    50_80: 'rgba(249, 250, 251, 0.8)',
  },
  blue: {
    50_80: 'rgba(239, 246, 255, 0.8)',
  },
} as const;

// Gradientes específicos del sistema
export const gradients = {
  // Botones por función
  export: 'from-blue-500 to-purple-600',
  create: 'from-green-500 to-emerald-600',
  update: 'from-orange-500 to-red-600',
  import: 'from-gray-500 to-gray-600',
  notify: 'from-purple-500 to-pink-600',
  
  // Glassmorphism
  glassmorphism: 'from-white to-indigo-100/98',
  glassmorphismCard: 'from-blue-50 to-blue-100',
  glassmorphismGreen: 'from-green-50 to-green-100',
  glassmorphismPurple: 'from-purple-50 to-purple-100',
  glassmorphismOrange: 'from-orange-50 to-orange-100',
  
  // Headers
  header: 'from-purple-600/90 via-purple-600/90 to-blue-500/90',
  
  // Fondos
  background: 'from-gray-50/80 to-blue-50/80',
  
  // Multi-color gradients
  brand: 'from-purple-500 to-blue-600',
  sunset: 'from-orange-500 to-red-600',
  ocean: 'from-blue-500 to-indigo-600',
  forest: 'from-green-500 to-emerald-600',
  royal: 'from-purple-500 to-pink-600',
} as const;

// Utility function to get color by shade
export const getColor = (color: keyof typeof colors, shade: 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900) => {
  return (colors[color] as any)[shade];
};