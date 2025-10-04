# 📁 Estructura del Proyecto - EventHub

## 🏗️ Arquitectura del Proyecto

Este proyecto sigue una **arquitectura basada en features** con separación clara de responsabilidades.

```
eventhub/
├── 📄 Archivos de configuración raíz
├── 📂 database/              # Scripts SQL de base de datos
├── 📂 dist/                  # Build de producción (generado)
├── 📂 node_modules/          # Dependencias (generado)
├── 📂 public/                # Assets estáticos públicos
└── 📂 src/                   # Código fuente principal
    ├── 📂 assets/            # Recursos estáticos (imágenes, estilos globales)
    ├── 📂 core/              # Funcionalidad core de la aplicación
    ├── 📂 features/          # Features organizados por dominio
    ├── 📂 shared/            # Componentes y utilidades compartidas
    ├── App.tsx               # Componente principal de la aplicación
    ├── main.tsx              # Punto de entrada de React
    ├── index.css             # Estilos globales
    └── vite-env.d.ts         # Tipos de Vite
```

---

## 📂 Estructura Detallada

### 🎯 `/src/core/` - Funcionalidad Central

Contiene la lógica de negocio principal y servicios centralizados.

```
core/
├── services/               # Servicios de la aplicación
│   ├── api.ts             # Cliente API principal
│   ├── emailService.ts    # Servicio de emails
│   ├── paymentService.ts  # Procesamiento de pagos
│   ├── qrService.ts       # Generación de códigos QR
│   └── supabaseServiceEspanol.ts  # Wrapper de Supabase
├── stores/                # Estado global (Zustand)
│   ├── analyticsStore.ts  # Estado de analíticas
│   ├── authStore.ts       # Estado de autenticación
│   ├── cartStore.ts       # Carrito de compras
│   ├── eventStore.ts      # Estado de eventos
│   ├── notificationStore.ts  # Notificaciones
│   └── purchaseStore.ts   # Estado de compras
└── supabase.ts            # Cliente de Supabase configurado
```

**Propósito**: 
- Servicios reutilizables en toda la aplicación
- Gestión de estado global
- Configuración de clientes externos (Supabase, APIs)

---

### 🎨 `/src/features/` - Features por Dominio

Cada feature es un módulo independiente con su propia estructura.

#### 📊 `/features/admin/` - Panel de Administración

```
admin/
├── components/
│   ├── dashboard/         # Componentes del dashboard
│   │   ├── AdminDashboardNew.tsx      # Dashboard principal
│   │   ├── AdminProfilePanel.tsx      # Panel de perfil
│   │   ├── NotificationsDashboard.tsx # Gestión de notificaciones
│   │   └── PaymentsDashboard.tsx      # Dashboard de pagos
│   ├── events/
│   │   └── EventManagement.tsx        # Gestión de eventos
│   ├── system/
│   │   ├── SystemHealth.tsx           # Salud del sistema
│   │   └── SystemManagement.tsx       # Gestión del sistema
│   └── users/
│       └── UserManagementAdvanced.tsx # Gestión avanzada de usuarios
└── pages/
    └── AdminPage.tsx      # Página principal del admin
```

**Propósito**: Interfaz completa para administradores del sistema

---

#### 📈 `/features/analytics/` - Analíticas y Reportes

```
analytics/
└── components/
    ├── AdvancedMetrics.tsx          # Métricas avanzadas
    ├── AnalyticsDashboard.tsx       # Dashboard principal
    ├── Chart.tsx                    # Componente de gráficos
    ├── MetricCard.tsx               # Tarjeta de métrica
    ├── TrendsChart.tsx              # Gráfico de tendencias
    └── TrendsDashboardSimple.tsx    # Dashboard simplificado
```

**Propósito**: Visualización de datos y métricas del negocio

---

#### 🔐 `/features/auth/` - Autenticación y Autorización

```
auth/
└── components/
    ├── AdminGuard.tsx           # Guard para rutas admin
    ├── AdminRedirect.tsx        # Redirección de admins
    ├── AdminRouteGuard.tsx      # Protección de rutas admin
    ├── AuthRedirect.tsx         # Redirección por auth
    ├── LoginRequiredModal.tsx   # Modal de login requerido
    └── ProtectedRoute.tsx       # Rutas protegidas
```

