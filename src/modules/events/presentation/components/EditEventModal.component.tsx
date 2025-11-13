import React, { useState, useEffect } from 'react';
import { Modal, Button } from '@shared/ui';
import { Input } from '@shared/ui';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  FileText,
  X,
  Save,
  Tag
} from 'lucide-react';

export interface EditEventFormData {
  titulo: string;
  descripcion: string;
  fecha_evento: string;
  hora_evento: string;
  ubicacion: string;
  categoria: string;
  maximo_asistentes: number;
  etiquetas?: string[];
}

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: EditEventFormData) => Promise<void>;
  event: {
    id: string;
    titulo: string;
    descripcion: string;
    fecha_evento: string;
    hora_evento: string;
    ubicacion: string;
    categoria: string;
    maximo_asistentes: number;
    asistentes_actuales: number;
    etiquetas?: string[];
  } | null;
  isLoading?: boolean;
}

export const EditEventModal: React.FC<EditEventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  event,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<EditEventFormData>({
    titulo: '',
    descripcion: '',
    fecha_evento: '',
    hora_evento: '',
    ubicacion: '',
    categoria: '',
    maximo_asistentes: 0,
    etiquetas: []
  });

  const [etiquetaInput, setEtiquetaInput] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof EditEventFormData, string>>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Cargar datos del evento cuando se abre el modal
  useEffect(() => {
    if (event && isOpen) {
      setFormData({
        titulo: event.titulo,
        descripcion: event.descripcion,
        fecha_evento: event.fecha_evento,
        hora_evento: event.hora_evento,
        ubicacion: event.ubicacion,
        categoria: event.categoria,
        maximo_asistentes: event.maximo_asistentes,
        etiquetas: event.etiquetas || []
      });
    }
  }, [event, isOpen]);

  const handleInputChange = (field: keyof EditEventFormData, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAgregarEtiqueta = () => {
    const etiqueta = etiquetaInput.trim();
    if (etiqueta && !formData.etiquetas?.includes(etiqueta)) {
      handleInputChange('etiquetas', [...(formData.etiquetas || []), etiqueta]);
      setEtiquetaInput('');
    }
  };

  const handleEliminarEtiqueta = (etiqueta: string) => {
    handleInputChange('etiquetas', (formData.etiquetas || []).filter(t => t !== etiqueta));
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof EditEventFormData, string>> = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es requerido';
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }

    if (!formData.fecha_evento) {
      newErrors.fecha_evento = 'La fecha es requerida';
    }

    if (!formData.hora_evento) {
      newErrors.hora_evento = 'La hora es requerida';
    }

    if (!formData.ubicacion.trim()) {
      newErrors.ubicacion = 'La ubicación es requerida';
    }

    if (!formData.categoria.trim()) {
      newErrors.categoria = 'La categoría es requerida';
    }

    if (formData.maximo_asistentes < (event?.asistentes_actuales || 0)) {
      newErrors.maximo_asistentes = `No puede ser menor que los asistentes actuales (${event?.asistentes_actuales})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error al guardar cambios:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving && !isLoading) {
      setErrors({});
      onClose();
    }
  };

  if (!event) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      title="Editar Evento"
      description="Actualiza la información de tu evento"
      size="xl"
      showCloseButton={false}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 inline-block mr-2" />
            Título del Evento
          </label>
          <Input
            type="text"
            value={formData.titulo}
            onChange={(e) => handleInputChange('titulo', e.target.value)}
            placeholder="Ej: Conferencia de Tecnología 2025"
            disabled={isLoading || isSaving}
            error={errors.titulo}
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción
          </label>
          <textarea
            value={formData.descripcion}
            onChange={(e) => handleInputChange('descripcion', e.target.value)}
            placeholder="Describe tu evento..."
            rows={4}
            disabled={isLoading || isSaving}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
              errors.descripcion ? 'border-red-300' : 'border-gray-300'
            } disabled:bg-gray-100 disabled:cursor-not-allowed`}
          />
          {errors.descripcion && (
            <p className="text-sm text-red-600 mt-1">{errors.descripcion}</p>
          )}
        </div>

        {/* Fecha y Hora */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline-block mr-2" />
              Fecha
            </label>
            <Input
              type="date"
              value={formData.fecha_evento}
              onChange={(e) => handleInputChange('fecha_evento', e.target.value)}
              disabled={isLoading || isSaving}
              error={errors.fecha_evento}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline-block mr-2" />
              Hora
            </label>
            <Input
              type="time"
              value={formData.hora_evento}
              onChange={(e) => handleInputChange('hora_evento', e.target.value)}
              disabled={isLoading || isSaving}
              error={errors.hora_evento}
            />
          </div>
        </div>

        {/* Ubicación y Categoría */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline-block mr-2" />
              Ubicación
            </label>
            <Input
              type="text"
              value={formData.ubicacion}
              onChange={(e) => handleInputChange('ubicacion', e.target.value)}
              placeholder="Ej: Bogotá, Colombia"
              disabled={isLoading || isSaving}
              error={errors.ubicacion}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4 inline-block mr-2" />
              Categoría
            </label>
            <select
              value={formData.categoria}
              onChange={(e) => handleInputChange('categoria', e.target.value)}
              disabled={isLoading || isSaving}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                errors.categoria ? 'border-red-300' : 'border-gray-300'
              } disabled:bg-gray-100 disabled:cursor-not-allowed`}
            >
              <option value="">Selecciona una categoría</option>
              <option value="Conferencia">Conferencia</option>
              <option value="Taller">Taller</option>
              <option value="Concierto">Concierto</option>
              <option value="Festival">Festival</option>
              <option value="Deportivo">Deportivo</option>
              <option value="Cultural">Cultural</option>
              <option value="Networking">Networking</option>
              <option value="Otro">Otro</option>
            </select>
            {errors.categoria && (
              <p className="text-sm text-red-600 mt-1">{errors.categoria}</p>
            )}
          </div>
        </div>

        {/* Capacidad Máxima */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users className="w-4 h-4 inline-block mr-2" />
            Capacidad Máxima
          </label>
          <Input
            type="number"
            value={formData.maximo_asistentes}
            onChange={(e) => handleInputChange('maximo_asistentes', parseInt(e.target.value) || 0)}
            placeholder="Ej: 500"
            min={event.asistentes_actuales}
            disabled={isLoading || isSaving}
            error={errors.maximo_asistentes}
          />
          <p className="text-xs text-gray-500 mt-1">
            Asistentes actuales: {event.asistentes_actuales}. No puedes reducir la capacidad por debajo de este número.
          </p>
        </div>

        {/* Etiquetas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Etiquetas
          </label>
          <div className="flex items-center space-x-2 mb-3">
            <Input
              type="text"
              value={etiquetaInput}
              onChange={(e) => setEtiquetaInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAgregarEtiqueta();
                }
              }}
              placeholder="Agregar etiqueta..."
              disabled={isLoading || isSaving}
            />
            <button
              type="button"
              onClick={handleAgregarEtiqueta}
              disabled={!etiquetaInput.trim() || isLoading || isSaving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Agregar
            </button>
          </div>
          {formData.etiquetas && formData.etiquetas.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.etiquetas.map((etiqueta, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-200"
                >
                  {etiqueta}
                  <button
                    type="button"
                    onClick={() => handleEliminarEtiqueta(etiqueta)}
                    disabled={isLoading || isSaving}
                    className="ml-2 text-blue-600 hover:text-blue-800 disabled:opacity-50"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading || isSaving}
            className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading || isSaving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {(isLoading || isSaving) ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
