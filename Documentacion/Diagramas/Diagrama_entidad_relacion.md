# 📊 Diagrama Entidad-Relación - EventHub

## 🎯 Diagrama ER Completo - EventHub

### 📋 **Descripción del Sistema**
Este diagrama representa la arquitectura completa de la base de datos del sistema EventHub, una plataforma integral para la gestión de eventos que incluye funcionalidades de compra de entradas, control de asistencia, analytics, notificaciones y más.

### 🔍 **Entidades Clave del Negocio**
- **USUARIOS**: Gestión completa de usuarios (organizadores, asistentes, administradores)
- **EVENTOS**: Catálogo central de eventos con toda su información
- **TIPOS_ENTRADA**: Catálogo de productos/entradas por evento
- **COMPRAS**: Transacciones y flujo de ventas
- **ASISTENCIA_EVENTOS**: Control de acceso y validación

```mermaid
erDiagram
    USUARIOS {
        uuid id PK
        text correo_electronico UK
        text nombre_completo
        tipo_usuario rol
        text url_avatar
        jsonb preferencias
        timestamptz fecha_creacion
        timestamptz fecha_actualizacion
        text contraseña
    }

    EVENTOS {
        uuid id PK
        text titulo
        text descripcion
        text url_imagen
        date fecha_evento
        time hora_evento
        text ubicacion
        text categoria
        int4 maximo_asistentes
        int4 asistentes_actuales
        uuid id_organizador FK
        text nombre_organizador
        estado_evento estado
        _text etiquetas
        timestamptz fecha_creacion
        timestamptz fecha_actualizacion
    }

    TIPOS_ENTRADA {
        uuid id PK
        uuid id_evento FK
        text nombre_tipo
        numeric precio
        text descripcion
        int4 cantidad_maxima
        int4 cantidad_disponible
        timestamptz fecha_creacion
        timestamptz fecha_actualizacion
        text nombre_evento
    }

    COMPRAS {
        uuid id PK
        uuid id_usuario FK
        uuid id_evento FK
        uuid id_tipo_entrada FK
        int4 cantidad
        numeric precio_unitario
        numeric total_pagado
        estado_compra estado
        text codigo_qr
        text numero_orden
        timestamptz fecha_creacion
        timestamptz fecha_actualizacion
    }

    NOTIFICACIONES {
        uuid id PK
        uuid id_usuario FK
        tipo_notificacion tipo
        text titulo
        text mensaje
        bool leida
        text url_accion
        text texto_accion
        timestamptz fecha_creacion
    }

    PLANTILLAS_EMAIL {
        uuid id PK
        text nombre_plantilla
        text asunto
        text contenido
        tipo_plantilla_email tipo
        timestamptz fecha_creacion
        timestamptz fecha_actualizacion
    }

    ANALITICAS_EVENTOS {
        uuid id PK
        uuid id_evento FK
        int4 total_visualizaciones
        int4 total_ventas
        numeric ingresos_totales
        numeric tasa_conversion
        numeric precio_promedio_entrada
        text tipo_entrada_mas_vendida
        numeric tasa_asistencia
        int4 reembolsos
        numeric monto_reembolsos
        timestamptz fecha_creacion
        timestamptz fecha_actualizacion
    }

    CODIGOS_PROMOCIONALES {
        uuid id PK
        varchar codigo UK
        text descripcion
        varchar tipo_descuento
        numeric valor_descuento
        timestamptz fecha_inicio
        timestamptz fecha_fin
        int4 uso_maximo
        int4 usos_actuales
        uuid id_evento FK
        uuid id_organizador FK
        bool activo
        timestamptz fecha_creacion
        timestamptz fecha_actualizacion
    }

    ASISTENCIA_EVENTOS {
        uuid id PK
        uuid id_compra FK
        uuid id_evento FK
        uuid id_usuario FK
        timestamptz fecha_asistencia
        uuid validado_por FK
        varchar metodo_validacion
        text observaciones
        varchar estado_asistencia
        point ubicacion_validacion
        jsonb dispositivo_validacion
        timestamptz fecha_creacion
        timestamptz fecha_actualizacion
    }

    FAVORITOS_USUARIOS {
        uuid id PK
        uuid id_usuario FK
        uuid id_evento FK
        varchar categoria_favorito
        text notas_personales
        bool recordatorio_activo
        timestamptz fecha_recordatorio
        int4 prioridad
        bool visible
        timestamptz fecha_creacion
        timestamptz fecha_actualizacion
    }

    CALIFICACIONES_EVENTOS {
        uuid id PK
        uuid id_evento FK
        uuid id_usuario FK
        int4 calificacion
        text comentario
        _text aspectos_positivos
        _text aspectos_negativos
        bool recomendaria
        varchar categoria_calificacion
        date fecha_evento_asistido
        bool anonima
        bool moderada
        bool visible
        timestamptz fecha_creacion
        timestamptz fecha_actualizacion
    }

    CONFIGURACIONES_SISTEMA {
        uuid id PK
        varchar clave UK
        text valor
        varchar tipo
        text descripcion
        varchar categoria
        bool es_sensible
        bool solo_lectura
        text valor_por_defecto
        timestamptz fecha_creacion
        timestamptz fecha_actualizacion
        uuid actualizado_por FK
    }

    %% Relaciones principales del sistema
    USUARIOS ||--o{ EVENTOS : "organiza"
    USUARIOS ||--o{ COMPRAS : "compra"
    USUARIOS ||--o{ NOTIFICACIONES : "recibe"
    USUARIOS ||--o{ FAVORITOS_USUARIOS : "marca_favorito"
    USUARIOS ||--o{ CALIFICACIONES_EVENTOS : "califica"
    USUARIOS ||--o{ CODIGOS_PROMOCIONALES : "crea_codigo"
    USUARIOS ||--o{ ASISTENCIA_EVENTOS : "asiste"
    USUARIOS ||--o{ ASISTENCIA_EVENTOS : "valida"
    USUARIOS ||--o{ CONFIGURACIONES_SISTEMA : "actualiza"

    EVENTOS ||--o{ TIPOS_ENTRADA : "tiene"
    EVENTOS ||--o{ COMPRAS : "vende"
    EVENTOS ||--o{ ANALITICAS_EVENTOS : "analiza"
    EVENTOS ||--o{ CODIGOS_PROMOCIONALES : "tiene_codigos"
    EVENTOS ||--o{ ASISTENCIA_EVENTOS : "registra_asistencia"
    EVENTOS ||--o{ FAVORITOS_USUARIOS : "es_favorito"
    EVENTOS ||--o{ CALIFICACIONES_EVENTOS : "es_calificado"

    TIPOS_ENTRADA ||--o{ COMPRAS : "se_compra"
    COMPRAS ||--o{ ASISTENCIA_EVENTOS : "valida_entrada"
```

