-- Obtener los IDs y nombres de eventos existentes
-- Usa este script para obtener los UUIDs reales de tus eventos

-- Mostrar todos los eventos con sus IDs
SELECT 
    id,
    titulo,
    fecha_evento,
    ubicacion,
    categoria
FROM eventos 
ORDER BY fecha_evento;

-- Mostrar solo los próximos eventos
SELECT 
    id,
    titulo,
    fecha_evento,
    ubicacion
FROM eventos 
WHERE estado = 'proximo'
ORDER BY fecha_evento;

-- Mostrar eventos con sus tipos de entrada existentes
SELECT 
    e.id as evento_id,
    e.titulo as nombre_evento,
    te.id as tipo_entrada_id,
    te.nombre_tipo,
    te.precio
FROM eventos e
LEFT JOIN tipos_entrada te ON e.id = te.id_evento
ORDER BY e.titulo, te.precio;
