-- Migración: Agregar campos de referencia a notificaciones
-- Fecha: 2025-12-16
-- Descripción: Agrega campos para referenciar entidades relacionadas (eventos, compras, etc.)
-- Esto permite obtener datos actualizados al mostrar las notificaciones

-- 1. Agregar columnas para referencias
ALTER TABLE notificaciones 
  ADD COLUMN id_evento UUID REFERENCES eventos(id) ON DELETE CASCADE,
  ADD COLUMN id_compra UUID REFERENCES compras(id) ON DELETE CASCADE,
  ADD COLUMN metadata JSONB DEFAULT '{}';

-- 2. Crear índices para mejorar el rendimiento
CREATE INDEX idx_notificaciones_evento ON notificaciones(id_evento) WHERE id_evento IS NOT NULL;
CREATE INDEX idx_notificaciones_compra ON notificaciones(id_compra) WHERE id_compra IS NOT NULL;
CREATE INDEX idx_notificaciones_metadata ON notificaciones USING gin(metadata);

-- 3. Comentarios
COMMENT ON COLUMN notificaciones.id_evento IS 'Referencia al evento relacionado con esta notificación (si aplica)';
COMMENT ON COLUMN notificaciones.id_compra IS 'Referencia a la compra relacionada con esta notificación (si aplica)';
COMMENT ON COLUMN notificaciones.metadata IS 'Datos adicionales en formato JSON para información contextual';

-- 4. Ejemplo de uso del campo metadata:
-- Para guardar el nombre original del evento al momento de la notificación (histórico)
-- UPDATE notificaciones SET metadata = '{"nombre_original": "Concierto Rock 2024"}' WHERE id = 'some-uuid';
