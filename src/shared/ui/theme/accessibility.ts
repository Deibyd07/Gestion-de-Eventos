/**
 * Sistema de Accesibilidad - EventHub Design System
 * Basado en DESIGN_SYSTEM.md oficial
 */

// Contraste de Colores
export const contrast = {
  // Texto sobre Fondos Claros
  lightBackground: {
    primary: 'text-gray-900',    // Contraste mínimo: 4.5:1
    secondary: 'text-gray-800',  // Contraste mínimo: 4.5:1
    tertiary: 'text-gray-700',  // Contraste mínimo: 4.5:1
  },
  
  // Texto sobre Fondos Oscuros
  darkBackground: {
    primary: 'text-white',      // Contraste mínimo: 4.5:1
    secondary: 'text-gray-100', // Contraste mínimo: 4.5:1
  },
  
  // Botones
  buttons: {
    primary: 'text-white bg-blue-600',      // Contraste suficiente
    secondary: 'text-gray-700 bg-gray-200', // Contraste suficiente
    danger: 'text-white bg-red-600',        // Contraste suficiente
  },
} as const;

// Focus States
export const focusStates = {
  // Focus estándar
  standard: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  
  // Focus para botones
  button: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  
  // Focus para inputs
  input: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
  
  // Focus para links
  link: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
} as const;

// Etiquetas Semánticas
export const semanticElements = {
  // Elementos HTML semánticos
  header: '<header>',
  nav: '<nav>',
  main: '<main>',
  footer: '<footer>',
  article: '<article>',
  section: '<section>',
  aside: '<aside>',
} as const;

// Etiquetas ARIA
export const ariaLabels = {
  // Etiquetas ARIA comunes
  label: 'aria-label="Descripción"',
  labelledBy: 'aria-labelledby="id-del-label"',
  describedBy: 'aria-describedby="id-de-descripcion"',
  hidden: 'aria-hidden="true"',
  role: 'role="button"',
  
  // Estados ARIA
  expanded: 'aria-expanded="true"',
  collapsed: 'aria-expanded="false"',
  selected: 'aria-selected="true"',
  checked: 'aria-checked="true"',
  
  // Navegación ARIA
  current: 'aria-current="page"',
  live: 'aria-live="polite"',
  atomic: 'aria-atomic="true"',
} as const;

// Navegación por Teclado
export const keyboardNavigation = {
  // Navegación estándar
  tab: 'Tab para navegar entre elementos',
  enter: 'Enter/Space para activar botones',
  escape: 'Escape para cerrar modales',
  arrows: 'Flechas para navegación en menús',
  
  // Atajos de teclado
  shortcuts: {
    close: 'Escape',
    submit: 'Enter',
    cancel: 'Escape',
    next: 'Tab',
    previous: 'Shift + Tab',
  },
} as const;

// Texto Alternativo
export const altText = {
  // Imágenes con texto alternativo
  image: 'alt="Descripción significativa"',
  
  // Iconos decorativos
  decorative: 'aria-hidden="true"',
  
  // Iconos con significado
  meaningful: 'aria-label="Descripción del ícono"',
} as const;

// Clases CSS para uso directo
export const accessibilityClasses = {
  // Focus states
  focus: {
    standard: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    button: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    input: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    link: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  },
  
  // Contraste
  contrast: {
    primary: 'text-gray-900',
    secondary: 'text-gray-800',
    tertiary: 'text-gray-700',
    light: 'text-white',
    lightSecondary: 'text-gray-100',
  },
  
  // Estados
  states: {
    disabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
    loading: 'cursor-wait',
    error: 'border-red-300 focus:ring-red-500 focus:border-red-500',
    success: 'border-green-300 focus:ring-green-500 focus:border-green-500',
  },
} as const;

// Utilidades de accesibilidad
export const getFocusClass = (element: keyof typeof focusStates) => {
  return focusStates[element];
};

export const getContrastClass = (type: keyof typeof contrast, variant: string) => {
  return contrast[type][variant as keyof typeof contrast[typeof type]];
};

export const getAriaLabel = (type: keyof typeof ariaLabels) => {
  return ariaLabels[type];
};

export const getAccessibilityClass = (type: keyof typeof accessibilityClasses, variant: string) => {
  return accessibilityClasses[type][variant as keyof typeof accessibilityClasses[typeof type]];
};

// Hook para manejar accesibilidad
export const useAccessibility = (element: 'button' | 'input' | 'link' | 'image') => {
  const focusClass = element === 'button' ? focusStates.button :
                    element === 'input' ? focusStates.input :
                    element === 'link' ? focusStates.link :
                    focusStates.standard;
  
  const ariaAttributes = element === 'image' ? {
    alt: 'alt="Descripción significativa"',
    hidden: 'aria-hidden="true"',
  } : {
    label: 'aria-label="Descripción"',
    describedBy: 'aria-describedby="id-de-descripcion"',
  };
  
  return {
    focusClass,
    ariaAttributes,
  };
};
