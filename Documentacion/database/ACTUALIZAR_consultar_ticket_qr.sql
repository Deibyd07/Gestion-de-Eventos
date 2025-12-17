-- =====================================================
-- ACTUALIZACIÓN: Función consultar_ticket_qr
-- Fecha: 2025-12-17
-- Cambio: Usar precio_unitario (precio real con descuentos) 
--         en lugar de precio base del tipo de entrada
-- =====================================================

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
    SELECT 
        qr.*,
        e.titulo AS evento_titulo,
        e.fecha_evento,
        e.hora_evento,
        e.ubicacion AS evento_ubicacion,
        u.nombre_completo AS usuario_nombre,
        u.correo_electronico AS usuario_email,
        c.total_pagado,
        c.precio_unitario,
        c.cantidad,
        c.fecha_creacion AS fecha_compra,
        te.nombre_tipo AS tipo_entrada,
        te.precio
    INTO v_ticket
    FROM codigos_qr_entradas qr
    JOIN eventos e ON qr.id_evento = e.id
    JOIN usuarios u ON qr.id_usuario = u.id
    JOIN compras c ON qr.id_compra = c.id
    LEFT JOIN tipos_entrada te ON c.id_tipo_entrada = te.id
    WHERE qr.codigo_qr = p_codigo_qr;

    IF v_ticket IS NULL THEN
        RETURN QUERY SELECT FALSE, 'Código QR no válido'::TEXT, NULL::JSONB;
        RETURN;
    END IF;

    v_info := jsonb_build_object(
        'event_title', v_ticket.evento_titulo,
        'event_date', v_ticket.fecha_evento,
        'event_time', v_ticket.hora_evento,
        'event_location', v_ticket.evento_ubicacion,
        'user_name', v_ticket.usuario_nombre,
        'user_email', v_ticket.usuario_email,
        'ticket_type', COALESCE(v_ticket.tipo_entrada, 'Entrada General'),
        'price', ROUND(v_ticket.total_pagado / NULLIF(v_ticket.cantidad, 0), 2),
        'purchase_date', v_ticket.fecha_compra,
        'ticket_number', v_ticket.numero_entrada,
        'status', v_ticket.estado,
        'qr_code', v_ticket.codigo_qr,
        'generated_date', v_ticket.fecha_generacion,
        'scanned_date', v_ticket.fecha_escaneado
    );

    RETURN QUERY SELECT TRUE, 'Información del ticket'::TEXT, v_info;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
