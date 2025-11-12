-- Script para crear un evento de prueba para el organizador actual
-- Ejecuta esto en el SQL Editor de Supabase

-- Primero, verifica tu ID de usuario organizador
-- Reemplaza 'tu-email@ejemplo.com' con tu correo real
SELECT id, correo_electronico, nombre_completo, rol 
FROM usuarios 
WHERE rol = 'organizador'
ORDER BY fecha_creacion DESC
LIMIT 5;

-- Una vez tengas tu ID, copia y pega este bloque reemplazando 'TU_USER_ID_AQUI'
-- con el UUID real de tu usuario organizador

DO $$
DECLARE
  v_organizador_id uuid;
  v_organizador_nombre text;
  v_evento_id uuid;
BEGIN
  -- IMPORTANTE: Reemplaza este email con el tuyo o usa directamente el UUID
  SELECT id, nombre_completo INTO v_organizador_id, v_organizador_nombre
  FROM usuarios
  WHERE rol = 'organizador'
  ORDER BY fecha_creacion DESC
  LIMIT 1;
  
  IF v_organizador_id IS NULL THEN
    RAISE EXCEPTION 'No se encontró ningún organizador. Crea un usuario con rol organizador primero.';
  END IF;
  
  -- Crear evento
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
    'Evento de tecnología e innovación con los mejores speakers de la industria. Aprende sobre IA, desarrollo web, cloud computing y más.',
    'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    '2025-06-15',
    '09:00:00',
    'Bogotá, Colombia',
    'Tecnología',
    300,
    0,
    v_organizador_id,
    v_organizador_nombre,
    'proximo',
    ARRAY['tecnología', 'innovación', 'networking']
  ) RETURNING id INTO v_evento_id;
  
  -- Crear tipos de entrada para el evento
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
    v_evento_id,
    'General',
    50000,
    'Acceso general al evento con todas las conferencias',
    200,
    200,
    'Conferencia de Tecnología 2025'
  ),
  (
    v_evento_id,
    'VIP',
    150000,
    'Acceso VIP con networking exclusivo, catering premium y certificado',
    50,
    50,
    'Conferencia de Tecnología 2025'
  ),
  (
    v_evento_id,
    'Estudiante',
    25000,
    'Descuento especial para estudiantes (requiere carnet)',
    50,
    50,
    'Conferencia de Tecnología 2025'
  );
  
  RAISE NOTICE 'Evento creado exitosamente con ID: %', v_evento_id;
  RAISE NOTICE 'Organizador: % (ID: %)', v_organizador_nombre, v_organizador_id;
END $$;

-- Verificar que el evento se creó correctamente
SELECT 
  e.id,
  e.titulo,
  e.fecha_evento,
  e.ubicacion,
  e.estado,
  e.nombre_organizador,
  COUNT(te.id) as tipos_entrada
FROM eventos e
LEFT JOIN tipos_entrada te ON e.id = te.id_evento
WHERE e.id_organizador IN (
  SELECT id FROM usuarios WHERE rol = 'organizador' ORDER BY fecha_creacion DESC LIMIT 1
)
GROUP BY e.id, e.titulo, e.fecha_evento, e.ubicacion, e.estado, e.nombre_organizador
ORDER BY e.fecha_creacion DESC
LIMIT 1;
