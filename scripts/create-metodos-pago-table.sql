-- Crear tabla de métodos de pago
CREATE TABLE public.metodos_pago (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    nombre text NOT NULL,
    tipo character varying NOT NULL CHECK (tipo::text = ANY (ARRAY['credit_card'::character varying, 'debit_card'::character varying, 'digital_wallet'::character varying, 'bank_transfer'::character varying, 'cash'::character varying, 'crypto'::character varying]::text[])),
    proveedor text NOT NULL,
    descripcion text NOT NULL,
    activo boolean DEFAULT true,
    comision_porcentaje numeric DEFAULT 0.00 CHECK (comision_porcentaje >= 0::numeric AND comision_porcentaje <= 100::numeric),
    comision_fija numeric DEFAULT NULL CHECK (comision_fija IS NULL OR comision_fija >= 0::numeric),
    monto_minimo numeric DEFAULT NULL CHECK (monto_minimo IS NULL OR monto_minimo >= 0::numeric),
    monto_maximo numeric DEFAULT NULL CHECK (monto_maximo IS NULL OR monto_maximo >= 0::numeric),
    monedas_soportadas text[] DEFAULT ARRAY['COP'::text],
    requiere_verificacion boolean DEFAULT false,
    tiempo_procesamiento text NOT NULL DEFAULT 'Inmediato'::text,
    configuracion jsonb DEFAULT '{}'::jsonb,
    id_organizador uuid NOT NULL,
    fecha_creacion timestamp with time zone DEFAULT now(),
    fecha_actualizacion timestamp with time zone DEFAULT now(),
    CONSTRAINT metodos_pago_pkey PRIMARY KEY (id),
    CONSTRAINT metodos_pago_id_organizador_fkey FOREIGN KEY (id_organizador) REFERENCES public.usuarios(id),
    CONSTRAINT metodos_pago_montos_validos CHECK (monto_minimo IS NULL OR monto_maximo IS NULL OR monto_minimo <= monto_maximo)
);

-- Crear índices para mejor performance
CREATE INDEX idx_metodos_pago_organizador ON public.metodos_pago(id_organizador);
CREATE INDEX idx_metodos_pago_activo ON public.metodos_pago(activo);
CREATE INDEX idx_metodos_pago_tipo ON public.metodos_pago(tipo);

-- Crear trigger para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION update_fecha_actualizacion_metodos_pago()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_metodos_pago_fecha_actualizacion
    BEFORE UPDATE ON public.metodos_pago
    FOR EACH ROW
    EXECUTE PROCEDURE update_fecha_actualizacion_metodos_pago();

-- Deshabilitar RLS ya que usamos autenticación manual
-- Para mayor seguridad en producción, considera implementar RLS con context
ALTER TABLE public.metodos_pago DISABLE ROW LEVEL SECURITY;

-- Otorgar permisos completos a los roles de API (Legacy Keys)
GRANT ALL ON public.metodos_pago TO anon;
GRANT ALL ON public.metodos_pago TO authenticated;
GRANT ALL ON public.metodos_pago TO service_role;

-- Verificar que los permisos se aplicaron correctamente
DO $$
BEGIN
    RAISE NOTICE 'Permisos otorgados correctamente para metodos_pago';
    RAISE NOTICE 'RLS deshabilitado - usando autenticación manual';
END $$;

-- Insertar algunos métodos de pago de ejemplo (opcional)
-- INSERT INTO public.metodos_pago (nombre, tipo, proveedor, descripcion, id_organizador) VALUES
-- ('Tarjetas Visa/Mastercard', 'credit_card', 'Stripe', 'Acepta tarjetas de crédito y débito principales', 'tu-user-id-aqui'),
-- ('PayPal', 'digital_wallet', 'PayPal', 'Pagos a través de PayPal', 'tu-user-id-aqui');