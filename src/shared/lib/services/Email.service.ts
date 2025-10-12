// import { supabase } from '../supabase';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: string;
  variables: string[];
}

export interface EmailData {
  to: string;
  templateId: string;
  variables: Record<string, string>;
  attachments?: any[];
}

export class EmailService {
  // Obtener plantillas de email
  static async getEmailTemplates(): Promise<EmailTemplate[]> {
    try {
      // const { data, error } = await supabase
      //   .from('plantillas_email')
      //   .select('*')
      //   .order('fecha_creacion', { ascending: false });
      const data = null;
      const error = null;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching email templates:', error);
      return [];
    }
  }

  // Crear nueva plantilla de email
  static async createEmailTemplate(template: Omit<EmailTemplate, 'id'>): Promise<EmailTemplate> {
    try {
      // const { data, error } = await supabase
      //   .from('plantillas_email')
      //   .insert({
      //     nombre: template.name,
      //     asunto: template.subject,
      //     contenido: template.content,
      //     tipo: template.type,
      //     variables: template.variables
      //   })
      //   .select()
      //   .single();
      const data = null;
      const error = null;

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating email template:', error);
      throw new Error('Error al crear la plantilla de email');
    }
  }

  // Actualizar plantilla de email
  static async updateEmailTemplate(id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate> {
    try {
      // const { data, error } = await supabase
      //   .from('plantillas_email')
      //   .update({
      //     nombre: updates.name,
      //     asunto: updates.subject,
      //     contenido: updates.content,
      //     tipo: updates.type,
      //     variables: updates.variables
      //   })
      //   .eq('id', id)
      //   .select()
      //   .single();
      const data = null;
      const error = null;

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating email template:', error);
      throw new Error('Error al actualizar la plantilla de email');
    }
  }

  // Eliminar plantilla de email
  static async deleteEmailTemplate(id: string): Promise<void> {
    try {
      // const { error } = await supabase
      //   .from('plantillas_email')
      //   .delete()
      //   .eq('id', id);
      const error = null;

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting email template:', error);
      throw new Error('Error al eliminar la plantilla de email');
    }
  }

  // Enviar email usando plantilla
  static async sendEmail(emailData: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Obtener plantilla
      // const { data: template, error: templateError } = await supabase
      //   .from('plantillas_email')
      //   .select('*')
      //   .eq('id', emailData.templateId)
      //   .single();
      const template = null;
      const templateError = null;

      if (templateError || !template) {
        return {
          success: false,
          error: 'Plantilla de email no encontrada'
        };
      }

      // Procesar variables en el asunto y contenido
      const processedSubject = this.processTemplate(template.asunto, emailData.variables);
      const processedContent = this.processTemplate(template.contenido, emailData.variables);

      // Simular envío de email (en producción, integrar con SendGrid, Mailgun, etc.)
      const messageId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Registrar envío en la base de datos
      // const { error: logError } = await supabase
      //   .from('emails_enviados')
      //   .insert({
      //     destinatario: emailData.to,
      //     asunto: processedSubject,
      //     contenido: processedContent,
      //     id_plantilla: emailData.templateId,
      //     fecha_envio: new Date().toISOString(),
      //     estado: 'enviado',
      //     message_id: messageId
      //   });
      const logError = null;

      if (logError) {
        console.error('Error logging email:', logError);
      }

      // Simular envío exitoso
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        messageId
      };
    } catch (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        error: 'Error al enviar el email'
      };
    }
  }

  // Procesar plantilla con variables
  private static processTemplate(template: string, variables: Record<string, string>): string {
    let processed = template;
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, value);
    });

    return processed;
  }

  // Enviar email de confirmación de compra
  static async sendPurchaseConfirmation(
    userEmail: string,
    purchaseData: {
      eventTitle: string;
      eventDate: string;
      eventLocation: string;
      ticketTypes: Array<{ name: string; quantity: number; price: number }>;
      total: number;
      qrCode: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const variables = {
        name: 'Usuario', // En producción, obtener del perfil del usuario
        eventTitle: purchaseData.eventTitle,
        eventDate: purchaseData.eventDate,
        eventLocation: purchaseData.eventLocation,
        total: purchaseData.total.toString(),
        ticketTypes: purchaseData.ticketTypes.map(t => 
          `${t.name} x${t.quantity} - €${t.price * t.quantity}`
        ).join('\n')
      };

      // Buscar plantilla de confirmación
      // const { data: template, error: templateError } = await supabase
      //   .from('plantillas_email')
      //   .select('*')
      //   .eq('tipo', 'confirmacion_entrada')
      //   .single();
      const template = null;
      const templateError = null;

      if (templateError || !template) {
        // Crear plantilla por defecto si no existe
        const defaultTemplate = {
          nombre: 'Confirmación de Entrada',
          asunto: 'Confirmación de compra - {{eventTitle}}',
          contenido: `
            <h2>¡Gracias por tu compra!</h2>
            <p>Hola {{name}},</p>
            <p>Tu compra ha sido confirmada para el evento <strong>{{eventTitle}}</strong>.</p>
            <p><strong>Fecha:</strong> {{eventDate}}</p>
            <p><strong>Ubicación:</strong> {{eventLocation}}</p>
            <p><strong>Entradas:</strong></p>
            <ul>{{ticketTypes}}</ul>
            <p><strong>Total:</strong> €{{total}}</p>
            <p>Presenta este código QR en la entrada del evento:</p>
            <div style="text-align: center; margin: 20px 0;">
              <img src="data:image/png;base64,{{qrCode}}" alt="Código QR" style="max-width: 200px;" />
            </div>
            <p>¡Esperamos verte en el evento!</p>
          `,
          tipo: 'confirmacion_entrada',
          variables: ['name', 'eventTitle', 'eventDate', 'eventLocation', 'total', 'ticketTypes']
        };

        await this.createEmailTemplate(defaultTemplate);
      }

      return await this.sendEmail({
        to: userEmail,
        templateId: template?.id || '',
        variables: {
          ...variables,
          qrCode: purchaseData.qrCode
        }
      });
    } catch (error) {
      console.error('Error sending purchase confirmation:', error);
      return {
        success: false,
        error: 'Error al enviar la confirmación de compra'
      };
    }
  }

  // Enviar recordatorio de evento
  static async sendEventReminder(
    userEmail: string,
    eventData: {
      eventTitle: string;
      eventDate: string;
      eventTime: string;
      eventLocation: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const variables = {
        name: 'Usuario',
        eventTitle: eventData.eventTitle,
        eventDate: eventData.eventDate,
        eventTime: eventData.eventTime,
        eventLocation: eventData.eventLocation
      };

      return await this.sendEmail({
        to: userEmail,
        templateId: 'reminder', // ID de plantilla de recordatorio
        variables
      });
    } catch (error) {
      console.error('Error sending event reminder:', error);
      return {
        success: false,
        error: 'Error al enviar el recordatorio'
      };
    }
  }

  // Obtener historial de emails enviados
  static async getEmailHistory(userId?: string) {
    try {
      let query = supabase
        .from('emails_enviados')
        .select('*')
        .order('fecha_envio', { ascending: false });

      if (userId) {
        query = query.eq('id_usuario', userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching email history:', error);
      return [];
    }
  }
}



