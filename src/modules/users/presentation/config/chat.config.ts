/**
 * Configuración del Chat con Agente IA
 * 
 * Para desarrollo local con n8n:
 * - Asegúrate de que n8n esté corriendo en localhost:5678
 * - El webhook debe estar activo y escuchando
 * 
 * Para producción con n8n.cloud:
 * - Configura VITE_N8N_WEBHOOK_URL en las variables de entorno de Vercel
 * - URL formato: https://tu-workspace.app.n8n.cloud/webhook/tu-webhook-id
 * - Asegúrate de configurar CORS en n8n para permitir tu dominio
 */

// Obtener URL del webhook desde variables de entorno o usar localhost por defecto
const getWebhookUrl = () => {
  // En producción, usa la variable de entorno
  if (import.meta.env.VITE_N8N_WEBHOOK_URL) {
    return import.meta.env.VITE_N8N_WEBHOOK_URL;
  }
  
  // En desarrollo local, usa localhost
  return 'http://localhost:5678/webhook/c74be9ff-5080-4c12-86e5-f1100406b90b/chat';
};

export const CHAT_CONFIG = {
  // URL del webhook de n8n (local o cloud según entorno)
  WEBHOOK_URL: getWebhookUrl(),
  
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
