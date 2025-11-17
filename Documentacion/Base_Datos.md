# 📊 Documentación Completa de Base de Datos - EventHub

## 🎯 **Resumen General**

Esta documentación describe la estructura completa de la base de datos del sistema EventHub, incluyendo todas las tablas, relaciones, tipos de datos y funcionalidades implementadas.

---

## 🔗 **Explicación de Relaciones**

### **"Referenciada por"** (Foreign Key IN)
- Significa que **OTRAS tablas** tienen claves foráneas que apuntan hacia **ESTA tabla**
- Esta tabla es **independiente** y otras tablas **dependen** de ella
- Las claves foráneas están **EN OTRAS tablas**

### **"Referencia a"** (Foreign Key OUT)
- Significa que **ESTA tabla** tiene claves foráneas que apuntan hacia **OTRAS tablas**
- Esta tabla **depende** de otras tablas
- Las claves foráneas están **EN ESTA tabla**

### **Ejemplo práctico:**
```
Tabla USUARIOS:
- Referenciada por: compras.id_usuario, eventos.id_organizador
  (otras tablas apuntan hacia usuarios)
- Referencia a: NINGUNA
  (usuarios no apunta hacia otras tablas)

Tabla EVENTOS:
- Referenciada por: tipos_entrada.id_evento, compras.id_evento
  (otras tablas apuntan hacia eventos)
- Referencia a: usuarios.id (a través de id_organizador)
  (eventos apunta hacia usuarios)
```

---

## 📋 **Índice de Tablas**

