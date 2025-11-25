# 🔄 Cambios Necesarios para Usar el Mismo ID

## 📝 Resumen

Estos cambios permiten que la tabla `usuarios` use el **mismo UUID** que Supabase Auth, eliminando la necesidad de un campo separado `auth_user_id`.

## 🗄️ Cambios en Base de Datos

### ✅ Ya ejecutado
El script `MIGRACION_supabase_auth.sql` ya está actualizado y listo para ejecutar.

**Ejecuta estos comandos en Supabase SQL Editor:**

```sql
-- Ver el script completo en:
-- Documentacion/database/MIGRACION_supabase_auth.sql
```

## 💻 Cambios en Código

### Archivo 1: `Auth.store.ts`

**Ubicación:** `src/modules/authentication/infrastructure/store/Auth.store.ts`

**Buscar:**
```typescript
const newUserData = await ServicioUsuarios.crearUsuario({
  correo_electronico: userData.email,
  nombre_completo: userData.name,
  rol: dbRole as any,
  auth_user_id: authData.user.id, // Vincular con Supabase Auth
  // Campos opcionales...
```

**Reemplazar con:**
```typescript
const newUserData = await ServicioUsuarios.crearUsuario({
  id: authData.user.id, // USAR EL MISMO ID de auth.users
  correo_electronico: userData.email,
  nombre_completo: userData.name,
  rol: dbRole as any,
  // Campos opcionales...
```

---

### Archivo 2: `User.service.ts` - obtenerUsuarioActual()

**Ubicación:** `src/shared/lib/api/services/User.service.ts`

**Buscar:**
```typescript
static async obtenerUsuarioActual() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Buscar por auth_user_id en lugar de id
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('auth_user_id', user.id)
    .single();

  if (error) throw error;
  return data;
}
```

**Reemplazar con:**
```typescript
static async obtenerUsuarioActual() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Ahora usamos el mismo ID en ambas tablas
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return data;
}
```

---

### Archivo 3: `User.service.ts` - registrarse()

**Ubicación:** `src/shared/lib/api/services/User.service.ts`

**Buscar:**
```typescript
await this.crearUsuario({
  correo_electronico: email,
  nombre_completo: datosUsuario.nombre,
  rol: datosUsuario.rol as any || 'asistente',
  auth_user_id: data.user.id, // Vincular con auth.users
  ...(datosUsuario.telefono && { telefono: datosUsuario.telefono } as any),
  ...(datosUsuario.ubicacion && { ubicacion: datosUsuario.ubicacion } as any)
} as any);
```

**Reemplazar con:**
```typescript
await this.crearUsuario({
  id: data.user.id, // USAR EL MISMO ID de auth.users
  correo_electronico: email,
  nombre_completo: datosUsuario.nombre,
  rol: datosUsuario.rol as any || 'asistente',
  ...(datosUsuario.telefono && { telefono: datosUsuario.telefono } as any),
  ...(datosUsuario.ubicacion && { ubicacion: datosUsuario.ubicacion } as any)
} as any);
```

---

## ✅ Checklist de Migración

### Paso 1: Base de Datos
- [ ] Ejecutar script completo `MIGRACION_supabase_auth.sql` en Supabase

### Paso 2: Código
- [ ] Actualizar `Auth.store.ts` (cambio en línea ~38)
- [ ] Actualizar `User.service.ts` - `obtenerUsuarioActual()` (cambio en línea ~11)
- [ ] Actualizar `User.service.ts` - `registrarse()` (cambio en línea ~148)

### Paso 3: Testing
- [ ] Crear un nuevo usuario de prueba
- [ ] Verificar que el ID sea el mismo en ambas tablas:
```sql
SELECT 
  u.id as id_usuarios,
  au.id as id_auth,
  u.correo_electronico,
  CASE WHEN u.id = au.id THEN '✅ IDs coinciden' ELSE '❌ IDs NO coinciden' END as estado
FROM usuarios u
INNER JOIN auth.users au ON u.correo_electronico = au.email;
```

### Paso 4: Verificación
- [ ] Iniciar sesión funciona correctamente
- [ ] El teléfono se guarda en la base de datos
- [ ] La ubicación se guarda correctamente
- [ ] El campo `contraseña` está NULL (vacío)
- [ ] El usuario aparece en `auth.users` con contraseña encriptada

## 🐛 Troubleshooting

### Error: "duplicate key value violates unique constraint"

**Causa:** Ya existe un usuario con ese ID

**Solución:** El trigger ya creó el usuario automáticamente. Esto es normal.

### Error: "contraseña is required"

**Causa:** No ejecutaste el script SQL que hace el campo nullable

**Solución:** Ejecuta el Paso 3 del script: `ALTER TABLE usuarios ALTER COLUMN contraseña DROP NOT NULL;`

### Error: "auth_user_id does not exist"

**Causa:** Aún estás usando el código viejo

**Solución:** Verifica que hayas actualizado los 3 archivos mencionados arriba

## 📊 Verificar que Todo Funciona

Después de hacer los cambios, ejecuta esto en Supabase:

```sql
-- Ver estado de todos los usuarios
SELECT * FROM estado_migracion_usuarios;

-- Debería mostrar "ID sincronizado correctamente" para nuevos usuarios
```

## 🎯 Resultado Final

Tabla `usuarios` después de la migración:

```sql
CREATE TABLE usuarios (
    id UUID PRIMARY KEY,  -- ✅ Mismo ID que auth.users (sin DEFAULT)
    correo_electronico TEXT UNIQUE NOT NULL,
    nombre_completo TEXT NOT NULL,
    telefono TEXT,  -- ✅ Nuevo campo
    ubicacion TEXT DEFAULT 'Colombia',  -- ✅ Nuevo campo
    rol tipo_usuario NOT NULL DEFAULT 'asistente',
    url_avatar TEXT,
    preferencias JSONB DEFAULT '{}',
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW(),
    contraseña TEXT  -- ✅ Ahora es nullable (y debe estar siempre NULL)
);
```

**Beneficios:**
- ✅ Un solo ID para ambos sistemas
- ✅ Más fácil de mantener
- ✅ Joins más simples
- ✅ No hay confusión entre IDs
