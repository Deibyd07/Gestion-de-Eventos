-- =====================================================
-- FIX: Row Level Security Policies
-- Problema: Las compras se insertan pero .select() retorna {}
-- Causa: Falta política SELECT en tabla compras
-- Fecha: Noviembre 2025
-- =====================================================

-- 1. Habilitar RLS en tabla compras (si no está habilitado)
ALTER TABLE compras ENABLE ROW LEVEL SECURITY;

-- 2. ELIMINAR políticas existentes para evitar conflictos
DROP POLICY IF EXISTS "Usuarios pueden ver sus propias compras" ON compras;
DROP POLICY IF EXISTS "Usuarios pueden insertar sus propias compras" ON compras;
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus propias compras" ON compras;
DROP POLICY IF EXISTS "Organizadores pueden ver compras de sus eventos" ON compras;

-- 3. CREAR políticas correctas

-- Política SELECT: Usuarios ven sus propias compras
CREATE POLICY "Usuarios pueden ver sus propias compras"
ON compras FOR SELECT
TO authenticated
USING (auth.uid() = id_usuario);

-- Política INSERT: Usuarios pueden crear sus propias compras
CREATE POLICY "Usuarios pueden insertar sus propias compras"
ON compras FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id_usuario);

-- Política UPDATE: Usuarios pueden actualizar sus propias compras
CREATE POLICY "Usuarios pueden actualizar sus propias compras"
ON compras FOR UPDATE
TO authenticated
USING (auth.uid() = id_usuario)
WITH CHECK (auth.uid() = id_usuario);

-- Política adicional: Organizadores pueden ver compras de sus eventos
CREATE POLICY "Organizadores pueden ver compras de sus eventos"
ON compras FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM eventos e
    WHERE e.id = compras.id_evento
    AND e.id_organizador = auth.uid()
  )
);

-- Política SELECT adicional: Usuarios ven compras por su email (claim del JWT)
-- Útil para datos históricos donde id_usuario no coincide con auth.uid()
CREATE POLICY "Usuarios pueden ver compras por email"
ON compras FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios u
    WHERE u.id = compras.id_usuario
      AND u.correo_electronico = (auth.jwt() ->> 'email')
  )
);

-- =====================================================
-- 4. Verificar y actualizar políticas de codigos_qr_entradas
-- =====================================================

ALTER TABLE codigos_qr_entradas ENABLE ROW LEVEL SECURITY;

-- ELIMINAR políticas existentes
DROP POLICY IF EXISTS "Usuarios pueden ver sus propios QR" ON codigos_qr_entradas;
DROP POLICY IF EXISTS "Usuarios pueden ver QR por compra propia" ON codigos_qr_entradas;
DROP POLICY IF EXISTS "Usuarios pueden ver QR por email" ON codigos_qr_entradas;
DROP POLICY IF EXISTS "Usuarios pueden insertar sus propios QR" ON codigos_qr_entradas;
DROP POLICY IF EXISTS "Usuarios pueden insertar QR por compra propia" ON codigos_qr_entradas;
DROP POLICY IF EXISTS "Usuarios pueden insertar QR por email de compra" ON codigos_qr_entradas;
DROP POLICY IF EXISTS "Usuarios pueden insertar QR de sus compras" ON codigos_qr_entradas;
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus propios QR" ON codigos_qr_entradas;
DROP POLICY IF EXISTS "Organizadores pueden ver QR de sus eventos" ON codigos_qr_entradas;
DROP POLICY IF EXISTS "Organizadores pueden actualizar QR de sus eventos" ON codigos_qr_entradas;

-- CREAR políticas correctas

-- Política SELECT: Usuarios ven sus propios QR
CREATE POLICY "Usuarios pueden ver sus propios QR"
ON codigos_qr_entradas FOR SELECT
TO authenticated
USING (auth.uid() = id_usuario);

-- Política SELECT adicional: ver QRs si la compra pertenece al usuario autenticado
CREATE POLICY "Usuarios pueden ver QR por compra propia"
ON codigos_qr_entradas FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM compras c
    WHERE c.id = codigos_qr_entradas.id_compra
    AND c.id_usuario = auth.uid()
  )
);

-- Política SELECT adicional: ver QRs por email (claim del JWT)
CREATE POLICY "Usuarios pueden ver QR por email"
ON codigos_qr_entradas FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios u
    WHERE u.id = codigos_qr_entradas.id_usuario
      AND u.correo_electronico = (auth.jwt() ->> 'email')
  )
);

