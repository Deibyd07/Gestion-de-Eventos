# Configuración de Supabase para Verificación de Email Obligatoria

## 📋 Resumen
Este documento detalla los pasos necesarios para configurar Supabase correctamente para que requiera verificación de email antes de permitir el acceso al sistema.

---

## 🔧 Configuración en Supabase Dashboard

### 1. Habilitar Confirmación de Email

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **Authentication** → **Providers**
3. Busca la sección **Email**
4. **IMPORTANTE**: Asegúrate de que estas opciones estén configuradas:
   - ✅ **Enable Email Provider**: ON
   - ✅ **Confirm email**: **DEBE ESTAR ACTIVADO** (esto es crítico)
   - ✅ **Secure email change**: ON (recomendado)
   - ✅ **Email OTP**: OFF (usamos link de confirmación, no OTP)

### 2. Configurar URLs de Redirección

1. En el mismo panel de **Authentication**
2. Ve a **URL Configuration**
3. Agrega las siguientes URLs en **Redirect URLs**:

   **Para desarrollo local:**
   ```
   http://localhost:5173/auth/callback
   http://localhost:5173/auth/verify-email
   ```

   **Para producción:**
   ```
   https://tudominio.com/auth/callback
   https://tudominio.com/auth/verify-email
   ```

4. En **Site URL**, configura:
   - Desarrollo: `http://localhost:5173`
   - Producción: `https://tudominio.com`

### 3. Configurar Plantillas de Email

1. Ve a **Authentication** → **Email Templates**
2. Selecciona **Confirm signup**
3. Personaliza la plantilla (opcional) o deja la predeterminada
4. **IMPORTANTE**: Asegúrate de que el botón o link incluya: `{{ .ConfirmationURL }}`

Ejemplo de plantilla básica:
```html
<h2>Confirma tu correo electrónico</h2>
<p>Hola,</p>
<p>Gracias por registrarte. Por favor, confirma tu correo electrónico haciendo clic en el siguiente enlace:</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar email</a></p>
<p>Si no solicitaste este registro, puedes ignorar este correo.</p>
```

### 4. Verificar Configuración de Rate Limits

1. Ve a **Authentication** → **Rate Limits**
2. Asegúrate de que los límites sean razonables:
   - **Email signups**: 10-20 por hora por IP
   - **Email OTP**: No aplica (lo tenemos desactivado)
   - **Password signins**: 10-20 por hora por IP

---

## 🗄️ Configuración de Base de Datos

### 1. Ejecutar el Trigger Actualizado

Ejecuta el script SQL en el editor de SQL de Supabase:

```bash
Documentacion/database/TRIGGER_email_verification_required.sql
```

Este trigger asegura que:
- ✅ Los usuarios NO se crean en la tabla `usuarios` hasta que verifiquen su email
- ✅ Cuando verifican el email, el trigger detecta el cambio y crea el registro
- ✅ Los usuarios OAuth (Google, Facebook) se crean inmediatamente

### 2. Verificar que el Trigger se Creó Correctamente

Ejecuta esta consulta en el SQL Editor:

```sql
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name IN ('on_auth_user_created', 'on_auth_user_email_verified');
```

Deberías ver 2 triggers:
1. `on_auth_user_email_verified` - Se dispara cuando email_confirmed_at cambia
2. `on_auth_user_created` - Se dispara para usuarios OAuth

---

## 🔍 Verificación del Flujo

### Flujo Correcto de Registro:

1. **Usuario se registra** (`/register` o modal de login)
   - ✅ Se crea en `auth.users` con `email_confirmed_at = NULL`
   - ✅ Se envía email de confirmación automáticamente
   - ✅ Usuario es redirigido a `/auth/verify-email`
   - ❌ NO se crea en tabla `usuarios` todavía
   - ❌ NO puede iniciar sesión

2. **Usuario hace clic en el link del email**
   - ✅ Supabase actualiza `email_confirmed_at` con timestamp
   - ✅ El trigger detecta el cambio
   - ✅ Se crea el usuario en la tabla `usuarios`
   - ✅ Usuario es redirigido a `/auth/callback`

