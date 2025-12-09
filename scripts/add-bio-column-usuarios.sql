-- Agrega columna bio a la tabla usuarios para guardar biografía de organizadores/usuarios
ALTER TABLE public.usuarios
ADD COLUMN IF NOT EXISTS bio text;

-- Opcional: valor por defecto vacío
ALTER TABLE public.usuarios
ALTER COLUMN bio SET DEFAULT '';