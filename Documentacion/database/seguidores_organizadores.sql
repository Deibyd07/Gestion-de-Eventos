-- =====================================================
-- Tabla: seguidores_organizadores
-- Propósito: Relación de seguimiento entre usuarios y organizadores
-- Historia de Usuario: "Como usuario, quiero seguir organizadores favoritos para recibir notificaciones de sus nuevos eventos"
-- Fecha: Noviembre 2025
-- =====================================================

CREATE TABLE IF NOT EXISTS seguidores_organizadores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario_seguidor UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  id_organizador UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(id_usuario_seguidor, id_organizador)
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_seguidores_usuario_seguidor ON seguidores_organizadores(id_usuario_seguidor);
CREATE INDEX IF NOT EXISTS idx_seguidores_organizador ON seguidores_organizadores(id_organizador);

-- Vista opcional: organizadores seguidos por usuario
CREATE OR REPLACE VIEW vista_organizadores_seguidos AS
SELECT 
  s.id AS relacion_id,
  s.id_usuario_seguidor,
  s.id_organizador,
  u.nombre_completo AS nombre_organizador,
  u.correo_electronico AS email_organizador,
  u.url_avatar AS avatar_organizador,
  s.fecha_creacion AS fecha_seguimiento
FROM seguidores_organizadores s
JOIN usuarios u ON s.id_organizador = u.id;

-- =====================================================
-- NOTAS:
-- - Cuando se crea un evento nuevo, se debe consultar esta tabla para generar notificaciones.
-- - La lógica de negocio se implementa en el servicio EventService + NotificationService.
-- =====================================================
