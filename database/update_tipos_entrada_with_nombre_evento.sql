-- Actualizar los tipos_entrada existentes con el nombre del evento
-- Este script actualiza todos los registros existentes en tipos_entrada
-- con el nombre del evento correspondiente

UPDATE tipos_entrada 
SET nombre_evento = eventos.titulo
FROM eventos 
WHERE tipos_entrada.id_evento = eventos.id;

-- Verificar que la actualización fue exitosa
SELECT 
    te.id,
    te.nombre_tipo,
    te.precio,
    te.nombre_evento,
    e.titulo as titulo_evento_original
FROM tipos_entrada te
JOIN eventos e ON te.id_evento = e.id
ORDER BY te.nombre_evento, te.nombre_tipo;
