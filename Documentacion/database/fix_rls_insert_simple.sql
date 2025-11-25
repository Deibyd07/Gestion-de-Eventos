-- =====================================================
-- FIX URGENTE: Política INSERT para codigos_qr_entradas
-- Problema: auth.jwt() retorna NULL, no podemos usarlo
-- Solución: Permitir INSERT si el QR pertenece a una compra válida
-- =====================================================

-- 1. ELIMINAR todas las políticas INSERT existentes
DROP POLICY IF EXISTS "Usuarios pueden insertar sus propios QR" ON codigos_qr_entradas;
DROP POLICY IF EXISTS "Usuarios pueden insertar QR por compra propia" ON codigos_qr_entradas;
DROP POLICY IF EXISTS "Usuarios pueden insertar QR por email de compra" ON codigos_qr_entradas;
DROP POLICY IF EXISTS "Usuarios pueden insertar QR de sus compras" ON codigos_qr_entradas;

-- 2. CREAR política INSERT simplificada
-- Permite insertar si:
-- - El id_compra existe en la tabla compras
-- - El id_usuario del QR coincide con el id_usuario de la compra
-- - El id_evento del QR coincide con el id_evento de la compra
CREATE POLICY "INSERT QR para compras existentes"
ON codigos_qr_entradas FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM compras c
    WHERE c.id = codigos_qr_entradas.id_compra
      AND c.id_usuario = codigos_qr_entradas.id_usuario
      AND c.id_evento = codigos_qr_entradas.id_evento
  )
);

-- 3. Verificar que se creó
SELECT policyname, cmd, with_check
FROM pg_policies 
WHERE tablename = 'codigos_qr_entradas' 
  AND cmd = 'INSERT';

-- 4. Probar que la política funciona
-- Esta query debe retornar TRUE
SELECT EXISTS (
  SELECT 1 FROM compras c
  WHERE c.id = '65b4ab5d-840c-4fec-b952-5808c52a24ba'::uuid
    AND c.id_usuario = '2af29ac2-b3bf-41c4-9dcb-a66f4fd4896a'::uuid
    AND c.id_evento = 'a3c67b4b-5153-4e03-9c33-031b39a33b3a'::uuid
) as politica_debe_permitir;

-- Si retorna TRUE, ya puedes intentar regenerar los QRs desde la app
