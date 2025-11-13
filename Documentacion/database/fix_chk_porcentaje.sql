-- ============================================
-- SCRIPT PARA CORREGIR LA RESTRICCIÓN chk_porcentaje
-- ============================================
-- Este script corrige la restricción para que solo valide 
-- valores entre 0-100 cuando el tipo es 'porcentaje',
-- permitiendo cualquier valor para 'monto_fijo'
-- ============================================

-- Paso 1: Eliminar la restricción actual (si existe)
ALTER TABLE codigos_promocionales 
DROP CONSTRAINT IF EXISTS chk_porcentaje;

-- Paso 2: Crear la restricción correcta
-- Solo valida el rango 0-100 para tipo 'porcentaje'
-- Permite cualquier valor para otros tipos ('monto_fijo')
ALTER TABLE codigos_promocionales
ADD CONSTRAINT chk_porcentaje CHECK (
  (tipo_descuento = 'porcentaje' AND valor_descuento >= 0 AND valor_descuento <= 100)
  OR
  (tipo_descuento != 'porcentaje')
);

-- Paso 3: Verificar que se aplicó correctamente
SELECT
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'codigos_promocionales'::regclass
  AND conname = 'chk_porcentaje';

-- ============================================
-- PRUEBAS (Opcional)
-- ============================================

-- Estas pruebas deberían funcionar después de aplicar el fix:

-- ✅ Debe funcionar: Porcentaje válido
-- INSERT INTO codigos_promocionales (codigo, tipo_descuento, valor_descuento, fecha_inicio, fecha_fin, id_organizador)
-- VALUES ('TEST50', 'porcentaje', 50, NOW(), NOW() + INTERVAL '30 days', 'tu-user-id');

-- ✅ Debe funcionar: Monto fijo grande
-- INSERT INTO codigos_promocionales (codigo, tipo_descuento, valor_descuento, fecha_inicio, fecha_fin, id_organizador)
-- VALUES ('TEST5000', 'monto_fijo', 5000, NOW(), NOW() + INTERVAL '30 days', 'tu-user-id');

-- ❌ Debe fallar: Porcentaje mayor a 100
-- INSERT INTO codigos_promocionales (codigo, tipo_descuento, valor_descuento, fecha_inicio, fecha_fin, id_organizador)
-- VALUES ('TEST150', 'porcentaje', 150, NOW(), NOW() + INTERVAL '30 days', 'tu-user-id');
