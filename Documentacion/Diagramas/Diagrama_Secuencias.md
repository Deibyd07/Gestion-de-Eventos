# 🔄 EventHub - Diagramas de Secuencia (alineados al código actual)
## Sistema de Gestión de Eventos - Flujos de Interacción Detallados

## 🎯 **Resumen del Sistema**

**EventHub** (React + Vite + Supabase) opera con autenticación Supabase Auth, persistencia en el schema público y lógica de negocio en servicios/estados de frontend. Los flujos reflejan la implementación vigente (Zustand, servicios `supabase`, generación de QR, métodos de pago por evento y guards de verificación de email).

### 🚀 **Características Principales (vigentes)**
- **Autenticación y verificación de email** con Supabase Auth + guardas en UI
- **Gestión de eventos** contra tablas `eventos`/`tipos_entrada` y cálculos de asistencia con códigos QR
- **Pagos y compras**: validación de stock, métodos de pago por evento y generación de códigos QR persistidos en `codigos_qr_entradas`
- **Notificaciones internas** mediante tabla `notificaciones` (sin push/email externo implementado)
- **Analytics** calculadas desde tablas `compras`, `codigos_qr_entradas`, `analiticas_eventos`

---

## 📊 **Diagramas de Secuencia por Categoría**

### **🔐 Autenticación y Gestión de Usuarios**

#### **UC-001: Registrar Usuario (email + verificación obligatoria)**
```mermaid
sequenceDiagram
    actor Usuario
    participant App as Frontend (React)
    participant BD as Tabla usuarios
    participant Auth as Supabase Auth
    participant Callback as /auth/callback
    participant Email as Supabase Email

    Usuario->>App: Enviar formulario (nombre, email, contraseña, rol)
    App->>BD: Verificar correo en usuarios (maybeSingle)
    BD-->>App: ¿Existe?
    alt Correo libre
        App->>Auth: signUp(email,password,redirect=/auth/callback, metadata)
        Auth-->>Email: Envía enlace de verificación
        App->>BD: upsert perfil pendiente (estado=pendiente, email_verified=false)
        App-->>Usuario: Mostrar sala "Verifica tu email"
        Usuario->>Email: Clic en enlace
        Email-->>Callback: Redirección con access_token
        Callback->>Auth: setSession(access_token)
        Callback->>BD: crear/actualizar usuario (rol mapeado, email_verified=true)
        Callback->>App: Guardar usuario en Zustand, isAuthenticated=true
        App-->>Usuario: Redirigir según rol (events/organizer/admin)
    else Correo en uso
        App-->>Usuario: Mensaje "correo ya registrado"
    end
```

#### **UC-002: Autenticar Usuario (login con password)**
```mermaid
sequenceDiagram
    actor Usuario
    participant App as Frontend (React)
    participant Auth as Supabase Auth
    participant BD as Tabla usuarios

    Usuario->>App: Ingresar email y contraseña
    App->>Auth: signOut() previo + signInWithPassword()
    Auth-->>App: user + email_confirmed_at
    alt Email verificado
        App->>BD: Obtener usuario por correo (ServicioUsuarios)
        BD-->>App: Perfil + rol db (administrador/organizador/asistente)
        App->>App: Mapear rol a (admin/organizer/attendee) y set Zustand
        App-->>Usuario: Sesión iniciada, redirección por rol
    else Email sin confirmar
        App->>Auth: signOut()
        App-->>Usuario: Mostrar error "verifica tu correo"
    end
```

#### **UC-003: Cerrar Sesión**
```mermaid
sequenceDiagram
    actor Usuario
    participant App as Frontend (React)
    participant Auth as Supabase Auth

    Usuario->>App: Seleccionar "Cerrar sesión"
    App->>Auth: signOut()
    Auth-->>App: Sesión invalidada
    App->>App: Limpiar Zustand + localStorage auth-storage
    App-->>Usuario: Redirigir a home/login
```

#### **UC-004: Recuperar Contraseña (pendiente de implementación)**
```mermaid
sequenceDiagram
    actor Usuario
    participant App as Frontend (React)
    participant Auth as Supabase Auth

    Usuario->>App: Solicitar recuperación
    App-->>Usuario: Mensaje "Flujo aún no disponible"
```

#### **UC-005: Cambiar Contraseña (pendiente de implementación)**
```mermaid
sequenceDiagram
    actor Usuario
    participant App as Frontend (React)

    Usuario->>App: Solicitar cambio de contraseña
    App-->>Usuario: Mensaje "Flujo aún no disponible"
```

