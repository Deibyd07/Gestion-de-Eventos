-- =====================================================
-- Tabla: codigos_qr_entradas
-- Propósito: Almacenar códigos QR generados para cada entrada comprada
-- Historia de Usuario: "Como asistente, quiero recibir un código QR al comprar mi entrada para validar mi acceso al evento"
-- Fecha: Noviembre 2025
-- =====================================================

CREATE TABLE IF NOT EXISTS codigos_qr_entradas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_compra UUID NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
  id_evento UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  id_usuario UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  codigo_qr TEXT NOT NULL UNIQUE, -- Código único encriptado para el QR
  datos_qr JSONB NOT NULL, -- Información completa del ticket en formato JSON
  fecha_generacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_escaneado TIMESTAMPTZ, -- NULL si no ha sido escaneado
  escaneado_por UUID REFERENCES usuarios(id), -- ID del organizador que escaneó
  estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'usado', 'cancelado', 'expirado')),
  numero_entrada INTEGER NOT NULL, -- Número de entrada dentro de la compra (si compró varias)
  UNIQUE(id_compra, numero_entrada)
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_codigos_qr_compra ON codigos_qr_entradas(id_compra);
CREATE INDEX IF NOT EXISTS idx_codigos_qr_evento ON codigos_qr_entradas(id_evento);
CREATE INDEX IF NOT EXISTS idx_codigos_qr_usuario ON codigos_qr_entradas(id_usuario);
CREATE INDEX IF NOT EXISTS idx_codigos_qr_codigo ON codigos_qr_entradas(codigo_qr);
CREATE INDEX IF NOT EXISTS idx_codigos_qr_estado ON codigos_qr_entradas(estado);

-- Vista para consultar tickets con información completa
CREATE OR REPLACE VIEW vista_tickets_qr AS
SELECT 
  qr.id,
  qr.codigo_qr,
  qr.estado,
  qr.fecha_generacion,
  qr.fecha_escaneado,
  qr.numero_entrada,
  qr.datos_qr,
  c.id AS compra_id,
  c.cantidad,
  c.total_pagado,
  e.id AS evento_id,
  e.titulo AS evento_titulo,
  e.fecha_evento,
  e.hora_evento,
  e.ubicacion AS evento_ubicacion,
  u.id AS usuario_id,
  u.nombre_completo AS usuario_nombre,
  u.correo_electronico AS usuario_email,
  org.nombre_completo AS organizador_nombre,
  escaneador.nombre_completo AS escaneado_por_nombre
FROM codigos_qr_entradas qr
JOIN compras c ON qr.id_compra = c.id
JOIN eventos e ON qr.id_evento = e.id
JOIN usuarios u ON qr.id_usuario = u.id
LEFT JOIN usuarios org ON e.id_organizador = org.id
LEFT JOIN usuarios escaneador ON qr.escaneado_por = escaneador.id;

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
    c.fecha_compra,
    tt.nombre AS tipo_entrada,
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

-- Función para validar y marcar ticket como usado (SOLO PARA ORGANIZADORES)
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
BEGIN
  -- Buscar el ticket
  SELECT * INTO v_ticket
  FROM codigos_qr_entradas qr
  JOIN eventos e ON qr.id_evento = e.id
  WHERE qr.codigo_qr = p_codigo_qr;

  -- Verificar si existe
  IF v_ticket IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Código QR no válido o no encontrado'::TEXT, NULL::JSONB;
    RETURN;
  END IF;

  -- Verificar si el usuario es el organizador del evento
  SELECT (e.id_organizador = p_id_organizador) INTO v_es_organizador
  FROM eventos e
  WHERE e.id = v_ticket.id_evento;

  IF NOT v_es_organizador THEN
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

  -- Marcar como usado
  UPDATE codigos_qr_entradas
  SET 
    estado = 'usado',
    fecha_escaneado = NOW(),
    escaneado_por = p_id_organizador
  WHERE id = v_ticket.id;

  RETURN QUERY SELECT 
    TRUE, 
    'Ticket validado correctamente'::TEXT,
    v_ticket.datos_qr;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- NOTAS:
-- - El código QR debe ser único y no predecible (usar UUID + hash)
-- - Los datos_qr incluyen: nombre evento, asistente, fecha, tipo entrada, etc.
-- - El estado 'usado' se marca automáticamente al escanear
-- - Solo el organizador del evento puede validar tickets de su evento
-- =====================================================
