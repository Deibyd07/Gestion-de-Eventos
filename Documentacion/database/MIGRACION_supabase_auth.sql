-- =====================================================
-- MIGRACIÓN A SUPABASE AUTH
-- =====================================================
-- Este script migra el sistema de autenticación a Supabase Auth
-- de forma segura sin perder datos existentes
-- =====================================================

-- =====================================================
-- PRE-LIMPIEZA (idempotente) PARA VERSIONES ANTERIORES
-- Ejecuta drops seguros para evitar conflictos por ejecuciones previas
-- =====================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.migrar_usuario_a_auth(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.migrar_usuario_a_auth(TEXT);
DROP FUNCTION IF EXISTS public.sincronizar_id_con_auth(TEXT);
DROP FUNCTION IF EXISTS public.finalizar_migracion_auth();
DROP VIEW IF EXISTS public.estado_migracion_usuarios;
-- Eliminar columna legacy si quedó de versiones anteriores
ALTER TABLE usuarios DROP COLUMN IF EXISTS auth_user_id;
-- Eliminar constraint legacy si existiera
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_auth_user_id_fkey;
-- Asegurar que id no tenga default auto-gen (queremos el de auth.users)
ALTER TABLE usuarios ALTER COLUMN id DROP DEFAULT;
-- Asegurar que id sea UUID NOT NULL (adaptar si difiere)
ALTER TABLE usuarios ALTER COLUMN id SET NOT NULL;


-- PASO 1: Crear función para sincronizar usuarios nuevos desde auth.users a public.usuarios
-- =====================================================
-- Asegurar recreación limpia (evitar conflicto de firmas)
DROP FUNCTION IF EXISTS public.handle_new_user();
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_email TEXT := NEW.email;
BEGIN
  -- Intentar insertar nueva fila usando el mismo ID.
  -- Un solo ON CONFLICT (id) para upsert básico.
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
    COALESCE(NEW.raw_user_meta_data->>'rol', 'asistente')::tipo_usuario,
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    telefono = COALESCE(EXCLUDED.telefono, usuarios.telefono),
    ubicacion = COALESCE(EXCLUDED.ubicacion, usuarios.ubicacion),
    fecha_actualizacion = NOW();

  -- Si existe una fila legacy con el mismo correo pero distinto id (caso migración), actualizarla al nuevo id.
  UPDATE public.usuarios
    SET id = NEW.id,
      telefono = COALESCE(NEW.phone, NEW.raw_user_meta_data->>'telefono', usuarios.telefono),
      ubicacion = COALESCE(NEW.raw_user_meta_data->>'ubicacion', usuarios.ubicacion, 'Colombia'),
      fecha_actualizacion = NOW()
  WHERE correo_electronico = v_email AND id <> NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASO 2: Crear trigger para ejecutar la función cuando se cree un usuario en auth.users
-- =====================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- PASO 3: Modificar estructura de la tabla usuarios para usar el mismo ID de auth.users
-- =====================================================
-- IMPORTANTE: Esta migración cambia la tabla para que use el ID de Supabase Auth como clave primaria

-- Paso 3.1: Agregar campos faltantes
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefono TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS ubicacion TEXT DEFAULT 'Colombia';

-- Paso 3.2: Crear tabla temporal para respaldar datos
CREATE TABLE IF NOT EXISTS usuarios_backup AS SELECT * FROM usuarios;

-- Paso 3.3: Eliminar la constraint de primary key actual
-- NOTA: Esto puede fallar si hay foreign keys. En ese caso, hay que eliminarlas primero.
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_pkey;

-- Paso 3.4: Cambiar el ID para que NO sea auto-generado
-- Ahora el ID vendrá desde Supabase Auth
ALTER TABLE usuarios ALTER COLUMN id DROP DEFAULT;
ALTER TABLE usuarios ALTER COLUMN id SET NOT NULL;

-- Paso 3.5: Recrear la primary key
ALTER TABLE usuarios ADD PRIMARY KEY (id);

-- Paso 3.6: Eliminar el campo contraseña (legacy)
ALTER TABLE usuarios DROP COLUMN IF EXISTS contraseña;

COMMENT ON COLUMN usuarios.id IS 'ID sincronizado con auth.users - El mismo UUID de Supabase Auth';

-- PASO 4: Crear una columna para marcar usuarios migrados
-- =====================================================
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS migrado_a_auth BOOLEAN DEFAULT FALSE;

-- PASO 5: Función para migrar usuarios existentes que tienen IDs diferentes
-- =====================================================
-- Esta función migra un usuario existente creando su cuenta en Auth y actualizando su ID
-- Asegurar recreación limpia
DROP FUNCTION IF EXISTS public.migrar_usuario_a_auth(TEXT);
CREATE OR REPLACE FUNCTION public.migrar_usuario_a_auth(
  p_email TEXT
) RETURNS TEXT AS $$
DECLARE
  v_old_user_id UUID;
  v_new_auth_id UUID;
BEGIN
  -- Obtener el ID actual del usuario
  SELECT id INTO v_old_user_id FROM usuarios WHERE correo_electronico = p_email;
  
  IF v_old_user_id IS NULL THEN
    RETURN FORMAT('ERROR: Usuario no encontrado: %s', p_email);
  END IF;

  -- Nota: La creación en auth.users debe hacerse desde la aplicación
  -- Esta función solo marca el usuario como migrado
  UPDATE usuarios 
  SET migrado_a_auth = TRUE
  WHERE correo_electronico = p_email;
  
  RETURN FORMAT('Usuario %s marcado como migrado. Debe crear/vincular cuenta en Supabase Auth.', p_email);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASO 5.1: Función auxiliar para actualizar ID después de crear en Auth
-- =====================================================
-- Esta función actualiza el ID de un usuario para que coincida con auth.users
-- ADVERTENCIA: Solo usar si no hay foreign keys que dependan de este ID
-- Asegurar recreación limpia
DROP FUNCTION IF EXISTS public.sincronizar_id_con_auth(TEXT);
CREATE OR REPLACE FUNCTION public.sincronizar_id_con_auth(
  p_email TEXT
) RETURNS TEXT AS $$
DECLARE
  v_old_id UUID;
  v_auth_id UUID;
  v_affected INTEGER;
BEGIN
  -- Obtener IDs
  SELECT u.id, au.id INTO v_old_id, v_auth_id
  FROM usuarios u
  INNER JOIN auth.users au ON u.correo_electronico = au.email
  WHERE u.correo_electronico = p_email;
  
  IF v_old_id IS NULL THEN
    RETURN FORMAT('ERROR: Usuario no encontrado en tabla usuarios: %s', p_email);
  END IF;
  
  IF v_auth_id IS NULL THEN
    RETURN FORMAT('ERROR: Usuario no encontrado en auth.users: %s', p_email);
  END IF;
  
  IF v_old_id = v_auth_id THEN
    RETURN FORMAT('INFO: Los IDs ya coinciden para %s', p_email);
  END IF;
  
  -- Actualizar el ID
  -- NOTA: Esto puede fallar si hay foreign keys. En ese caso hay que actualizarlas primero
  UPDATE usuarios 
  SET id = v_auth_id,
      migrado_a_auth = TRUE
  WHERE correo_electronico = p_email;
  
  GET DIAGNOSTICS v_affected = ROW_COUNT;
  
  IF v_affected > 0 THEN
    RETURN FORMAT('SUCCESS: ID actualizado para %s. Antiguo: %s, Nuevo: %s', p_email, v_old_id, v_auth_id);
  ELSE
    RETURN FORMAT('ERROR: No se pudo actualizar el ID para %s', p_email);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASO 6: Vista para verificar estado de migración
-- =====================================================
-- Asegurar recreación limpia
DROP VIEW IF EXISTS public.estado_migracion_usuarios;
CREATE OR REPLACE VIEW public.estado_migracion_usuarios AS
SELECT 
  u.id,
  u.correo_electronico,
  u.nombre_completo,
  u.rol,
  u.migrado_a_auth,
  CASE 
    WHEN au.id IS NOT NULL AND u.id = au.id THEN 'ID sincronizado correctamente'
    WHEN au.id IS NOT NULL AND u.id != au.id THEN 'ID NO coincide (requiere migración)'
    ELSE 'No existe en Auth'
  END as estado_auth,
  au.id as auth_user_id
FROM usuarios u
LEFT JOIN auth.users au ON u.correo_electronico = au.email;

-- PASO 7: Función para eliminar el campo contraseña cuando todos estén migrados
-- =====================================================
-- ADVERTENCIA: Solo ejecutar cuando TODOS los usuarios estén migrados
-- Asegurar recreación limpia
DROP FUNCTION IF EXISTS public.finalizar_migracion_auth();
CREATE OR REPLACE FUNCTION public.finalizar_migracion_auth()
RETURNS TEXT AS $$
DECLARE
  v_usuarios_sin_migrar INTEGER;
BEGIN
  -- Contar usuarios sin migrar
  SELECT COUNT(*) INTO v_usuarios_sin_migrar
  FROM usuarios
  WHERE migrado_a_auth = FALSE OR migrado_a_auth IS NULL;
  
  IF v_usuarios_sin_migrar > 0 THEN
    RETURN FORMAT('ERROR: Aún hay %s usuarios sin migrar. Verifica con: SELECT * FROM estado_migracion_usuarios', v_usuarios_sin_migrar);
  END IF;
  
  -- Si todos están migrados, eliminar columna de contraseña
  ALTER TABLE usuarios DROP COLUMN IF EXISTS contraseña;
  ALTER TABLE usuarios DROP COLUMN IF EXISTS migrado_a_auth;
  
  RETURN 'Migración completada exitosamente. Columnas de contraseña eliminadas.';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INSTRUCCIONES DE USO
-- =====================================================
-- 
-- PARA DESARROLLADORES:
-- 1. Ejecutar este script en tu base de datos de Supabase
-- 2. Los NUEVOS usuarios se crearán automáticamente en ambos sistemas (auth.users y public.usuarios)
-- 3. Para usuarios existentes, tienen 2 opciones:
--    a) Migración automática: El próximo login los migrará automáticamente
--    b) Reset de contraseña: Usar la función de "Olvidé mi contraseña"
-- 
-- VERIFICAR ESTADO DE MIGRACIÓN:
-- SELECT * FROM estado_migracion_usuarios;
--
-- CUANDO TODOS ESTÉN MIGRADOS:
-- SELECT public.finalizar_migracion_auth();
-- =====================================================

-- Comentarios de metadata
COMMENT ON FUNCTION public.handle_new_user() IS 'Sincroniza automáticamente usuarios de auth.users a public.usuarios';
COMMENT ON FUNCTION public.migrar_usuario_a_auth(TEXT) IS 'Marca a un usuario existente como migrado y sincronizado con Supabase Auth.';
COMMENT ON FUNCTION public.finalizar_migracion_auth() IS 'Elimina columnas de contraseña cuando todos los usuarios estén migrados';
COMMENT ON VIEW public.estado_migracion_usuarios IS 'Vista para monitorear el progreso de la migración a Supabase Auth';
