import { supabase } from '../supabase';

export interface LocationStat {
  location: string;
  count: number;
  percentage: number;
}

/**
 * Servicio para obtener estadísticas de ubicaciones de eventos
 */
export class LocationStatsService {
  /**
   * Obtiene las estadísticas de ubicaciones donde se crean eventos
   */
  static async getLocationStats(limit?: number): Promise<LocationStat[]> {
    try {
      const { data, error } = await supabase
        .from('eventos')
        .select('ubicacion');

      if (error) {
        console.error('Error al obtener ubicaciones:', error);
        return [];
      }

      type EventoData = { ubicacion: string };
      const eventos = (data || []) as EventoData[];

      if (eventos.length === 0) {
        return [];
      }

      // Contar eventos por ubicación
      const locationCounts = new Map<string, number>();
      
      eventos.forEach(evento => {
        const location = this.normalizeLocation(evento.ubicacion);
        locationCounts.set(location, (locationCounts.get(location) || 0) + 1);
      });

      // Calcular porcentajes
      const total = eventos.length;
      const locationStats: LocationStat[] = Array.from(locationCounts.entries()).map(([location, count]) => ({
        location,
        count,
        percentage: Math.round((count / total) * 100 * 10) / 10 // Redondear a 1 decimal
      }));

      // Ordenar por cantidad de eventos (mayor a menor)
      locationStats.sort((a, b) => b.count - a.count);

      // Limitar si se especifica
      if (limit) {
        return locationStats.slice(0, limit);
      }

      return locationStats;
    } catch (error) {
      console.error('Error al obtener estadísticas de ubicaciones:', error);
      return [];
    }
  }

  /**
   * Normaliza la ubicación para agrupar variaciones
   * Por ejemplo: "Bogotá", "bogota", "BOGOTA" -> "Bogotá"
   */
  private static normalizeLocation(location: string): string {
    if (!location || location.trim() === '') {
      return 'Sin especificar';
    }

    // Limpiar y capitalizar
    const cleaned = location.trim();
    
    // Capitalizar primera letra de cada palabra
    return cleaned
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Obtiene las top ubicaciones (para el panel principal)
   */
  static async getTopLocations(limit: number = 5): Promise<Record<string, number>> {
    const stats = await this.getLocationStats(limit);
    
    const result: Record<string, number> = {};
    stats.forEach(stat => {
      result[stat.location] = stat.percentage;
    });

    return result;
  }

  /**
   * Obtiene todas las ubicaciones con sus estadísticas completas
   */
  static async getAllLocationStats(): Promise<LocationStat[]> {
    return this.getLocationStats();
  }
}