1. [usuarios](#usuarios)
2. [eventos](#eventos)
3. [tipos_entrada](#tipos_entrada)
4. [compras](#compras)
5. [notificaciones](#notificaciones)
6. [plantillas_email](#plantillas_email)
7. [analiticas_eventos](#analiticas_eventos)
8. [codigos_promocionales](#codigos_promocionales)
9. [asistencia_eventos](#asistencia_eventos)
10. [favoritos_usuarios](#favoritos_usuarios)
11. [calificaciones_eventos](#calificaciones_eventos)
12. [configuraciones_sistema](#configuraciones_sistema)
13. [codigos_qr_entradas](#codigos_qr_entradas)
14. [seguidores_organizadores](#seguidores_organizadores)
15. [metodos_pago](#metodos_pago)

---

## 📊 **Tablas del Sistema**

### usuarios
**Descripción:** Tabla principal para la gestión de usuarios del sistema.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `uuid` | **PK** - Identificador único del usuario |
| `correo_electronico` | `text` | **UNIQUE** - Email del usuario |
| `nombre_completo` | `text` | Nombre completo del usuario |
| `rol` | `tipo_usuario` | Rol del usuario (enum) |
| `url_avatar` | `text` | URL del avatar del usuario |
| `preferencias` | `jsonb` | Preferencias del usuario en formato JSON |
| `fecha_creacion` | `timestamptz` | Fecha de creación del registro |
| `fecha_actualizacion` | `timestamptz` | Fecha de última actualización |
| `contraseña` | `text` | Contraseña del usuario (hash) |

**Relaciones:**
- Referenciada por: 
  - `compras.id_usuario` (como comprador)
  - `notificaciones.id_usuario` (como destinatario)
  - `favoritos_usuarios.id_usuario` (como usuario que marca favoritos)
  - `calificaciones_eventos.id_usuario` (como usuario que califica)
  - `eventos.id_organizador` (como organizador de eventos)
  - `codigos_promocionales.id_organizador` (como organizador que crea códigos)
  - `asistencia_eventos.id_usuario` (como usuario que asiste)
  - `asistencia_eventos.validado_por` (como validador de asistencia)
  - `configuraciones_sistema.actualizado_por` (como usuario que actualiza configuraciones)
  - `codigos_qr_entradas.id_usuario` (como propietario de QR)
  - `codigos_qr_entradas.escaneado_por` (como último validador QR)
  - `seguidores_organizadores.id_usuario_seguidor` (como seguidor)
  - `seguidores_organizadores.id_organizador` (como organizador seguido)
  - `metodos_pago.id_organizador` (como organizador que define métodos)

---

### eventos
**Descripción:** Tabla principal para la gestión de eventos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `uuid` | **PK** - Identificador único del evento |
| `titulo` | `text` | Título del evento |
| `descripcion` | `text` | Descripción detallada del evento |
| `url_imagen` | `text` | URL de la imagen del evento |
| `fecha_evento` | `date` | Fecha del evento |
| `hora_evento` | `time` | Hora del evento |
| `ubicacion` | `text` | Ubicación del evento |
| `categoria` | `text` | Categoría del evento |
| `maximo_asistentes` | `int4` | Máximo número de asistentes |
| `asistentes_actuales` | `int4` | Número actual de asistentes |
| `id_organizador` | `uuid` | **FK** - ID del organizador |
| `nombre_organizador` | `text` | Nombre del organizador |
| `estado` | `estado_evento` | Estado del evento (enum) |
| `etiquetas` | `_text` | Array de etiquetas del evento |
| `fecha_creacion` | `timestamptz` | Fecha de creación |
| `fecha_actualizacion` | `timestamptz` | Fecha de última actualización |

**Relaciones:**
- Referenciada por: `tipos_entrada.id_evento`, `compras.id_evento`, `analiticas_eventos.id_evento`, `codigos_promocionales.id_evento`, `asistencia_eventos.id_evento`, `favoritos_usuarios.id_evento`, `calificaciones_eventos.id_evento`
- Referencia a: `usuarios.id` (a través de `id_organizador`)
 - Referenciada adicionalmente por: `codigos_qr_entradas.id_evento`

---

### tipos_entrada
**Descripción:** Tipos de entradas disponibles para cada evento.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `uuid` | **PK** - Identificador único del tipo de entrada |
| `id_evento` | `uuid` | **FK** - ID del evento |
| `nombre_tipo` | `text` | Nombre del tipo de entrada |
| `precio` | `numeric` | Precio del tipo de entrada |
| `descripcion` | `text` | Descripción del tipo de entrada |
| `cantidad_maxima` | `int4` | Cantidad máxima disponible |
| `cantidad_disponible` | `int4` | Cantidad actual disponible |
| `fecha_creacion` | `timestamptz` | Fecha de creación |
| `fecha_actualizacion` | `timestamptz` | Fecha de última actualización |
| `nombre_evento` | `text` | Nombre del evento (denormalizado) |

**Relaciones:**
- Referenciada por: `compras.id_tipo_entrada`
- Referencia a: `eventos.id` (a través de `id_evento`)

---

### compras
**Descripción:** Registro de todas las compras realizadas en el sistema.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `uuid` | **PK** - Identificador único de la compra |
| `id_usuario` | `uuid` | **FK** - ID del usuario comprador |
| `id_evento` | `uuid` | **FK** - ID del evento |
| `id_tipo_entrada` | `uuid` | **FK** - ID del tipo de entrada |
| `cantidad` | `int4` | Cantidad de entradas compradas |
| `precio_unitario` | `numeric` | Precio unitario de la entrada |
| `total_pagado` | `numeric` | Total pagado por la compra |
| `estado` | `estado_compra` | Estado de la compra (enum) |
| `codigo_qr` | `text` | Código QR para validación |
| `numero_orden` | `text` | Número de orden de la compra |
| `fecha_creacion` | `timestamptz` | Fecha de creación |
| `fecha_actualizacion` | `timestamptz` | Fecha de última actualización |

**Relaciones:**
- Referenciada por: `asistencia_eventos.id_compra`
- Referencia a: 
  - `usuarios.id` (a través de `id_usuario`)
  - `eventos.id` (a través de `id_evento`)
  - `tipos_entrada.id` (a través de `id_tipo_entrada`)
 - Referenciada adicionalmente por: `codigos_qr_entradas.id_compra`

---

### notificaciones
**Descripción:** Sistema de notificaciones para usuarios.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `uuid` | **PK** - Identificador único de la notificación |
| `id_usuario` | `uuid` | **FK** - ID del usuario destinatario |
| `tipo` | `tipo_notificacion` | Tipo de notificación (enum) |
| `titulo` | `text` | Título de la notificación |
| `mensaje` | `text` | Mensaje de la notificación |
| `leida` | `bool` | Estado de lectura |
| `url_accion` | `text` | URL de acción asociada |
| `texto_accion` | `text` | Texto del botón de acción |
| `fecha_creacion` | `timestamptz` | Fecha de creación |

**Relaciones:**
- Referenciada por: Ninguna
- Referencia a: `usuarios.id` (a través de `id_usuario`)

---

### plantillas_email
**Descripción:** Plantillas para envío de emails automatizados.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `uuid` | **PK** - Identificador único de la plantilla |
| `nombre_plantilla` | `text` | Nombre de la plantilla |
| `asunto` | `text` | Asunto del email |
| `contenido` | `text` | Contenido HTML del email |
| `tipo` | `tipo_plantilla_email` | Tipo de plantilla (enum) |
| `fecha_creacion` | `timestamptz` | Fecha de creación |
| `fecha_actualizacion` | `timestamptz` | Fecha de última actualización |

**Relaciones:**
- Referenciada por: Ninguna

---

### analiticas_eventos
**Descripción:** Métricas y analytics de eventos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `uuid` | **PK** - Identificador único del registro |
| `id_evento` | `uuid` | **FK** - ID del evento |
| `total_visualizaciones` | `int4` | Total de visualizaciones |
| `total_ventas` | `int4` | Total de ventas |
| `ingresos_totales` | `numeric` | Ingresos totales |
| `tasa_conversion` | `numeric` | Tasa de conversión |
| `precio_promedio_entrada` | `numeric` | Precio promedio de entrada |
| `tipo_entrada_mas_vendida` | `text` | Tipo de entrada más vendida |
| `tasa_asistencia` | `numeric` | Tasa de asistencia |
| `reembolsos` | `int4` | Número de reembolsos |
| `monto_reembolsos` | `numeric` | Monto total de reembolsos |
| `fecha_creacion` | `timestamptz` | Fecha de creación |
| `fecha_actualizacion` | `timestamptz` | Fecha de última actualización |

**Relaciones:**
- Referenciada por: Ninguna
- Referencia a: `eventos.id` (a través de `id_evento`)

---

### codigos_promocionales
**Descripción:** Sistema de códigos promocionales y descuentos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `uuid` | **PK** - Identificador único del código |
| `codigo` | `varchar` | **UNIQUE** - Código promocional |
| `descripcion` | `text` | Descripción del descuento |
| `tipo_descuento` | `varchar` | Tipo de descuento |
| `valor_descuento` | `numeric` | Valor del descuento |
| `fecha_inicio` | `timestamptz` | Fecha de inicio de validez |
| `fecha_fin` | `timestamptz` | Fecha de fin de validez |
| `uso_maximo` | `int4` | Máximo número de usos |
| `usos_actuales` | `int4` | Usos actuales del código |
| `id_evento` | `uuid` | **FK** - ID del evento |
| `id_organizador` | `uuid` | **FK** - ID del organizador |
| `activo` | `bool` | Estado activo del código |
| `fecha_creacion` | `timestamptz` | Fecha de creación |
| `fecha_actualizacion` | `timestamptz` | Fecha de última actualización |

**Relaciones:**
- Referenciada por: Ninguna
- Referencia a: 
  - `eventos.id` (a través de `id_evento`)
  - `usuarios.id` (a través de `id_organizador`)

---

### asistencia_eventos
**Descripción:** Control de asistencia y validación de entradas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `uuid` | **PK** - Identificador único del registro |
| `id_compra` | `uuid` | **FK** - ID de la compra |
| `id_evento` | `uuid` | **FK** - ID del evento |
| `id_usuario` | `uuid` | **FK** - ID del usuario |
| `fecha_asistencia` | `timestamptz` | Fecha y hora de asistencia |
| `validado_por` | `uuid` | **FK** - ID del validador |
| `metodo_validacion` | `varchar` | Método de validación usado |
| `observaciones` | `text` | Observaciones del validador |
| `estado_asistencia` | `varchar` | Estado de la asistencia |
| `ubicacion_validacion` | `point` | Coordenadas de validación |
| `dispositivo_validacion` | `jsonb` | Info del dispositivo validador |
| `fecha_creacion` | `timestamptz` | Fecha de creación |
| `fecha_actualizacion` | `timestamptz` | Fecha de última actualización |

**Relaciones:**
- Referenciada por: Ninguna
- Referencia a: 
  - `compras.id` (a través de `id_compra`)
  - `eventos.id` (a través de `id_evento`)
  - `usuarios.id` (a través de `id_usuario`)
  - `usuarios.id` (a través de `validado_por`)

---

### favoritos_usuarios
**Descripción:** Sistema de favoritos y recordatorios de usuarios.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `uuid` | **PK** - Identificador único del favorito |
| `id_usuario` | `uuid` | **FK** - ID del usuario |
| `id_evento` | `uuid` | **FK** - ID del evento |
| `categoria_favorito` | `varchar` | Categoría del favorito |
| `notas_personales` | `text` | Notas personales del usuario |
| `recordatorio_activo` | `bool` | Estado del recordatorio |
| `fecha_recordatorio` | `timestamptz` | Fecha del recordatorio |
| `prioridad` | `int4` | Prioridad del favorito |
| `visible` | `bool` | Visibilidad del favorito |
| `fecha_creacion` | `timestamptz` | Fecha de creación |
| `fecha_actualizacion` | `timestamptz` | Fecha de última actualización |

**Relaciones:**
- Referenciada por: Ninguna
- Referencia a: 
  - `usuarios.id` (a través de `id_usuario`)
  - `eventos.id` (a través de `id_evento`)

---

### calificaciones_eventos
**Descripción:** Sistema de calificaciones y reseñas de eventos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `uuid` | **PK** - Identificador único de la calificación |
| `id_evento` | `uuid` | **FK** - ID del evento |
| `id_usuario` | `uuid` | **FK** - ID del usuario |
| `calificacion` | `int4` | Calificación numérica (1-5) |
| `comentario` | `text` | Comentario del usuario |
| `aspectos_positivos` | `_text` | Array de aspectos positivos |
| `aspectos_negativos` | `_text` | Array de aspectos negativos |
| `recomendaria` | `bool` | Si recomendaría el evento |
| `categoria_calificacion` | `varchar` | Categoría de la calificación |
| `fecha_evento_asistido` | `date` | Fecha del evento asistido |
| `anonima` | `bool` | Si la calificación es anónima |
| `moderada` | `bool` | Si fue moderada |
| `visible` | `bool` | Si es visible públicamente |
| `fecha_creacion` | `timestamptz` | Fecha de creación |
| `fecha_actualizacion` | `timestamptz` | Fecha de última actualización |

**Relaciones:**
- Referenciada por: Ninguna
- Referencia a: 
  - `usuarios.id` (a través de `id_usuario`)
  - `eventos.id` (a través de `id_evento`)

---

### configuraciones_sistema
**Descripción:** Configuraciones globales del sistema.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `uuid` | **PK** - Identificador único de la configuración |
| `clave` | `varchar` | **UNIQUE** - Clave de la configuración |
| `valor` | `text` | Valor de la configuración |
| `tipo` | `varchar` | Tipo de dato de la configuración |
| `descripcion` | `text` | Descripción de la configuración |
| `categoria` | `varchar` | Categoría de la configuración |
| `es_sensible` | `bool` | Si es información sensible |
| `solo_lectura` | `bool` | Si es solo lectura |
| `valor_por_defecto` | `text` | Valor por defecto |
| `fecha_creacion` | `timestamptz` | Fecha de creación |
| `fecha_actualizacion` | `timestamptz` | Fecha de última actualización |
| `actualizado_por` | `uuid` | **FK** - ID del usuario que actualizó |

**Relaciones:**
- Referenciada por: Ninguna
- Referencia a: `usuarios.id` (a través de `actualizado_por`)

---

### codigos_qr_entradas
**Descripción:** Almacena cada código QR generado por una entrada comprada, con su estado y metadatos de validación.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `uuid` | **PK** - Identificador único del código QR |
| `id_compra` | `uuid` | **FK** - ID de la compra origen |
| `id_evento` | `uuid` | **FK** - ID del evento asociado |
| `id_usuario` | `uuid` | **FK** - Usuario propietario (comprador) |
| `codigo_qr` | `text` | **UNIQUE** - Código hash incorporado en la imagen QR |
| `datos_qr` | `jsonb` | Payload embebido (tipo_entrada, firma, etc.) |
| `fecha_generacion` | `timestamptz` | Fecha/hora de creación del QR |
| `fecha_escaneado` | `timestamptz` | Última fecha/hora de escaneo (nullable) |
| `escaneado_por` | `uuid` | **FK** - Usuario que realizó el último escaneo válido |
| `estado` | `varchar` | Estado del ticket (generado, escaneado, invalidado, expirado) |
| `numero_entrada` | `int4` | Número correlativo dentro de la compra |

**Relaciones:**
- Referenciada por: Ninguna
- Referencia a:
  - `compras.id` (a través de `id_compra`)
  - `eventos.id` (a través de `id_evento`)
  - `usuarios.id` (a través de `id_usuario`)
  - `usuarios.id` (a través de `escaneado_por`)

---

### seguidores_organizadores
**Descripción:** Representa el vínculo de seguimiento entre usuarios y organizadores (social/fidelización).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `uuid` | **PK** - Identificador del registro de seguimiento |
| `id_usuario_seguidor` | `uuid` | **FK** - Usuario que sigue al organizador |
| `id_organizador` | `uuid` | **FK** - Organizador seguido |
| `fecha_creacion` | `timestamptz` | Fecha de creación del vínculo |

**Relaciones:**
- Referenciada por: Ninguna
- Referencia a:
  - `usuarios.id` (a través de `id_usuario_seguidor`)
  - `usuarios.id` (a través de `id_organizador`)

---

### metodos_pago
**Descripción:** Catálogo de métodos/pasarelas de pago que cada organizador habilita, con estructura flexible.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `uuid` | **PK** - Identificador del método de pago |
| `nombre` | `text` | Nombre distintivo del método |
| `tipo` | `varchar` | Tipo (pasarela, transferencia, manual, etc.) |
| `proveedor` | `text` | Proveedor (Stripe, PayPal, Banco, etc.) |
| `descripcion` | `text` | Descripción interna |
| `activo` | `bool` | Si está habilitado para nuevas compras |
| `comision_porcentaje` | `numeric` | Comisión variable en porcentaje |
| `comision_fija` | `numeric` | Comisión fija |
| `monto_minimo` | `numeric` | Monto mínimo aceptado |
| `monto_maximo` | `numeric` | Monto máximo aceptado |
| `monedas_soportadas` | `_text` | Lista de códigos de moneda soportados |
| `requiere_verificacion` | `bool` | Indica si requiere paso adicional de verificación |
| `tiempo_procesamiento` | `text` | Texto estimado de procesamiento |
| `configuracion` | `jsonb` | Parámetros específicos (API keys, modos, flags) |
| `id_organizador` | `uuid` | **FK** - Organizador propietario |
| `fecha_creacion` | `timestamptz` | Fecha de creación |
| `fecha_actualizacion` | `timestamptz` | Fecha de última actualización |

**Relaciones:**
- Referenciada por: Ninguna
- Referencia a: `usuarios.id` (a través de `id_organizador`)

---

## 🔗 **Diagrama de Relaciones**

```
usuarios (1) ──→ (N) compras (como comprador)
usuarios (1) ──→ (N) notificaciones (como destinatario)
usuarios (1) ──→ (N) favoritos_usuarios (como usuario)
usuarios (1) ──→ (N) calificaciones_eventos (como calificador)
usuarios (1) ──→ (N) eventos (como organizador)
usuarios (1) ──→ (N) codigos_promocionales (como organizador)
usuarios (1) ──→ (N) asistencia_eventos (como asistente)
usuarios (1) ──→ (N) asistencia_eventos (como validador)
usuarios (1) ──→ (N) configuraciones_sistema (como actualizador)
usuarios (1) ──→ (N) codigos_qr_entradas (como propietario)
usuarios (1) ──→ (N) codigos_qr_entradas (como escaneador)
usuarios (1) ──→ (N) seguidores_organizadores (como seguidor)
usuarios (1) ──→ (N) seguidores_organizadores (como organizador_seguido)
usuarios (1) ──→ (N) metodos_pago (como organizador)

eventos (1) ──→ (N) tipos_entrada
eventos (1) ──→ (N) compras
eventos (1) ──→ (N) analiticas_eventos
eventos (1) ──→ (N) codigos_promocionales
eventos (1) ──→ (N) asistencia_eventos
eventos (1) ──→ (N) favoritos_usuarios
eventos (1) ──→ (N) calificaciones_eventos
eventos (1) ──→ (N) codigos_qr_entradas

tipos_entrada (1) ──→ (N) compras

compras (1) ──→ (N) asistencia_eventos
compras (1) ──→ (N) codigos_qr_entradas

plantillas_email (independiente - sin relaciones)
seguidores_organizadores (intermedia usuarios↔usuarios)
codigos_qr_entradas (intermedia compras/eventos/usuarios)
metodos_pago (dependiente de usuarios)
```

---

## 📈 **Estadísticas de la Base de Datos**

- **Total de tablas:** 15
- **Tablas principales:** 4 (usuarios, eventos, tipos_entrada, compras)
- **Tablas de soporte:** 11 (notificaciones, plantillas_email, analiticas_eventos, codigos_qr_entradas, seguidores_organizadores, metodos_pago, etc.)
- **Relaciones implementadas:** 24+
- **Tipos de datos utilizados:** 10 (uuid, text, numeric, int4, bool, timestamptz, date, time, jsonb, _text)

---

## 🎯 **Funcionalidades Cubiertas**

✅ **Gestión de Usuarios** - Registro, autenticación, roles
✅ **Gestión de Eventos** - Creación, edición, categorización
✅ **Sistema de Compras** - Proceso completo de compra
✅ **Control de Asistencia** - Validación de entradas
✅ **Analytics** - Métricas y reportes
✅ **Notificaciones** - Sistema de comunicación
✅ **Códigos Promocionales** - Descuentos y promociones
✅ **Calificaciones** - Sistema de reseñas
✅ **Favoritos** - Gestión de preferencias
✅ **Configuraciones** - Parámetros del sistema

---

## 🔧 **Tipos de Datos Personalizados**

- `tipo_usuario` - Enum para roles de usuario
- `estado_evento` - Enum para estados de eventos
- `estado_compra` - Enum para estados de compras
- `tipo_notificacion` - Enum para tipos de notificaciones
- `tipo_plantilla_email` - Enum para tipos de plantillas

---

