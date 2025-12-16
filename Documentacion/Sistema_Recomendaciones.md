# 🎯 Sistema de Recomendaciones de Eventos - EventHub

## 📋 Descripción General

El Sistema de Recomendaciones de EventHub proporciona experiencias personalizadas a los usuarios mediante recomendaciones de eventos basadas en:

1. **Organizadores seguidos**: Eventos de organizadores que el usuario sigue tienen la mayor prioridad
2. **Ubicación cercana**: Eventos en ubicaciones similares o cercanas al usuario
3. **Proximidad temporal**: Eventos próximos en el tiempo
4. **Disponibilidad**: Eventos con entradas disponibles

## 🎯 Historia de Usuario

**Como** usuario de la plataforma  
**Quiero** recibir recomendaciones de eventos basadas en mis intereses y ubicación  
**Para** descubrir eventos relevantes que se ajusten a mis preferencias

### Criterios de Aceptación

✅ **CA1**: Los eventos de organizadores seguidos aparecen primero en las recomendaciones  
✅ **CA2**: Los eventos cercanos a la ubicación del usuario tienen prioridad  
✅ **CA3**: Si el usuario no sigue a ningún organizador, solo se aplica el filtro de ubicación  
✅ **CA4**: El resto de eventos se muestran ordenados por relevancia  
✅ **CA5**: Las recomendaciones son visibles en la página de eventos y página principal  

## 🏗️ Arquitectura

### Componentes Principales

```
src/
├── shared/
│   └── lib/
│       └── api/
│           └── services/
│               └── Recommendation.service.ts    # Servicio de recomendaciones
├── modules/
│   └── events/
│       ├── infrastructure/
│       │   └── store/
│       │       └── Event.store.ts              # Store con soporte para recomendaciones
│       └── presentation/
│           └── pages/
│               ├── Events.page.tsx             # Página de exploración con filtro de recomendados
│               └── Home.page.tsx               # Página principal con eventos recomendados
```

### Flujo de Datos

```
Usuario autenticado
    ↓
loadRecommendedEvents(userId, userLocation?)
    ↓
RecommendationService.getRecommendedEvents()
    ↓
1. Obtener organizadores seguidos
2. Obtener todos los eventos activos
3. Calcular puntuación de relevancia
4. Ordenar por puntuación (mayor a menor)
    ↓
Eventos recomendados mostrados en UI
```

## 🔢 Algoritmo de Puntuación

El sistema asigna una puntuación a cada evento basándose en múltiples factores:

### Factores de Puntuación

| Factor | Peso | Descripción |
|--------|------|-------------|
| **Organizador Seguido** | 1000 puntos | Evento de un organizador que el usuario sigue |
| **Ubicación Cercana** | 0-500 puntos | Según similitud de ubicación (100% = 500 puntos) |
| **Proximidad Temporal** | 0-100 puntos | Eventos en próximos 30 días (más cercano = más puntos) |
| **Disponibilidad** | 0-50 puntos | Según entradas disponibles (máx 50 puntos) |

### Ejemplo de Cálculo

```typescript
Evento A:
- Organizador seguido: +1000 puntos
- Ubicación 80% similar: +400 puntos
- En 5 días: +85 puntos
- 30 entradas disponibles: +30 puntos
= TOTAL: 1515 puntos

Evento B:
- No es organizador seguido: 0 puntos
- Ubicación 100% similar: +500 puntos
- En 2 días: +94 puntos
- 45 entradas disponibles: +45 puntos
= TOTAL: 639 puntos

→ Evento A aparece primero
```

## 📊 Similitud de Ubicación

El sistema calcula la similitud entre ubicaciones usando comparación de strings:

```typescript
// Ejemplos de similitud
"Bogotá, Colombia" vs "Bogotá, Colombia" → 100%
"Bogotá, Colombia" vs "Bogotá, Cundinamarca" → 75%
"Bogotá" vs "Medellín" → 0%
```

### Algoritmo

1. Normalizar strings (lowercase, trim)
2. Si son exactamente iguales → 100%
3. Dividir en partes por comas
4. Contar partes en común
5. Calcular porcentaje: `50 + (partes_comunes / max_partes) * 50`

## 🔌 API del Servicio

### RecommendationService

```typescript
class RecommendationService {
  // Obtener eventos recomendados para un usuario
  static async getRecommendedEvents(
    userId: string, 
    userLocation?: string
  ): Promise<any[]>

  // Obtener ubicación del usuario desde su perfil
  static async getUserLocation(userId: string): Promise<string | null>

  // Obtener solo eventos de organizadores seguidos
  static async getFollowedOrganizersEvents(userId: string): Promise<any[]>

  // Obtener eventos cercanos a una ubicación
  static async getNearbyEvents(
    userLocation: string, 
    limit?: number
  ): Promise<any[]>
}
```

### Event Store

```typescript
interface EventState {
  // ... otros estados
  recommendedEvents: Event[];
  
  loadRecommendedEvents: (
    userId: string, 
    userLocation?: string
  ) => Promise<void>;
}
```

## 🎨 Interfaz de Usuario

### Página de Eventos (Events.page.tsx)

**Selector de Ordenamiento**:
```tsx
<select value={sortBy} onChange={handleSortChange}>
  {user?.id && (
    <option value="recommended">✨ Recomendados para ti</option>
  )}
  <option value="date">Fecha (próximos)</option>
  <option value="price-low">Precio (menor a mayor)</option>
  {/* ... más opciones */}
</select>
```

