/**
 * Sistema de Animaciones - EventHub Design System
 * Basado en DESIGN_SYSTEM.md oficial
 */

// Transiciones Estándar
export const transitions = {
  // Transición suave de todos los cambios
  all: 'transition-all duration-200',
  
  // Transición solo de colores
  colors: 'transition-colors duration-200',
  
  // Transición de opacidad
  opacity: 'transition-opacity duration-300',
  
  // Transición de transform
  transform: 'transition-transform duration-200',
} as const;

// Duraciones
export const durations = {
  75: 'duration-75',    // 75ms
  100: 'duration-100',  // 100ms
  150: 'duration-150',  // 150ms
  200: 'duration-200',  // 200ms - Más usado
  300: 'duration-300',  // 300ms
  500: 'duration-500',  // 500ms
  700: 'duration-700',  // 700ms
  1000: 'duration-1000', // 1000ms
} as const;

// Easing
export const easing = {
  linear: 'ease-linear',
  in: 'ease-in',
  out: 'ease-out',
  inOut: 'ease-in-out', // Más usado
} as const;

// Animaciones Personalizadas
export const customAnimations = {
  // Fade In
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    .animate-fade-in {
      animation: fadeIn 0.3s ease-in-out;
    }
  `,

  // Slide In (Desde abajo)
  slideIn: `
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .animate-slide-in {
      animation: slideInUp 0.3s ease-out;
    }
  `,

  // Scale In
  scaleIn: `
    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    
    .animate-scale-in {
      animation: scaleIn 0.2s ease-out;
    }
  `,

  // Spin (Ya incluido en Tailwind)
  spin: 'animate-spin',
  
  // Pulse (Ya incluido en Tailwind)
  pulse: 'animate-pulse',
} as const;

// Efectos Hover Comunes
export const hoverEffects = {
  // Escala al hover
  scale: 'hover:scale-105 transition-transform duration-200',
  
  // Elevación al hover
  elevation: 'hover:shadow-xl transition-shadow duration-200',
  
  // Cambio de color al hover
  color: 'hover:bg-blue-600 transition-colors duration-200',
  
  // Múltiples efectos
  multiple: 'hover:shadow-2xl hover:scale-105 transition-all duration-200',
} as const;

// Clases CSS para uso directo
export const animationClasses = {
  // Transiciones
  transition: {
    all: 'transition-all duration-200',
    colors: 'transition-colors duration-200',
    opacity: 'transition-opacity duration-300',
    transform: 'transition-transform duration-200',
  },
  
  // Animaciones
  animation: {
    fadeIn: 'animate-fade-in',
    slideIn: 'animate-slide-in',
    scaleIn: 'animate-scale-in',
    spin: 'animate-spin',
    pulse: 'animate-pulse',
  },
  
  // Hover effects
  hover: {
    scale: 'hover:scale-105 transition-transform duration-200',
    elevation: 'hover:shadow-xl transition-shadow duration-200',
    color: 'hover:bg-blue-600 transition-colors duration-200',
    multiple: 'hover:shadow-2xl hover:scale-105 transition-all duration-200',
  },
} as const;

// Utilidades de animación
export const getTransition = (type: keyof typeof transitions) => {
  return transitions[type];
};

export const getDuration = (duration: keyof typeof durations) => {
  return durations[duration];
};

export const getEasing = (ease: keyof typeof easing) => {
  return easing[ease];
};

export const getAnimation = (animation: keyof typeof customAnimations) => {
  return customAnimations[animation];
};

export const getHoverEffect = (effect: keyof typeof hoverEffects) => {
  return hoverEffects[effect];
};

// Hook para manejar animaciones
export const useAnimation = (type: 'fadeIn' | 'slideIn' | 'scaleIn' = 'fadeIn') => {
  const animationClass = type === 'fadeIn' ? 'animate-fade-in' :
                        type === 'slideIn' ? 'animate-slide-in' :
                        'animate-scale-in';
  
  return {
    className: animationClass,
    styles: customAnimations[type],
  };
};
