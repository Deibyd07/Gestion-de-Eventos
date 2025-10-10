# 📋 EventHub - Documentación de Arquitectura y Estructura del Proyecto

## 🎯 **Resumen del Proyecto**

**EventHub** es una plataforma integral de gestión de eventos que permite a organizadores crear, gestionar y promocionar eventos, mientras que los usuarios pueden descubrir, comprar entradas y asistir a eventos. La aplicación está construida con **React + TypeScript** y utiliza **Supabase** como backend.

### 🚀 **Características Principales**
- **Gestión de Eventos**: Creación, edición y administración de eventos
- **Sistema de Entradas**: Múltiples tipos de entrada con precios dinámicos
- **Gestión de Usuarios**: Roles diferenciados (Admin, Organizador, Asistente)
- **Sistema de Pagos**: Integración con pasarelas de pago
- **Analíticas Avanzadas**: Métricas y reportes detallados
- **Notificaciones**: Sistema de notificaciones en tiempo real
- **Personalización**: Temas y configuraciones personalizables

---

## 🏗️ **Arquitectura General**

Este proyecto implementa una **arquitectura híbrida Feature-Based + DDD Lite** que combina lo mejor de ambos enfoques para crear una aplicación escalable, mantenible y profesional.

### ¿Por qué esta arquitectura?
- ✅ **Escalabilidad**: Fácil agregar nuevos módulos
- ✅ **Mantenibilidad**: Código organizado y predecible
- ✅ **Separación de responsabilidades**: Cada capa tiene un propósito específico
- ✅ **Testabilidad**: Componentes aislados y fáciles de probar
- ✅ **Colaboración**: Estructura clara para equipos de desarrollo

La aplicación sigue los principios de **Clean Architecture** organizada en módulos independientes, cada uno con su propia estructura de capas:

---

## 📁 **Estructura de Directorios**

```
src/
├── 📱 App.tsx                          # Punto de entrada principal
├── 🎨 assets/                          # Recursos estáticos
│   └── styles/                         # Estilos globales
├── 🧩 modules/                         # Módulos de funcionalidad
│   ├── 🔐 authentication/              # Autenticación y autorización
│   ├── 📅 events/                      # Gestión de eventos
│   ├── 👥 users/                       # Gestión de usuarios
│   ├── 🎫 payments/                    # Sistema de pagos
│   ├── 📊 analytics/                   # Analíticas y métricas
│   ├── 🔔 notifications/               # Sistema de notificaciones
│   ├── 👨‍💼 organizers/                # Panel de organizadores
│   └── ⚙️ administration/              # Panel de administración
├── 🔧 shared/                          # Código compartido
│   ├── 🎨 ui/                          # Componentes UI reutilizables
│   ├── 📚 lib/                         # Utilidades y servicios
│   ├── 🏷️ types/                       # Tipos TypeScript compartidos
│   └── 🛠️ utils/                       # Utilidades generales
└── 📄 vite-env.d.ts                    # Tipos de Vite
```

---

## 🧩 **Módulos del Sistema**

### 1. **🔐 Authentication Module**
**Responsabilidad**: Gestión de autenticación y autorización

```
authentication/
├── 📁 application/
│   ├── hooks/                          # Custom hooks de autenticación
│   └── services/                       # Servicios de aplicación
├── 📁 domain/
│   ├── entities/                       # Entidades de dominio
│   └── types/                          # Tipos específicos del módulo
├── 📁 infrastructure/
│   ├── api/                           # Clientes API
│   └── store/                         # Estado global (Zustand)
│       └── Auth.store.ts              # Store de autenticación
└── 📁 presentation/
    ├── components/                    # Componentes de UI
    └── guards/                        # Guards de rutas
        ├── AdminGuard.guard.tsx      # Guard para administradores
        ├── ProtectedRoute.guard.tsx  # Guard para rutas protegidas
        └── AuthRedirect.guard.tsx   # Redirección de autenticación
```

**Características**:
- ✅ Autenticación con Supabase Auth
- ✅ Gestión de roles (Admin, Organizador, Asistente)
- ✅ Guards de rutas con protección por roles
- ✅ Persistencia de sesión
- ✅ Redirecciones automáticas

### 2. **📅 Events Module**
**Responsabilidad**: Gestión completa de eventos

