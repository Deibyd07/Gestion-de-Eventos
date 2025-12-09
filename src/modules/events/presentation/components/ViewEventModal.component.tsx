import React from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  DollarSign, 
  Tag, 
  BarChart, 
  TrendingUp, 
  Eye,
  ShoppingCart,
  CheckCircle,
  Activity
} from 'lucide-react';
import { Modal } from '@shared/ui';
import { formatRevenue } from '@shared/lib/utils/Currency.utils';

interface EventDetails {
  id: string;
  titulo: string;
  descripcion: string;
  url_imagen?: string;
  fecha_evento: string;
  hora_evento: string;
  ubicacion: string;
  categoria: string;
  maximo_asistentes: number;
  asistentes_actuales: number;
  estado: string;
  etiquetas?: string[];
  nombre_organizador: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  tipos_entrada?: Array<{
    id: string;
    nombre_tipo: string;
    precio: number;
    descripcion?: string;
    cantidad_maxima: number;
    cantidad_vendida?: number;
    cantidad_disponible?: number;
  }>;
  compras?: Array<{
    id: string;
    cantidad: number;
    total_pagado: number;
    estado: string;
    fecha_creacion: string;
  }>;
  analiticas_eventos?: Array<{
    total_visualizaciones: number;
    total_ventas: number;
    tasa_conversion: number;
    tasa_asistencia: number;
  }>;
  asistencia_eventos?: Array<{
    id: string;
    fecha_asistencia: string;
  }>;
}

interface ViewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventDetails | null;
}

