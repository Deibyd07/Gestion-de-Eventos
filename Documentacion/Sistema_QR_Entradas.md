# Sistema de Códigos QR para Entradas

## 📋 Descripción General

EventHub cuenta con un sistema completo de códigos QR para la gestión de entradas a eventos. Este sistema permite dos tipos de consulta:

1. **Consulta Pública**: Cualquier persona puede ver la información de una entrada sin registrar asistencia
2. **Validación de Organizadores**: Solo los organizadores pueden validar entradas y registrar asistencia

## 🎫 Consulta Pública de Entradas

### URL de Acceso
```
/consultar-entrada
```

### Características
- ✅ **Acceso público**: No requiere autenticación
- 👁️ **Solo lectura**: No registra asistencia ni modifica el estado del ticket
- 📱 **Responsive**: Funciona en dispositivos móviles y escritorio
- 🔍 **Información completa**: Muestra todos los detalles del evento y la entrada

### Cómo Usar
1. Navegar a `/consultar-entrada`
2. Ingresar el código QR (que viene en el correo de compra)
3. Ver la información completa del ticket
4. El estado puede ser:
   - **Activo**: Entrada válida y disponible
   - **Ya Utilizado**: Ya se registró asistencia
   - **Cancelado**: Compra cancelada
   - **Expirado**: Fecha del evento pasada

### Información Mostrada
- Título del evento
- Fecha, hora y ubicación
- Nombre y email del titular
- Tipo de entrada y precio
- Fecha de compra
- Estado actual
- Fecha de uso (si aplica)

### Componentes Relacionados
- `TicketConsultPage.tsx` - Página principal de consulta
- `TicketViewerModal.component.tsx` - Modal con el formulario y resultados
- Función SQL: `consultar_ticket_qr(p_codigo_qr TEXT)`

## 🎯 Validación de Organizadores

### Acceso
Solo disponible en el dashboard del organizador:
```
/organizer/dashboard → Sección "Escáner QR"
```

### Características
- 🔒 **Restringido**: Solo organizadores autenticados
- ✍️ **Registra asistencia**: Marca el ticket como "usado"
- 📸 **Escaneo con cámara**: Usa la cámara del dispositivo para escanear QR
- ⌨️ **Ingreso manual**: Permite validar ingresando el código manualmente
- ✅ **Verificación de permisos**: Solo puede validar entradas de sus propios eventos

### Cómo Usar
1. Ir al Dashboard del Organizador
2. En la sección "Escáner QR", hacer clic en "Activar Cámara"
3. Escanear el código QR o ingresarlo manualmente
4. El sistema:
   - Verifica que el organizador tenga permisos sobre el evento
   - Valida que la entrada no haya sido usada previamente
   - Marca el ticket como "usado"
   - Registra fecha y hora del escaneo
   - Registra quién escaneó (ID del organizador)

### Validaciones Realizadas
1. ✅ El código QR existe en el sistema
2. ✅ El organizador es dueño del evento
3. ✅ La entrada no está cancelada
4. ✅ El evento no ha expirado
5. ✅ La entrada no ha sido usada previamente

### Componentes Relacionados
- `QRScannerModal.component.tsx` - Modal con escáner de cámara
- `OrganizerDashboard.page.tsx` - Integración del botón de escaneo
- Función SQL: `validar_ticket_qr(p_codigo_qr TEXT, p_id_organizador UUID)`

## 🗄️ Base de Datos

### Tabla Principal
```sql
codigos_qr_entradas (
  id UUID PRIMARY KEY,
  id_compra UUID,
  id_evento UUID,
  id_usuario UUID,
  codigo_qr TEXT UNIQUE,
  datos_qr JSONB,
  fecha_generacion TIMESTAMPTZ,
  fecha_escaneado TIMESTAMPTZ,
  escaneado_por UUID,
  estado VARCHAR(20),
  numero_entrada INTEGER
)
```

### Funciones SQL

#### `consultar_ticket_qr(p_codigo_qr TEXT)`
**Propósito**: Consulta pública de información de tickets (NO registra asistencia)

**Parámetros**:
- `p_codigo_qr`: Código QR de la entrada

**Retorna**:
```sql
TABLE(
  existe BOOLEAN,
  mensaje TEXT,
  ticket_info JSONB
)
```

**Permisos**: `anon`, `authenticated`

#### `validar_ticket_qr(p_codigo_qr TEXT, p_id_organizador UUID)`
**Propósito**: Validación y registro de asistencia (SOLO para organizadores)

**Parámetros**:
- `p_codigo_qr`: Código QR de la entrada
- `p_id_organizador`: ID del organizador que valida

**Retorna**:
```sql
TABLE(
  valido BOOLEAN,
  mensaje TEXT,
  ticket_info JSONB
)
```

**Acciones**:
- Verifica permisos del organizador
- Valida el estado del ticket
- Marca como "usado" (UPDATE)
- Registra `fecha_escaneado` y `escaneado_por`