### **📅 Gestión de Eventos**

#### **UC-011: Explorar Eventos (filtros + cálculo de asistencia real)**
```mermaid
sequenceDiagram
    actor Usuario
    participant App as Frontend (React)
    participant EventSvc as EventService
    participant BD as Supabase eventos/tipos_entrada/codigos_qr_entradas

    Usuario->>App: Abrir /events
    App->>EventSvc: obtenerEventos(filtros básicos)
    EventSvc->>BD: SELECT eventos + tipos_entrada + analiticas_eventos
    BD-->>EventSvc: Eventos
    EventSvc->>BD: Contar codigos_qr_entradas usados por evento
    BD-->>EventSvc: Asistencia real por evento
    EventSvc-->>App: Eventos con ticketTypes y asistentes_reales
    App->>App: Filtro adicional en frontend (precio, fecha, ubicación)
    App-->>Usuario: Listado filtrado
```

#### **UC-012: Buscar Eventos (texto + filtros)**
```mermaid
sequenceDiagram
    actor Usuario
    participant App as Frontend (React)
    participant EventSvc as EventService
    participant BD as Supabase

    Usuario->>App: Ingresar término de búsqueda
    App->>EventSvc: obtenerEventos({busqueda, categoria, ubicacion, fechas})
    EventSvc->>BD: SELECT con filtros + tipos_entrada
    BD-->>EventSvc: Resultados
    EventSvc-->>App: Eventos
    App->>App: Filtrar por rango de precio en UI
    App-->>Usuario: Mostrar resultados
```

#### **UC-013: Ver Detalle de Evento**
```mermaid
sequenceDiagram
    actor Usuario
    participant App as Frontend (React)
    participant EventSvc as EventService
    participant BD as Supabase

    Usuario->>App: Abrir /events/:id
    App->>EventSvc: obtenerEventoPorId(id)
    EventSvc->>BD: SELECT evento + tipos_entrada + analiticas_eventos
    BD-->>EventSvc: Datos del evento
    EventSvc-->>App: Detalle con ticketTypes
    App-->>Usuario: Renderiza detalle + botón añadir al carrito
```

#### **UC-014: Crear Evento (sin storage, con notificación a seguidores)**
```mermaid
sequenceDiagram
    actor Organizador
    participant App as Frontend (React)
    participant EventSvc as EventService
    participant BD as Supabase

    Organizador->>App: Completar formulario de evento
    App->>EventSvc: crearEvento(datos evento)
    EventSvc->>BD: INSERT en eventos
    BD-->>EventSvc: Evento creado (id)
    EventSvc->>BD: SELECT seguidores_organizadores
    BD-->>EventSvc: Seguidores del organizador
    EventSvc->>BD: INSERT notificaciones para seguidores
    EventSvc-->>App: Evento creado
    App-->>Organizador: Solicitar configuración de tipos de entrada
```

#### **UC-015: Editar Evento**
```mermaid
sequenceDiagram
    actor Organizador
    participant App as Frontend (React)
    participant EventSvc as EventService
    participant BD as Supabase

    Organizador->>App: Abrir evento a editar
    App->>EventSvc: obtenerEventoPorId(id)
    EventSvc-->>App: Datos actuales
    Organizador->>App: Modificar campos
    App->>EventSvc: actualizarEvento(id, cambios)
    EventSvc->>BD: UPDATE eventos
    BD-->>EventSvc: Confirmación
    EventSvc-->>App: Evento actualizado
    App-->>Organizador: Mostrar cambios
```

### **🎫 Gestión de Pagos**

#### **UC-017: Agregar al Carrito (store local)**
```mermaid
sequenceDiagram
    actor Usuario
    participant App as Frontend (React)
    participant Cart as Cart.store (Zustand)

    Usuario->>App: Seleccionar tipo de entrada
    App->>Cart: addItem(eventId, ticketTypeId, price, qty)
    Cart-->>App: Totales recalculados (subtotal/discount/finalTotal)
    App-->>Usuario: Actualiza UI del carrito
```

