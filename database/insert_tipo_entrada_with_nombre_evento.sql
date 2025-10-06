-- Ejemplo de cómo insertar un nuevo tipo de entrada con nombre_evento
-- IMPORTANTE: Reemplaza los valores con los datos reales de tu evento

-- Primero, obtén el ID real de un evento existente con esta consulta:
-- SELECT id, titulo FROM eventos LIMIT 5;

-- Ejemplo con un evento gratuito (reemplaza 'UUID_DEL_EVENTO_REAL' con un UUID real)
INSERT INTO tipos_entrada (
    id,
    id_evento,
    nombre_tipo,
    descripcion,
    precio,
    nombre_evento
) VALUES (
    gen_random_uuid(),  -- Genera un UUID automáticamente
    'UUID_DEL_EVENTO_REAL',  -- Reemplaza con el ID real del evento (debe ser un UUID válido)
    'Entrada General',
    'Acceso general al evento',
    0,  -- Precio gratuito
    'Nombre del Evento Aquí'  -- Reemplaza con el nombre real del evento
);

-- Ejemplo con un evento de pago
INSERT INTO tipos_entrada (
    id,
    id_evento,
    nombre_tipo,
    descripcion,
    precio,
    nombre_evento
) VALUES (
    gen_random_uuid(),
    'UUID_DEL_EVENTO_REAL',  -- Reemplaza con el ID real del evento (debe ser un UUID válido)
    'Entrada VIP',
    'Acceso VIP con beneficios especiales',
    50000,
    'Nombre del Evento Aquí'  -- Reemplaza con el nombre real del evento
);

-- ALTERNATIVA: Si quieres insertar tipos de entrada para un evento específico por nombre
-- (Esto es más fácil si conoces el nombre del evento)
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
    'Entrada General',
    'Acceso general al evento',
    0,
    e.titulo
FROM eventos e 
WHERE e.titulo = 'Nombre del Evento Específico'  -- Reemplaza con el nombre real
LIMIT 1;
