# Funcionalidad: Duplicar Eventos

## 📋 Descripción
Permite a los organizadores duplicar eventos existentes para agilizar la creación de nuevos eventos similares. Al duplicar un evento, se copian todos los detalles (descripción, ubicación, categoría, imagen) y todos los tipos de entrada con sus configuraciones, reiniciando los contadores de asistentes a 0.

## 🎯 Objetivo
Como organizador, quiero duplicar eventos anteriores para no tener que ingresar toda la información manualmente cuando creo eventos similares o recurrentes.

## ✨ Características

### Duplicación Completa
- ✅ **Detalles del evento**: Título, descripción, ubicación, categoría, aforo máximo, imagen
- ✅ **Tipos de entrada**: Todos los tipos de entrada con sus precios, descripciones y cantidades
- ✅ **Reinicio automático**: Los asistentes actuales se resetean a 0
- ✅ **Personalización**: Permite modificar título, fecha y hora del evento duplicado antes de crearlo

### Interfaz de Usuario
- ✅ **Botón Duplicar**: Ubicado en el menú de acciones de cada evento
- ✅ **Modal de confirmación**: Muestra vista previa del evento original y permite ajustes
- ✅ **Validaciones**: Verifica que todos los campos obligatorios estén completos
- ✅ **Feedback visual**: Indicadores de carga y mensajes de éxito/error

## 🔧 Implementación Técnica

### Archivos Modificados

#### 1. **EventService.ts** - Servicio de duplicación
```typescript
static async duplicarEvento(eventoId: string, ajustes?: {...})
```
- Obtiene el evento original con sus tipos de entrada
- Crea nuevo evento con datos ajustados
- Duplica todos los tipos de entrada
- Retorna el evento completo duplicado

#### 2. **DuplicateEventModal.component.tsx** - Modal de duplicación
Props:
- `event`: Evento a duplicar
- `isOpen`: Estado del modal
- `onClose`: Callback al cerrar
- `onDuplicate`: Callback con ajustes (título, fecha, hora)
- `isLoading`: Estado de carga

Características:
- Inicialización automática de campos con datos del evento original
- Validación de campos obligatorios
- Vista previa de tipos de entrada que se copiarán
- Manejo de estados (loading, success, error)

#### 3. **OrganizerDashboard.page.tsx** - Integración
Handlers:
- `handleDuplicateEvent(eventId)`: Abre el modal con los datos del evento
- `handleDuplicateEventConfirm(adjustments)`: Ejecuta la duplicación y actualiza la lista

Estado:
- `isDuplicateEventModalOpen`: Controla visibilidad del modal
- `selectedEventForDuplication`: Almacena datos del evento a duplicar

## 📦 Estructura de Datos

### Evento para Duplicación
```typescript
{
  id: string;
  titulo: string;
  descripcion: string;
  url_imagen: string;
  fecha_evento: string;
  hora_evento: string;
  ubicacion: string;
  categoria: string;
  maximo_asistentes: number;
  tipos_entrada: [{
    nombre_tipo: string;
    precio: number;
    descripcion: string;
    cantidad_maxima: number;
  }];
}
```

### Ajustes de Duplicación
```typescript
{
  titulo?: string;        // Nuevo título del evento
  fecha_evento?: string;  // Nueva fecha (YYYY-MM-DD)
  hora_evento?: string;   // Nueva hora (HH:mm)
}
```

## 🚀 Flujo de Usuario

1. **Seleccionar evento**: El organizador ve sus eventos en el dashboard
2. **Click en Duplicar**: Presiona el botón "Duplicar" en el menú del evento
3. **Revisar datos**: Se abre el modal mostrando:
   - Información del evento original
   - Tipos de entrada que se copiarán
   - Campos editables (título, fecha, hora)
4. **Ajustar detalles**: Modifica el título, fecha y/o hora según necesite
5. **Confirmar**: Click en "Duplicar Evento"
6. **Evento creado**: El nuevo evento aparece en la lista con estado "próximo"

## ⚠️ Validaciones

- ✅ No permite duplicar eventos mock/demo
- ✅ Título obligatorio (mínimo 1 carácter sin espacios)
- ✅ Fecha obligatoria
- ✅ Hora obligatoria
- ✅ Verifica que el evento original exista
- ✅ Maneja errores de base de datos

## 🎨 UX/UI

### Estados Visuales
- **Loading**: Spinner + texto "Duplicando..."
- **Success**: Checkmark verde + mensaje "¡Evento duplicado exitosamente!"
- **Error**: Icono de alerta + mensaje de error específico
- **Disabled**: Botones deshabilitados durante la operación

### Mensajes Informativos
- 📝 Vista previa clara del evento original
- 💡 Info box explicando qué se duplicará
- ⚠️ Mensajes de validación específicos
- ✅ Confirmación visual de éxito

## 🧪 Casos de Prueba

### Caso 1: Duplicación exitosa
**Pre-condición**: Evento real existe con tipos de entrada
**Pasos**:
1. Click en "Duplicar" del evento
2. Cambiar título a "Evento Duplicado"
3. Seleccionar nueva fecha
4. Click en "Duplicar Evento"

**Resultado esperado**: Nuevo evento creado con todos los datos copiados

### Caso 2: Validación de campos
**Pre-condición**: Modal abierto
**Pasos**:
1. Borrar el título
2. Click en "Duplicar Evento"

**Resultado esperado**: Mensaje de error "El título es obligatorio"

### Caso 3: Evento mock
**Pre-condición**: Intentar duplicar evento de ejemplo
**Pasos**:
1. Click en "Duplicar" de evento mock

**Resultado esperado**: Alert "No puedes duplicar eventos de ejemplo"

## 📊 Métricas de Éxito

- ⏱️ Tiempo de duplicación: < 3 segundos
- ✅ Tasa de éxito: > 95%
- 📈 Uso: Esperado que 30-40% de nuevos eventos sean duplicaciones
- 😊 Satisfacción: Reduce tiempo de creación de eventos en ~70%

## 🔄 Mejoras Futuras

1. **Duplicación masiva**: Seleccionar múltiples eventos para duplicar
2. **Templates**: Guardar configuraciones predefinidas
3. **Programación**: Duplicar evento en múltiples fechas automáticamente
4. **Historia**: Ver eventos que fueron duplicados desde uno original
5. **Edición avanzada**: Permitir modificar más campos antes de duplicar

## 🐛 Problemas Conocidos

- Ninguno identificado en la versión actual

## 📚 Referencias

- **Rama**: `feature/duplicate-events`
- **Documentación BD**: `Documentacion/Base_Datos.md`
- **PR**: Pendiente de crear

## 👥 Autor

- **Desarrollador**: GitHub Copilot + Usuario
- **Fecha**: Noviembre 12, 2025
- **Versión**: 1.0.0
