# 📚 EventHub – FAQ para Agente IA

> Base de conocimiento pensada para asistentes, organizadores y administradores del sistema EventHub.

---

## 1. Preguntas Generales sobre EventHub

### 1.1 ¿Qué es EventHub?
EventHub es una plataforma web para gestionar eventos de principio a fin: creación, venta de entradas, control de asistencia, pagos, estadísticas y reportes. Está pensada tanto para asistentes (comprar y usar entradas) como para organizadores (gestionar eventos) y administradores del sistema.

### 1.2 ¿Qué roles de usuario existen en el sistema?
En EventHub existen tres roles principales:
- **Asistente**: usuario final que compra y usa entradas.
- **Organizador**: crea y gestiona eventos, tipos de entrada y asistentes.
- **Administrador**: gestiona usuarios, supervisa el sistema y ve métricas globales.

### 1.3 ¿Necesito una cuenta para usar EventHub?
Depende del rol:
- **Asistente**: para comprar y gestionar tus entradas normalmente necesitas una cuenta. Sin embargo, hay flujos de consulta pública de tickets por QR donde no necesitas iniciar sesión.
- **Organizador**: sí, necesitas cuenta y permisos de organizador.
- **Administrador**: solo usuarios con permisos especiales asignados.

### 1.4 ¿En qué dispositivos puedo usar EventHub?
Puedes usar EventHub en cualquier navegador moderno (desktop, tablet o móvil). Para usar la cámara (escaneo de QR), se recomienda:
- Usar HTTPS (sitio seguro).
- Conceder acceso a la cámara al navegador.

### 1.5 ¿Dónde puedo encontrar la documentación oficial?
La documentación técnica y funcional está disponible en la sección `Documentacion/` del proyecto, incluyendo:
- Guía de instalación
- Arquitectura del sistema
- Casos de uso
- Sistema de QR y más

---

## 2. Registro, Login y Gestión de Cuenta (Autenticación)

### 2.1 ¿Cómo me registro como usuario en EventHub?
Desde la interfaz principal, ve a la opción `Registrarse`:
1. Ingresa nombre, correo y contraseña.
2. Acepta los términos y condiciones (si aplica).
3. Confirma tu correo electrónico si el sistema te lo solicita.

Una vez completado, puedes iniciar sesión con tu correo y contraseña.

### 2.2 ¿Cómo inicio sesión?
Usa la opción `Iniciar Sesión` y:
1. Introduce tu correo registrado.
2. Introduce tu contraseña.
3. Haz clic en “Ingresar”.

Si tus credenciales son correctas, se cargará tu dashboard según tu rol.

### 2.3 Olvidé mi contraseña, ¿qué hago?
En la pantalla de login:
1. Haz clic en “Olvidé mi contraseña”.
2. Ingresa tu correo electrónico.
3. Revisa tu bandeja de entrada para un correo de recuperación.
4. Sigue el enlace para definir una nueva contraseña.

### 2.4 ¿Puedo cambiar mi contraseña desde mi cuenta?
Sí. Desde tu perfil:
1. Ve a la sección de `Perfil` o `Configuración`.
2. Elige “Cambiar contraseña”.
3. Introduce tu contraseña actual.
4. Define la nueva contraseña y confírmala.

### 2.5 ¿Cómo actualizo mis datos personales (nombre, teléfono, etc.)?
Desde tu perfil:
1. Abre la sección `Perfil` o `Mi cuenta`.
2. Edita los campos permitidos (nombre, teléfono, foto, etc.).
3. Guarda los cambios.

### 2.6 ¿Qué hago si no recibo el correo de confirmación o recuperación?
Prueba lo siguiente:
- Revisa la carpeta de spam o correo no deseado.
- Verifica que el correo registrado sea el correcto.
- Espera unos minutos, puede haber latencia en el proveedor.
Si persiste, contacta soporte del sistema indicando tu correo y el problema.

---

## 3. Rol Asistente – Explorar Eventos y Entradas

### 3.1 ¿Cómo encuentro eventos disponibles?
Desde el menú principal:
1. Ve a `Explorar Eventos` o `Eventos`.
2. Puedes filtrar por categoría, fecha, ubicación, organizador, etc. (según lo habilitado).
3. Haz clic en un evento para ver detalles.

### 3.2 ¿Cómo compro una entrada para un evento?
1. Entra al detalle del evento.
2. Selecciona el tipo de entrada (ej. General, VIP, Estudiante).
3. Indica la cantidad.
4. Procede al pago.
5. Completa los datos requeridos y confirma.

Al finalizar el pago exitoso, se generará tu ticket y recibirás un correo con la información y el código QR (si aplica).