-- Política INSERT: Permite insertar QR si la compra existe y los datos coinciden
-- NO validamos auth.uid() porque puede no coincidir con datos históricos
-- La seguridad viene de validar que la compra exista y los IDs coincidan
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

-- Política UPDATE: Usuarios pueden actualizar sus propios QR
CREATE POLICY "Usuarios pueden actualizar sus propios QR"
ON codigos_qr_entradas FOR UPDATE
TO authenticated
USING (auth.uid() = id_usuario)
WITH CHECK (auth.uid() = id_usuario);

-- Política adicional: Organizadores pueden ver y validar QR de sus eventos
CREATE POLICY "Organizadores pueden ver QR de sus eventos"
ON codigos_qr_entradas FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM eventos e
    WHERE e.id = codigos_qr_entradas.id_evento
    AND e.id_organizador = auth.uid()
  )
);

-- Política adicional: Organizadores pueden actualizar QR de sus eventos (validar tickets)
CREATE POLICY "Organizadores pueden actualizar QR de sus eventos"
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

-- =====================================================
-- 5. Verificar políticas en tabla tipos_entrada
-- =====================================================

ALTER TABLE tipos_entrada ENABLE ROW LEVEL SECURITY;

-- ELIMINAR políticas existentes
DROP POLICY IF EXISTS "Todos pueden ver tipos de entrada" ON tipos_entrada;
DROP POLICY IF EXISTS "Organizadores pueden crear tipos de entrada" ON tipos_entrada;
DROP POLICY IF EXISTS "Organizadores pueden actualizar tipos de entrada" ON tipos_entrada;

-- Política SELECT: Todos los usuarios autenticados pueden ver tipos de entrada
CREATE POLICY "Todos pueden ver tipos de entrada"
ON tipos_entrada FOR SELECT
TO authenticated
USING (true);

-- Política INSERT: Solo organizadores pueden crear tipos de entrada para sus eventos
CREATE POLICY "Organizadores pueden crear tipos de entrada"
ON tipos_entrada FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM eventos e
    WHERE e.id = tipos_entrada.id_evento
    AND e.id_organizador = auth.uid()
  )
);

-- Política UPDATE: Solo organizadores pueden actualizar tipos de entrada de sus eventos
CREATE POLICY "Organizadores pueden actualizar tipos de entrada"
ON tipos_entrada FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM eventos e
    WHERE e.id = tipos_entrada.id_evento
    AND e.id_organizador = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM eventos e
    WHERE e.id = tipos_entrada.id_evento
    AND e.id_organizador = auth.uid()
  )
);

-- =====================================================
-- VERIFICACIÓN: Consultas para verificar las políticas
-- =====================================================

-- Verificar políticas de compras
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'compras';

-- Vista filtrada por sesión actual: compras del usuario actual (por uid o por email)
DROP VIEW IF EXISTS vista_compras_usuario_actual;
CREATE VIEW vista_compras_usuario_actual AS
SELECT c.*
FROM compras c
WHERE (
  c.id_usuario = auth.uid()
  OR EXISTS (
    SELECT 1 FROM usuarios u
    WHERE u.id = c.id_usuario
      AND u.correo_electronico = (auth.jwt() ->> 'email')
  )
);

-- Verificar vista (se evalúa con el contexto del JWT de la sesión)
-- SELECT * FROM vista_compras_usuario_actual ORDER BY fecha_creacion DESC LIMIT 50;

-- Verificar políticas de codigos_qr_entradas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'codigos_qr_entradas';

-- Vista filtrada por sesión actual: QRs del usuario actual (por uid, por compra o por email)
DROP VIEW IF EXISTS vista_qr_usuario_actual;
CREATE VIEW vista_qr_usuario_actual AS
SELECT q.*
FROM codigos_qr_entradas q
WHERE (
  q.id_usuario = auth.uid()
  OR EXISTS (
    SELECT 1 FROM compras c
    WHERE c.id = q.id_compra
      AND c.id_usuario = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM usuarios u
    WHERE u.id = q.id_usuario
      AND u.correo_electronico = (auth.jwt() ->> 'email')
  )
);

-- Verificar políticas de tipos_entrada
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'tipos_entrada';

-- =====================================================
-- NOTAS:
-- - Ejecutar este script en Supabase SQL Editor
-- - Las políticas anteriores se eliminan para evitar conflictos
-- - auth.uid() debe coincidir con id_usuario en las tablas
-- - Organizadores tienen acceso a compras/QR de sus eventos
-- - El problema "{}" se resuelve con la política SELECT
-- =====================================================