3. **Callback procesa la verificación**
   - ✅ Obtiene la sesión de Supabase
   - ✅ Verifica que el usuario existe en `usuarios`
   - ✅ Actualiza el store con la información del usuario
   - ✅ Redirige según el rol (organizer → dashboard, attendee → events)

4. **Usuario puede iniciar sesión normalmente**
   - ✅ Ya está en `auth.users` con email verificado
   - ✅ Ya está en tabla `usuarios`
   - ✅ Puede usar email + password para entrar

---

## 🧪 Cómo Probar

### Prueba en Desarrollo Local:

1. **Inicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

2. **Registra un nuevo usuario:**
   - Ve a http://localhost:5173
   - Haz clic en "Crear cuenta"
   - Completa el formulario
   - Envía el registro

3. **Verifica que se redirige a sala de espera:**
   - Deberías ver `/auth/verify-email?email=...`
   - La página debe decir "Verifica tu correo"

4. **Verifica el email:**
   - Ve a tu cliente de email
   - O consulta Supabase Dashboard → Authentication → Users
   - Haz clic en "Send confirmation email" si no llegó
   - O copia el confirmation_url de los logs

5. **Haz clic en el link de verificación:**
   - Deberías ser redirigido a `/auth/callback`
   - Luego a `/events` (o dashboard según rol)

6. **Verifica en Supabase Dashboard:**
   - **Authentication → Users**: Debe mostrar email confirmado (✓)
   - **Table Editor → usuarios**: Debe existir el registro con email_verified = true

---

## 🚨 Troubleshooting

### Problema: "El usuario ya está registrado" pero no puede iniciar sesión

**Causa**: Usuario creado en `auth.users` pero no en tabla `usuarios` por falta de verificación.

**Solución**:
1. Ve a Supabase Dashboard → Authentication → Users
2. Busca el usuario por email
3. Si `email_confirmed_at` es NULL:
   - Click en "..." → Send confirmation email
   - O elimina el usuario y pide que se registre de nuevo

### Problema: Email de confirmación no llega

**Soluciones**:
1. Verifica que "Confirm email" esté activado en Auth Settings
2. Revisa la carpeta de spam
3. Ve a Supabase Dashboard → Authentication → Users → Click en "..." → Send confirmation email
4. Verifica que el dominio de email no esté bloqueado
5. Para desarrollo, usa un servicio como [Mailtrap](https://mailtrap.io/) o revisa los logs de Supabase

### Problema: "No se pudo crear el usuario" después de verificar

**Causa**: Error en el trigger o permisos.

**Solución**:
1. Verifica que el trigger se ejecutó correctamente (ver arriba)
2. Revisa los logs en Supabase Dashboard → Logs → Postgres Logs
3. Ejecuta manualmente:
   ```sql
   SELECT public.handle_new_user()
   FROM auth.users 
   WHERE email = 'email@ejemplo.com';
   ```

### Problema: Usuario se autentica sin verificar email

**Causa**: "Confirm email" está desactivado en Supabase.

**Solución**:
1. Ve a Authentication → Providers → Email
2. Activa **Confirm email**
3. Elimina usuarios de prueba
4. Vuelve a probar

---

## 📝 Variables de Entorno

Asegúrate de tener configuradas estas variables:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

---

## ✅ Checklist de Configuración Completa

- [ ] "Confirm email" activado en Supabase Auth
- [ ] URLs de redirección configuradas (localhost y producción)
- [ ] Plantilla de email de confirmación configurada
- [ ] Trigger `on_auth_user_email_verified` creado
- [ ] Trigger `on_auth_user_created` creado
- [ ] Variables de entorno configuradas
- [ ] Probado flujo completo en desarrollo
- [ ] Verificado que usuario NO se crea en `usuarios` antes de confirmar
- [ ] Verificado que usuario SÍ se crea en `usuarios` después de confirmar
- [ ] Probado login después de verificación

---

## 📞 Soporte

Si tienes problemas, verifica:
1. Logs de Supabase: Dashboard → Logs
2. Console del navegador: F12 → Console
3. Network tab: F12 → Network → Filter by "supabase"
4. Estado de la sesión: `supabase.auth.getSession()`

---

**Última actualización**: Diciembre 9, 2025
