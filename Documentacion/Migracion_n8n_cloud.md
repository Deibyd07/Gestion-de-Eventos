# Script de Migración de n8n Local a n8n.cloud

## 🎯 Objetivo

Facilitar la migración de workflows de n8n local a n8n.cloud

---

## 📦 Exportar Workflows desde n8n Local

### Opción 1: Desde la Interfaz (Recomendado)

1. Abre n8n local: `http://localhost:5678`
2. Ve a **Workflows**
3. Click en el workflow del asistente de chat
4. Click en menú (⋮) → **Download**
5. Guarda como: `asistente-chat-workflow.json`

### Opción 2: Desde la API (Avanzado)

```bash
# Obtener lista de workflows
curl http://localhost:5678/api/v1/workflows

# Exportar workflow específico (reemplaza ID)
curl http://localhost:5678/api/v1/workflows/WORKFLOW_ID > workflow.json
```

---

## 📤 Importar en n8n.cloud

### Paso a Paso

1. **Accede a n8n.cloud**
   ```
   https://app.n8n.cloud
   ```

2. **Crear Workflow**
   - Click en **+ New Workflow**
   - O usa el botón **Import from File**

3. **Importar Archivo**
   - Selecciona `asistente-chat-workflow.json`
   - Click **Import**

4. **Revisar Configuración**
   - Verifica que todos los nodos se importaron correctamente
   - Revisa las credenciales (deberás reconfigurarlas)

---

## 🔑 Configurar Credenciales en n8n.cloud

### Si tu workflow usa APIs externas

1. Ve a **Settings** → **Credentials**
2. Agrega las credenciales necesarias:
   - OpenAI API (si usas GPT)
   - Base de datos
   - Otros servicios

### Ejemplo: OpenAI

```
Name: OpenAI ChatGPT
API Key: sk-...tu-api-key...
```

---

## 🌐 Obtener URL del Webhook

### URL de Producción

1. En tu workflow, selecciona el nodo **Webhook**
2. Copia la **Production URL**:
   ```
   https://[workspace].app.n8n.cloud/webhook/[id]/chat
   ```

⚠️ **Importante**: Usa la Production URL, NO la Test URL

### Configurar en el Proyecto

Agrega a Vercel Environment Variables:

```bash
VITE_N8N_WEBHOOK_URL=https://tu-workspace.app.n8n.cloud/webhook/tu-id/chat
```

---

## ✅ Verificar Configuración

### 1. Activar Workflow

- Toggle a **Active** (verde) en n8n.cloud

### 2. Probar Webhook Directamente

```bash
# Reemplaza con tu URL real
curl -X POST https://tu-workspace.app.n8n.cloud/webhook/tu-id/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hola", "timestamp": "2024-01-01T00:00:00Z"}'
```

**Respuesta esperada**:
```json
{
  "response": "¡Hola! ¿En qué puedo ayudarte?"
}
```

### 3. Probar desde la Aplicación

```bash
# En desarrollo local
npm run dev

# Abre http://localhost:5173
# Ve al módulo de usuario
# Abre el chat y envía un mensaje
```

---

## 🛠️ Ajustes Comunes del Workflow

### Nodo Webhook

```json
{
  "path": "chat",
  "method": "POST",
  "responseMode": "lastNode",
  "options": {
    "allowedOrigins": [
      "https://tu-app.vercel.app",
      "http://localhost:5173"
    ]
  }
}
```

### Nodo de Respuesta

Asegúrate de que el último nodo devuelve:

```json
{
  "response": "{{ $json.output }}"
}
```

O el campo que uses en tu configuración.

---

## 📊 Monitoreo

### Ver Ejecuciones en n8n.cloud

1. Ve a **Executions** en n8n.cloud
2. Verás todas las ejecuciones del workflow
3. Click en una ejecución para ver detalles

### Debugging

- ✅ Verde: Ejecución exitosa
- ❌ Rojo: Error
- ⏸️ Gris: En pausa/esperando

---

## 🔄 Workflow de Ejemplo Mínimo

Si no tienes un workflow, aquí está un ejemplo básico:

```json
{
  "name": "Asistente Chat Simple",
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "chat",
        "method": "POST",
        "responseMode": "lastNode"
      }
    },
    {
      "name": "OpenAI",
      "type": "n8n-nodes-base.openAi",
      "parameters": {
        "resource": "chat",
        "model": "gpt-3.5-turbo",
        "messages": {
          "values": [
            {
              "role": "user",
              "content": "={{ $json.message }}"
            }
          ]
        }
      }
    },
    {
      "name": "Responder",
      "type": "n8n-nodes-base.respondToWebhook",
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { response: $json.choices[0].message.content } }}"
      }
    }
  ],
  "connections": {
    "Webhook": { "main": [[{ "node": "OpenAI", "type": "main", "index": 0 }]] },
    "OpenAI": { "main": [[{ "node": "Responder", "type": "main", "index": 0 }]] }
  }
}
```

Guarda esto como `workflow-simple.json` e impórtalo.

---

## 🚨 Troubleshooting

### Error: "Workflow not active"

**Solución**: Activa el workflow con el toggle en n8n.cloud

### Error: "Invalid webhook"

**Solución**: 
- Verifica que la URL sea la Production URL
- Revisa que el path del webhook sea correcto

### Error: CORS

**Solución**:
1. En n8n.cloud → Settings → Security
2. Agrega:
   ```
   https://tu-app.vercel.app
   http://localhost:5173
   ```

### No recibo respuesta

**Verificar**:
1. Workflow activo (toggle verde)
2. URL correcta en variable de entorno
3. Nodo "Respond to Webhook" al final del workflow
4. Credenciales configuradas correctamente

---

## 📈 Optimización

### Reducir Latencia

- Minimiza nodos innecesarios
- Usa caché cuando sea posible
- Configura timeout apropiado

### Reducir Costos (Ejecuciones)

- Valida inputs antes de llamar APIs costosas
- Implementa rate limiting
- Usa condicionales para filtrar mensajes irrelevantes

---

## 💰 Planes de n8n.cloud

### Free (Actual)
- 5,000 ejecuciones/mes
- 20 workflows activos
- Perfecto para MVP

### Starter ($20/mes)
- 10,000 ejecuciones/mes
- Workflows ilimitados
- Para escalar

### Pro ($50/mes)
- 50,000 ejecuciones/mes
- Soporte prioritario
- Para producción seria

---

## 📞 Soporte

- **Documentación**: https://docs.n8n.io/
- **Comunidad**: https://community.n8n.io/
- **Discord**: https://discord.gg/n8n

---

¡Listo! Tu asistente virtual ahora funciona 24/7 con n8n.cloud 🎉
