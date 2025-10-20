# 🎫 EventHub - Plataforma Integral de Gestión de Eventos

<div align="center">

![EventHub](https://img.shields.io/badge/EventHub-v1.0-blueviolet?style=for-the-badge&logo=calendar)
![React](https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6?style=for-the-badge&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06b6d4?style=for-the-badge&logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-BaaS-3ecf8e?style=for-the-badge&logo=supabase)
![Zustand](https://img.shields.io/badge/Zustand-Estado-ff6b35?style=for-the-badge)
![Vite](https://img.shields.io/badge/Vite-5.4-646cff?style=for-the-badge&logo=vite)

**🎯 Plataforma integral de gestión de eventos con arquitectura moderna y 10 paradigmas de programación**

[📋 Ver Documentación](#-documentación) · [🚀 Guía de Instalación](#-instalación) · [🏗️ Arquitectura](./Documentacion/Arquitectura_Sistema.md) · [💻 Tipos de Programación](./Documentacion/Tipo_Programacion.md)

</div>

---

## 📋 Tabla de Contenido

- [✨ Características](#-características)
- [🛠️ Tecnologías](#️-tecnologías)
- [🏗️ Arquitectura y Paradigmas](#️-arquitectura-y-paradigmas)
- [📦 Requisitos Previos](#-requisitos-previos)
- [🚀 Instalación](#-instalación-rápida)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [🎮 Scripts Disponibles](#-scripts-disponibles)
- [📚 Documentación](#-documentación)
- [👥 Roles de Usuario](#-roles-de-usuario)
- [🌟 Características Destacadas](#-características-destacadas)
- [🤝 Contribuir](#-contribuir)
- [📄 Licencia](#-licencia)

---

## ✨ Características

### 🎯 **Para Asistentes**
- 🔍 Exploración y búsqueda avanzada de eventos
- 🎫 Compra de entradas con múltiples métodos de pago
- 📱 Entradas digitales con códigos QR
- 🔔 Notificaciones en tiempo real
- 👤 Gestión de perfil personal
- 📊 Historial de compras

### 👥 **Para Organizadores**
- ➕ Creación y gestión de eventos
- 🎨 Personalización de eventos (colores, tipografía, layouts)
- 💰 Panel de analíticas y reportes financieros
- 👫 Gestión de asistentes
- 📧 Sistema de notificaciones por email
- 🎟️ Múltiples tipos de entradas (General, VIP, Early Bird)
- 🏷️ Códigos promocionales y descuentos
- 📈 Métricas en tiempo real

### 🛡️ **Para Administradores**
- 📊 Dashboard completo con métricas del sistema
- 👤 Gestión avanzada de usuarios
- 🎭 Gestión de todos los eventos
- 💳 Dashboard de pagos y transacciones
- 🔔 Centro de notificaciones
- 🔧 Gestión del sistema
- 📈 Analíticas globales

---

## 🛠️ Tecnologías

### **Frontend**
- ⚛️ **React 18.3** - Librería de UI
- 📘 **TypeScript 5.5** - Tipado estático
- ⚡ **Vite 5.4** - Build tool y dev server
- 🎨 **Tailwind CSS 3.4** - Framework de estilos
- 🧭 **React Router 7.9** - Navegación
- 🗂️ **Zustand 5.0** - Gestión de estado

### **Backend & Database**
- 🔥 **Supabase** - Backend as a Service
- 🐘 **PostgreSQL** - Base de datos relacional
- 🔐 **Row Level Security (RLS)** - Seguridad a nivel de fila

### **Librerías Adicionales**
- 📋 **React Hook Form** - Manejo de formularios
- ✅ **Yup** - Validación de esquemas
- 📱 **html5-qrcode** - Escaneo de códigos QR
- 🎯 **react-qr-code** - Generación de códigos QR
- 🎨 **Lucide React** - Sistema de iconos

---

## 🏗️ **Arquitectura y Paradigmas**

### **🎯 Arquitectura Híbrida Moderna**

EventHub implementa una **arquitectura innovadora** que combina:

<table>
<tr>
<td width="50%">

**🏛️ Clean Architecture**
- ✅ Separación de responsabilidades
- ✅ Independencia de frameworks
- ✅ Inversión de dependencias
- ✅ Testabilidad y mantenibilidad

</td>
<td width="50%">

**📦 Feature-Based Modules**
- ✅ Módulos independientes por dominio
- ✅ Escalabilidad horizontal
- ✅ Equipos autónomos
- ✅ Deploy independiente

</td>
</tr>
</table>

### **💻 10 Paradigmas de Programación**

| Paradigma | Stack | Beneficio Clave |
|-----------|--------|-----------------|
| 🔧 **Funcional** | React Hooks, Pure Functions | Inmutabilidad y predictibilidad |
| 🏛️ **Orientada a Objetos** | TypeScript Classes/Interfaces | Encapsulación y reutilización |
| 🎨 **Basada en Componentes** | React Components | Modularidad y composición |
| 🏗️ **Domain-Driven Design** | Módulos por negocio | Alineación con el dominio |
| 🔄 **Reactiva** | Zustand, Observables | Estado reactivo en tiempo real |
| ⚡ **Asíncrona** | Async/Await | Operaciones no bloqueantes |
| 📦 **Modular** | ES Modules | Código reutilizable |
| 📝 **Declarativa** | JSX, Schemas | Código expresivo |
| 🎯 **Por Patrones** | Design Patterns | Consistencia arquitectural |
| 🔐 **Orientada a Roles** | RBAC System | Seguridad granular |

### **🚀 Beneficios de Esta Arquitectura**

- 🎯 **Escalabilidad**: Cada módulo crece independientemente
- 🔧 **Mantenibilidad**: Código organizado y predecible
- 👥 **Colaboración**: Equipos pueden trabajar en paralelo
- 🛡️ **Robustez**: Múltiples capas de validación y seguridad
- 📈 **Performance**: Optimizaciones específicas por capa

**📖 Análisis completo**: [🏗️ Arquitectura del Sistema](./Documentacion/Arquitectura_Sistema.md)

---

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 o **yarn** >= 1.22.0
- **Git**
- Cuenta en **Supabase** (gratuita)

---

## 🚀 Instalación Rápida

### 🔥 **Quick Start (5 minutos)**

```bash
# 📥 1. Clonar el repositorio
git clone https://github.com/tu-usuario/eventhub.git
cd eventhub

# 📦 2. Instalar dependencias
npm install

# ⚙️ 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# 🚀 4. Iniciar desarrollo
npm run dev
```

### 🔧 **Instalación Detallada**

<details>
<summary><strong>👁️ Ver pasos detallados</strong></summary>

#### **Paso 1: Prerrequisitos**
```bash
# Verificar versiones
node --version  # >= 18.0.0
npm --version   # >= 9.0.0
git --version   # Cualquier versión reciente
```

#### **Paso 2: Clonar y Preparar**
```bash
# Clonar con todas las ramas
git clone --depth 1 https://github.com/tu-usuario/eventhub.git
cd eventhub

# Verificar estructura
ls -la  # Debe mostrar: src/, Documentacion/, package.json, etc.
```

#### **Paso 3: Instalación de Dependencias**
```bash
# Limpiar cache (opcional)
npm cache clean --force

# Instalar dependencias
npm ci  # Para instalación limpia
# O alternativamente:
# npm install
# yarn install
```

#### **Paso 4: Configuración de Supabase**

1️⃣ **Crear proyecto en Supabase:**
   - Ve a [supabase.com](https://supabase.com)
   - Crea una cuenta gratuita
   - Crea un nuevo proyecto
   - Espera ~2 minutos a que esté listo

2️⃣ **Obtener credenciales:**
   ```
   Settings → API → Project Configuration:
   - Project URL: https://tu-proyecto.supabase.co
   - anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3️⃣ **Configurar base de datos:**
   ```sql
   -- Ejecutar en Supabase SQL Editor:
   -- (Ver archivo completo en Documentacion/database/eventhub_database.sql)
   ```

#### **Paso 5: Variables de Entorno**
```bash
# Crear archivo de configuración
cp .env.example .env

# Editar el archivo .env:
nano .env
# O usar tu editor preferido: code .env, vim .env, etc.
```

**Contenido del archivo `.env`:**
```env
# 🔥 Supabase Configuration
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ⚙️ App Configuration
VITE_APP_ENV=development
VITE_APP_VERSION=1.0.0

# 🗺️ Optional: Configuración adicional
# VITE_STRIPE_PUBLIC_KEY=pk_test_...
# VITE_EMAIL_SERVICE_KEY=...
```

#### **Paso 6: Verificación e Inicio**
```bash
# ⚙️ Verificar configuración
npm run typecheck

# 🚀 Iniciar servidor de desarrollo
npm run dev

# 🎉 ¡Listo! La app estará en:
# http://localhost:5173
```

#### **Paso 7: Verificación del Funcionamiento**
- ✅ La página se carga sin errores
- ✅ Puedes ver eventos (si hay datos de ejemplo)
- ✅ El login/registro funciona
- ✅ No hay errores en la consola del navegador

</details>

### 👨‍💻 **Comandos Disponibles**

```bash
# 💻 Desarrollo
npm run dev              # Servidor de desarrollo con hot-reload
npm run build            # Build de producción
npm run preview          # Preview del build

# 🔍 Calidad de Código
npm run lint             # ESLint - detectar errores
npm run typecheck        # TypeScript - verificar tipos

# 🧙 Utilidades
npm run clean            # Limpiar node_modules y dist/
```

### 👍 **Verificación de Instalación Exitosa**

Si todo está configurado correctamente, deberías ver:

- ✅ **Puerto 5173 activo**: `http://localhost:5173`
- ✅ **Sin errores en consola**: Revisar DevTools (F12)
- ✅ **Conexión a Supabase**: Los eventos se cargan
- ✅ **Autenticación funcional**: Puedes registrarte/iniciar sesión

### 🔧 **Configuraciones Opcionales**

<details>
<summary><strong>💳 Configuración de Pagos</strong></summary>

```env
# Añadir a tu archivo .env
VITE_STRIPE_PUBLIC_KEY=pk_test_tu_clave_publica_de_stripe
```

Actualizar configuración en:
- `src/shared/lib/services/Payment.service.ts`

</details>

<details>
<summary><strong>📧 Configuración de Email</strong></summary>

```env
# Configuración para notificaciones por email
VITE_EMAIL_SERVICE_KEY=tu_clave_de_servicio_email
VITE_EMAIL_FROM=noreply@eventhub.com
```

</details>

---

---

## 📁 Estructura del Proyecto

### 🏗️ **Arquitectura Feature-Based + DDD**

```
eventhub/
├── 📄 Documentacion/           # ⭐ Documentación completa del proyecto
│   ├── 📋 Tipo_Programacion.md     # Análisis de 10 paradigmas implementados
│   ├── 🏗️ Arquitectura_Sistema.md   # Arquitectura y patrones de diseño
│   ├── 📈 Diagramas/              # Diagramas UML y de arquitectura
│   └── 🗄️ database/              # Scripts SQL y esquemas
├── 🗾 src/
│   ├── 🧩 modules/              # Módulos por dominio de negocio
│   │   ├── 🔐 authentication/      # Autenticación y autorización
│   │   │   ├── domain/           # Entidades y reglas de negocio
│   │   │   ├── application/      # Casos de uso y hooks
│   │   │   ├── infrastructure/   # APIs, store, servicios externos
│   │   │   └── presentation/     # UI, components, pages
│   │   ├── 📅 events/              # Gestión de eventos
│   │   ├── 👥 users/               # Gestión de usuarios
│   │   ├── 🎫 payments/            # Sistema de pagos
│   │   ├── 📈 analytics/           # Analíticas y métricas
│   │   ├── 🔔 notifications/      # Sistema de notificaciones
│   │   ├── 👨‍💼 organizers/        # Panel de organizadores
│   │   └── ⚙️ administration/     # Panel de administración
│   └── 🔧 shared/               # Código compartido entre módulos
│       ├── 🎨 ui/                # Sistema de diseño y componentes
│       ├── 📏 lib/               # Servicios, APIs, utilidades
│       └── 🏷️ types/             # Tipos TypeScript compartidos
├── ⚙️ package.json              # Dependencias y scripts
├── 📝 tsconfig.json            # Configuración TypeScript
├── 🎨 tailwind.config.js       # Configuración Tailwind CSS
└── ⚡ vite.config.ts            # Configuración de build y desarrollo
```

### 💯 **Características de la Arquitectura:**
- ✅ **Clean Architecture** - Separación clara de responsabilidades
- ✅ **Domain-Driven Design** - Organización por dominios de negocio
- ✅ **Feature-Based** - Módulos independientes y escalables
- ✅ **10 Paradigmas de Programación** - Enfoque multi-paradigma moderno

**Ver documentación detallada**: [🏗️ Arquitectura del Sistema](./Documentacion/Arquitectura_Sistema.md)

---

## 🎮 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Producción
npm run build        # Construye la aplicación
npm run preview      # Preview del build

# Calidad de Código
npm run lint         # Ejecuta ESLint
npm run typecheck    # Verificación de tipos TypeScript
```

---

## 📚 Documentación

### **📋 Documentación Técnica**
- **[Tipos de Programación](./Documentacion/Tipo_Programacion.md)** - ⭐ **NUEVO** - Análisis completo de 10 paradigmas de programación implementados
- **[Arquitectura del Sistema](./Documentacion/Arquitectura_Sistema.md)** - Arquitectura general y patrones de diseño
- **[Análisis y Requerimientos](./Documentacion/Analisis_Levantamiento_Requerimientos.md)** - Levantamiento de requerimientos
- **[Base de Datos](./Documentacion/Base_Datos.md)** - Documentación de la base de datos

### **🎨 Documentación de Diseño**
- **[Diagramas del Sistema](./Documentacion/Diagramas/)** - Diagramas UML y de arquitectura
  - Casos de Uso
  - Diagrama de Clases
  - Entidad-Relación
  - Flujo de Datos
  - Secuencias
- **[Guía de Instalación](./Documentacion/Guia_Instalacion.md)** - Instalación paso a paso
- **[Nomenclatura de Archivos](./Documentacion/Nomenclatura_Archivos.md)** - Convenciones de código

### **🚀 Navegación de Documentación**
- 📚 **[Guía Completa de Documentación](./Documentacion/README.md)** - Navegación organizada por roles (Desarrollador, Analista, DBA)
- 📋 **[Punto de Entrada Principal](./Documentacion/README.md)** - Toda la información necesaria para navegar

### **🏗️ Arquitectura y Paradigmas**

**EventHub implementa 10 paradigmas de programación moderna:**

| # | Paradigma | Tecnologías | Uso en el Proyecto |
|---|-----------|-------------|--------------------|
| 1️⃣ | **🔧 Programación Funcional** | React Hooks, Pure Functions | Estado, transformaciones |
| 2️⃣ | **🏛️ Orientada a Objetos** | TypeScript Interfaces, Classes | Servicios, entidades |
| 3️⃣ | **🎨 Basada en Componentes** | React Components, Props | UI modular |
| 4️⃣ | **🏗️ Domain-Driven Design** | Módulos por dominio | Arquitectura escalable |
| 5️⃣ | **🔄 Programación Reactiva** | Zustand, Observables | Estado global |
| 6️⃣ | **⚡ Programación Asíncrona** | Async/Await, Promises | APIs, operaciones |
| 7️⃣ | **📦 Programación Modular** | ES Modules, Barrel exports | Código reutilizable |
| 8️⃣ | **📝 Programación Declarativa** | JSX, Yup schemas | UI, validaciones |
| 9️⃣ | **🎯 Programación por Patrones** | Store, Service, Factory | Arquitectura consistente |
| 🔟 | **🔐 Orientada a Roles (RBAC)** | Guards, Permissions | Seguridad, autorización |

**📖 Ver análisis detallado**: [📋 Tipos de Programación](./Documentacion/Tipo_Programacion.md)

---

## 👥 Roles de Usuario

### 🎫 **Asistente** (Usuario regular)
- Explorar eventos
- Comprar entradas
- Ver mis entradas
- Gestionar perfil

### 🎭 **Organizador**
- Todo lo del asistente +
- Crear y gestionar eventos
- Ver analíticas de sus eventos
- Gestionar asistentes
- Crear códigos promocionales

### 🛡️ **Administrador**
- Todo lo del organizador +
- Gestionar todos los usuarios
- Gestionar todos los eventos
- Ver analíticas globales
- Gestionar el sistema
- Centro de notificaciones

---

## 🔐 Usuarios de Prueba (Desarrollo)

Solo disponibles si ejecutaste `database/datos_ejemplo.sql`:

```
Administrador:
Email: admin1@eventhub.co
Password: admin123

Organizador:
Email: organizador1@eventhub.co
Password: organizador123

Asistente:
Email: usuario1@email.com
Password: usuario123
```

⚠️ **IMPORTANTE**: Estos usuarios son solo para desarrollo. NO usar en producción.

---

## 🌟 Características Destacadas

### 🎨 **Diseño Moderno con Glassmorphism**
- Efectos de vidrio esmerilado
- Gradientes vibrantes
- Animaciones fluidas
- Totalmente responsive

### 🔒 **Seguridad Robusta**
- Row Level Security (RLS) en Supabase
- Encriptación de contraseñas con Blowfish (BF)
- Protección de rutas por rol
- Validación en frontend y backend

#### 🔐 **Sistema de Encriptación de Contraseñas**

El proyecto implementa un sistema robusto de encriptación de contraseñas utilizando:

- **Algoritmo**: **Blowfish (BF)** con función `crypt()` de PostgreSQL
- **Salt único**: Cada contraseña tiene un salt aleatorio generado automáticamente
- **Función de encriptación**: `crypt(password, gen_salt('bf'))`
- **Verificación segura**: Comparación hash sin almacenar contraseñas en texto plano

**Características de seguridad:**
- ✅ **Resistente a ataques de fuerza bruta**
- ✅ **Previene ataques con tablas arcoíris**
- ✅ **Salt único por contraseña**
- ✅ **Algoritmo probado y seguro**
- ✅ **Implementación nativa de PostgreSQL**

**Archivos relacionados:**
- `database/solucion_completa_contraseñas.sql` - Script de configuración
- `src/core/stores/authStore.ts` - Lógica de autenticación
- `src/core/services/supabaseServiceEspanol.ts` - Servicios de usuario

### 📱 **Mobile First**
- Diseño responsive en todos los dispositivos
- Touch-friendly
- Optimizado para móviles

### ⚡ **Performance**
- Code splitting automático
- Lazy loading de componentes
- Optimización de imágenes
- Build optimizado con Vite

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Para contribuir:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 🐛 Reporte de Bugs

Si encuentras un bug, por favor abre un issue con:
- Descripción del bug
- Pasos para reproducir
- Comportamiento esperado
- Capturas de pantalla (si aplica)
- Entorno (navegador, SO, etc.)

---

## 📝 Roadmap

- [ ] Integración con proveedores de pago (Stripe, PayPal)
- [ ] App móvil con React Native
- [ ] Sistema de reviews y calificaciones
- [ ] Chat en tiempo real entre organizadores y asistentes
- [ ] Recomendaciones de eventos con IA
- [ ] Exportación de reportes a PDF/Excel
- [ ] Integración con redes sociales
- [ ] Sistema de referidos y afiliados

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más información.

---

## 🙏 Agradecimientos

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/)
- [Lucide Icons](https://lucide.dev/)

---

<div align="center">

**Hecho con ❤️ y ☕ por Deibyd Castillo, Andres Holguin y Edwin Morado**

⭐ Si te gusta este proyecto, considera darle una estrella

</div>

