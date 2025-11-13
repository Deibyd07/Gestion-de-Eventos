import { X, Calendar, Clock, MapPin, Users, DollarSign, Tag, Image as ImageIcon, BarChart, TrendingUp } from 'lucide-react';
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
    cantidad_vendida: number;
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

export function ViewEventModal({ isOpen, onClose, event }: ViewEventModalProps) {
  if (!event) return null;

  const analytics = event.analiticas_eventos?.[0];
  const comprasCompletadas = event.compras?.filter(c => c.estado === 'completada') || [];
  const totalVentas = comprasCompletadas.reduce((sum, c) => c.total_pagado, 0);
  const asistenciasRegistradas = event.asistencia_eventos?.length || 0;
  const porcentajeOcupacion = event.maximo_asistentes > 0 
    ? ((event.asistentes_actuales / event.maximo_asistentes) * 100).toFixed(1)
    : 0;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-CO', {
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

  const getEstadoBadgeColor = (estado: string) => {
    const colors: Record<string, string> = {
      'borrador': 'bg-gray-100 text-gray-700 border-gray-300',
      'publicado': 'bg-green-100 text-green-700 border-green-300',
      'pausado': 'bg-yellow-100 text-yellow-700 border-yellow-300',
      'cancelado': 'bg-red-100 text-red-700 border-red-300',
      'finalizado': 'bg-blue-100 text-blue-700 border-blue-300'
    };
    return colors[estado] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" showCloseButton={false}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Detalles del Evento</h2>
            <p className="text-sm text-gray-500">Información completa y estadísticas</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto pr-2">
        {/* Columna Principal - Información del Evento */}
        <div className="lg:col-span-2 space-y-6">
          {/* Imagen del Evento */}
          {event.url_imagen && (
            <div className="relative h-64 rounded-xl overflow-hidden">
              <img
                src={event.url_imagen}
                alt={event.titulo}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getEstadoBadgeColor(event.estado)}`}>
                  {event.estado.charAt(0).toUpperCase() + event.estado.slice(1)}
                </span>
              </div>
            </div>
          )}

          {/* Información Básica */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{event.titulo}</h3>
            <p className="text-gray-600 mb-4">{event.descripcion}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Fecha</p>
                  <p className="text-sm text-gray-900 font-semibold">{formatDate(event.fecha_evento)}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Hora</p>
                  <p className="text-sm text-gray-900 font-semibold">{event.hora_evento}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Ubicación</p>
                  <p className="text-sm text-gray-900 font-semibold">{event.ubicacion}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Tag className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Categoría</p>
                  <p className="text-sm text-gray-900 font-semibold">{event.categoria}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Users className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Capacidad</p>
                  <p className="text-sm text-gray-900 font-semibold">
                    {event.asistentes_actuales} / {event.maximo_asistentes} ({porcentajeOcupacion}%)
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <BarChart className="w-5 h-5 text-cyan-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Asistencia Registrada</p>
                  <p className="text-sm text-gray-900 font-semibold">{asistenciasRegistradas} personas</p>
                </div>
              </div>
            </div>

            {/* Etiquetas */}
            {event.etiquetas && event.etiquetas.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 font-medium mb-2">Etiquetas</p>
                <div className="flex flex-wrap gap-2">
                  {event.etiquetas.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tipos de Entrada */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border border-gray-200">
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 text-green-500 mr-2" />
              Tipos de Entrada
            </h4>
            {event.tipos_entrada && event.tipos_entrada.length > 0 ? (
              <div className="space-y-3">
                {event.tipos_entrada.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900">{ticket.nombre_tipo}</h5>
                      {ticket.descripcion && (
                        <p className="text-sm text-gray-600 mt-1">{ticket.descripcion}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Vendidas: {ticket.cantidad_vendida} / {ticket.cantidad_maxima}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-lg font-bold text-green-600">{formatRevenue(ticket.precio)}</p>
                      <p className="text-xs text-gray-500">por entrada</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No hay tipos de entrada configurados</p>
            )}
          </div>
        </div>

        {/* Columna Lateral - Estadísticas y Metadata */}
        <div className="space-y-6">
          {/* Estadísticas de Ventas */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
              Estadísticas de Ventas
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Ventas</span>
                <span className="text-lg font-bold text-green-600">{formatRevenue(totalVentas)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Compras Completadas</span>
                <span className="text-lg font-bold text-gray-900">{comprasCompletadas.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Compras</span>
                <span className="text-lg font-bold text-gray-900">{event.compras?.length || 0}</span>
              </div>
            </div>
          </div>

          {/* Analytics */}
          {analytics && (
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <BarChart className="w-5 h-5 text-blue-600 mr-2" />
                Analíticas
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Visualizaciones</span>
                  <span className="text-lg font-bold text-blue-600">{analytics.total_visualizaciones || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Conversión</span>
                  <span className="text-lg font-bold text-gray-900">{(analytics.tasa_conversion || 0).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tasa Asistencia</span>
                  <span className="text-lg font-bold text-gray-900">{(analytics.tasa_asistencia || 0).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Información del Sistema</h4>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-500 font-medium">Organizador</p>
                <p className="text-gray-900 font-semibold">{event.nombre_organizador}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Creado</p>
                <p className="text-gray-900">{formatDateTime(event.fecha_creacion)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Última Actualización</p>
                <p className="text-gray-900">{formatDateTime(event.fecha_actualizacion)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">ID del Evento</p>
                <p className="text-gray-900 font-mono text-xs break-all">{event.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer con botones de acción */}
      <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
        <button
          onClick={onClose}
          className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
        >
          Cerrar
        </button>
      </div>
    </Modal>
  );
}
