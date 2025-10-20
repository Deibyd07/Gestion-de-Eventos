# 📚 EventHub - Documentación de Tipos de Programación

## 🎯 **Resumen del Proyecto**

**EventHub** es una plataforma integral de gestión de eventos desarrollada con **React + TypeScript** que implementa múltiples paradigmas y tipos de programación moderna para crear una aplicación robusta, escalable y mantenible.

---

## 🏗️ **Tipos de Programación Implementados**

### **1. 📋 Programación Funcional**

El proyecto hace uso extensivo de la programación funcional a través de:

#### **Características Implementadas:**
- ✅ **React Hooks**: `useState`, `useEffect`, custom hooks
- ✅ **Funciones Puras**: Componentes sin efectos secundarios
- ✅ **Immutabilidad**: Estado inmutable con Zustand
- ✅ **Composición**: Componentes compuestos y HOCs

#### **Ejemplos en el Código:**
```typescript
// Custom Hook Funcional
const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  login: async (email: string, password: string) => {
    // Función pura que retorna nuevo estado
    set({ user: userData, isAuthenticated: true });
  }
}));

// Componente Funcional Puro
export const Button: React.FC<ButtonProps> = ({
  children, variant = 'primary', onClick
}) => {
  return (
    <button className={cn(variants[variant])} onClick={onClick}>
      {children}
    </button>
  );
};
```

---

### **2. 🏗️ Programación Orientada a Objetos (OOP)**

#### **Características Implementadas:**
- ✅ **Interfaces y Contratos**: Definición clara de tipos
- ✅ **Encapsulación**: Servicios especializados
- ✅ **Abstracción**: Capas de servicios
- ✅ **Herencia**: Extensión de interfaces

#### **Ejemplos en el Código:**
```typescript
// Definición de Interfaces
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'organizer' | 'attendee';
  avatar?: string;
  preferences?: {
    categories: string[];
    location: string;
  };
}

// Servicios Encapsulados
class ServicioUsuarios {
  static async obtenerUsuarioPorEmail(email: string): Promise<User | null> {
    // Lógica encapsulada del servicio
  }
  
  static async crearUsuario(userData: CreateUserData): Promise<User> {
    // Método específico del dominio
  }
}
```

---

### **3. 🎨 Programación Basada en Componentes**

#### **Características Implementadas:**
- ✅ **Componentes Reutilizables**: Design System completo
- ✅ **Props y Composición**: Comunicación entre componentes
- ✅ **Render Props**: Patrones flexibles de renderizado
- ✅ **Component Composition**: Composición de funcionalidades

#### **Estructura de Componentes:**
```
src/shared/ui/components/
├── Button/           # Botones reutilizables
├── Card/            # Tarjetas de información
├── Input/           # Campos de entrada
├── Modal/           # Modales del sistema
└── Toast/           # Notificaciones
```

#### **Ejemplo:**
```typescript
// Componente Base Reutilizable
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'critical';
  size?: 'sm' | 'md' | 'lg';
  function?: 'export' | 'create' | 'update';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, variant, size, function: functionType 
}) => {
  const buttonVariant = functionType 
    ? functionVariants[functionType] 
    : standardVariants[variant];
    
  return (
    <button className={cn(buttonVariant, sizes[size])}>
      {children}
    </button>
  );
};
```

---

### **4. 🏛️ Domain-Driven Design (DDD)**

#### **Arquitectura por Capas:**
```
modules/
├── authentication/
│   ├── domain/          # Entidades y tipos del dominio
│   ├── application/     # Casos de uso y lógica de aplicación
│   ├── infrastructure/  # Servicios externos y persistencia
│   └── presentation/    # UI y componentes
├── events/
├── payments/
├── users/
└── notifications/
```

#### **Separación de Responsabilidades:**
- **Domain**: Lógica de negocio pura
- **Application**: Casos de uso y orquestación
- **Infrastructure**: Acceso a datos y servicios externos
- **Presentation**: Interfaz de usuario

---

### **5. 🔄 Programación Reactiva**

#### **Características Implementadas:**
- ✅ **Estado Reactivo**: Zustand para gestión global
- ✅ **Observables**: Supabase Realtime
- ✅ **Event-Driven**: Manejo de eventos
- ✅ **Data Binding**: Sincronización automática

#### **Ejemplo:**
```typescript
// Store Reactivo con Zustand
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      
      // Actualización reactiva del estado
      login: async (email, password) => {
        const userData = await authenticate(email, password);
        set({ 
          user: userData, 
          isAuthenticated: true 
        }); // El estado se propaga automáticamente
      }
    }),
    { name: 'auth-storage' }
  )
);

// Componente que reacciona a cambios
function ProfileComponent() {
  const { user, isAuthenticated } = useAuthStore();
  // Se re-renderiza automáticamente cuando cambia el estado
  
  return (
    <div>
      {isAuthenticated ? `Hola ${user?.name}` : 'No autenticado'}
    </div>
  );
}
```

