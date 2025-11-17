// Agregar este componente temporalmente en tu aplicación para hacer debug
// Por ejemplo, puedes agregarlo en OrganizerDashboard.page.tsx

import { supabase } from '@shared/lib/api/supabase';

// Función de debug - agregar esta función en tu componente
const debugSupabaseConnection = async () => {
  console.log('🔍 === DIAGNÓSTICO SUPABASE ===');
  
  try {
    // 1. Verificar configuración
    console.log('📋 1. Verificando configuración...');
    console.log('✅ Cliente Supabase cargado correctamente');
    
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
    
    // 4. Probar eliminación en el último método (preguntamos primero)
    const methodToTest = methods[methods.length - 1];
    console.log('🗑️ 4. Método seleccionado para prueba:', methodToTest);
    
    // Preguntar confirmación
    const userConfirms = window.confirm(`¿Quieres eliminar "${methodToTest.nombre}"? (Esto es una prueba real)`);
    
    if (!userConfirms) {
      console.log('⏸️ Eliminación cancelada por el usuario');
      return;
    }
    
    // Intentar eliminación
    console.log('🗑️ Procediendo con eliminación...');
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

// Hacer la función disponible globalmente para poder llamarla desde la consola
if (typeof window !== 'undefined') {
  window.debugSupabaseConnection = debugSupabaseConnection;
}