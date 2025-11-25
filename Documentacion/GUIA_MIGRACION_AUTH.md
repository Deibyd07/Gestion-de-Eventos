# 🔐 Guía de Migración a Supabase Auth

## 📋 Resumen

Esta guía explica cómo migrar el sistema de autenticación de EventHub de contraseñas en texto plano a Supabase Auth de forma segura y sin interrumpir el servicio.

## ⚠️ Problema Actual

**Sistema Actual:**
- ❌ Contraseñas guardadas en texto plano en la tabla `usuarios`
- ❌ Campo `contraseña` requerido en la tabla
- ❌ Alto riesgo de seguridad si hay breach en la BD
- ❌ No cumple con estándares de seguridad modernos

**Sistema Mejorado:**
- ✅ Contraseñas encriptadas por Supabase Auth (bcrypt)
- ✅ Sin contraseñas en la tabla `usuarios`
- ✅ Autenticación OAuth lista para usar (Google, Facebook, etc.)
- ✅ Manejo automático de tokens y sesiones
- ✅ Reset de contraseña por email integrado

## 🔄 Estrategia de Migración

La migración es **no destructiva** y permite que ambos sistemas coexistan temporalmente:

```
┌─────────────────┐
│  Fase 1: Setup  │  ← Agregar campos y triggers
└────────┬────────┘
         │
┌────────▼────────────┐
│  Fase 2: Coexist    │  ← Nuevos usuarios usan Auth
└────────┬────────────┘  ← Viejos usuarios migran gradualmente
         │
┌────────▼─────────┐
│  Fase 3: Cleanup │  ← Eliminar campo contraseña
└──────────────────┘
```

## 📝 Pasos de Implementación

### Paso 1: Ejecutar Script SQL en Supabase

1. Abre el **SQL Editor** en tu dashboard de Supabase
2. Copia todo el contenido de `MIGRACION_supabase_auth.sql`
3. Ejecuta el script

**Qué hace este script:**
- ✅ Agrega campos `telefono` y `ubicacion` a la tabla `usuarios`
- ✅ Hace el campo `contraseña` opcional (nullable)
- ✅ Crea un trigger que sincroniza `auth.users` → `public.usuarios`
- ✅ Crea funciones para monitorear el progreso de la migración

### Paso 2: Verificar que el Código esté Actualizado

Los siguientes archivos ya están actualizados en esta rama:

- ✅ `Auth.store.ts` - Usa Supabase Auth para registro
- ✅ `User.service.ts` - Guarda teléfono y ubicación
- ✅ `LoginRequiredModal.guard.tsx` - Captura todos los campos

### Paso 3: Probar el Registro de Nuevos Usuarios

1. Inicia la aplicación
2. Intenta registrar un nuevo usuario con:
   - Nombre completo
   - Email
   - Contraseña
   - Teléfono (opcional)
   - Ubicación (opcional)

3. Verifica en Supabase:
   ```sql
   -- Ver el usuario en auth.users
   SELECT id, email, created_at FROM auth.users WHERE email = 'test@example.com';
   
   -- Ver el usuario en public.usuarios
   SELECT * FROM usuarios WHERE correo_electronico = 'test@example.com';
   ```

**Resultado esperado:**
- Usuario aparece en `auth.users` con contraseña encriptada
- Usuario aparece en `usuarios` con todos los campos (incluido teléfono)
- Campo `contraseña` en `usuarios` está NULL (vacío)

### Paso 4: Migración de Usuarios Existentes

Para usuarios que ya tienen cuenta con contraseña en texto plano:

**Opción A: Login Automático (Recomendado)**

Los usuarios existentes pueden simplemente hacer login normalmente:
1. Ingresa email y contraseña
2. El sistema valida contra Supabase Auth
3. Si no existe en Auth, se crea automáticamente

**Opción B: Reset de Contraseña**

Envía un email masivo pidiendo a los usuarios que:
1. Hagan clic en "Olvidé mi contraseña"
2. Creen una nueva contraseña segura
3. Esto los migra automáticamente a Supabase Auth

### Paso 5: Monitorear Progreso

Usa esta query para ver cuántos usuarios faltan por migrar:

```sql
-- Ver estado de migración
SELECT * FROM estado_migracion_usuarios;

-- Resumen
SELECT 
  estado_auth,
  COUNT(*) as cantidad
FROM estado_migracion_usuarios
GROUP BY estado_auth;
```

### Paso 6: Limpieza Final

**⚠️ SOLO cuando todos los usuarios estén migrados:**

