import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, MapPin, Users, Tag, Image as ImageIcon, AlertCircle } from 'lucide-react';

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
}

interface EditEventModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventId: string, updates: Partial<Event>) => Promise<void>;
}

export const EditEventModal: React.FC<EditEventModalProps> = ({ event, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Event>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [etiquetasInput, setEtiquetasInput] = useState('');

  useEffect(() => {
    if (event) {
      setFormData({
        titulo: event.titulo,
        descripcion: event.descripcion,
        url_imagen: event.url_imagen,
        fecha_evento: event.fecha_evento,
        hora_evento: event.hora_evento,
        ubicacion: event.ubicacion,
        categoria: event.categoria,
        maximo_asistentes: event.maximo_asistentes,
        estado: event.estado,
        etiquetas: event.etiquetas || []
      });
      setEtiquetasInput(event.etiquetas?.join(', ') || '');
    }
  }, [event]);

  if (!isOpen || !event) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Procesar etiquetas
      const etiquetas = etiquetasInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const updates = {
        ...formData,
        etiquetas
      };

      await onSave(event.id, updates);
      onClose();
    } catch (err: any) {
      console.error('Error al actualizar evento:', err);
      setError(err.message || 'Error al actualizar el evento');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Editar Evento</h2>
              <p className="text-blue-100 text-sm mt-1">Modifica la información del evento</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título del Evento *
            </label>
            <input
              type="text"
              value={formData.titulo || ''}
              onChange={(e) => handleChange('titulo', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción *
            </label>
            <textarea
              value={formData.descripcion || ''}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
            />
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Fecha del Evento *
              </label>
              <input
                type="date"
                value={formData.fecha_evento || ''}
                onChange={(e) => handleChange('fecha_evento', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora del Evento *
              </label>
              <input
                type="time"
                value={formData.hora_evento || ''}
                onChange={(e) => handleChange('hora_evento', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Ubicación y Categoría */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Ubicación *
              </label>
              <input
                type="text"
                value={formData.ubicacion || ''}
                onChange={(e) => handleChange('ubicacion', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-2" />
                Categoría *
              </label>
              <select
                value={formData.categoria || ''}
                onChange={(e) => handleChange('categoria', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Seleccionar categoría</option>
                <option value="Agropecuario">Agropecuario</option>
                <option value="Tecnología">Tecnología</option>
                <option value="Cultura">Cultura</option>
                <option value="Negocios">Negocios</option>
                <option value="Deportes">Deportes</option>
                <option value="Educación">Educación</option>
                <option value="Entretenimiento">Entretenimiento</option>
                <option value="Salud">Salud</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          {/* Capacidad y Estado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-2" />
                Capacidad Máxima *
              </label>
              <input
                type="number"
                min="1"
                value={formData.maximo_asistentes || ''}
                onChange={(e) => handleChange('maximo_asistentes', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado *
              </label>
              <select
                value={formData.estado || ''}
                onChange={(e) => handleChange('estado', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="borrador">Borrador</option>
                <option value="publicado">Publicado</option>
                <option value="pausado">Pausado</option>
                <option value="cancelado">Cancelado</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </div>
          </div>

          {/* URL de Imagen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ImageIcon className="w-4 h-4 inline mr-2" />
              URL de la Imagen
            </label>
            <input
              type="url"
              value={formData.url_imagen || ''}
              onChange={(e) => handleChange('url_imagen', e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Etiquetas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Etiquetas (separadas por comas)
            </label>
            <input
              type="text"
              value={etiquetasInput}
              onChange={(e) => setEtiquetasInput(e.target.value)}
              placeholder="música, concierto, festival"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Escribe etiquetas separadas por comas para ayudar a categorizar el evento
            </p>
          </div>

          {/* Footer con botones */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all font-medium shadow-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              <Save className="w-5 h-5" />
              <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
