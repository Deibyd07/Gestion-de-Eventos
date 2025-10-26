import React, { useState } from 'react';
import { Modal, ModalFooter } from '@shared/ui';
import { Input } from '@shared/ui';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  DollarSign, 
  Image as ImageIcon, 
  FileText,
  X,
  Upload,
  Check
} from 'lucide-react';

export interface CreateEventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  city: string;
  country: string;
  maxAttendees: number;
  ticketPrice: number;
  image: File | null;
}

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: CreateEventFormData) => void;
  isLoading?: boolean;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<CreateEventFormData>({
    title: '',
    description: '',
    date: '',
    time: '',
    city: '',
    country: '',
    maxAttendees: 0,
    ticketPrice: 0,
    image: null
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateEventFormData, string>>>({});
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleInputChange = (field: keyof CreateEventFormData, value: string | number | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleImageChange = (file: File | null) => {
    handleInputChange('image', file);
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        handleImageChange(file);
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateEventFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (!formData.date) {
      newErrors.date = 'La fecha es requerida';
    } else {
      const eventDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (eventDate < today) {
        newErrors.date = 'La fecha no puede ser en el pasado';
      }
    }

    if (!formData.time) {
      newErrors.time = 'La hora es requerida';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'La ciudad es requerida';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'El país es requerido';
    }

    if (!formData.maxAttendees || formData.maxAttendees <= 0) {
      newErrors.maxAttendees = 'Debe especificar un número válido de asistentes';
    }

    if (!formData.ticketPrice || formData.ticketPrice < 0) {
      newErrors.ticketPrice = 'El precio debe ser mayor o igual a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleReset = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      city: '',
      country: '',
      maxAttendees: 0,
      ticketPrice: 0,
      image: null
    });
    setErrors({});
    setImagePreview(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Crear Nuevo Evento"
      description="Completa la información para crear tu evento"
      size="xl"
      closeOnOverlayClick={!isLoading}
      closeOnEscape={!isLoading}
      showCloseButton={!isLoading}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Básica del Evento */}
        <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 backdrop-blur-sm border border-blue-200/50 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Información Básica</span>
          </h3>
          
          <Input
            label="Título del Evento"
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            error={errors.title}
            placeholder="Ej: Conferencia de Tecnología 2024"
            leftIcon={<FileText className="w-4 h-4" />}
            disabled={isLoading}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción del Evento
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe tu evento, incluye detalles importantes que los asistentes deben conocer..."
              className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none min-h-[120px] ${
                errors.description ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
              } ${isLoading ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white'}`}
              disabled={isLoading}
              required
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>
        </div>

        {/* Fecha y Hora */}
        <div className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 backdrop-blur-sm border border-green-200/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-green-600" />
            <span>Fecha y Hora</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Fecha del Evento"
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            error={errors.date}
            leftIcon={<Calendar className="w-4 h-4" />}
            disabled={isLoading}
            required
          />

          <Input
            label="Hora del Evento"
            type="time"
            value={formData.time}
            onChange={(e) => handleInputChange('time', e.target.value)}
            error={errors.time}
            leftIcon={<Clock className="w-4 h-4" />}
            disabled={isLoading}
            required
          />
          </div>
        </div>

        {/* Ubicación */}
        <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 backdrop-blur-sm border border-purple-200/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-purple-600" />
            <span>Ubicación del Evento</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Ciudad"
            type="text"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            error={errors.city}
            placeholder="Ej: Bogotá"
            leftIcon={<MapPin className="w-4 h-4" />}
            disabled={isLoading}
            required
          />

          <Input
            label="País"
            type="text"
            value={formData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            error={errors.country}
            placeholder="Ej: Colombia"
            leftIcon={<MapPin className="w-4 h-4" />}
            disabled={isLoading}
            required
          />
          </div>
        </div>

        {/* Capacidad y Precio */}
        <div className="bg-gradient-to-br from-orange-50/50 to-amber-50/50 backdrop-blur-sm border border-orange-200/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Users className="w-5 h-5 text-orange-600" />
            <span>Capacidad y Precio</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Capacidad Máxima"
            type="number"
            min="1"
            value={formData.maxAttendees || ''}
            onChange={(e) => handleInputChange('maxAttendees', parseInt(e.target.value) || 0)}
            error={errors.maxAttendees}
            placeholder="Ej: 200"
            leftIcon={<Users className="w-4 h-4" />}
            disabled={isLoading}
            required
          />

          <Input
            label="Precio de Entrada (COP)"
            type="number"
            min="0"
            step="1000"
            value={formData.ticketPrice || ''}
            onChange={(e) => handleInputChange('ticketPrice', parseInt(e.target.value) || 0)}
            error={errors.ticketPrice}
            placeholder="Ej: 50000"
            leftIcon={<DollarSign className="w-4 h-4" />}
            disabled={isLoading}
            helperText="Ingrese 0 para eventos gratuitos"
            required
          />
          </div>
        </div>

        {/* Upload de Imagen */}
        <div className="bg-gradient-to-br from-indigo-50/50 to-blue-50/50 backdrop-blur-sm border border-indigo-200/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <ImageIcon className="w-5 h-5 text-indigo-600" />
            <span>Imagen del Evento</span>
          </h3>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imagen del Evento
          </label>
          
          <div
            className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : imagePreview 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-300 bg-gray-50'
            } ${isLoading ? 'opacity-60 cursor-not-allowed' : 'hover:border-blue-400 hover:bg-blue-50/50'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleImageChange(null)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                  disabled={isLoading}
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full flex items-center space-x-1">
                  <Check className="w-3 h-3" />
                  <span>Imagen cargada</span>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className={`mx-auto w-12 h-12 ${dragActive ? 'text-blue-500' : 'text-gray-400'} mb-4`}>
                  <ImageIcon className="w-full h-full" />
                </div>
                <div className="space-y-2">
                  <p className={`text-sm ${dragActive ? 'text-blue-600' : 'text-gray-600'}`}>
                    {dragActive ? '¡Suelta la imagen aquí!' : 'Arrastra una imagen aquí, o'}
                  </p>
                  <label className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Seleccionar archivo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
                      className="hidden"
                      disabled={isLoading}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Formatos: JPG, PNG, GIF (máx. 10MB)
                </p>
              </div>
            )}
          </div>
        </div>
      </form>

      <ModalFooter>
        <button
          type="button"
          onClick={handleClose}
          disabled={isLoading}
          className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
        
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={isLoading}
          className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Creando...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>Crear Evento</span>
            </>
          )}
        </button>
      </ModalFooter>
    </Modal>
  );
};