## 📋 Resumen Completo de Relaciones

### 🔗 **Relaciones Principales del Sistema (1:N)**

#### **USUARIOS como Entidad Central**
1. **USUARIOS → EVENTOS** (1:N) - "organiza"
   - Un usuario puede organizar muchos eventos
   - Un evento pertenece a un solo organizador

2. **USUARIOS → COMPRAS** (1:N) - "compra"
   - Un usuario puede hacer muchas compras
   - Una compra pertenece a un solo usuario

3. **USUARIOS → NOTIFICACIONES** (1:N) - "recibe"
   - Un usuario puede recibir muchas notificaciones
   - Una notificación pertenece a un solo usuario

4. **USUARIOS → FAVORITOS_USUARIOS** (1:N) - "marca_favorito"
   - Un usuario puede marcar muchos eventos como favoritos
   - Un favorito pertenece a un solo usuario

5. **USUARIOS → CALIFICACIONES_EVENTOS** (1:N) - "califica"
   - Un usuario puede calificar muchos eventos
   - Una calificación pertenece a un solo usuario

6. **USUARIOS → CODIGOS_PROMOCIONALES** (1:N) - "crea_codigo"
   - Un usuario organizador puede crear muchos códigos promocionales
   - Un código promocional pertenece a un solo organizador

