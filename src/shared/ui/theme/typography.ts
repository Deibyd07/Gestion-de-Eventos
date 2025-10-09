/**
 * Sistema de Tipografía - EventHub Design System
 * Basado en DESIGN_SYSTEM.md oficial
 */

// Sistema de Fuentes Primario
export const fontFamily = {
  primary: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', 'Roboto', sans-serif",
  inter: "'Inter', sans-serif",
  roboto: "'Roboto', sans-serif",
  poppins: "'Poppins', sans-serif",
  openSans: "'Open Sans', sans-serif",
  lato: "'Lato', sans-serif",
} as const;

// Escala Tipográfica
export const fontSize = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: '1rem',     // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem', // 36px
  '5xl': '3rem',    // 48px
  '6xl': '3.75rem', // 60px
} as const;

// Pesos de Fuente
export const fontWeight = {
  thin: 100,
  extralight: 200,
  light: 300,
  normal: 400,
  medium: 500,    // Más usado
  semibold: 600,   // Más usado
  bold: 700,      // Más usado
  extrabold: 800,
  black: 900,
} as const;

// Altura de Línea
export const lineHeight = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,    // Texto regular
  relaxed: 1.625,
  loose: 2,
} as const;

// Estilos de Texto Predefinidos
export const textStyles = {
  // Títulos Principales (Hero)
  hero: {
    fontSize: 'text-5xl md:text-6xl',
    fontWeight: 'font-bold',
    color: 'text-gray-900',
    lineHeight: 'leading-tight',
  },

  // Títulos de Sección (H1)
  h1: {
    fontSize: 'text-3xl',
    fontWeight: 'font-bold',
    color: 'text-gray-900',
    lineHeight: 'leading-tight',
  },

  // Subtítulos (H2)
  h2: {
    fontSize: 'text-2xl',
    fontWeight: 'font-semibold',
    color: 'text-gray-800',
    lineHeight: 'leading-snug',
  },

  // Subtítulos de Tarjetas (H3)
  h3: {
    fontSize: 'text-xl',
    fontWeight: 'font-semibold',
    color: 'text-gray-800',
    lineHeight: 'leading-snug',
  },

  // Subtítulos Pequeños (H4)
  h4: {
    fontSize: 'text-lg',
    fontWeight: 'font-medium',
    color: 'text-gray-700',
    lineHeight: 'leading-snug',
  },

  // Texto Regular (Body)
  body: {
    fontSize: 'text-base',
    fontWeight: 'font-normal',
    color: 'text-gray-600',
    lineHeight: 'leading-relaxed',
  },

  // Texto Pequeño (Small)
  small: {
    fontSize: 'text-sm',
    fontWeight: 'font-normal',
    color: 'text-gray-500',
    lineHeight: 'leading-normal',
  },

  // Texto Muy Pequeño (Caption)
  caption: {
    fontSize: 'text-xs',
    fontWeight: 'font-normal',
    color: 'text-gray-400',
    lineHeight: 'leading-normal',
  },

  // Etiquetas y Labels
  label: {
    fontSize: 'text-sm',
    fontWeight: 'font-medium',
    color: 'text-gray-700',
    lineHeight: 'leading-normal',
  },
} as const;

// Clases CSS para uso directo
export const typographyClasses = {
  // Títulos
  hero: 'text-5xl md:text-6xl font-bold text-gray-900 leading-tight',
  h1: 'text-3xl font-bold text-gray-900 leading-tight',
  h2: 'text-2xl font-semibold text-gray-800 leading-snug',
  h3: 'text-xl font-semibold text-gray-800 leading-snug',
  h4: 'text-lg font-medium text-gray-700 leading-snug',
  
  // Texto
  body: 'text-base text-gray-600 leading-relaxed',
  small: 'text-sm text-gray-500 leading-normal',
  caption: 'text-xs text-gray-400 leading-normal',
  label: 'text-sm font-medium text-gray-700 leading-normal',
  
  // Estados
  success: 'text-green-600',
  error: 'text-red-600',
  warning: 'text-yellow-600',
  info: 'text-blue-600',
  
  // Pesos
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
} as const;

// Utilidades de tipografía
export const getTextStyle = (style: keyof typeof textStyles) => {
  return textStyles[style];
};

export const getTypographyClass = (style: keyof typeof typographyClasses) => {
  return typographyClasses[style];
};