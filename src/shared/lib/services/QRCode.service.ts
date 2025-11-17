import QRCode from 'qrcode';
import { supabase } from '../api/supabase';
import crypto from 'crypto-js';

export interface QRTicketData {
  ticketId: string;
  eventId: string;
  eventTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  purchaseId: string;
  ticketNumber: number;
  ticketType: string;
  price: number;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  purchaseDate: string;
}

export class QRCodeService {
  /**
   * Genera un código único y seguro para el QR
   */
  private static generateSecureCode(purchaseId: string, ticketNumber: number): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const data = `${purchaseId}-${ticketNumber}-${timestamp}-${random}`;
    
    // Generar hash SHA256
    const hash = crypto.SHA256(data).toString();
    return hash;
  }

  /**
   * Genera el contenido para el código QR
   * Opción 1: URL directa a la página de consulta (recomendado para escaneo fácil)
   * Opción 2: JSON con datos (para validación organizador)
   */
  private static generateQRContent(data: QRTicketData, secureCode: string, useUrl: boolean = true): string {
    if (useUrl) {
      // Generar URL para que cualquiera pueda escanear y ver la entrada
      const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
      return `${baseUrl}/consultar-entrada?code=${secureCode}`;
    } else {
      // Formato JSON tradicional (para validación manual)
      const qrData = {
        code: secureCode,
        ticketId: data.ticketId,
        eventId: data.eventId,
        userId: data.userId,
        ticketNumber: data.ticketNumber,
        timestamp: Date.now(),
        version: '1.0'
      };
      return JSON.stringify(qrData);
    }
  }

  /**
   * Genera la imagen del código QR en formato Data URL (base64)
   */
  static async generateQRImage(data: QRTicketData, secureCode: string): Promise<string> {
    try {
      // Generar URL para que sea escaneable por cualquier persona
      const qrContent = this.generateQRContent(data, secureCode, true);
      
      // Opciones para el QR
      const options = {
        errorCorrectionLevel: 'H' as const,
        type: 'image/png' as const,
        quality: 1,
        margin: 2,
        width: 400,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      };

      // Generar QR como Data URL
      const qrDataUrl = await QRCode.toDataURL(qrContent, options);
      return qrDataUrl;
    } catch (error) {
      console.error('Error generando código QR:', error);
      throw new Error('No se pudo generar el código QR');
    }
  }

  /**
   * Crea un registro de QR en la base de datos
   */
  static async createQRTicket(data: QRTicketData): Promise<{
    id: string;
    codigo_qr: string;
    qr_image: string;
  }> {
    try {
      const { data: authInfo } = await supabase.auth.getUser();
      const authUid = authInfo?.user?.id || null;
      const userEmail = authInfo?.user?.email || null;
      console.log('🔐 QRCodeService.createQRTicket - Auth info:', { authUid, userEmail });
      console.log('📝 QRCodeService.createQRTicket - Datos recibidos:', {
        ticketId: data.ticketId,
        ticketNumber: data.ticketNumber,
        purchaseId: data.purchaseId,
        eventId: data.eventId,
        userId: data.userId,
        eventTitle: data.eventTitle,
        userName: data.userName,
        userEmail: data.userEmail
      });

      // Verificar la compra antes de insertar (debug RLS)
      const { data: compraRow, error: compraErr } = await supabase
        .from('compras')
        .select('id,id_usuario,id_evento,cantidad')
        .eq('id', data.purchaseId)
        .single();
      if (compraErr) {
        console.warn('⚠️ No se pudo leer compra para verificación RLS:', compraErr);
      } else {
        console.log('🔍 Compra verificada:', compraRow);
        console.log('🔎 Comparación compra vs payload:', {
          compra_id: compraRow.id,
          compra_id_usuario: compraRow.id_usuario,
          compra_id_evento: compraRow.id_evento,
          payload_userId: data.userId,
          payload_eventId: data.eventId,
          coincide_usuario: compraRow.id_usuario === data.userId,
          coincide_evento: compraRow.id_evento === data.eventId
        });
      }
      // Generar código seguro
      const secureCode = this.generateSecureCode(data.purchaseId, data.ticketNumber);

      // Generar imagen QR
      const qrImage = await this.generateQRImage(data, secureCode);

      // Preparar datos para la BD
      const qrData = {
        id_compra: data.purchaseId,
        id_evento: data.eventId,
        // Usar el userId del payload (viene de compras.id_usuario que sí existe)
        id_usuario: data.userId,
        codigo_qr: secureCode,
        numero_entrada: data.ticketNumber,
        datos_qr: {
          ticket_id: data.ticketId,
          event_title: data.eventTitle,
          user_name: data.userName,
          user_email: data.userEmail,
          ticket_type: data.ticketType,
          price: data.price,
          event_date: data.eventDate,
          event_time: data.eventTime,
          event_location: data.eventLocation,
          purchase_date: data.purchaseDate,
          qr_image: qrImage
        }
      };

      console.log('💾 Datos a insertar en BD:', {
        id_compra: qrData.id_compra,
        id_evento: qrData.id_evento,
        id_usuario: qrData.id_usuario,
        codigo_qr: qrData.codigo_qr,
        numero_entrada: qrData.numero_entrada
      });

      // Insertar en la base de datos (sin RETURNING para evitar RLS SELECT)
      const { error } = await supabase
        .from('codigos_qr_entradas')
        .insert(qrData);

      if (error) {
        console.error('❌ Error insertando QR en BD:', error);
        console.error('🛡️ RLS debug:', {
          authUid,
          authEmail: userEmail,
          qrDataUserId: qrData.id_usuario,
          purchaseId: qrData.id_compra,
          eventId: qrData.id_evento
        });
        console.error('🧪 Condición esperada (compra coincide):', {
          compraExiste: !!compraRow,
          usuarioCoincide: compraRow?.id_usuario === qrData.id_usuario,
          eventoCoincide: compraRow?.id_evento === qrData.id_evento
        });
        throw error;
      }
      
      console.log('✅ QR insertado exitosamente (sin RETURNING).');

      return {
        id: `${data.purchaseId}-${data.ticketNumber}`,
        codigo_qr: secureCode,
        qr_image: qrImage
      };
    } catch (error) {
      console.error('Error creando ticket QR:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los códigos QR de una compra
   */
  static async getQRsByPurchase(purchaseId: string) {
    try {
      const { data, error } = await supabase
        .from('codigos_qr_entradas')
        .select('*')
        .eq('id_compra', purchaseId)
        .order('numero_entrada', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo QRs de compra:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los códigos QR de un usuario
   */
  static async getQRsByUser(userId: string) {
    try {
      const { data: authInfo } = await supabase.auth.getUser();
      const uid = authInfo?.user?.id || null;
      const userEmail = authInfo?.user?.email || null;

      // Primero intentar por uid directo
      let { data, error } = await supabase
        .from('codigos_qr_entradas')
        .select('*')
        .eq('id_usuario', uid || userId)
        .order('fecha_generacion', { ascending: false });

      // Si no hay resultados y tenemos email, buscar por email del usuario
      if ((!data || data.length === 0) && userEmail) {
        console.log('🔄 Buscando QRs por email:', userEmail);
        const { data: userData } = await supabase
          .from('usuarios')
          .select('id')
          .eq('correo_electronico', userEmail)
          .single();
        
        if (userData?.id) {
          const result = await supabase
            .from('codigos_qr_entradas')
            .select('*')
            .eq('id_usuario', userData.id)
            .order('fecha_generacion', { ascending: false });
          data = result.data;
          error = result.error;
        }
      }

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo QRs de usuario:', error);
      throw error;
    }
  }

  /**
   * Valida un código QR y registra la asistencia (SOLO para organizadores)
   */
  static async validateQRCode(qrCode: string, organizerId: string): Promise<{
    valid: boolean;
    message: string;
    ticketInfo: any;
  }> {
    try {
      console.log('📞 Llamando validar_ticket_qr con:', { qrCode, organizerId });
      
      // Llamar a la función de PostgreSQL
      const { data, error } = await supabase.rpc('validar_ticket_qr', {
        p_codigo_qr: qrCode,
        p_id_organizador: organizerId
      });

      console.log('📥 Respuesta de Supabase:', { data, error });

      if (error) {
        console.error('❌ Error de Supabase:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.warn('⚠️ Sin datos retornados');
        return {
          valid: false,
          message: 'No se pudo validar el ticket',
          ticketInfo: null
        };
      }

      const result = data[0];
      console.log('✅ Resultado procesado:', result);
      
      return {
        valid: result.valido,
        message: result.mensaje,
        ticketInfo: result.ticket_info
      };
    } catch (error) {
      console.error('💥 Error validando QR:', error);
      return {
        valid: false,
        message: error?.message || 'Error al validar el código QR',
        ticketInfo: null
      };
    }
  }

  /**
   * Consulta información de un ticket SIN registrar asistencia (para público general)
   */
  static async consultTicketInfo(qrCode: string): Promise<{
    exists: boolean;
    message: string;
    ticketInfo: any;
  }> {
    try {
      // Llamar a la función de PostgreSQL
      const { data, error } = await supabase.rpc('consultar_ticket_qr', {
        p_codigo_qr: qrCode
      });

      if (error) throw error;

      if (!data || data.length === 0) {
        return {
          exists: false,
          message: 'No se pudo consultar el ticket',
          ticketInfo: null
        };
      }

      const result = data[0];
      return {
        exists: result.existe,
        message: result.mensaje,
        ticketInfo: result.ticket_info
      };
    } catch (error) {
      console.error('Error consultando ticket:', error);
      return {
        exists: false,
        message: 'Error al consultar el código QR',
        ticketInfo: null
      };
    }
  }

  /**
   * Obtiene información de un ticket por código QR sin marcarlo como usado
   */
  static async getTicketInfo(qrCode: string) {
    try {
      const { data, error } = await supabase
        .from('vista_tickets_qr')
        .select('*')
        .eq('codigo_qr', qrCode)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error obteniendo info de ticket:', error);
      throw error;
    }
  }

  /**
   * Cancela un ticket (marca como cancelado)
   */
  static async cancelTicket(ticketId: string) {
    try {
      const { error } = await supabase
        .from('codigos_qr_entradas')
        .update({ estado: 'cancelado' })
        .eq('id', ticketId);

      if (error) throw error;
    } catch (error) {
      console.error('Error cancelando ticket:', error);
      throw error;
    }
  }
}
