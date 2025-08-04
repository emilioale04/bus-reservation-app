import { createInvoicesBucket } from '../src/services/invoiceService.js';

async function initializeSupabase() {
  try {
    console.log('🔧 Inicializando configuración de Supabase...');
    
    // Crear bucket de facturas
    await createInvoicesBucket();
    
    console.log('✅ Configuración completada exitosamente');
    console.log('');
    console.log('📋 Pasos completados:');
    console.log('  - ✅ Bucket "invoices" creado/verificado');
    console.log('  - ✅ Permisos configurados para archivos públicos');
    console.log('');
    console.log('🚀 El sistema está listo para funcionar');
    
  } catch (error) {
    console.error('❌ Error en la inicialización:', error);
    console.log('');
    console.log('🔍 Verifique:');
    console.log('  - Las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY');
    console.log('  - Que tenga permisos de administrador en Supabase');
    console.log('  - La conectividad a internet');
    process.exit(1);
  }
}

initializeSupabase();
