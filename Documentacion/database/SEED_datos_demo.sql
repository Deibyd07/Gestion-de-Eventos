-- =====================================================
-- EventHub · SEED de datos demo (información visible)
-- =====================================================
-- Enriquece la BD con eventos, entradas, analíticas, reseñas,
-- códigos promocionales, métodos de pago y seguidores.
--
-- CARACTERÍSTICAS:
--   • Idempotente: se puede re-ejecutar (limpia su propio seed antes de insertar).
--   • Reutiliza el organizador real (organizador1@eventhub.com) si existe,
--     así los eventos aparecen en SU panel al iniciar sesión.
--   • No inserta en auth.users (los asistentes demo son solo para mostrar
--     reseñas/recomendaciones; no inician sesión).
--   • No inserta en "compras" para no disparar el trigger de aforo ni la
--     generación de QR; el aforo visible se logra con la disponibilidad de
--     las entradas (cantidad_maxima vs cantidad_disponible).
--
-- USO: Supabase Dashboard → SQL Editor → pega y ejecuta.
-- =====================================================

DO $$
DECLARE
  v_org   UUID;
  v_att1  UUID;
  v_att2  UUID;
  v_att3  UUID;
  v_att4  UUID;
  v_org_nombre TEXT;

  -- IDs de eventos
  e1  UUID := gen_random_uuid();
  e2  UUID := gen_random_uuid();
  e3  UUID := gen_random_uuid();
  e4  UUID := gen_random_uuid();
  e5  UUID := gen_random_uuid();
  e6  UUID := gen_random_uuid();
  e7  UUID := gen_random_uuid();
  e8  UUID := gen_random_uuid();
  e9  UUID := gen_random_uuid();
  e10 UUID := gen_random_uuid();
