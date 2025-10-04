import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Calendar, MapPin, Clock, Users, DollarSign, Upload, Plus, Minus, X, Palette, Copy, ArrowLeft, Save, Eye } from 'lucide-react';
import { useEventStore } from '../../../core/stores/eventStore';
import { useAuthStore } from '../../../core/stores/authStore';
import { useNotificationStore } from '../../../core/stores/notificationStore';
import { useNavigate } from 'react-router-dom';
import { formatPriceDisplay } from '../../../../shared/utils/currency';
import { ImageUpload } from '../components/ImageUpload';
import { EventCustomization, EventCustomizationData } from '../components/EventCustomization';
import { ServicioEventos, ServicioTiposEntrada } from '../../../../core/services/supabaseServiceEspanol';

interface TicketTypeForm {
  name: string;
  price: number;
  description: string;
  maxQuantity: number;
}

interface EventFormData {
  title: string;
  description: string;
  image: string;
  date: string;
  time: string;
  location: string;
  category: string;
  maxAttendees: number;
  ticketTypes: TicketTypeForm[];
  tags: string;
  customization?: EventCustomizationData;
}

const eventSchema = yup.object({
  title: yup.string().required('El título es obligatorio').min(5, 'Mínimo 5 caracteres'),
  description: yup.string().required('La descripción es obligatoria').min(20, 'Mínimo 20 caracteres'),
  image: yup.string().required('La imagen es obligatoria').url('Debe ser una URL válida'),
  date: yup.string().required('La fecha es obligatoria'),
  time: yup.string().required('La hora es obligatoria'),
  location: yup.string().required('La ubicación es obligatoria'),
  category: yup.string().required('La categoría es obligatoria'),
  maxAttendees: yup.number().required('El aforo es obligatorio').min(1, 'Mínimo 1 asistente'),
  ticketTypes: yup.array().min(1, 'Debe crear al menos un tipo de entrada'),
  tags: yup.string()
});

