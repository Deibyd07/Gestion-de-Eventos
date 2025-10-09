/**
 * Sistema Responsive - EventHub Design System
 * Basado en DESIGN_SYSTEM.md oficial
 */

// Breakpoints
export const breakpoints = {
  sm: '640px',   // @media (min-width: 640px)
  md: '768px',   // @media (min-width: 768px)
  lg: '1024px',  // @media (min-width: 1024px)
  xl: '1280px',  // @media (min-width: 1280px)
  '2xl': '1536px', // @media (min-width: 1536px)
} as const;

// Patrones Responsivos
export const responsivePatterns = {
  // Ocultar/Mostrar elementos
  hideShow: {
    hideMobile: 'hidden md:block',
    showMobile: 'block md:hidden',
    hideDesktop: 'block md:hidden',
    showDesktop: 'hidden md:block',
  },
  
  // Flex/Grid responsive
  layout: {
    flexToGrid: 'flex md:grid',
    gridToFlex: 'grid md:flex',
  },
  
  // Grid responsive
  grid: {
    cards4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    cards3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    cards2: 'grid-cols-1 lg:grid-cols-2',
    panel: 'grid-cols-1 lg:grid-cols-4',
  },
  
  // Espaciado responsive
  spacing: {
    padding: 'px-4 sm:px-6 lg:px-8',
    margin: 'mt-4 md:mt-6 lg:mt-8',
    gap: 'gap-4 md:gap-6 lg:gap-8',
  },
  
  // Texto responsive
  text: {
    size: 'text-2xl md:text-3xl lg:text-4xl',
    alignment: 'text-center md:text-left',
    weight: 'font-normal md:font-semibold',
  },
  
  // Contenedor responsive
  container: {
    maxWidth: 'max-w-full md:max-w-2xl lg:max-w-4xl xl:max-w-6xl',
    width: 'w-full md:w-auto',
  },
} as const;

// Mobile Menu Pattern
export const mobileMenuPattern = {
  // Botón de menú móvil
  menuButton: 'md:hidden',
  
  // Navegación desktop
  desktopNav: 'hidden md:flex items-center space-x-4',
  
  // Navegación móvil
  mobileNav: 'md:hidden',
  
  // Links móviles
  mobileLinks: 'md:hidden',
} as const;

// Clases CSS para uso directo
export const responsiveClasses = {
  // Ocultar/Mostrar
  hide: {
    mobile: 'hidden md:block',
    desktop: 'block md:hidden',
    tablet: 'hidden lg:block',
  },
  
  show: {
    mobile: 'block md:hidden',
    desktop: 'hidden md:block',
    tablet: 'block lg:hidden',
  },
  
  // Grid
  grid: {
    cards4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6',
    cards3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    cards2: 'grid grid-cols-1 lg:grid-cols-2 gap-6',
    panel: 'grid grid-cols-1 lg:grid-cols-4 gap-0',
  },
  
  // Espaciado
  spacing: {
    padding: 'px-4 sm:px-6 lg:px-8',
    margin: 'mt-4 md:mt-6 lg:mt-8',
    gap: 'gap-4 md:gap-6 lg:gap-8',
  },
  
  // Texto
  text: {
    size: 'text-2xl md:text-3xl lg:text-4xl',
    alignment: 'text-center md:text-left',
    weight: 'font-normal md:font-semibold',
  },
  
  // Contenedor
  container: {
    main: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    full: 'w-full max-w-full',
    centered: 'mx-auto',
    responsive: 'max-w-full md:max-w-2xl lg:max-w-4xl xl:max-w-6xl',
  },
} as const;

// Utilidades responsive
export const getBreakpoint = (size: keyof typeof breakpoints) => {
  return breakpoints[size];
};

export const getResponsiveClass = (type: keyof typeof responsiveClasses, variant: string) => {
  return responsiveClasses[type][variant as keyof typeof responsiveClasses[typeof type]];
};

export const getGridClass = (type: keyof typeof responsiveClasses.grid) => {
  return responsiveClasses.grid[type];
};

export const getSpacingClass = (type: keyof typeof responsiveClasses.spacing) => {
  return responsiveClasses.spacing[type];
};

export const getTextClass = (type: keyof typeof responsiveClasses.text) => {
  return responsiveClasses.text[type];
};

export const getContainerClass = (type: keyof typeof responsiveClasses.container) => {
  return responsiveClasses.container[type];
};

// Hook para manejar responsive
export const useResponsive = (component: 'grid' | 'spacing' | 'text' | 'container') => {
  const classes = responsiveClasses[component];
  
  return {
    classes,
    getClass: (variant: string) => classes[variant as keyof typeof classes],
  };
};
