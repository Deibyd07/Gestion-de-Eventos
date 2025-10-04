import { supabase } from '../supabase';

export interface PaymentData {
  amount: number;
  currency: string;
  eventId: string;
  userId: string;
  ticketTypes: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  qrCode?: string;
}

export class PaymentService {
  // Simular procesamiento de pago con Stripe
  static async processStripePayment(paymentData: PaymentData): Promise<PaymentResult> {
    try {
      // Simular llamada a Stripe API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular éxito/fallo (90% éxito)
      const isSuccess = Math.random() > 0.1;
      
      if (!isSuccess) {
        return {
          success: false,
          error: 'El pago fue rechazado por el banco. Por favor, verifica tus datos.'
        };
      }

      const transactionId = `stripe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Crear compra en la base de datos
      const purchaseResult = await this.createPurchase(paymentData, transactionId, 'stripe');
      
      if (!purchaseResult.success) {
        return {
          success: false,
          error: 'Error al registrar la compra en el sistema.'
        };
      }

      return {
        success: true,
        transactionId,
        qrCode: purchaseResult.qrCode
      };
    } catch (error) {
      console.error('Error processing Stripe payment:', error);
      return {
        success: false,
        error: 'Error interno del sistema. Inténtalo de nuevo.'
      };
    }
  }

  // Simular procesamiento de pago con PayPal
  static async processPayPalPayment(paymentData: PaymentData): Promise<PaymentResult> {
    try {
      // Simular llamada a PayPal API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simular éxito/fallo (95% éxito)
      const isSuccess = Math.random() > 0.05;
      
      if (!isSuccess) {
        return {
          success: false,
          error: 'El pago fue cancelado en PayPal.'
        };
      }

      const transactionId = `paypal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Crear compra en la base de datos
      const purchaseResult = await this.createPurchase(paymentData, transactionId, 'paypal');
      
      if (!purchaseResult.success) {
        return {
          success: false,
          error: 'Error al registrar la compra en el sistema.'
        };
      }

      return {
        success: true,
        transactionId,
        qrCode: purchaseResult.qrCode
      };
    } catch (error) {
      console.error('Error processing PayPal payment:', error);
      return {
        success: false,
        error: 'Error interno del sistema. Inténtalo de nuevo.'
      };
    }
  }

  // Crear compra en la base de datos
  private static async createPurchase(
    paymentData: PaymentData, 
    transactionId: string, 
    method: string
  ): Promise<{ success: boolean; qrCode?: string; error?: string }> {
    try {
      const qrCode = `QR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Crear registro de compra
      const { data: purchase, error: purchaseError } = await supabase
        .from('compras')
        .insert({
          id_usuario: paymentData.userId,
          id_evento: paymentData.eventId,
          metodo_pago: method,
          monto_total: paymentData.amount,
          estado: 'completada',
          fecha_compra: new Date().toISOString(),
          datos_pago: {
            transactionId,
            currency: paymentData.currency,
            customerInfo: paymentData.customerInfo
          },
          codigo_qr: qrCode
        })
        .select()
        .single();

      if (purchaseError) {
        console.error('Error creating purchase:', purchaseError);
        return { success: false, error: 'Error al crear la compra' };
      }

      // Crear entradas para cada tipo de ticket
      for (const ticketType of paymentData.ticketTypes) {
        for (let i = 0; i < ticketType.quantity; i++) {
          const { error: ticketError } = await supabase
            .from('entradas')
            .insert({
              id_compra: purchase.id,
              id_tipo_entrada: ticketType.id,
              codigo_qr: `${qrCode}_${ticketType.id}_${i + 1}`,
              estado: 'activa',
              fecha_emision: new Date().toISOString()
            });

          if (ticketError) {
            console.error('Error creating ticket:', ticketError);
          }
        }
      }

      // Actualizar contador de asistentes del evento
      await supabase.rpc('actualizar_asistentes_evento', {
        evento_id: paymentData.eventId
      });

      return { success: true, qrCode };
    } catch (error) {
      console.error('Error in createPurchase:', error);
      return { success: false, error: 'Error al procesar la compra' };
    }
  }

  // Obtener historial de pagos de un usuario
  static async getUserPayments(userId: string) {
    try {
      const { data, error } = await supabase
        .from('compras')
        .select(`
          *,
          eventos (titulo, fecha_evento, ubicacion, url_imagen),
          entradas (*)
        `)
        .eq('id_usuario', userId)
        .order('fecha_compra', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user payments:', error);
      return [];
    }
  }

  // Obtener estadísticas de pagos
  static async getPaymentStats() {
    try {
      const { data, error } = await supabase
        .from('compras')
        .select('monto_total, estado, fecha_compra');

      if (error) throw error;

      const totalRevenue = data?.reduce((sum, purchase) => 
        purchase.estado === 'completada' ? sum + purchase.monto_total : sum, 0) || 0;
      
      const totalTransactions = data?.length || 0;
      const successfulTransactions = data?.filter(p => p.estado === 'completada').length || 0;
      const conversionRate = totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0;

      return {
        totalRevenue,
        totalTransactions,
        successfulTransactions,
        conversionRate
      };
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      return {
        totalRevenue: 0,
        totalTransactions: 0,
        successfulTransactions: 0,
        conversionRate: 0
      };
    }
  }
}



