# ⚙️ Configuración de Supabase - EventHub

Esta guía te llevará paso a paso en la configuración de Supabase para tu proyecto EventHub.

---

## 📋 Tabla de Contenido

1. [Crear Cuenta en Supabase](#1-crear-cuenta-en-supabase)
2. [Crear Proyecto](#2-crear-proyecto)
3. [Obtener Credenciales](#3-obtener-credenciales)
4. [Configurar Variables de Entorno](#4-configurar-variables-de-entorno)
5. [Ejecutar Scripts SQL](#5-ejecutar-scripts-sql)
6. [Verificar la Instalación](#6-verificar-la-instalación)
7. [Configurar Row Level Security](#7-configurar-row-level-security)
8. [Datos de Prueba](#8-datos-de-prueba-opcional)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Crear Cuenta en Supabase

### Paso 1: Registrarse

1. Ve a [supabase.com](https://supabase.com)
2. Haz clic en "Start your project"
3. Regístrate con:
   - GitHub (recomendado)
   - Google
   - Email y contraseña

### Paso 2: Verificar Email

Si te registraste con email, verifica tu correo electrónico.

---

## 2. Crear Proyecto

### Paso 1: Nuevo Proyecto

1. En el dashboard de Supabase, haz clic en **"New Project"**
2. Selecciona tu organización (o crea una nueva)

### Paso 2: Configurar Proyecto

Completa los siguientes campos:

```
Name: EventHub
Database Password: [genera una contraseña segura]
Region: [selecciona la más cercana a ti]
  - South America (São Paulo) - para Latinoamérica
  - East US (North Virginia) - para Norteamérica
  - Europe (Frankfurt) - para Europa
Pricing Plan: Free (suficiente para desarrollo)
```

**⚠️ IMPORTANTE**: 
- Guarda la contraseña de la base de datos en un lugar seguro
- La contraseña NO se puede recuperar después

### Paso 3: Esperar Inicialización

El proyecto tardará ~2 minutos en estar listo. Verás una barra de progreso.

---

## 3. Obtener Credenciales

### Paso 1: Ir a Settings

1. En el sidebar izquierdo, haz clic en ⚙️ **Settings**
2. Luego en **API**

### Paso 2: Copiar Credenciales

Necesitarás estas dos credenciales:

#### a) Project URL
```
URL: https://tu-proyecto.supabase.co
```

#### b) API Keys - anon/public
```
Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ IMPORTANTE**: 
- La `anon key` es segura para usar en el frontend
- NUNCA expongas la `service_role key` en el frontend

---

## 4. Configurar Variables de Entorno

### Paso 1: Crear archivo .env

En la raíz de tu proyecto, crea un archivo `.env`:

```bash
# En la terminal
touch .env

# O en Windows
echo. > .env
```

### Paso 2: Agregar Credenciales

Abre `.env` y agrega:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Reemplaza** con tus credenciales reales.

### Paso 3: Verificar .gitignore

Asegúrate de que `.env` esté en `.gitignore`:

```bash
# Verificar
cat .gitignore | grep .env

# Debería aparecer:
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

---

## 5. Ejecutar Scripts SQL

### Opción A: Desde la Interfaz Web (Recomendado)

#### Paso 1: Abrir SQL Editor

1. En Supabase Dashboard, haz clic en 🗂️ **SQL Editor** en el sidebar
2. Haz clic en **"New query"**

#### Paso 2: Ejecutar `schema.sql` ⭐ **PRIMERO**

1. Abre `database/schema.sql` en tu editor de código
2. Copia TODO el contenido (Ctrl+A, Ctrl+C)
3. Pégalo en el SQL Editor de Supabase
4. Haz clic en ▶️ **"Run"** o presiona `Ctrl+Enter`
5. Espera a que termine (~30 segundos)
6. Verifica que diga "Success"

#### Paso 3: Ejecutar `solucion_completa_contraseñas.sql` 🔐 **SEGUNDO**

1. Crea una **nueva query** en el SQL Editor
2. Abre `database/solucion_completa_contraseñas.sql`
3. Copia todo el contenido
4. Pégalo en el SQL Editor
5. Haz clic en ▶️ **"Run"**
6. Verifica que diga "Success"

#### Paso 4: Ejecutar `datos_ejemplo.sql` 🎭 **TERCERO (Opcional)**

**⚠️ Solo para desarrollo**

1. Crea una **nueva query**
2. Abre `database/datos_ejemplo.sql`
3. Copia todo el contenido
4. Pégalo en el SQL Editor
5. Haz clic en ▶️ **"Run"**
6. Verifica que diga "Success"

---

### Opción B: Desde la Terminal

Si prefieres usar la terminal:

```bash
# 1. Instalar psql (si no lo tienes)
# En Ubuntu/Debian:
sudo apt-get install postgresql-client

# En macOS:
brew install postgresql

# En Windows:
# Descargar desde https://www.postgresql.org/download/windows/

# 2. Conectar a tu base de datos
psql "postgresql://postgres:[TU-PASSWORD]@[TU-HOST]:5432/postgres"

# 3. Ejecutar scripts en orden
\i database/schema.sql
\i database/solucion_completa_contraseñas.sql
\i database/datos_ejemplo.sql
```

---

## 6. Verificar la Instalación

### Verificar Tablas Creadas

En el SQL Editor, ejecuta:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Deberías ver estas tablas**:
- ✅ analiticas_eventos
- ✅ analiticas_usuarios
- ✅ codigos_promocionales
- ✅ compras
- ✅ eventos
- ✅ notificaciones
- ✅ plantillas_email
- ✅ tipos_entrada
- ✅ usuarios

### Verificar Funciones

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;
```

**Deberías ver**:
- ✅ verificar_contraseña
- ✅ registrar_usuario
- ✅ actualizar_contraseña

### Verificar Datos de Prueba (si los cargaste)

```sql
SELECT COUNT(*) as total_usuarios FROM usuarios;
SELECT COUNT(*) as total_eventos FROM eventos;
```

**Deberías ver**:
- 7 usuarios
- 5 eventos

---

## 7. Configurar Row Level Security

Las políticas RLS ya están incluidas en `schema.sql`, pero verifica que estén activas:

### Ver Políticas

1. En Supabase Dashboard, ve a **Authentication** > **Policies**
2. Deberías ver políticas para cada tabla

### Políticas Importantes

#### Usuarios
- ✅ Los usuarios pueden ver solo su propia información
- ✅ Los usuarios pueden actualizar solo su perfil
- ❌ No pueden cambiar su rol

#### Eventos
- ✅ Lectura pública (todos pueden ver)
- ✅ Solo organizadores/admins pueden crear
- ✅ Solo el creador puede editar

#### Compras
- ✅ Solo el usuario propietario puede ver sus compras
- ✅ Solo admins pueden ver todas las compras

---

## 8. Datos de Prueba (Opcional)

Si ejecutaste `datos_ejemplo.sql`, tienes estos usuarios de prueba:

### 🛡️ Administrador
```
Email: admin@eventhub.co
Password: admin123
```

### 🎭 Organizadores
```
organizador@eventhub.co / organizador123
```

### 🎫 Asistentes
```
usuario@email.com / usuario123
```

**⚠️ IMPORTANTE**: 
- Estos usuarios son **SOLO para desarrollo**
- **ELIMINAR en producción**

---

## 9. Troubleshooting

### Error: "extension uuid-ossp does not exist"

**Solución**:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Error: "extension pgcrypto does not exist"

**Solución**:
```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

### Error: "type already exists"

**Causa**: El script ya se ejecutó antes.

**Solución**: Los scripts usan `IF NOT EXISTS`, es seguro volver a ejecutar.

### Error: "permission denied"

**Causa**: No tienes permisos suficientes.

**Solución**: 
- Asegúrate de estar usando el SQL Editor de Supabase
- Verifica que estés en el proyecto correcto

### No puedo ver las tablas en Table Editor

**Solución**:
1. Ve a **Table Editor** en el sidebar
2. Actualiza la página (F5)
3. Verifica que ejecutaste todos los scripts

### Las credenciales no funcionan

**Solución**:
1. Verifica que copiaste las credenciales correctas
2. No debe haber espacios extra al inicio o final
3. La URL debe incluir `https://`
4. La anon key debe empezar con `eyJ`

### Error de CORS

**Solución**:
1. Ve a Settings > API
2. En "API Settings" verifica que tu dominio esté permitido
3. Por defecto, `localhost` ya está permitido

---

## 🎉 ¡Configuración Completa!

Si llegaste hasta aquí y todo funcionó, ¡felicidades! 🎊

### Próximos Pasos

1. **Iniciar la aplicación**:
   ```bash
   npm run dev
   ```

2. **Probar login**:
   - Ve a `http://localhost:5173`
   - Usa uno de los usuarios de prueba
   - Verifica que puedas ver eventos

3. **Verificar funcionalidad**:
   - ✅ Login funciona
   - ✅ Puedes ver eventos
   - ✅ Puedes crear eventos (como organizador)
   - ✅ Puedes comprar entradas
   - ✅ El dashboard de admin funciona

---

## 📚 Recursos Adicionales

- **[Documentación de Supabase](https://supabase.com/docs)**
- **[API Reference](https://supabase.com/docs/reference/javascript/introduction)**
- **[Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)**
- **[PostgreSQL Docs](https://www.postgresql.org/docs/)**

### Documentación del Proyecto

- **[README.md](./README.md)** - Guía principal del proyecto
- **[database/README.md](./database/README.md)** - Detalles de los scripts SQL
- **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** - Sistema de diseño
- **[ESTRUCTURA_PROYECTO.md](./ESTRUCTURA_PROYECTO.md)** - Arquitectura del código

---

## 💡 Tips y Mejores Prácticas

### Desarrollo

1. **Usa diferentes proyectos de Supabase para desarrollo y producción**
2. **Nunca commits las credenciales** (.env en .gitignore)
3. **Haz backups** antes de modificar el esquema
4. **Prueba los scripts SQL** en desarrollo primero

### Producción

1. **Elimina datos de prueba** antes de deployment
2. **Configura backups automáticos** en Supabase
3. **Monitorea el uso** en el dashboard de Supabase
4. **Usa diferentes credenciales** para producción

### Seguridad

1. **Mantén RLS habilitado** siempre
2. **No expongas la service_role key** en el frontend
3. **Valida datos** en frontend y backend
4. **Usa contraseñas seguras** para usuarios reales

---

## 🆘 ¿Necesitas Ayuda?

Si tienes problemas:

1. **Revisa esta guía completa**
2. **Consulta [database/README.md](./database/README.md)**
3. **Busca en la [documentación de Supabase](https://supabase.com/docs)**
4. **Abre un issue** en el repositorio

---

<div align="center">

**¡Supabase configurado exitosamente! 🚀**

[⬅️ Volver al README](./README.md) | [Ver Scripts SQL ➡️](./database/README.md)

</div>