---

### **6. 🔗 Programación Asíncrona**

#### **Características Implementadas:**
- ✅ **Async/Await**: Operaciones asíncronas
- ✅ **Promise Handling**: Manejo de promesas
- ✅ **Error Boundaries**: Manejo de errores
- ✅ **Loading States**: Estados de carga

#### **Ejemplo:**
```typescript
// Función Asíncrona con Manejo de Errores
login: async (email: string, password: string) => {
  try {
    // Autenticación con Supabase
    const { data: authData, error: authError } = 
      await supabase.auth.signInWithPassword({ email, password });

    if (authError) throw new Error('Credenciales inválidas');

    // Obtener datos del usuario
    const userData = await ServicioUsuarios.obtenerUsuarioPorEmail(email);
    
    if (!userData) throw new Error('Usuario no encontrado');

    // Actualizar estado
    set({
      user: mapUserData(userData),
      isAuthenticated: true,
      token: `auth-token-${userData.id}`
    });
  } catch (error: any) {
    throw new Error(error.message || 'Error al iniciar sesión');
  }
}
```

---

### **7. 🏗️ Programación Modular**

#### **Estructura Modular:**
- ✅ **Feature-Based Modules**: Organización por funcionalidad
- ✅ **Barrel Exports**: Exportaciones centralizadas
- ✅ **Dependency Injection**: Inyección de dependencias
- ✅ **Loose Coupling**: Módulos independientes

#### **Ejemplo de Módulo:**
```typescript
// src/modules/events/index.ts - Barrel Export
export * from './presentation/pages';
export * from './presentation/components';
export * from './domain/types';
export * from './application/hooks';

// Uso en otros módulos
import { EventCard, useEvents, Event } from '@modules/events';
```

---

### **8. 📝 Programación Declarativa**

#### **Características Implementadas:**
- ✅ **JSX/TSX**: UI declarativa
- ✅ **Tailwind CSS**: Estilos declarativos
- ✅ **React Router**: Enrutamiento declarativo
- ✅ **Form Validation**: Validación con Yup

#### **Ejemplo:**
```typescript
// Enrutamiento Declarativo
function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsPage />} />
        
        {/* Rutas protegidas */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
        
        {/* Rutas de administrador */}
        <Route 
          path="/admin/*" 
          element={
            <AdminGuard>
              <AdminRoutes />
            </AdminGuard>
          } 
        />
      </Routes>
    </Router>
  );
}
```

---

### **9. 🎯 Programación por Patrones (Pattern-Based)**

#### **Patrones Implementados:**

##### **Store Pattern**
```typescript
// Centralización del estado global
const useEventStore = create<EventState>((set) => ({
  events: [],
  filters: {},
  addEvent: (event) => set(state => ({ 
    events: [...state.events, event] 
  }))
}));
```

##### **Service Pattern**
```typescript
// Servicios especializados
class EventService {
  static async getEvents(): Promise<Event[]> { }
  static async createEvent(data: CreateEventData): Promise<Event> { }
  static async updateEvent(id: string, data: UpdateEventData): Promise<Event> { }
}
```

##### **Guard Pattern**
```typescript
// Protección de rutas
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};
```

##### **Factory Pattern**
```typescript
// Creación de componentes dinámicos
const createButton = (type: ButtonType) => {
  const variants = {
    primary: PrimaryButton,
    secondary: SecondaryButton,
    critical: CriticalButton
  };
  
  return variants[type];
};
```

---

### **10. 🔐 Programación Orientada a Roles (RBAC)**

#### **Sistema de Control de Acceso:**
```typescript
// Definición de Roles
type UserRole = 'admin' | 'organizer' | 'attendee';

// Permisos por Rol
const ROLE_PERMISSIONS = {
  admin: [
    'read:all', 'write:all', 'delete:all',
    'manage:users', 'manage:system', 'view:analytics'
  ],
  organizer: [
    'read:own', 'write:own', 'delete:own',
    'manage:events', 'view:attendees', 'view:analytics'
  ],
  attendee: [
    'read:public', 'purchase:tickets', 'view:own'
  ]
};

// Guard por Rol
export const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};
```

---

## 🚀 **Stack Tecnológico**

### **Frontend Core**
- **React 18**: Biblioteca de UI con hooks y programación funcional
- **TypeScript**: Tipado estático para programación orientada a objetos
- **Vite**: Build tool moderno con ES modules

### **Estado y Datos**
- **Zustand**: Estado global reactivo con programación funcional
- **Supabase**: Backend-as-a-Service con programación asíncrona
- **React Hook Form**: Formularios con programación declarativa

### **UI y Estilos**
- **Tailwind CSS**: Framework de utilidades declarativas
- **Lucide React**: Iconos como componentes
- **Headless UI**: Componentes accesibles

### **Desarrollo y Calidad**
- **ESLint**: Linting y mejores prácticas
- **TypeScript Strict**: Verificación de tipos estricta
- **Responsive Design**: Mobile-first approach

