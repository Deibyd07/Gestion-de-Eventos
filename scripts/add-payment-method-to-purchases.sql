-- Script para agregar la columna id_metodo_pago a la tabla compras
-- Si ya existe, este script no hará nada

-- Agregar columna id_metodo_pago si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'compras' 
        AND column_name = 'id_metodo_pago'
    ) THEN
        ALTER TABLE compras 
        ADD COLUMN id_metodo_pago UUID REFERENCES metodos_pago(id) ON DELETE SET NULL;
        
        -- Crear índice para mejorar el rendimiento de las consultas
        CREATE INDEX IF NOT EXISTS idx_compras_metodo_pago ON compras(id_metodo_pago);
        
        RAISE NOTICE 'Columna id_metodo_pago agregada a la tabla compras';
    ELSE
        RAISE NOTICE 'La columna id_metodo_pago ya existe en la tabla compras';
    END IF;
END $$;

-- Verificar la estructura
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'compras' 
AND column_name = 'id_metodo_pago';
