-- =====================================================================
-- EJECUTAR ESTE SCRIPT AHORA EN SUPABASE SQL EDITOR
-- =====================================================================
-- Este script configura el trigger para crear usuarios SOLO después
-- de que verifiquen su email. Cópialo y pégalo en el SQL Editor de
-- Supabase Dashboard.
-- =====================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE t.tgname = 'on_auth_user_created'
      AND n.nspname = 'auth'
      AND c.relname = 'users'
  ) THEN
    DROP TRIGGER on_auth_user_created ON auth.users;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE t.tgname = 'on_auth_user_email_verified'
      AND n.nspname = 'auth'
      AND c.relname = 'users'
  ) THEN
    DROP TRIGGER on_auth_user_email_verified ON auth.users;
  END IF;
END $$;

-- 2. Eliminar la función anterior si existe
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2b. Tabla de depuración (guarda el último error si algo falla en el trigger)
CREATE TABLE IF NOT EXISTS public.handle_new_user_log (
  id uuid,
  email text,
  step text,
  error text,
  created_at timestamptz default now()
);

-- 2c. Asegurar columnas requeridas en public.usuarios
ALTER TABLE public.usuarios
  ADD COLUMN IF NOT EXISTS rol text,
  ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false;

-- 3. Función: crea/actualiza siempre la fila y marca verificación al confirmar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Asegurar search_path para evitar problemas de esquema
  PERFORM set_config('search_path', 'public, auth', true);

  -- Extraer rol
  user_role := COALESCE(NEW.raw_user_meta_data->>'rol', 'asistente');
  IF user_role = 'admin' THEN
    user_role := 'administrador';
  ELSIF user_role = 'organizer' THEN
    user_role := 'organizador';
  ELSIF user_role = 'attendee' THEN
    user_role := 'asistente';
  END IF;

  -- Insertar/actualizar siempre la fila; soporta esquemas con o sin columna tipo_usuario
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'usuarios'
      AND column_name = 'tipo_usuario'
      AND udt_name = 'tipo_usuario'
  ) THEN
    INSERT INTO public.usuarios (
      id,
      correo_electronico,
      nombre_completo,
      tipo_usuario,
      rol,
      telefono,
      ubicacion,
      estado,
      email_verified
    )
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'nombre_completo', 'Usuario'),
      user_role::public.tipo_usuario,
      user_role,
      NEW.raw_user_meta_data->>'telefono',
      NEW.raw_user_meta_data->>'ubicacion',
      CASE WHEN NEW.email_confirmed_at IS NULL THEN 'pendiente' ELSE 'activo' END,
      CASE WHEN NEW.email_confirmed_at IS NULL THEN false ELSE true END
    )
    ON CONFLICT (id) DO UPDATE SET
      correo_electronico = EXCLUDED.correo_electronico,
      nombre_completo   = EXCLUDED.nombre_completo,
      tipo_usuario      = EXCLUDED.tipo_usuario,
      rol               = EXCLUDED.rol,
      telefono          = EXCLUDED.telefono,
      ubicacion         = EXCLUDED.ubicacion,
      estado            = EXCLUDED.estado,
      email_verified    = EXCLUDED.email_verified;
  ELSE
    INSERT INTO public.usuarios (
      id,
      correo_electronico,
      nombre_completo,
      rol,
      telefono,
      ubicacion,
      estado,
      email_verified
    )
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'nombre_completo', 'Usuario'),
      user_role,
      NEW.raw_user_meta_data->>'telefono',
      NEW.raw_user_meta_data->>'ubicacion',
      CASE WHEN NEW.email_confirmed_at IS NULL THEN 'pendiente' ELSE 'activo' END,
      CASE WHEN NEW.email_confirmed_at IS NULL THEN false ELSE true END
    )
    ON CONFLICT (id) DO UPDATE SET
      correo_electronico = EXCLUDED.correo_electronico,
      nombre_completo   = EXCLUDED.nombre_completo,
      rol               = EXCLUDED.rol,
      telefono          = EXCLUDED.telefono,
      ubicacion         = EXCLUDED.ubicacion,
      estado            = EXCLUDED.estado,
      email_verified    = EXCLUDED.email_verified;
  END IF;

  RAISE NOTICE 'Usuario % upsert en usuarios. Verificado=%', NEW.email, (NEW.email_confirmed_at IS NOT NULL);

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error en handle_new_user para usuario %: %', NEW.email, SQLERRM;
    INSERT INTO public.handle_new_user_log(id, email, step, error)
    VALUES (NEW.id, NEW.email, 'handle_new_user', SQLERRM)
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      step = EXCLUDED.step,
      error = EXCLUDED.error,
      created_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger al confirmar email (update email_confirmed_at)
CREATE TRIGGER on_auth_user_email_verified
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_new_user();

-- 5. Trigger al crear usuario (signup u OAuth): siempre upsert, marca verificado solo si viene confirmado
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================================
-- VERIFICAR QUE SE CREÓ CORRECTAMENTE
-- =====================================================================
SELECT
  trigger_name,
  event_manipulation,
  event_object_schema,
  event_object_table,
  action_timing
FROM information_schema.triggers 
WHERE trigger_name IN ('on_auth_user_created', 'on_auth_user_email_verified')
ORDER BY trigger_name;

-- Deberías ver 2 filas en el resultado:
-- 1. on_auth_user_created (INSERT)
-- 2. on_auth_user_email_verified (UPDATE)
