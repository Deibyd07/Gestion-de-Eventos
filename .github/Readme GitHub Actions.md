# GitHub Actions - Guía Simple

Este directorio contiene los workflows de CI/CD para desplegar EventHub automáticamente.

## 🎯 ¿Qué hace?

### Cuando haces push a `main`:
1. ✅ Ejecuta el linting
2. ✅ Corre todos los tests
3. ✅ Hace el build
4. 🚀 **Si todo pasa**, despliega a Vercel
5. ❌ **Si algo falla**, NO despliega

### Cuando creas un Pull Request:
1. ✅ Ejecuta el linting
2. ✅ Corre todos los tests
3. ✅ Hace el build
4. 🔍 Crea un **preview deployment** para que lo pruebes
5. 💬 Te comenta la URL del preview en el PR

## 🔐 Configuración Inicial (Solo una vez)

### 1. Obtener tokens de Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Vincular el proyecto
vercel link
```

Después de ejecutar `vercel link`, busca el archivo `.vercel/project.json`. Ahí están tus IDs.

También necesitas crear un token en: https://vercel.com/account/tokens

### 2. Agregar Secrets en GitHub

Ve a: `Settings > Secrets and variables > Actions > New repository secret`

Agrega estos 3 secrets:
```
VERCEL_TOKEN          (El token que creaste)
VERCEL_ORG_ID         (Del archivo .vercel/project.json)
VERCEL_PROJECT_ID     (Del archivo .vercel/project.json)
```

## 🚀 Flujo de Trabajo

### Hacer cambios:
```bash
# 1. Crear una rama
git checkout -b feature/mi-nueva-funcionalidad

# 2. Hacer cambios y commits
git add .
git commit -m "feat: mi nueva funcionalidad"

# 3. Subir los cambios
git push origin feature/mi-nueva-funcionalidad
```

### Crear Pull Request:
- Ve a GitHub y crea el PR
- Automáticamente se ejecutarán los tests
- Recibirás un comentario con la URL del preview
- Puedes probar los cambios en ese preview

### Hacer merge:
- Una vez aprobado, haz merge a `main`
- Automáticamente se desplegará a producción
- ¡Listo! Tu código está en vivo

## 📋 Archivos

### `ci-cd-main.yml`
Se ejecuta cuando haces push a `main`. Corre tests y despliega a producción.

### `pr-checks.yml`
Se ejecuta en Pull Requests. Corre tests y crea preview deployments.

### `dependabot.yml`
Actualiza tus dependencias automáticamente cada semana.

### `PULL_REQUEST_TEMPLATE.md`
Template que aparece cuando creas un PR para que no olvides nada importante.

## 🐛 Si algo falla

### Ver los logs:
1. Ve a la pestaña "Actions" en GitHub
2. Haz click en el workflow que falló
3. Revisa los logs para ver qué pasó

### Probar localmente antes de subir:
```bash
npm run lint    # Revisa el código
npm test        # Corre los tests
npm run build   # Hace el build
```

Si todo pasa localmente, debería pasar en GitHub también.

## 📦 Dependabot

Cada semana, Dependabot revisará si hay actualizaciones de paquetes y creará PRs automáticamente. Solo necesitas:
1. Revisar el PR
2. Si los tests pasan, hacer merge
3. ¡Tus dependencias están actualizadas!

## ❓ Preguntas Comunes

**¿Por qué falló el deployment?**
- Revisa la pestaña "Actions" para ver los logs
- Probablemente algún test falló o el build tiene errores

**¿Cómo pruebo mis cambios antes de hacer merge?**
- Crea un PR y espera el preview deployment
- La URL aparecerá en un comentario del PR

**¿Puedo desplegar manualmente?**
- Sí, ve a Actions > Deploy to Production > Run workflow

**¿Qué pasa si no quiero hacer deploy?**
- No hagas merge a `main`, trabaja en tu rama

## 📚 Recursos

- [GitHub Actions - Guía básica](https://docs.github.com/es/actions/quickstart)
- [Vercel - Documentación](https://vercel.com/docs)
