/**
 * Sistema de Z-Index - EventHub Design System
 * Basado en DESIGN_SYSTEM.md oficial
 */

// Jerarquía de Z-Index
export const zIndex = {
  base: 0,        // Base
  elevated: 10,   // Elementos elevados ligeramente
  header: 20,     // Headers, footers
  floating: 30,   // Elementos flotantes
  overlay: 40,    // Overlays de fondo
  dropdown: 50,    // Dropdowns, tooltips, menús
  modal: 100,     // Modales, diálogos
} as const;

// Aplicación por Componente
export const componentZIndex = {
  // Header fijo
  header: 'z-50',
  
  // Sidebar
  sidebar: 'z-10',
  
  // Floating cart
  floatingCart: 'z-30',
  
  // Overlay de fondo (modal)
  overlay: 'z-40',
  
  // Modal
  modal: 'z-[100]',
  
  // Dropdown menu
  dropdown: 'z-50',
  
  // Toast notifications
  toast: 'z-50',
  
  // Tooltip
  tooltip: 'z-50',
  
  // Loading overlay
  loading: 'z-[100]',
} as const;

// Clases CSS para uso directo
export const zIndexClasses = {
  // Z-Index básicos
  base: 'z-0',
  elevated: 'z-10',
  header: 'z-20',
  floating: 'z-30',
  overlay: 'z-40',
  dropdown: 'z-50',
  modal: 'z-[100]',
  
  // Z-Index específicos
  headerFixed: 'z-50',
  sidebar: 'z-10',
  floatingCart: 'z-30',
  modalOverlay: 'z-40',
  modalContent: 'z-[100]',
  dropdownMenu: 'z-50',
  toastNotification: 'z-50',
  tooltip: 'z-50',
  loadingOverlay: 'z-[100]',
} as const;

// Ejemplo de Modal con Overlay
export const modalZIndex = {
  // Overlay - z-40
  overlay: 'fixed inset-0 bg-black/50 backdrop-blur-sm z-40',
  
  // Modal - z-[100]
  modal: 'fixed inset-0 flex items-center justify-center z-[100]',
  
  // Modal content
  content: 'bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full mx-4',
} as const;

// Utilidades de Z-Index
export const getZIndex = (level: keyof typeof zIndex) => {
  return zIndex[level];
};

export const getZIndexClass = (component: keyof typeof componentZIndex) => {
  return componentZIndex[component];
};

export const getZIndexClassName = (level: keyof typeof zIndexClasses) => {
  return zIndexClasses[level];
};

// Hook para manejar Z-Index
export const useZIndex = (component: keyof typeof componentZIndex) => {
  const zIndexClass = componentZIndex[component];
  const zIndexValue = component === 'header' ? zIndex.header :
                     component === 'sidebar' ? zIndex.elevated :
                     component === 'floatingCart' ? zIndex.floating :
                     component === 'overlay' ? zIndex.overlay :
                     component === 'modal' ? zIndex.modal :
                     component === 'dropdown' ? zIndex.dropdown :
                     component === 'toast' ? zIndex.dropdown :
                     component === 'tooltip' ? zIndex.dropdown :
                     component === 'loading' ? zIndex.modal :
                     zIndex.base;
  
  return {
    className: zIndexClass,
    value: zIndexValue,
  };
};
