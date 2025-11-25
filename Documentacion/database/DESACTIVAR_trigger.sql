-- Desactivar trigger temporalmente para diagnosticar
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Ahora intenta crear un usuario
-- Si funciona, el problema es el trigger
-- Si sigue fallando, el problema es otra configuracion de Supabase