### 3.3 ¿Dónde puedo ver mis entradas compradas?
Desde la sección `Mis Boletas` o `Mis Entradas`:
- Verás el listado de tus tickets.
- Cada entrada mostrará información del evento, fecha, tipo de ticket y su estado (válido, usado, cancelado, etc.).
- Puedes abrir el detalle para ver el código QR.

### 3.4 ¿Necesito imprimir mi entrada?
No es obligatorio imprimirla. Puedes:
- Mostrar el código QR desde tu móvil.
- En algunos casos, se puede usar un código alfanumérico si se permite ingreso manual.

### 3.5 Compré una entrada pero no recibí el correo, ¿qué hago?
1. Revisa `Mis Boletas` dentro de tu cuenta; tus tickets deberían aparecer allí.
2. Verifica la carpeta de spam del correo.
3. Comprueba que el pago realmente se haya completado.
4. Si no aparece, contacta soporte con:
   - Correo con el que compraste.
   - Nombre del evento.
   - Fecha aproximada de compra.

### 3.6 ¿Puedo transferir mi entrada a otra persona?
Depende de la configuración del evento:
- Si el organizador habilitó transferencias, podrás realizar la gestión desde `Mis Boletas` (por ejemplo, cambiando el nombre o correo del asistente).
- Si no está habilitado, deberás contactar al organizador o a soporte.

---

## 4. Sistema de Tickets y Códigos QR

### 4.1 ¿Cómo funciona el código QR de mi entrada?
Al completar la compra:
1. El sistema genera un código QR único asociado a tu ticket.
2. Este QR se envía por correo y se muestra en `Mis Boletas`.
3. En el acceso al evento, el organizador escanea el QR para validar tu entrada y registrar tu asistencia.

### 4.2 ¿Puedo consultar mi entrada sin iniciar sesión?
Sí, si el sistema de consulta pública está habilitado:
1. Usa la ruta de consulta pública `/consultar-entrada` (o su equivalente en la interfaz).
2. Introduce el código del ticket o escanea el QR con el lector provisto.
3. El sistema mostrará la información básica del ticket (estado, evento, fecha, etc.).

### 4.3 Mi código QR muestra “no válido”, ¿qué significa?
Puede deberse a:
- El ticket no existe o fue cancelado.
- El QR fue mal escaneado o está dañado.
- El ticket ya fue utilizado (estado “usado”).

El agente puede sugerir:
- Revisar que se escanee el QR completo y con buena iluminación.
- Verificar que el evento y la fecha corresponden.
- Si eres asistente, intentar mostrar el ticket desde `Mis Boletas` en lugar de una captura vieja.

### 4.4 ¿Qué significa el estado de mi ticket?
Estados más comunes:
- **Válido / Activo**: ticket listo para usar.
- **Usado**: ya se registró el ingreso al evento.
- **Cancelado**: el ticket fue anulado.
- **Expirado**: el evento ya pasó y el ticket no fue usado.

### 4.5 La cámara no funciona al escanear QR, ¿qué puedo hacer?
Sugerencias:
- Verifica que el navegador tenga permiso para usar la cámara.
- Asegúrate de estar usando el sitio en HTTPS.
- Prueba con otro navegador o dispositivo.
- Si la cámara sigue fallando, usa el ingreso manual del código (si el sistema lo permite).

---

## 5. Rol Organizador – Gestión de Eventos

### 5.1 ¿Cómo me convierto en organizador de eventos?
Normalmente:
1. Debes registrar una cuenta de usuario.
2. Solicitar permisos de organizador al administrador del sistema o al soporte.
3. Una vez asignado el rol, verás opciones adicionales en el dashboard (como `Mis Eventos`, `Crear Evento`, etc.).

### 5.2 ¿Cómo creo un nuevo evento?
Dentro del dashboard de organizador:
1. Ve a la sección `Crear Evento` o `Nuevo Evento`.
2. Completa los datos básicos: nombre, descripción, fecha, horarios, ubicación, categorías.
3. Configura los tipos de entrada (nombre, cupo, precio, restricciones).
4. Guarda el evento; según la configuración, puede quedar:
   - En borrador.
   - Publicado (visible a los asistentes).

### 5.3 ¿Cómo configuro tipos de entradas (VIP, General, etc.)?
En el formulario de creación/edición de evento:
1. Sección `Tipos de Entrada` o similar.
2. Para cada tipo define:
   - Nombre (Ej: “General”, “VIP”).
   - Precio.
   - Cupo disponible.
   - Fecha/hora de inicio y fin de ventas (si aplica).
3. Guarda los cambios.

### 5.4 ¿Puedo pausar la venta de entradas?
Sí, dependiendo del diseño del sistema puedes:
- Desactivar temporalmente un tipo de entrada.
- Ajustar la fecha de cierre de ventas.
- Poner el evento como “No disponible” para nuevas compras.

