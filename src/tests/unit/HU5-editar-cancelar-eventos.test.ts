/**
 * Historia de Usuario 5: Como organizador, quiero editar y cancelar eventos 
 * con notificación automática a los asistentes
 * 
 * Criterios de Aceptación:
 * 
 * CA1: El organizador puede editar información del evento
 * - Título, descripción, fecha, ubicación, etc.
 * - Los cambios se reflejan inmediatamente
 * - Se mantiene el ID del evento
 * 
 * CA2: El organizador puede cancelar un evento
 * - El estado cambia a "cancelado"
 * - Se puede incluir un motivo de cancelación
 * - El evento sigue existiendo en la BD pero marcado como cancelado
 * 
 * CA3: Al cancelar un evento se notifica automáticamente a todos los compradores
 * - Se consulta la tabla de compras (no asistencia_eventos)
 * - Solo se notifica a usuarios con compras "completada" o "pendiente"
 * - Se elimina duplicados si un usuario tiene múltiples compras
 * - Cada usuario recibe solo una notificación
 * 
 * CA4: La notificación de cancelación incluye información completa
 * - Título: "Evento Cancelado: [Nombre del Evento]"
 * - Mensaje incluye el nombre del evento
 * - Mensaje incluye el motivo de cancelación (si se proporciona)
 * - Menciona que las entradas serán reembolsadas
 * - Incluye referencia al evento (id_evento) para datos actualizados
 * 
 * CA5: Las notificaciones se crean correctamente en la base de datos
 * - tipo: 'evento'
 * - leida: false (comienzan sin leer)
 * - url_accion apunta al evento cancelado
 * - metadata incluye información histórica
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventService } from '../../shared/lib/api/services/Event.service';
import { NotificationService } from '../../shared/lib/api/services/Notification.service';
import { supabase } from '../../shared/lib/api/supabase';

// Mock de Supabase
vi.mock('../../shared/lib/api/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn()
    }
  }
}));

describe('HU5: Editar y Cancelar Eventos con Notificación', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CA1: Editar información del evento', () => {
    it('debe permitir al organizador actualizar la información del evento', async () => {
      const eventoId = 'evento-123';
      const datosActualizados = {
        titulo: 'Concierto Rock - Actualizado',
        descripcion: 'Nueva descripción',
        ubicacion: 'Nueva ubicación',
        fecha_evento: '2024-08-15T20:00:00'
      };

      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: eventoId, ...datosActualizados },
              error: null
            })
          })
        })
      });

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate
      } as any);

      const resultado = await EventService.actualizarEvento(eventoId, datosActualizados);

      expect(resultado).not.toBeNull();
      expect((resultado as any).id).toBe(eventoId);
      expect((resultado as any).titulo).toBe(datosActualizados.titulo);
      expect(mockUpdate).toHaveBeenCalledWith(datosActualizados);
    });

    it('debe mantener el mismo ID del evento después de editar', async () => {
      const eventoOriginal = {
        id: 'evento-456',
        titulo: 'Festival Original',
        descripcion: 'Descripción original'
      };

      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { ...eventoOriginal, titulo: 'Festival Actualizado' },
              error: null
            })
          })
        })
      });

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate
      } as any);

      const resultado = await EventService.actualizarEvento(eventoOriginal.id, {
        titulo: 'Festival Actualizado'
      });

      expect(resultado).not.toBeNull();
      expect((resultado as any).id).toBe(eventoOriginal.id);
    });
  });

  describe('CA2: Cancelar evento', () => {
    it('debe cambiar el estado del evento a "cancelado"', async () => {
      const eventoId = 'evento-789';
      const motivoCancelacion = 'Mal clima';

      // Mock para SELECT que obtiene el título del evento
      const mockSelectEvento = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { titulo: 'Concierto al aire libre' },
            error: null
          })
        })
      });

      // Mock para UPDATE que cambia el estado
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { 
                id: eventoId, 
                estado: 'cancelado',
                titulo: 'Concierto al aire libre'
              },
              error: null
            })
          })
        })
      });

      // Mock de compras (vacío para este test)
      const mockSelectCompras = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      });

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'eventos') {
          return { 
            select: mockSelectEvento,
            update: mockUpdate 
          } as any;
        }
        if (table === 'compras') {
          return { select: mockSelectCompras } as any;
        }
        if (table === 'asistencia_eventos') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                neq: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({ data: [], error: null })
                })
              })
            })
          } as any;
        }
        return {} as any;
      });

      const resultado = await EventService.cambiarEstadoEvento(
        eventoId, 
        'cancelado', 
        motivoCancelacion
      );

      expect(resultado).not.toBeNull();
      expect((resultado as any).estado).toBe('cancelado');
    });

    it('debe permitir cancelar sin proporcionar motivo', async () => {
      const eventoId = 'evento-999';

      // Mock para SELECT que obtiene el título del evento
      const mockSelectEvento = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { titulo: 'Festival de Jazz' },
            error: null
          })
        })
      });

      // Mock para UPDATE que cambia el estado
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { 
                id: eventoId, 
                estado: 'cancelado',
                titulo: 'Festival de Jazz'
              },
              error: null
            })
          })
        })
      });

      // Mock de compras (vacío para este test)
      const mockSelectCompras = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      });

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'eventos') {
          return { 
            select: mockSelectEvento,
            update: mockUpdate 
          } as any;
        }
        if (table === 'compras') {
          return { select: mockSelectCompras } as any;
        }
        if (table === 'asistencia_eventos') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                neq: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({ data: [], error: null })
                })
              })
            })
          } as any;
        }
        return {} as any;
      });

      const resultado = await EventService.cambiarEstadoEvento(eventoId, 'cancelado');

      expect(resultado).not.toBeNull();
      expect((resultado as any).estado).toBe('cancelado');
    });
  });

  describe('CA3: Notificar a compradores al cancelar evento', () => {
    it('debe consultar la tabla de compras (no asistencia_eventos)', async () => {
      const eventoId = 'evento-111';
      const tituloEvento = 'Concierto Rock';
      
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: [
              { id_usuario: 'user-1' },
              { id_usuario: 'user-2' }
            ],
            error: null
          })
        })
      });

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: [{}, {}],
          error: null
        })
      });

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'compras') {
          return { select: mockSelect } as any;
        }
        if (table === 'notificaciones') {
          return { insert: mockInsert } as any;
        }
        if (table === 'asistencia_eventos') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                neq: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({
                    data: [],
                    error: null
                  })
                })
              })
            })
          } as any;
        }
        return {} as any;
      });

      await NotificationService.notificarEventoCancelado(eventoId, tituloEvento);

      // Verificar que se consultó la tabla compras
      expect(mockSelect).toHaveBeenCalledWith('id_usuario');
      
      // Verificar el filtro por estado
      const eqCall = mockSelect().eq;
      expect(eqCall).toHaveBeenCalledWith('id_evento', eventoId);
    });

    it('debe notificar solo a usuarios con compras completadas o pendientes', async () => {
      const eventoId = 'evento-222';
      const tituloEvento = 'Festival Electrónica';

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: [
              { id_usuario: 'user-1' }, // compra completada
              { id_usuario: 'user-2' }  // compra pendiente
              // user-3 tiene compra cancelada, no debe aparecer
            ],
            error: null
          })
        })
      });

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: [{}, {}],
          error: null
        })
      });

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'compras') {
          return { select: mockSelect } as any;
        }
        if (table === 'notificaciones') {
          return { insert: mockInsert } as any;
        }
        if (table === 'asistencia_eventos') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                neq: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({ data: [], error: null })
                })
              })
            })
          } as any;
        }
        return {} as any;
      });

      const numNotificados = await NotificationService.notificarEventoCancelado(
        eventoId, 
        tituloEvento
      );

      expect(numNotificados).toBe(2);
      expect(mockInsert).toHaveBeenCalled();
    });

    it('debe eliminar duplicados si un usuario tiene múltiples compras', async () => {
      const eventoId = 'evento-333';
      const tituloEvento = 'Concierto Metal';

      // Usuario 1 tiene 3 compras, Usuario 2 tiene 2 compras
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: [
              { id_usuario: 'user-1' },
              { id_usuario: 'user-1' },
              { id_usuario: 'user-1' },
              { id_usuario: 'user-2' },
              { id_usuario: 'user-2' }
            ],
            error: null
          })
        })
      });

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: [{}, {}], // Solo 2 notificaciones (usuarios únicos)
          error: null
        })
      });

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'compras') {
          return { select: mockSelect } as any;
        }
        if (table === 'notificaciones') {
          return { insert: mockInsert } as any;
        }
        if (table === 'asistencia_eventos') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                neq: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({ data: [], error: null })
                })
              })
            })
          } as any;
        }
        return {} as any;
      });

      const numNotificados = await NotificationService.notificarEventoCancelado(
        eventoId,
        tituloEvento
      );

      // Debe notificar solo 2 usuarios únicos (no 5)
      expect(numNotificados).toBe(2);
    });

    it('debe retornar 0 si no hay compradores para notificar', async () => {
      const eventoId = 'evento-444';
      const tituloEvento = 'Evento Sin Ventas';

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: [], // Sin compras
            error: null
          })
        })
      });

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'compras') {
          return { select: mockSelect } as any;
        }
        return {} as any;
      });

      const numNotificados = await NotificationService.notificarEventoCancelado(
        eventoId,
        tituloEvento
      );

      expect(numNotificados).toBe(0);
    });
  });

  describe('CA4: Contenido de la notificación de cancelación', () => {
    it('debe incluir el nombre del evento en el título', async () => {
      const eventoId = 'evento-555';
      const tituloEvento = 'Concierto de Salsa';
      const motivo = 'Problemas técnicos';

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: [{ id_usuario: 'user-1' }],
            error: null
          })
        })
      });

      let notificacionCreada: any = null;
      const mockInsert = vi.fn().mockImplementation((notificaciones) => {
        notificacionCreada = notificaciones[0];
        return {
          select: vi.fn().mockResolvedValue({
            data: [{}],
            error: null
          })
        };
      });

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'compras') {
          return { select: mockSelect } as any;
        }
        if (table === 'notificaciones') {
          return { insert: mockInsert } as any;
        }
        if (table === 'asistencia_eventos') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                neq: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({ data: [], error: null })
                })
              })
            })
          } as any;
        }
        return {} as any;
      });

      await NotificationService.notificarEventoCancelado(eventoId, tituloEvento, motivo);

      expect(notificacionCreada.titulo).toContain(tituloEvento);
      expect(notificacionCreada.titulo).toContain('Evento Cancelado');
    });

    it('debe incluir el nombre del evento y el motivo en el mensaje', async () => {
      const eventoId = 'evento-666';
      const tituloEvento = 'Festival de Rock';
      const motivo = 'Lluvia intensa';

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: [{ id_usuario: 'user-1' }],
            error: null
          })
        })
      });

      let notificacionCreada: any = null;
      const mockInsert = vi.fn().mockImplementation((notificaciones) => {
        notificacionCreada = notificaciones[0];
        return {
          select: vi.fn().mockResolvedValue({
            data: [{}],
            error: null
          })
        };
      });

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'compras') {
          return { select: mockSelect } as any;
        }
        if (table === 'notificaciones') {
          return { insert: mockInsert } as any;
        }
        if (table === 'asistencia_eventos') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                neq: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({ data: [], error: null })
                })
              })
            })
          } as any;
        }
        return {} as any;
      });

      await NotificationService.notificarEventoCancelado(eventoId, tituloEvento, motivo);

      expect(notificacionCreada.mensaje).toContain(tituloEvento);
      expect(notificacionCreada.mensaje).toContain(motivo);
      expect(notificacionCreada.mensaje).toContain('reembolsadas');
    });

    it('debe mencionar reembolso automático en el mensaje', async () => {
      const eventoId = 'evento-777';
      const tituloEvento = 'Obra de Teatro';

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: [{ id_usuario: 'user-1' }],
            error: null
          })
        })
      });

      let notificacionCreada: any = null;
      const mockInsert = vi.fn().mockImplementation((notificaciones) => {
        notificacionCreada = notificaciones[0];
        return {
          select: vi.fn().mockResolvedValue({
            data: [{}],
            error: null
          })
        };
      });

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'compras') {
          return { select: mockSelect } as any;
        }
        if (table === 'notificaciones') {
          return { insert: mockInsert } as any;
        }
        if (table === 'asistencia_eventos') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                neq: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({ data: [], error: null })
                })
              })
            })
          } as any;
        }
        return {} as any;
      });

      await NotificationService.notificarEventoCancelado(eventoId, tituloEvento);

      expect(notificacionCreada.mensaje).toMatch(/reembolsadas automáticamente/i);
    });

    it('debe incluir referencia al evento (id_evento)', async () => {
      const eventoId = 'evento-888';
      const tituloEvento = 'Concierto Sinfónico';

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: [{ id_usuario: 'user-1' }],
            error: null
          })
        })
      });

      let notificacionCreada: any = null;
      const mockInsert = vi.fn().mockImplementation((notificaciones) => {
        notificacionCreada = notificaciones[0];
        return {
          select: vi.fn().mockResolvedValue({
            data: [{}],
            error: null
          })
        };
      });

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'compras') {
          return { select: mockSelect } as any;
        }
        if (table === 'notificaciones') {
          return { insert: mockInsert } as any;
        }
        if (table === 'asistencia_eventos') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                neq: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({ data: [], error: null })
                })
              })
            })
          } as any;
        }
        return {} as any;
      });

      await NotificationService.notificarEventoCancelado(eventoId, tituloEvento);

      expect(notificacionCreada.id_evento).toBe(eventoId);
    });
  });

  describe('CA5: Propiedades de las notificaciones', () => {
    it('debe crear notificaciones con tipo "evento"', async () => {
      const eventoId = 'evento-999';
      const tituloEvento = 'Festival de Jazz';

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: [{ id_usuario: 'user-1' }],
            error: null
          })
        })
      });

      let notificacionCreada: any = null;
      const mockInsert = vi.fn().mockImplementation((notificaciones) => {
        notificacionCreada = notificaciones[0];
        return {
          select: vi.fn().mockResolvedValue({
            data: [{}],
            error: null
          })
        };
      });

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'compras') {
          return { select: mockSelect } as any;
        }
        if (table === 'notificaciones') {
          return { insert: mockInsert } as any;
        }
        if (table === 'asistencia_eventos') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                neq: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({ data: [], error: null })
                })
              })
            })
          } as any;
        }
        return {} as any;
      });

      await NotificationService.notificarEventoCancelado(eventoId, tituloEvento);

      expect(notificacionCreada.tipo).toBe('evento');
    });

    it('debe crear notificaciones sin leer (leida: false)', async () => {
      const eventoId = 'evento-1010';
      const tituloEvento = 'Exposición de Arte';

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: [{ id_usuario: 'user-1' }],
            error: null
          })
        })
      });

      let notificacionCreada: any = null;
      const mockInsert = vi.fn().mockImplementation((notificaciones) => {
        notificacionCreada = notificaciones[0];
        return {
          select: vi.fn().mockResolvedValue({
            data: [{}],
            error: null
          })
        };
      });

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'compras') {
          return { select: mockSelect } as any;
        }
        if (table === 'notificaciones') {
          return { insert: mockInsert } as any;
        }
        if (table === 'asistencia_eventos') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                neq: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({ data: [], error: null })
                })
              })
            })
          } as any;
        }
        return {} as any;
      });

      await NotificationService.notificarEventoCancelado(eventoId, tituloEvento);

      expect(notificacionCreada.leida).toBe(false);
    });

    it('debe incluir url_accion que apunte al evento', async () => {
      const eventoId = 'evento-1111';
      const tituloEvento = 'Maratón Ciudad';

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: [{ id_usuario: 'user-1' }],
            error: null
          })
        })
      });

      let notificacionCreada: any = null;
      const mockInsert = vi.fn().mockImplementation((notificaciones) => {
        notificacionCreada = notificaciones[0];
        return {
          select: vi.fn().mockResolvedValue({
            data: [{}],
            error: null
          })
        };
      });

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'compras') {
          return { select: mockSelect } as any;
        }
        if (table === 'notificaciones') {
          return { insert: mockInsert } as any;
        }
        if (table === 'asistencia_eventos') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                neq: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({ data: [], error: null })
                })
              })
            })
          } as any;
        }
        return {} as any;
      });

      await NotificationService.notificarEventoCancelado(eventoId, tituloEvento);

      expect(notificacionCreada.url_accion).toContain(eventoId);
      expect(notificacionCreada.url_accion).toContain('/events/');
      expect(notificacionCreada.texto_accion).toBe('Ver detalles');
    });

    it('debe incluir metadata con información histórica', async () => {
      const eventoId = 'evento-1212';
      const tituloEvento = 'Conferencia Tech';

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: [{ id_usuario: 'user-1' }],
            error: null
          })
        })
      });

      let notificacionCreada: any = null;
      const mockInsert = vi.fn().mockImplementation((notificaciones) => {
        notificacionCreada = notificaciones[0];
        return {
          select: vi.fn().mockResolvedValue({
            data: [{}],
            error: null
          })
        };
      });

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'compras') {
          return { select: mockSelect } as any;
        }
        if (table === 'notificaciones') {
          return { insert: mockInsert } as any;
        }
        if (table === 'asistencia_eventos') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                neq: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({ data: [], error: null })
                })
              })
            })
          } as any;
        }
        return {} as any;
      });

      await NotificationService.notificarEventoCancelado(eventoId, tituloEvento);

      expect(notificacionCreada.metadata).toBeDefined();
      expect(notificacionCreada.metadata.nombre_evento_original).toBe(tituloEvento);
      expect(notificacionCreada.metadata.tipo_notificacion).toBe('evento_cancelado');
      expect(notificacionCreada.metadata.fecha_cancelacion).toBeDefined();
    });
  });
});
