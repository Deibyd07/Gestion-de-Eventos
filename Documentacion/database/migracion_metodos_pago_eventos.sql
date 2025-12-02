-- Migration: Crear tabla de asociación métodos de pago <-> eventos
-- Dependencias: tabla eventos, tabla metodos_pago

-- 1. Crear tabla de asociación (muchos a muchos posible)
CREATE TABLE IF NOT EXISTS public.metodos_pago_eventos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_evento uuid NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
  id_metodo_pago uuid NOT NULL REFERENCES public.metodos_pago(id) ON DELETE CASCADE,
  fecha_creacion timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id_evento, id_metodo_pago)
);

-- 2. Indexes para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_metodos_pago_eventos_evento ON public.metodos_pago_eventos(id_evento);
CREATE INDEX IF NOT EXISTS idx_metodos_pago_eventos_metodo ON public.metodos_pago_eventos(id_metodo_pago);

-- 3. RLS Policies (ajustar según modelo de autenticación)
ALTER TABLE public.metodos_pago_eventos ENABLE ROW LEVEL SECURITY;

-- Política: organizador puede ver asociaciones de sus eventos
CREATE POLICY "select_metodos_pago_eventos" ON public.metodos_pago_eventos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.eventos e
      WHERE e.id = metodos_pago_eventos.id_evento
        AND e.id_organizador = auth.uid()
    )
  );

-- Política: organizador puede insertar asociación si el método de pago es suyo y el evento es suyo
CREATE POLICY "insert_metodos_pago_eventos" ON public.metodos_pago_eventos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.eventos e
      WHERE e.id = metodos_pago_eventos.id_evento
        AND e.id_organizador = auth.uid()
    ) AND EXISTS (
      SELECT 1 FROM public.metodos_pago m
      WHERE m.id = metodos_pago_eventos.id_metodo_pago
        AND m.id_organizador = auth.uid()
    )
  );

-- Política: organizador puede borrar asociación si pertenece a su evento
CREATE POLICY "delete_metodos_pago_eventos" ON public.metodos_pago_eventos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.eventos e
      WHERE e.id = metodos_pago_eventos.id_evento
        AND e.id_organizador = auth.uid()
    )
  );

-- 4. (Opcional) Vista para facilitar obtención de métodos por evento
CREATE OR REPLACE VIEW public.v_metodos_pago_por_evento AS
SELECT mpe.id_evento,
       m.*
FROM public.metodos_pago_eventos mpe
JOIN public.metodos_pago m ON m.id = mpe.id_metodo_pago;

-- 5. Nota: actualizar tipos de Supabase luego de aplicar migración.
