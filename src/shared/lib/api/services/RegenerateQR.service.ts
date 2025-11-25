import { supabase } from '../supabase';
import { QRCodeService, type QRTicketData } from '../../services/QRCode.service';
import { EventService } from './Event.service';
import { UserService } from './User.service';

/**
 * Servicio temporal para regenerar códigos QR de compras existentes
 */
export class RegenerateQRService {
  /**
   * Regenera códigos QR para todas las compras que no los tengan
   */
  static async regenerateAllMissingQRs(): Promise<{
    success: number;
    failed: number;
    details: string[];
  }> {
    const results = {
      success: 0,
      failed: 0,
      details: [] as string[]
    };

    try {
      console.log('🔄 Iniciando regeneración de códigos QR...');

      // Obtener todas las compras completadas
      const { data: compras, error: comprasError } = await supabase
        .from('compras')
        .select('*')
        .eq('estado', 'completada');

      if (comprasError) {
        throw comprasError;
      }

      if (!compras || compras.length === 0) {
        results.details.push('No hay compras completadas en el sistema');
        return results;
      }

      console.log(`📦 Encontradas ${compras.length} compras completadas`);

      for (const compra of compras) {
        try {
          // Verificar si ya tiene códigos QR
          const { data: qrsExistentes, error: qrError } = await supabase
            .from('codigos_qr_entradas')
            .select('id')
            .eq('id_compra', compra.id);

          if (qrError) {
            results.failed++;
            results.details.push(`❌ Error verificando QRs para compra ${compra.id}: ${qrError.message}`);
            continue;
          }

          const qrsEsperados = compra.cantidad;
          const qrsActuales = qrsExistentes?.length || 0;

          if (qrsActuales >= qrsEsperados) {
            console.log(`✓ Compra ${compra.id} ya tiene ${qrsActuales} QRs`);
            continue;
          }

          console.log(`🔨 Generando QRs para compra ${compra.id} (tiene ${qrsActuales}, necesita ${qrsEsperados})`);

          // Obtener datos del evento, usuario y tipo de entrada
          const [evento, usuario, tipoEntrada] = await Promise.all([
            EventService.obtenerEventoPorId(compra.id_evento),
            UserService.obtenerUsuarioPorId(compra.id_usuario),
            supabase.from('tipos_entrada').select('*').eq('id', compra.id_tipo_entrada).single()
          ]);

          if (!evento || !usuario) {
            results.failed++;
            results.details.push(`❌ No se encontraron datos completos para compra ${compra.id}`);
            continue;
          }

          // Generar QRs faltantes
          const qrPromises = [];
          for (let i = qrsActuales + 1; i <= qrsEsperados; i++) {
            const qrData: QRTicketData = {
              ticketId: `${compra.id}-${i}`,
              eventId: compra.id_evento,
              eventTitle: evento.titulo,
              userId: compra.id_usuario,
              userName: usuario.nombre_completo,
              userEmail: usuario.correo_electronico,
              purchaseId: compra.id,
              ticketNumber: i,
              ticketType: tipoEntrada.data?.nombre_tipo || 'General',
              price: compra.precio_unitario,
              eventDate: evento.fecha_evento,
              eventTime: evento.hora_evento,
              eventLocation: evento.ubicacion,
              purchaseDate: compra.fecha_creacion
            };

            qrPromises.push(QRCodeService.createQRTicket(qrData));
          }

          await Promise.all(qrPromises);
          results.success++;
          results.details.push(`✅ Generados ${qrsEsperados - qrsActuales} QRs para compra ${compra.id}`);

        } catch (error: any) {
          results.failed++;
          results.details.push(`❌ Error procesando compra ${compra.id}: ${error.message}`);
          console.error(`Error en compra ${compra.id}:`, error);
        }
      }

      console.log('🎉 Regeneración completada:', results);
      return results;

    } catch (error) {
      console.error('❌ Error en regeneración de QRs:', error);
      throw error;
    }
  }

  /**
   * Regenera QRs solo para un evento específico
   */
  static async regenerateQRsForEvent(eventId: string): Promise<{
    success: number;
    failed: number;
    details: string[];
  }> {
    const results = {
      success: 0,
      failed: 0,
      details: [] as string[]
    };

    try {
      console.log(`🔄 Regenerando QRs para evento ${eventId}...`);

      const { data: compras, error: comprasError } = await supabase
        .from('compras')
        .select('*')
        .eq('id_evento', eventId)
        .eq('estado', 'completada');

      if (comprasError) throw comprasError;

      if (!compras || compras.length === 0) {
        results.details.push(`No hay compras para el evento ${eventId}`);
        return results;
      }

      console.log(`📦 Encontradas ${compras.length} compras para el evento`);

      // Reutilizar la lógica del método principal
      for (const compra of compras) {
        try {
          const { data: qrsExistentes } = await supabase
            .from('codigos_qr_entradas')
            .select('id')
            .eq('id_compra', compra.id);

          const qrsEsperados = compra.cantidad;
          const qrsActuales = qrsExistentes?.length || 0;

          if (qrsActuales >= qrsEsperados) continue;

          const [evento, usuario, tipoEntrada] = await Promise.all([
            EventService.obtenerEventoPorId(compra.id_evento),
            UserService.obtenerUsuarioPorId(compra.id_usuario),
            supabase.from('tipos_entrada').select('*').eq('id', compra.id_tipo_entrada).single()
          ]);

          if (!evento || !usuario) {
            results.failed++;
            continue;
          }

          const qrPromises = [];
          for (let i = qrsActuales + 1; i <= qrsEsperados; i++) {
            const qrData: QRTicketData = {
              ticketId: `${compra.id}-${i}`,
              eventId: compra.id_evento,
              eventTitle: evento.titulo,
              userId: compra.id_usuario,
              userName: usuario.nombre_completo,
              userEmail: usuario.correo_electronico,
              purchaseId: compra.id,
              ticketNumber: i,
              ticketType: tipoEntrada.data?.nombre_tipo || 'General',
              price: compra.precio_unitario,
              eventDate: evento.fecha_evento,
              eventTime: evento.hora_evento,
              eventLocation: evento.ubicacion,
              purchaseDate: compra.fecha_creacion
            };

            qrPromises.push(QRCodeService.createQRTicket(qrData));
          }

          await Promise.all(qrPromises);
          results.success++;
          results.details.push(`✅ Generados QRs para compra ${compra.id}`);

        } catch (error: any) {
          results.failed++;
          results.details.push(`❌ Error: ${error.message}`);
        }
      }

      return results;

    } catch (error) {
      console.error('❌ Error regenerando QRs para evento:', error);
      throw error;
    }
  }
}
