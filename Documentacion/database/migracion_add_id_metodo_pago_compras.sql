-- Migration: Add id_metodo_pago column to compras table for tracking payment method usage
-- Execute in Supabase SQL Editor before updating types/code

ALTER TABLE public.compras
  ADD COLUMN IF NOT EXISTS id_metodo_pago uuid REFERENCES public.metodos_pago(id) ON DELETE SET NULL;

-- Index for fast filtering by payment method
CREATE INDEX IF NOT EXISTS idx_compras_id_metodo_pago ON public.compras(id_metodo_pago);

-- Note: Regenerate types locally after applying (supabase gen types or manual update)