#### **UC-018: Procesar Pago (checkout con Supabase + QR)**
```mermaid
sequenceDiagram
    actor Usuario
    participant App as CheckoutPage
    participant Promo as PromoCodeService
    participant PayMethod as PaymentMethodService
    participant Purchase as PurchaseService
    participant QR as QRCodeService
    participant BD as Supabase

    Usuario->>App: Confirmar compra
    App->>PayMethod: obtenerMetodosPagoEvento(eventId)
    PayMethod-->>App: Métodos activos
    opt Código promocional
        App->>Promo: validarCodigo(codigo, eventId)
        Promo-->>App: Descuento aplicado
    end
    App->>App: Espera simulada de pasarela (setTimeout)
    loop Por cada item del carrito
        App->>Purchase: crearCompra(insert, metodo_pago)
        Purchase->>BD: SELECT tipo_entrada (disponible)
        BD-->>Purchase: Stock actual
        alt Stock suficiente
            Purchase->>BD: INSERT compra (compras)
            Purchase->>BD: UPDATE tipos_entrada.cantidad_disponible
            Purchase->>QR: createQRTicket() por cada entrada
            QR->>BD: INSERT codigos_qr_entradas con hash seguro
            QR-->>Purchase: códigos QR generados
            Purchase->>BD: UPDATE compras.codigo_qr (concat)
            Purchase-->>App: Compra creada
        else Sin stock
            Purchase-->>App: Error disponibilidad
        end
    end
    App->>Cart: clearCart()
    App-->>Usuario: Éxito, redirige a /tickets
```

#### **UC-019: Ver Entradas (QR + compras)**
```mermaid
sequenceDiagram
    actor Usuario
    participant App as TicketsPage
    participant QR as QRCodeService
    participant Purchase as PurchaseService
    participant BD as Supabase

    Usuario->>App: Abrir /tickets
    App->>QR: getQRsByUser(userId)
    QR->>BD: SELECT codigos_qr_entradas (por id_usuario o email)
    BD-->>QR: Lista de QRs
    QR-->>App: QRs del usuario
    App->>Purchase: obtenerComprasUsuario(userId)
    Purchase->>BD: SELECT compras JOIN eventos/metodos_pago
    BD-->>Purchase: Compras
    Purchase-->>App: Compras enriquecidas
    App-->>Usuario: Mostrar QRs, compras y regenerar si falta alguno
```

#### **UC-020: Generar QR (creación individual)**
```mermaid
sequenceDiagram
    participant Purchase as PurchaseService
    participant QR as QRCodeService
    participant BD as Supabase
    participant Auth as Supabase Auth

    Purchase->>Auth: getUser() (debug RLS)
    Purchase->>QR: createQRTicket(ticketData)
    QR->>QR: generateSecureCode(hash SHA256)
    QR->>QR: generateQRImage(dataURL con qrcode)
    QR->>BD: INSERT codigos_qr_entradas (datos_qr, numero_entrada, fecha_generacion)
    BD-->>QR: Confirmación
    QR-->>Purchase: codigo_qr + qr_image
```

#### **UC-021: Validar Entrada (RPC en DB)**
```mermaid
sequenceDiagram
    actor Organizador
    participant App as Frontend (scanner)
    participant BD as Supabase RPC validar_ticket_qr

    Organizador->>App: Escanear código QR
    App->>BD: rpc validar_ticket_qr(p_codigo_qr, p_id_organizador)
    BD-->>App: {valido, mensaje, ticket_info}
    alt válido
        BD-->>App: Estado actualizado a "usado"
        App-->>Organizador: Acceso autorizado
    else inválido o usado
        App-->>Organizador: Mensaje de error
    end
```

### **🔔 Gestión de Notificaciones**

#### **UC-022: Enviar Notificación (interna)**
```mermaid
sequenceDiagram
    actor Organizador
    participant App as Frontend (React)
    participant Notif as NotificationService
    participant BD as Supabase

    Organizador->>App: Crear notificación
    App->>Notif: crearNotificacion(insert)
    Notif->>BD: INSERT notificaciones
    BD-->>Notif: Notificación creada
    Notif-->>App: Confirmación
    App-->>Organizador: Notificación guardada (no hay envío push/email externo)
```

#### **UC-023: Ver Notificaciones**
```mermaid
sequenceDiagram
    actor Usuario
    participant App as Frontend
    participant Notif as NotificationService
    participant BD as Supabase

    Usuario->>App: Abrir /notifications
    App->>Notif: obtenerNotificacionesUsuario(id)
    Notif->>BD: SELECT notificaciones WHERE id_usuario
    BD-->>Notif: Lista ordenada
    Notif-->>App: Datos
    Usuario->>App: Marcar como leída
    App->>Notif: marcarComoLeida(id)
    Notif->>BD: UPDATE notificaciones.leida=true
    BD-->>Notif: Confirmación
```

