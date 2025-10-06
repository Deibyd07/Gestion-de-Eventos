-- Agregar eventos gratuitos a eventos existentes
-- Este script agrega tipos de entrada gratuitos a todos los eventos que no los tengan

-- Primero, verificar qué eventos no tienen entradas gratuitas
SELECT 
    e.id,
    e.titulo,
    MIN(te.precio) as precio_minimo,
    MAX(te.precio) as precio_maximo
FROM eventos e
LEFT JOIN tipos_entrada te ON e.id = te.id_evento
WHERE e.estado = 'proximo'
GROUP BY e.id, e.titulo
HAVING MIN(te.precio) > 0 OR MIN(te.precio) IS NULL
ORDER BY e.titulo;

-- Agregar entrada gratuita a eventos que no la tengan
INSERT INTO tipos_entrada (
    id,
    id_evento,
    nombre_tipo,
    descripcion,
    precio,
    nombre_evento
)
SELECT 
    gen_random_uuid(),
    e.id,
    'Entrada Gratuita',
    'Acceso gratuito al evento',
    0,
    e.titulo
FROM eventos e
WHERE e.estado = 'proximo'
AND e.id NOT IN (
    SELECT DISTINCT id_evento 
    FROM tipos_entrada 
    WHERE precio = 0
);

-- Verificar que se agregaron correctamente
SELECT 
    e.titulo,
    te.nombre_tipo,
    te.precio,
    te.nombre_evento
FROM eventos e
JOIN tipos_entrada te ON e.id = te.id_evento
WHERE te.precio = 0
ORDER BY e.titulo;