BEGIN
  -- ===================================================
  -- 1. RESOLVER ORGANIZADOR (reutiliza el real o crea uno demo)
  -- ===================================================
  SELECT id INTO v_org FROM usuarios WHERE correo_electronico = 'organizador1@eventhub.com';

  IF v_org IS NULL THEN
    SELECT id INTO v_org FROM usuarios WHERE rol = 'organizador' ORDER BY fecha_creacion LIMIT 1;
  END IF;

  IF v_org IS NULL THEN
    v_org := gen_random_uuid();
    INSERT INTO usuarios (id, correo_electronico, nombre_completo, rol, telefono, ubicacion)
    VALUES (v_org, 'organizador.demo@eventhub.com', 'Producciones Andinas', 'organizador', '+57 300 100 0001', 'Bogotá');
  END IF;

  SELECT nombre_completo INTO v_org_nombre FROM usuarios WHERE id = v_org;
  v_org_nombre := COALESCE(v_org_nombre, 'Producciones Andinas');

  -- ===================================================
  -- 2. ASISTENTES DEMO (para reseñas / recomendaciones)
  -- ===================================================
  INSERT INTO usuarios (id, correo_electronico, nombre_completo, rol, telefono, ubicacion)
  VALUES (gen_random_uuid(), 'maria.demo@eventhub.com', 'María González', 'asistente', '+57 301 222 3344', 'Bogotá')
  ON CONFLICT (correo_electronico) DO UPDATE SET nombre_completo = EXCLUDED.nombre_completo
  RETURNING id INTO v_att1;

  INSERT INTO usuarios (id, correo_electronico, nombre_completo, rol, telefono, ubicacion)
  VALUES (gen_random_uuid(), 'carlos.demo@eventhub.com', 'Carlos Ruiz', 'asistente', '+57 302 555 6677', 'Medellín')
  ON CONFLICT (correo_electronico) DO UPDATE SET nombre_completo = EXCLUDED.nombre_completo
  RETURNING id INTO v_att2;

  INSERT INTO usuarios (id, correo_electronico, nombre_completo, rol, telefono, ubicacion)
  VALUES (gen_random_uuid(), 'ana.demo@eventhub.com', 'Ana López', 'asistente', '+57 304 888 9900', 'Cali')
  ON CONFLICT (correo_electronico) DO UPDATE SET nombre_completo = EXCLUDED.nombre_completo
  RETURNING id INTO v_att3;

  INSERT INTO usuarios (id, correo_electronico, nombre_completo, rol, telefono, ubicacion)
  VALUES (gen_random_uuid(), 'julian.demo@eventhub.com', 'Julián Castro', 'asistente', '+57 305 111 2233', 'Barranquilla')
  ON CONFLICT (correo_electronico) DO UPDATE SET nombre_completo = EXCLUDED.nombre_completo
  RETURNING id INTO v_att4;

  -- ===================================================
  -- 3. LIMPIEZA IDEMPOTENTE (borra el seed previo por título)
  --    El ON DELETE CASCADE elimina entradas, analíticas,
  --    reseñas y promos asociadas.
  -- ===================================================
  DELETE FROM eventos WHERE titulo IN (
    'Festival Estéreo Picnic 2026',
    'Rock al Parque',
    'Feria de las Flores · Desfile de Silleteros',
    'Carnaval de Barranquilla',
    'Colombia 4.0 · Cumbre de Tecnología',
    'Festival Gastronómico Sabor Caribe',
    'Clásico Capitalino: Millonarios vs Nacional',
    'Festival de Jazz de Cali',
    'Expo Café de Colombia',
    'Concierto Sinfónico bajo las Estrellas'
  );

  -- ===================================================
  -- 4. EVENTOS
  -- ===================================================
  INSERT INTO eventos
    (id, titulo, descripcion, url_imagen, fecha_evento, hora_evento, ubicacion, categoria,
     maximo_asistentes, asistentes_actuales, id_organizador, nombre_organizador, estado, etiquetas)
  VALUES
    (e1, 'Festival Estéreo Picnic 2026',
     'Tres días del mejor line-up internacional de rock, pop y electrónica en el Parque Simón Bolívar. Una experiencia inolvidable bajo el cielo bogotano.',
     'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=900&q=80',
     '2026-08-21', '14:00', 'Bogotá · Parque Simón Bolívar', 'Festivales',
     12000, 8450, v_org, v_org_nombre, 'publicado', ARRAY['rock','electrónica','internacional']),

    (e2, 'Rock al Parque',
     'El festival de rock gratuito más grande de Latinoamérica regresa con bandas nacionales e invitados especiales.',
     'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=900&q=80',
     '2026-10-17', '12:00', 'Bogotá · Parque Simón Bolívar', 'Conciertos',
     40000, 21300, v_org, v_org_nombre, 'publicado', ARRAY['rock','gratis','nacional']),

    (e3, 'Feria de las Flores · Desfile de Silleteros',
     'La tradición paisa en su máxima expresión. Vive el desfile de silleteros más emblemático de Colombia.',
     'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=900&q=80',
     '2026-08-07', '09:00', 'Medellín · Av. Guayabal', 'Arte y Cultura',
     8000, 5600, v_org, v_org_nombre, 'publicado', ARRAY['tradición','paisa','cultura']),

    (e4, 'Carnaval de Barranquilla',
     'Quien lo vive es quien lo goza. La fiesta folclórica más colorida del país: cumbia, garabato y mucha alegría.',
     'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=900&q=80',
     '2026-02-14', '10:00', 'Barranquilla · Vía 40', 'Festivales',
     15000, 9800, v_org, v_org_nombre, 'publicado', ARRAY['carnaval','folclor','caribe']),

    (e5, 'Colombia 4.0 · Cumbre de Tecnología',
     'El evento de innovación, IA y desarrollo digital más importante del país. Charlas, talleres y networking.',
     'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=900&q=80',
     '2026-09-10', '08:30', 'Bogotá · Ágora Centro de Convenciones', 'Tecnología',
     3000, 1740, v_org, v_org_nombre, 'publicado', ARRAY['tech','IA','innovación']),

    (e6, 'Festival Gastronómico Sabor Caribe',
     'Un recorrido por los sabores del Caribe colombiano con chefs invitados, food trucks y maridajes.',
     'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80',
     '2026-11-22', '11:00', 'Cartagena · Centro de Convenciones', 'Gastronomía',
     2500, 1320, v_org, v_org_nombre, 'publicado', ARRAY['gastronomía','caribe','chefs']),

    (e7, 'Clásico Capitalino: Millonarios vs Nacional',
     'El partido más esperado de la liga. Vive la pasión del fútbol colombiano en El Campín.',
     'https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=900&q=80',
     '2026-09-27', '17:30', 'Bogotá · Estadio El Campín', 'Deportes',
     36000, 28900, v_org, v_org_nombre, 'publicado', ARRAY['fútbol','clásico','liga']),

    (e8, 'Festival de Jazz de Cali',
     'Noches de jazz con músicos nacionales e internacionales en el corazón de la sucursal del cielo.',
     'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80',
     '2026-07-18', '19:00', 'Cali · Teatro Jorge Isaacs', 'Música',
     1200, 760, v_org, v_org_nombre, 'publicado', ARRAY['jazz','música','en vivo']),

    (e9, 'Expo Café de Colombia',
     'La feria del mejor café del mundo: catas, baristas, maquinaria y experiencias para amantes del grano.',
     'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=900&q=80',
     '2026-10-03', '10:00', 'Medellín · Plaza Mayor', 'Experiencias',
     5000, 2150, v_org, v_org_nombre, 'publicado', ARRAY['café','catas','experiencia']),

    (e10, 'Concierto Sinfónico bajo las Estrellas',
     'La Orquesta Filarmónica interpreta clásicos del cine y la música colombiana en un entorno mágico.',
     'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=900&q=80',
     '2026-12-05', '20:00', 'Villa de Leyva · Plaza Mayor', 'Música',
     2000, 1180, v_org, v_org_nombre, 'publicado', ARRAY['sinfónico','clásica','filarmónica']);

  -- ===================================================
  -- 5. TIPOS DE ENTRADA  (occupied = cantidad_maxima - cantidad_disponible)
  -- ===================================================
  INSERT INTO tipos_entrada
    (id_evento, nombre_tipo, precio, descripcion, cantidad_maxima, cantidad_disponible, nombre_evento)
  VALUES
    -- e1 Estéreo Picnic
    (e1, 'General 3 días', 650000, 'Acceso general a los 3 días del festival', 8000, 2100, 'Festival Estéreo Picnic 2026'),
    (e1, 'VIP', 1250000, 'Zona VIP con barras premium y baños exclusivos', 3000, 900, 'Festival Estéreo Picnic 2026'),
    (e1, 'Platino', 2100000, 'Front stage, lounge y catering incluido', 1000, 350, 'Festival Estéreo Picnic 2026'),
    -- e2 Rock al Parque (gratis)
    (e2, 'Entrada Gratuita', 0, 'Acceso libre por orden de llegada', 40000, 18700, 'Rock al Parque'),
    -- e3 Feria de las Flores
    (e3, 'Palco Preferencial', 180000, 'Silla numerada con vista al desfile', 5000, 1800, 'Feria de las Flores · Desfile de Silleteros'),
    (e3, 'General', 90000, 'Zona general de pie', 3000, 600, 'Feria de las Flores · Desfile de Silleteros'),
    -- e4 Carnaval
    (e4, 'Palco Vía 40', 320000, 'Palco techado en primera fila', 6000, 2400, 'Carnaval de Barranquilla'),
    (e4, 'General', 120000, 'Acceso general a la zona del desfile', 9000, 2800, 'Carnaval de Barranquilla'),
    -- e5 Colombia 4.0
    (e5, 'Profesional', 220000, 'Acceso a todas las charlas y talleres', 2000, 760, 'Colombia 4.0 · Cumbre de Tecnología'),
    (e5, 'Estudiante', 90000, 'Tarifa especial con carné estudiantil', 1000, 500, 'Colombia 4.0 · Cumbre de Tecnología'),
    -- e6 Sabor Caribe
    (e6, 'Pase Degustación', 150000, 'Incluye 10 tickets de degustación', 1800, 880, 'Festival Gastronómico Sabor Caribe'),
    (e6, 'Pase Gourmet', 290000, 'Degustación ilimitada + clase con chef', 700, 300, 'Festival Gastronómico Sabor Caribe'),
    -- e7 Clásico
    (e7, 'Tribuna Occidental', 95000, 'Tribuna cubierta lateral', 12000, 3200, 'Clásico Capitalino: Millonarios vs Nacional'),
    (e7, 'Tribuna Oriental', 75000, 'Tribuna general', 16000, 2900, 'Clásico Capitalino: Millonarios vs Nacional'),
    (e7, 'Palco VIP', 280000, 'Palco con servicio incluido', 2000, 1000, 'Clásico Capitalino: Millonarios vs Nacional'),
    -- e8 Jazz Cali
    (e8, 'Platea', 140000, 'Sillas de platea central', 700, 280, 'Festival de Jazz de Cali'),
    (e8, 'Balcón', 90000, 'Balcón superior', 500, 160, 'Festival de Jazz de Cali'),
    -- e9 Expo Café
    (e9, 'Entrada General', 45000, 'Acceso a la feria y zona de catas', 4000, 1900, 'Expo Café de Colombia'),
    (e9, 'Pase Barista', 120000, 'Talleres de barismo certificados', 1000, 450, 'Expo Café de Colombia'),
    -- e10 Sinfónico
    (e10, 'Palco', 210000, 'Palco con la mejor acústica', 800, 320, 'Concierto Sinfónico bajo las Estrellas'),
    (e10, 'General', 110000, 'Zona general con manta de cortesía', 1200, 500, 'Concierto Sinfónico bajo las Estrellas');

  -- ===================================================
  -- 6. ANALÍTICAS POR EVENTO (dashboard de Reportes/Finanzas)
  -- ===================================================
  -- NOTA: ingresos_totales y monto_reembolsos son NUMERIC(10,2) (máx ~99.999.999),
  -- por eso los montos van topados bajo ese límite (no caben miles de millones de COP).
  INSERT INTO analiticas_eventos
    (id_evento, total_visualizaciones, total_ventas, ingresos_totales, tasa_conversion,
     precio_promedio_entrada, tasa_asistencia, reembolsos, monto_reembolsos)
  VALUES
    (e1, 48200, 8450, 99000000, 17.5, 820000, 0,  120, 7800000),
    (e2, 95300, 21300, 0,        22.3, 0,      0,  0,   0),
    (e3, 18700, 5600, 72000000, 29.9, 142000, 0,  30, 5400000),
    (e4, 33100, 9800, 95000000, 29.6, 205000, 0,  85, 19500000),
    (e5, 12400, 1740, 30500000, 14.0, 175000, 0,  12, 2640000),
    (e6, 9800,  1320, 24000000, 13.5, 198000, 0,  9,  2100000),
    (e7, 71200, 28900, 98500000, 40.6, 110000, 0, 140, 12500000),
    (e8, 6500,  760,  9200000,  11.7, 121000, 0,  6,  840000),
    (e9, 14300, 2150, 12800000, 15.0, 60000,  0,  18, 980000),
    (e10, 8900, 1180, 17500000, 13.3, 148000, 0,  7,  1050000);

  -- ===================================================
  -- 7. RESEÑAS / CALIFICACIONES (recomendaciones y social proof)
  -- ===================================================
  INSERT INTO calificaciones_eventos
    (id_evento, id_usuario, calificacion, comentario, recomendaria, categoria_calificacion, fecha_evento_asistido)
  VALUES
    (e1, v_att1, 5, '¡El mejor festival al que he ido! Producción de primer nivel.', TRUE, 'Festivales', '2025-08-22'),
    (e1, v_att2, 4, 'Increíble line-up, aunque las filas de comida fueron largas.', TRUE, 'Festivales', '2025-08-22'),
    (e2, v_att3, 5, 'Gratis y con un nivel altísimo. Orgullo nacional.', TRUE, 'Conciertos', '2025-10-18'),
    (e3, v_att4, 5, 'Una tradición que todo colombiano debe vivir al menos una vez.', TRUE, 'Arte y Cultura', '2025-08-07'),
    (e4, v_att1, 5, 'La energía del carnaval es indescriptible. ¡Volvería mil veces!', TRUE, 'Festivales', '2025-02-15'),
    (e5, v_att2, 4, 'Charlas muy buenas sobre IA. El networking valió la pena.', TRUE, 'Tecnología', '2025-09-11'),
    (e7, v_att3, 4, 'Ambiente espectacular en El Campín. Gran organización.', TRUE, 'Deportes', '2025-09-28'),
    (e8, v_att4, 5, 'Noche mágica de jazz. El teatro tiene una acústica perfecta.', TRUE, 'Música', '2025-07-19'),
    (e9, v_att1, 5, 'Aprendí muchísimo en los talleres de barismo. Recomendadísimo.', TRUE, 'Experiencias', '2025-10-04'),
    (e10, v_att2, 5, 'La filarmónica bajo las estrellas fue una experiencia única.', TRUE, 'Música', '2025-12-06');

  -- ===================================================
  -- 8. CÓDIGOS PROMOCIONALES (panel de promociones del organizador)
  -- ===================================================
  INSERT INTO codigos_promocionales
    (codigo, descripcion, tipo_descuento, valor_descuento, fecha_inicio, fecha_fin,
     uso_maximo, usos_actuales, id_evento, id_organizador, activo)
  VALUES
    ('EARLYBIRD25', 'Preventa: 25% de descuento',  'porcentaje', 25, NOW() - INTERVAL '10 days', NOW() + INTERVAL '30 days', 500, 213, e1, v_org, TRUE),
    ('JAZZ2X1',     '50% en entradas de balcón',   'porcentaje', 50, NOW() - INTERVAL '5 days',  NOW() + INTERVAL '20 days', 200, 64,  e8, v_org, TRUE),
    ('CAFE10',      '10% de descuento en Expo Café','porcentaje', 10, NOW(),                     NOW() + INTERVAL '45 days', 1000, 120, e9, v_org, TRUE),
    ('TECHSTUDENT', '15% para estudiantes',        'porcentaje', 15, NOW(),                     NOW() + INTERVAL '25 days', 300, 88,  e5, v_org, TRUE);

  -- ===================================================
  -- 9. SEGUIDORES DEL ORGANIZADOR (funciones sociales)
  -- ===================================================
  INSERT INTO seguidores_organizadores (id_usuario_seguidor, id_organizador)
  VALUES
    (v_att1, v_org),
    (v_att2, v_org),
    (v_att3, v_org),
    (v_att4, v_org)
  ON CONFLICT (id_usuario_seguidor, id_organizador) DO NOTHING;

  -- ===================================================
  -- 10. MÉTODOS DE PAGO DEL ORGANIZADOR
  -- ===================================================
  DELETE FROM metodos_pago WHERE id_organizador = v_org AND nombre IN ('Tarjeta de Crédito/Débito','PSE','Nequi');

  INSERT INTO metodos_pago
    (nombre, tipo, proveedor, descripcion, activo, comision_porcentaje, comision_fija,
     monto_minimo, monto_maximo, monedas_soportadas, requiere_verificacion, tiempo_procesamiento, id_organizador)
  VALUES
    ('Tarjeta de Crédito/Débito', 'credit_card', 'Wompi', 'Visa, Mastercard, Amex', TRUE, 2.99, 900, 1000, 20000000, ARRAY['COP'], FALSE, 'Inmediato', v_org),
    ('PSE', 'bank_transfer', 'Wompi', 'Débito desde cuenta bancaria', TRUE, 1.50, 1200, 5000, 20000000, ARRAY['COP'], FALSE, 'Inmediato', v_org),
    ('Nequi', 'digital_wallet', 'Nequi', 'Pago desde la app Nequi', TRUE, 1.80, 0, 1000, 5000000, ARRAY['COP'], FALSE, 'Inmediato', v_org);

  RAISE NOTICE 'Seed completado: 10 eventos, % entradas, analíticas, reseñas, promos y métodos de pago para el organizador %', 21, v_org_nombre;
END $$;

-- =====================================================
-- VERIFICACIÓN RÁPIDA (opcional)
-- =====================================================
-- SELECT titulo, categoria, ubicacion, fecha_evento, estado FROM eventos ORDER BY fecha_evento;
-- SELECT e.titulo, COUNT(te.id) AS tipos_entrada
--   FROM eventos e LEFT JOIN tipos_entrada te ON te.id_evento = e.id
--   GROUP BY e.titulo ORDER BY 1;
