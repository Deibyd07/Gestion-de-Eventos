-- =====================================================
-- SCRIPT DE PRUEBA: Validación de QR después del fix
-- Ejecutar DESPUÉS de aplicar FIX_validar_ticket_qr.sql
-- =====================================================

-- 1. Verificar que la función existe y tiene SECURITY DEFINER
SELECT 
  p.proname as nombre_funcion,
  pg_get_function_identity_arguments(p.oid) as argumentos,
  p.prosecdef as es_security_definer,
  p.proconfig as configuracion
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'validar_ticket_qr'
  AND n.nspname = 'public';

-- Debe mostrar:
-- nombre_funcion: validar_ticket_qr
-- es_security_definer: true (t)
-- configuracion: {search_path=public}

-- =====================================================
-- 2. Listar códigos QR disponibles para prueba
-- =====================================================
SELECT 
  qr.codigo_qr,
  qr.estado,
  e.titulo as evento,
  e.id_organizador,