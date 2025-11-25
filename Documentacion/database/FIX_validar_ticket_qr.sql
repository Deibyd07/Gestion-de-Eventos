-- =====================================================
-- FIX: Función validar_ticket_qr corregida
-- Ejecutar este script en Supabase SQL Editor
-- =====================================================

CREATE OR REPLACE FUNCTION validar_ticket_qr(
  p_codigo_qr TEXT,
  p_id_organizador UUID
)
RETURNS TABLE(
  valido BOOLEAN,
  mensaje TEXT,
  ticket_info JSONB
) AS $$
DECLARE
  v_ticket RECORD;
  v_es_organizador BOOLEAN;
  v_info JSONB;
BEGIN
  -- Debug: Log de entrada
  RAISE NOTICE 'Buscando código QR: %', p_codigo_qr;
  RAISE NOTICE 'ID Organizador: %', p_id_organizador;

  -- Buscar el ticket CON TODOS LOS DATOS
  SELECT 
    qr.id as qr_id,
    qr.codigo_qr,
    qr.estado,
    qr.fecha_escaneado,
    qr.datos_qr,
    qr.id_evento,
    qr.id_usuario,
    qr.id_compra,
    e.id_organizador,
    e.titulo as evento_titulo,
    e.fecha_evento,
    e.hora_evento,
    e.ubicacion as evento_ubicacion,
    u.nombre_completo as usuario_nombre,
    u.correo_electronico as usuario_email
  INTO v_ticket
  FROM codigos_qr_entradas qr
  JOIN eventos e ON qr.id_evento = e.id
  JOIN usuarios u ON qr.id_usuario = u.id
  WHERE qr.codigo_qr = p_codigo_qr;

  -- Debug: Ver qué encontró
  RAISE NOTICE 'Ticket encontrado: %', v_ticket.qr_id;

  -- Verificar si existe
  IF v_ticket.qr_id IS NULL THEN
    RAISE NOTICE 'Ticket NO encontrado en BD';
    RETURN QUERY SELECT FALSE, 'Código QR no válido o no encontrado'::TEXT, NULL::JSONB;
    RETURN;
  END IF;

  RAISE NOTICE 'Organizador del evento: %', v_ticket.id_organizador;
  RAISE NOTICE 'Organizador validando: %', p_id_organizador;

  -- Verificar si el usuario es el organizador del evento
  IF v_ticket.id_organizador != p_id_organizador THEN
    RETURN QUERY SELECT FALSE, 'No tienes permisos para validar este ticket'::TEXT, NULL::JSONB;
    RETURN;
  END IF;

  -- Verificar estado
  IF v_ticket.estado = 'usado' THEN
    RETURN QUERY SELECT 
      FALSE, 
      'Este ticket ya fue utilizado el ' || TO_CHAR(v_ticket.fecha_escaneado, 'DD/MM/YYYY HH24:MI')::TEXT,
      v_ticket.datos_qr;
    RETURN;
  END IF;

  IF v_ticket.estado = 'cancelado' THEN
    RETURN QUERY SELECT FALSE, 'Este ticket ha sido cancelado'::TEXT, v_ticket.datos_qr;
    RETURN;
  END IF;

  IF v_ticket.estado = 'expirado' THEN
    RETURN QUERY SELECT FALSE, 'Este ticket ha expirado'::TEXT, v_ticket.datos_qr;
    RETURN;
  END IF;

  -- Construir info del ticket si datos_qr no existe
  IF v_ticket.datos_qr IS NULL THEN
    v_info := jsonb_build_object(
      'event_title', v_ticket.evento_titulo,
      'event_date', v_ticket.fecha_evento,
      'event_time', v_ticket.hora_evento,
      'event_location', v_ticket.evento_ubicacion,
      'user_name', v_ticket.usuario_nombre,
      'user_email', v_ticket.usuario_email
    );
  ELSE
    v_info := v_ticket.datos_qr;
  END IF;

  -- Marcar como usado
  UPDATE codigos_qr_entradas
  SET 
    estado = 'usado',
    fecha_escaneado = NOW(),
    escaneado_por = p_id_organizador
  WHERE id = v_ticket.qr_id;

  RAISE NOTICE 'Ticket validado exitosamente';

  RETURN QUERY SELECT 
    TRUE, 
    'Ticket validado correctamente'::TEXT,
    v_info;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Dar permisos
REVOKE ALL ON FUNCTION validar_ticket_qr(TEXT, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION validar_ticket_qr(TEXT, UUID) TO authenticated;

COMMENT ON FUNCTION validar_ticket_qr(TEXT, UUID) IS 'Valida y marca un ticket QR como usado. Solo el organizador del evento puede validar sus tickets. Ejecuta con SECURITY DEFINER para saltear RLS.';