export const ViewEventModal: React.FC<ViewEventModalProps> = ({ isOpen, onClose, event }) => {
  if (!event) return null;

  const analytics = event.analiticas_eventos?.[0];
  const comprasCompletadas = event.compras?.filter(c => c.estado === 'completada') || [];
  const totalVentas = comprasCompletadas.reduce((sum, c) => sum + c.total_pagado, 0);
  const asistenciasRegistradas = event.asistencia_eventos?.length || 0;
  const porcentajeOcupacion = event.maximo_asistentes > 0 
    ? ((event.asistentes_actuales / event.maximo_asistentes) * 100).toFixed(1)
    : '0';

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, { color: string; label: string }> = {
      'borrador': { color: 'bg-gray-100 text-gray-700 border-gray-300', label: 'Borrador' },
      'publicado': { color: 'bg-green-100 text-green-700 border-green-300', label: 'Publicado' },
      'pausado': { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', label: 'Pausado' },
      'cancelado': { color: 'bg-red-100 text-red-700 border-red-300', label: 'Cancelado' },
      'finalizado': { color: 'bg-blue-100 text-blue-700 border-blue-300', label: 'Finalizado' }
    };
    return badges[estado] || badges['borrador'];
  };

  const estadoBadge = getEstadoBadge(event.estado);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" showCloseButton={false}>
      {/* Header */}
      <div className="flex items-start justify-between pb-4 border-b border-gray-200">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{event.titulo}</h2>
            <div className="flex items-center space-x-2 mt-1 flex-wrap">
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${estadoBadge.color}`}>
                {estadoBadge.label}
              </span>
              <span className="text-xs text-gray-500 hidden sm:inline">•</span>
              <span className="text-xs sm:text-sm text-gray-600">{event.categoria}</span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 group flex-shrink-0 ml-2"
        >
          <X className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
        </button>
      </div>

      {/* Content - Sin overflow propio, usa el del Modal padre */}
      <div className="space-y-4 mt-4">
        {/* Imagen del Evento */}
        {event.url_imagen && (
          <div className="relative h-40 sm:h-48 rounded-xl overflow-hidden shadow-lg border border-gray-200">
            <img
              src={event.url_imagen}
              alt={event.titulo}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>
        )}

        {/* Grid de Estadísticas Principales */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
            <div className="flex items-center justify-between mb-1">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <p className="text-xs font-medium text-green-700">Ventas</p>
            <p className="text-sm sm:text-lg font-bold text-green-900 truncate">{formatRevenue(totalVentas)}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center justify-between mb-1">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <p className="text-xs font-medium text-blue-700">Compras</p>
            <p className="text-sm sm:text-lg font-bold text-blue-900">{comprasCompletadas.length}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
            <div className="flex items-center justify-between mb-1">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
            <p className="text-xs font-medium text-purple-700">Asistentes</p>
            <p className="text-sm sm:text-lg font-bold text-purple-900">{event.asistentes_actuales}/{event.maximo_asistentes}</p>
          </div>

        </div>

        {/* Información del Evento */}
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
            <Calendar className="w-4 h-4 text-blue-500 mr-2" />
            Información del Evento
          </h3>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Descripción</label>
              <p className="text-sm text-gray-700 mt-1 leading-relaxed line-clamp-3">{event.descripcion}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-gray-100">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  Fecha
                </label>
                <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(event.fecha_evento)}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Hora
                </label>
                <p className="text-sm font-medium text-gray-900 mt-1">{event.hora_evento}</p>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-gray-500 uppercase flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  Ubicación
                </label>
                <p className="text-sm font-medium text-gray-900 mt-1">{event.ubicacion}</p>
              </div>
            </div>

            {/* Etiquetas */}
            {event.etiquetas && event.etiquetas.length > 0 && (
              <div className="pt-3 border-t border-gray-100">
                <label className="text-xs font-semibold text-gray-500 uppercase flex items-center mb-2">
                  <Tag className="w-3 h-3 mr-1" />
                  Etiquetas
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {event.etiquetas.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 rounded-md text-xs font-medium border border-blue-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Analíticas Compactas */}
        {analytics && (
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
              <BarChart className="w-4 h-4 text-purple-500 mr-2" />
              Analíticas
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-xs text-gray-600">Conversión</p>
                <p className="text-xl font-bold text-blue-900">{(analytics.tasa_conversion || 0).toFixed(1)}%</p>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-600">Asistencia</p>
                <p className="text-xl font-bold text-green-900">{(analytics.tasa_asistencia || 0).toFixed(1)}%</p>
              </div>

              <div className="text-center sm:col-span-1 col-span-2">
                <p className="text-xs text-gray-600">Registros</p>
                <p className="text-xl font-bold text-purple-900">{asistenciasRegistradas}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tipos de Entrada Compactos */}
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
            <DollarSign className="w-4 h-4 text-green-500 mr-2" />
            Tipos de Entrada
          </h3>
          {event.tipos_entrada && event.tipos_entrada.length > 0 ? (
            <div className="space-y-2">
              {event.tipos_entrada.map((ticket) => {
                const maximos = ticket.cantidad_maxima ?? 0;
                const disponibles = ticket.cantidad_disponible ?? maximos;
                const vendidos = ticket.cantidad_vendida ?? Math.max(maximos - disponibles, 0);
                const restantes = Math.max(disponibles, 0);
                const porcentajeVendido = maximos > 0 
                  ? ((vendidos / maximos) * 100).toFixed(0)
                  : '0';
                
                return (
                  <div
                    key={ticket.id}
                    className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm truncate">{ticket.nombre_tipo}</h4>
                        {ticket.descripcion && (
                          <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">{ticket.descripcion}</p>
                        )}
                      </div>
                      <p className="text-lg font-bold text-green-600 ml-3 flex-shrink-0">{formatRevenue(ticket.precio)}</p>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-700 mb-2">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg">Vendidas: {vendidos}</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg">Restantes: {restantes}</span>
                      <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded-lg">Totales: {maximos}</span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg">{porcentajeVendido}%</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">{vendidos} / {maximos}</span>
                        <span className="text-gray-500">{porcentajeVendido}% vendido</span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${porcentajeVendido}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <DollarSign className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-500">Sin entradas configuradas</p>
            </div>
          )}
        </div>

        {/* Metadata Compacta */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
          <h3 className="text-xs font-bold text-gray-700 uppercase mb-3">Información del Sistema</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-gray-500 font-medium">Organizador</label>
              <p className="font-semibold text-gray-900 mt-0.5 truncate">{event.nombre_organizador}</p>
            </div>
            <div>
              <label className="text-gray-500 font-medium">Creado</label>
              <p className="font-semibold text-gray-900 mt-0.5">{formatDateTime(event.fecha_creacion)}</p>
            </div>
            <div>
              <label className="text-gray-500 font-medium">Actualizado</label>
              <p className="font-semibold text-gray-900 mt-0.5">{formatDateTime(event.fecha_actualizacion)}</p>
            </div>
            <div>
              <label className="text-gray-500 font-medium">ID</label>
              <p className="font-mono text-gray-700 mt-0.5 truncate" title={event.id}>{event.id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 sm:px-6 py-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-lg transition-all duration-200 font-semibold shadow-sm text-sm"
        >
          Cerrar
        </button>
      </div>
    </Modal>
  );
};
