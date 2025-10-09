/**
 * Sistema de Scrollbars Personalizados - EventHub Design System
 * Basado en DESIGN_SYSTEM.md oficial
 */

// Scrollbar Personalizado Estándar
export const scrollbarStyles = {
  // Scrollbar para tarjetas blancas
  white: `
    .bg-white::-webkit-scrollbar {
      width: 12px;
    }
    
    .bg-white::-webkit-scrollbar-track {
      background: #f8fafc;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
    }
    
    .bg-white::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, #3b82f6, #1d4ed8);
      border-radius: 6px;
      border: 2px solid #f8fafc;
      transition: all 0.2s ease;
    }
    
    .bg-white::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(180deg, #2563eb, #1e40af);
      border: 2px solid #e0f2fe;
    }
    
    .bg-white::-webkit-scrollbar-thumb:active {
      background: linear-gradient(180deg, #1d4ed8, #1e3a8a);
    }
  `,

  // Scrollbar para Dashboard
  dashboard: `
    .dashboard-container::-webkit-scrollbar {
      width: 14px;
    }
    
    .dashboard-container::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 7px;
      border: 1px solid #e2e8f0;
    }
    
    .dashboard-container::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, #6366f1, #4f46e5);
      border-radius: 7px;
      border: 2px solid #f1f5f9;
      transition: all 0.3s ease;
    }
    
    .dashboard-container::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(180deg, #4f46e5, #3730a3);
      border: 2px solid #e0e7ff;
      transform: scale(1.05);
    }
    
    .dashboard-container::-webkit-scrollbar-thumb:active {
      background: linear-gradient(180deg, #3730a3, #312e81);
    }
  `,

  // Scrollbar para Glassmorphism
  glassmorphism: `
    .glassmorphism-scroll::-webkit-scrollbar {
      width: 12px;
    }
    
    .glassmorphism-scroll::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .glassmorphism-scroll::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, rgba(99, 102, 241, 0.8), rgba(79, 70, 229, 0.8));
      border-radius: 6px;
      border: 2px solid rgba(255, 255, 255, 0.1);
      transition: all 0.2s ease;
    }
    
    .glassmorphism-scroll::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(180deg, rgba(79, 70, 229, 0.9), rgba(55, 48, 163, 0.9));
      border: 2px solid rgba(255, 255, 255, 0.2);
    }
  `,
} as const;

// Clases CSS para aplicar scrollbars
export const scrollbarClasses = {
  // Scrollbar estándar
  standard: 'scrollbar-white',
  
  // Scrollbar dashboard
  dashboard: 'dashboard-container',
  
  // Scrollbar glassmorphism
  glassmorphism: 'glassmorphism-scroll',
  
  // Scrollbar con propiedades específicas
  withProperties: 'overflow-y-auto overflow-x-hidden scrollbar-gutter-stable',
} as const;

// Propiedades de scroll
export const scrollProperties = {
  // Reservar espacio para scrollbar
  gutter: 'scrollbar-gutter: stable',
  
  // Overflow visible
  overflow: 'overflow-y: auto; overflow-x: hidden',
  
  // Altura máxima para activar scroll
  maxHeight: {
    cards: 'max-height: 400px', // Tarjetas
    panels: 'max-height: 500px', // Paneles
  },
} as const;

// Aplicación en elementos
export const scrollbarElementStyles = {
  // Contenedor con scroll
  container: {
    overflowY: 'auto',
    maxHeight: '400px',
    scrollbarGutter: 'stable',
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
  },
  
  // Panel con scroll
  panel: {
    overflowY: 'auto',
    maxHeight: '500px',
    scrollbarGutter: 'stable',
  },
} as const;

// Utilidades para aplicar scrollbars
export const applyScrollbar = (type: keyof typeof scrollbarClasses) => {
  return scrollbarClasses[type];
};

export const getScrollbarStyles = (type: keyof typeof scrollbarStyles) => {
  return scrollbarStyles[type];
};

// Hook para manejar scrollbars
export const useScrollbar = (type: 'white' | 'dashboard' | 'glassmorphism' = 'white') => {
  const scrollbarClass = type === 'white' ? 'scrollbar-white' : 
                        type === 'dashboard' ? 'dashboard-container' : 
                        'glassmorphism-scroll';
  
  const scrollbarStyles = type === 'white' ? scrollbarStyles.white :
                         type === 'dashboard' ? scrollbarStyles.dashboard :
                         scrollbarStyles.glassmorphism;
  
  return {
    className: scrollbarClass,
    styles: scrollbarStyles,
  };
};
