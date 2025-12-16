-- Migración: Agregar valor 'evento' al enum tipo_notificacion si no existe
-- Fecha: 2025-12-16
-- Descripción: Asegura que el enum tipo_notificacion tenga el valor 'evento'

-- Verificar si el valor 'evento' ya existe en el enum
DO $$
BEGIN
    -- Intentar agregar el valor 'evento' al enum tipo_notificacion
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_enum 
        WHERE enumlabel = 'evento' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'tipo_notificacion')
    ) THEN
        ALTER TYPE tipo_notificacion ADD VALUE 'evento';
        RAISE NOTICE 'Valor "evento" agregado al enum tipo_notificacion';
    ELSE
        RAISE NOTICE 'El valor "evento" ya existe en tipo_notificacion';
    END IF;
END$$;

-- Verificar todos los valores actuales del enum
SELECT enumlabel as valor_enum 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'tipo_notificacion')
ORDER BY enumsortorder;
