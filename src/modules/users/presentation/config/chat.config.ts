/**
 * Configuración del Chat con Agente IA
 * 
 * Para desarrollo local con n8n:
 * - Asegúrate de que n8n esté corriendo en localhost:5678
 * - El webhook debe estar activo y escuchando
 * 
 * Para producción:
 * - Cambia CHAT_WEBHOOK_URL a la URL pública de tu n8n desplegado
 * - Asegúrate de configurar CORS en n8n para permitir tu dominio
 */

export const CHAT_CONFIG = {
  // URL del webhook de n8n
  WEBHOOK_URL: 'http://localhost:5678/webhook/c74be9ff-5080-4c12-86e5-f1100406b90b/chat',
  
  // Timeout para las peticiones (en milisegundos)
  REQUEST_TIMEOUT: 30000,
  
  // Mensaje inicial del bot
  INITIAL_MESSAGE: '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?',
  
  // Mensaje de error
  ERROR_MESSAGE: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.',
  
  // Configuración de reintentos
  RETRY_ATTEMPTS: 2,
  RETRY_DELAY: 1000,
};

/**
 * Estructura esperada de la respuesta del webhook
 * Ajustar según la configuración de n8n
 */
export interface ChatWebhookResponse {
  response?: string;
  message?: string;
  text?: string;
  output?: string;
  data?: string;
  result?: string;
  reply?: string;
  answer?: string;
  // Agrega aquí otros campos que tu n8n pueda devolver
  [key: string]: any; // Permitir otros campos desconocidos
}

/**
 * Estructura del payload enviado al webhook
 */
export interface ChatWebhookPayload {
  message: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
}
