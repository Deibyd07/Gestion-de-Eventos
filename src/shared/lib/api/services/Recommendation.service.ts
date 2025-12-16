import { supabase } from '../supabase';
import { OrganizerFollowService } from './OrganizerFollow.service';
import { EventService } from './Event.service';

/**
 * Servicio para manejar recomendaciones de eventos basadas en:
 * 1. Organizadores seguidos por el usuario
 * 2. Ubicación cercana al usuario
 */
export class RecommendationService {
  /**
   * Calcula la distancia entre dos ubicaciones (aproximada usando coordenadas)
   * Por ahora usamos una comparación simple de strings de ubicación
   */
  private static calculateLocationSimilarity(userLocation: string, eventLocation: string): number {
    if (!userLocation || !eventLocation) return 0;
    
    const userLoc = userLocation.toLowerCase().trim();
    const eventLoc = eventLocation.toLowerCase().trim();
    
    // Si son exactamente iguales
    if (userLoc === eventLoc) return 100;
    
    // Si el evento está en la misma ciudad
    const userParts = userLoc.split(',').map(p => p.trim());
    const eventParts = eventLoc.split(',').map(p => p.trim());
    
    // Verificar si comparten alguna parte de la ubicación
    const commonParts = userParts.filter(part => 
      eventParts.some(eventPart => eventPart.includes(part) || part.includes(eventPart))
    );
    
    if (commonParts.length > 0) {
      // Dar más peso si comparten más partes
      return 50 + (commonParts.length / Math.max(userParts.length, eventParts.length)) * 50;
    }
    
    return 0;
  }

  /**
   * Obtiene eventos recomendados para un usuario específico
   * @param userId ID del usuario
   * @param userLocation Ubicación del usuario (opcional)
   * @returns Array de eventos ordenados por relevancia
   */
  static async getRecommendedEvents(userId: string, userLocation?: string): Promise<any[]> {
    try {
      // 1. Obtener organizadores seguidos por el usuario
      const followedOrganizers = await OrganizerFollowService.listarOrganizadoresSeguidos(userId);
      const followedOrganizerIds = followedOrganizers.map(org => org.id);

      // 2. Obtener todos los eventos activos
      const { data: allEvents, error } = await supabase
        .from('eventos')
        .select(`
          *,
          tipos_entrada (
            id,
            nombre_tipo,
            precio,
            descripcion,
            cantidad_maxima,
            cantidad_disponible
          )
        `)
        .in('estado', ['publicado', 'borrador'])
        .order('fecha_evento', { ascending: true });

      if (error) throw error;
      if (!allEvents || allEvents.length === 0) return [];

      // 3. Calcular puntuación de relevancia para cada evento
      const scoredEvents = allEvents.map((event: any) => {
        let score = 0;
        let reasons: string[] = [];

        // PRIORIDAD 1: Eventos de organizadores seguidos (peso: 1000 puntos)
        if (followedOrganizerIds.includes(event.id_organizador)) {
          score += 1000;
          reasons.push('organizador_seguido');
        }

        // PRIORIDAD 2: Eventos cercanos (peso: 500 puntos)
        if (userLocation && event.ubicacion) {
          const locationSimilarity = this.calculateLocationSimilarity(userLocation, event.ubicacion);
          if (locationSimilarity > 0) {
            score += locationSimilarity * 5; // Máximo 500 puntos
            reasons.push('ubicacion_cercana');
          }
        }

        // PRIORIDAD 3: Eventos próximos en el tiempo (peso: 100 puntos)
        const eventDate = new Date(event.fecha_evento);
        const now = new Date();
        const daysUntilEvent = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilEvent > 0 && daysUntilEvent <= 30) {
          // Más cercano = más puntos (eventos en los próximos 30 días)
          score += Math.max(0, 100 - daysUntilEvent * 3);
          reasons.push('proximo');
        }

        // PRIORIDAD 4: Disponibilidad de entradas (peso: 50 puntos)
        const tiposEntrada = event.tipos_entrada || [];
        const disponibilidad = tiposEntrada.reduce((acc: number, tipo: any) => {
          return acc + (tipo.cantidad_disponible || 0);
        }, 0);
        
        if (disponibilidad > 0) {
          score += Math.min(50, disponibilidad); // Máximo 50 puntos
        }

        return {
          ...event,
          recommendationScore: score,
          recommendationReasons: reasons
        };
      });

      // 4. Ordenar por puntuación (mayor a menor)
      scoredEvents.sort((a, b) => b.recommendationScore - a.recommendationScore);

      return scoredEvents;
    } catch (error) {
      console.error('Error al obtener eventos recomendados:', error);
      throw error;
    }
  }

  /**
   * Obtiene la ubicación del usuario desde su perfil
   * @param userId ID del usuario
   * @returns Ubicación del usuario o null
   */
  static async getUserLocation(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('preferencias')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      // Buscar ubicación en preferencias
      if (!data) return null;
      
      const preferencias = (data as any).preferencias as any;
      return preferencias?.ubicacion || preferencias?.location || null;
    } catch (error) {
      console.error('Error al obtener ubicación del usuario:', error);
      return null;
    }
  }

  /**
   * Obtiene eventos de organizadores seguidos
   * @param userId ID del usuario
   * @returns Array de eventos de organizadores seguidos
   */
  static async getFollowedOrganizersEvents(userId: string): Promise<any[]> {
    try {
      const followedOrganizers = await OrganizerFollowService.listarOrganizadoresSeguidos(userId);
      const followedOrganizerIds = followedOrganizers.map(org => org.id);

      if (followedOrganizerIds.length === 0) return [];

      const { data: events, error } = await supabase
        .from('eventos')
        .select(`
          *,
          tipos_entrada (
            id,
            nombre_tipo,
            precio,
            descripcion,
            cantidad_maxima,
            cantidad_disponible
          )
        `)
        .in('id_organizador', followedOrganizerIds)
        .in('estado', ['publicado', 'borrador'])
        .order('fecha_evento', { ascending: true });

      if (error) throw error;
      return events || [];
    } catch (error) {
      console.error('Error al obtener eventos de organizadores seguidos:', error);
      throw error;
    }
  }

  /**
   * Obtiene eventos cercanos a la ubicación del usuario
   * @param userLocation Ubicación del usuario
   * @param limit Número máximo de eventos a retornar
   * @returns Array de eventos cercanos
   */
  static async getNearbyEvents(userLocation: string, limit: number = 20): Promise<any[]> {
    try {
      const { data: allEvents, error } = await supabase
        .from('eventos')
        .select(`
          *,
          tipos_entrada (
            id,
            nombre_tipo,
            precio,
            descripcion,
            cantidad_maxima,
            cantidad_disponible
          )
        `)
        .in('estado', ['publicado', 'borrador'])
        .order('fecha_evento', { ascending: true });

      if (error) throw error;
      if (!allEvents || allEvents.length === 0) return [];

      // Calcular similitud de ubicación y ordenar
      const eventsWithDistance = allEvents
        .map((event: any) => ({
          ...event,
          locationSimilarity: this.calculateLocationSimilarity(userLocation, event.ubicacion)
        }))
        .filter(event => event.locationSimilarity > 0)
        .sort((a, b) => b.locationSimilarity - a.locationSimilarity)
        .slice(0, limit);

      return eventsWithDistance;
    } catch (error) {
      console.error('Error al obtener eventos cercanos:', error);
      throw error;
    }
  }
}
