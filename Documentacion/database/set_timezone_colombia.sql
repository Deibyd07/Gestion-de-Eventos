-- =====================================================
-- Configurar zona horaria para Colombia de forma permanente
-- Zona horaria: America/Bogota (UTC-5)
-- =====================================================

-- Opción 1: Configurar para la sesión actual (temporal)
ALTER DATABASE postgres SET timezone TO 'America/Bogota';

-- Opción 2: Cambiar el DEFAULT de las columnas TIMESTAMPTZ existentes
-- Para la tabla compras
ALTER TABLE compras ALTER COLUMN fecha_creacion SET DEFAULT (NOW() AT TIME ZONE 'America/Bogota');

-- Para la tabla usuarios
ALTER TABLE usuarios ALTER COLUMN fecha_creacion SET DEFAULT (NOW() AT TIME ZONE 'America/Bogota');

-- Para la tabla eventos
ALTER TABLE eventos ALTER COLUMN fecha_creacion SET DEFAULT (NOW() AT TIME ZONE 'America/Bogota');

-- Para la tabla codigos_qr_entradas
ALTER TABLE codigos_qr_entradas ALTER COLUMN fecha_creacion SET DEFAULT (NOW() AT TIME ZONE 'America/Bogota');

-- Para la tabla notificaciones
ALTER TABLE notificaciones ALTER COLUMN fecha_creacion SET DEFAULT (NOW() AT TIME ZONE 'America/Bogota');

-- Para la tabla seguidores_organizadores
ALTER TABLE seguidores_organizadores ALTER COLUMN fecha_creacion SET DEFAULT (NOW() AT TIME ZONE 'America/Bogota');

-- Verificar la configuración
SELECT name, setting FROM pg_settings WHERE name = 'timezone';

-- Verificar la hora actual
SELECT 
    NOW() AS hora_utc,
    NOW() AT TIME ZONE 'America/Bogota' AS hora_colombia,
    CURRENT_TIMESTAMP AS timestamp_actual;

-- =====================================================
-- NOTAS IMPORTANTES:
-- - La primera opción cambia la zona horaria de toda la base de datos
-- - Las ALTER TABLE cambian el DEFAULT de las columnas para nuevos registros
-- - Los registros existentes NO se modifican
-- - En Supabase, es mejor usar la configuración del proyecto en:
--   Settings > Database > Timezone
-- =====================================================

