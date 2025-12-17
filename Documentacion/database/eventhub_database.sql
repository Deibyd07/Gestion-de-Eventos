-- =====================================================
-- EventHub Database Schema
-- Sistema de Gestión de Eventos
-- Versión: 1.0
-- Fecha: Octubre 2025
-- =====================================================

-- Configuración inicial
SET timezone = 'UTC';
SET client_encoding = 'UTF8';

-- =====================================================
-- 1. CREACIÓN DE TIPOS DE DATOS PERSONALIZADOS
-- =====================================================

-- Tipos de usuario
CREATE TYPE tipo_usuario AS ENUM (
    'asistente',
    'organizador', 
    'administrador'
);

-- Estados de eventos
CREATE TYPE estado_evento AS ENUM (
    'borrador',
    'publicado',
    'cancelado',
    'finalizado',
    'pausado'
);

-- Estados de compras
CREATE TYPE estado_compra AS ENUM (
    'pendiente',
    'procesando',
    'completada',
    'cancelada',
    'reembolsada',
    'fallida'
);

-- Tipos de notificaciones
CREATE TYPE tipo_notificacion AS ENUM (
    'sistema',
    'evento',
    'compra',
    'asistencia',
    'promocion',
    'recordatorio'
);

-- Tipos de plantillas de email
CREATE TYPE tipo_plantilla_email AS ENUM (
    'bienvenida',
    'confirmacion_compra',
    'recordatorio_evento',
    'cancelacion_evento',
    'codigo_qr',
    'promocion',
    'feedback'
);

-- =====================================================
-- 2. CREACIÓN DE TABLAS PRINCIPALES
-- =====================================================

-- Tabla de usuarios
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    correo_electronico TEXT UNIQUE NOT NULL,
    nombre_completo TEXT NOT NULL,
    rol tipo_usuario NOT NULL DEFAULT 'asistente',
    url_avatar TEXT,
    preferencias JSONB DEFAULT '{}',
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de eventos
CREATE TABLE eventos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    descripcion TEXT,
    url_imagen TEXT,
    fecha_evento DATE NOT NULL,
    hora_evento TIME NOT NULL,
    ubicacion TEXT NOT NULL,
    categoria TEXT,
    maximo_asistentes INTEGER NOT NULL DEFAULT 0,
    asistentes_actuales INTEGER NOT NULL DEFAULT 0,
    id_organizador UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre_organizador TEXT NOT NULL,
    estado estado_evento NOT NULL DEFAULT 'borrador',
    etiquetas TEXT[] DEFAULT '{}',
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de tipos de entrada
CREATE TABLE tipos_entrada (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_evento UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    nombre_tipo TEXT NOT NULL,
    precio NUMERIC(10,2) NOT NULL DEFAULT 0,
    descripcion TEXT,
    cantidad_maxima INTEGER NOT NULL DEFAULT 0,
    cantidad_disponible INTEGER NOT NULL DEFAULT 0,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW(),
    nombre_evento TEXT NOT NULL
);

-- Tabla de compras
CREATE TABLE compras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    id_evento UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    id_tipo_entrada UUID NOT NULL REFERENCES tipos_entrada(id) ON DELETE CASCADE,
    cantidad INTEGER NOT NULL DEFAULT 1,
    precio_unitario NUMERIC(10,2) NOT NULL,
    total_pagado NUMERIC(10,2) NOT NULL,
    estado estado_compra NOT NULL DEFAULT 'pendiente',
    codigo_qr TEXT UNIQUE,
    numero_orden TEXT UNIQUE NOT NULL,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. CREACIÓN DE TABLAS DE SOPORTE
-- =====================================================

-- Tabla de notificaciones
CREATE TABLE notificaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo tipo_notificacion NOT NULL DEFAULT 'sistema',
    titulo TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    leida BOOLEAN NOT NULL DEFAULT FALSE,
    url_accion TEXT,
    texto_accion TEXT,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de plantillas de email
