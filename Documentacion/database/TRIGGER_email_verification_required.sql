-- =====================================================================
-- TRIGGER ACTUALIZADO: Inserción de usuarios SOLO después de verificación de email
-- =====================================================================
-- Este script actualiza el trigger para que NO cree usuarios automáticamente
-- al registrarse, sino que espere a que el email sea verificado.
-- =====================================================================

-- 1. Eliminar el trigger anterior si existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Eliminar la función anterior si existe
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Crear nueva función que SOLO se ejecuta cuando email_confirmed_at NO es NULL
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- IMPORTANTE: Solo ejecutar si el email está confirmado
  IF NEW.email_confirmed_at IS NULL THEN
    RAISE NOTICE 'Usuario % registrado pero email NO confirmado. NO se crea en tabla usuarios.', NEW.email;
    RETURN NEW;
  END IF;

  RAISE NOTICE 'Usuario % con email confirmado. Creando en tabla usuarios...', NEW.email;

  -- Extraer el rol desde los metadatos del usuario (si existe)
  user_role := COALESCE(
    NEW.raw_user_meta_data->>'rol',
    'asistente'
  );

  -- Mapear roles del frontend a roles de la base de datos
  IF user_role = 'admin' THEN
    user_role := 'administrador';
  ELSIF user_role = 'organizer' THEN
    user_role := 'organizador';
  ELSIF user_role = 'attendee' THEN
    user_role := 'asistente';
  END IF;

  -- Insertar el usuario en la tabla pública usuarios SOLO si no existe
  INSERT INTO public.usuarios (
    id,
    correo_electronico,
    nombre_completo,
    tipo_usuario,
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
    NEW.raw_user_meta_data->>'telefono',
    NEW.raw_user_meta_data->>'ubicacion',
    'activo',
    true -- Email confirmado
  )
  ON CONFLICT (id) DO UPDATE SET
    email_verified = true,
    estado = 'activo'
  ;

  RAISE NOTICE 'Usuario % creado en tabla usuarios con rol: %', NEW.email, user_role;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error en handle_new_user para usuario %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Crear trigger que se ejecuta SOLO cuando email_confirmed_at cambia de NULL a NOT NULL
-- Esto asegura que el usuario se cree en la tabla usuarios DESPUÉS de verificar el email
DROP TRIGGER IF EXISTS on_auth_user_email_verified ON auth.users;

CREATE TRIGGER on_auth_user_email_verified
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_new_user();

-- 5. También mantener el trigger de INSERT para usuarios que se registran con OAuth (Google, Facebook)
-- Estos usuarios tienen email_confirmed_at desde el inicio
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  WHEN (NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================================
-- NOTAS IMPORTANTES:
-- =====================================================================
-- 1. Ahora el flujo es:
--    a) Usuario se registra -> Se crea en auth.users con email_confirmed_at = NULL
--    b) Usuario verifica email -> email_confirmed_at se actualiza
--    c) Trigger detecta el cambio y crea el usuario en la tabla usuarios
--
-- 2. Para usuarios OAuth (Google, Facebook):
--    a) Se registran con email_confirmed_at ya poblado
--    b) El trigger on_auth_user_created los crea inmediatamente
--
-- 3. IMPORTANTE: Debes configurar Supabase para:
--    a) Requerir confirmación de email (Auth Settings -> Email Auth -> Enable Email Confirmations)
--    b) Configurar plantillas de email en Supabase Dashboard
--    c) Configurar redirect URLs en Supabase Dashboard (ej: http://localhost:5173/auth/callback)
-- =====================================================================

-- Verificar que el trigger se creó correctamente
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name IN ('on_auth_user_created', 'on_auth_user_email_verified');
