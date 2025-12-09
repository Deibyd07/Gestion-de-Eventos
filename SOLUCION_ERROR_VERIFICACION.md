# 🚨 SOLUCIÓN INMEDIATA - Error de Verificación de Email

## El Problema

Estás recibiendo estos errores:
- ❌ **409 Conflict** - Error al verificar email
- ❌ **"Cannot coerce result to single JSON object"** - Usuario no existe en tabla `usuarios`
- ❌ **406 Not Acceptable** - La consulta no encuentra el usuario

**Causa raíz**: El trigger de la base de datos NO se ha ejecutado todavía, por lo que los usuarios no se crean en la tabla `usuarios` después de verificar el email.

## ✅ Solución en 3 Pasos

### PASO 1: Ejecutar el Trigger en Supabase (URGENTE)

1. Ve a tu **Supabase Dashboard**: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **SQL Editor** (en el menú lateral izquierdo)
4. Abre el archivo: `Documentacion/database/EJECUTAR_AHORA_trigger_email_verification.sql`
5. **Copia TODO el contenido** del archivo
6. **Pégalo en el SQL Editor** de Supabase
7. Haz clic en **RUN** (o presiona Ctrl/Cmd + Enter)
8. Verifica que veas un mensaje de éxito y la tabla de verificación al final con 2 filas

### PASO 2: Limpiar Usuarios de Prueba

Si ya intentaste registrarte varias veces, necesitas limpiar los usuarios de prueba:

```sql
-- Ejecuta esto en el SQL Editor de Supabase

-- 1. Ver usuarios en Auth que no están en la tabla usuarios
SELECT 
  au.id,
  au.email,
  au.email_confirmed_at,
  u.id as usuarios_id
FROM auth.users au
LEFT JOIN public.usuarios u ON au.id = u.id
WHERE u.id IS NULL;

-- 2. SOLO SI VES USUARIOS EN EL RESULTADO ANTERIOR, elimínalos:
-- REEMPLAZA 'tu-email@gmail.com' con tu correo de prueba
DELETE FROM auth.users 
WHERE email = 'dealcag0723@gmail.com' 
  AND id NOT IN (SELECT id FROM public.usuarios);
```

### PASO 3: Probar el Flujo Completo

1. **Registra un nuevo usuario**:
   - Ve a tu aplicación
   - Crea una cuenta nueva con un email DIFERENTE al que usaste antes
   - Deberías ver "Revisa tu correo" y ser redirigido a `/auth/verify-email`

2. **En la sala de espera** (`/auth/verify-email`):
   - Verás "Verifica tu correo electrónico"
   - Ve a tu bandeja de entrada
   - Abre el email de Supabase
   - Haz clic en "Confirmar tu correo"

3. **Dos flujos posibles**:

   **Opción A - Abrir link en la misma ventana (Recomendado)**:
   - El link abrirá `/auth/callback` en la misma pestaña
   - Verás "Verificando correo..." (1-2 segundos)
   - Luego "¡Email verificado exitosamente!"
   - Redirige automáticamente al dashboard

   **Opción B - Abrir link en nueva pestaña**:
   - El link abrirá `/auth/callback` en una pestaña nueva
   - Esa pestaña verá "¡Email verificado exitosamente!" y redirigirá
   - La pestaña original (sala de espera) detectará automáticamente la verificación
   - En 3-6 segundos, la sala de espera detectará que ya estás verificado
   - Redirigirá automáticamente al dashboard

4. **Resultado esperado**:
   - Deberías estar logueado automáticamente
   - Redirigido a `/events` (o `/organizer/dashboard` si eres organizador)
   - Ver tu perfil en la esquina superior derecha

## 🔍 Verificar que Todo Funciona

Después de verificar el email, ejecuta esto en Supabase SQL Editor:

```sql
-- Ver que el usuario se creó correctamente
SELECT 
  u.id,
  u.correo_electronico,
  u.nombre_completo,
  u.tipo_usuario,
  u.email_verified,
  u.estado,
  au.email_confirmed_at
FROM public.usuarios u
JOIN auth.users au ON u.id = au.id
WHERE u.correo_electronico = 'tu-nuevo-email@gmail.com';
```

Deberías ver:
- ✅ `email_verified = true`
- ✅ `estado = 'activo'`
- ✅ `email_confirmed_at` tiene una fecha

## 🛡️ Mejoras Implementadas

He mejorado el código para que funcione correctamente:

### AuthCallback.page.tsx
1. ✅ **Espera 1.5 segundos** para que el trigger se ejecute
2. ✅ **Reintentar** si el trigger está tardando
3. ✅ **Crear el usuario manualmente** si el trigger falla por alguna razón
4. ✅ **Manejar errores de duplicados** apropiadamente
5. ✅ **Mostrar errores claros** en la URL de Supabase
6. ✅ **Barra de progreso visual** (0-100%) para feedback en tiempo real
7. ✅ **Mensajes descriptivos** de cada paso del proceso
8. ✅ **Timeout de seguridad** (15 segundos) para evitar pantalla en blanco
9. ✅ **Logs detallados** en consola para debugging
10. ✅ **UI siempre visible** - Nunca pantalla en blanco

### EmailVerificationPending.page.tsx (Sala de Espera)
1. ✅ **Detecta automáticamente** cuando el email es verificado
2. ✅ **Verifica sesión de Auth** primero antes de consultar la BD
3. ✅ **Espera al trigger** dando tiempo para que cree el usuario
4. ✅ **Reintenta 3 veces** si el usuario no aparece inmediatamente
5. ✅ **Redirige automáticamente** al dashboard correcto según el rol
6. ✅ **Maneja casos edge** como verificación desde otro dispositivo
7. ✅ **Usa `maybeSingle()`** para evitar errores 406 cuando el usuario no existe

## 📝 Notas Importantes

- El trigger ahora funciona **SOLO cuando email_confirmed_at cambia de NULL a NOT NULL**
- Usuarios de OAuth (Google, Facebook) se crean inmediatamente porque ya vienen verificados
- El AuthCallback ahora es más robusto y maneja casos edge

## ❓ Si Aún Tienes Problemas

Si después de ejecutar el trigger sigues teniendo problemas:

1. Verifica que el trigger existe:
```sql
SELECT * FROM information_schema.triggers 
WHERE trigger_name IN ('on_auth_user_created', 'on_auth_user_email_verified');
```

2. Verifica los logs del trigger en Supabase Dashboard > Database > Logs

3. Asegúrate de que la tabla `usuarios` tiene la columna `email_verified`:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
  AND table_schema = 'public';
```

4. Si falta la columna `email_verified`, agrégala:
```sql
ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
```

## 🎯 Resumen

**LO MÁS IMPORTANTE**: Ejecuta el SQL del archivo `EJECUTAR_AHORA_trigger_email_verification.sql` en Supabase AHORA mismo.

Sin ese trigger, los usuarios NO se crearán automáticamente después de verificar el email.