```
events/
├── 📁 application/
│   ├── hooks/                          # Custom hooks de eventos
│   ├── services/                       # Servicios de aplicación
│   └── validators/                     # Validadores de formularios
├── 📁 domain/
│   ├── constants/                      # Constantes del dominio
│   ├── entities/                       # Entidades de eventos
│   └── types/                         # Tipos específicos
├── 📁 infrastructure/
│   ├── api/                           # Clientes API
│   └── store/                         # Estado global
│       └── Event.store.ts             # Store de eventos
└── 📁 presentation/
    ├── components/                    # Componentes de UI
    │   ├── create-event/              # Componentes de creación
    │   │   ├── BasicEventInfo.component.tsx
    │   │   ├── TicketTypesManagement.component.tsx
    │   │   ├── FormSteps.component.tsx
    │   │   ├── FormNavigation.component.tsx
    │   │   ├── EventPreview.component.tsx
    │   │   └── CreateEventForm.component.tsx
    │   ├── EventCard/                 # Tarjetas de eventos
    │   ├── EventFilters/              # Filtros de eventos
    │   └── [otros componentes]
    └── pages/                         # Páginas del módulo
        ├── Home.page.tsx              # Página principal
        ├── Events.page.tsx            # Lista de eventos
        ├── EventDetail.page.tsx       # Detalle de evento
        └── CreateEvent.page.tsx       # Crear evento
```

**Características**:
- ✅ CRUD completo de eventos
- ✅ Sistema de filtros avanzados
- ✅ Gestión de tipos de entrada
- ✅ Personalización de eventos
- ✅ Vista previa en tiempo real
- ✅ Formularios multi-paso

### 3. **👥 Users Module**
**Responsabilidad**: Gestión de usuarios y perfiles

```
users/
├── 📁 application/
│   ├── hooks/                          # Custom hooks de usuarios
│   └── services/                       # Servicios de aplicación
├── 📁 domain/
│   ├── entities/                       # Entidades de usuario
│   └── types/                         # Tipos específicos
├── 📁 infrastructure/
│   ├── api/                           # Clientes API
│   └── store/                         # Estado global
└── 📁 presentation/
    ├── components/                    # Componentes de UI
    └── pages/                         # Páginas del módulo
        └── Profile.page.tsx           # Perfil de usuario
```

### 4. **🎫 Payments Module**
**Responsabilidad**: Sistema de pagos y compras

```
payments/
├── 📁 application/
│   ├── hooks/                          # Custom hooks de pagos
│   └── services/                       # Servicios de aplicación
├── 📁 domain/
│   ├── entities/                       # Entidades de pago
│   └── types/                         # Tipos específicos
├── 📁 infrastructure/
│   ├── api/                           # Clientes API
│   ├── services/                      # Servicios externos
│   └── store/                         # Estado global
│       ├── Payment.store.ts           # Store de pagos
│       └── Cart.store.ts              # Store del carrito
└── 📁 presentation/
    ├── components/                    # Componentes de UI
    └── pages/                         # Páginas del módulo
        ├── Checkout.page.tsx          # Proceso de pago
        └── Tickets.page.tsx           # Entradas del usuario
```

**Características**:
- ✅ Carrito de compras
- ✅ Múltiples métodos de pago
- ✅ Gestión de entradas
- ✅ Códigos QR para entrada
- ✅ Confirmaciones de compra

### 5. **📊 Analytics Module**
**Responsabilidad**: Analíticas y métricas del sistema

```
analytics/
├── 📁 application/
│   ├── hooks/                          # Custom hooks de analíticas
│   └── services/                       # Servicios de aplicación
├── 📁 domain/
│   ├── entities/                       # Entidades de analíticas
│   └── types/                         # Tipos específicos
├── 📁 infrastructure/
│   ├── api/                           # Clientes API
│   └── store/                         # Estado global
│       └── Analytics.store.ts         # Store de analíticas
└── 📁 presentation/
    ├── components/                    # Componentes de UI
    │   ├── AnalyticsDashboard.component.tsx
    │   ├── AdvancedMetrics.component.tsx
    │   ├── Chart.component.tsx
    │   ├── MetricCard.component.tsx
    │   └── TrendsChart.component.tsx
    └── pages/                         # Páginas del módulo
```

