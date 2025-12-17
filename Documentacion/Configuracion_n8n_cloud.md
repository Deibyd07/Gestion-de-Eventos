# Configuración del Asistente Virtual con n8n.cloud

## 📋 Resumen

El asistente virtual funciona con n8n y puede desplegarse en n8n.cloud para estar disponible 24/7 en producción.

---

## 🚀 Configuración con n8n.cloud

### Paso 1: Crear cuenta en n8n.cloud

1. Ve a [n8n.cloud](https://n8n.cloud)
2. Regístrate con tu email o cuenta de GitHub
3. Crea un nuevo workspace

### Paso 2: Exportar workflows desde n8n local

1. En tu n8n local (`http://localhost:5678`):
   - Abre el workflow del asistente de chat
   - Click en el menú (⋮) → **Download**
   - Guarda el archivo JSON

2. En n8n.cloud:
   - Click en **Import Workflow**
   - Sube el archivo JSON exportado
   - Verifica que todas las conexiones estén correctas

### Paso 3: Obtener URL del Webhook

1. En n8n.cloud, abre tu workflow
2. Encuentra el nodo **Webhook**
3. Copia la URL (formato: `https://tu-workspace.app.n8n.cloud/webhook/tu-id/chat`)
4. Haz click en **Production URL** (no Test URL)

### Paso 4: Configurar Variables de Entorno

#### En Desarrollo Local (.env.local)

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
VITE_N8N_WEBHOOK_URL=https://tu-workspace.app.n8n.cloud/webhook/tu-id/chat
```

#### En Vercel (Producción)

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega:
   - **Name**: `VITE_N8N_WEBHOOK_URL`
   - **Value**: `https://tu-workspace.app.n8n.cloud/webhook/tu-id/chat`
   - **Environment**: Production, Preview, Development

4. Click **Save**
5. Redeploy tu aplicación

### Paso 5: Activar Workflow en n8n.cloud

1. En n8n.cloud, abre tu workflow
2. Toggle el switch a **Active** (arriba a la derecha)
3. Verifica que el webhook esté escuchando

---

## 🔧 Configuración de CORS en n8n.cloud

Para permitir que tu aplicación se comunique con n8n:

1. En n8n.cloud → Settings → Security
2. Agrega tu dominio a **Allowed Origins**:
   ```
   https://tu-app.vercel.app
   http://localhost:5173
   ```

---

## 📊 Plan Gratuito de n8n.cloud

- ✅ **5,000 ejecuciones/mes** (suficiente para ~5,000 mensajes)
- ✅ **20 workflows activos**
- ✅ **Siempre encendido** (24/7)
- ✅ **SSL automático** (HTTPS)
- ✅ **Sin configuración de infraestructura**

---

## 🧪 Probar la Integración

### En Desarrollo Local

```bash
npm run dev
```

Abre el chat y envía un mensaje. Debería conectarse a n8n.cloud.

### Verificar en Producción

1. Despliega a Vercel
2. Abre tu aplicación
3. Prueba el asistente virtual
4. Verifica las ejecuciones en n8n.cloud → Executions

---

## 🔍 Solución de Problemas

### Error: "Failed to fetch" o CORS

**Solución**: 
- Verifica que agregaste tu dominio en n8n.cloud → Settings → Security
- Asegúrate de incluir `https://` en la URL

### El asistente no responde

**Verificar**:
1. Workflow activo en n8n.cloud (toggle verde)
2. Variable de entorno `VITE_N8N_WEBHOOK_URL` configurada correctamente
3. URL del webhook es la **Production URL**, no Test URL
4. Workflow tiene un nodo Webhook configurado

### Respuesta lenta

**Causas comunes**:
- n8n.cloud puede tener latencia inicial (~1-2 segundos en primera ejecución)
- Workflows complejos con muchos nodos
- APIs externas lentas en tu workflow

---

## 💡 Alternativas

### Railway (Si necesitas más control)

1. Deploy n8n en Railway: [Template de n8n](https://railway.app/template/n8n)
2. Copia la URL pública
3. Configura igual que n8n.cloud

### Mantener n8n Local (Solo desarrollo)

Si `VITE_N8N_WEBHOOK_URL` no está configurada, usa automáticamente:
```
http://localhost:5678/webhook/c74be9ff-5080-4c12-86e5-f1100406b90b/chat
```

---

## 📝 Estructura del Código

### Archivo de Configuración

[src/modules/users/presentation/config/chat.config.ts](../../../src/modules/users/presentation/config/chat.config.ts)

```typescript
const getWebhookUrl = () => {
  // En producción, usa n8n.cloud
  if (import.meta.env.VITE_N8N_WEBHOOK_URL) {
    return import.meta.env.VITE_N8N_WEBHOOK_URL;
  }
  
  // En desarrollo local, usa localhost
  return 'http://localhost:5678/webhook/.../chat';
};
```

### Servicio de Chat

[src/modules/users/presentation/services/Chat.service.ts](../../../src/modules/users/presentation/services/Chat.service.ts)

Maneja la comunicación con el webhook de n8n.

---

## ✅ Checklist de Implementación

- [ ] Cuenta creada en n8n.cloud
- [ ] Workflow exportado desde n8n local
- [ ] Workflow importado en n8n.cloud
- [ ] URL del webhook copiada (Production URL)
- [ ] Variable de entorno configurada en Vercel
- [ ] CORS configurado en n8n.cloud
- [ ] Workflow activado en n8n.cloud
- [ ] Probado en desarrollo local
- [ ] Probado en producción (Vercel)

---

## 📚 Recursos

- [Documentación de n8n](https://docs.n8n.io/)
- [n8n.cloud](https://n8n.cloud)
- [Webhooks en n8n](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)