---

## 🎨 **Metodologías de Desarrollo**

### **Principios Aplicados**

#### **Clean Architecture**
- Separación clara de responsabilidades por capas
- Dependencias apuntan hacia adentro (dominio)
- Independencia de frameworks y UI

#### **SOLID Principles**
- **S**ingle Responsibility: Cada módulo tiene una responsabilidad
- **O**pen/Closed: Extensible sin modificar código existente
- **L**iskov Substitution: Interfaces intercambiables
- **I**nterface Segregation: Interfaces específicas y pequeñas
- **D**ependency Inversion: Dependencias por abstracción

#### **DRY (Don't Repeat Yourself)**
- Componentes UI reutilizables
- Hooks personalizados compartidos
- Utilidades y servicios centralizados

#### **KISS (Keep It Simple)**
- Código simple y legible
- Funciones pequeñas con propósito único
- Documentación clara y ejemplos

---

## 📁 **Estructura del Proyecto**

```
eventhub/
├── 📱 src/
│   ├── 🧩 modules/                    # Módulos de dominio
│   │   ├── 🔐 authentication/        # Autenticación y autorización
│   │   ├── 📅 events/                # Gestión de eventos
│   │   ├── 👥 users/                 # Gestión de usuarios
│   │   ├── 🎫 payments/              # Sistema de pagos
│   │   ├── 📊 analytics/             # Analíticas y métricas
│   │   ├── 🔔 notifications/         # Notificaciones
│   │   ├── 👨‍💼 organizers/           # Panel organizadores
│   │   └── ⚙️ administration/        # Panel administración
│   ├── 🔧 shared/                    # Código compartido
│   │   ├── 🎨 ui/                    # Componentes UI
│   │   ├── 📚 lib/                   # Servicios y APIs
│   │   ├── 🏷️ types/                 # Tipos compartidos
│   │   └── 🛠️ utils/                 # Utilidades
│   ├── 📱 App.tsx                    # Componente principal
│   └── 🎯 main.tsx                   # Punto de entrada
├── 📄 package.json                   # Dependencias
├── ⚙️ tsconfig.json                  # Configuración TypeScript
├── 🎨 tailwind.config.js             # Configuración Tailwind
└── 📚 Documentacion/                 # Documentación del proyecto
```

---

## 🔧 **Instalación y Configuración**

### **Prerrequisitos**
- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase

### **Instalación**
```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/eventhub.git
cd eventhub

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase

# Iniciar desarrollo
npm run dev
```

### **Variables de Entorno**
```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Configuración de la app
VITE_APP_ENV=development
VITE_APP_VERSION=1.0.0
```

---

## 🚀 **Scripts Disponibles**

```json
{
  "dev": "vite",                    // Desarrollo
  "build": "vite build",            // Construcción
  "preview": "vite preview",        // Vista previa
  "lint": "eslint .",              // Linting
  "typecheck": "tsc --noEmit"      // Verificación de tipos
}
```

---

## 🧪 **Mejores Prácticas Implementadas**

### **Código**
- ✅ Tipado estricto con TypeScript
- ✅ Componentes funcionales puros
- ✅ Custom hooks reutilizables
- ✅ Manejo de errores consistente
- ✅ Loading states en todas las operaciones
- ✅ Validación de formularios con Yup

### **Arquitectura**
- ✅ Separación de responsabilidades
- ✅ Módulos independientes y reutilizables
- ✅ Estado centralizado y reactivo
- ✅ Servicios especializados por dominio
- ✅ Guards de seguridad por roles

### **UI/UX**
- ✅ Design system consistente
- ✅ Responsive design mobile-first
- ✅ Componentes accesibles
- ✅ Feedback visual para todas las acciones
- ✅ Navegación intuitiva y protegida

---

## 📈 **Beneficios de la Arquitectura**

### **Escalabilidad**
- Fácil agregar nuevos módulos y funcionalidades
- Estructura predecible y consistente
- Separación clara de responsabilidades

### **Mantenibilidad**
- Código organizado y bien documentado
- Componentes reutilizables y testeables
- Separación de lógica de negocio y presentación

### **Colaboración**
- Estructura clara para equipos de desarrollo
- Convenciones de código establecidas
- Documentación completa y actualizada

### **Calidad**
- Tipado estricto previene errores
- Componentes aislados y testeables
- Manejo robusto de errores y estados

---

## 🤝 **Contribución**

Para contribuir al proyecto:

1. Fork del repositorio
2. Crear feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit de cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

---

## 📝 **Licencia**

Este proyecto está bajo la licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

---

## 👥 **Equipo de Desarrollo**

- **Arquitectura**: Domain-Driven Design + Feature-Based
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Supabase (BaaS)
- **Estado**: Zustand (Programación Reactiva)
- **Patrones**: Clean Architecture + SOLID Principles

---

**EventHub** - *Gestión de eventos con arquitectura moderna y múltiples paradigmas de programación* 🎉
