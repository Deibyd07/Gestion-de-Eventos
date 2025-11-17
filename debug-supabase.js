// Script de diagnóstico para Supabase - Ejecutar en la consola del navegador
// Copia y pega este código completo en la consola del navegador (F12 -> Console)

const debugSupabase = async () => {
  console.log('🔍 === DIAGNÓSTICO SUPABASE ===');
  
  try {
    // 1. Verificar configuración
    console.log('📋 1. Verificando configuración...');
    
    // Verificar si supabase está disponible globalmente
    if (typeof supabase === 'undefined') {
      console.error('❌ La variable supabase no está disponible globalmente');
      console.log('💡 Asegúrate de estar en la página de tu aplicación React');
      return;
    }
    
    console.log('✅ Cliente Supabase encontrado');
    console.log('Supabase URL:', supabase.supabaseUrl);
    console.log('API Key (primeros 20 chars):', supabase.supabaseKey.substring(0, 20) + '...');
    
    // 2. Probar conexión básica
    console.log('🔗 2. Probando conexión básica...');
    const { data: testConnection, error: connectionError } = await supabase
      .from('metodos_pago')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Error de conexión:', connectionError);
      return;
    }
    console.log('✅ Conexión exitosa');
    
    // 3. Listar métodos de pago existentes
    console.log('📊 3. Listando métodos de pago...');
    const { data: methods, error: listError } = await supabase
      .from('metodos_pago')
      .select('id, nombre, id_organizador')
      .limit(5);
    
    if (listError) {
      console.error('❌ Error al listar:', listError);
      return;
    }
    
    console.log('✅ Métodos encontrados:', methods?.length || 0);
    console.table(methods);
    
    if (!methods || methods.length === 0) {
      console.log('⚠️ No hay métodos de pago para probar eliminación');
      return;
    }
    
    // 4. Probar eliminación en el último método
    const methodToTest = methods[methods.length - 1];
    console.log('🗑️ 4. Probando eliminación del método:', methodToTest);
    
    // Confirmar antes de eliminar
    const confirmDelete = confirm(`¿Eliminar el método "${methodToTest.nombre}"? (Esto es una prueba real)`);
    
    if (!confirmDelete) {
      console.log('⏸️ Eliminación cancelada por el usuario');
      return;
    }
    
    // Intentar eliminación
    const { data: deleteResult, error: deleteError, count } = await supabase
      .from('metodos_pago')
      .delete({ count: 'exact' })
      .eq('id', methodToTest.id);
    
    if (deleteError) {
      console.error('❌ Error en eliminación:', deleteError);
      console.error('Detalles completos del error:', {
        message: deleteError.message,
        details: deleteError.details,
        hint: deleteError.hint,
        code: deleteError.code
      });
      return;
    }
    
    console.log('✅ ELIMINACIÓN EXITOSA!');
    console.log('Registros eliminados:', count);
    console.log('Resultado:', deleteResult);
    
    // 5. Verificar que se eliminó
    console.log('🔍 5. Verificando eliminación...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('metodos_pago')
      .select('id')
      .eq('id', methodToTest.id);
    
    if (verifyError) {
      console.error('❌ Error en verificación:', verifyError);
      return;
    }
    
    if (verifyData && verifyData.length === 0) {
      console.log('✅ Verificación exitosa: El método fue eliminado correctamente');
    } else {
      console.log('⚠️ El método aún existe en la base de datos');
    }
    
  } catch (error) {
    console.error('💥 Error general:', error);
  }
  
  console.log('🏁 === FIN DEL DIAGNÓSTICO ===');
};

// Ejecutar el diagnóstico
debugSupabase();