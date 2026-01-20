# 🎯 Cuentas Demo - EventHub

## Descripción

Este documento describe las cuentas de demostración disponibles para que los visitantes puedan probar todas las funcionalidades del sistema EventHub sin necesidad de crear una cuenta nueva.

## 📋 Credenciales de Acceso

### 👨‍💼 Administrador
- **Email:** `admin@eventhub.com`
- **Contraseña:** `admin123`
- **Rol:** Administrador
- **Acceso:** Panel completo de administración con estadísticas, gestión de usuarios, eventos y configuración del sistema

### 🎪 Organizador
- **Email:** `organizador1@eventhub.com`
- **Contraseña:** `organizador123`
- **Rol:** Organizador
- **Acceso:** Dashboard de organizador con capacidad de crear eventos, gestionar tickets, ver estadísticas y escanear códigos QR

### 🎫 Asistente
- **Email:** `bayfrox@gmail.com`
- **Contraseña:** `usuario123`
- **Rol:** Asistente
- **Acceso:** Vista de usuario regular para explorar eventos, comprar entradas y gestionar perfil

## 🚀 Funcionalidades por Perfil

### Administrador
- ✅ Panel de control completo
- ✅ Gestión de usuarios (crear, editar, eliminar, cambiar roles)
- ✅ Estadísticas globales del sistema
- ✅ Gestión de eventos de todos los organizadores
- ✅ Configuración del sistema
- ✅ Visualización de métricas de negocio
- ✅ Acceso a todos los módulos

### Organizador
- ✅ Crear y gestionar eventos propios
- ✅ Configurar tipos de entrada (tickets)
- ✅ Crear promociones y descuentos
- ✅ Ver estadísticas de eventos
- ✅ Escanear códigos QR de asistentes
- ✅ Gestionar métodos de pago
- ✅ Ver listado de asistentes
- ✅ Dashboard con métricas de ventas

### Asistente
- ✅ Explorar catálogo de eventos
- ✅ Filtrar eventos por categoría, fecha, ubicación
- ✅ Ver detalles de eventos
- ✅ Comprar entradas
- ✅ Ver mis tickets
- ✅ Seguir organizadores favoritos
- ✅ Gestionar perfil
- ✅ Recibir recomendaciones personalizadas

## 📍 Ubicación en la Interfaz

Las credenciales de demostración se muestran en:

1. **Página de Inicio (Home):** Justo después de la sección hero, antes de las estadísticas
2. **Diseño Visual:** 
   - Tarjetas con gradientes de color según el rol
   - Icono representativo para cada perfil
   - Formato de credenciales fácil de copiar
   - Diseño responsive para móviles y desktop

## 🔧 Configuración en la Base de Datos

### Requisitos Previos
1. Acceso al panel de Supabase
2. Privilegios para crear usuarios en Auth

### Pasos de Configuración

#### 1. Crear Usuarios en Supabase Auth

Accede a tu proyecto en Supabase:
- Ve a **Authentication** > **Users**
- Haz clic en **"Add user"** > **"Create new user"**

Crea cada usuario con los siguientes datos:

**Usuario 1: Admin**
```
Email: admin@eventhub.com
Password: admin123
☑ Auto Confirm User (marcar esta opción)
```

**Usuario 2: Organizador**
```
Email: organizador1@eventhub.com
Password: organizador123
☑ Auto Confirm User (marcar esta opción)
```

**Usuario 3: Asistente**
```
Email: bayfrox@gmail.com
Password: usuario123
☑ Auto Confirm User (marcar esta opción)
```

#### 2. Sincronizar con la Tabla Usuarios

Ejecuta el script SQL ubicado en:
```
Documentacion/database/crear_usuarios_demo.sql
```

##### Opción A: Usando la Función Automática

```sql
-- Ejecutar desde el SQL Editor de Supabase
SELECT crear_usuarios_demo();
```

##### Opción B: Inserción Manual

Si prefieres insertar manualmente, copia el UUID de cada usuario desde el Dashboard de Auth y ejecuta:

```sql
-- Reemplaza 'UUID_AQUI' con el UUID real de cada usuario
INSERT INTO public.usuarios (
    id,
    correo_electronico, 
    nombre_completo, 
    rol,
    telefono,
    ubicacion
) VALUES (
    'UUID_AQUI'::uuid,
    'admin@eventhub.com',
    'Administrador Demo',
    'administrador',
    '+57 300 000 0001',
    'Bogotá, Colombia'
) ON CONFLICT (id) DO UPDATE SET
    nombre_completo = EXCLUDED.nombre_completo,
    rol = EXCLUDED.rol;

-- Repetir para organizador y asistente
```

#### 3. Verificar la Creación

