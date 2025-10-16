# 🎨 Sistema de Diseño - EventHub

## 📋 Tabla de Contenido
1. [Introducción](#introducción)
2. [Paleta de Colores](#paleta-de-colores)
3. [Tipografía](#tipografía)
4. [Sistema Glassmorphism](#sistema-glassmorphism)
5. [Componentes UI](#componentes-ui)
6. [Layout y Espaciado](#layout-y-espaciado)
7. [Scrollbars](#scrollbars)
8. [Estados y Feedback](#estados-y-feedback)
9. [Animaciones y Transiciones](#animaciones-y-transiciones)
10. [Sistema de Iconos](#sistema-de-iconos)
11. [Responsive Design](#responsive-design)
12. [Z-Index y Capas](#z-index-y-capas)
13. [Accesibilidad](#accesibilidad)
14. [Principios de Diseño](#principios-de-diseño)

---

## 🌟 Introducción

Este documento define el sistema de diseño completo de **EventHub**, una plataforma de gestión de eventos. El diseño se basa en una estética moderna y profesional con efectos glassmorphism, gradientes vibrantes y una paleta de colores cuidadosamente seleccionada.

### Filosofía de Diseño
- **Modernidad**: Diseño contemporáneo con efectos visuales avanzados
- **Claridad**: Interfaz limpia y fácil de entender
- **Consistencia**: Mismos patrones en toda la aplicación
- **Accesibilidad**: Diseño inclusivo con buen contraste
- **Responsividad**: Adaptable a todos los dispositivos

---

## 🎨 Paleta de Colores

### Colores Principales

#### Púrpura (Brand Primary)
```css
purple-50:  #FAF5FF
purple-100: #F3E8FF
purple-200: #E9D5FF
purple-300: #D8B4FE
purple-400: #C084FC
purple-500: #A855F7  /* Principal */
purple-600: #9333EA  /* Acción */
purple-700: #7E22CE
purple-800: #6B21A8
purple-900: #581C87
```

**Uso**: Branding principal, header, elementos destacados

#### Azul (Brand Secondary)
```css
blue-50:  #EFF6FF
blue-100: #DBEAFE
blue-200: #BFDBFE
blue-300: #93C5FD
blue-400: #60A5FA
blue-500: #3B82F6  /* Principal */
blue-600: #2563EB  /* Acción */
blue-700: #1D4ED8
blue-800: #1E40AF
blue-900: #1E3A8A
```

**Uso**: Elementos secundarios, acciones importantes, links

### Colores Funcionales

#### Verde (Éxito/Crear)
```css
green-50:  #F0FDF4
green-100: #DCFCE7
green-200: #BBF7D0
green-300: #86EFAC
green-400: #4ADE80
green-500: #22C55E  /* Éxito */
green-600: #16A34A  /* Crear */
green-700: #15803D
green-800: #166534
green-900: #14532D

emerald-600: #059669  /* Gradiente */
emerald-700: #047857  /* Gradiente Hover */
```

**Uso**: Mensajes de éxito, botones de crear, confirmaciones

#### Rojo (Error/Actualizar)
```css
red-50:  #FEF2F2
red-100: #FEE2E2
red-200: #FECACA
red-300: #FCA5A5
red-400: #F87171
red-500: #EF4444  /* Error */
red-600: #DC2626  /* Actualizar */
red-700: #B91C1C
red-800: #991B1B
red-900: #7F1D1D
```

**Uso**: Errores, alertas, acciones destructivas, actualizar

#### Naranja (Advertencia/Energía)
```css
orange-50:  #FFF7ED
orange-100: #FFEDD5
orange-200: #FED7AA
orange-300: #FDBA74
orange-400: #FB923C
orange-500: #F97316  /* Advertencia */
orange-600: #EA580C  /* Actualizar */
orange-700: #C2410C
orange-800: #9A3412
orange-900: #7C2D12
```

**Uso**: Advertencias, botones de actualizar/refrescar

#### Amarillo (Alerta)
```css
yellow-50:  #FEFCE8
yellow-100: #FEF9C3
yellow-200: #FEF08A
yellow-300: #FDE047
yellow-400: #FACC15
yellow-500: #EAB308  /* Alerta */
yellow-600: #CA8A04
yellow-700: #A16207
yellow-800: #854D0E
yellow-900: #713F12
```

**Uso**: Alertas informativas, estados pendientes

#### Rosa (Comunicación)
```css
pink-50:  #FDF2F8
pink-100: #FCE7F3
pink-200: #FBCFE8
pink-300: #F9A8D4
pink-400: #F472B6
pink-500: #EC4899  /* Principal */
pink-600: #DB2777  /* Acción */
pink-700: #BE185D
pink-800: #9D174D
pink-900: #831843
```

**Uso**: Notificaciones, comunicaciones, elementos creativos

#### Índigo (Glassmorphism)
```css
indigo-50:  #EEF2FF
indigo-100: #E0E7FF  /* Glassmorphism */
indigo-200: #C7D2FE
indigo-300: #A5B4FC
indigo-400: #818CF8
indigo-500: #6366F1
indigo-600: #4F46E5
indigo-700: #4338CA
indigo-800: #3730A3
indigo-900: #312E81
```

**Uso**: Fondos glassmorphism, overlays

### Colores Neutrales

#### Grises
```css
gray-50:  #F9FAFB  /* Fondos claros */
gray-100: #F3F4F6
gray-200: #E5E7EB  /* Bordes */
gray-300: #D1D5DB
gray-400: #9CA3AF
gray-500: #6B7280  /* Texto secundario */
gray-600: #4B5563  /* Texto principal */
gray-700: #374151
gray-800: #1F2937  /* Texto oscuro */
gray-900: #111827  /* Texto muy oscuro */
```

**Uso**: Textos, bordes, fondos, elementos neutrales

#### Blanco y Negro
```css
white: #FFFFFF
black: #000000
```

### Transparencias

```css
white/5   = rgba(255, 255, 255, 0.05)
white/10  = rgba(255, 255, 255, 0.1)
white/20  = rgba(255, 255, 255, 0.2)
white/30  = rgba(255, 255, 255, 0.3)
white/80  = rgba(255, 255, 255, 0.8)
white/90  = rgba(255, 255, 255, 0.9)
white/95  = rgba(255, 255, 255, 0.95)
white/98  = rgba(255, 255, 255, 0.98)

gray-50/80 = rgba(249, 250, 251, 0.8)
blue-50/80 = rgba(239, 246, 255, 0.8)
```

---

## ✍️ Tipografía

### Fuentes

#### Sistema de Fuentes Primario
```css
font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', 'Roboto', sans-serif;
```

#### Fuentes Alternativas Disponibles
```css
/* Moderno */
Inter, sans-serif

/* Limpio */
Roboto, sans-serif

/* Amigable */
Poppins, sans-serif

/* Profesional */
Open Sans, sans-serif

/* Elegante */
Lato, sans-serif
```

### Escala Tipográfica

#### Tamaños de Fuente
```css
text-xs:   0.75rem  /* 12px */
text-sm:   0.875rem /* 14px */
text-base: 1rem     /* 16px */
text-lg:   1.125rem /* 18px */
text-xl:   1.25rem  /* 20px */
text-2xl:  1.5rem   /* 24px */
text-3xl:  1.875rem /* 30px */
text-4xl:  2.25rem  /* 36px */
text-5xl:  3rem     /* 48px */
text-6xl:  3.75rem  /* 60px */
```

#### Pesos de Fuente
```css
font-thin:       100
font-extralight: 200
font-light:      300
font-normal:     400
font-medium:     500  /* Más usado */
font-semibold:   600  /* Más usado */
font-bold:       700  /* Más usado */
font-extrabold:  800
font-black:      900
```

#### Altura de Línea
```css
leading-none:    1
leading-tight:   1.25
leading-snug:    1.375
leading-normal:  1.5    /* Texto regular */
leading-relaxed: 1.625
leading-loose:   2
```

### Uso de Tipografía

#### Títulos Principales (Hero)
```css
text-5xl md:text-6xl font-bold text-gray-900
```

#### Títulos de Sección (H1)
```css
text-3xl font-bold text-gray-900
```

#### Subtítulos (H2)
```css
text-2xl font-semibold text-gray-800
```

#### Subtítulos de Tarjetas (H3)
```css
text-xl font-semibold text-gray-800
```

#### Subtítulos Pequeños (H4)
```css
text-lg font-medium text-gray-700
```

#### Texto Regular (Body)
```css
text-base text-gray-600 leading-relaxed
```

#### Texto Pequeño (Small)
```css
text-sm text-gray-500
```

#### Texto Muy Pequeño (Caption)
```css
text-xs text-gray-400
```

#### Etiquetas y Labels
```css
text-sm font-medium text-gray-700
```

---

## 🪟 Sistema Glassmorphism

El efecto glassmorphism es una característica distintiva del diseño de EventHub, proporcionando profundidad y modernidad.

### Glassmorphism Estándar

#### Panel Principal
```css
bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20
```

**Características**:
- Gradiente sutil de blanco a índigo claro
- Desenfoque de fondo (backdrop-blur-lg)
- Sombra pronunciada (shadow-xl)
- Borde transparente sutil (border-white/20)

#### Tarjetas Estadísticas
```css
bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg
```

**Características**:
- Mantiene colores temáticos (blue, green, purple, etc.)
- Efecto glassmorphism mediante backdrop-blur-lg
- Hover mejorado con shadow-2xl
- Transiciones suaves

#### Fondos de Página
```css
bg-gradient-to-br from-gray-50/80 to-blue-50/80 backdrop-blur-sm
```

**Características**:
- Fondo sutil y no intrusivo
- Combinación de gris y azul claro
- Desenfoque ligero (backdrop-blur-sm)

### Headers y Navegación

#### Header Principal
```css
bg-gradient-to-r from-purple-600/90 via-purple-600/90 to-blue-500/90 backdrop-blur-md shadow-xl border-b border-white/20
```

**Características**:
- Gradiente horizontal de púrpura a azul
- Transparencia del 90% para efecto glassmorphism
- Desenfoque medio (backdrop-blur-md)
- Borde inferior transparente

#### Sidebar
```css
bg-white/80 backdrop-blur-md shadow-xl border-r border-white/20
```

**Características**:
- Fondo blanco semi-transparente
- Desenfoque medio
- Borde derecho sutil

### Overlays y Modales

#### Overlay de Fondo
```css
bg-black/50 backdrop-blur-sm
```

#### Modal
```css
bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20
```

#### Dropdown Menu
```css
bg-white/95 backdrop-blur-lg rounded-xl shadow-xl border border-white/20
```

### Clases CSS Reutilizables

```css
/* Glassmorphism para paneles */
.glassmorphism-panel {
  @apply bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20;
}

/* Glassmorphism para tarjetas */
.glassmorphism-card {
  @apply bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl;
}

/* Glassmorphism para botones */
.glassmorphism-button {
  @apply backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-200;
}

/* Header glassmorphism */
.header-glassmorphism {
  @apply bg-gradient-to-r from-purple-600/90 via-purple-600/90 to-blue-500/90 backdrop-blur-md shadow-xl;
}

/* Fondo de página glassmorphism */
.background-glassmorphism {
  @apply bg-gradient-to-br from-gray-50/80 to-blue-50/80 backdrop-blur-sm;
}
```

---

## 🔘 Componentes UI

### Botones

#### Botón Primario (Exportar/Filtros)
```css
/* Base */
bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl px-6 py-2.5 font-medium shadow-sm hover:shadow-md transition-all duration-200

/* Hover */
hover:from-blue-600 hover:to-purple-700

/* Disabled */
disabled:opacity-50 disabled:cursor-not-allowed
```

**Uso**: Acciones principales, exportar, filtros, búsquedas

#### Botón de Crear (Verde)
```css
/* Base */
bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl px-6 py-2.5 font-medium shadow-sm hover:shadow-md transition-all duration-200

/* Hover */
hover:from-green-600 hover:to-emerald-700
```

**Uso**: Crear usuarios, nuevos elementos, agregar

#### Botón de Actualizar (Naranja-Rojo)
```css
/* Base */
bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl px-6 py-2.5 font-medium shadow-sm hover:shadow-md transition-all duration-200

/* Hover */
hover:from-orange-600 hover:to-red-700
```

**Uso**: Refrescar datos, actualizar información

#### Botón de Importar (Gris)
```css
/* Base */
bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl px-6 py-2.5 font-medium shadow-sm hover:shadow-md transition-all duration-200

/* Hover */
hover:from-gray-600 hover:to-gray-700
```

**Uso**: Importar datos, cargar archivos, funciones utilitarias

#### Botón de Notificación (Púrpura-Rosa)
```css
/* Base */
bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl px-6 py-2.5 font-medium shadow-sm hover:shadow-md transition-all duration-200

/* Hover */
hover:from-purple-600 hover:to-pink-700
```

**Uso**: Crear notificaciones, comunicaciones, alertas

#### Botón Secundario
```css
bg-white/10 backdrop-blur-sm text-white rounded-xl px-6 py-2.5 font-medium border border-white/20 hover:bg-white/20 transition-all duration-200
```

**Uso**: Acciones secundarias en contextos sobre fondos oscuros

#### Botón Terciario/Ghost
```css
text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-xl transition-all duration-200
```

**Uso**: Acciones terciarias, cancelar

#### Botón de Acción Crítica (Cerrar Sesión, Eliminar)
```css
bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-sm text-red-700 rounded-xl border border-red-200 hover:from-red-500/30 hover:to-red-600/30 hover:text-red-800 transition-all duration-200 shadow-sm hover:shadow-md
```

**Uso**: Cerrar sesión, eliminar elementos, acciones irreversibles

#### Botones con Iconos
```jsx
<button className="flex items-center space-x-2 ...">
  <Icon className="w-4 h-4" />
  <span>Texto</span>
</button>
```

### Tarjetas

#### Tarjeta Estándar
```css
bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200
```

#### Tarjeta con Glassmorphism
```css
bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-6
```

#### Tarjeta Estadística
```jsx
<div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-6">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-600">Título</p>
      <p className="text-3xl font-bold text-gray-900">1,234</p>
      <div className="flex items-center mt-2">
        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
        <span className="text-sm text-green-600 font-medium">+12%</span>
      </div>
    </div>
    <div className="p-3 bg-blue-100 rounded-lg">
      <Icon className="w-6 h-6 text-blue-600" />
    </div>
  </div>
</div>
```

**Variantes de color**:
- Azul: `from-blue-50 to-blue-100 border-blue-200 bg-blue-100 text-blue-600`
- Verde: `from-green-50 to-green-100 border-green-200 bg-green-100 text-green-600`
- Púrpura: `from-purple-50 to-purple-100 border-purple-200 bg-purple-100 text-purple-600`
- Naranja: `from-orange-50 to-orange-100 border-orange-200 bg-orange-100 text-orange-600`

### Inputs y Formularios

#### Input de Texto
```css
w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200
```

#### Input con Error
```css
border-red-300 focus:ring-red-500 focus:border-red-500
```

#### Input Deshabilitado
```css
bg-gray-100 cursor-not-allowed opacity-60
```

#### Textarea
```css
w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none
```

#### Select
```css
w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none
```

#### Checkbox
```css
w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500
```

#### Radio Button
```css
w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500
```

#### Label
```css
block text-sm font-medium text-gray-700 mb-2
```

#### Mensaje de Error
```css
text-sm text-red-600 mt-1
```

### Badges y Tags

#### Badge Estándar
```css
px-3 py-1 rounded-full text-xs font-medium
```

#### Badge de Estado - Éxito
```css
bg-green-100 text-green-800 border border-green-200
```

#### Badge de Estado - Advertencia
```css
bg-yellow-100 text-yellow-800 border border-yellow-200
```

#### Badge de Estado - Error
```css
bg-red-100 text-red-800 border border-red-200
```

#### Badge de Estado - Info
```css
bg-blue-100 text-blue-800 border border-blue-200
```

#### Badge de Estado - Neutral
```css
bg-gray-100 text-gray-800 border border-gray-200
```

### Tablas

#### Tabla Estándar
```jsx
<div className="overflow-x-auto rounded-xl border border-gray-200">
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Header
        </th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      <tr className="hover:bg-gray-50 transition-colors duration-150">
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          Data
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### Navegación

#### Link Estándar
```css
text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-200
```

#### Link en Header (Activo)
```css
text-white bg-white/20 font-medium shadow-lg border border-white/30 px-4 py-2 rounded-xl backdrop-blur-sm
```

#### Link en Header (Inactivo)
```css
text-white/80 hover:text-white hover:bg-white/10 hover:shadow-lg hover:border hover:border-white/20 px-4 py-2 rounded-xl backdrop-blur-sm transition-all duration-200
```

#### Botón de Navegación Lateral (Activo)
```css
bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-700 border-l-4 border-blue-500 shadow-lg border border-white/30
```

#### Botón de Navegación Lateral (Inactivo)
```css
text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200
```

### Alertas y Notificaciones

#### Alerta de Éxito
```jsx
<div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-xl">
  <div className="flex">
    <CheckCircle className="w-5 h-5 text-green-500" />
    <div className="ml-3">
      <p className="text-sm font-medium text-green-800">Mensaje de éxito</p>
    </div>
  </div>
</div>
```

#### Alerta de Error
```jsx
<div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
  <div className="flex">
    <XCircle className="w-5 h-5 text-red-500" />
    <div className="ml-3">
      <p className="text-sm font-medium text-red-800">Mensaje de error</p>
    </div>
  </div>
</div>
```

#### Alerta de Advertencia
```jsx
<div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-xl">
  <div className="flex">
    <AlertTriangle className="w-5 h-5 text-yellow-500" />
    <div className="ml-3">
      <p className="text-sm font-medium text-yellow-800">Mensaje de advertencia</p>
    </div>
  </div>
</div>
```

#### Alerta de Info
```jsx
<div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl">
  <div className="flex">
    <Info className="w-5 h-5 text-blue-500" />
    <div className="ml-3">
      <p className="text-sm font-medium text-blue-800">Mensaje informativo</p>
    </div>
  </div>
</div>
```

### Toast Notifications

```jsx
<div className="fixed bottom-4 right-4 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 max-w-sm z-50 animate-slide-in">
  <div className="flex items-start">
    <Icon className="w-5 h-5 text-{color}-500 mt-0.5" />
    <div className="ml-3 flex-1">
      <p className="text-sm font-medium text-gray-900">Título</p>
      <p className="text-sm text-gray-500 mt-1">Mensaje</p>
    </div>
    <button className="ml-4 text-gray-400 hover:text-gray-600">
      <X className="w-4 h-4" />
    </button>
  </div>
</div>
```

---

## 📐 Layout y Espaciado

### Espaciado (Padding & Margin)

```css
p-0 / m-0:   0px
p-1 / m-1:   0.25rem  /* 4px */
p-2 / m-2:   0.5rem   /* 8px */
p-3 / m-3:   0.75rem  /* 12px */
p-4 / m-4:   1rem     /* 16px */
p-5 / m-5:   1.25rem  /* 20px */
p-6 / m-6:   1.5rem   /* 24px */
p-8 / m-8:   2rem     /* 32px */
p-10 / m-10: 2.5rem   /* 40px */
p-12 / m-12: 3rem     /* 48px */
```

### Espaciado Vertical (space-y)

```css
space-y-2: 0.5rem   /* Entre elementos */
space-y-3: 0.75rem
space-y-4: 1rem     /* Más común */
space-y-6: 1.5rem
space-y-8: 2rem
```

### Espaciado Horizontal (space-x)

```css
space-x-2: 0.5rem   /* Entre elementos */
space-x-3: 0.75rem  /* Más común */
space-x-4: 1rem
space-x-6: 1.5rem
space-x-8: 2rem
```

### Grid Systems

#### Grid de Tarjetas (4 columnas)
```css
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6
```

#### Grid de Tarjetas (3 columnas)
```css
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
```

#### Grid de Tarjetas (2 columnas)
```css
grid grid-cols-1 lg:grid-cols-2 gap-6
```

#### Grid de Panel (Sidebar + Contenido)
```css
grid grid-cols-1 lg:grid-cols-4 gap-0
```
- Sidebar: `lg:col-span-1`
- Contenido: `lg:col-span-3`

### Contenedores

#### Contenedor Principal
```css
max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
```

#### Contenedor de Ancho Completo
```css
w-full max-w-full
```

#### Contenedor Centrado
```css
mx-auto
```

### Bordes Redondeados

```css
rounded-none: 0px
rounded-sm:   0.125rem  /* 2px */
rounded:      0.25rem   /* 4px */
rounded-md:   0.375rem  /* 6px */
rounded-lg:   0.5rem    /* 8px */
rounded-xl:   0.75rem   /* 12px - Más usado */
rounded-2xl:  1rem      /* 16px - Tarjetas */
rounded-3xl:  1.5rem    /* 24px */
rounded-full: 9999px    /* Círculos */
```

### Sombras

```css
shadow-none: none
shadow-sm:   0 1px 2px rgba(0, 0, 0, 0.05)
shadow:      0 1px 3px rgba(0, 0, 0, 0.1)
shadow-md:   0 4px 6px rgba(0, 0, 0, 0.1)
shadow-lg:   0 10px 15px rgba(0, 0, 0, 0.1)
shadow-xl:   0 20px 25px rgba(0, 0, 0, 0.1)    /* Más usado */
shadow-2xl:  0 25px 50px rgba(0, 0, 0, 0.25)
```

### Estructura de Página Estándar

```jsx
<div className="min-h-screen bg-gradient-to-br from-gray-50/80 to-blue-50/80 backdrop-blur-sm">
  {/* Header fijo */}
  <header className="fixed top-0 left-0 right-0 z-50">
    {/* Header content */}
  </header>

  {/* Contenido principal con padding-top para compensar header */}
  <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">
      {/* Contenido */}
    </div>
  </main>

  {/* Footer */}
  <footer className="bg-gray-900 text-white">
    {/* Footer content */}
  </footer>
</div>
```

### Estructura de Panel de Administración

```jsx
<div className="p-6 space-y-4">
  {/* Botones de Acción */}
  <div className="flex justify-end space-x-3">
    <button>Acción 1</button>
    <button>Acción 2</button>
  </div>

  {/* Tarjetas de Métricas */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-6">
      {/* Métrica */}
    </div>
  </div>

  {/* Contenido Principal */}
  <div className="space-y-4">
    {/* Filtros */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      {/* Filtros y búsqueda */}
    </div>

    {/* Contenido */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Contenido principal */}
    </div>
  </div>
</div>
```

---

## 📜 Scrollbars

### Scrollbar Personalizado Estándar

```css
/* Scrollbar para tarjetas blancas */
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
```

### Scrollbar para Dashboard

```css
/* Scrollbar del contenedor principal */
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
```

### Propiedades de Scroll

```css
/* Reservar espacio para scrollbar */
scrollbar-gutter: stable;

/* Overflow visible */
overflow-y: auto;
overflow-x: hidden;

/* Altura máxima para activar scroll */
max-height: 400px; /* Tarjetas */
max-height: 500px; /* Paneles */
```

### Aplicación en Elementos

```jsx
<div 
  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
  style={{
    overflowY: 'auto',
    maxHeight: '400px',
    scrollbarGutter: 'stable',
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box'
  }}
>
  {/* Contenido con scroll */}
</div>
```

---

## 🎭 Estados y Feedback

### Estados de Interacción

#### Hover
```css
hover:bg-gray-50
hover:shadow-md
hover:scale-105
hover:border-blue-500
```

#### Active
```css
active:scale-95
active:shadow-sm
```

#### Focus
```css
focus:ring-2
focus:ring-blue-500
focus:border-blue-500
focus:outline-none
```

#### Disabled
```css
disabled:opacity-50
disabled:cursor-not-allowed
disabled:hover:shadow-sm
```

### Estados de Carga

#### Spinner
```jsx
<div className="flex items-center justify-center">
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
</div>
```

#### Skeleton
```jsx
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
</div>
```

#### Loading Overlay
```jsx
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
  <div className="bg-white rounded-xl p-6 shadow-2xl">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
    <p className="text-gray-600 mt-4 text-center">Cargando...</p>
  </div>
</div>
```

### Estados Vacíos

#### Empty State
```jsx
<div className="text-center py-12">
  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
    <Icon className="w-8 h-8 text-gray-400" />
  </div>
  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay datos</h3>
  <p className="text-gray-500 mb-4">Comienza agregando un nuevo elemento</p>
  <button className="btn-primary">Agregar Nuevo</button>
</div>
```

---

## ⚡ Animaciones y Transiciones

### Transiciones Estándar

```css
/* Transición suave de todos los cambios */
transition-all duration-200

/* Transición solo de colores */
transition-colors duration-200

/* Transición de opacidad */
transition-opacity duration-300

/* Transición de transform */
transition-transform duration-200
```

### Duraciones

```css
duration-75:   75ms
duration-100:  100ms
duration-150:  150ms
duration-200:  200ms   /* Más usado */
duration-300:  300ms
duration-500:  500ms
duration-700:  700ms
duration-1000: 1000ms
```

### Easing

```css
ease-linear:    linear
ease-in:        cubic-bezier(0.4, 0, 1, 1)
ease-out:       cubic-bezier(0, 0, 0.2, 1)
ease-in-out:    cubic-bezier(0.4, 0, 0.2, 1)  /* Más usado */
```

### Animaciones Personalizadas

#### Fade In
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
```

#### Slide In (Desde abajo)
```css
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
```

#### Scale In
```css
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
```

#### Spin (Ya incluido en Tailwind)
```css
animate-spin
```

#### Pulse (Ya incluido en Tailwind)
```css
animate-pulse
```

### Efectos Hover Comunes

```css
/* Escala al hover */
hover:scale-105 transition-transform duration-200

/* Elevación al hover */
hover:shadow-xl transition-shadow duration-200

/* Cambio de color al hover */
hover:bg-blue-600 transition-colors duration-200

/* Múltiples efectos */
hover:shadow-2xl hover:scale-105 transition-all duration-200
```

---

## 🎨 Sistema de Iconos

### Librería de Iconos
**lucide-react** - Iconos modernos y consistentes

### Tamaños de Iconos

```css
w-3 h-3: 0.75rem  /* 12px - Muy pequeño */
w-4 h-4: 1rem     /* 16px - Pequeño, más usado */
w-5 h-5: 1.25rem  /* 20px - Mediano */
w-6 h-6: 1.5rem   /* 24px - Grande */
w-8 h-8: 2rem     /* 32px - Muy grande */
w-12 h-12: 3rem   /* 48px - Extra grande */
```

### Uso de Iconos

#### Icono en Botón
```jsx
<button className="flex items-center space-x-2">
  <Download className="w-4 h-4" />
  <span>Descargar</span>
</button>
```

#### Icono Solo
```jsx
<Calendar className="w-6 h-6 text-blue-600" />
```

#### Icono en Tarjeta
```jsx
<div className="p-3 bg-blue-100 rounded-lg">
  <Users className="w-6 h-6 text-blue-600" />
</div>
```

#### Icono con Badge
```jsx
<div className="relative">
  <Bell className="w-6 h-6 text-gray-600" />
  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
    3
  </span>
</div>
```

### Iconos Comunes

```jsx
import {
  // Navegación
  Home, Search, Menu, X, ChevronLeft, ChevronRight,
  
  // Acciones
  Plus, Edit, Trash2, Download, Upload, Save, RefreshCw,
  
  // Usuarios
  User, Users, UserPlus, Shield,
  
  // Eventos
  Calendar, Clock, MapPin, Ticket,
  
  // Comunicación
  Bell, Mail, MessageSquare, Send,
  
  // Estado
  CheckCircle, XCircle, AlertTriangle, Info,
  
  // Finanzas
  DollarSign, CreditCard, TrendingUp, TrendingDown,
  
  // Archivos
  File, FileText, Image, Paperclip,
  
  // Interfaz
  Settings, Filter, Eye, EyeOff, Heart, Star,
  
  // Medios
  Play, Pause, Volume2, Camera,
  
  // Otros
  MoreVertical, MoreHorizontal, LogOut, ExternalLink
} from 'lucide-react';
```

---

## 📱 Responsive Design

### Breakpoints

```css
sm:  640px   /* @media (min-width: 640px) */
md:  768px   /* @media (min-width: 768px) */
lg:  1024px  /* @media (min-width: 1024px) */
xl:  1280px  /* @media (min-width: 1280px) */
2xl: 1536px  /* @media (min-width: 1536px) */
```

### Patrones Responsivos

#### Ocultar/Mostrar elementos
```css
/* Ocultar en móvil, mostrar en desktop */
hidden md:block

/* Mostrar en móvil, ocultar en desktop */
block md:hidden

/* Flex en móvil, grid en desktop */
flex md:grid
```

#### Grid Responsivo
```css
/* 1 columna en móvil, 2 en tablet, 4 en desktop */
grid-cols-1 md:grid-cols-2 lg:grid-cols-4

/* 1 columna en móvil, 3 en desktop */
grid-cols-1 lg:grid-cols-3
```

#### Espaciado Responsivo
```css
/* Padding responsivo */
px-4 sm:px-6 lg:px-8

/* Margin responsivo */
mt-4 md:mt-6 lg:mt-8
```

#### Texto Responsivo
```css
/* Tamaño de fuente responsivo */
text-2xl md:text-3xl lg:text-4xl

/* Alineación responsiva */
text-center md:text-left
```

#### Contenedor Responsivo
```css
/* Máximo ancho responsivo */
max-w-full md:max-w-2xl lg:max-w-4xl xl:max-w-6xl
```

### Mobile Menu Pattern

```jsx
{/* Botón de menú móvil */}
<button className="md:hidden">
  <Menu className="w-6 h-6" />
</button>

{/* Navegación desktop */}
<nav className="hidden md:flex items-center space-x-4">
  {/* Links */}
</nav>

{/* Navegación móvil */}
{isMobileMenuOpen && (
  <div className="md:hidden">
    {/* Links móviles */}
  </div>
)}
```

---

## 🏢 Z-Index y Capas

### Jerarquía de Z-Index

```css
z-0:    0    /* Base */
z-10:   10   /* Elementos elevados ligeramente */
z-20:   20   /* Headers, footers */
z-30:   30   /* Elementos flotantes */
z-40:   40   /* Overlays de fondo */
z-50:   50   /* Dropdowns, tooltips, menús */
z-[100]: 100 /* Modales, diálogos */
```

### Aplicación por Componente

```css
/* Header fijo */
z-50

/* Sidebar */
z-10

/* Floating cart */
z-30

/* Overlay de fondo (modal) */
z-40

/* Modal */
z-[100]

/* Dropdown menu */
z-50

/* Toast notifications */
z-50
```

### Ejemplo de Modal con Overlay

```jsx
{/* Overlay - z-40 */}
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />

{/* Modal - z-[100] */}
<div className="fixed inset-0 flex items-center justify-center z-[100]">
  <div className="bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full mx-4">
    {/* Contenido del modal */}
  </div>
</div>
```

---

## ♿ Accesibilidad

### Contraste de Colores

Todos los colores cumplen con **WCAG 2.1 AA** para contraste:

#### Texto sobre Fondos Claros
- Texto oscuro: `text-gray-900`, `text-gray-800`, `text-gray-700`
- Contraste mínimo: 4.5:1 (texto normal), 3:1 (texto grande)

#### Texto sobre Fondos Oscuros
- Texto claro: `text-white`, `text-gray-100`
- Contraste mínimo: 4.5:1

#### Botones
- Todos los botones tienen suficiente contraste entre texto y fondo
- Estados hover son claramente distinguibles

### Focus States

Todos los elementos interactivos tienen estados de focus visibles:

```css
focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
```

### Etiquetas Semánticas

```jsx
/* Usar elementos HTML semánticos */
<header>, <nav>, <main>, <footer>, <article>, <section>

/* Etiquetas ARIA cuando sea necesario */
aria-label="Descripción"
aria-labelledby="id-del-label"
aria-describedby="id-de-descripcion"
aria-hidden="true"
role="button"
```

### Navegación por Teclado

Todos los elementos interactivos deben ser accesibles por teclado:
- Tab para navegar entre elementos
- Enter/Space para activar botones
- Escape para cerrar modales
- Flechas para navegación en menús

### Texto Alternativo

```jsx
/* Imágenes con texto alternativo */
<img src="..." alt="Descripción significativa" />

/* Iconos decorativos */
<Icon aria-hidden="true" />

/* Iconos con significado */
<Icon aria-label="Descripción del ícono" />
```

---

## 🎯 Principios de Diseño

### 1. Consistencia

**Mismo color = Misma función**
- Verde siempre para crear
- Rojo/Naranja para actualizar
- Azul/Púrpura para exportar
- Gris para funciones utilitarias

**Misma estructura = Misma experiencia**
- Todos los paneles de admin tienen la misma estructura
- Todas las tarjetas estadísticas siguen el mismo patrón
- Todos los formularios usan los mismos estilos

### 2. Jerarquía Visual

**Tamaño y peso**
- Títulos más grandes y pesados
- Subtítulos medianos
- Texto regular para contenido

**Color y contraste**
- Acciones principales con colores vibrantes
- Acciones secundarias con colores sutiles
- Contenido con colores neutros

**Espaciado**
- Más espacio alrededor de elementos importantes
- Agrupación visual mediante espaciado

### 3. Feedback Visual

**Estados de interacción**
- Hover: cambio de color y sombra
- Active: reducción de escala
- Focus: anillo de enfoque
- Disabled: opacidad reducida

**Feedback de acciones**
- Loading states para operaciones en progreso
- Success/error messages para resultados
- Toast notifications para confirmaciones

### 4. Modernidad

**Efectos glassmorphism**
- Transparencias y desenfoques
- Bordes sutiles
- Sombras profundas

**Gradientes vibrantes**
- Transiciones suaves de color
- Combinaciones armónicas

**Animaciones fluidas**
- Transiciones de 200ms
- Ease-in-out para suavidad

### 5. Usabilidad

**Claridad**
- Labels descriptivos
- Iconos reconocibles
- Mensajes claros

**Eficiencia**
- Acciones rápidas accesibles
- Atajos de teclado
- Búsqueda y filtros

**Prevención de errores**
- Validación en tiempo real
- Confirmaciones para acciones destructivas
- Estados disabled cuando corresponde

### 6. Responsive First

**Mobile friendly**
- Touch targets de al menos 44x44px
- Menú hamburguesa en móvil
- Grid que se adapta a pantalla

**Progressive enhancement**
- Funcionalidad básica en todos los dispositivos
- Mejoras visuales en pantallas grandes

### 7. Performance

**Optimización**
- Uso eficiente de Tailwind
- Lazy loading de componentes
- Imágenes optimizadas

**Scroll performance**
- Scrollbar gutter stable
- Smooth scrolling

---

## 📋 Guía Rápida de Implementación

### Botones por Función

| Función | Clases CSS | Cuándo Usar |
|---------|-----------|-------------|
| **Crear** | `bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700` | Nuevos usuarios, eventos, elementos |
| **Actualizar** | `bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700` | Refrescar datos, actualizar info |
| **Exportar** | `bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700` | Descargar, exportar, filtros |
| **Importar** | `bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700` | Cargar archivos, importar datos |
| **Notificar** | `bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700` | Crear notificaciones, comunicar |

### Tarjetas Estadísticas por Color

| Color | Clases CSS | Uso |
|-------|-----------|-----|
| **Azul** | `from-blue-50 to-blue-100 border-blue-200 bg-blue-100 text-blue-600` | Usuarios, eventos, general |
| **Verde** | `from-green-50 to-green-100 border-green-200 bg-green-100 text-green-600` | Activos, verificados, éxito |
| **Púrpura** | `from-purple-50 to-purple-100 border-purple-200 bg-purple-100 text-purple-600` | Organizadores, premium |
| **Naranja** | `from-orange-50 to-orange-100 border-orange-200 bg-orange-100 text-orange-600` | Pendientes, en proceso |

### Estados Comunes

| Estado | Clases CSS |
|--------|-----------|
| **Éxito** | `bg-green-100 text-green-800 border-green-200` |
| **Error** | `bg-red-100 text-red-800 border-red-200` |
| **Advertencia** | `bg-yellow-100 text-yellow-800 border-yellow-200` |
| **Info** | `bg-blue-100 text-blue-800 border-blue-200` |
| **Neutral** | `bg-gray-100 text-gray-800 border-gray-200` |

---

## 🔄 Versiones y Actualizaciones

- **Versión 1.0** - Paleta inicial establecida
- **Versión 2.0** - Sistema glassmorphism implementado
- **Versión 3.0** - Sistema completo de diseño documentado

**Última actualización**: Octubre 2025  
**Mantenido por**: Equipo de Desarrollo EventHub

---

## 📞 Soporte

Para consultas sobre el sistema de diseño:
- Revisa este documento primero
- Mantén la consistencia con los patrones establecidos
- Consulta con el equipo antes de crear nuevos patrones

---

*Este sistema de diseño debe ser aplicado consistentemente en toda la aplicación EventHub para mantener una experiencia visual coherente, profesional y moderna.*

