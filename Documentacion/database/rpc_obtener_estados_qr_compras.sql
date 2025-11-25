-- Función RPC para obtener estados de QR por IDs de compra
-- Esta función permite consultar el estado de los códigos QR sin necesidad de autenticación
-- Útil para cuando las políticas RLS bloquean los SELECTs normales

-- Eliminar función existente si existe
DROP FUNCTION IF EXISTS obtener_estados_qr_compras(text);

-- Crear la función con SECURITY DEFINER para bypass RLS
CREATE OR REPLACE FUNCTION obtener_estados_qr_compras(p_compra_ids text)
RETURNS TABLE (
  id_compra uuid,
  estado text,
  fecha_escaneado timestamptz,
  codigo_qr text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  compra_id_array text[];
  compra_uuid uuid;
BEGIN
  -- Convertir CSV a array
  compra_id_array := string_to_array(p_compra_ids, ',');
  
  -- Retornar los estados de los códigos QR con el código QR real
  RETURN QUERY
  SELECT 
    qr.id_compra,
    qr.estado::text,
    qr.fecha_escaneado,
    qr.codigo_qr
  FROM codigos_qr_entradas qr
  WHERE qr.id_compra = ANY(
    ARRAY(
      SELECT unnest(compra_id_array)::uuid
    )
  )
  ORDER BY qr.fecha_generacion DESC;
  
  RETURN;
END;
$$;

-- Otorgar permisos de ejecución a usuarios autenticados y anónimos
GRANT EXECUTE ON FUNCTION obtener_estados_qr_compras(text) TO authenticated;
GRANT EXECUTE ON FUNCTION obtener_estados_qr_compras(text) TO anon;

-- Comentario
COMMENT ON FUNCTION obtener_estados_qr_compras(text) IS 
'Obtiene el estado, fecha de escaneo y código QR real de múltiples códigos QR por IDs de compra (CSV). 
Usa SECURITY DEFINER para bypass RLS cuando el sistema no usa Supabase Auth.';
