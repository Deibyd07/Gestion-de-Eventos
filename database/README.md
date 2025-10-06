# 🗄️ Scripts de Base de Datos - EventHub

Esta carpeta contiene todos los scripts SQL necesarios para configurar la base de datos de EventHub en Supabase (PostgreSQL).

---

## 📋 Archivos Disponibles

### 1. `schema.sql` ⭐ **OBLIGATORIO**

**Descripción**: Define la estructura completa de la base de datos.

**Contiene**:
- ✅ Tipos personalizados (ENUMs en español)
- ✅ Tablas principales con sus relaciones
- ✅ Índices para optimización de consultas
- ✅ Funciones SQL personalizadas
- ✅ Políticas RLS (Row Level Security)
- ✅ Triggers para auditoría

**Orden de ejecución**: **PRIMERO**

---

### 2. `solucion_completa_contraseñas.sql` 🔐

**Descripción**: Sistema completo de autenticación con contraseñas encriptadas.

**Contiene**:
- ✅ Función `verificar_contraseña()` - Validación de login
- ✅ Función `registrar_usuario()` - Registro de nuevos usuarios
- ✅ Función `actualizar_contraseña()` - Cambio de contraseña
- ✅ Encriptación con bcrypt (extensión pgcrypto)

**Orden de ejecución**: **SEGUNDO**

---

### 3. `datos_ejemplo.sql` 🎭 **OPCIONAL**

**Descripción**: Datos de ejemplo para desarrollo y testing.

**⚠️ IMPORTANTE**: 
- Solo para entorno de **DESARROLLO**
- **NO ejecutar en PRODUCCIÓN**
- Contraseñas de ejemplo: `admin123`, `maria123`, etc.

**Contiene**:
- 7 usuarios de prueba (1 admin, 3 organizadores, 3 asistentes)
- 5 eventos de ejemplo
- Tipos de entrada para cada evento
- Compras de ejemplo
- Notificaciones iniciales
- Analíticas de muestra

**Orden de ejecución**: **TERCERO** (opcional)

---

### 4. `add_nombre_evento_to_tipos_entrada.sql` 🆕 **NUEVO**

**Descripción**: Agrega la columna `nombre_evento` a la tabla `tipos_entrada` para consultas más eficientes.

**Contiene**:
- ✅ Nueva columna `nombre_evento` (TEXT)
- ✅ Índice para optimizar consultas
- ✅ Script de actualización para registros existentes
- ✅ Ejemplos de inserción con la nueva columna

**Orden de ejecución**: **CUARTO** (después de los datos de ejemplo)

---

### 5. `check_tipos_entrada_structure.sql` 🔍 **DIAGNÓSTICO**

**Descripción**: Script de diagnóstico para verificar la estructura actual de la tabla `tipos_entrada`.

**Contiene**:
- ✅ Consulta de columnas existentes
- ✅ Muestra registros de ejemplo
- ✅ Estructura completa de la tabla

**Cuándo usar**: Si tienes errores al ejecutar otros scripts, ejecuta este primero para entender la estructura actual.

---

### 6. `get_event_ids.sql` 🔍 **UTILIDAD**

**Descripción**: Script para obtener los IDs y nombres de eventos existentes.

**Contiene**:
- ✅ Lista de todos los eventos con sus IDs
- ✅ Eventos próximos únicamente
- ✅ Eventos con sus tipos de entrada existentes

**Cuándo usar**: Antes de insertar nuevos tipos de entrada, para obtener los UUIDs reales.

---

### 7. `add_free_events.sql` 🆓 **EVENTOS GRATUITOS**

**Descripción**: Agrega automáticamente entradas gratuitas a eventos que no las tengan.

**Contiene**:
- ✅ Identifica eventos sin entradas gratuitas
- ✅ Agrega entrada gratuita automáticamente
- ✅ Verifica que se agregaron correctamente

**Cuándo usar**: Para probar el filtro "Solo Gratis" en tu aplicación.

---

## 🚀 Guía de Instalación

### Paso 1: Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta (gratuita)
3. Crea un nuevo proyecto
4. Espera a que la base de datos esté lista (~2 minutos)

---

### Paso 2: Ejecutar Scripts SQL

#### Opción A: Desde la Interfaz Web de Supabase

1. **Abrir SQL Editor**:
   - En el panel de Supabase, ve a `SQL Editor`
   - Haz clic en `New query`

2. **Ejecutar `schema.sql`**:
   - Copia TODO el contenido de `schema.sql`
   - Pégalo en el editor
   - Haz clic en `Run` o presiona `Ctrl+Enter`
   - Espera a que termine (puede tomar ~30 segundos)

3. **Ejecutar `solucion_completa_contraseñas.sql`**:
   - En una nueva query, pega el contenido
   - Ejecuta el script
   - Verifica que no haya errores

4. **Ejecutar `datos_ejemplo.sql`** (opcional):
   - Solo si estás en desarrollo
   - Nueva query con el contenido
   - Ejecuta el script

5. **Ejecutar `add_nombre_evento_to_tipos_entrada.sql`**:
   - Nueva query con el contenido
   - Ejecuta el script para agregar la nueva columna

6. **Ejecutar `update_tipos_entrada_with_nombre_evento.sql`**:
   - Nueva query con el contenido
   - Ejecuta el script para actualizar registros existentes