```sql
-- Verificar que todos estén migrados
SELECT * FROM estado_migracion_usuarios 
WHERE estado_auth = 'No existe en Auth';

-- Si el resultado es 0 filas, ejecutar:
SELECT public.finalizar_migracion_auth();
```

Esto elimina la columna `contraseña` de la tabla `usuarios`.

## 🧪 Testing

### Test 1: Registro de Nuevo Usuario

```javascript
// Desde la consola del navegador
await register({
  name: 'Test User',
  email: 'test@example.com',
  password: 'SecurePass123!',
  phone: '+57 300 123 4567',
  location: 'Bogotá',
  role: 'attendee'
});
```

**Verificar:**
- ✅ Usuario creado en `auth.users`
- ✅ Usuario creado en `usuarios` con teléfono
- ✅ Campo `contraseña` es NULL

### Test 2: Login

```javascript
await login('test@example.com', 'SecurePass123!');
```

**Verificar:**
- ✅ Login exitoso
- ✅ Token generado
- ✅ Sesión activa

### Test 3: Datos Completos

```javascript
const user = await UserService.obtenerUsuarioPorEmail('test@example.com');
console.log(user);
```

**Verificar:**
- ✅ Tiene `nombre_completo`
- ✅ Tiene `telefono`
- ✅ Tiene `ubicacion`
- ✅ NO tiene `contraseña`

## 🔒 Seguridad

### Antes de la Migración
```
Usuario en BD:
{
  "correo_electronico": "user@example.com",
  "contraseña": "micontraseña123"  ← ❌ TEXTO PLANO
}
```

### Después de la Migración
```
auth.users (Supabase Auth):
{
  "email": "user@example.com",
  "encrypted_password": "$2a$10$..." ← ✅ BCRYPT HASH
}

usuarios (Tu tabla):
{
  "correo_electronico": "user@example.com",
  "telefono": "+57 300 123 4567",
  "ubicacion": "Bogotá"
  // Sin campo contraseña
}
```

## 🚨 Troubleshooting

### Problema: "User already registered"

**Causa:** El trigger ya creó el usuario en `usuarios`

**Solución:** Normal, el código maneja esto automáticamente

### Problema: "contraseña is required"

**Causa:** No ejecutaste el script SQL que hace el campo nullable

**Solución:** Ejecuta `MIGRACION_supabase_auth.sql` en Supabase

### Problema: "telefono does not exist"

**Causa:** TypeScript no reconoce el nuevo campo

**Solución:** Ya está corregido con `as any` cast

### Problema: Usuarios viejos no pueden login

**Causa:** No están migrados a Supabase Auth

**Solución:** 
1. Opción A: Usar "Olvidé mi contraseña"
2. Opción B: Migrar manualmente con `migrar_usuario_a_auth()`

## 📊 Checklist de Migración

Antes de deploy a producción:

- [ ] Script SQL ejecutado en Supabase
- [ ] Trigger `on_auth_user_created` activo
- [ ] Código actualizado en `Auth.store.ts`
- [ ] Código actualizado en `User.service.ts`
- [ ] Tests de registro pasando
- [ ] Tests de login pasando
- [ ] Campo `telefono` guardándose correctamente
- [ ] Campo `ubicacion` guardándose correctamente
- [ ] Contraseñas NO guardándose en `usuarios`
- [ ] Usuarios en `auth.users` tienen contraseña encriptada

## 🎯 Resultado Final

Después de completar la migración:

```sql
-- Tabla usuarios (sin contraseñas)
CREATE TABLE usuarios (
    id UUID PRIMARY KEY,
    correo_electronico TEXT UNIQUE NOT NULL,
    nombre_completo TEXT NOT NULL,
    telefono TEXT,
    ubicacion TEXT DEFAULT 'Colombia',
    rol tipo_usuario NOT NULL DEFAULT 'asistente',
    url_avatar TEXT,
    preferencias JSONB DEFAULT '{}',
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
    -- NO más campo contraseña ✅
);
```

**Beneficios alcanzados:**
- ✅ Seguridad mejorada (contraseñas encriptadas)
- ✅ Campos adicionales (teléfono, ubicación)
- ✅ OAuth ready (Google, Facebook)
- ✅ Reset de contraseña por email
- ✅ Cumplimiento con mejores prácticas
- ✅ Sin cambios breaking para usuarios

## 📚 Referencias

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)
- [Database Triggers](https://supabase.com/docs/guides/database/postgres/triggers)
