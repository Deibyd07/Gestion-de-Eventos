# 🎫 EventHub - Plataforma Integral de Gestión de Eventos

<div align="center">

![EventHub](https://img.shields.io/badge/EventHub-v1.0-purple?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=for-the-badge&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-Latest-3ecf8e?style=for-the-badge&logo=supabase)

**Plataforma nacional para gestión completa de eventos en Colombia con autenticación, pagos y analíticas en tiempo real**

[Demo](#) · [Documentación](#-documentación) · [Reportar Bug](#) · [Solicitar Feature](#)

</div>

---

## 📋 Tabla de Contenido

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#️-configuración)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Scripts Disponibles](#-scripts-disponibles)
- [Documentación](#-documentación)
- [Roles de Usuario](#-roles-de-usuario)
- [Capturas de Pantalla](#-capturas-de-pantalla)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

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

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 o **yarn** >= 1.22.0
- **Git**
- Cuenta en **Supabase** (gratuita)

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/eventhub.git
cd eventhub
```

### 2. Instalar dependencias

```bash
npm install
# o
yarn install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

### 4. Configurar base de datos

Ejecuta los scripts SQL en orden en el SQL Editor de Supabase:

```bash
1. database/schema.sql
2. database/solucion_completa_contraseñas.sql
3. database/datos_ejemplo.sql (opcional - solo para desarrollo)
```

### 5. Iniciar el servidor de desarrollo

```bash
npm run dev
# o
yarn dev
```

La aplicación estará disponible en `http://localhost:5173`

---

## ⚙️ Configuración

### Configuración de Supabase

1. Crea un nuevo proyecto en [Supabase](https://supabase.com)
2. Obtén las credenciales del proyecto:
   - Project URL
   - Anon/Public Key
3. Ejecuta los scripts SQL de la carpeta `database/`
4. Configura las políticas RLS para seguridad

Ver documentación completa en: `database/README.md` (próximamente)

### Configuración de Pagos

Para habilitar pagos, configura tu proveedor de pagos preferido en:
- `src/core/services/paymentService.ts`

---

## 📁 Estructura del Proyecto

```
eventhub/
├── database/              # Scripts SQL
├── src/
│   ├── assets/           # Recursos estáticos
│   ├── core/             # Core de la aplicación
│   │   ├── services/     # Servicios (API, email, pagos, QR)
│   │   ├── stores/       # Estado global (Zustand)
│   │   └── supabase.ts   # Cliente de Supabase
│   ├── features/         # Features por dominio
│   │   ├── admin/        # Panel de administración
│   │   ├── analytics/    # Analíticas y reportes
│   │   ├── auth/         # Autenticación
│   │   ├── events/       # Gestión de eventos
│   │   ├── organizer/    # Dashboard de organizadores
│   │   └── users/        # Gestión de usuarios
│   ├── shared/           # Código compartido
│   │   ├── components/   # Componentes reutilizables
│   │   └── utils/        # Utilidades
│   ├── App.tsx           # Componente principal
│   ├── main.tsx          # Entry point
│   └── index.css         # Estilos globales
├── DESIGN_SYSTEM.md      # Sistema de diseño
├── ESTRUCTURA_PROYECTO.md # Documentación de estructura
└── package.json
```

Ver documentación detallada: [ESTRUCTURA_PROYECTO.md](./ESTRUCTURA_PROYECTO.md)

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

- **[Sistema de Diseño](./DESIGN_SYSTEM.md)** - Paleta de colores, componentes, tipografía
- **[Estructura del Proyecto](./ESTRUCTURA_PROYECTO.md)** - Organización de carpetas y archivos
- **[Configuración de Supabase](./SUPABASE_SETUP.md)** - Guía de configuración de la base de datos

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
Email: admin@eventhub.co
Password: admin123

Organizador:
Email: organizador@eventhub.co
Password: organizador123

Asistente:
Email: usuario@email.com
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
- Encriptación de contraseñas con bcrypt
- Protección de rutas por rol
- Validación en frontend y backend

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

**Hecho con ❤️ y ☕ por [Deibyd Castillo, Andres Holguin y Edwin Morado]**

⭐ Si te gusta este proyecto, considera darle una estrella

</div>