---

### Paso 3: Verificar la Instalación

Ejecuta esta consulta para verificar que todo está correcto:

```sql
-- Verificar que las tablas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Deberías ver:
-- - analiticas_eventos
-- - analiticas_usuarios
-- - codigos_promocionales
-- - compras
-- - eventos
-- - notificaciones
-- - plantillas_email
-- - tipos_entrada
-- - usuarios
```

---

### Paso 4: Configurar Variables de Entorno

En tu proyecto React, crea un archivo `.env`:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_publica_aqui
```

Obtén estas credenciales de:
- Supabase Dashboard > Settings > API

---

## 📊 Estructura de la Base de Datos

### Tablas Principales

```
usuarios
├── id (UUID, PK)
├── correo_electronico (UNIQUE)
├── nombre_completo
├── rol (administrador | organizador | asistente)
└── contraseña (encriptada con bcrypt)

eventos
├── id (UUID, PK)
├── titulo
├── descripcion
├── fecha_evento
├── hora_evento
├── ubicacion
├── categoria
├── id_organizador (FK → usuarios)
└── estado (proximo | en_curso | completado | cancelado)

tipos_entrada
├── id (UUID, PK)
├── id_evento (FK → eventos)
├── nombre_tipo
├── precio
├── cantidad_disponible
└── nombre_evento (TEXT) - **NUEVO**: Nombre del evento para consultas más eficientes

compras
├── id (UUID, PK)
├── id_usuario (FK → usuarios)
├── id_evento (FK → eventos)
├── id_tipo_entrada (FK → tipos_entrada)
├── cantidad
├── total_pagado
├── codigo_qr
└── estado (pendiente | completada | cancelada | reembolsada)
```

---

## 🔒 Seguridad (RLS)

El esquema incluye políticas de Row Level Security (RLS):

### Usuarios
- ✅ Pueden leer solo su propia información
- ✅ Pueden actualizar solo su perfil
- ❌ No pueden cambiar su propio rol

### Eventos
- ✅ Lectura pública (todos pueden ver)
- ✅ Solo organizadores/admins pueden crear
- ✅ Solo el organizador/admin puede editar su evento
- ❌ Los asistentes no pueden crear eventos

### Compras
- ✅ Solo el usuario propietario puede ver sus compras
- ✅ Solo admins pueden ver todas las compras
- ✅ Los organizadores ven compras de sus eventos

### Analíticas
- ✅ Solo admins y organizadores del evento
- ❌ Los asistentes no tienen acceso

---

## 👥 Usuarios de Prueba

Si ejecutaste `datos_ejemplo.sql`, estos usuarios están disponibles:

### 🛡️ Administrador
```
Email: admin@eventhub.co
Password: admin123
Rol: administrador
```

### 🎭 Organizadores
```
Email: organizador@eventhub.co
Password: organizador123
Rol: organizador
```

### 🎫 Asistentes
```
Email: juan.perez@email.com
Password: juan123
Rol: asistente

Email: lucia.martinez@email.com
Password: lucia123
Rol: asistente

Email: pedro.rodriguez@email.com
Password: pedro123
Rol: asistente
```

⚠️ **RECORDATORIO**: Estos usuarios son SOLO para desarrollo. En producción, elimina estos datos y crea usuarios reales.

---

## 🔧 Troubleshooting

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

**Solución**: Los scripts usan `IF NOT EXISTS`, así que es seguro volver a ejecutarlos.

### Error: "permission denied"

**Causa**: No tienes permisos suficientes.

**Solución**: Asegúrate de estar usando el usuario `postgres` en Supabase.

---

## 🔄 Migraciones Futuras

Cuando necesites hacer cambios en el esquema:

1. **Crea un nuevo archivo de migración**:
   ```
   database/migrations/001_agregar_campo_x.sql
   ```

2. **Documenta el cambio**:
   ```sql
   -- Migración 001: Agregar campo 'telefono' a usuarios
   -- Fecha: 2025-10-XX
   -- Autor: Tu Nombre
   
   ALTER TABLE usuarios ADD COLUMN telefono TEXT;
   ```

3. **Prueba en desarrollo primero**

4. **Ejecuta en producción**

---

## 📚 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)
- [SQL Best Practices](https://www.postgresql.org/docs/current/sql.html)

---

## 💡 Mejores Prácticas

1. **Backups Regulares**
   - Configura backups automáticos en Supabase
   - Descarga backups antes de migraciones grandes

2. **Entornos Separados**
   - Desarrollo: Base de datos de prueba
   - Producción: Base de datos real
   - NUNCA uses datos de prueba en producción

3. **Versionado**
   - Mantén los scripts SQL en control de versiones (Git)
   - Documenta cada cambio importante

4. **Índices**
   - Los scripts ya incluyen índices importantes
   - Monitorea queries lentas y agrega índices si es necesario

5. **Seguridad**
   - SIEMPRE usa RLS en producción
   - NUNCA expongas credenciales de base de datos
   - Usa variables de entorno para secrets

---

## 📞 Soporte

¿Problemas con la base de datos?

1. Revisa los logs en Supabase Dashboard
2. Verifica que los scripts se ejecutaron en orden
3. Consulta la sección de Troubleshooting
4. Abre un issue en el repositorio

---

**Última actualización**: Octubre 2025  
**Versión del esquema**: 1.0

