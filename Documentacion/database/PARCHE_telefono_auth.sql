-- PARCHE: Actualizar trigger para guardar telefono en tabla usuarios
-- El telefono se guarda en raw_user_meta_data de auth.users
-- y este trigger lo copia a la tabla usuarios

-- Paso 1: Eliminar trigger y funcion existente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Paso 2: Crear funcion completa con soporte para telefono y rol
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_email TEXT := NEW.email;
  v_rol TEXT;
BEGIN
  -- Normalizar rol a minusculas
  v_rol := LOWER(COALESCE(NEW.raw_user_meta_data->>'rol', 'asistente'));
  
  -- Insertar o actualizar usando ON CONFLICT
  INSERT INTO public.usuarios (
    id,
    correo_electronico,
    nombre_completo,
    telefono,
    ubicacion,
    rol,
    fecha_creacion,
    fecha_actualizacion
  ) VALUES (
    NEW.id,
    v_email,
    COALESCE(NEW.raw_user_meta_data->>'nombre_completo', split_part(v_email, '@', 1)),
    COALESCE(NEW.phone, NEW.raw_user_meta_data->>'telefono'),
    COALESCE(NEW.raw_user_meta_data->>'ubicacion', 'Colombia'),
    v_rol::tipo_usuario,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    telefono = COALESCE(EXCLUDED.telefono, usuarios.telefono),
    ubicacion = COALESCE(EXCLUDED.ubicacion, usuarios.ubicacion),
    nombre_completo = COALESCE(EXCLUDED.nombre_completo, usuarios.nombre_completo),
    fecha_actualizacion = NOW();

  RETURN NEW;
END;
$function$;

-- Paso 3: Recrear trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
