import { supabase } from '../supabase';
import type { Database } from '../supabase';
import { QRCodeService, type QRTicketData } from '../../services/QRCode.service';
import { EventService } from './Event.service';
import { UserService } from './User.service';

type Tables = Database['public']['Tables'];

export class PurchaseService {
  static async crearCompra(datosCompra: Tables['compras']['Insert']) {
    console.log('🔵 PurchaseService.crearCompra iniciado');
    const { data: authInfo } = await supabase.auth.getUser();
    const userEmail = authInfo?.user?.email;
    console.log('📧 Email del usuario:', userEmail);

    if (!userEmail) {
      throw new Error('No hay sesión activa para registrar la compra');
    }

    // Buscar el usuario en la tabla usuarios por email (NO usar auth.uid)
    const usuario = await UserService.obtenerUsuarioPorEmail(userEmail);
    
    if (!usuario) {
      throw new Error(`No se encontró el usuario con email ${userEmail} en la base de datos`);
    }

    console.log('✅ Usuario encontrado:', { id: usuario.id, email: usuario.correo_electronico });

    // Usar el ID de la tabla usuarios (NO auth.uid)
    const insertPayload = {
      ...datosCompra,
      id_usuario: usuario.id // Usar el ID real de la tabla usuarios
    } as Tables['compras']['Insert'];

    console.log('📦 Datos de compra a insertar:', insertPayload);

    const { data, error } = await supabase
      .from('compras')
      .insert(insertPayload)
      .select()
      .single();

    console.log('📤 Respuesta de Supabase INSERT:', { data, error });

    if (error) {
      console.error('❌ Error en INSERT de compra:', error);
      throw error;
    }

    if (!data) {
      console.error('⚠️ INSERT exitoso pero data es null/undefined');
      throw new Error('No se pudo obtener los datos de la compra creada');
    }

    console.log('✅ Compra creada exitosamente:', data);

    // Generar códigos QR para cada entrada
    try {
      // Obtener datos completos del evento y usuario
      const [evento, usuario, tipoEntrada] = await Promise.all([
        EventService.obtenerEventoPorId(insertPayload.id_evento),
        UserService.obtenerUsuarioPorId(insertPayload.id_usuario),
        supabase.from('tipos_entrada').select('*').eq('id', insertPayload.id_tipo_entrada).single()
      ]);

      // Generar un QR por cada entrada comprada
      const qrPromises = [];
      for (let i = 1; i <= insertPayload.cantidad; i++) {
        const qrData: QRTicketData = {
          ticketId: `${data.id}-${i}`,
          eventId: insertPayload.id_evento,
          eventTitle: evento?.titulo || 'Evento',
          userId: insertPayload.id_usuario,
          userName: usuario?.nombre_completo || 'Usuario',
          userEmail: usuario?.correo_electronico || '',
          purchaseId: data.id,
          ticketNumber: i,
          ticketType: tipoEntrada.data?.nombre_tipo || 'General',
          price: insertPayload.precio_unitario,
          eventDate: evento?.fecha_evento || '',
          eventTime: evento?.hora_evento || '',
          eventLocation: evento?.ubicacion || '',
          purchaseDate: new Date().toISOString()
        };

        qrPromises.push(QRCodeService.createQRTicket(qrData));
      }

      await Promise.all(qrPromises);
      console.log(`✅ Generados ${insertPayload.cantidad} códigos QR para la compra ${data.id}`);
    } catch (qrError) {
      console.error('❌ Error generando QR codes:', qrError);
      // No lanzamos el error para que la compra se complete
      // Los QR se pueden regenerar después si es necesario
    }

    return data;
  }

  static async obtenerComprasUsuario(idUsuario: string) {
    // Consultar por auth.uid() y también por email del JWT para cubrir compras históricas
    const { data: authInfo, error: authErr } = await supabase.auth.getUser();
    if (authErr) console.warn('Auth.getUser error:', authErr);
    const uid = authInfo?.user?.id || idUsuario;
    const userEmail = authInfo?.user?.email || null;
    console.log('🪪 obtenerComprasUsuario UID usado:', { authUid: uid, email: userEmail, paramId: idUsuario });

    // Primero intentar por uid directo
    let { data, error } = await supabase
      .from('compras')
      .select('*')
      .eq('id_usuario', uid)
      .order('fecha_creacion', { ascending: false });

    // Si no hay resultados y tenemos email, buscar por email del usuario
    if ((!data || data.length === 0) && userEmail) {
      console.log('🔄 Buscando compras por email:', userEmail);
      const { data: userData } = await supabase
        .from('usuarios')
        .select('id')
        .eq('correo_electronico', userEmail)
        .single();
      
      if (userData?.id) {
        const result = await supabase
          .from('compras')
          .select('*')
          .eq('id_usuario', userData.id)
          .order('fecha_creacion', { ascending: false });
        data = result.data;
        error = result.error;
      }
    }

    console.log('📥 obtenerComprasUsuario respuesta:', { count: data?.length || 0, error });
    if (error) throw error;
    return data;
  }

  static async actualizarEstadoCompra(id: string, estado: Tables['compras']['Update']['estado']) {
    const { data, error } = await supabase
      .from('compras')
      .update({ estado })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async obtenerCompraPorQR(codigoQR: string) {
    const { data, error } = await supabase
      .from('compras')
      .select(`
        *,
        eventos (titulo, fecha_evento, hora_evento, ubicacion),
        tipos_entrada (nombre_tipo, precio),
        usuarios (nombre_completo, correo_electronico)
      `)
      .eq('codigo_qr', codigoQR)
      .single();

    if (error) throw error;
    return data;
  }

  static async obtenerEstadisticasGenerales() {
    try {
      const { data, error } = await supabase
        .from('compras')
        .select('*');

      if (error) throw error;
      
      const ingresos_totales = data?.reduce((sum, compra) => sum + (compra.total || 0), 0) || 0;
      const tasa_conversion = data?.length > 0 ? (data.filter(c => c.estado === 'completada').length / data.length) * 100 : 0;
      
      return {
        ingresos_totales,
        tasa_conversion,
        total_compras: data?.length || 0
      };
    } catch (error) {
      // Si hay error, retornar valores por defecto
      return {
        ingresos_totales: 0,
        tasa_conversion: 0,
        total_compras: 0
      };
    }
  }
}