CREATE TABLE plantillas_email (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_plantilla TEXT NOT NULL,
    asunto TEXT NOT NULL,
    contenido TEXT NOT NULL,
    tipo tipo_plantilla_email NOT NULL,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de analytics de eventos
CREATE TABLE analiticas_eventos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_evento UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    total_visualizaciones INTEGER NOT NULL DEFAULT 0,
    total_ventas INTEGER NOT NULL DEFAULT 0,
    ingresos_totales NUMERIC(10,2) NOT NULL DEFAULT 0,
    tasa_conversion NUMERIC(5,2) NOT NULL DEFAULT 0,
    precio_promedio_entrada NUMERIC(10,2) NOT NULL DEFAULT 0,
    tipo_entrada_mas_vendida TEXT,
    tasa_asistencia NUMERIC(5,2) NOT NULL DEFAULT 0,
    reembolsos INTEGER NOT NULL DEFAULT 0,
    monto_reembolsos NUMERIC(10,2) NOT NULL DEFAULT 0,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de códigos promocionales
CREATE TABLE codigos_promocionales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    tipo_descuento VARCHAR(20) NOT NULL,
    valor_descuento NUMERIC(10,2) NOT NULL,
    fecha_inicio TIMESTAMPTZ NOT NULL,
    fecha_fin TIMESTAMPTZ NOT NULL,
    uso_maximo INTEGER NOT NULL DEFAULT 1,
    usos_actuales INTEGER NOT NULL DEFAULT 0,
    id_evento UUID REFERENCES eventos(id) ON DELETE CASCADE,
    id_organizador UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de asistencia a eventos
CREATE TABLE asistencia_eventos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_compra UUID NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
    id_evento UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    id_usuario UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha_asistencia TIMESTAMPTZ DEFAULT NOW(),
    validado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    metodo_validacion VARCHAR(50),
    observaciones TEXT,
    estado_asistencia VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    ubicacion_validacion POINT,
    dispositivo_validacion JSONB DEFAULT '{}',
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de favoritos de usuarios
CREATE TABLE favoritos_usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    id_evento UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    categoria_favorito VARCHAR(50),
    notas_personales TEXT,
    recordatorio_activo BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_recordatorio TIMESTAMPTZ,
    prioridad INTEGER NOT NULL DEFAULT 1,
    visible BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(id_usuario, id_evento)
);

-- Tabla de calificaciones de eventos
CREATE TABLE calificaciones_eventos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_evento UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    id_usuario UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    calificacion INTEGER NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
    comentario TEXT,
    aspectos_positivos TEXT[] DEFAULT '{}',
    aspectos_negativos TEXT[] DEFAULT '{}',
    recomendaria BOOLEAN NOT NULL DEFAULT TRUE,
    categoria_calificacion VARCHAR(50),
    fecha_evento_asistido DATE,
    anonima BOOLEAN NOT NULL DEFAULT FALSE,
    moderada BOOLEAN NOT NULL DEFAULT FALSE,
    visible BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(id_evento, id_usuario)
);

CREATE TABLE codigos_qr_entradas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_compra UUID NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
    id_evento UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    id_usuario UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    codigo_qr TEXT NOT NULL UNIQUE,
    datos_qr JSONB NOT NULL,
    fecha_generacion TIMESTAMPTZ DEFAULT NOW(),
    fecha_escaneado TIMESTAMPTZ,
    escaneado_por UUID REFERENCES usuarios(id),
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'usado', 'cancelado', 'expirado')),
    numero_entrada INTEGER NOT NULL,
    UNIQUE(id_compra, numero_entrada)
);

-- Tabla de seguidores de organizadores
CREATE TABLE seguidores_organizadores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario_seguidor UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    id_organizador UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(id_usuario_seguidor, id_organizador)
);

