import { supabase } from '../supabase';

export interface TopOrganizer {
  id: string;
  name: string;
  events: number;
  revenue: number;
  rating: number;
}

/**
 * Servicio para obtener el ranking de organizadores
 */
export class TopOrganizersService {
  /**
   * Obtiene el ranking de organizadores ordenados por ingresos generados
   */
  static async getTopOrganizers(limit: number = 5): Promise<TopOrganizer[]> {
    try {
      // Obtener todos los organizadores con sus compras
      const { data: compras, error: comprasError } = await supabase
        .from('compras')
        .select(`
          total_pagado,
          eventos:id_evento (
            id_organizador,
            nombre_organizador
          )
        `)
        .eq('estado', 'completada');

      if (comprasError) {
        console.error('Error al obtener compras:', comprasError);
        return [];
      }

      type CompraData = {
        total_pagado: number;
        eventos: {
          id_organizador: string;
          nombre_organizador: string;
        } | null;
      };

      const comprasTyped = (compras || []) as CompraData[];

      // Agrupar ingresos por organizador
      const organizadoresMap = new Map<string, {
        id: string;
        name: string;
        revenue: number;
        eventIds: Set<string>;
      }>();

      comprasTyped.forEach(compra => {
        if (compra.eventos) {
          const orgId = compra.eventos.id_organizador;
          const orgName = compra.eventos.nombre_organizador;
          const revenue = parseFloat(String(compra.total_pagado)) || 0;

          if (!organizadoresMap.has(orgId)) {
            organizadoresMap.set(orgId, {
              id: orgId,
              name: orgName,
              revenue: 0,
              eventIds: new Set()
            });
          }

          const org = organizadoresMap.get(orgId)!;
          org.revenue += revenue;
        }
      });

      // Obtener eventos por organizador para contar
      const { data: eventos, error: eventosError } = await supabase
        .from('eventos')
        .select('id, id_organizador, nombre_organizador');

      if (eventosError) {
        console.error('Error al obtener eventos:', eventosError);
      }

      type EventoData = {
        id: string;
        id_organizador: string;
        nombre_organizador: string;
      };

      const eventosTyped = (eventos || []) as EventoData[];

      // Contar eventos por organizador
      eventosTyped.forEach(evento => {
        const orgId = evento.id_organizador;
        if (!organizadoresMap.has(orgId)) {
          organizadoresMap.set(orgId, {
            id: orgId,
            name: evento.nombre_organizador,
            revenue: 0,
            eventIds: new Set()
          });
        }
        organizadoresMap.get(orgId)!.eventIds.add(evento.id);
      });

      // Obtener calificaciones promedio por organizador
      const organizersWithRatings = await Promise.all(
        Array.from(organizadoresMap.values()).map(async (org) => {
          const rating = await this.getOrganizerAverageRating(org.id);
          return {
            id: org.id,
            name: org.name,
            events: org.eventIds.size,
            revenue: org.revenue,
            rating
          };
        })
      );

      // Ordenar por ingresos y tomar los top
      const topOrganizers = organizersWithRatings
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, limit);

      return topOrganizers;
    } catch (error) {
      console.error('Error al obtener top organizadores:', error);
      return [];
    }
  }

  /**
   * Obtiene el promedio de calificaciones de los eventos de un organizador
   */
  private static async getOrganizerAverageRating(organizadorId: string): Promise<number> {
    try {
      // Primero obtener los IDs de los eventos del organizador
      const { data: eventos, error: eventosError } = await supabase
        .from('eventos')
        .select('id')
        .eq('id_organizador', organizadorId);

      if (eventosError || !eventos || eventos.length === 0) {
        return 0;
      }

      const eventIds = eventos.map(e => (e as { id: string }).id);

      // Obtener calificaciones de esos eventos
      const { data: ratings, error: ratingsError } = await supabase
        .from('calificaciones_eventos')
        .select('calificacion')
        .in('id_evento', eventIds);

      if (ratingsError || !ratings || ratings.length === 0) {
        return 0;
      }

      type RatingData = { calificacion: number };
      const ratingsTyped = ratings as RatingData[];

      const sum = ratingsTyped.reduce((acc, r) => acc + r.calificacion, 0);
      const average = sum / ratingsTyped.length;

      return Math.round(average * 10) / 10; // Redondear a 1 decimal
    } catch (error) {
      console.error('Error al obtener calificación promedio:', error);
      return 0;
    }
  }

  /**
   * Obtiene todos los organizadores con estadísticas completas
   */
  static async getAllOrganizersRanking(limit: number = 50): Promise<TopOrganizer[]> {
    return this.getTopOrganizers(limit);
  }
}