Ejecuta esta consulta para verificar que los usuarios se crearon correctamente:

```sql
SELECT 
    id,
    correo_electronico,
    nombre_completo,
    rol,
    telefono,
    ubicacion,
    fecha_creacion
FROM public.usuarios
WHERE correo_electronico IN (
    'admin@eventhub.com', 
    'organizador1@eventhub.com', 
    'bayfrox@gmail.com'
)
ORDER BY rol;
```

## 🔒 Consideraciones de Seguridad

### Para Ambiente de Producción
- ✅ Usa contraseñas más seguras si decides mantener estas cuentas
- ✅ Monitorea el uso de estas cuentas
- ✅ Considera agregar un límite de tasa (rate limiting)
- ✅ Limita las acciones destructivas desde cuentas demo

### Para Ambiente de Desarrollo/Demo
- ✅ Las credenciales actuales son adecuadas
- ✅ Documenta claramente que son cuentas de demostración
- ✅ Limpia los datos periódicamente si es necesario

### Recomendaciones
1. **No uses estas cuentas en producción real** con datos sensibles
2. **Limita las capacidades** de estas cuentas si es necesario
3. **Monitorea el uso** para prevenir abusos
4. **Restablece datos** periódicamente si las cuentas se usan mucho

## 🎨 Personalización

### Cambiar Credenciales en la Interfaz

El componente de credenciales demo se encuentra en:
```
src/modules/events/presentation/pages/Home.page.tsx
```

Para modificar las credenciales mostradas, busca la sección:
```tsx
{/* Demo Credentials Section */}
<section className="py-8 sm:py-12 md:py-16 ...">
```

### Ocultar las Credenciales

Si deseas ocultar las credenciales demo temporalmente, simplemente comenta o elimina la sección en el archivo mencionado arriba.

## 📱 Experiencia de Usuario

### Flujo de Uso
1. Usuario visita la página de inicio
2. Ve las credenciales claramente presentadas
3. Copia el email y contraseña del perfil que desea probar
4. Hace clic en el botón de Auth (Google/Facebook) en el header
5. Selecciona "Sign in with Email"
6. Ingresa las credenciales demo
7. Es redirigido automáticamente según su rol:
   - Admin → `/admin`
   - Organizador → `/organizer/dashboard`
   - Asistente → `/events`

### Diseño Responsive
- ✅ Desktop: 3 columnas side-by-side
- ✅ Tablet: 2-3 columnas adaptables
- ✅ Móvil: 1 columna apilada verticalmente

## 🐛 Troubleshooting

### Problema: "Email no verificado"
**Solución:** Asegúrate de marcar "Auto Confirm User" al crear los usuarios en Supabase Auth.

### Problema: Usuario no encontrado en la BD
**Solución:** Ejecuta el script `crear_usuarios_demo.sql` para sincronizar.

### Problema: Contraseña incorrecta
**Solución:** Verifica que la contraseña sea exactamente como se muestra (con mayúsculas, números y signos).

### Problema: Usuario existe pero con rol incorrecto
**Solución:** Ejecuta la función `crear_usuarios_demo()` que actualiza el rol automáticamente.

## 📊 Métricas y Monitoreo

### Qué Monitorear
- Número de inicios de sesión con cuentas demo
- Acciones realizadas por cuentas demo
- Tiempo promedio de sesión
- Páginas más visitadas por cada rol

### Sugerencias
1. Implementa analytics para trackear el uso
2. Agrega un banner indicando que es una cuenta demo
3. Limita ciertas acciones (ej: envío de emails masivos)

## 🔄 Mantenimiento

### Limpieza Periódica
Si las cuentas demo acumulan mucha data:

```sql
-- Limpiar eventos del organizador demo
DELETE FROM eventos WHERE id_organizador = (
    SELECT id FROM usuarios WHERE correo_electronico = 'organizador1@eventhub.com'
);

-- Limpiar compras de la cuenta asistente demo
DELETE FROM compras WHERE id_usuario = (
    SELECT id FROM usuarios WHERE correo_electronico = 'bayfrox@gmail.com'
);
```

### Actualización de Contraseñas
Si necesitas cambiar las contraseñas, hazlo desde el Dashboard de Supabase Auth:
1. Ve a Authentication > Users
2. Busca el usuario
3. Haz clic en los tres puntos > "Reset password"
4. Actualiza también la documentación y la interfaz

---

## 📞 Soporte

Si tienes problemas con la configuración de las cuentas demo:
1. Revisa este documento completamente
2. Verifica que seguiste todos los pasos
3. Consulta los logs de Supabase
4. Revisa la consola del navegador para errores

---

**Fecha de última actualización:** Enero 2026  
**Versión:** 1.0.0
