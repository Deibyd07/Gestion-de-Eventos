-- =====================================================
-- SCRIPT PARA ELIMINAR COLUMNA CONTRASEÑA
-- =====================================================
-- Este script elimina la columna contraseña de la tabla usuarios
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- Eliminar columna contraseña si existe
ALTER TABLE usuarios DROP COLUMN IF EXISTS contraseña;

-- Verificar que la columna fue eliminada
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
ORDER BY ordinal_position;
