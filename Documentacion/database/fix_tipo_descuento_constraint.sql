-- =====================================================
-- Script para corregir restricciones de codigos_promocionales
-- Fecha: Noviembre 2025
-- =====================================================

-- PASO 1: Verificar valores existentes en la base de datos
SELECT DISTINCT tipo_descuento 
FROM codigos_promocionales;

-- PASO 2: Eliminar las restricciones problemáticas
ALTER TABLE codigos_promocionales 
DROP CONSTRAINT IF EXISTS codigos_promocionales_tipo_descuento_check;

ALTER TABLE codigos_promocionales 
DROP CONSTRAINT IF EXISTS chk_porcentaje;

-- PASO 3: Agregar las nuevas restricciones correctas

-- Restricción para tipo_descuento: permite 'porcentaje' y 'monto_fijo'
ALTER TABLE codigos_promocionales 
ADD CONSTRAINT codigos_promocionales_tipo_descuento_check 
CHECK (tipo_descuento IN ('porcentaje', 'monto_fijo'));

-- Restricción para valor_descuento según el tipo:
-- - Si es 'porcentaje': debe estar entre 0 y 100
-- - Si es 'monto_fijo': debe ser mayor o igual a 0
ALTER TABLE codigos_promocionales 
ADD CONSTRAINT chk_porcentaje CHECK (
  (tipo_descuento = 'porcentaje' AND valor_descuento >= 0 AND valor_descuento <= 100) 
  OR 
  (tipo_descuento = 'monto_fijo' AND valor_descuento >= 0)
);

-- PASO 4: Verificar que las restricciones se aplicaron correctamente
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'codigos_promocionales'::regclass
  AND conname IN ('codigos_promocionales_tipo_descuento_check', 'chk_porcentaje');

-- PASO 5: Probar inserciones de ejemplo (opcional)
-- Descomenta para probar después de aplicar las restricciones

/*
-- Probar descuento por porcentaje
INSERT INTO codigos_promocionales (
    codigo, 
    descripcion, 
    tipo_descuento, 
    valor_descuento,
    fecha_inicio,
    fecha_fin,
    id_organizador
) VALUES (
    'TEST_PORCENTAJE',
    'Descuento de prueba por porcentaje',
    'porcentaje',
    25,
    NOW(),
    NOW() + INTERVAL '30 days',
    '57006bb1-8cb4-4577-8c9f-2b5ddc064df8'
);

-- Probar descuento por monto fijo
INSERT INTO codigos_promocionales (
    codigo, 
    descripcion, 
    tipo_descuento, 
    valor_descuento,
    fecha_inicio,
    fecha_fin,
    id_organizador
) VALUES (
    'TEST_MONTO_FIJO',
    'Descuento de prueba por monto fijo',
    'monto_fijo',
    50.00,
    NOW(),
    NOW() + INTERVAL '30 days',
    '57006bb1-8cb4-4577-8c9f-2b5ddc064df8'
);

-- Eliminar las pruebas
DELETE FROM codigos_promocionales WHERE codigo LIKE 'TEST_%';
*/

-- =====================================================
-- NOTAS IMPORTANTES:
-- =====================================================
-- 1. Ejecuta primero el PASO 1 para ver qué valores existen actualmente
-- 2. Si hay valores diferentes a 'porcentaje' o 'monto_fijo', 
--    necesitarás actualizarlos primero antes de aplicar la restricción
-- 3. Los PASOS 2 y 3 eliminan y recrean las restricciones
-- 4. El PASO 4 verifica que todo se aplicó correctamente
-- 5. El PASO 5 (comentado) te permite probar que funciona
-- =====================================================
