-- Migration: Add id_evento column to metodos_pago for direct event association
-- Ejecutar en Supabase antes de usar filtrado por evento

ALTER TABLE public.metodos_pago
  ADD COLUMN IF NOT EXISTS id_evento uuid REFERENCES public.eventos(id) ON DELETE SET NULL;

-- Index para filtrado rápido por evento
CREATE INDEX IF NOT EXISTS idx_metodos_pago_id_evento ON public.metodos_pago(id_evento);

-- (Opcional) Política RLS si se requiere restringir visibilidad por organizador+evento
-- Ajustar según configuración actual de RLS:
-- Example (modificar según sus políticas existentes):
-- CREATE POLICY "select_metodos_pago_por_evento" ON public.metodos_pago
--   FOR SELECT USING (
--     id_organizador = auth.uid()
--   );

-- Nota: Regenerar tipos localmente después (supabase gen types ...)
