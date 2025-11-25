-- =====================================================
-- SOLUCIÓN FINAL: Políticas RLS simplificadas
-- Elimina la política que causa "permission denied for table users"
-- =====================================================

-- ELIMINAR TODAS las políticas SELECT existentes
DROP POLICY IF EXISTS "Ver QRs propios" ON codigos_qr_entradas;
DROP POLICY IF EXISTS "Ver QRs de mis compras" ON codigos_qr_entradas;
DROP POLICY IF EXISTS "Ver QRs por email" ON codigos_qr_entradas;
DROP POLICY IF EXISTS "Organizadores ven QRs de sus eventos" ON codigos_qr_entradas;

-- CREAR políticas SELECT simplificadas (SIN acceso a auth.users)

-- 1. Ver QRs si la compra me pertenece (esta es la más importante)
CREATE POLICY "Ver QRs de mis compras"
ON codigos_qr_entradas FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM compras c
    WHERE c.id = codigos_qr_entradas.id_compra
    AND c.id_usuario = auth.uid()
  )
);

-- 1b. Ver QRs si la compra pertenece a mi email (datos históricos)
CREATE POLICY "Ver QRs por email de compra"
ON codigos_qr_entradas FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM compras c
    JOIN usuarios u ON u.id = c.id_usuario
    WHERE c.id = codigos_qr_entradas.id_compra
      AND (auth.jwt() ->> 'email') IS NOT NULL
      AND u.correo_electronico = (auth.jwt() ->> 'email')
  )
);

-- 2. Organizadores ven QRs de sus eventos
CREATE POLICY "Organizadores ven QRs"
ON codigos_qr_entradas FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM eventos e
    WHERE e.id = codigos_qr_entradas.id_evento
    AND e.id_organizador = auth.uid()
  )
);

-- VERIFICAR
SELECT policyname, cmd
FROM pg_policies 
WHERE tablename = 'codigos_qr_entradas'
ORDER BY cmd, policyname;

-- Debe mostrar:
-- SELECT: 2 políticas (Ver QRs de mis compras, Organizadores ven QRs)
-- INSERT: 1 política (Insertar QRs de compras válidas)
-- UPDATE: 2 políticas (Actualizar QRs propios, Organizadores validan QRs)
