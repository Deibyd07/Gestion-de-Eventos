-- DEBUG: Trigger minimalista para identificar el problema exacto
-- Ejecutar este script para diagnosticar

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Version ultra-simple sin rol (para diagnostico)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Log para ver que se ejecuta
  RAISE NOTICE 'Trigger ejecutado para email: %', NEW.email;
  
  -- Insertar SIN el campo rol temporalmente
  INSERT INTO public.usuarios (
    id,
    correo_electronico,
    nombre_completo,
    telefono,
    ubicacion,
    fecha_creacion,
    fecha_actualizacion
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre_completo', 'Usuario'),
    COALESCE(NEW.phone, NEW.raw_user_meta_data->>'telefono'),
    COALESCE(NEW.raw_user_meta_data->>'ubicacion', 'Colombia'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    telefono = COALESCE(EXCLUDED.telefono, usuarios.telefono),
    ubicacion = COALESCE(EXCLUDED.ubicacion, usuarios.ubicacion),
    fecha_actualizacion = NOW();

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'ERROR en trigger: email=% SQLSTATE=% SQLERRM=%', NEW.email, SQLSTATE, SQLERRM;
    RAISE;
END;
$function$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- INSTRUCCIONES:
-- 1. Ejecuta este script
-- 2. Ve a Dashboard -> Database -> Logs
-- 3. Intenta crear usuario
-- 4. Copia el mensaje WARNING completo que aparezca en logs
-- 5. Si funciona (no hay error), el problema es el campo 'rol' o el enum tipo_usuario