**Banner Informativo**:
```tsx
{sortBy === 'recommended' && user?.id && (
  <div className="banner-recomendaciones">
    <Heart /> Eventos recomendados para ti
    Personalizados según organizadores que sigues y tu ubicación
  </div>
)}
```

### Página Principal (Home.page.tsx)

**Título Dinámico**:
```tsx
<h2>
  {user?.id && recommendedEvents.length > 0 
    ? 'Eventos Recomendados Para Ti' 
    : 'Eventos Destacados'}
</h2>
```

**Eventos Mostrados**:
```tsx
{(user?.id && recommendedEvents.length > 0 
  ? recommendedEvents.slice(0, 3) 
  : featuredEvents
).map(event => ...)}
```

## 📝 Casos de Uso

### Caso 1: Usuario sigue organizadores y tiene ubicación

```
Usuario: Juan
Ubicación: Bogotá, Colombia
Sigue a: Organizador A, Organizador B

Resultado:
1. Eventos de Organizador A en Bogotá (Score: ~1500)
2. Eventos de Organizador B en Medellín (Score: ~1050)
3. Eventos en Bogotá de otros organizadores (Score: ~500)
4. Eventos cercanos (Score: ~200-400)
5. Resto de eventos (Score: ~50-100)
```

### Caso 2: Usuario NO sigue organizadores pero tiene ubicación

```
Usuario: María
Ubicación: Medellín, Colombia
No sigue a nadie

Resultado:
1. Eventos en Medellín (Score: ~500)
2. Eventos en Antioquia (Score: ~300)
3. Eventos en Colombia (Score: ~100)
4. Resto de eventos (Score: ~50-100)
```

### Caso 3: Usuario NO sigue organizadores ni tiene ubicación

```
Usuario: Carlos
Sin ubicación configurada
No sigue a nadie

Resultado:
1. Eventos próximos en el tiempo (Score: ~100)
2. Eventos con más disponibilidad (Score: ~50)
3. Resto ordenado por fecha
```

## 🔄 Flujo de Integración

### 1. Carga Inicial
```typescript
useEffect(() => {
  loadEvents();
  if (user?.id) {
    loadRecommendedEvents(user.id);
  }
}, [user?.id]);
```

### 2. Cambio de Usuario
- Al login: Cargar recomendaciones automáticamente
- Al logout: Limpiar recomendaciones

### 3. Actualización de Perfil
- Si el usuario actualiza su ubicación: Recargar recomendaciones
- Si sigue/deja de seguir organizador: Recargar recomendaciones

## 📈 Métricas y Analytics (Futuro)

Métricas sugeridas para medir efectividad:

1. **Click-Through Rate (CTR)**: % de eventos recomendados que reciben clicks
2. **Conversion Rate**: % de eventos recomendados que resultan en compras
3. **Tiempo en página**: Mayor engagement en eventos recomendados
4. **Bounce Rate**: Menor tasa de rebote en recomendaciones

## 🚀 Mejoras Futuras

### Corto Plazo
- [ ] Caché de recomendaciones (reducir llamadas a DB)
- [ ] Feedback del usuario (like/dislike en recomendaciones)
- [ ] Límite de eventos recomendados por sesión

### Mediano Plazo
- [ ] Machine Learning para ajustar pesos dinámicamente
- [ ] Geolocalización real con coordenadas GPS
- [ ] Historial de eventos asistidos para mejorar recomendaciones
- [ ] Categorías favoritas del usuario

### Largo Plazo
- [ ] Sistema de embeddings para similitud semántica
- [ ] Recomendaciones colaborativas (usuarios similares)
- [ ] A/B testing de diferentes algoritmos
- [ ] Personalización avanzada por horarios preferidos

## 🧪 Testing

### Test Unitarios Sugeridos

```typescript
describe('RecommendationService', () => {
  it('debe priorizar eventos de organizadores seguidos', async () => {
    // Given: Usuario sigue a Organizador X
    // When: Se obtienen recomendaciones
    // Then: Eventos de Organizador X están primero
  });

  it('debe calcular similitud de ubicación correctamente', () => {
    // Given: Dos ubicaciones
    // When: Se calcula similitud
    // Then: Porcentaje esperado
  });

  it('debe manejar usuario sin ubicación', async () => {
    // Given: Usuario sin ubicación configurada
    // When: Se obtienen recomendaciones
    // Then: No falla, usa solo otros factores
  });

  it('debe ordenar por score descendente', async () => {
    // Given: Eventos con diferentes scores
    // When: Se obtienen recomendaciones
    // Then: Ordenados de mayor a menor score
  });
});
```

## 📚 Referencias

- [Documentación de Seguidores](./database/seguidores_organizadores.sql)
- [Event Store](../src/modules/events/infrastructure/store/Event.store.ts)
- [OrganizerFollow Service](../src/shared/lib/api/services/OrganizerFollow.service.ts)

## 📄 Licencia

Este sistema forma parte de EventHub y está sujeto a la misma licencia del proyecto.

---

**Fecha de creación**: Diciembre 15, 2025  
**Última actualización**: Diciembre 15, 2025  
**Versión**: 1.0.0