**Propósito**: Control de acceso y protección de rutas

---

#### 🎫 `/features/events/` - Gestión de Eventos

```
events/
├── components/
│   ├── AdvancedEventFilters.tsx    # Filtros avanzados
│   ├── AttendanceReports.tsx       # Reportes de asistencia
│   ├── AttendanceScanner.tsx       # Escáner de asistencia
│   ├── DuplicateEventModal.tsx     # Modal duplicar evento
│   ├── EarlyBirdPricing.tsx        # Precios early bird
│   ├── EmailTemplateManager.tsx    # Gestión de templates
│   ├── EventCard.tsx               # Tarjeta de evento
│   ├── EventCustomization.tsx      # Personalización
│   ├── EventFilters.tsx            # Filtros básicos
│   ├── ImageUpload.tsx             # Subida de imágenes
│   ├── NotificationCenter.tsx      # Centro de notificaciones
│   ├── PromotionalCodes.tsx        # Códigos promocionales
│   ├── PurchaseConfirmation.tsx    # Confirmación de compra
│   ├── PurchaseLimits.tsx          # Límites de compra
│   ├── QRScanner.tsx               # Escáner QR
│   ├── TicketQR.tsx                # QR de entrada
│   └── Toast.tsx                   # Notificaciones toast
└── pages/
    ├── AttendancePage.tsx          # Página de asistencia
    ├── CheckoutPage.tsx            # Página de checkout
    ├── CreateEventPage.tsx         # Crear evento
    ├── EventDetailPage.tsx         # Detalle del evento
    ├── EventsPage.tsx              # Lista de eventos
    ├── HomePage.tsx                # Página de inicio
    ├── NotificationsPage.tsx       # Página de notificaciones
    └── TicketsPage.tsx             # Mis entradas
```

**Propósito**: Core del negocio - toda la funcionalidad de eventos

---

#### 👥 `/features/organizer/` - Dashboard de Organizadores

```
organizer/
├── components/
│   ├── analytics/
│   │   └── OrganizerAnalytics.tsx      # Analíticas del organizador
│   ├── attendees/
│   │   └── AttendeeManagement.tsx      # Gestión de asistentes
│   ├── dashboard/
│   │   └── OrganizerDashboard.tsx      # Dashboard principal
│   ├── events/
│   │   └── EventManagementAdvanced.tsx # Gestión avanzada
│   ├── promotions/
│   │   └── PromotionManagement.tsx     # Gestión de promociones
│   └── tickets/
│       └── TicketManagement.tsx        # Gestión de entradas
└── pages/
    └── OrganizerDashboard.tsx          # Página principal
```

**Propósito**: Herramientas para organizadores de eventos

---

#### 👤 `/features/users/` - Gestión de Usuarios

```
users/
└── pages/
    └── ProfilePage.tsx    # Página de perfil de usuario
```

**Propósito**: Funcionalidad relacionada con usuarios finales

---

### 🔄 `/src/shared/` - Código Compartido

Componentes, utilidades y recursos reutilizables en toda la aplicación.

```
shared/
├── components/              # Componentes compartidos
│   ├── layout/             # Componentes de layout
│   │   ├── Footer.tsx      # Footer global
│   │   ├── Header.tsx      # Header global
│   │   └── Layout.tsx      # Layout wrapper
│   ├── AuthDebug.tsx       # Debug de autenticación
│   ├── EnhancedCart.tsx    # Carrito mejorado
│   ├── FloatingCart.tsx    # Carrito flotante
│   ├── FloatingCartButton.tsx  # Botón del carrito
│   ├── PaymentForm.tsx     # Formulario de pago
│   ├── PaymentMethodsConfig.tsx  # Config de métodos
│   └── PaymentProcessor.tsx     # Procesador de pagos
└── utils/                  # Utilidades compartidas
    ├── currency.ts         # Formateo de moneda
    └── date.ts             # Utilidades de fechas
```

**Propósito**: Código reutilizable sin lógica de negocio específica

---

### 🎨 `/src/assets/` - Recursos Estáticos

```
assets/
└── styles/
    └── scrollbar-simple.css    # Estilos personalizados de scrollbar
```

**Propósito**: Estilos globales, imágenes, fuentes, etc.

