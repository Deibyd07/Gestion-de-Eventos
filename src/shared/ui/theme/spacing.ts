/**
 * Sistema de Espaciado - EventHub Design System
 * Basado en DESIGN_SYSTEM.md oficial
 */

// Espaciado (Padding & Margin)
export const spacing = {
  0: '0px',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
  24: '6rem',    // 96px
  32: '8rem',    // 128px
} as const;

// Espaciado Vertical (space-y)
export const verticalSpacing = {
  2: '0.5rem',   // Entre elementos
  3: '0.75rem',
  4: '1rem',     // Más común
  6: '1.5rem',
  8: '2rem',
} as const;

// Espaciado Horizontal (space-x)
export const horizontalSpacing = {
  2: '0.5rem',   // Entre elementos
  3: '0.75rem',  // Más común
  4: '1rem',
  6: '1.5rem',
  8: '2rem',
} as const;

// Breakpoints Responsivos - Movido a responsive.ts

// Grid Systems
export const gridSystems = {
  // Grid de Tarjetas (4 columnas)
  cards4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6',
  
  // Grid de Tarjetas (3 columnas)
  cards3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  
  // Grid de Tarjetas (2 columnas)
  cards2: 'grid grid-cols-1 lg:grid-cols-2 gap-6',
  
  // Grid de Panel (Sidebar + Contenido)
  panel: 'grid grid-cols-1 lg:grid-cols-4 gap-0',
} as const;

// Contenedores
export const containers = {
  // Contenedor Principal
  main: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  
  // Contenedor de Ancho Completo
  full: 'w-full max-w-full',
  
  // Contenedor Centrado
  centered: 'mx-auto',
  
  // Contenedor Responsivo
  responsive: 'max-w-full md:max-w-2xl lg:max-w-4xl xl:max-w-6xl',
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

// Estructura de Página Estándar
export const pageStructure = {
  // Estructura base
  base: 'min-h-screen bg-gradient-to-br from-gray-50/80 to-blue-50/80 backdrop-blur-sm',
  
  // Header fijo
  header: 'fixed top-0 left-0 right-0 z-50',
  
  // Contenido principal
  main: 'pt-24 pb-12 px-4 sm:px-6 lg:px-8',
  
  // Contenido con contenedor
  content: 'max-w-7xl mx-auto',
  
  // Footer
  footer: 'bg-gray-900 text-white',
} as const;

// Estructura de Panel de Administración
export const adminPanelStructure = {
  // Contenedor principal
  container: 'p-6 space-y-4',
  
  // Botones de Acción
  actions: 'flex justify-end space-x-3',
  
  // Tarjetas de Métricas
  metrics: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6',
  
  // Contenido Principal
  content: 'space-y-4',
  
  // Filtros
  filters: 'bg-white rounded-xl shadow-sm border border-gray-200 p-4',
  
  // Contenido
  mainContent: 'bg-white rounded-xl shadow-sm border border-gray-200 p-6',
} as const;

// Clases CSS para uso directo
export const spacingClasses = {
  // Padding
  p: {
    0: 'p-0',
    1: 'p-1',
    2: 'p-2',
    3: 'p-3',
    4: 'p-4',
    5: 'p-5',
    6: 'p-6',
    8: 'p-8',
    10: 'p-10',
    12: 'p-12',
  },
  
  // Margin
  m: {
    0: 'm-0',
    1: 'm-1',
    2: 'm-2',
    3: 'm-3',
    4: 'm-4',
    5: 'm-5',
    6: 'm-6',
    8: 'm-8',
    10: 'm-10',
    12: 'm-12',
  },
  
  // Espaciado vertical
  spaceY: {
    2: 'space-y-2',
    3: 'space-y-3',
    4: 'space-y-4',
    6: 'space-y-6',
    8: 'space-y-8',
  },
  
  // Espaciado horizontal
  spaceX: {
    2: 'space-x-2',
    3: 'space-x-3',
    4: 'space-x-4',
    6: 'space-x-6',
    8: 'space-x-8',
  },
} as const;

// Utilidades de espaciado
export const getSpacing = (size: keyof typeof spacing) => {
  return spacing[size];
};

// getSpacingClass movido a responsive.ts