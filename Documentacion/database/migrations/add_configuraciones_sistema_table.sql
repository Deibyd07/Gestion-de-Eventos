-- =====================================================
-- Migración: Crear tabla configuraciones_sistema
-- Fecha: 2024
-- Descripción: Crea la tabla de configuraciones del sistema
--              necesaria para gestionar parámetros globales
--              como tasas de comisión, límites, etc.
-- =====================================================

-- Paso 1: Crear la tabla configuraciones_sistema
CREATE TABLE IF NOT EXISTS configuraciones_sistema (
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

-- Paso 2: Crear índices para optimización
CREATE INDEX IF NOT EXISTS idx_configuraciones_clave ON configuraciones_sistema(clave);
CREATE INDEX IF NOT EXISTS idx_configuraciones_categoria ON configuraciones_sistema(categoria);

-- Paso 3: Crear trigger para actualizar fecha_actualizacion
CREATE OR REPLACE FUNCTION actualizar_fecha_actualizacion_configuracion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_actualizar_fecha_actualizacion_configuracion ON configuraciones_sistema;

CREATE TRIGGER trigger_actualizar_fecha_actualizacion_configuracion
    BEFORE UPDATE ON configuraciones_sistema
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion_configuracion();

-- Paso 4: Insertar configuraciones iniciales
-- Solo inserta si no existen (usando ON CONFLICT DO NOTHING)
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
    ('mantenimiento_activo', 'false', 'boolean', 'Modo de mantenimiento activo', 'sistema')
ON CONFLICT (clave) DO NOTHING;

-- Paso 5: Verificar inserción
SELECT 
    categoria,
    COUNT(*) as total_configuraciones
FROM configuraciones_sistema
GROUP BY categoria
ORDER BY categoria;

-- Mostrar todas las configuraciones
SELECT clave, valor, tipo, categoria, descripcion
FROM configuraciones_sistema
ORDER BY categoria, clave;

-- =====================================================
-- Instrucciones de ejecución:
-- =====================================================
-- 1. Abre Supabase Dashboard
-- 2. Ve a SQL Editor
-- 3. Copia y pega este script completo
-- 4. Ejecuta el script
-- 5. Verifica la salida para confirmar la creación exitosa
-- 6. Revisa las configuraciones creadas
-- =====================================================

-- =====================================================
-- IMPORTANTE: RLS (Row Level Security)
-- =====================================================
-- Por defecto, Supabase habilita RLS en nuevas tablas.
-- Para permitir acceso a esta tabla desde tu aplicación,
-- ejecuta TAMBIÉN el siguiente script:
-- =====================================================

-- Deshabilitar RLS temporalmente (solo para desarrollo)
-- En producción, deberías crear políticas adecuadas
ALTER TABLE configuraciones_sistema ENABLE ROW LEVEL SECURITY;

-- Política: Permitir lectura a todos los usuarios autenticados
CREATE POLICY "Todos los usuarios autenticados pueden leer configuraciones"
    ON configuraciones_sistema
    FOR SELECT
    TO authenticated
    USING (true);

-- Política: Solo administradores pueden actualizar
CREATE POLICY "Solo administradores pueden actualizar configuraciones"
    ON configuraciones_sistema
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM usuarios
            WHERE usuarios.id = auth.uid()
            AND usuarios.rol = 'administrador'
        )
    );

-- Política: Solo administradores pueden insertar
CREATE POLICY "Solo administradores pueden insertar configuraciones"
    ON configuraciones_sistema
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios
            WHERE usuarios.id = auth.uid()
            AND usuarios.rol = 'administrador'
        )
    );

-- Política: Solo administradores pueden eliminar
CREATE POLICY "Solo administradores pueden eliminar configuraciones"
    ON configuraciones_sistema
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM usuarios
            WHERE usuarios.id = auth.uid()
            AND usuarios.rol = 'administrador'
        )
    );

-- =====================================================
-- Rollback (En caso de necesitar revertir):
-- =====================================================
-- Para revertir esta migración, ejecuta lo siguiente:
-- 
-- DROP POLICY IF EXISTS "Todos los usuarios autenticados pueden leer configuraciones" ON configuraciones_sistema;
-- DROP POLICY IF EXISTS "Solo administradores pueden actualizar configuraciones" ON configuraciones_sistema;
-- DROP POLICY IF EXISTS "Solo administradores pueden insertar configuraciones" ON configuraciones_sistema;
-- DROP POLICY IF EXISTS "Solo administradores pueden eliminar configuraciones" ON configuraciones_sistema;
-- DROP TRIGGER IF EXISTS trigger_actualizar_fecha_actualizacion_configuracion ON configuraciones_sistema;
-- DROP FUNCTION IF EXISTS actualizar_fecha_actualizacion_configuracion();
-- DROP INDEX IF EXISTS idx_configuraciones_clave;
-- DROP INDEX IF EXISTS idx_configuraciones_categoria;
-- DROP TABLE IF EXISTS configuraciones_sistema;
-- =====================================================
