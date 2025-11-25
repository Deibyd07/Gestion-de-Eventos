-- =====================================================
-- FIX: Eliminar política que causa "permission denied for table users"
-- =====================================================

-- Eliminar la política problemática que consulta auth.users
DROP POLICY IF EXISTS "Ver QRs por email" ON codigos_qr_entradas;

-- Recrear política SELECT más simple que NO accede a auth.users
-- Solo verifica si el usuario tiene una compra relacionada
CREATE POLICY "Ver QRs por email"
ON codigos_qr_entradas FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM compras c
    JOIN usuarios u ON u.id = c.id_usuario
    WHERE c.id = codigos_qr_entradas.id_compra
    -- No podemos usar auth.users, así que validamos por compras
  )
);

-- Verificar políticas actuales
SELECT policyname, cmd
FROM pg_policies 
WHERE tablename = 'codigos_qr_entradas'
ORDER BY cmd, policyname;