7. **USUARIOS → ASISTENCIA_EVENTOS** (1:N) - "asiste"
   - Un usuario puede asistir a muchos eventos
   - Un registro de asistencia pertenece a un solo usuario

8. **USUARIOS → ASISTENCIA_EVENTOS** (1:N) - "valida"
   - Un usuario puede validar muchas asistencias
   - Una validación de asistencia es realizada por un solo usuario

9. **USUARIOS → CONFIGURACIONES_SISTEMA** (1:N) - "actualiza"
   - Un usuario puede actualizar muchas configuraciones
   - Una configuración es actualizada por un solo usuario

#### **EVENTOS como Entidad Central**
10. **EVENTOS → TIPOS_ENTRADA** (1:N) - "tiene"
    - Un evento puede tener muchos tipos de entrada
    - Un tipo de entrada pertenece a un solo evento

11. **EVENTOS → COMPRAS** (1:N) - "vende"
    - Un evento puede tener muchas compras
    - Una compra pertenece a un solo evento

12. **EVENTOS → ANALITICAS_EVENTOS** (1:N) - "analiza"
    - Un evento puede tener muchas métricas de analytics
    - Un registro de analytics pertenece a un solo evento

13. **EVENTOS → CODIGOS_PROMOCIONALES** (1:N) - "tiene_codigos"
    - Un evento puede tener muchos códigos promocionales
    - Un código promocional pertenece a un solo evento

14. **EVENTOS → ASISTENCIA_EVENTOS** (1:N) - "registra_asistencia"
    - Un evento puede tener muchos registros de asistencia
    - Un registro de asistencia pertenece a un solo evento

15. **EVENTOS → FAVORITOS_USUARIOS** (1:N) - "es_favorito"
    - Un evento puede ser marcado como favorito por muchos usuarios
    - Un favorito pertenece a un solo evento

16. **EVENTOS → CALIFICACIONES_EVENTOS** (1:N) - "es_calificado"
    - Un evento puede ser calificado por muchos usuarios
    - Una calificación pertenece a un solo evento

#### **Relaciones de Flujo de Negocio**
17. **TIPOS_ENTRADA → COMPRAS** (1:N) - "se_compra"
    - Un tipo de entrada puede ser comprado muchas veces
    - Una compra es de un solo tipo de entrada

18. **COMPRAS → ASISTENCIA_EVENTOS** (1:N) - "valida_entrada"
    - Una compra puede generar muchos registros de asistencia
    - Un registro de asistencia pertenece a una sola compra

### 🔗 **Entidades Independientes**
- **PLANTILLAS_EMAIL** - Sin relaciones (entidad independiente)

## 🔄 **Flujos de Negocio Principales**

### 📈 **Flujo de Venta de Entradas**
1. **USUARIOS** organiza **EVENTOS**
2. **EVENTOS** tiene **TIPOS_ENTRADA**
3. **USUARIOS** realiza **COMPRAS** de **TIPOS_ENTRADA**
4. **COMPRAS** genera **ASISTENCIA_EVENTOS** (validación)

### 📊 **Flujo de Analytics y Métricas**
1. **EVENTOS** genera **ANALITICAS_EVENTOS**
2. **COMPRAS** alimenta métricas de ventas
3. **ASISTENCIA_EVENTOS** calcula tasas de asistencia

### 🔔 **Flujo de Comunicación**
1. **USUARIOS** recibe **NOTIFICACIONES**
2. **PLANTILLAS_EMAIL** para comunicación automatizada
3. **CONFIGURACIONES_SISTEMA** controla parámetros

### ⭐ **Flujo de Experiencia del Usuario**
1. **USUARIOS** marca **FAVORITOS_USUARIOS**
2. **USUARIOS** realiza **CALIFICACIONES_EVENTOS**
3. **CODIGOS_PROMOCIONALES** para descuentos

## 🎯 **Características del Diagrama**

✅ **Claridad Visual** - Colores y formas diferenciadas
✅ **Relaciones Explícitas** - Cardinalidades claras (1:N, N:1)
✅ **Atributos Principales** - Campos clave visibles
✅ **Estructura Profesional** - Formato estándar ER
✅ **Documentación Completa** - Explicación de cada relación
