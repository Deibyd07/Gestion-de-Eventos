-- Agregar columna nombre_evento a la tabla tipos_entrada
-- Este script agrega una columna de texto para almacenar el nombre del evento

ALTER TABLE tipos_entrada 
ADD COLUMN nombre_evento TEXT;

-- Opcional: Agregar un índice para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_tipos_entrada_nombre_evento 
ON tipos_entrada(nombre_evento);

-- Opcional: Agregar una restricción de clave foránea si quieres mantener la integridad referencial
-- (Descomenta la siguiente línea si quieres esta restricción)
-- ALTER TABLE tipos_entrada 
-- ADD CONSTRAINT fk_tipos_entrada_nombre_evento 
-- FOREIGN KEY (nombre_evento) REFERENCES eventos(titulo);

-- Comentario: La restricción de clave foránea puede ser problemática si los nombres de eventos cambian
-- Por eso está comentada por defecto
