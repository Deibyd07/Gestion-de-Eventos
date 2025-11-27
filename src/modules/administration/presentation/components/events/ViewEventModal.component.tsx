import React from 'react';
import { X, Calendar, MapPin, Users, DollarSign, Tag, Clock, User, Image as ImageIcon } from 'lucide-react';

interface Event {
  id: string;
  titulo: string;
  descripcion: string;
  url_imagen: string;
  fecha_evento: string;
  hora_evento: string;
  ubicacion: string;
  categoria: string;
  maximo_asistentes: number;
  asistentes_actuales: number;
  estado: 'borrador' | 'publicado' | 'pausado' | 'cancelado' | 'finalizado';
  id_organizador: string;
  nombre_organizador: string;
  etiquetas: string[];
  fecha_creacion: string;
  fecha_actualizacion: string;
  tipos_entrada?: any[];
  analiticas_eventos?: any[];
}

interface ViewEventModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ViewEventModal: React.FC<ViewEventModalProps> = ({ event, isOpen, onClose }) => {
  if (!isOpen || !event) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'publicado': return 'bg-green-100 text-green-800';
      case 'borrador': return 'bg-yellow-100 text-yellow-800';
      case 'pausado': return 'bg-orange-100 text-orange-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      case 'finalizado': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'publicado': return 'Publicado';
      case 'borrador': return 'Borrador';
      case 'pausado': return 'Pausado';
      case 'cancelado': return 'Cancelado';
      case 'finalizado': return 'Finalizado';
      default: return 'Desconocido';
    }
  };

  const ocupacion = event.maximo_asistentes > 0 
    ? ((event.asistentes_actuales / event.maximo_asistentes) * 100).toFixed(1)
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header con imagen */}
        <div className="relative h-64 md:h-80">
          <img
            src={event.url_imagen || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'}
            alt={event.titulo}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Estado */}
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(event.estado)}`}>
              {getStatusText(event.estado)}
            </span>
          </div>

          {/* Título superpuesto */}
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{event.titulo}</h2>
            <div className="flex items-center text-white/90">
              <User className="w-4 h-4 mr-2" />
              <span className="text-sm">Organizado por {event.nombre_organizador}</span>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 md:p-8">
          {/* Información Principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-xl">
              <Calendar className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Fecha y Hora</p>
                <p className="font-semibold text-gray-900">{formatDate(event.fecha_evento)}</p>
                <p className="text-sm text-gray-700">{event.hora_evento}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-xl">
              <MapPin className="w-5 h-5 text-purple-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Ubicación</p>
                <p className="font-semibold text-gray-900">{event.ubicacion}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-xl">
              <Users className="w-5 h-5 text-green-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Asistentes</p>
                <p className="font-semibold text-gray-900">
                  {event.asistentes_actuales} / {event.maximo_asistentes}
                </p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${ocupacion}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">{ocupacion}% de ocupación</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-amber-50 rounded-xl">
              <Tag className="w-5 h-5 text-amber-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Categoría</p>
                <p className="font-semibold text-gray-900">{event.categoria}</p>
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Descripción</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{event.descripcion}</p>
          </div>

          {/* Etiquetas */}
          {event.etiquetas && event.etiquetas.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Etiquetas</h3>
              <div className="flex flex-wrap gap-2">
                {event.etiquetas.map((etiqueta, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                  >
                    {etiqueta}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tipos de Entrada */}
          {event.tipos_entrada && event.tipos_entrada.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Tipos de Entrada</h3>
              <div className="space-y-3">
                {event.tipos_entrada.map((tipo: any) => (
                  <div
                    key={tipo.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{tipo.nombre_tipo}</p>
                      <p className="text-sm text-gray-600">{tipo.descripcion}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {tipo.cantidad_disponible} / {tipo.cantidad_maxima} disponibles
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(tipo.precio)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analíticas */}
          {event.analiticas_eventos && event.analiticas_eventos.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Estadísticas</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {event.analiticas_eventos.map((analytic: any) => (
                  <React.Fragment key={analytic.id}>
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                      <p className="text-2xl font-bold text-blue-900">{analytic.total_visualizaciones || 0}</p>
                      <p className="text-xs text-blue-700">Visualizaciones</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                      <p className="text-2xl font-bold text-green-900">{analytic.total_ventas || 0}</p>
                      <p className="text-xs text-green-700">Ventas</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                      <p className="text-2xl font-bold text-purple-900">{formatCurrency(analytic.ingresos_totales || 0)}</p>
                      <p className="text-xs text-purple-700">Ingresos</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl">
                      <p className="text-2xl font-bold text-amber-900">{(analytic.tasa_conversion || 0).toFixed(1)}%</p>
                      <p className="text-xs text-amber-700">Conversión</p>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* Información Adicional */}
          <div className="border-t pt-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Creado:</span> {formatDate(event.fecha_creacion)}
              </div>
              <div>
                <span className="font-medium">Última actualización:</span> {formatDate(event.fecha_actualizacion)}
              </div>
            </div>
          </div>

          {/* Footer con botones */}
          <div className="flex justify-end mt-6 pt-6 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
