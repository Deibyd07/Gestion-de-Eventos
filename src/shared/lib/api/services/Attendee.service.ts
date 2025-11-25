import { supabase, type TablesUpdate } from '../supabase';

export interface AttendeeRow {
  qr_id: string;
  codigo_qr: string;
  estado_qr: 'activo' | 'usado' | 'cancelado' | 'expirado';
  fecha_escaneado?: string | null;
  fecha_generacion: string;
  eventId: string;
  eventTitle: string;
  organizerId: string;
  userId: string;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  userRole?: string | null;
  purchaseId: string;
  purchaseDate: string;
  purchaseOrderNumber?: string | null;
  purchaseQuantity?: number | null;
  purchaseTotalPaid?: number | null;
  ticketType?: string | null;
  ticketPrice?: number | null;
}

export class AttendeeService {
  static async getOrganizerAttendees(organizerId: string, eventId?: string): Promise<AttendeeRow[]> {
    console.log('🔍 getOrganizerAttendees organizerId=', organizerId, 'eventId=', eventId);
    // Debug auth vs organizerId (posible desalineación entre auth.uid() y usuarios.id)
    try {
      const { data: authInfo } = await supabase.auth.getUser();
      const authUid = authInfo?.user?.id;
      const authEmail = authInfo?.user?.email;
      console.log('🆔 Auth debug -> auth.uid():', authUid, 'auth.email:', authEmail, 'organizerId param:', organizerId, 'mismatch?', authUid !== organizerId);
    } catch (e) {
      console.warn('⚠️ No se pudo obtener auth user para debug:', (e as any)?.message);
    }

    // 0. Intento rápido: usar RPC SECURITY DEFINER si existe (evita múltiples selects bajo RLS)
    // NOTA: Comentado temporalmente porque la estructura del RPC no coincide con los nuevos campos agregados
    /*
    try {
      const { data: rpcData, error: rpcErr } = await supabase.rpc('listar_asistentes_organizador', {
        p_organizer_id: organizerId,
        p_event_id: eventId ?? null
      });
      if (!rpcErr && Array.isArray(rpcData) && rpcData.length > 0) {
        console.log('🚀 RPC listar_asistentes_organizador retornó filas:', rpcData.length);
        const mapped: AttendeeRow[] = rpcData.map((r: any) => ({
          qr_id: r.qr_id,
          codigo_qr: r.codigo_qr,
          estado_qr: r.estado_qr,
          fecha_escaneado: r.fecha_escaneado,
          fecha_generacion: r.fecha_generacion,
          eventId: r.event_id,
            eventTitle: r.event_title,
          organizerId: r.organizer_id,
          userId: r.user_id,
          name: r.nombre_usuario,
          email: r.correo_usuario,
          phone: null,
          avatar: r.url_avatar,
          userRole: r.rol,
          purchaseId: r.purchase_id,
          purchaseDate: r.purchase_date,
          purchaseOrderNumber: r.numero_orden,
          purchaseQuantity: r.cantidad,
          purchaseTotalPaid: r.total_pagado,
          ticketType: r.ticket_type,
          ticketPrice: typeof r.ticket_price === 'number' ? r.ticket_price : Number(r.ticket_price) || 0
        }));
        console.log('🎉 Total final asistentes (RPC):', mapped.length);
        console.log('🧪 Debug estados attendees RPC =>', mapped.map(a => ({ purchaseId: a.purchaseId, estado_qr: a.estado_qr, scan: a.fecha_escaneado })));
        return mapped;
      } else if (rpcErr) {
        // RPC no existe o falló; continuar con lógica tradicional.
        console.warn('⚠️ RPC listar_asistentes_organizador no disponible / error:', rpcErr.message);
      } else {
        console.log('ℹ️ RPC sin datos, continuando con selects estándar.');
      }
    } catch (e:any) {
      console.warn('⚠️ Excepción llamando RPC listar_asistentes_organizador:', e.message);
    }
    */
    
    // Row type defs (local to method to keep file scoped light)
    interface EventoRow { id: string; titulo: string; id_organizador: string; }
    interface QrRow { id: string; codigo_qr: string; estado: 'activo' | 'usado' | 'cancelado' | 'expirado'; fecha_escaneado?: string | null; fecha_generacion: string; id_usuario: string; id_evento: string; id_compra: string; }
    interface AsistenciaRow { id: string; id_usuario: string; id_evento: string; id_compra: string; fecha_asistencia: string; estado_asistencia: string; metodo_validacion?: string | null; }
    interface CompraRow { id: string; id_usuario: string; id_evento: string; id_tipo_entrada: string; fecha_creacion: string; precio_unitario?: number | null; numero_orden?: string | null; cantidad?: number | null; total_pagado?: number | null; }
    interface TipoEntradaRow { id: string; nombre_tipo: string; precio?: number | null; }
    interface UsuarioRow { id: string; nombre_completo: string; correo_electronico: string; url_avatar?: string | null; rol?: string | null; }

    // 1. Obtener eventos del organizador
    const { data: organizerEventsRaw, error: eventsErr } = await supabase
      .from('eventos')
      .select('id,titulo,id_organizador')
      .eq('id_organizador', organizerId);
    if (eventsErr) {
      console.error('❌ Error obteniendo eventos del organizador:', eventsErr);
      return [];
    }
    const organizerEvents: EventoRow[] = organizerEventsRaw ?? [];

    const eventIds = eventId ? organizerEvents.filter(e => e.id === eventId).map(e => e.id) : organizerEvents.map(e => e.id);
    console.log('🧾 eventIds del organizador:', eventIds);
    if (eventIds.length === 0) {
      console.warn('⚠️ El organizador no tiene eventos asociados');
      return [];
    }

    // 2. Obtener códigos QR de esos eventos (sin joins para evitar RLS en relaciones)
    const { data: qrRowsRaw, error: qrErr } = await supabase
      .from('codigos_qr_entradas')
      .select('id,codigo_qr,estado,fecha_escaneado,fecha_generacion,id_usuario,id_evento,id_compra')
      .in('id_evento', eventIds);
    if (qrErr) {
      console.error('❌ Error obteniendo QR rows:', qrErr);
    }
    const qrRows: QrRow[] = qrRowsRaw ?? [];
    console.log('📦 qrRows count:', qrRows.length);

    // 3. Obtener asistencias manuales (si existe la tabla y política lo permite)
    const { data: asistenciaRowsRaw, error: asistenciaErr } = await supabase
      .from('asistencia_eventos')
      .select('id,id_usuario,id_evento,id_compra,fecha_asistencia,estado_asistencia,metodo_validacion')
      .in('id_evento', eventIds)
      .eq('estado_asistencia','presente');
    if (asistenciaErr) {
      console.warn('⚠️ No se pudieron obtener asistencias (posible RLS):', asistenciaErr.message);
    }
    const asistenciaRows: AsistenciaRow[] = asistenciaRowsRaw ?? [];
    console.log('📦 asistenciaRows count:', asistenciaRows.length);

    // 4. Reunir IDs para datos relacionados
    const userIds = new Set<string>();
    const compraIds = new Set<string>();
    const tipoEntradaIds = new Set<string>();

    (qrRows || []).forEach(r => { if (r.id_usuario) userIds.add(r.id_usuario); if (r.id_compra) compraIds.add(r.id_compra); });
    (asistenciaRows || []).forEach(r => { if (r.id_usuario) userIds.add(r.id_usuario); if (r.id_compra) compraIds.add(r.id_compra); });

    // 5. Obtener compras para recuperar tipo_entrada y datos adicionales
    const { data: comprasRowsRaw, error: comprasErr } = await supabase
      .from('compras')
      .select('id,id_usuario,id_evento,id_tipo_entrada,fecha_creacion,precio_unitario,numero_orden,cantidad,total_pagado')
      .in('id', Array.from(compraIds));
    if (comprasErr) console.error('❌ Error obteniendo compras:', comprasErr);
    const comprasRows: CompraRow[] = comprasRowsRaw ?? [];
    comprasRows.forEach(c => { if (c.id_tipo_entrada) tipoEntradaIds.add(c.id_tipo_entrada); });

    // 6. Obtener tipos de entrada
    let tiposRows: TipoEntradaRow[] = [];
    if (tipoEntradaIds.size > 0) {
      const { data: tiposRaw, error: tiposErr } = await supabase
        .from('tipos_entrada')
        .select('id,nombre_tipo,precio')
        .in('id', Array.from(tipoEntradaIds));
      if (tiposErr) console.error('❌ Error tipos_entrada:', tiposErr);
      tiposRows = tiposRaw ?? [];
    }

    // 7. Obtener usuarios con información completa (usar RPC SECURITY DEFINER para bypass RLS)
    let usuariosRows: UsuarioRow[] = [];
    const userIdList = Array.from(userIds);
    if (userIdList.length > 0) {
      try {
        const { data: usuariosRpcRows, error: usuariosRpcErr } = await (supabase as any)
          .rpc('obtener_usuarios_por_ids', { p_user_ids: userIdList.join(',') });
        if (usuariosRpcErr) {
          console.warn('⚠️ RPC obtener_usuarios_por_ids error, intento fallback select:', usuariosRpcErr.message);
          const { data: usuariosRowsRaw, error: usuariosErr } = await supabase
            .from('usuarios')
            .select('id,nombre_completo,correo_electronico,url_avatar,rol')
            .in('id', userIdList);
          if (usuariosErr) console.error('❌ Error fallback obteniendo usuarios:', usuariosErr.message);
          usuariosRows = usuariosRowsRaw as UsuarioRow[] || [];
        } else {
          usuariosRows = (usuariosRpcRows || []).map(u => ({
            id: u.id,
            nombre_completo: u.nombre_completo,
            correo_electronico: u.correo_electronico,
            url_avatar: u.url_avatar,
            rol: u.rol
          }));
        }
      } catch (e:any) {
        console.error('❌ Excepción obteniendo usuarios por RPC:', e.message);
      }
    }
    if (usuariosRows.length === 0) {
      console.warn('⚠️ usuariosRows vacío tras RPC + fallback. Los nombres pueden usar fallback (email).');
    }

    // 8. Construir mapas
    const compraMap = new Map<string, CompraRow>(comprasRows.map(c => [c.id, c]));
    const tipoEntradaMap = new Map<string, TipoEntradaRow>(tiposRows.map(t => [t.id, t]));
    const usuarioMap = new Map<string, UsuarioRow>(usuariosRows.map(u => [u.id, u]));
    const eventoMap = new Map<string, EventoRow>(organizerEvents.map(e => [e.id, e]));

    // 9. Transformar QR rows con información completa
    const qrAttendees: AttendeeRow[] = qrRows.map(r => {
      const compra = compraMap.get(r.id_compra);
      const tipoEntrada = compra ? tipoEntradaMap.get(compra.id_tipo_entrada) : undefined;
      const usuario = usuarioMap.get(r.id_usuario);
      const evento = eventoMap.get(r.id_evento);
      
      // Debug logging para verificar datos de usuario
      if (!usuario) {
        console.warn('⚠️ Usuario no encontrado para id:', r.id_usuario);
      } else if (!usuario.nombre_completo || usuario.nombre_completo.toLowerCase() === 'usuario') {
        console.warn('⚠️ Usuario sin nombre válido:', { id: usuario.id, nombre: usuario.nombre_completo, email: usuario.correo_electronico });
      }
      
      // Mejorar fallback: usar email si nombre_completo es "usuario" o vacío
      const nombreValido = usuario?.nombre_completo && usuario.nombre_completo.trim() !== '' && usuario.nombre_completo.toLowerCase() !== 'usuario'
        ? usuario.nombre_completo.trim()
        : (usuario?.correo_electronico?.split('@')[0] || 'Asistente');
      
      return {
        qr_id: r.id,
        codigo_qr: r.codigo_qr,
        estado_qr: r.estado,
        fecha_escaneado: r.fecha_escaneado,
        fecha_generacion: r.fecha_generacion,
        eventId: r.id_evento,
        eventTitle: evento?.titulo || 'Evento',
        organizerId: evento?.id_organizador || organizerId,
        userId: r.id_usuario,
        name: nombreValido,
        email: usuario?.correo_electronico || '',
        phone: null,
        avatar: usuario?.url_avatar || null,
        userRole: usuario?.rol || null,
        purchaseId: r.id_compra,
        purchaseDate: compra?.fecha_creacion || r.fecha_generacion,
        purchaseOrderNumber: compra?.numero_orden || null,
        purchaseQuantity: compra?.cantidad || null,
        purchaseTotalPaid: compra?.total_pagado || null,
        ticketType: tipoEntrada?.nombre_tipo || 'General',
        ticketPrice: tipoEntrada?.precio ?? compra?.precio_unitario ?? 0
      };
    });

    // 10. Transformar asistencias manuales con información completa
    const manualAttendees: AttendeeRow[] = asistenciaRows.map(r => {
      const compra = compraMap.get(r.id_compra);
      const tipoEntrada = compra ? tipoEntradaMap.get(compra.id_tipo_entrada) : undefined;
      const usuario = usuarioMap.get(r.id_usuario);
      const evento = eventoMap.get(r.id_evento);
      
      // Mejorar fallback: usar email si nombre_completo es "usuario" o vacío
      const nombreValido = usuario?.nombre_completo && usuario.nombre_completo.trim() !== '' && usuario.nombre_completo.toLowerCase() !== 'usuario'
        ? usuario.nombre_completo.trim()
        : (usuario?.correo_electronico?.split('@')[0] || 'Asistente');
      
      return {
        qr_id: r.id,
        codigo_qr: `MANUAL-${r.id}`,
        estado_qr: 'usado',
        fecha_escaneado: r.fecha_asistencia,
        fecha_generacion: r.fecha_asistencia,
        eventId: r.id_evento,
        eventTitle: evento?.titulo || 'Evento',
        organizerId: evento?.id_organizador || organizerId,
        userId: r.id_usuario,
        name: nombreValido,
        email: usuario?.correo_electronico || '',
        phone: null,
        avatar: usuario?.url_avatar || null,
        userRole: usuario?.rol || null,
        purchaseId: r.id_compra,
        purchaseDate: compra?.fecha_creacion || r.fecha_asistencia,
        purchaseOrderNumber: compra?.numero_orden || null,
        purchaseQuantity: compra?.cantidad || null,
        purchaseTotalPaid: compra?.total_pagado || null,
        ticketType: tipoEntrada?.nombre_tipo || 'General',
        ticketPrice: tipoEntrada?.precio ?? compra?.precio_unitario ?? 0
      };
    });

    console.log('✅ qrAttendees length:', qrAttendees.length, 'manualAttendees length:', manualAttendees.length);

    // 11. Combinar evitando duplicados por purchaseId
    const map = new Map<string, AttendeeRow>();
    qrAttendees.forEach(a => { if (a.purchaseId) map.set(a.purchaseId, a); });
    manualAttendees.forEach(a => { if (a.purchaseId && !map.has(a.purchaseId)) map.set(a.purchaseId, a); });
    let combined = Array.from(map.values()).sort((a,b)=> new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());

    // 12. Fallback mediante compras si sigue vacío
    if (combined.length === 0) {
      console.warn('⚠️ Sin asistentes visibles (posible RLS). Aplicando fallback compras.');
      const { data: comprasFallbackRaw, error: compFbErr } = await supabase
        .from('compras')
        .select('id,id_usuario,id_evento,id_tipo_entrada,fecha_creacion,precio_unitario,numero_orden,cantidad,total_pagado')
        .in('id_evento', eventIds);
      if (!compFbErr && comprasFallbackRaw) {
        const comprasFallback: CompraRow[] = comprasFallbackRaw ?? [];
        comprasFallback.forEach(c => {
          const tipoEntrada = tipoEntradaMap.get(c.id_tipo_entrada);
          const usuario = usuarioMap.get(c.id_usuario);
          const evento = eventoMap.get(c.id_evento);
          
          // Mejorar fallback: usar email si nombre_completo es "usuario" o vacío
          const nombreValido = usuario?.nombre_completo && usuario.nombre_completo.toLowerCase() !== 'usuario' 
            ? usuario.nombre_completo 
            : usuario?.correo_electronico?.split('@')[0] || 'Asistente';
          
          map.set(c.id, {
            qr_id: `PURCHASE-${c.id}`,
            codigo_qr: `PENDING-${c.id}`,
            estado_qr: 'activo',
            fecha_escaneado: null,
            fecha_generacion: c.fecha_creacion,
            eventId: c.id_evento,
            eventTitle: evento?.titulo || 'Evento',
            organizerId: evento?.id_organizador || organizerId,
            userId: c.id_usuario,
            name: nombreValido,
            email: usuario?.correo_electronico || '',
            phone: null,
            avatar: usuario?.url_avatar || null,
            userRole: usuario?.rol || null,
            purchaseId: c.id,
            purchaseDate: c.fecha_creacion,
            purchaseOrderNumber: c.numero_orden || null,
            purchaseQuantity: c.cantidad || null,
            purchaseTotalPaid: c.total_pagado || null,
            ticketType: tipoEntrada?.nombre_tipo || 'General',
            ticketPrice: tipoEntrada?.precio ?? c.precio_unitario ?? 0
          });
        });
        combined = Array.from(map.values()).sort((a,b)=> new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
      }
    }
    // Log detallado para depuración de estados
    console.log('🧪 Debug estados attendees =>', combined.map(a => ({ purchaseId: a.purchaseId, estado_qr: a.estado_qr, checkIn: a.fecha_escaneado })));

    console.log('🎉 Total final asistentes:', combined.length);
    // 13. Post-proceso: refrescar estados QR usando RPC (bypass RLS, sin auth)
    try {
      const purchaseIdsToCheck = Array.from(new Set(combined.map(a => a.purchaseId).filter(Boolean))) as string[];
      if (purchaseIdsToCheck.length > 0) {
        // Evitar payload CSV excesivamente largo (simple guard)
        const csvIds = purchaseIdsToCheck.join(',');
        if (csvIds.length > 15000) {
          console.warn('⚠️ Demasiados purchaseIds para RPC obtener_estados_qr_compras, omitiendo refresco. count=', purchaseIdsToCheck.length);
        } else {
          console.log('🔍 Consultando estados QR para', purchaseIdsToCheck.length, 'compras:', purchaseIdsToCheck.slice(0, 5));
          const { data: qrEstadoRows, error: qrEstadoErr } = await (supabase as any)
            .rpc('obtener_estados_qr_compras', { p_compra_ids: csvIds });

          if (!qrEstadoErr && qrEstadoRows && qrEstadoRows.length > 0) {
            console.log('✅ Estados QR obtenidos:', qrEstadoRows.length);
            const estadoMap = new Map<string, { estado: string; fecha_escaneado: string | null; codigo_qr?: string }>();
            qrEstadoRows.forEach((r: any) => {
              if (r.id_compra) estadoMap.set(r.id_compra, {
                estado: r.estado,
                fecha_escaneado: r.fecha_escaneado,
                codigo_qr: r.codigo_qr
              });
            });
            combined = combined.map(a => {
              if (a.purchaseId && estadoMap.has(a.purchaseId)) {
                const info = estadoMap.get(a.purchaseId)!;
                return {
                  ...a,
                  estado_qr: info.estado as any,
                  fecha_escaneado: info.fecha_escaneado || a.fecha_escaneado,
                  codigo_qr: info.codigo_qr || a.codigo_qr
                };
              }
              return a;
            });
            console.log('🔁 Estados QR refrescados:', combined.map(c => ({ purchaseId: c.purchaseId?.slice(0,8), estado: c.estado_qr, qr: c.codigo_qr?.slice(0,10) })));
          } else if (qrEstadoErr) {
            // Manejo más tolerante al fallo de red (Failed to fetch / timeout)
            const msg = qrEstadoErr.message || '';
            if (/failed to fetch/i.test(msg)) {
              console.warn('⚠️ Network/RPC fetch error obteniendo estados QR (se continuará sin refresco):', msg);
            } else if (/timeout|network/i.test(msg)) {
              console.warn('⚠️ RPC estados QR timeout/network, usando datos previos. mensaje:', msg);
            } else {
              console.warn('⚠️ RPC obtener_estados_qr_compras error:', msg);
              console.log('ℹ️ Si la función RPC no existe, créala en Supabase SQL Editor');
            }
          } else {
            console.warn('⚠️ No se encontraron estados QR para las compras consultadas');
          }
        }
      }
    } catch (e:any) {
      console.warn('⚠️ Excepción refrescando estados QR (continuando sin refresco):', e.message);
    }
    
    const usados = combined.filter(c => c.estado_qr === 'usado').length;
    const activos = combined.filter(c => c.estado_qr === 'activo').length;
    console.log('📊 CLASIFICACIÓN FINAL -> 🟢 Registrados (usado):', usados, '| 🟡 Pendientes (activo):', activos);
    return combined;
  }

  static mapQrEstadoToUiStatus(estado: string): 'pending' | 'checked-in' | 'no-show' | 'cancelled' | 'expired' {
    switch (estado) {
      case 'usado':
        return 'checked-in';
      case 'activo':
        return 'pending';
      case 'cancelado':
        return 'cancelled';
      case 'expirado':
        return 'expired';
      default:
        return 'pending';
    }
  }

  static async checkInByQrCode(codigo_qr: string, organizerId: string) {
    const payload: TablesUpdate<'codigos_qr_entradas'> = { estado: 'usado', fecha_escaneado: new Date().toISOString(), escaneado_por: organizerId };
    const { error } = await (supabase as any)
      .from('codigos_qr_entradas')
      .update(payload)
      .eq('codigo_qr', codigo_qr);

    if (error) throw error;
  }
}
