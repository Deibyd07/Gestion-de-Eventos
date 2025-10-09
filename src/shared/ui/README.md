# 🎨 EventHub Design System

Sistema de diseño completo basado en **DESIGN_SYSTEM.md** oficial, implementando todos los componentes, temas y utilidades especificados en la documentación.

## 📋 Tabla de Contenido

1. [Instalación](#instalación)
2. [Estructura](#estructura)
3. [Tema](#tema)
4. [Componentes](#componentes)
5. [Utilidades](#utilidades)
6. [Uso](#uso)
7. [Ejemplos](#ejemplos)

## 🚀 Instalación

```bash
# Importar el sistema completo
import { Button, Card, Modal, colors, typography } from '@/shared/ui';

# O importar componentes específicos
import { Button } from '@/shared/ui/components/Button/Button.component';
import { colors } from '@/shared/ui/theme/colors';
```

## 📁 Estructura

```
src/shared/ui/
├── theme/                    # Sistema de tema
│   ├── colors.ts            # Paleta de colores
│   ├── typography.ts        # Tipografía
│   ├── spacing.ts          # Espaciado
│   ├── shadows.ts          # Sombras
│   ├── glassmorphism.ts    # Sistema glassmorphism
│   ├── scrollbars.ts       # Scrollbars personalizados
│   ├── animations.ts       # Animaciones
│   ├── zindex.ts           # Z-Index
│   ├── responsive.ts        # Responsive
│   └── accessibility.ts    # Accesibilidad
├── components/              # Componentes UI
│   ├── Button/             # Botones
│   ├── Input/              # Inputs
│   ├── Card/               # Tarjetas
│   ├── Modal/              # Modales
│   ├── Badge/              # Badges
│   ├── Alert/              # Alertas
│   └── Toast/              # Notificaciones
├── utils/                   # Utilidades
│   └── cn.ts               # Combinador de clases
└── index.ts                # Exportaciones principales
```

## 🎨 Tema

### Colores

```typescript
import { colors, gradients, transparencies } from '@/shared/ui/theme/colors';

// Colores principales
colors.purple[500]    // #A855F7
colors.blue[500]      // #3B82F6
colors.green[500]     // #22C55E

// Gradientes
gradients.export      // 'from-blue-500 to-purple-600'
gradients.create      // 'from-green-500 to-emerald-600'
gradients.update      // 'from-orange-500 to-red-600'

// Transparencias
transparencies.white[20]  // 'rgba(255, 255, 255, 0.2)'
```

### Tipografía

```typescript
import { typographyClasses, textStyles } from '@/shared/ui/theme/typography';

// Clases predefinidas
typographyClasses.h1   // 'text-3xl font-bold text-gray-900 leading-tight'
typographyClasses.body // 'text-base text-gray-600 leading-relaxed'

// Estilos específicos
textStyles.hero        // Estilo para títulos hero
textStyles.h1          // Estilo para H1
```

### Glassmorphism

```typescript
import { glassmorphismClasses, applyGlassmorphism } from '@/shared/ui/theme/glassmorphism';

// Clases glassmorphism
glassmorphismClasses.panel    // Panel glassmorphism
glassmorphismClasses.card     // Tarjeta glassmorphism
glassmorphismClasses.header   // Header glassmorphism

// Aplicar glassmorphism con color
applyGlassmorphism('blue')    // Glassmorphism azul
applyGlassmorphism('green')   // Glassmorphism verde
```

## 🧩 Componentes

### Button

```tsx
import { Button, IconButton, CriticalButton } from '@/shared/ui';

// Botón estándar
<Button variant="primary" size="md">
  Click me
</Button>

// Botón por función
<Button function="create" size="lg">
  Crear Usuario
</Button>

// Botón con icono
<IconButton icon={<Plus />} variant="primary" />

// Botón crítico
<CriticalButton onClick={handleDelete}>
  Eliminar
</CriticalButton>
```

### Card

```tsx
import { Card, StatisticalCard, MetricCard } from '@/shared/ui';

// Tarjeta estándar
<Card variant="standard">
  <h3>Contenido</h3>
</Card>

// Tarjeta glassmorphism
<Card variant="glassmorphism" color="blue">
  <h3>Contenido</h3>
</Card>

// Tarjeta estadística
<StatisticalCard
  title="Usuarios"
  value="1,234"
  change={{ value: "+12%", type: "positive" }}
  icon={<Users />}
  color="blue"
/>
```

### Badge

```tsx
import { Badge, StatusBadge, RoleBadge } from '@/shared/ui';

// Badge estándar
<Badge variant="success">Activo</Badge>

// Badge de estado
<StatusBadge status="active" />

// Badge de rol
<RoleBadge role="admin" />
```

### Alert

```tsx
import { Alert, AlertWithAction } from '@/shared/ui';

// Alerta estándar
<Alert variant="success" title="Éxito">
  Operación completada
</Alert>

// Alerta con acción
<AlertWithAction
  variant="warning"
  title="Advertencia"
  actionText="Reintentar"
  onAction={handleRetry}
>
  Error en la operación
</AlertWithAction>
```

### Toast

```tsx
import { Toast, ToastContainer, useToast } from '@/shared/ui';

// Toast estándar
<Toast variant="success" title="Éxito">
  Operación completada
</Toast>

// Hook para manejar toasts
const { addToast } = useToast();
addToast('Mensaje de éxito', { variant: 'success' });
```

## 🛠️ Utilidades

### Combinador de Clases

```typescript
import { cn } from '@/shared/ui/utils/cn';

// Combinar clases
cn('base-class', 'additional-class', condition && 'conditional-class')

// Con condiciones
cn('btn', 'btn-primary', isActive && 'active', isDisabled && 'disabled')
```

### Responsive

```typescript
import { responsiveClasses, getGridClass } from '@/shared/ui/theme/responsive';

// Grid responsive
getGridClass('cards4')  // 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'

// Espaciado responsive
responsiveClasses.spacing.padding  // 'px-4 sm:px-6 lg:px-8'
```

### Animaciones

```typescript
import { animationClasses, useAnimation } from '@/shared/ui/theme/animations';

// Clases de animación
animationClasses.animation.fadeIn   // 'animate-fade-in'
animationClasses.animation.slideIn  // 'animate-slide-in'

// Hook para animaciones
const { className } = useAnimation('fadeIn');
```

## 📱 Uso

### Importación Completa

```typescript
import { 
  Button, 
  Card, 
  Modal, 
  colors, 
  typography, 
  glassmorphism 
} from '@/shared/ui';
```

### Importación Específica

```typescript
import { Button } from '@/shared/ui/components/Button/Button.component';
import { colors } from '@/shared/ui/theme/colors';
```

## 🎯 Ejemplos

### Dashboard con Glassmorphism

```tsx
import { Card, StatisticalCard, glassmorphismClasses } from '@/shared/ui';

const Dashboard = () => (
  <div className={glassmorphismClasses.background}>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatisticalCard
        title="Usuarios"
        value="1,234"
        change={{ value: "+12%", type: "positive" }}
        icon={<Users />}
        color="blue"
      />
      <StatisticalCard
        title="Eventos"
        value="56"
        change={{ value: "+8%", type: "positive" }}
        icon={<Calendar />}
        color="green"
      />
    </div>
  </div>
);
```

### Formulario con Validación

```tsx
import { Input, Button, Alert } from '@/shared/ui';

const Form = () => {
  const [error, setError] = useState('');
  
  return (
    <form>
      <Input
        label="Email"
        type="email"
        error={error}
        variant={error ? 'error' : 'default'}
      />
      {error && (
        <Alert variant="error" title="Error">
          {error}
        </Alert>
      )}
      <Button function="create" type="submit">
        Crear Usuario
      </Button>
    </form>
  );
};
```

## 🎨 Características

- ✅ **100% Alineado** con DESIGN_SYSTEM.md oficial
- ✅ **Sistema Glassmorphism** completo
- ✅ **Componentes Reutilizables** con TypeScript
- ✅ **Responsive Design** con breakpoints específicos
- ✅ **Accesibilidad** WCAG 2.1 AA
- ✅ **Animaciones** personalizadas
- ✅ **Scrollbars** personalizados
- ✅ **Z-Index** jerárquico
- ✅ **Utilidades** de desarrollo

## 📚 Documentación

Para más detalles, consulta:
- [DESIGN_SYSTEM.md](../../../DESIGN_SYSTEM.md) - Documentación oficial
- [ARCHITECTURE_DOCUMENTATION.md](../../../ARCHITECTURE_DOCUMENTATION.md) - Arquitectura del proyecto

---

*Sistema de diseño implementado según las especificaciones oficiales de EventHub*