---

## 🎯 Convenciones de Nombres

### Archivos y Carpetas
- **PascalCase** para componentes: `EventCard.tsx`, `UserProfile.tsx`
- **camelCase** para utilidades: `currency.ts`, `dateUtils.ts`
- **kebab-case** para archivos CSS: `scrollbar-simple.css`
- **lowercase** para carpetas: `components/`, `pages/`, `utils/`

### Componentes
```tsx
// ✅ Correcto
export function EventCard() { }
export const EventCard: React.FC = () => { }

// ❌ Incorrecto
export default function eventCard() { }
```

### Stores (Zustand)
```tsx
// ✅ Correcto
export const useAuthStore = create<AuthState>(...);

// Uso
const { user, login } = useAuthStore();
```

---

## 📦 Patrones de Importación

### Orden de Imports
```tsx
// 1. Librerías externas
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Stores y servicios core
import { useAuthStore } from '@/core/stores/authStore';
import { api } from '@/core/services/api';

// 3. Componentes compartidos
import { Header } from '@/shared/components/layout/Header';

// 4. Componentes locales
import { EventCard } from './EventCard';

// 5. Tipos
import type { Event } from '@/types';

// 6. Estilos (si aplica)
import './styles.css';
```

### Alias de Rutas (Path Mapping)
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@core/*": ["./src/core/*"],
      "@features/*": ["./src/features/*"],
      "@shared/*": ["./src/shared/*"]
    }
  }
}
```

---

## 🔄 Flujo de Datos

```
Usuario Interactúa
    ↓
Componente (UI)
    ↓
Store (Estado Global) ←→ Service (Lógica)
    ↓
Supabase/API (Backend)
```

---

## 📝 Mejores Prácticas

### 1. **Separación de Responsabilidades**
- **Components**: Solo presentación y UI
- **Stores**: Gestión de estado
- **Services**: Lógica de negocio y comunicación con API

### 2. **Composición sobre Herencia**
```tsx
// ✅ Bueno
<Layout>
  <EventsPage />
</Layout>

// ❌ Evitar
class EventsPage extends LayoutComponent
```

### 3. **Single Responsibility**
Cada archivo/componente debe tener una sola responsabilidad clara.

### 4. **DRY (Don't Repeat Yourself)**
Extraer código repetido a componentes compartidos o utilidades.

### 5. **Nomenclatura Clara**
Los nombres deben ser descriptivos y auto-explicativos.

---

## 🚀 Agregar Nuevo Feature

### Pasos para agregar un nuevo feature:

1. **Crear estructura de carpeta**:
```bash
src/features/nuevo-feature/
├── components/
├── pages/
└── index.ts  # Exportaciones públicas
```

2. **Crear componentes necesarios**:
```tsx
// components/NuevoComponente.tsx
export function NuevoComponente() {
  return <div>Contenido</div>;
}
```

3. **Crear página si es necesaria**:
```tsx
// pages/NuevoFeaturePage.tsx
export function NuevoFeaturePage() {
  return <NuevoComponente />;
}
```

4. **Agregar ruta en App.tsx**:
```tsx
<Route path="/nuevo-feature" element={<NuevoFeaturePage />} />
```

5. **Crear store si necesita estado global**:
```tsx
// core/stores/nuevoFeatureStore.ts
export const useNuevoFeatureStore = create<State>((set) => ({
  // estado y acciones
}));
```

---

## 🎨 Estilos

### Tailwind CSS
- **Primera opción** para estilos
- Clases utilitarias directamente en JSX
- Sigue el sistema de diseño en `DESIGN_SYSTEM.md`

### CSS Modules (si es necesario)
```tsx
import styles from './Component.module.css';

<div className={styles.container}>
```

### CSS Global
Solo para:
- Reset de estilos
- Scrollbars personalizados
- Variables CSS globales

---

## 📚 Recursos Adicionales

- **Sistema de Diseño**: Ver `DESIGN_SYSTEM.md`
- **Base de Datos**: Ver `database/` para scripts SQL
- **Configuración de Supabase**: Ver `SUPABASE_SETUP.md`

---

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint

# Type checking
npm run typecheck
```

---

**Última actualización**: Octubre 2025  
**Versión**: 1.0

