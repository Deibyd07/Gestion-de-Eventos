-- Script SIMPLIFICADO para crear evento de prueba
-- Copia y pega esto en el SQL Editor de Supabase

-- PASO 1: Obtén tu ID de organizador
-- Copia el ID que aparezca en los resultados
SELECT id, correo_electronico, nombre_completo 
FROM usuarios 
WHERE rol = 'organizador'
ORDER BY fecha_creacion DESC;

-- PASO 2: Reemplaza 'PEGA_TU_USER_ID_AQUI' con el UUID que copiaste arriba
-- y ejecuta el resto del script

-- Crear el evento (reemplaza el UUID)
INSERT INTO eventos (
  titulo,
  descripcion,
  url_imagen,
  fecha_evento,
  hora_evento,
  ubicacion,
  categoria,
  maximo_asistentes,
  asistentes_actuales,
  id_organizador,
  nombre_organizador,
  estado,
  etiquetas
) VALUES (
  'Conferencia de Tecnología 2025',
  'Evento de tecnología e innovación con los mejores speakers. Aprende sobre IA, desarrollo web, cloud computing y más.',
  'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1260',
  '2025-06-15',
  '09:00:00',
  'Bogotá, Colombia',
  'Tecnología',
  300,
  0,
  'PEGA_TU_USER_ID_AQUI', -- ⚠️ REEMPLAZA ESTO
  'Tu Nombre',            -- ⚠️ Cambia por tu nombre
  'proximo',
  ARRAY['tecnología', 'innovación', 'networking']
) RETURNING *;

-- PASO 3: Copia el ID del evento que apareció arriba
-- y reemplázalo en las siguientes inserciones

-- Crear tipos de entrada (reemplaza 'PEGA_EVENT_ID_AQUI')
INSERT INTO tipos_entrada (
  id_evento,
  nombre_tipo,
  precio,
  descripcion,
  cantidad_maxima,
  cantidad_disponible,
  nombre_evento
) VALUES
(
  'PEGA_EVENT_ID_AQUI', -- ⚠️ REEMPLAZA con el ID del evento
  'General',
  50000,
  'Acceso general al evento con todas las conferencias',
  200,
  200,
  'Conferencia de Tecnología 2025'
),
(
  'PEGA_EVENT_ID_AQUI', -- ⚠️ REEMPLAZA con el ID del evento
  'VIP',
  150000,
  'Acceso VIP con networking exclusivo y catering premium',
  50,
  50,
  'Conferencia de Tecnología 2025'
),
(
  'PEGA_EVENT_ID_AQUI', -- ⚠️ REEMPLAZA con el ID del evento
  'Estudiante',
  25000,
  'Descuento especial para estudiantes (requiere carnet)',
  50,
  50,
  'Conferencia de Tecnología 2025'
) RETURNING *;

-- Verificar que se creó correctamente
SELECT 
  e.id,
  e.titulo,
  e.fecha_evento,
  e.ubicacion,
  e.estado,
  COUNT(te.id) as total_tipos_entrada
FROM eventos e
LEFT JOIN tipos_entrada te ON e.id = te.id_evento
WHERE e.titulo = 'Conferencia de Tecnología 2025'
GROUP BY e.id, e.titulo, e.fecha_evento, e.ubicacion, e.estado
ORDER BY e.fecha_creacion DESC;
