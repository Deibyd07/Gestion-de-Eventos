-- =====================================================
-- SCRIPT DE VERIFICACIÓN: Políticas RLS
-- Verifica que las políticas estén correctamente aplicadas
-- =====================================================

-- 1. Verificar políticas INSERT en codigos_qr_entradas
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  with_check
FROM pg_policies 
WHERE tablename = 'codigos_qr_entradas' 
  AND cmd = 'INSERT';

-- Debería mostrar solo 1 política:
-- "Usuarios pueden insertar QR de sus compras"

-- =====================================================
-- 2. Verificar datos del usuario actual
-- =====================================================

-- Tu auth.uid() actual
SELECT auth.uid() as auth_uid;

-- Tu email del JWT
SELECT auth.jwt() ->> 'email' as jwt_email;

-- =====================================================
-- 3. Verificar que el usuario existe en la tabla usuarios
-- =====================================================

SELECT 
  id,
  nombre_completo,
  correo_electronico
FROM usuarios 
WHERE correo_electronico = (auth.jwt() ->> 'email');

-- =====================================================
-- 4. Verificar compras del usuario por email
-- =====================================================

SELECT 
  c.id as compra_id,
  c.id_usuario as compra_usuario_id,
  c.cantidad,
  u.correo_electronico as usuario_email
FROM compras c
JOIN usuarios u ON u.id = c.id_usuario
WHERE u.correo_electronico = (auth.jwt() ->> 'email')
ORDER BY c.fecha_creacion DESC
LIMIT 10;

-- =====================================================
-- 5. PRUEBA: Simular INSERT de QR (SIN EJECUTAR - SOLO PARA VER SI PASA RLS)
-- =====================================================

-- Esta query verifica si la política permitiría el INSERT
-- Reemplaza los valores con los de tu compra real:

-- EJEMPLO (NO EJECUTAR, SOLO LEER):
/*
INSERT INTO codigos_qr_entradas (
  id_compra,
  id_evento,
  id_usuario,
  codigo_qr,
  numero_entrada,
  datos_qr
)
SELECT 
  '65b4ab5d-840c-4fec-b952-5808c52a24ba'::uuid,  -- id_compra
  'a3c67b4b-5153-4e03-9c33-031b39a33b3a'::uuid,  -- id_evento
  '2af29ac2-b3bf-41c4-9dcb-a66f4fd4896a'::uuid,  -- id_usuario (de la compra)
  'TEST-CODE-12345',                               -- codigo_qr
  1,                                                -- numero_entrada
  '{}'::jsonb                                       -- datos_qr
WHERE EXISTS (
  -- Esta es la condición de la política
  SELECT 1 FROM compras c
  JOIN usuarios u ON u.id = c.id_usuario
  WHERE c.id = '65b4ab5d-840c-4fec-b952-5808c52a24ba'::uuid
    AND c.id_usuario = '2af29ac2-b3bf-41c4-9dcb-a66f4fd4896a'::uuid
    AND (
      c.id_usuario = auth.uid()
      OR u.correo_electronico = (auth.jwt() ->> 'email')
    )
);
*/

-- =====================================================
-- 6. VERIFICAR LA CONDICIÓN DE LA POLÍTICA MANUALMENTE
-- =====================================================

-- Esta query debe retornar TRUE si la política debería permitir el INSERT
SELECT EXISTS (
  SELECT 1 FROM compras c
  JOIN usuarios u ON u.id = c.id_usuario
  WHERE c.id = '65b4ab5d-840c-4fec-b952-5808c52a24ba'::uuid
    AND c.id_usuario = '2af29ac2-b3bf-41c4-9dcb-a66f4fd4896a'::uuid
    AND (
      c.id_usuario = auth.uid()
      OR u.correo_electronico = (auth.jwt() ->> 'email')
    )
) as politica_permite_insert;

-- Si esto retorna TRUE, la política DEBERÍA funcionar
-- Si retorna FALSE, hay un problema con los datos o la política

-- =====================================================
-- 7. Ver detalles de la compra específica
-- =====================================================

SELECT 
  c.*,
  u.correo_electronico,
  auth.uid() as current_auth_uid,
  (auth.jwt() ->> 'email') as current_jwt_email,
  (c.id_usuario = auth.uid()) as uid_match,
  (u.correo_electronico = (auth.jwt() ->> 'email')) as email_match
FROM compras c
JOIN usuarios u ON u.id = c.id_usuario
WHERE c.id = '65b4ab5d-840c-4fec-b952-5808c52a24ba'::uuid;

