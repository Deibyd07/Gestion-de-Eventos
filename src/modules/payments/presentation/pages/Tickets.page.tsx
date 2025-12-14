import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Calendar, Search, Filter, QrCode, MapPin, Clock, Users, Eye, Ticket, Star } from 'lucide-react';
import { usePurchaseStore } from '../../../payments/infrastructure/store/Purchase.store';
import { useAuthStore } from '../../../authentication/infrastructure/store/Auth.store';
import { useEventStore } from '../../../events/infrastructure/store/Event.store';
import { QRTicketDisplay } from '@shared/ui/components/QRTicketDisplay';
import { formatPriceDisplay } from '@shared/lib/utils/Currency.utils';
import { QRCodeService } from '@shared/lib/services/QRCode.service';
import { PurchaseService } from '@shared/lib/api/services/Purchase.service';

export function TicketsPage() {
  const location = useLocation();
  const { user } = useAuthStore();
  const { getEventById } = useEventStore();
  const { getUserPurchases } = usePurchaseStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'activo' | 'usado' | 'cancelado' | 'expirado'>('all');
  const [qrTickets, setQrTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState<boolean>(true);
  const [regenerating, setRegenerating] = useState<Record<string, boolean>>({});
  const [authUid, setAuthUid] = useState<string | null>(null);

  // Load QR tickets for the user
  useEffect(() => {
    if (user) {
      loadUserQRTickets();
      loadUserPurchases();
    }
  }, [user]);

  const loadUserQRTickets = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data: authInfo } = await (await import('@shared/lib/api/supabase')).supabase.auth.getUser();
      setAuthUid(authInfo?.user?.id || null);
      const tickets = await QRCodeService.getQRsByUser(user.id);
      console.log('🎟️ QRs obtenidos:', tickets);
      setQrTickets(tickets || []);
    } catch (error) {
      console.error('Error loading QR tickets:', error);
      setQrTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUserPurchases = async () => {
    if (!user) return;
    try {
      setLoadingPurchases(true);
      const data = await PurchaseService.obtenerComprasUsuario(user.id);
      console.log('🧾 Compras obtenidas:', data);
      setPurchases(data || []);
      // Fallback: si no hay QRs pero sí compras, cargar QRs por compra
      if ((data?.length || 0) > 0 && qrTickets.length === 0) {
        const all: any[] = [];
        for (const p of data!) {
          try {
            const list = await QRCodeService.getQRsByPurchase(p.id);
            if (list && list.length) all.push(...list);
          } catch (e) {
            console.warn('No se pudieron cargar QRs de compra', p.id, e);
          }
        }
        if (all.length) {
          console.log('🎟️ QRs obtenidos por fallback:', all);
          setQrTickets(all);
        }
        // No auto-regenerar; dejar que usuario use el botón manual
      }
    } catch (error) {
      console.error('Error cargando compras del usuario:', error);
      setPurchases([]);
    } finally {
      setLoadingPurchases(false);
    }
  };

  // Get user's purchases
  const allPurchases = user ? getUserPurchases(user.id) : [];

  // Filter QR tickets based on search and status
  const filteredQRTickets = qrTickets.filter(ticket => {
    const matchesSearch =
      ticket.datos_qr?.event_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.datos_qr?.ticket_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.codigo_qr.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || ticket.estado === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Group QR tickets by event
  const qrTicketsByEvent = filteredQRTickets.reduce((acc, ticket) => {
    const eventTitle = ticket.datos_qr?.event_title || 'Evento desconocido';
    if (!acc[eventTitle]) {
      acc[eventTitle] = [];
    }
    acc[eventTitle].push(ticket);
    return acc;
  }, {} as Record<string, typeof qrTickets>);

  // Ayudantes para compras sin QR
  const countQrsForPurchase = (purchaseId: string) => qrTickets.filter(t => t.id_compra === purchaseId).length;
  const purchasesWithoutQR = purchases.filter(p => countQrsForPurchase(p.id) < (p.cantidad || 0));

  const regenerateQRsForPurchase = async (purchase: any) => {
    try {
      setRegenerating(prev => ({ ...prev, [purchase.id]: true }));
      const existing = await QRCodeService.getQRsByPurchase(purchase.id);
      const existingCount = existing?.length || 0;
      const needed = (purchase.cantidad || 0) - existingCount;
      if (needed <= 0) {
        console.log('✅ Compra ya tiene todos los QRs:', purchase.id);
        return;
      }

      console.log(`🔧 Generando ${needed} QRs para compra ${purchase.id}...`);
      console.log('📦 Datos de compra:', {
        id: purchase.id,
        id_evento: purchase.id_evento,
        id_tipo_entrada: purchase.id_tipo_entrada,
        id_usuario: purchase.id_usuario,
        cantidad: purchase.cantidad
      });

      // Obtener datos del evento y tipo de entrada
      const { supabase } = await import('@shared/lib/api/supabase');
      const [eventoResult, tipoResult] = await Promise.all([
        supabase.from('eventos').select('*').eq('id', purchase.id_evento).single(),
        supabase.from('tipos_entrada').select('*').eq('id', purchase.id_tipo_entrada).single()
      ]);

      const evento = eventoResult.data;
      const tipoEntrada = tipoResult.data;

      console.log('🎫 Datos obtenidos:', {
        evento: evento?.titulo,
        tipoEntrada: tipoEntrada?.nombre_tipo,
        eventoError: eventoResult.error,
        tipoError: tipoResult.error
      });

      // Construir datos base para QRTicketData
      const base = {
        eventId: purchase.id_evento,
        eventTitle: evento?.titulo || 'Evento',
        // Usar id_usuario de la compra (existe en usuarios) en lugar del auth store
        userName: user!.name || 'Usuario',
        userEmail: user!.email,
        purchaseId: purchase.id,
        ticketType: tipoEntrada?.nombre_tipo || 'General',
        price: Number(purchase.precio_unitario) || 0,
        eventDate: evento?.fecha_evento || '',
        eventTime: evento?.hora_evento || '',
        eventLocation: evento?.ubicacion || '',
        purchaseDate: purchase.fecha_creacion || new Date().toISOString()
      };

      const createPromises: Promise<any>[] = [];
      for (let i = existingCount + 1; i <= (purchase.cantidad || 0); i++) {
        const ticketData = {
          ticketId: `${purchase.id}-${i}`,
          ticketNumber: i,
          // Usar id_usuario de la compra (existe en usuarios) en lugar de auth.uid()
          userId: purchase.id_usuario,
          ...base
        };
        console.log(`🎟️ Creando QR #${i}:`, ticketData);
        createPromises.push(
          QRCodeService.createQRTicket(ticketData as any)
        );
      }

      const results = await Promise.all(createPromises);
      console.log(`✅ ${needed} QRs generados para compra ${purchase.id}`);
      console.log('📊 Resultados:', results);

      // Recargar QRs después de generarlos
      await loadUserQRTickets();
    } catch (error: any) {
      console.error('❌ Error regenerando QRs:', error);
      console.error('📋 Detalle del error:', {
        code: error?.code,
        message: error?.message,
        details: error?.details,
        hint: error?.hint
      });
      throw error;
    } finally {
      setRegenerating(prev => ({ ...prev, [purchase.id]: false }));
    }
  };

  // Filter purchases based on search and status
  const filteredPurchases = allPurchases.filter(purchase => {
    const matchesSearch = purchase.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      purchase.ticketTypeName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || purchase.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Group purchases by event
  const purchasesByEvent = filteredPurchases.reduce((acc, purchase) => {
    if (!acc[purchase.eventId]) {
      acc[purchase.eventId] = [];
    }
    acc[purchase.eventId].push(purchase);
    return acc;
  }, {} as Record<string, typeof allPurchases>);

  const getEventDetails = (eventId: string) => {
    return getEventById(eventId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50/80 to-blue-50/80 backdrop-blur-sm p-3 sm:p-4 md:p-6">
      <div className="w-full">
        {/* Header */}
        <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Ticket className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                  Mis Entradas
                </h1>
                <p className="text-sm sm:text-base text-gray-600 hidden sm:block">
                  Gestiona y descarga tus entradas
                </p>
              </div>
            </div>
            {/* Stats - Grid responsive */}
            <div className="grid grid-cols-4 sm:flex sm:items-center gap-2 sm:gap-4">
              <div className="text-center sm:text-right bg-gray-50 sm:bg-transparent rounded-lg p-2 sm:p-0">
                <div className="text-lg sm:text-2xl font-bold text-gray-900">
                  {Object.keys(qrTicketsByEvent).length}
                </div>
                <div className="text-xs sm:text-sm text-gray-500">Eventos</div>
              </div>
              <div className="text-center sm:text-right bg-gray-50 sm:bg-transparent rounded-lg p-2 sm:p-0">
                <div className="text-lg sm:text-2xl font-bold text-gray-900">
                  {qrTickets.length}
                </div>
                <div className="text-xs sm:text-sm text-gray-500">Entradas</div>
              </div>
              <div className="text-center sm:text-right bg-green-50 sm:bg-transparent rounded-lg p-2 sm:p-0">
                <div className="text-lg sm:text-2xl font-bold text-green-600">
                  {qrTickets.filter(t => t.estado === 'activo').length}
                </div>
                <div className="text-xs sm:text-sm text-gray-500">Activas</div>
              </div>
              <div className="text-center sm:text-right bg-gray-50 sm:bg-transparent rounded-lg p-2 sm:p-0">
                <div className="text-lg sm:text-2xl font-bold text-gray-900">
                  {purchases.length}
                </div>
                <div className="text-xs sm:text-sm text-gray-500">Compras</div>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {location.state?.message && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-xs">✓</span>
              </div>
              <p className="text-green-800">{location.state.message}</p>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar evento..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="flex-1 lg:flex-none lg:w-40 px-3 sm:px-4 py-2.5 sm:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos</option>
                <option value="activo">Activas</option>
                <option value="usado">Usadas</option>
                <option value="cancelado">Canceladas</option>
                <option value="expirado">Expiradas</option>
              </select>

              {/* View Mode Toggle - Hidden on mobile */}
              <div className="hidden sm:flex gap-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2.5 sm:py-3 rounded-lg transition-colors ${viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  <QrCode className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2.5 sm:py-3 rounded-lg transition-colors ${viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tickets */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando tus entradas...</p>
          </div>
        ) : Object.keys(qrTicketsByEvent).length > 0 ? (
          <div className="space-y-8">
            {Object.entries(qrTicketsByEvent).map(([eventTitle, tickets]) => {
              const firstTicket = tickets[0];
              const eventId = firstTicket.id_evento;
              const eventDetails = getEventById(eventId);

              return (
                <div key={eventTitle} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Event Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sm:p-6">
                    <div className="flex flex-col gap-3 sm:gap-4">
                      <div className="flex-1">
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">{eventTitle}</h2>
                        <div className="flex flex-wrap gap-3 text-blue-100 text-xs sm:text-sm">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{firstTicket.datos_qr?.event_date ? new Date(firstTicket.datos_qr.event_date).toLocaleDateString('es-ES') : 'Fecha N/D'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="truncate max-w-[100px] sm:max-w-none">{firstTicket.datos_qr?.event_location || 'Ubicación N/D'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <QrCode className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{tickets.length} entrada{tickets.length > 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xl sm:text-2xl md:text-3xl font-bold">
                            {formatPriceDisplay(tickets.reduce((sum, t) => sum + (t.datos_qr?.price || 0), 0))}
                          </div>
                          <div className="text-blue-100 text-xs sm:text-sm">Total</div>
                        </div>
                        <Link
                          to={`/events/${eventId}`}
                          className="inline-flex items-center px-3 sm:px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors text-xs sm:text-sm"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          <span className="hidden sm:inline">Ver Evento</span>
                          <span className="sm:hidden">Ver</span>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Tickets Display */}
                  <div className="p-4 sm:p-6">
                    {viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {tickets.map((ticket) => (
                          <QRTicketDisplay key={ticket.id} ticket={ticket} />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3 sm:space-y-4">
                        {tickets.map((ticket) => (
                          <QRTicketDisplay key={ticket.id} ticket={ticket} compact />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16 md:py-20">
            <div className="w-20 h-20 sm:w-24 md:w-32 sm:h-24 md:h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
              <Ticket className="w-10 h-10 sm:w-12 md:w-16 sm:h-12 md:h-16 text-blue-600" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              {searchQuery || statusFilter !== 'all'
                ? 'No se encontraron entradas'
                : '¡Aún no tienes entradas!'
              }
            </h3>
            <p className="text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base lg:text-lg px-4">
              {searchQuery || statusFilter !== 'all'
                ? 'Intenta ajustar tus filtros.'
                : 'Explora eventos y compra tus entradas.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link
                to="/events"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
              >
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Explorar Eventos
              </Link>
              {searchQuery || statusFilter !== 'all' && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300 text-sm sm:text-base"
                >
                  <Filter className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Limpiar Filtros
                </button>
              )}
            </div>
          </div>
        )}

        {/* Compras sin QR (respaldo) */}
        {!loadingPurchases && purchasesWithoutQR.length > 0 && (
          <div className="mt-10">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">Compras sin QR</h2>
              <p className="text-gray-600">Algunas compras no tienen sus códigos QR generados. Puedes generarlos aquí.</p>
            </div>
            <div className="space-y-4">
              {purchasesWithoutQR.map((p) => {
                const generated = countQrsForPurchase(p.id);
                return (
                  <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{p.eventos?.titulo || 'Evento'}</div>
                      <div className="text-sm text-gray-600">{p.tipos_entrada?.nombre_tipo || 'Entrada'}</div>
                      <div className="text-sm text-gray-500">{generated}/{p.cantidad} QR generados</div>
                    </div>
                    <button
                      onClick={() => regenerateQRsForPurchase(p)}
                      disabled={!!regenerating[p.id]}
                      className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                      {regenerating[p.id] ? 'Generando...' : 'Regenerar QRs'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


