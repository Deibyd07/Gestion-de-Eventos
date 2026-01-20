-- ============================================
-- Script para crear usuarios de demostración
-- ============================================
-- Este script crea usuarios demo para que los visitantes puedan probar la aplicación
-- Las contraseñas son: Admin123!, Orga123!, Asist123!
-- IMPORTANTE: Estos usuarios deben crearse primero en Supabase Auth y luego ejecutar este script

-- Nota: Primero debes crear estos usuarios en Supabase Auth Dashboard o usando el código siguiente:
-- 1. Ve a Authentication > Users en Supabase Dashboard
-- 2. Crea los siguientes usuarios manualmente:
--    - admin@eventhub.com (password: admin123)
--    - organizador1@eventhub.com (password: organizador123)
--    - bayfrox@gmail.com (password: usuario123)
-- 3. Confirma su email manualmente desde el dashboard
-- 4. Copia sus UUIDs y reemplázalos en este script

-- Una vez creados en Auth, ejecuta lo siguiente para sincronizar con la tabla usuarios:

-- ============================================
-- OPCIÓN 1: Inserción manual (reemplazar UUIDs)
-- ============================================

-- Insertar usuario Administrador
-- IMPORTANTE: Reemplaza 'UUID_DEL_ADMIN_DESDE_AUTH' con el UUID real de Supabase Auth
/*
INSERT INTO public.usuarios (
    id,
    correo_electronico, 
    nombre_completo, 
    rol,
    telefono,
    ubicacion,
    fecha_creacion
) VALUES (
    'UUID_DEL_ADMIN_DESDE_AUTH'::uuid, -- Reemplazar con el UUID real
    'admin@eventhub.com',
    'Administrador Demo',
    'administrador',
    '+57 300 000 0001',
    'Bogotá, Colombia',
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    nombre_completo = EXCLUDED.nombre_completo,
    rol = EXCLUDED.rol;
*/

-- Insertar usuario Organizador
-- IMPORTANTE: Reemplaza 'UUID_DEL_ORGANIZADOR_DESDE_AUTH' con el UUID real de Supabase Auth
/*
INSERT INTO public.usuarios (
    id,
    correo_electronico, 
    nombre_completo, 
    rol,
    telefono,
    ubicacion,
    fecha_creacion
) VALUES (
    'UUID_DEL_ORGANIZADOR_DESDE_AUTH'::uuid, -- Reemplazar con el UUID real
    'organizador1@eventhub.com',
    'Organizador Demo',
    'organizador',
    '+57 300 000 0002',
    'Medellín, Colombia',
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    nombre_completo = EXCLUDED.nombre_completo,
    rol = EXCLUDED.rol;
*/

-- Insertar usuario Asistente
-- IMPORTANTE: Reemplaza 'UUID_DEL_ASISTENTE_DESDE_AUTH' con el UUID real de Supabase Auth
/*
INSERT INTO public.usuarios (
    id,
    correo_electronico, 
    nombre_completo, 
    rol,
    telefono,
    ubicacion,
    fecha_creacion
) VALUES (
    'UUID_DEL_ASISTENTE_DESDE_AUTH'::uuid, -- Reemplazar con el UUID real
    'bayfrox@gmail.com',
    'Asistente Demo',
    'asistente',
    '+57 300 000 0003',
    'Cali, Colombia',
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    nombre_completo = EXCLUDED.nombre_completo,
    rol = EXCLUDED.rol;
*/

-- ============================================
-- OPCIÓN 2: Función para crear usuarios demo automáticamente
-- ============================================

-- Esta función crea los usuarios demo en Supabase Auth y en la tabla usuarios
-- NOTA: Requiere privilegios de service_role

CREATE OR REPLACE FUNCTION crear_usuarios_demo()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_id UUID;
    organizador_id UUID;
    asistente_id UUID;
    resultado TEXT := '';
