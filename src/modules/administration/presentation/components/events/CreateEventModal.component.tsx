import React, { useState } from 'react';
import { X, Save, Calendar, MapPin, Users, Tag, Image as ImageIcon, AlertCircle, Plus } from 'lucide-react';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (eventData: EventCreateData) => Promise<void>;
}

export interface EventCreateData {
  titulo: string;
  descripcion: string;
  url_imagen: string;
  fecha_evento: string;
  hora_evento: string;
  ubicacion: string;
  categoria: string;
  maximo_asistentes: number;
  estado: 'borrador' | 'publicado' | 'pausado' | 'cancelado' | 'finalizado';
  etiquetas: string[];
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState<EventCreateData>({
    titulo: '',
    descripcion: '',
    url_imagen: '',
    fecha_evento: '',
    hora_evento: '',
    ubicacion: '',
    categoria: '',
    maximo_asistentes: 100,
    estado: 'borrador',
    etiquetas: []
  });
  const [etiquetasInput, setEtiquetasInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

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

      const eventData = {
        ...formData,
        etiquetas
      };

      await onCreate(eventData);
      
      // Resetear formulario
      setFormData({
        titulo: '',
        descripcion: '',
        url_imagen: '',
        fecha_evento: '',
        hora_evento: '',
        ubicacion: '',
        categoria: '',
        maximo_asistentes: 100,
        estado: 'borrador',
        etiquetas: []
      });
      setEtiquetasInput('');
      onClose();
    } catch (err: any) {
      console.error('Error al crear evento:', err);
      setError(err.message || 'Error al crear el evento');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof EventCreateData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

  // Obtener fecha mínima (hoy)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Crear Nuevo Evento</h2>
              <p className="text-green-100 text-sm mt-1">Completa la información del evento</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              disabled={loading}
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
              value={formData.titulo}
              onChange={(e) => handleChange('titulo', e.target.value)}
              placeholder="Ej: Feria Agropecuaria 2025"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción *
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              placeholder="Describe tu evento, qué actividades incluye, qué pueden esperar los asistentes..."
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.descripcion.length} caracteres
            </p>
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
                value={formData.fecha_evento}
                onChange={(e) => handleChange('fecha_evento', e.target.value)}
                min={today}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora del Evento *
              </label>
              <input
                type="time"
                value={formData.hora_evento}
                onChange={(e) => handleChange('hora_evento', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
                disabled={loading}
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
                value={formData.ubicacion}
                onChange={(e) => handleChange('ubicacion', e.target.value)}
                placeholder="Ej: Bogotá, Colombia"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-2" />
                Categoría *
              </label>
              <select
                value={formData.categoria}
                onChange={(e) => handleChange('categoria', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
                disabled={loading}
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
                <option value="Arte">Arte</option>
                <option value="Gastronomía">Gastronomía</option>
                <option value="Música">Música</option>
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
                value={formData.maximo_asistentes}
                onChange={(e) => handleChange('maximo_asistentes', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Número máximo de asistentes permitidos
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado Inicial *
              </label>
              <select
                value={formData.estado}
                onChange={(e) => handleChange('estado', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
                disabled={loading}
              >
                <option value="borrador">Borrador (No visible)</option>
                <option value="publicado">Publicado (Visible)</option>
                <option value="pausado">Pausado</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Puedes cambiar el estado después
              </p>
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
              value={formData.url_imagen}
              onChange={(e) => handleChange('url_imagen', e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              URL de la imagen de portada del evento (opcional)
            </p>
          </div>

          {/* Etiquetas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Etiquetas
            </label>
            <input
              type="text"
              value={etiquetasInput}
              onChange={(e) => setEtiquetasInput(e.target.value)}
              placeholder="música, concierto, festival, gratis"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Escribe etiquetas separadas por comas para ayudar a categorizar el evento
            </p>
          </div>

          {/* Información Adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Información importante:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>Los campos marcados con * son obligatorios</li>
                  <li>Puedes agregar tipos de entrada después de crear el evento</li>
                  <li>El evento se asociará automáticamente a tu cuenta de organizador</li>
                  <li>Si lo guardas como "Borrador", no será visible para los usuarios</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer con botones */}
          <div className="flex flex-col-reverse sm:flex-row justify-end space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all font-medium shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              <Plus className="w-5 h-5" />
              <span>{loading ? 'Creando evento...' : 'Crear Evento'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