**Permisos**: Solo `authenticated` (con validación de rol organizador)

## 🔐 Seguridad

### Consulta Pública
- ✅ No requiere autenticación (RPC público)
- ✅ No modifica datos (solo SELECT)
- ✅ No expone información sensible más allá del ticket
- ✅ Función `SECURITY DEFINER` para acceso controlado

### Validación de Organizadores
- ✅ Requiere autenticación
- ✅ Valida permisos del organizador sobre el evento
- ✅ Solo puede modificar tickets de sus propios eventos
- ✅ Registra auditoría (quién y cuándo escaneó)

## 📱 Experiencia de Usuario

### Para Asistentes
1. Recibe email con código QR después de la compra
2. Puede consultar su entrada en cualquier momento en `/consultar-entrada`
3. Ve toda la información sin necesidad de registrarse
4. Sabe si su entrada ya fue utilizada

### Para Organizadores
1. Accede al escáner desde su dashboard
2. Puede usar cámara o ingresar código manualmente
3. Recibe feedback inmediato sobre la validez del ticket
4. Ve información del asistente para verificación
5. El sistema registra automáticamente la asistencia

## 🚀 Implementación

### Archivos SQL
- `/Documentacion/database/codigos_qr_entradas.sql` - Tabla y función de validación
- `/Documentacion/database/consultar_ticket_publico.sql` - Función de consulta pública

### Servicios
- `/src/shared/lib/services/QRCode.service.ts`:
  - `consultTicketInfo(qrCode)` - Consulta pública
  - `validateQRCode(qrCode, organizerId)` - Validación con registro

### Componentes UI
- `/src/modules/tickets/presentation/pages/TicketConsult.page.tsx`
- `/src/shared/ui/components/TicketViewer/TicketViewerModal.component.tsx`
- `/src/modules/organizers/presentation/components/QRScannerModal.component.tsx`

### Rutas
```typescript
// Pública
<Route path="/consultar-entrada" element={<TicketConsultPage />} />

// Organizador (dentro de dashboard)
// Botón en OrganizerDashboard.page.tsx línea ~1414
```

## 📚 Casos de Uso

### Caso 1: Usuario Consulta su Entrada
```
Usuario → /consultar-entrada
       → Ingresa código QR
       → consultTicketInfo(codigo)
       → Ve información completa
       → Estado: "Activo"
```

### Caso 2: Organizador Valida en la Puerta
```
Organizador → Dashboard → Escáner QR
           → Escanea código con cámara
           → validateQRCode(codigo, organizador_id)
           → Verifica permisos
           → Marca como "usado"
           → Registra asistencia
           → Muestra confirmación
```

### Caso 3: Entrada Ya Utilizada
```
Organizador → Escanea código
           → validateQRCode(codigo, organizador_id)
           → Sistema detecta: estado = "usado"
           → Retorna: valido = false, mensaje = "Esta entrada ya fue utilizada"
           → Muestra fecha del primer uso
```

## 🔄 Estados de Ticket

| Estado | Descripción | Puede Entrar | Color Badge |
|--------|-------------|--------------|-------------|
| `activo` | Entrada válida, no usada | ✅ Sí | Verde |
| `usado` | Ya se registró asistencia | ❌ No (ya entró) | Azul |
| `cancelado` | Compra cancelada | ❌ No | Rojo |
| `expirado` | Fecha del evento pasó | ❌ No | Gris |

## 🛠️ Mantenimiento

### Agregar Nuevos Campos al Ticket
1. Actualizar `ticket_info JSONB` en función SQL
2. Modificar componente `TicketViewerModal` para mostrar nuevo campo
3. Actualizar tipos TypeScript si es necesario

### Modificar Lógica de Validación
Editar función `validar_ticket_qr` en `/Documentacion/database/codigos_qr_entradas.sql`

### Agregar Nuevas Validaciones
Agregar checks en la función SQL antes del UPDATE del estado

## 📊 Analytics Sugeridos

Posibles métricas a implementar:
- Cantidad de consultas públicas por día
- Tasa de validación por evento
- Tiempo promedio entre compra y validación
- Eventos con mayor/menor asistencia
- Horarios pico de validación

## 🐛 Troubleshooting

### "Código QR no válido"
- Verificar que el código existe en `codigos_qr_entradas`
- Verificar formato del código

### "No tienes permisos para validar este ticket"
- Verificar que el organizador es dueño del evento
- Verificar relación `eventos.id_organizador`

### Cámara no funciona
- Verificar permisos del navegador
- Usar ingreso manual como alternativa
- Verificar HTTPS (requerido para getUserMedia)

## 📞 Soporte

Para dudas o problemas:
- Email: soporte@eventhub.com
- Documentación: `/Documentacion/`
- Issues: GitHub repository

---

**Última actualización**: Noviembre 2025
**Versión**: 1.0.0