#### **UC-024: Configurar Preferencias (pendiente)**
```mermaid
sequenceDiagram
    actor Usuario
    participant App as Frontend

    Usuario->>App: Abrir preferencias de notificación
    App-->>Usuario: Flujo aún no implementado en frontend/BD
```

### **📊 Gestión de Analytics**

#### **UC-025: Ver Dashboard (según rol)**
```mermaid
sequenceDiagram
    actor Usuario
    participant App as Frontend
    participant Analytics as AnalyticsService
    participant BD as Supabase

    Usuario->>App: Abrir dashboard
    App->>Analytics: obtener datos según rol
    alt Rol asistente
        Analytics->>BD: SELECT compras del usuario
        BD-->>Analytics: Historial
        Analytics-->>App: Métricas personales
    else Rol organizador
        Analytics->>BD: SELECT eventos del organizador
        Analytics->>BD: SELECT compras + codigos_qr_entradas
        Analytics-->>App: Métricas de eventos
    else Rol admin
        Analytics->>BD: SELECT global (compras, usuarios, codigos_qr_entradas)
        Analytics-->>App: Métricas del sistema
    end
    App-->>Usuario: Mostrar dashboard
```

#### **UC-026: Generar Reportes (calculados en frontend)**
```mermaid
sequenceDiagram
    actor Usuario
    participant App as Frontend
    participant Analytics as AnalyticsService
    participant BD as Supabase

    Usuario->>App: Seleccionar rango y evento
    App->>Analytics: Consultas necesarias (compras, QR usados, vistas)
    Analytics->>BD: SELECT tablas relevantes
    BD-->>Analytics: Datos crudos
    Analytics-->>App: Métricas + agregados
    App-->>Usuario: Render/descarga (PDF/Excel pendiente en UI)
```

#### **UC-027: Ver Métricas en Tiempo Real**
```mermaid
sequenceDiagram
    participant App as Frontend
    participant Analytics as AnalyticsService
    participant BD as Supabase

    App->>Analytics: Polling/consultas periódicas
    Analytics->>BD: SELECT compras + codigos_qr_entradas recientes
    BD-->>Analytics: Datos actuales
    Analytics-->>App: KPIs recalculados
    App->>App: Actualizar UI en vivo
```

#### **UC-028: Dashboard del Organizador**
```mermaid
sequenceDiagram
    actor Organizador
    participant App as Frontend
    participant Analytics as AnalyticsService
    participant BD as Supabase

    Organizador->>App: Abrir /organizer/dashboard
    App->>Analytics: obtenerActividadRecienteOrganizador(id)
    Analytics->>BD: SELECT eventos del organizador
    Analytics->>BD: SELECT compras + codigos_qr_entradas (estado=usado)
    Analytics-->>App: Feed de ventas + escaneos
    App-->>Organizador: Mostrar actividad y KPIs
```

#### **UC-029: Gestionar Asistentes (foco en compras/QR)**
```mermaid
sequenceDiagram
    actor Organizador
    participant App as Frontend
    participant BD as Supabase

    Organizador->>App: Seleccionar evento
    App->>BD: SELECT compras JOIN usuarios para el evento
    BD-->>App: Lista de compradores
    App-->>Organizador: Ver/filtrar asistentes (export/mensajes masivos no implementados)
```

#### **UC-030: Ver Métricas de Eventos**
```mermaid
sequenceDiagram
    actor Organizador
    participant App as Frontend
    participant Analytics as AnalyticsService
    participant BD as Supabase

    Organizador->>App: Solicitar métricas de evento
    Analytics->>BD: SELECT analiticas_eventos + compras + codigos_qr_entradas
    BD-->>Analytics: Datos
    Analytics-->>App: totalRevenue, conversionRate, asistenciaPromedio, etc.
    App-->>Organizador: Mostrar métricas
```

### **⚙️ Gestión de Administración**

#### **UC-031: Crear Códigos Promocionales**
```mermaid
sequenceDiagram
    actor Organizador
    participant App as Frontend
    participant Promo as PromoCodeService
    participant BD as Supabase

    Organizador->>App: Completar datos del código
    App->>Promo: validar y guardar
    Promo->>BD: INSERT codigos_promocionales
    BD-->>Promo: Confirmación
    Promo-->>App: Código creado
```

