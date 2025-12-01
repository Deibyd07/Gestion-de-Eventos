-- ============================================================================
-- Script: Agregar campo email_verified a tabla usuarios
-- Objetivo: Sincronizar estado de verificación de email desde auth.users
-- Autor: Sistema
-- Fecha: 2024
-- ============================================================================

-- ========== PASO 1: Agregar columna email_verified ==========
ALTER TABLE public.usuarios 
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- Comentario descriptivo
COMMENT ON COLUMN public.usuarios.email_verified IS 
  'Indica si el usuario ha verificado su correo electrónico. Sincronizado desde auth.users.email_confirmed_at';

-- ========== PASO 2: Sincronizar datos existentes ==========
-- Actualizar usuarios existentes basándose en auth.users
UPDATE public.usuarios u
SET email_verified = (au.email_confirmed_at IS NOT NULL)
FROM auth.users au
WHERE u.id = au.id
  AND u.email_verified != (au.email_confirmed_at IS NOT NULL);

-- ========== PASO 3: Actualizar función handle_new_user ==========
-- Reemplazar función existente para incluir email_verified

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_telefono TEXT;
  v_rol TEXT;
  v_email_verified BOOLEAN;
BEGIN
  -- Log para debugging (opcional, comentar en producción)
  RAISE NOTICE 'Trigger ejecutado para usuario: %', NEW.id;

  -- Obtener teléfono (prioridad: campo phone, luego metadata)
  v_telefono := COALESCE(
    NEW.phone,
    NEW.raw_user_meta_data->>'telefono'
  );

  -- Obtener rol desde metadata (default: 'asistente')
  v_rol := LOWER(COALESCE(
    NEW.raw_user_meta_data->>'rol',
    'asistente'
  ));

  -- Determinar si el email está verificado
  v_email_verified := (NEW.email_confirmed_at IS NOT NULL);

  -- Insertar en tabla usuarios con el mismo ID que auth.users
  INSERT INTO public.usuarios (
    id,
    nombre_completo,
    correo_electronico,
    telefono,
    ubicacion,
    rol,
    email_verified,
    fecha_creacion
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'nombre_completo',
    NEW.email,
    v_telefono,
    NEW.raw_user_meta_data->>'ubicacion',
    v_rol::tipo_usuario,
    v_email_verified,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    correo_electronico = EXCLUDED.correo_electronico,
    telefono = EXCLUDED.telefono,
    ubicacion = EXCLUDED.ubicacion,
    email_verified = EXCLUDED.email_verified;

  -- Log de éxito
  RAISE NOTICE 'Usuario % insertado/actualizado correctamente en tabla usuarios', NEW.id;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log de error
    RAISE WARNING 'Error en handle_new_user para %: %', NEW.id, SQLERRM;
    RETURN NEW; -- No fallar el registro en auth.users
END;
$$;

-- ========== PASO 4: Recrear trigger ==========
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ========== PASO 5: Crear trigger para actualizar email_verified ==========
-- Este trigger se ejecuta cuando el usuario confirma su email

DROP FUNCTION IF EXISTS public.sync_email_verified() CASCADE;

CREATE OR REPLACE FUNCTION public.sync_email_verified()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Solo actualizar si email_confirmed_at cambió de NULL a NOT NULL
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    
    UPDATE public.usuarios
    SET email_verified = true
    WHERE id = NEW.id;
    
    RAISE NOTICE 'Email verificado actualizado para usuario: %', NEW.id;
  END IF;

  -- Si se remueve la verificación (edge case)
  IF OLD.email_confirmed_at IS NOT NULL AND NEW.email_confirmed_at IS NULL THEN
    
    UPDATE public.usuarios
    SET email_verified = false
    WHERE id = NEW.id;
    
    RAISE NOTICE 'Email verificado removido para usuario: %', NEW.id;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error en sync_email_verified para %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Crear trigger para UPDATE en auth.users
DROP TRIGGER IF EXISTS on_auth_user_email_verified ON auth.users;

CREATE TRIGGER on_auth_user_email_verified
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS DISTINCT FROM NEW.email_confirmed_at)
  EXECUTE FUNCTION public.sync_email_verified();

-- ========== PASO 6: Verificación ==========
-- Consulta para verificar sincronización
SELECT 
  u.id,
  u.nombre_completo,
  u.correo_electronico,
  u.email_verified as "email_verified (usuarios)",
  (au.email_confirmed_at IS NOT NULL) as "email_verified (auth)",
  au.email_confirmed_at,
  CASE 
    WHEN u.email_verified = (au.email_confirmed_at IS NOT NULL) THEN '✓ Sincronizado'
    ELSE '✗ Desincronizado'
  END as estado_sincronizacion
FROM public.usuarios u
INNER JOIN auth.users au ON u.id = au.id
ORDER BY u.fecha_creacion DESC
LIMIT 10;

-- ========== COMENTARIOS ==========
/*
RESUMEN DE CAMBIOS:
1. Agregada columna email_verified (BOOLEAN) a tabla usuarios
2. Sincronizados datos existentes desde auth.users.email_confirmed_at
3. Actualizada función handle_new_user() para incluir email_verified
4. Recreado trigger on_auth_user_created con nueva función
5. Creada función sync_email_verified() para sincronización automática
6. Creado trigger on_auth_user_email_verified para UPDATE en auth.users

FLUJO DE SINCRONIZACIÓN:
- Registro: handle_new_user() crea fila con email_verified = false
- Verificación: Usuario confirma email desde correo
- Actualización: auth.users.email_confirmed_at se actualiza
- Trigger: on_auth_user_email_verified detecta cambio
- Sincronización: sync_email_verified() actualiza usuarios.email_verified = true

VENTAJAS:
- Estado disponible en tabla usuarios (sin JOIN con auth.users)
- Sincronización automática en tiempo real
- Manejo de edge cases (remover verificación)
- Logging para debugging
- No falla registro si hay errores (EXCEPTION handler)

TESTING:
1. Registrar usuario nuevo → verificar email_verified = false
2. Confirmar email → verificar email_verified = true
3. Ejecutar consulta de verificación (PASO 6)
4. Revisar logs con RAISE NOTICE/WARNING

ROLLBACK (si necesario):
ALTER TABLE public.usuarios DROP COLUMN IF EXISTS email_verified;
DROP TRIGGER IF EXISTS on_auth_user_email_verified ON auth.users;
DROP FUNCTION IF EXISTS public.sync_email_verified();
*/
