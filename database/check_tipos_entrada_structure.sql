-- Verificar la estructura actual de la tabla tipos_entrada
-- Este script te ayudará a ver qué columnas existen actualmente

-- Mostrar todas las columnas de la tabla tipos_entrada
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'tipos_entrada' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Mostrar algunos registros de ejemplo para entender la estructura
SELECT * FROM tipos_entrada LIMIT 3;

-- Mostrar la estructura completa de la tabla
\d tipos_entrada;