BEGIN
    -- Verificar si los usuarios ya existen en Auth
    -- Nota: Esta función asume que tienes acceso a auth.users
    
    -- Crear o actualizar Administrador
    SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@eventhub.com' LIMIT 1;
    
    IF admin_id IS NULL THEN
        resultado := resultado || 'Admin no encontrado en auth.users. Créalo manualmente en Supabase Dashboard.' || E'\n';
    ELSE
        INSERT INTO public.usuarios (
            id,
            correo_electronico, 
            nombre_completo, 
            rol,
            telefono,
            ubicacion
        ) VALUES (
            admin_id,
            'admin@eventhub.com',
            'Administrador Demo',
            'administrador',
            '+57 300 000 0001',
            'Bogotá, Colombia'
        ) ON CONFLICT (id) DO UPDATE SET
            nombre_completo = EXCLUDED.nombre_completo,
            rol = EXCLUDED.rol;
        
        resultado := resultado || 'Admin creado/actualizado: ' || admin_id::TEXT || E'\n';
    END IF;
    
    -- Crear o actualizar Organizador
    SELECT id INTO organizador_id FROM auth.users WHERE email = 'organizador1@eventhub.com' LIMIT 1;
    
    IF organizador_id IS NULL THEN
        resultado := resultado || 'Organizador no encontrado en auth.users. Créalo manualmente en Supabase Dashboard.' || E'\n';
    ELSE
        INSERT INTO public.usuarios (
            id,
            correo_electronico, 
            nombre_completo, 
            rol,
            telefono,
            ubicacion
        ) VALUES (
            organizador_id,
            'organizador1@eventhub.com',
            'Organizador Demo',
            'organizador',
            '+57 300 000 0002',
            'Medellín, Colombia'
        ) ON CONFLICT (id) DO UPDATE SET
            nombre_completo = EXCLUDED.nombre_completo,
            rol = EXCLUDED.rol;
        
        resultado := resultado || 'Organizador creado/actualizado: ' || organizador_id::TEXT || E'\n';
    END IF;
    
    -- Crear o actualizar Asistente
    SELECT id INTO asistente_id FROM auth.users WHERE email = 'bayfrox@gmail.com' LIMIT 1;
    
    IF asistente_id IS NULL THEN
        resultado := resultado || 'Asistente no encontrado en auth.users. Créalo manualmente en Supabase Dashboard.' || E'\n';
    ELSE
        INSERT INTO public.usuarios (
            id,
            correo_electronico, 
            nombre_completo, 
            rol,
            telefono,
            ubicacion
        ) VALUES (
            asistente_id,
            'bayfrox@gmail.com',
            'Asistente Demo',
            'asistente',
            '+57 300 000 0003',
            'Cali, Colombia'
        ) ON CONFLICT (id) DO UPDATE SET
            nombre_completo = EXCLUDED.nombre_completo,
            rol = EXCLUDED.rol;
        
        resultado := resultado || 'Asistente creado/actualizado: ' || asistente_id::TEXT || E'\n';
    END IF;
    
    RETURN resultado;
END;
$$;

-- Ejecutar la función para crear/actualizar los usuarios
-- SELECT crear_usuarios_demo();

-- ============================================
-- INSTRUCCIONES DE USO
-- ============================================

-- PASO 1: Crear usuarios en Supabase Auth Dashboard
-- Ve a tu proyecto en Supabase > Authentication > Users
-- Haz clic en "Add user" y crea cada usuario con:
-- 
-- Usuario 1:
--   Email: admin@eventhub.com
--   Password: Admin123!
--   Auto Confirm: Activado
-- 
-- Usuario 2:
--   Email: organizador@eventhub.com
--   Password: Orga123!
--   Auto Confirm: Activado
-- 
-- Usuario 3:
--   Email: asistente@eventhub.com
--   Password: Asist123!
--   Auto Confirm: Activado

-- PASO 2: Ejecutar la función para sincronizar con la tabla usuarios
-- SELECT crear_usuarios_demo();

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Verificar que los usuarios se crearon correctamente
SELECT 
    id,
    correo_electronico,
    nombre_completo,
    rol,
    telefono,
    ubicacion,
    fecha_creacion
FROM public.usuarios
WHERE correo_electronico IN ('admin@eventhub.com', 'organizador1@eventhub.com', 'bayfrox@gmail.com')
ORDER BY rol;

-- Verificar en auth.users
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users
WHERE email IN ('admin@eventhub.com', 'organizador1@eventhub.com', 'bayfrox@gmail.com')
ORDER BY email;
