# Chat de Asistente IA - Interfaz de Usuario

## Descripción
Componente de chat interactivo con agente IA para el perfil de usuario. Incluye un botón flotante en la esquina inferior derecha que abre una ventana de chat moderna y responsiva.

## 🔌 Conexión con n8n

El chat está **conectado** con un webhook de n8n en localhost. 

### Configuración

La URL del webhook se configura en: `src/modules/users/presentation/config/chat.config.ts`

```typescript
export const CHAT_CONFIG = {
  WEBHOOK_URL: 'http://localhost:5678/webhook/c74be9ff-5080-4c12-86e5-f1100406b90b/chat',
  // ... otras configuraciones
};
```

### Estructura de la Petición

El chat envía las peticiones en este formato:

```json
{
  "message": "Texto del mensaje del usuario",
  "timestamp": "2025-12-10T10:30:00.000Z",
  "userId": "id-del-usuario"
}
```

### Estructura de la Respuesta Esperada

Tu n8n debe responder con uno de estos formatos:

```json
{
  "response": "Respuesta del bot"
}
```

O alternativamente:

```json
{
  "message": "Respuesta del bot"
}
```

O:

```json
{
  "text": "Respuesta del bot"
}
```

El sistema intentará extraer la respuesta de cualquiera de estos campos en orden de prioridad.

### Para Desarrollo Local

1. Asegúrate de que n8n esté corriendo: `n8n start`
2. Verifica que el webhook esté activo en n8n
3. El chat se conectará automáticamente

### Para Producción

1. Actualiza `WEBHOOK_URL` en `chat.config.ts` con tu URL pública
2. Configura CORS en n8n para permitir tu dominio
3. Considera usar HTTPS para producción

## Componentes

### ChatButton
Botón flotante circular con icono de chat que controla la apertura/cierre de la ventana de chat.

**Características:**
- Diseño circular flotante en la parte inferior derecha
- Gradiente purple-to-blue
- Animación de pulso cuando está cerrado
- Transición suave de rotación al abrir/cerrar
- Icono cambia de MessageCircle a X

**Props:**
- `onToggle?: (isOpen: boolean) => void` - Callback cuando se abre/cierra el chat

### ChatWindow
Ventana de chat completa con historial de mensajes y área de entrada.

**Características:**
- Diseño moderno con header gradiente
- Área de mensajes con scroll automático
- Burbujas de chat diferenciadas para usuario y bot
- Indicador de escritura (typing indicator)
- Input con botón de envío
- Timestamps en cada mensaje
- Avatares para usuario y bot
- Responsive y adaptable
- **Integrado con n8n webhook**

**Props:**
- `isOpen: boolean` - Controla la visibilidad de la ventana

## Servicios

### ChatService
Servicio para manejar la comunicación con el webhook del agente IA.

**Métodos:**
- `sendMessage(message: string, userId?: string): Promise<string>` - Envía un mensaje al agente IA
- `healthCheck(): Promise<boolean>` - Verifica si el webhook está disponible

**Características:**
- Manejo de timeouts (30 segundos por defecto)
- Manejo de errores robusto
- Extracción automática de respuesta del webhook
- Logging de errores

## Estructura de Mensajes

```typescript
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}
```

## Integración en Layout Global

```tsx
// El chat está disponible globalmente en Layout.layout.tsx
const { isAuthenticated, user } = useAuthStore();
const [isChatOpen, setIsChatOpen] = useState(false);
const showChat = isAuthenticated && user?.role !== 'admin';

{showChat && (
  <>
    <ChatButton onToggle={setIsChatOpen} />
    <ChatWindow isOpen={isChatOpen} />
  </>
)}
```

## Estilos y Animaciones

- **Botón flotante:** Posición fija bottom-6 right-6, z-index 50
- **Ventana de chat:** Posición fija bottom-24 right-6, z-index 40
- **Dimensiones ventana:** 384px ancho x 600px alto máximo
- **Animaciones:** Transiciones suaves, pulso en botón, bounce en typing indicator

## Archivos del Sistema

- `src/modules/users/presentation/components/ChatButton.tsx` - Botón flotante
- `src/modules/users/presentation/components/ChatWindow.tsx` - Ventana de chat
- `src/modules/users/presentation/components/index.ts` - Exports
- `src/modules/users/presentation/config/chat.config.ts` - Configuración
- `src/modules/users/presentation/services/Chat.service.ts` - Servicio de comunicación

## Solución de Problemas

### El chat no recibe respuestas

1. Verifica que n8n esté corriendo
2. Abre la consola del navegador y busca errores
3. Verifica que la URL del webhook sea correcta
4. Comprueba que n8n esté devolviendo el formato correcto

### Error de CORS

Si ves errores de CORS en producción:
1. Configura los headers CORS en n8n
2. Asegúrate de permitir tu dominio en n8n

### Timeout en las peticiones

Si las respuestas tardan más de 30 segundos:
1. Ajusta `REQUEST_TIMEOUT` en `chat.config.ts`
2. Optimiza tu flujo de n8n

## Consideraciones de Diseño

- **Accesibilidad:** Botón con aria-label descriptivo
- **Responsividad:** Ajusta dimensiones en pantallas pequeñas
- **UX:** Auto-scroll a último mensaje, foco automático en input
- **Performance:** Scroll suave, animaciones optimizadas
- **Seguridad:** Envía userId para tracking de conversaciones
