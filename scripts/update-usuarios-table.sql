-- Script para actualizar la tabla 'usuarios' en Supabase
-- Agregar campos adicionales para mejorar la gestión de usuarios

-- 1. Agregar campo 'estado' para gestionar el estado del usuario
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'activo' 
CHECK (estado IN ('activo', 'inactivo', 'suspendido', 'pendiente'));

-- 2. Agregar campo 'telefono' para almacenar el número de teléfono del usuario
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS telefono TEXT;

-- 3. Agregar campo 'ubicacion' para almacenar la ubicación del usuario
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS ubicacion TEXT;

-- 4. Agregar campo 'verificacion' para indicar si el usuario está verificado
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS verificacion BOOLEAN DEFAULT false;

-- 5. Actualizar usuarios existentes con estado 'activo' por defecto
UPDATE usuarios 
SET estado = 'activo' 
WHERE estado IS NULL;

-- 6. Crear índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_usuarios_estado ON usuarios(estado);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_verificacion ON usuarios(verificacion);
CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON usuarios(correo_electronico);

-- 7. Comentarios para documentar los campos
COMMENT ON COLUMN usuarios.estado IS 'Estado del usuario: activo, inactivo, suspendido, pendiente';
COMMENT ON COLUMN usuarios.telefono IS 'Número de teléfono del usuario';
COMMENT ON COLUMN usuarios.ubicacion IS 'Ubicación geográfica del usuario';
COMMENT ON COLUMN usuarios.verificacion IS 'Indica si el usuario ha sido verificado';

-- Verificar la estructura actualizada
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'usuarios'
ORDER BY ordinal_position;
