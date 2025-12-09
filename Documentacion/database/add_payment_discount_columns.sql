    -- =====================================================
    -- Añadir columnas de método de pago y código de descuento a compras
    -- =====================================================

    -- Añadir columna método_pago
    ALTER TABLE compras 
    ADD COLUMN IF NOT EXISTS metodo_pago TEXT DEFAULT 'tarjeta';

    -- Añadir columna código_descuento
    ALTER TABLE compras 
    ADD COLUMN IF NOT EXISTS codigo_descuento TEXT;

    -- Añadir columna descuento_aplicado
    ALTER TABLE compras 
    ADD COLUMN IF NOT EXISTS descuento_aplicado NUMERIC(10,2) DEFAULT 0;

    -- Añadir columna estado_pago
    ALTER TABLE compras 
    ADD COLUMN IF NOT EXISTS estado_pago TEXT DEFAULT 'completado';

    -- Añadir columna id_transaccion
    ALTER TABLE compras 
    ADD COLUMN IF NOT EXISTS id_transaccion TEXT;

    -- Crear índice para búsquedas por método de pago
    CREATE INDEX IF NOT EXISTS idx_compras_metodo_pago ON compras(metodo_pago);

    -- Crear índice para búsquedas por código de descuento
    CREATE INDEX IF NOT EXISTS idx_compras_codigo_descuento ON compras(codigo_descuento);

    -- Comentarios
    COMMENT ON COLUMN compras.metodo_pago IS 'Método de pago utilizado: tarjeta, efectivo, transferencia, etc.';
    COMMENT ON COLUMN compras.codigo_descuento IS 'Código de descuento aplicado a la compra';
    COMMENT ON COLUMN compras.descuento_aplicado IS 'Monto del descuento aplicado en la compra';
    COMMENT ON COLUMN compras.estado_pago IS 'Estado del pago: completado, pendiente, fallido, reembolsado';
    COMMENT ON COLUMN compras.id_transaccion IS 'ID de la transacción de pago del procesador (ej: PayPal, Stripe, etc.)';
