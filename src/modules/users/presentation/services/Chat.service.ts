import { CHAT_CONFIG, ChatWebhookPayload, ChatWebhookResponse } from '../config/chat.config';

/**
 * Servicio para manejar la comunicación con el webhook del agente IA
 */
export class ChatService {
  /**
   * Envía un mensaje al agente IA
   * @param message - Mensaje del usuario
   * @param userId - ID del usuario (opcional)
   * @returns Respuesta del agente IA
   */
  static async sendMessage(message: string, userId?: string): Promise<string> {
    const payload: ChatWebhookPayload = {
      message,
      timestamp: new Date().toISOString(),
      userId,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CHAT_CONFIG.REQUEST_TIMEOUT);

      const response = await fetch(CHAT_CONFIG.WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data: ChatWebhookResponse = await response.json();
      
      // Extraer la respuesta según la estructura de n8n
      // Intentar diferentes campos comunes
      const botResponse = data.response 
        || data.message 
        || data.text 
        || data.output
        || data.data
        || data.result
        || data.reply
        || data.answer;
      
      if (!botResponse) {
        // Si la respuesta es un string directamente
        if (typeof data === 'string') {
          return data;
        }
        // Si hay algún campo en data, intentar convertirlo a string
        const firstValue = Object.values(data)[0];
        if (firstValue && typeof firstValue === 'string') {
          return firstValue;
        }
        return CHAT_CONFIG.ERROR_MESSAGE;
      }

      return botResponse;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return 'La respuesta está tardando más de lo esperado. Por favor, intenta de nuevo.';
        }
      }
      throw error;
    }
  }

  /**
   * Verifica si el webhook está disponible
   * @returns true si el webhook responde, false en caso contrario
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(CHAT_CONFIG.WEBHOOK_URL, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
      }).catch(() => null);

      return response?.ok ?? false;
    } catch {
      return false;
    }
  }
}