**Características**:
- ✅ Dashboard de métricas
- ✅ Gráficos interactivos
- ✅ Reportes personalizados
- ✅ Métricas en tiempo real
- ✅ Exportación de datos

### 6. **🔔 Notifications Module**
**Responsabilidad**: Sistema de notificaciones

```
notifications/
├── 📁 application/
│   ├── hooks/                          # Custom hooks de notificaciones
│   └── services/                       # Servicios de aplicación
├── 📁 domain/
│   ├── entities/                       # Entidades de notificación
│   └── types/                         # Tipos específicos
├── 📁 infrastructure/
│   ├── api/                           # Clientes API
│   └── store/                         # Estado global
│       └── Notification.store.ts     # Store de notificaciones
└── 📁 presentation/
    ├── components/                    # Componentes de UI
    └── pages/                         # Páginas del módulo
        └── Notifications.page.tsx     # Centro de notificaciones
```

**Características**:
- ✅ Notificaciones en tiempo real
- ✅ Centro de notificaciones
- ✅ Diferentes tipos de notificación
- ✅ Gestión de estado de lectura
- ✅ Integración con Supabase Realtime

### 7. **👨‍💼 Organizers Module**
**Responsabilidad**: Panel de control para organizadores

```
organizers/
├── 📁 application/
│   ├── hooks/                          # Custom hooks de organizadores
│   └── services/                       # Servicios de aplicación
├── 📁 domain/
│   ├── entities/                       # Entidades de organizador
│   └── types/                         # Tipos específicos
├── 📁 infrastructure/
│   ├── api/                           # Clientes API
│   └── store/                         # Estado global
└── 📁 presentation/
    ├── components/                    # Componentes de UI
    │   ├── OrganizerMetrics.component.tsx
    │   ├── RecentActivity.component.tsx
    │   ├── QuickActions.component.tsx
    │   └── OrganizerDashboardContent.component.tsx
    └── pages/                         # Páginas del módulo
        └── OrganizerDashboard.page.tsx # Dashboard principal
```

**Características**:
- ✅ Dashboard personalizado
- ✅ Métricas de eventos
- ✅ Gestión de asistentes
- ✅ Reportes de ventas
- ✅ Herramientas de promoción

### 8. **⚙️ Administration Module**
**Responsabilidad**: Panel de administración del sistema

```
administration/
├── 📁 application/
│   ├── hooks/                          # Custom hooks de administración
│   └── services/                       # Servicios de aplicación
├── 📁 domain/
│   ├── entities/                       # Entidades de administración
│   └── types/                         # Tipos específicos
├── 📁 infrastructure/
│   ├── api/                           # Clientes API
│   └── store/                         # Estado global
└── 📁 presentation/
    ├── components/                    # Componentes de UI
    │   ├── dashboard/                 # Componentes del dashboard
    │   │   ├── AdminStatsCards.component.tsx
    │   │   ├── SystemMetrics.component.tsx
    │   │   ├── RecentActivity.component.tsx
    │   │   ├── TopOrganizers.component.tsx
    │   │   ├── DeviceLocationStats.component.tsx
    │   │   └── AdminDashboardContent.component.tsx
    │   ├── user-management/           # Gestión de usuarios
    │   │   ├── UserFilters.component.tsx
    │   │   ├── UserList.component.tsx
    │   │   ├── UserGrid.component.tsx
    │   │   ├── UserModal.component.tsx
    │   │   ├── RoleUpdateModal.component.tsx
    │   │   └── UserManagementContent.component.tsx
    │   ├── AdminDashboard.component.tsx
    │   └── UserManagementAdvanced.component.tsx
    └── pages/                         # Páginas del módulo
        └── Admin.page.tsx             # Página principal de admin
```

**Características**:
- ✅ Dashboard de administración
- ✅ Gestión de usuarios
- ✅ Métricas del sistema
- ✅ Configuración global
- ✅ Monitoreo en tiempo real

---

## 🔧 **Shared Layer - Código Compartido**