-- Tabla de métodos de pago
CREATE TABLE metodos_pago (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    tipo VARCHAR(30) NOT NULL,
    proveedor TEXT,
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    comision_porcentaje NUMERIC(5,2) DEFAULT 0,
    comision_fija NUMERIC(10,2) DEFAULT 0,
    monto_minimo NUMERIC(10,2) DEFAULT 0,
    monto_maximo NUMERIC(10,2),
    monedas_soportadas TEXT[] DEFAULT '{}',
    requiere_verificacion BOOLEAN NOT NULL DEFAULT FALSE,
    tiempo_procesamiento TEXT,
    configuracion JSONB DEFAULT '{}',
    id_organizador UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de configuraciones del sistema
CREATE TABLE configuraciones_sistema (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(50),
    es_sensible BOOLEAN NOT NULL DEFAULT FALSE,
    solo_lectura BOOLEAN NOT NULL DEFAULT FALSE,
    valor_por_defecto TEXT,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW(),
    actualizado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL
);

-- =====================================================
-- 4. CREACIÓN DE ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para usuarios
CREATE INDEX idx_usuarios_correo ON usuarios(correo_electronico);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_usuarios_fecha_creacion ON usuarios(fecha_creacion);

-- Índices para eventos
CREATE INDEX idx_eventos_organizador ON eventos(id_organizador);
CREATE INDEX idx_eventos_estado ON eventos(estado);
CREATE INDEX idx_eventos_fecha_evento ON eventos(fecha_evento);
CREATE INDEX idx_eventos_categoria ON eventos(categoria);
CREATE INDEX idx_eventos_fecha_creacion ON eventos(fecha_creacion);

-- Índices para tipos de entrada
CREATE INDEX idx_tipos_entrada_evento ON tipos_entrada(id_evento);
CREATE INDEX idx_tipos_entrada_precio ON tipos_entrada(precio);

-- Índices para compras
CREATE INDEX idx_compras_usuario ON compras(id_usuario);
CREATE INDEX idx_compras_evento ON compras(id_evento);
CREATE INDEX idx_compras_estado ON compras(estado);
CREATE INDEX idx_compras_fecha_creacion ON compras(fecha_creacion);
CREATE INDEX idx_compras_codigo_qr ON compras(codigo_qr);
CREATE INDEX idx_compras_numero_orden ON compras(numero_orden);

-- Índices para notificaciones
CREATE INDEX idx_notificaciones_usuario ON notificaciones(id_usuario);
CREATE INDEX idx_notificaciones_tipo ON notificaciones(tipo);
CREATE INDEX idx_notificaciones_leida ON notificaciones(leida);
CREATE INDEX idx_notificaciones_fecha_creacion ON notificaciones(fecha_creacion);

-- Índices para analytics
CREATE INDEX idx_analiticas_evento ON analiticas_eventos(id_evento);
CREATE INDEX idx_analiticas_fecha_creacion ON analiticas_eventos(fecha_creacion);

-- Índices para códigos promocionales
CREATE INDEX idx_codigos_codigo ON codigos_promocionales(codigo);
CREATE INDEX idx_codigos_evento ON codigos_promocionales(id_evento);
CREATE INDEX idx_codigos_organizador ON codigos_promocionales(id_organizador);
CREATE INDEX idx_codigos_activo ON codigos_promocionales(activo);
CREATE INDEX idx_codigos_fechas ON codigos_promocionales(fecha_inicio, fecha_fin);

-- Índices para asistencia
CREATE INDEX idx_asistencia_compra ON asistencia_eventos(id_compra);
CREATE INDEX idx_asistencia_evento ON asistencia_eventos(id_evento);
CREATE INDEX idx_asistencia_usuario ON asistencia_eventos(id_usuario);
CREATE INDEX idx_asistencia_fecha ON asistencia_eventos(fecha_asistencia);
CREATE INDEX idx_asistencia_estado ON asistencia_eventos(estado_asistencia);

-- Índices para favoritos
CREATE INDEX idx_favoritos_usuario ON favoritos_usuarios(id_usuario);
CREATE INDEX idx_favoritos_evento ON favoritos_usuarios(id_evento);
CREATE INDEX idx_favoritos_categoria ON favoritos_usuarios(categoria_favorito);

-- Índices para calificaciones
CREATE INDEX idx_calificaciones_evento ON calificaciones_eventos(id_evento);
CREATE INDEX idx_calificaciones_usuario ON calificaciones_eventos(id_usuario);
CREATE INDEX idx_calificaciones_calificacion ON calificaciones_eventos(calificacion);
CREATE INDEX idx_calificaciones_visible ON calificaciones_eventos(visible);

-- Índices para configuraciones
CREATE INDEX idx_configuraciones_clave ON configuraciones_sistema(clave);
CREATE INDEX idx_configuraciones_categoria ON configuraciones_sistema(categoria);

CREATE INDEX idx_cod_qr_compra ON codigos_qr_entradas(id_compra);
CREATE INDEX idx_cod_qr_evento ON codigos_qr_entradas(id_evento);
CREATE INDEX idx_cod_qr_usuario ON codigos_qr_entradas(id_usuario);
CREATE INDEX idx_cod_qr_codigo ON codigos_qr_entradas(codigo_qr);
CREATE INDEX idx_cod_qr_estado ON codigos_qr_entradas(estado);

-- Índices para seguidores_organizadores
CREATE INDEX idx_seguidores_seguidor ON seguidores_organizadores(id_usuario_seguidor);
CREATE INDEX idx_seguidores_organizador ON seguidores_organizadores(id_organizador);
CREATE INDEX idx_seguidores_fecha ON seguidores_organizadores(fecha_creacion);

-- Índices para metodos_pago
CREATE INDEX idx_metodo_pago_organizador ON metodos_pago(id_organizador);
CREATE INDEX idx_metodo_pago_tipo ON metodos_pago(tipo);
CREATE INDEX idx_metodo_pago_activo ON metodos_pago(activo);
CREATE INDEX idx_metodo_pago_nombre ON metodos_pago(nombre);
CREATE INDEX idx_metodo_pago_fecha_creacion ON metodos_pago(fecha_creacion);

-- =====================================================
-- 5. TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA
-- =====================================================

-- Función para actualizar fecha_actualizacion
CREATE OR REPLACE FUNCTION actualizar_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para todas las tablas con fecha_actualizacion
CREATE TRIGGER trigger_usuarios_actualizacion
    BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_eventos_actualizacion
    BEFORE UPDATE ON eventos
    FOR EACH ROW EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_tipos_entrada_actualizacion
    BEFORE UPDATE ON tipos_entrada
    FOR EACH ROW EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_compras_actualizacion
    BEFORE UPDATE ON compras
    FOR EACH ROW EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_plantillas_email_actualizacion
    BEFORE UPDATE ON plantillas_email
    FOR EACH ROW EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_analiticas_actualizacion
    BEFORE UPDATE ON analiticas_eventos
    FOR EACH ROW EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_codigos_actualizacion
    BEFORE UPDATE ON codigos_promocionales
    FOR EACH ROW EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_asistencia_actualizacion
    BEFORE UPDATE ON asistencia_eventos
    FOR EACH ROW EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_favoritos_actualizacion
    BEFORE UPDATE ON favoritos_usuarios
    FOR EACH ROW EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_calificaciones_actualizacion
    BEFORE UPDATE ON calificaciones_eventos
    FOR EACH ROW EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_configuraciones_actualizacion
    BEFORE UPDATE ON configuraciones_sistema
    FOR EACH ROW EXECUTE FUNCTION actualizar_fecha_actualizacion();

-- =====================================================
-- 6. FUNCIONES DE UTILIDAD
-- =====================================================

-- Función para generar código QR único
CREATE OR REPLACE FUNCTION generar_codigo_qr()
RETURNS TEXT AS $$
BEGIN
    RETURN 'QR_' || extract(epoch from now())::bigint || '_' || substr(md5(random()::text), 1, 8);
END;
$$ LANGUAGE plpgsql;

-- Función para generar número de orden único
CREATE OR REPLACE FUNCTION generar_numero_orden()
RETURNS TEXT AS $$
BEGIN
    RETURN 'ORD_' || to_char(now(), 'YYYYMMDD') || '_' || substr(md5(random()::text), 1, 12);
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar asistentes actuales de un evento
CREATE OR REPLACE FUNCTION actualizar_asistentes_evento()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE eventos 
        SET asistentes_actuales = asistentes_actuales + NEW.cantidad
        WHERE id = NEW.id_evento;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE eventos 
        SET asistentes_actuales = asistentes_actuales - OLD.cantidad + NEW.cantidad
        WHERE id = NEW.id_evento;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE eventos 
        SET asistentes_actuales = asistentes_actuales - OLD.cantidad
        WHERE id = OLD.id_evento;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar asistentes automáticamente
CREATE TRIGGER trigger_actualizar_asistentes
    AFTER INSERT OR UPDATE OR DELETE ON compras
    FOR EACH ROW EXECUTE FUNCTION actualizar_asistentes_evento();

-- =====================================================
-- 6.1. FUNCIONES QR (Consulta pública y Validación)
-- =====================================================

-- Vista de apoyo: tickets QR con información completa
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
        u.correo_electronico AS usuario_email
FROM codigos_qr_entradas qr
JOIN compras c ON qr.id_compra = c.id
JOIN eventos e ON qr.id_evento = e.id
JOIN usuarios u ON qr.id_usuario = u.id;

-- Consulta pública de tickets (no marca asistencia)
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

-- Validación de tickets (marca asistencia para organizador)
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
    SELECT qr.*, e.id_organizador INTO v_ticket
    FROM codigos_qr_entradas qr
    JOIN eventos e ON qr.id_evento = e.id
    WHERE qr.codigo_qr = p_codigo_qr;

    IF v_ticket IS NULL THEN
        RETURN QUERY SELECT FALSE, 'Código QR no válido o no encontrado'::TEXT, NULL::JSONB;
        RETURN;
    END IF;

    v_es_organizador := (v_ticket.id_organizador = p_id_organizador);
    IF NOT v_es_organizador THEN
        RETURN QUERY SELECT FALSE, 'No tienes permisos para validar este ticket'::TEXT, NULL::JSONB;
        RETURN;
    END IF;

    IF v_ticket.estado = 'usado' THEN
        RETURN QUERY SELECT FALSE, 'Este ticket ya fue utilizado'::TEXT, v_ticket.datos_qr;
        RETURN;
    END IF;

    IF v_ticket.estado IN ('cancelado','expirado') THEN
        RETURN QUERY SELECT FALSE, 'Este ticket no es válido'::TEXT, v_ticket.datos_qr;
        RETURN;
    END IF;

    UPDATE codigos_qr_entradas
    SET estado = 'usado', fecha_escaneado = NOW(), escaneado_por = p_id_organizador
    WHERE id = v_ticket.id;

    RETURN QUERY SELECT TRUE, 'Ticket validado correctamente'::TEXT, v_ticket.datos_qr;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- =====================================================
-- 7. DATOS INICIALES DEL SISTEMA
-- =====================================================

-- Insertar usuario administrador por defecto
INSERT INTO usuarios (
    correo_electronico, 
    nombre_completo, 
    rol
) VALUES (
    'admin@eventhub.com',
    'Administrador del Sistema',
    'administrador'
);

-- Insertar configuraciones del sistema
INSERT INTO configuraciones_sistema (clave, valor, tipo, descripcion, categoria) VALUES
('app_name', 'EventHub', 'text', 'Nombre de la aplicación', 'general'),
('app_version', '1.0.0', 'text', 'Versión de la aplicación', 'general'),
('max_eventos_por_usuario', '50', 'integer', 'Máximo número de eventos por usuario', 'limites'),
('max_asistentes_por_evento', '10000', 'integer', 'Máximo número de asistentes por evento', 'limites'),
('tiempo_expiracion_codigo_qr', '24', 'integer', 'Tiempo de expiración de códigos QR en horas', 'seguridad'),
('email_smtp_host', 'smtp.gmail.com', 'text', 'Host del servidor SMTP', 'email'),
('email_smtp_port', '587', 'integer', 'Puerto del servidor SMTP', 'email'),
('email_from', 'noreply@eventhub.com', 'text', 'Email remitente por defecto', 'email'),
('stripe_public_key', '', 'text', 'Clave pública de Stripe', 'pagos'),
('stripe_secret_key', '', 'text', 'Clave secreta de Stripe', 'pagos'),
('paypal_client_id', '', 'text', 'Client ID de PayPal', 'pagos'),
('paypal_client_secret', '', 'text', 'Client Secret de PayPal', 'pagos'),
('tasa_comision_porcentaje', '2.5', 'numeric', 'Tasa de comisión por transacción (%)', 'finanzas'),
('moneda_por_defecto', 'USD', 'text', 'Moneda por defecto del sistema', 'finanzas'),
('zona_horaria_por_defecto', 'UTC', 'text', 'Zona horaria por defecto', 'general'),
('mantenimiento_activo', 'false', 'boolean', 'Modo de mantenimiento activo', 'sistema'),
('registro_abierto', 'true', 'boolean', 'Registro de nuevos usuarios abierto', 'usuarios'),
('verificacion_email_requerida', 'true', 'boolean', 'Verificación de email requerida', 'usuarios'),
('max_intentos_login', '5', 'integer', 'Máximo número de intentos de login', 'seguridad'),
('tiempo_bloqueo_login', '15', 'integer', 'Tiempo de bloqueo por intentos fallidos (minutos)', 'seguridad');

-- Insertar plantillas de email por defecto
INSERT INTO plantillas_email (nombre_plantilla, asunto, contenido, tipo) VALUES
('Bienvenida', '¡Bienvenido a EventHub!', '<h1>¡Bienvenido a EventHub!</h1><p>Gracias por registrarte en nuestra plataforma.</p>', 'bienvenida'),
('Confirmación de Compra', 'Confirmación de tu compra - {{evento_titulo}}', '<h1>¡Compra confirmada!</h1><p>Tu compra para {{evento_titulo}} ha sido procesada exitosamente.</p>', 'confirmacion_compra'),
('Recordatorio de Evento', 'Recordatorio: {{evento_titulo}} - {{fecha_evento}}', '<h1>¡No olvides tu evento!</h1><p>Tu evento {{evento_titulo}} es mañana.</p>', 'recordatorio_evento'),
('Cancelación de Evento', 'Evento cancelado: {{evento_titulo}}', '<h1>Evento cancelado</h1><p>Lamentamos informarte que el evento {{evento_titulo}} ha sido cancelado.</p>', 'cancelacion_evento'),
('Código QR', 'Tu entrada digital - {{evento_titulo}}', '<h1>Tu entrada digital</h1><p>Adjunto encontrarás tu código QR para el evento {{evento_titulo}}.</p>', 'codigo_qr'),
('Promoción', '¡Oferta especial! - {{evento_titulo}}', '<h1>¡Oferta especial!</h1><p>No te pierdas esta oportunidad única para {{evento_titulo}}.</p>', 'promocion'),
('Feedback', '¿Cómo fue tu experiencia? - {{evento_titulo}}', '<h1>Tu opinión es importante</h1><p>Ayúdanos a mejorar contándonos cómo fue tu experiencia en {{evento_titulo}}.</p>', 'feedback');

-- =====================================================
-- 8. VISTAS ÚTILES PARA REPORTES
-- =====================================================

-- Vista de eventos con información del organizador
CREATE VIEW vista_eventos_completos AS
SELECT 
    e.id,
    e.titulo,
    e.descripcion,
    e.fecha_evento,
    e.hora_evento,
    e.ubicacion,
    e.categoria,
    e.maximo_asistentes,
    e.asistentes_actuales,
    e.estado,
    e.etiquetas,
    u.nombre_completo as organizador_nombre,
    u.correo_electronico as organizador_email,
    e.fecha_creacion,
    e.fecha_actualizacion
FROM eventos e
JOIN usuarios u ON e.id_organizador = u.id;

-- Vista de compras con información completa
CREATE VIEW vista_compras_completas AS
SELECT 
    c.id,
    c.numero_orden,
    c.cantidad,
    c.precio_unitario,
    c.total_pagado,
    c.estado,
    c.codigo_qr,
    c.fecha_creacion,
    u.nombre_completo as comprador_nombre,
    u.correo_electronico as comprador_email,
    e.titulo as evento_titulo,
    te.nombre_tipo as tipo_entrada
FROM compras c
JOIN usuarios u ON c.id_usuario = u.id
JOIN eventos e ON c.id_evento = e.id
JOIN tipos_entrada te ON c.id_tipo_entrada = te.id;

-- Vista de analytics por evento
CREATE VIEW vista_analytics_eventos AS
SELECT 
    e.id as evento_id,
    e.titulo as evento_titulo,
    e.fecha_evento,
    ae.total_visualizaciones,
    ae.total_ventas,
    ae.ingresos_totales,
    ae.tasa_conversion,
    ae.precio_promedio_entrada,
    ae.tasa_asistencia,
    ae.reembolsos,
    ae.monto_reembolsos,
    ae.fecha_actualizacion
FROM eventos e
LEFT JOIN analiticas_eventos ae ON e.id = ae.id_evento;

-- Vista ya creada en 6.1: vista_tickets_qr

-- =====================================================
-- 9. PERMISOS Y SEGURIDAD
-- =====================================================

-- Crear roles de base de datos
CREATE ROLE eventhub_app;
CREATE ROLE eventhub_readonly;

-- Otorgar permisos al rol de aplicación
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO eventhub_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO eventhub_app;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO eventhub_app;

-- Otorgar permisos de solo lectura
GRANT SELECT ON ALL TABLES IN SCHEMA public TO eventhub_readonly;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO eventhub_readonly;

-- =====================================================
-- 10. COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================

COMMENT ON TABLE usuarios IS 'Tabla principal para la gestión de usuarios del sistema';
COMMENT ON TABLE eventos IS 'Tabla principal para la gestión de eventos';
COMMENT ON TABLE tipos_entrada IS 'Tipos de entradas disponibles para cada evento';
COMMENT ON TABLE compras IS 'Registro de todas las compras realizadas en el sistema';
COMMENT ON TABLE codigos_qr_entradas IS 'Códigos QR generados por cada compra/entrada, con estado y metadatos';

COMMENT ON TABLE seguidores_organizadores IS 'Relación de seguimiento entre usuarios y organizadores para funcionalidades sociales y notificaciones.';
COMMENT ON TABLE metodos_pago IS 'Catálogo de métodos de pago configurados por cada organizador (pasarelas externas, condiciones y tarifas).';

-- Comentarios en columnas importantes
COMMENT ON COLUMN usuarios.rol IS 'Rol del usuario: asistente, organizador o administrador';
COMMENT ON COLUMN eventos.estado IS 'Estado del evento: borrador, publicado, cancelado, finalizado, pausado';
COMMENT ON COLUMN compras.estado IS 'Estado de la compra: pendiente, procesando, completada, cancelada, reembolsada, fallida';
COMMENT ON COLUMN compras.codigo_qr IS 'Código QR único para validación de entrada';

-- =====================================================
-- FINALIZACIÓN
-- =====================================================

-- Mensaje de finalización
DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'EventHub Database Schema creado exitosamente!';
    RAISE NOTICE 'Versión: 1.0';
    RAISE NOTICE 'Fecha: Octubre 2025';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Tablas creadas: 15';
    RAISE NOTICE 'Índices creados: 30+';
    RAISE NOTICE 'Triggers creados: 10';
    RAISE NOTICE 'Funciones creadas: 5';
    RAISE NOTICE 'Vistas creadas: 4';
    RAISE NOTICE 'Datos iniciales insertados';
    RAISE NOTICE '=====================================================';
END $$;