export function CreateEventPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addEvent } = useEventStore();
  const { addNotification } = useNotificationStore();
  const [ticketTypes, setTicketTypes] = useState<TicketTypeForm[]>([
    { name: 'General', price: 0, description: 'Entrada general', maxQuantity: 10 }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState<'basic' | 'tickets' | 'customization'>('basic');
  const [customization, setCustomization] = useState<EventCustomizationData>({
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    fontFamily: 'Inter, sans-serif',
    layout: 'modern',
    showSocialLinks: true,
    customCSS: ''
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<EventFormData>({
    resolver: yupResolver(eventSchema),
    defaultValues: {
      ticketTypes: ticketTypes
    }
  });

  const categories = [
    'Agropecuario', 'Cultura', 'Deportes', 'Educación', 'Gastronomía', 'Religioso', 'Otros'
  ];

  const addTicketType = () => {
    const newTicketType: TicketTypeForm = {
      name: '',
      price: 0,
      description: '',
      maxQuantity: 10
    };
    setTicketTypes([...ticketTypes, newTicketType]);
  };

  const removeTicketType = (index: number) => {
    if (ticketTypes.length > 1) {
      const updated = ticketTypes.filter((_, i) => i !== index);
      setTicketTypes(updated);
    }
  };

  const updateTicketType = (index: number, field: keyof TicketTypeForm, value: string | number) => {
    const updated = ticketTypes.map((ticket, i) => 
      i === index ? { ...ticket, [field]: value } : ticket
    );
    setTicketTypes(updated);
  };

  const onSubmit = async (data: EventFormData) => {
    setIsSubmitting(true);
    
    try {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Create event in database
      const eventData = {
        titulo: data.title,
        descripcion: data.description,
        url_imagen: data.image,
        fecha_evento: data.date,
        hora_evento: data.time,
        ubicacion: data.location,
        categoria: data.category,
        maximo_asistentes: data.maxAttendees,
        asistentes_actuales: 0,
        id_organizador: user.id,
        nombre_organizador: user.name,
        estado: 'proximo' as const,
        etiquetas: data.tags ? data.tags.split(',').map(tag => tag.trim()) : []
      };

      const createdEvent = await ServicioEventos.crearEvento(eventData);

      // Create ticket types
      for (const ticketType of ticketTypes) {
        await ServicioTiposEntrada.crearTipoEntrada({
          id_evento: createdEvent.id,
          nombre_tipo: ticketType.name,
          precio: ticketType.price,
          descripcion: ticketType.description,
          cantidad_maxima: ticketType.maxQuantity,
          cantidad_disponible: ticketType.maxQuantity
        });
      }

      // Add to local store for immediate UI update
      const newEvent = {
        id: createdEvent.id,
        ...data,
        price: Math.min(...ticketTypes.map(t => t.price)),
        currentAttendees: 0,
        organizerId: user.id,
        organizerName: user.name,
        status: 'upcoming' as const,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
        ticketTypes: ticketTypes.map((ticket, index) => ({
          id: `ticket-${Date.now()}-${index}`,
          ...ticket,
          available: ticket.maxQuantity
        }))
      };

      addEvent(newEvent);
      
      // Show success notification
      addNotification({
        type: 'success',
        title: '¡Evento creado exitosamente!',
        message: `Tu evento "${data.title}" ha sido creado y está listo para recibir asistentes.`,
        duration: 6000
      });
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating event:', error);
      addNotification({
        type: 'error',
        title: 'Error al crear evento',
        message: 'Hubo un problema creando tu evento. Inténtalo de nuevo.',
        duration: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-4 mb-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Crear Nuevo Evento
                </h1>
                <p className="text-gray-600">
                  Completa la información de tu evento para comenzar a vender entradas
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <Save className="w-4 h-4 mr-2" />
              Guardar Borrador
            </button>
            <button className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Eye className="w-4 h-4 mr-2" />
              Vista Previa
            </button>
          </div>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-center space-x-8">
            {[
              { id: 'basic', label: 'Información Básica', icon: Calendar, description: 'Datos principales' },
              { id: 'tickets', label: 'Tipos de Entradas', icon: DollarSign, description: 'Precios y disponibilidad' },
              { id: 'customization', label: 'Personalización', icon: Palette, description: 'Diseño y branding' }
            ].map((step, index) => {
              const Icon = step.icon;
              const isActive = activeStep === step.id;
              const isCompleted = (step.id === 'basic' && activeStep !== 'basic') || 
                                 (step.id === 'tickets' && activeStep === 'customization');
              
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id as any)}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                      : isCompleted
                      ? 'bg-green-100 text-green-700 border-2 border-green-200'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-2 border-transparent'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isActive ? 'bg-blue-600 text-white' : 
                    isCompleted ? 'bg-green-600 text-white' : 
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {isCompleted ? (
                      <span className="text-sm font-bold">✓</span>
                    ) : (
                      <span className="text-sm font-bold">{index + 1}</span>
                    )}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{step.label}</div>
                    <div className="text-xs opacity-75">{step.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Información Básica</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título del Evento *
              </label>
              <input
                {...register('title')}
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Conferencia Tech Madrid 2024"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe tu evento, qué incluye, quién puede asistir..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría *
              </label>
              <select
                {...register('category')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecciona una categoría</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aforo Máximo *
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('maxAttendees', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="500"
                />
              </div>
              {errors.maxAttendees && (
                <p className="mt-1 text-sm text-red-600">{errors.maxAttendees.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Date and Time */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Fecha y Hora</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha del Evento *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('date')}
                  type="date"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora de Inicio *
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('time')}
                  type="time"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {errors.time && (
                <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Ubicación</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección del Evento *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                {...register('location')}
                type="text"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Palacio de Congresos, Madrid, España"
              />
            </div>
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
            )}
          </div>
        </div>

        {/* Image */}
        {activeStep === 'basic' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Imagen del Evento</h2>
            
            <ImageUpload
              value={watch('image')}
              onChange={(url) => setValue('image', url)}
              error={errors.image?.message}
            />
          </div>
        )}

        {/* Ticket Types */}
        {activeStep === 'tickets' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Tipos de Entradas</h2>
              <button
                type="button"
                onClick={addTicketType}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Añadir Tipo
              </button>
            </div>

          <div className="space-y-4">
            {ticketTypes.map((ticket, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-gray-900">Tipo de Entrada {index + 1}</h3>
                  {ticketTypes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTicketType(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Tipo
                    </label>
                    <input
                      value={ticket.name}
                      onChange={(e) => updateTicketType(index, 'name', e.target.value)}
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ej: Early Bird, VIP, General"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precio (COP)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        value={ticket.price}
                        onChange={(e) => updateTicketType(index, 'price', parseFloat(e.target.value) || 0)}
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <input
                      value={ticket.description}
                      onChange={(e) => updateTicketType(index, 'description', e.target.value)}
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Descripción del tipo de entrada"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cantidad Máxima
                    </label>
                    <input
                      value={ticket.maxQuantity}
                      onChange={(e) => updateTicketType(index, 'maxQuantity', parseInt(e.target.value) || 0)}
                      type="number"
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="10"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          </div>
        )}

        {/* Customization */}
        {activeStep === 'customization' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <EventCustomization
              onCustomizationChange={setCustomization}
              initialData={customization}
            />
          </div>
        )}

        {/* Tags - Always visible */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Etiquetas</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Etiquetas (opcional)
            </label>
            <input
              {...register('tags')}
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="tecnología, networking, conferencia (separadas por comas)"
            />
            <p className="mt-2 text-sm text-gray-500">
              Añade etiquetas separadas por comas para ayudar a los usuarios a encontrar tu evento
            </p>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
            >
              Cancelar
            </button>
            
            {activeStep !== 'basic' && (
              <button
                type="button"
                onClick={() => {
                  if (activeStep === 'tickets') setActiveStep('basic');
                  if (activeStep === 'customization') setActiveStep('tickets');
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                Anterior
              </button>
            )}
          </div>

          <div className="flex gap-4">
            {activeStep !== 'customization' && (
              <button
                type="button"
                onClick={() => {
                  if (activeStep === 'basic') setActiveStep('tickets');
                  if (activeStep === 'tickets') setActiveStep('customization');
                }}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium"
              >
                Siguiente
              </button>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creando Evento...' : 'Crear Evento'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