#### **UC-032: Gestionar Lista de Espera (pendiente)**
```mermaid
sequenceDiagram
    actor Organizador
    participant App as Frontend

    Organizador->>App: Intentar activar lista de espera
    App-->>Organizador: Flujo no implementado en código actual
```

#### **UC-033: Configurar Check-in (a través de validación QR)**
```mermaid
sequenceDiagram
    actor Organizador
    participant App as Frontend
    participant BD as Supabase

    Organizador->>App: Ajustar parámetros (UI limitada)
    App-->>Organizador: El check-in se basa en rpc validar_ticket_qr (sin configuración extra)
```

#### **UC-034: Dashboard de Administración**
```mermaid
sequenceDiagram
    actor Administrador
    participant App as Frontend
    participant Analytics as AnalyticsService
    participant BD as Supabase

    Administrador->>App: Abrir /admin
    App->>Analytics: Consultas globales (usuarios, eventos, compras)
    Analytics->>BD: SELECT tablas globales
    BD-->>Analytics: Datos
    Analytics-->>App: KPIs globales
    App-->>Administrador: Dashboard administración
```

#### **UC-035: Gestionar Configuración del Sistema (pendiente)**
```mermaid
sequenceDiagram
    actor Administrador
    participant App as Frontend

    Administrador->>App: Abrir ajustes del sistema
    App-->>Administrador: Configuración avanzada no implementada en UI/BD
```

#### **UC-036: Ver Métricas Globales**
```mermaid
sequenceDiagram
    actor Administrador
    participant App as Frontend
    participant Analytics as AnalyticsService
    participant BD as Supabase

    Administrador->>App: Acceder a métricas globales
    Analytics->>BD: SELECT compras + usuarios + codigos_qr_entradas
    BD-->>Analytics: Datos globales
    Analytics-->>App: Métricas agregadas
    App-->>Administrador: Mostrar KPIs
```

#### **UC-037: Monitorear Rendimiento (no implementado)**
```mermaid
sequenceDiagram
    actor Administrador
    participant App as Frontend

    Administrador->>App: Consultar monitoreo
    App-->>Administrador: Flujo de monitoreo/alertas no disponible en frontend
```

#### **UC-038: Gestionar Backup y Restauración (no implementado)**
```mermaid
sequenceDiagram
    actor Administrador
    participant App as Frontend

    Administrador->>App: Iniciar backup/restauración
    App-->>Administrador: Gestión de backups no implementada en UI
```

#### **UC-039: Configurar Integraciones (no implementado)**
```mermaid
sequenceDiagram
    actor Administrador
    participant App as Frontend

    Administrador->>App: Configurar integración externa
    App-->>Administrador: Aún no disponible en código
```

---

## 📊 **Estadísticas de Diagramas de Secuencia**

### **Diagramas por Categoría**
- **Autenticación y Gestión de Usuarios**: 5 diagramas
- **Gestión de Eventos**: 5 diagramas
- **Gestión de Pagos**: 5 diagramas
- **Gestión de Notificaciones**: 3 diagramas
- **Gestión de Analytics**: 6 diagramas
- **Gestión de Administración**: 9 diagramas

### **Total de Diagramas**: 33 diagramas de secuencia

### **Participantes por Diagrama**
- **Sistema/App**: 33 diagramas
- **Supabase (BD)**: 28 diagramas
- **Supabase Auth**: 4 diagramas
- **QR/Compra/Promo Services**: 6 diagramas
- **Servicios pendientes/no implementados**: 6 diagramas marcados como tal

---

## 🎯 **Patrones de Interacción Identificados**

### **1. Patrón de Autenticación con verificación obligatoria**
- Limpieza de sesión previa, signIn con Supabase y guard de email confirmado

### **2. Patrón de Compras y QR**
- Validación de stock en `tipos_entrada`, creación en `compras`, generación de QR con hash seguro y guardado en `codigos_qr_entradas`

### **3. Patrón de Eventos con fans**
- Inserción de evento seguida de notificación interna a seguidores del organizador

### **4. Patrón de Analytics desde tablas propias**
- KPIs calculados en frontend usando `compras`, `codigos_qr_entradas` y `analiticas_eventos` (sin servicios externos)

### **5. Patrón de funcionalidad pendiente**
- Recuperación de contraseña, preferencias de notificación avanzadas, lista de espera, monitoreo e integraciones están marcados como no implementados en el código actual

---

*Diagramas actualizados según la lógica vigente del repositorio. Se mantienen los identificadores UC para trazabilidad con la documentación anterior.*