### 5.5 ¿Cómo veo la lista de asistentes a mi evento?
En tu dashboard de organizador:
1. Selecciona el evento.
2. Abre la sección `Asistentes` o `Lista de invitados`.
3. Verás el detalle de cada ticket: nombre, correo (si se capturó), estado del ticket, check-in, etc.
4. En algunos casos, podrás exportar esta lista a Excel o CSV.

### 5.6 ¿Cómo controlo la asistencia en la entrada del evento?
Hay dos modos típicos:
1. **Escaneo de QR**: usando el módulo de escaneo desde el dashboard (ideal en móviles/tablets).
2. **Ingreso manual de código**: si no se puede usar la cámara, se puede ingresar manualmente el código del ticket.

Cada validación:
- Marca el ticket como “usado”.
- Registra la fecha y hora del check-in.

### 5.7 ¿Puedo enviar notificaciones a mis asistentes?
Sí, si el módulo de notificaciones está habilitado:
1. En el evento, busca la opción de notificaciones.
2. Filtra la audiencia (todos los asistentes, solo confirmados, etc.).
3. Redacta el mensaje (recordatorios, cambios de horario, etc.).
4. Envía la notificación (correo, push, etc., según esté configurado).

---

## 6. Pagos y Facturación

### 6.1 ¿Qué métodos de pago soporta EventHub?
EventHub está integrado con un proveedor de pagos (por ejemplo, Stripe). Esto permite:
- Pagos con tarjetas de crédito/débito.
- Otros métodos disponibles según la configuración de Stripe y el país.

### 6.2 ¿Es seguro pagar en EventHub?
Sí. La información de pago:
- Es procesada por el proveedor de pagos (ej. Stripe).
- No se almacenan los datos completos de la tarjeta en la aplicación.
- Se usa conexión segura (HTTPS) en todo el flujo.

### 6.3 ¿Qué pasa si mi pago falla?
Posibles causas:
- Fondos insuficientes.
- Tarjeta rechazada por el banco.
- Datos de la tarjeta incorrectos.
- Problemas temporales con el proveedor de pagos.

Sugerencias:
- Verificar los datos ingresados.
- Probar con otra tarjeta o método de pago.
- Esperar unos minutos y reintentar.
- Contactar a soporte si el cobro se hizo pero no ves el ticket.

### 6.4 ¿Puedo obtener un comprobante o factura de mi compra?
Generalmente:
- Tras el pago, se genera un comprobante asociado al ticket.
- Puedes descargarlo o imprimirlo desde `Mis Boletas` o desde el correo de confirmación.
Si necesitas una factura formal, revisa si el organizador ofrece la opción o contacta soporte.

---

## 7. Analytics y Reportes

### 7.1 ¿Qué tipo de estadísticas ofrece EventHub a los organizadores?
Entre otras, el módulo de Analytics puede mostrar:
- Número de eventos creados y activos.
- Ventas por evento y por tipo de entrada.
- Tasas de asistencia y no asistencia.
- Ingresos totales y por período.
- Rendimiento por ubicación o día de la semana.
- Eventos destacados (mejor desempeño).

### 7.2 ¿Puedo ver un dashboard general de mis eventos?
Sí. Como organizador:
1. Ingresa a tu dashboard.
2. Ve a la sección `Analytics` o `Estadísticas`.
3. Allí verás métricas agregadas y gráficos relacionados con tus eventos.

### 7.3 ¿Cómo exporto un reporte de mis eventos?
Desde la sección de reportes/analytics:
1. Selecciona el período (año y opcionalmente mes).
2. Haz clic en `Exportar Reporte` o similar.
3. Se descargará un archivo, normalmente en formato Excel (`.xlsx`), con varias hojas (resumen, detalle por evento, ventas por tipo de entrada, etc.).

### 7.4 ¿Qué información incluye un reporte exportado?
Según la configuración actual, el reporte puede incluir:
- Resumen ejecutivo: métricas globales del período.
- Detalle de eventos: ingresos, asistentes, tasa de asistencia.
- Ventas por tipo de entrada.
- Ingresos mensuales y comparación con períodos anteriores.
- Métricas de crecimiento (solo en reportes anuales, si aplica).

### 7.5 ¿Puedo filtrar las estadísticas por mes o año?
Sí. Normalmente puedes:
- Seleccionar un **año** para ver resumen anual.
- Seleccionar **año + mes** para ver estadísticas detalladas de ese período.

---

## 8. Rol Administrador – Gestión del Sistema

### 8.1 ¿Qué puede hacer un administrador del sistema?
Entre otras funciones:
- Gestionar usuarios (crear, bloquear, asignar roles).
- Supervisar eventos globales.
- Revisar métricas a nivel de plataforma (no solo por organizador).
- Configurar parámetros globales (integraciones, límites, etc.).
- Auditar operaciones clave.

