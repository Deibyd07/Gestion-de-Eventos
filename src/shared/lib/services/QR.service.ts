// import QRCode from 'qrcode';
import { supabase } from '../api/supabase';

export interface QRData {
  ticketId: string;
  eventId: string;
  userId: string;
  ticketType: string;
  purchaseDate: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
}

export class QRService {
  // Generar código QR para una entrada
  static async generateQRCode(qrData: QRData): Promise<string> {
    try {
      const qrString = JSON.stringify(qrData);
      // const qrCodeDataURL = await QRCode.toDataURL(qrString, {
    const qrCodeDataURL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='; // Placeholder
      // width: 256,
      // margin: 2,
      // color: {
      //   dark: '#000000',
      //   light: '#FFFFFF'
      // }
      // });
      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Error al generar el código QR');
    }
  }

  // Validar código QR y registrar asistencia
  static async validateAndCheckIn(qrCode: string, eventId: string): Promise<{
    success: boolean;
    message: string;
    attendeeInfo?: any;
  }> {
    try {
      // Decodificar QR code
      const qrData: QRData = JSON.parse(qrCode);
      
      // Verificar que el QR pertenece al evento correcto
      if (qrData.eventId !== eventId) {
        return {
          success: false,
          message: 'Esta entrada no es válida para este evento'
        };
      }

      // Verificar que la entrada existe en la base de datos
      const { data: ticket, error: ticketError } = await supabase
        .from('entradas')
        .select(`
          *,
          compras (*),
          tipos_entrada (*)
        `)
        .eq('codigo_qr', qrData.ticketId)
        .single();

      if (ticketError || !ticket) {
        return {
          success: false,
          message: 'Entrada no encontrada en el sistema'
        };
      }

      // Verificar que la entrada no ha sido usada
      if (ticket.estado === 'usada') {
        return {
          success: false,
          message: 'Esta entrada ya ha sido utilizada'
        };
      }

      // Verificar que el evento está activo
      const { data: event, error: eventError } = await supabase
        .from('eventos')
        .select('estado, fecha_evento, hora_evento')
        .eq('id', eventId)
        .single();

      if (eventError || !event) {
        return {
          success: false,
          message: 'Evento no encontrado'
        };
      }

      if (event.estado !== 'en_curso' && event.estado !== 'proximo') {
        return {
          success: false,
          message: 'Este evento no está disponible para check-in'
        };
      }

      // Registrar asistencia
      const { error: checkInError } = await supabase
        .from('asistencia')
        .insert({
          id_evento: eventId,
          id_usuario: qrData.userId,
          id_entrada: ticket.id,
          fecha_checkin: new Date().toISOString(),
          estado: 'confirmada'
        });

      if (checkInError) {
        console.error('Error checking in:', checkInError);
        return {
          success: false,
          message: 'Error al registrar la asistencia'
        };
      }

      // Marcar entrada como usada
      const { error: updateError } = await supabase
        .from('entradas')
        .update({ estado: 'usada' })
        .eq('id', ticket.id);

      if (updateError) {
        console.error('Error updating ticket status:', updateError);
      }

      return {
        success: true,
        message: 'Asistencia registrada correctamente',
        attendeeInfo: {
          name: qrData.userId, // En un sistema real, obtendrías el nombre del usuario
          ticketType: qrData.ticketType,
          checkInTime: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error validating QR code:', error);
      return {
        success: false,
        message: 'Error al validar el código QR'
      };
    }
  }

  // Obtener estadísticas de asistencia de un evento
  static async getEventAttendanceStats(eventId: string) {
    try {
      const { data: attendance, error } = await supabase
        .from('asistencia')
        .select(`
          *,
          usuarios (nombre_completo, correo_electronico),
          entradas (tipos_entrada (nombre, precio))
        `)
        .eq('id_evento', eventId);

      if (error) throw error;

      const totalAttendees = attendance?.length || 0;
      const checkedIn = attendance?.filter(a => a.estado === 'confirmada').length || 0;
      const noShow = totalAttendees - checkedIn;

      return {
        totalAttendees,
        checkedIn,
        noShow,
        attendanceRate: totalAttendees > 0 ? (checkedIn / totalAttendees) * 100 : 0
      };
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
      return {
        totalAttendees: 0,
        checkedIn: 0,
        noShow: 0,
        attendanceRate: 0
      };
    }
  }

  // Obtener lista de asistentes de un evento
  static async getEventAttendees(eventId: string) {
    try {
      // const { data, error } = await supabase
      //   .from('asistencia')
      //   .select(`
      //     *,
      //     usuarios (nombre_completo, correo_electronico),
      //     entradas (tipos_entrada (nombre, precio))
      //   `)
      //   .eq('id_evento', eventId)
      //   .order('fecha_checkin', { ascending: false });
      const data = null;
      const error = null;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching event attendees:', error);
      return [];
    }
  }

  // Generar reporte de asistencia
  static async generateAttendanceReport(eventId: string) {
    try {
      const attendees = await this.getEventAttendees(eventId);
      const stats = await this.getEventAttendanceStats(eventId);

      // Obtener información del evento
      const { data: event, error: eventError } = await supabase
        .from('eventos')
        .select('titulo, fecha_evento, ubicacion, maximo_asistentes')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      return {
        event: event,
        stats: stats,
        attendees: attendees,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating attendance report:', error);
      throw new Error('Error al generar el reporte de asistencia');
    }
  }
}