### **📚 Shared Library**
```
shared/
├── 🎨 ui/                             # Componentes UI reutilizables
│   ├── components/                    # Componentes base
│   ├── layouts/                       # Layouts del sistema
│   │   ├── Layout.layout.tsx          # Layout principal
│   │   ├── Header.layout.tsx          # Header global
│   │   └── Footer.layout.tsx          # Footer global
│   └── theme/                         # Sistema de temas
├── 📚 lib/                            # Utilidades y servicios
│   ├── api/                           # Servicios API
│   │   ├── services/                  # Servicios especializados
│   │   │   ├── User.service.ts        # Servicio de usuarios
│   │   │   ├── Event.service.ts       # Servicio de eventos
│   │   │   ├── TicketType.service.ts  # Servicio de tipos de entrada
│   │   │   ├── Purchase.service.ts    # Servicio de compras
│   │   │   ├── Notification.service.ts # Servicio de notificaciones
│   │   │   ├── EmailTemplate.service.ts # Servicio de plantillas
│   │   │   ├── Analytics.service.ts   # Servicio de analíticas
│   │   │   └── Realtime.service.ts    # Servicio de tiempo real
│   │   ├── Supabase.service.ts        # Servicio principal
│   │   └── supabase.ts                # Configuración de Supabase
│   ├── hooks/                         # Custom hooks compartidos
│   ├── services/                      # Servicios externos
│   │   ├── Email.service.ts           # Servicio de email
│   │   └── QR.service.ts              # Servicio de códigos QR
│   └── utils/                         # Utilidades generales
│       ├── Currency.utils.ts          # Utilidades de moneda
│       └── Date.utils.ts              # Utilidades de fecha
├── 🏷️ types/                          # Tipos TypeScript compartidos
│   └── index.ts                       # Definiciones de tipos
└── 🛠️ utils/                          # Utilidades generales
```
---

## 🛡️ **Seguridad y Autenticación**

### **Sistema de Roles**

```typescript
type UserRole = 'admin' | 'organizador' | 'asistente';

// Permisos por rol
const ROLE_PERMISSIONS = {
  admin: [
    'read:all', 'write:all', 'delete:all',
    'manage:users', 'manage:system', 'view:analytics'
  ],
  organizador: [
    'read:own', 'write:own', 'delete:own',
    'manage:events', 'view:attendees', 'view:analytics'
  ],
  asistente: [
    'read:public', 'purchase:tickets', 'view:own'
  ]
};
```

### **Guards de Rutas**

```typescript
// Protección por autenticación
<ProtectedRoute>
  <Component />
</ProtectedRoute>

// Protección por rol
<AdminGuard>
  <AdminComponent />
</AdminGuard>

// Redirección automática
<AdminRedirect>
  <Component />
</AdminRedirect>
```

---

## 🎨 **Sistema de Diseño**

### **Componentes UI Reutilizables**

```
shared/ui/
├── components/                        # Componentes base
│   ├── Button/                        # Botones
│   ├── Input/                         # Campos de entrada
│   ├── Modal/                         # Modales
│   ├── Card/                          # Tarjetas
│   ├── Table/                         # Tablas
│   └── Form/                          # Formularios
├── layouts/                           # Layouts del sistema
└── theme/                             # Sistema de temas
    ├── colors.ts                      # Paleta de colores
    ├── typography.ts                  # Tipografía
    └── spacing.ts                     # Espaciado
```

### **Estilos y Temas**

- **Tailwind CSS**: Framework de utilidades
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Soporte para tema oscuro
- **Custom Components**: Componentes personalizados
- **Consistent Spacing**: Sistema de espaciado consistente

---

## 🚀 **Despliegue y Configuración**

### **Variables de Entorno**

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Keys
VITE_STRIPE_PUBLIC_KEY=your_stripe_key
VITE_EMAIL_SERVICE_KEY=your_email_key

# Environment
VITE_APP_ENV=development|production
VITE_APP_VERSION=1.0.0
```

### **Scripts de Desarrollo**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "type-check": "tsc --noEmit"
  }
}
```

---

## 📊 **Métricas y Monitoreo**

### **Analíticas Implementadas**

- **Eventos**: Vistas, conversiones, asistentes
- **Usuarios**: Registros, actividad, retención
- **Pagos**: Ingresos, transacciones, métodos
- **Sistema**: Performance, errores, uptime

### **Reportes Disponibles**

- 📈 Dashboard de métricas en tiempo real
- 📊 Reportes de eventos por organizador
- 💰 Análisis de ingresos y conversiones
- 👥 Estadísticas de usuarios y asistentes
- 🔔 Métricas de notificaciones

---
