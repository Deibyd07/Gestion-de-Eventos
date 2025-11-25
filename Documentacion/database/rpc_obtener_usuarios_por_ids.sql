-- RPC: obtener_usuarios_por_ids
-- Devuelve datos básicos de usuarios por lista CSV de IDs (bypass RLS)
DROP FUNCTION IF EXISTS obtener_usuarios_por_ids(text);
CREATE OR REPLACE FUNCTION obtener_usuarios_por_ids(p_user_ids text)
RETURNS TABLE (
  id uuid,
  nombre_completo text,
  correo_electronico text,
  url_avatar text,
  rol text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id_array text[];
BEGIN
  user_id_array := string_to_array(p_user_ids, ',');
  RETURN QUERY
  SELECT 
    u.id, 
    u.nombre_completo::text, 
    u.correo_electronico::text, 
    COALESCE(u.url_avatar, '')::text AS url_avatar, 
    u.rol::text
  FROM usuarios u
  WHERE u.id = ANY(ARRAY(SELECT unnest(user_id_array)::uuid));
END;
$$;
GRANT EXECUTE ON FUNCTION obtener_usuarios_por_ids(text) TO authenticated;
GRANT EXECUTE ON FUNCTION obtener_usuarios_por_ids(text) TO anon;
COMMENT ON FUNCTION obtener_usuarios_por_ids(text) IS 'Devuelve id, nombre, correo, avatar y rol para múltiples usuarios (CSV) con SECURITY DEFINER.';
