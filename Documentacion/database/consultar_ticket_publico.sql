-- Script para agregar la función de consulta pública de tickets
-- Ejecutar en Supabase SQL Editor

-- Función para CONSULTAR información del ticket SIN registrar asistencia (para público general)
CREATE OR REPLACE FUNCTION consultar_ticket_qr(p_codigo_qr TEXT)
RETURNS TABLE(
  existe BOOLEAN,
  mensaje TEXT,
  ticket_info JSONB
) AS $$
DECLARE
  v_ticket RECORD;
  v_info JSONB;
BEGIN
  -- Buscar el ticket
  SELECT 
    qr.*,
    e.titulo AS evento_titulo,
    e.fecha_evento,
    e.hora_evento,
    e.ubicacion AS evento_ubicacion,
    u.nombre_completo AS usuario_nombre,
    u.correo_electronico AS usuario_email,
    c.total_pagado,
    c.fecha_creacion AS fecha_compra,
    tt.nombre_tipo AS tipo_entrada,
    tt.precio
  INTO v_ticket
  FROM codigos_qr_entradas qr
  JOIN eventos e ON qr.id_evento = e.id
  JOIN usuarios u ON qr.id_usuario = u.id
  JOIN compras c ON qr.id_compra = c.id
  LEFT JOIN tipos_entrada tt ON c.id_tipo_entrada = tt.id
  WHERE qr.codigo_qr = p_codigo_qr;

  -- Si no existe el ticket
  IF v_ticket IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Código QR no válido'::TEXT, NULL::JSONB;
    RETURN;
  END IF;

  -- Construir información del ticket
  v_info := jsonb_build_object(
    'event_title', v_ticket.evento_titulo,
    'event_date', v_ticket.fecha_evento,
    'event_time', v_ticket.hora_evento,
    'event_location', v_ticket.evento_ubicacion,
    'user_name', v_ticket.usuario_nombre,
    'user_email', v_ticket.usuario_email,
    'ticket_type', COALESCE(v_ticket.tipo_entrada, 'Entrada General'),
    'price', COALESCE(v_ticket.precio, v_ticket.total_pagado),
    'purchase_date', v_ticket.fecha_compra,
    'ticket_number', v_ticket.numero_entrada,
    'status', v_ticket.estado,
    'qr_code', v_ticket.codigo_qr,
    'generated_date', v_ticket.fecha_generacion,
    'scanned_date', v_ticket.fecha_escaneado
  );

  -- Retornar información (sin modificar el estado)
  RETURN QUERY SELECT TRUE, 'Información del ticket'::TEXT, v_info;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Otorgar permisos de ejecución a usuarios anónimos y autenticados
GRANT EXECUTE ON FUNCTION consultar_ticket_qr(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION consultar_ticket_qr(TEXT) TO authenticated;

-- Comentario sobre la función
COMMENT ON FUNCTION consultar_ticket_qr(TEXT) IS 'Consulta información de un ticket sin registrar asistencia. Disponible para público general.';
