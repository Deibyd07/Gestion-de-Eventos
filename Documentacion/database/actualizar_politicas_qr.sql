-- =====================================================
-- ACTUALIZACIÓN DE POLÍTICAS RLS PARA CODIGOS_QR_ENTRADAS
-- Ejecutar TODO este script en Supabase SQL Editor
-- =====================================================

-- PASO 1: ELIMINAR TODAS LAS POLÍTICAS ANTIGUAS
DROP POLICY IF EXISTS "Usuarios pueden ver sus propios QR" ON codigos_qr_entradas;
DROP POLICY IF EXISTS "Usuarios pueden ver QR por compra propia" ON codigos_qr_entradas;
DROP POLICY IF EXISTS "Usuarios pueden ver QR por email" ON codigos_qr_entradas;
DROP POLICY IF EXISTS "Usuarios pueden insertar sus propios QR" ON codigos_qr_entradas;
DROP POLICY IF EXISTS "Usuarios pueden insertar QR por compra propia" ON codigos_qr_entradas;
DROP POLICY IF EXISTS "Usuarios pueden insertar QR por email de compra" ON codigos_qr_entradas;
DROP POLICY IF EXISTS "Usuarios pueden insertar QR de sus compras" ON codigos_qr_entradas;
DROP POLICY IF EXISTS "INSERT QR para compras existentes" ON codigos_qr_entradas;
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus propios QR" ON codigos_qr_entradas;
DROP POLICY IF EXISTS "Organizadores pueden ver QR de sus eventos" ON codigos_qr_entradas;
DROP POLICY IF EXISTS "Organizadores pueden actualizar QR de sus eventos" ON codigos_qr_entradas;

-- PASO 2: CREAR NUEVAS POLÍTICAS

-- ===== POLÍTICAS SELECT =====

-- Ver QRs propios (por uid directo)
CREATE POLICY "Ver QRs propios"
ON codigos_qr_entradas FOR SELECT
TO authenticated
USING (auth.uid() = id_usuario);

-- Ver QRs de compras propias
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

-- Ver QRs por email (datos históricos)
CREATE POLICY "Ver QRs por email"
ON codigos_qr_entradas FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios u
    WHERE u.id = codigos_qr_entradas.id_usuario
    AND u.correo_electronico = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Organizadores ven QRs de sus eventos
CREATE POLICY "Organizadores ven QRs de sus eventos"
ON codigos_qr_entradas FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM eventos e
    WHERE e.id = codigos_qr_entradas.id_evento
    AND e.id_organizador = auth.uid()
  )
);

-- ===== POLÍTICA INSERT (LA MÁS IMPORTANTE) =====

-- Insertar QR si la compra existe y los datos coinciden
CREATE POLICY "Insertar QRs de compras válidas"
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

-- ===== POLÍTICAS UPDATE =====

-- Actualizar QRs propios
CREATE POLICY "Actualizar QRs propios"
ON codigos_qr_entradas FOR UPDATE
TO authenticated
USING (auth.uid() = id_usuario)
WITH CHECK (auth.uid() = id_usuario);

-- Organizadores validan QRs de sus eventos
CREATE POLICY "Organizadores validan QRs"
ON codigos_qr_entradas FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM eventos e
    WHERE e.id = codigos_qr_entradas.id_evento
    AND e.id_organizador = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM eventos e
    WHERE e.id = codigos_qr_entradas.id_evento
    AND e.id_organizador = auth.uid()
  )
);

-- PASO 3: VERIFICAR POLÍTICAS CREADAS
SELECT 
  policyname,
  cmd,
  CASE 
    WHEN cmd = 'SELECT' THEN 'Lectura'
    WHEN cmd = 'INSERT' THEN 'Inserción'
    WHEN cmd = 'UPDATE' THEN 'Actualización'
    WHEN cmd = 'DELETE' THEN 'Eliminación'
  END as operacion
FROM pg_policies 
WHERE tablename = 'codigos_qr_entradas'
ORDER BY cmd, policyname;

-- Debe mostrar:
-- INSERT: 1 política (Insertar QRs de compras válidas)
-- SELECT: 4 políticas (Ver QRs propios, Ver QRs de mis compras, Ver QRs por email, Organizadores ven QRs)
-- UPDATE: 2 políticas (Actualizar QRs propios, Organizadores validan QRs)

-- PASO 4: PROBAR LA POLÍTICA INSERT
-- Reemplaza estos UUIDs con los de tu compra:
SELECT EXISTS (
  SELECT 1 FROM compras c
  WHERE c.id = '65b4ab5d-840c-4fec-b952-5808c52a24ba'::uuid
    AND c.id_usuario = '2af29ac2-b3bf-41c4-9dcb-a66f4fd4896a'::uuid
    AND c.id_evento = 'a3c67b4b-5153-4e03-9c33-031b39a33b3a'::uuid
) as politica_insert_debe_permitir;

-- Si retorna TRUE, puedes regenerar los QRs desde la app