### 8.2 ¿Cómo asigno el rol de organizador a un usuario?
Desde el panel de administración:
1. Busca al usuario por correo o nombre.
2. Abre su detalle.
3. Asigna el rol de `Organizador` (o el rol apropiado).
4. Guarda los cambios.

El usuario verá opciones de organizador la próxima vez que inicie sesión.

### 8.3 ¿Puedo desactivar temporalmente una cuenta de usuario?
Sí. El administrador puede:
1. Marcar la cuenta como inactiva o bloqueada.
2. El usuario no podrá iniciar sesión o comprar entradas.
3. Se pueden reactivar posteriormente si se requiere.

---

## 9. Seguridad y Privacidad

### 9.1 ¿Cómo protege EventHub la información de los usuarios?
Algunos mecanismos de seguridad:
- Autenticación con correo y contraseña.
- Protección de rutas sensibles (solo accesibles para usuarios autenticados y con rol adecuado).
- Uso de HTTPS para protección de datos en tránsito.
- Manejo seguro de tokens de sesión (por ejemplo, usando Supabase Auth).

### 9.2 ¿Se almacenan mis datos de tarjeta en EventHub?
No. Los datos de tarjeta se procesan a través del proveedor de pagos (ej. Stripe). EventHub solo guarda referencias seguras (como IDs de transacción) y el estado del pago.

### 9.3 ¿Qué hago si sospecho que otra persona está usando mi cuenta?
El agente debe sugerir:
1. Cambiar inmediatamente la contraseña desde la opción `Cambiar contraseña`.
2. Cerrar sesión en todos los dispositivos (si la plataforma lo soporta).
3. Contactar a soporte indicando el problema y la actividad sospechosa.

---

## 10. Problemas Comunes y Solución de Errores

### 10.1 No puedo iniciar sesión, ¿qué reviso primero?
- Verifica que el correo y contraseña sean correctos.
- Asegúrate de que tu cuenta no esté bloqueada.
- Prueba el flujo de “Olvidé mi contraseña”.
- Revisa si hay algún mensaje de error específico (por ejemplo, correo no verificado).

### 10.2 Veo un error relacionado con la base de datos o “Database does not exist”
Si eres usuario final:
- Puede ser un problema temporal del sistema; espera unos minutos e inténtalo de nuevo o contacta soporte.

Si eres administrador o desarrollador:
- Verifica que la base de datos haya sido creada correctamente y que las migraciones estén aplicadas (ver `Documentacion/Guia_Instalacion.md`).

### 10.3 Recibo un error de permisos al intentar validar tickets
- Asegúrate de haber iniciado sesión como organizador del evento o con permisos adecuados.
- Verifica que el evento realmente te pertenezca.
- Si el problema persiste, un administrador debe revisar la asignación de roles y permisos.

### 10.4 El sistema indica “Stripe key invalid” u otro error de pagos
- Si eres usuario final: contacta soporte y evita reintentar pagos repetidamente hasta que se resuelva.
- Si eres administrador o desarrollador:
  - Verifica las variables de entorno de Stripe.
  - Consulta la `Guia_Instalacion` y la documentación de integraciones.

---

## 11. Soporte y Contacto

### 11.1 ¿Qué hago si no encuentro la respuesta a mi duda?
El agente puede sugerir:
1. Revisar las secciones de ayuda dentro de la plataforma.
2. Consultar la documentación disponible (`README`, `Documentacion/`).
3. Contactar al soporte del sistema (correo o canal habilitado).
4. En entornos de desarrollo, abrir un Issue en el repositorio del proyecto.

### 11.2 ¿Existe soporte 24/7?
La interfaz de marketing del proyecto suele anunciar soporte 24/7. Sin embargo, en un entorno real, la disponibilidad concreta de soporte depende del equipo que opere la instancia de EventHub. El agente puede:
- Indicar el canal de soporte configurado (email, chat, etc.).
- Aclarar que el tiempo de respuesta puede variar según el equipo.

---

## 12. Sugerencias para el Agente IA

> Esta sección es meta, para orientar al agente IA sobre cómo usar esta FAQ.

- Siempre identifica primero el **rol** del usuario (Asistente, Organizador, Administrador).
- Si una duda no tiene respuesta directa, orienta hacia:
  - `Mis Boletas` / `Mi Cuenta`.
  - El organizador del evento.
  - El soporte del sistema.
- En temas sensibles (pagos, seguridad de cuenta), evita prometer soluciones técnicas; guía al usuario a soporte humano si es necesario.
- Usa un lenguaje claro, breve y no técnico con los usuarios finales.

---