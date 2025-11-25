-- =====================================================
-- DEBUG: Política INSERT alternativa mínima para aislar causa
-- Ejecuta este script temporalmente.
-- =====================================================

-- 1. Eliminar políticas INSERT previas
DROP POLICY IF EXISTS "Insertar QRs de compras válidas" ON codigos_qr_entradas;
DROP POLICY IF EXISTS "INSERT QR para compras existentes" ON codigos_qr_entradas;

-- 2. Crear política INSERT temporal (solo valida compra + usuario)
CREATE POLICY "DEBUG insertar por compra"
ON codigos_qr_entradas FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM compras c
    WHERE c.id = codigos_qr_entradas.id_compra
      AND c.id_usuario = codigos_qr_entradas.id_usuario
  )
);

-- 3. Verificar
SELECT policyname, cmd, with_check
FROM pg_policies
WHERE tablename = 'codigos_qr_entradas' AND cmd='INSERT';

-- 4. Probar condición con tus valores
SELECT EXISTS(
  SELECT 1 FROM compras c
  WHERE c.id = '65b4ab5d-840c-4fec-b952-5808c52a24ba'::uuid
    AND c.id_usuario = '2af29ac2-b3bf-41c4-9dcb-a66f4fd4896a'::uuid
) AS debug_insert_permite;

-- Si esto resulta en TRUE pero el INSERT falla, el problema no es la condición
-- sino posible sesión sin contexto (auth.uid() NULL) o falta de rol 'authenticated'.

-- 5. Para volver al estado final luego:
-- DROP POLICY IF EXISTS "DEBUG insertar por compra" ON codigos_qr_entradas;
-- (Recrear política definitiva)
