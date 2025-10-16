# 🚀 EventHub - Guía de Instalación Completa
## Sistema de Gestión de Eventos - Instalación y Configuración

---

## 📋 **Tabla de Contenidos**

1. [Requisitos del Sistema](#requisitos-del-sistema)
2. [Instalación Rápida](#instalación-rápida)
3. [Configuración Detallada](#configuración-detallada)
4. [Configuración de Base de Datos](#configuración-de-base-de-datos)
5. [Configuración de Servicios Externos](#configuración-de-servicios-externos)
6. [Verificación de Instalación](#verificación-de-instalación)
7. [Solución de Problemas](#solución-de-problemas)
8. [Mantenimiento](#mantenimiento)

---

## 🖥️ **Requisitos del Sistema**

### **Requisitos Mínimos**
- **Sistema Operativo**: Windows 10+, macOS 10.15+, Ubuntu 18.04+
- **Node.js**: Versión 18.0 o superior
- **PostgreSQL**: Versión 13.0 o superior
- **RAM**: 4GB mínimo, 8GB recomendado
- **Espacio en Disco**: 2GB para la aplicación + espacio para base de datos

### **Requisitos Recomendados**
- **Node.js**: Versión 20.0 LTS
- **PostgreSQL**: Versión 15.0
- **RAM**: 8GB o más
- **Espacio en Disco**: 10GB o más
- **CPU**: 4 núcleos o más

### **Herramientas Necesarias**
- **Git**: Para clonar el repositorio
- **npm/yarn**: Gestor de paquetes de Node.js
- **psql**: Cliente de PostgreSQL
- **Editor de código**: VS Code recomendado

---

## ⚡ **Instalación Rápida**

### **Paso 1: Clonar el Repositorio**
```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/eventhub.git
cd eventhub

# O si ya tienes el proyecto local
cd "Taller Gestion De Eventos"
```

### **Paso 2: Instalar Dependencias**
```bash
# Instalar dependencias de Node.js
npm install

# O si prefieres yarn
yarn install
```

### **Paso 3: Configurar Variables de Entorno**
```bash
# Copiar archivo de configuración
cp .env.example .env

# Editar variables de entorno
nano .env
```

### **Paso 4: Configurar Base de Datos**
```bash
# Crear base de datos
createdb eventhub

# Ejecutar script de base de datos
psql -U postgres -d eventhub -f database/eventhub_database.sql
```

### **Paso 5: Iniciar la Aplicación**
```bash
# Modo desarrollo
npm run dev

# Modo producción
npm run build
npm run start
```

---

## 🔧 **Configuración Detallada**

### **1. Configuración de Node.js**

#### **Verificar Versión de Node.js**
```bash
node --version
# Debe mostrar v18.0.0 o superior

npm --version
# Debe mostrar 8.0.0 o superior
```

#### **Instalar Node.js (si no está instalado)**
```bash
# En Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# En macOS con Homebrew
brew install node

# En Windows
# Descargar desde https://nodejs.org/
```

### **2. Configuración de PostgreSQL**

#### **Instalar PostgreSQL**
```bash
# En Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# En macOS con Homebrew
brew install postgresql

# En Windows
# Descargar desde https://www.postgresql.org/download/
```

#### **Configurar PostgreSQL**
```bash
# Iniciar servicio PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Acceder a PostgreSQL
sudo -u postgres psql

# Crear usuario y base de datos
CREATE USER eventhub_user WITH PASSWORD 'tu_password_seguro';
CREATE DATABASE eventhub OWNER eventhub_user;
GRANT ALL PRIVILEGES ON DATABASE eventhub TO eventhub_user;
\q
```

### **3. Configuración del Proyecto**

#### **Estructura de Archivos de Configuración**
```
eventhub/
├── .env                    # Variables de entorno
├── .env.example           # Plantilla de variables
├── database/
│   └── eventhub_database.sql
├── src/
├── package.json
└── README.md
```

#### **Archivo .env de Ejemplo**
```env
# Base de Datos
DATABASE_URL=postgresql://eventhub_user:tu_password_seguro@localhost:5432/eventhub
DB_HOST=localhost
DB_PORT=5432
DB_NAME=eventhub
DB_USER=eventhub_user
DB_PASSWORD=tu_password_seguro

# Supabase (si usas Supabase)
SUPABASE_URL=tu_supabase_url
SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_supabase_service_role_key

# Autenticación
JWT_SECRET=tu_jwt_secret_muy_seguro
SESSION_SECRET=tu_session_secret_muy_seguro

# Pagos
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

PAYPAL_CLIENT_ID=tu_paypal_client_id
PAYPAL_CLIENT_SECRET=tu_paypal_client_secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_app_password
EMAIL_FROM=noreply@eventhub.com

# Aplicación
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000

# Seguridad
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Archivos
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif

# Analytics
GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
```

---

## 🗄️ **Configuración de Base de Datos**

### **Opción 1: PostgreSQL Local**

#### **Crear Base de Datos**
```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE eventhub;
\q

# Ejecutar script de instalación
psql -U postgres -d eventhub -f database/eventhub_database.sql
```

#### **Verificar Instalación**
```bash
# Conectar a la base de datos
psql -U postgres -d eventhub

# Verificar tablas creadas
\dt

# Verificar datos iniciales
SELECT * FROM usuarios WHERE rol = 'administrador';
SELECT * FROM configuraciones_sistema LIMIT 5;
\q
```

### **Opción 2: Supabase (Recomendado para Producción)**

#### **Configurar Supabase**
1. **Crear cuenta en Supabase**: https://supabase.com
2. **Crear nuevo proyecto**
3. **Obtener credenciales**:
   - Project URL
   - Anon Key
   - Service Role Key

#### **Configurar Variables de Entorno para Supabase**
```env
# Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Base de datos (usar Supabase)
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

#### **Ejecutar Script en Supabase**
```bash
# Usar el SQL Editor de Supabase o psql
psql "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres" -f database/eventhub_database.sql
```

---

## 🔌 **Configuración de Servicios Externos**

### **1. Configuración de Stripe (Pagos)**

#### **Crear Cuenta en Stripe**
1. **Registrarse**: https://stripe.com
2. **Activar cuenta** (verificación requerida)
3. **Obtener claves**:
   - Publishable Key (pk_test_...)
   - Secret Key (sk_test_...)
   - Webhook Secret (whsec_...)

#### **Configurar Webhooks**
```bash
# Endpoint de webhook: https://tu-dominio.com/api/webhooks/stripe
# Eventos a escuchar:
# - payment_intent.succeeded
# - payment_intent.payment_failed
# - checkout.session.completed
```

### **2. Configuración de PayPal (Pagos Alternativos)**

#### **Crear Cuenta en PayPal**
1. **Registrarse**: https://developer.paypal.com
2. **Crear aplicación**
3. **Obtener credenciales**:
   - Client ID
   - Client Secret

### **3. Configuración de Email (SMTP)**

#### **Gmail (Recomendado)**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_app_password  # No tu contraseña normal
```

#### **Crear App Password en Gmail**
1. **Activar 2FA** en tu cuenta de Google
2. **Ir a**: https://myaccount.google.com/security
3. **App passwords** → **Generate**
4. **Copiar la contraseña** generada

#### **Otros Proveedores SMTP**
```env
# SendGrid
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=tu_sendgrid_api_key

# Mailgun
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=tu_mailgun_username
SMTP_PASSWORD=tu_mailgun_password
```

### **4. Configuración de Autenticación OAuth**

#### **Google OAuth**
1. **Ir a**: https://console.developers.google.com
2. **Crear proyecto**
3. **Habilitar Google+ API**
4. **Crear credenciales OAuth 2.0**
5. **Configurar dominios autorizados**

#### **Facebook OAuth**
1. **Ir a**: https://developers.facebook.com
2. **Crear aplicación**
3. **Configurar Facebook Login**
4. **Obtener App ID y App Secret**

---

## ✅ **Verificación de Instalación**

### **1. Verificar Base de Datos**
```bash
# Conectar a la base de datos
psql -U postgres -d eventhub

# Verificar tablas
\dt

# Verificar datos iniciales
SELECT COUNT(*) FROM usuarios;
SELECT COUNT(*) FROM configuraciones_sistema;
SELECT COUNT(*) FROM plantillas_email;

# Verificar relaciones
SELECT 
    table_name, 
    column_name, 
    constraint_name, 
    foreign_table_name, 
    foreign_column_name 
FROM information_schema.key_column_usage 
WHERE table_name IN ('eventos', 'compras', 'usuarios');
\q
```

### **2. Verificar Aplicación**
```bash
# Iniciar en modo desarrollo
npm run dev

# Verificar en navegador
# http://localhost:3000

# Verificar endpoints
curl http://localhost:3000/api/health
curl http://localhost:3000/api/events
```

### **3. Verificar Servicios Externos**
```bash
# Verificar Stripe
curl -u sk_test_...: https://api.stripe.com/v1/charges

# Verificar email
# Enviar email de prueba desde la aplicación

# Verificar OAuth
# Probar login con Google/Facebook
```

### **4. Pruebas de Funcionalidad**

#### **Crear Usuario de Prueba**
```sql
-- Conectar a la base de datos
psql -U postgres -d eventhub

-- Insertar usuario de prueba
INSERT INTO usuarios (correo_electronico, nombre_completo, rol, contraseña) 
VALUES ('test@eventhub.com', 'Usuario de Prueba', 'asistente', '$2a$10$...');

-- Verificar inserción
SELECT * FROM usuarios WHERE correo_electronico = 'test@eventhub.com';
\q
```

#### **Crear Evento de Prueba**
```sql
-- Insertar evento de prueba
INSERT INTO eventos (titulo, descripcion, fecha_evento, hora_evento, ubicacion, id_organizador, nombre_organizador, estado)
VALUES ('Evento de Prueba', 'Descripción del evento', '2025-12-31', '20:00:00', 'Lugar de Prueba', 
        (SELECT id FROM usuarios WHERE rol = 'administrador' LIMIT 1), 
        'Administrador del Sistema', 'publicado');

-- Verificar evento
SELECT * FROM eventos WHERE titulo = 'Evento de Prueba';
```

---

## 🔧 **Solución de Problemas**

### **Problemas Comunes**

#### **Error: "Database does not exist"**
```bash
# Solución: Crear base de datos
createdb eventhub
psql -U postgres -d eventhub -f database/eventhub_database.sql
```

#### **Error: "Permission denied"**
```bash
# Solución: Verificar permisos de usuario
sudo -u postgres psql
GRANT ALL PRIVILEGES ON DATABASE eventhub TO eventhub_user;
\q
```

#### **Error: "Port 3000 already in use"**
```bash
# Solución: Cambiar puerto
export PORT=3001
npm run dev

# O matar proceso en puerto 3000
lsof -ti:3000 | xargs kill -9
```

#### **Error: "Module not found"**
```bash
# Solución: Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

#### **Error: "Stripe key invalid"**
```bash
# Verificar claves en .env
echo $STRIPE_PUBLIC_KEY
echo $STRIPE_SECRET_KEY

# Verificar formato de claves
# Public key debe empezar con pk_test_ o pk_live_
# Secret key debe empezar con sk_test_ o sk_live_
```

### **Logs y Debugging**

#### **Habilitar Logs Detallados**
```env
# En .env
NODE_ENV=development
DEBUG=eventhub:*
LOG_LEVEL=debug
```

#### **Verificar Logs de Base de Datos**
```bash
# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log

# O en macOS
tail -f /usr/local/var/log/postgres.log
```

#### **Verificar Logs de Aplicación**
```bash
# Logs de la aplicación
npm run dev 2>&1 | tee app.log

# O usar PM2 para producción
npm install -g pm2
pm2 start app.js --name eventhub
pm2 logs eventhub
```

---

## 🔄 **Mantenimiento**

### **Backup de Base de Datos**

#### **Backup Completo**
```bash
# Crear backup
pg_dump -U postgres -h localhost eventhub > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
psql -U postgres -d eventhub < backup_20241201_120000.sql
```

#### **Backup Automático (Cron)**
```bash
# Editar crontab
crontab -e

# Agregar línea para backup diario a las 2 AM
0 2 * * * pg_dump -U postgres -h localhost eventhub > /backups/eventhub_$(date +\%Y\%m\%d).sql
```

### **Actualizaciones**

#### **Actualizar Dependencias**
```bash
# Verificar dependencias desactualizadas
npm outdated

# Actualizar dependencias
npm update

# Actualizar dependencias mayores (cuidado)
npm install package@latest
```

#### **Actualizar Base de Datos**
```bash
# Crear backup antes de actualizar
pg_dump -U postgres eventhub > backup_pre_update.sql

# Ejecutar migraciones (si las hay)
psql -U postgres -d eventhub -f database/migrations/001_update_schema.sql
```

### **Monitoreo**

#### **Verificar Estado del Sistema**
```bash
# Estado de PostgreSQL
sudo systemctl status postgresql

# Estado de la aplicación
ps aux | grep node

# Uso de memoria
free -h

# Uso de disco
df -h
```

#### **Métricas de Base de Datos**
```sql
-- Conectar a PostgreSQL
psql -U postgres -d eventhub

-- Verificar tamaño de base de datos
SELECT pg_size_pretty(pg_database_size('eventhub'));

-- Verificar tablas más grandes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Verificar conexiones activas
SELECT count(*) FROM pg_stat_activity WHERE datname = 'eventhub';
\q
```

---

## 📞 **Soporte y Recursos**

### **Documentación Adicional**
- **README.md**: Información general del proyecto
- **Documentacion/**: Documentación técnica completa
- **API Documentation**: Endpoints y ejemplos

### **Comunidad y Ayuda**
- **GitHub Issues**: Reportar bugs y solicitar features
- **Discord/Slack**: Canal de la comunidad
- **Email**: soporte@eventhub.com

### **Recursos Útiles**
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Node.js Docs**: https://nodejs.org/docs/
- **Stripe Docs**: https://stripe.com/docs
- **Supabase Docs**: https://supabase.com/docs

---

## 🎉 **¡Instalación Completada!**

Si has seguido todos los pasos, tu sistema EventHub debería estar funcionando correctamente. 

### **Próximos Pasos**
1. **Configurar tu primer evento**
2. **Personalizar configuraciones**
3. **Configurar dominio personalizado**
4. **Implementar SSL/HTTPS**
5. **Configurar monitoreo en producción**

### **Verificación Final**
- ✅ Base de datos creada y poblada
- ✅ Aplicación ejecutándose
- ✅ Servicios externos configurados
- ✅ Usuario administrador creado
- ✅ Configuraciones iniciales cargadas

**¡Bienvenido a EventHub! 🚀**

---

*Para más información, consulta la documentación completa en la carpeta `Documentacion/`*
