import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useEventStore } from '../../../events/infrastructure/store/Event.store';
import { useAuthStore } from '../../../authentication/infrastructure/store/Auth.store';
import { useNotificationStore } from '../../../notifications/infrastructure/store/Notification.store';
import { useNavigate } from 'react-router-dom';
import { CreateEventForm } from '../components/create-event/CreateEventForm.component';
import { ServicioEventos, ServicioTiposEntrada } from '@shared/lib/api/Supabase.service';

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
  customization?: any;
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
  const [customization, setCustomization] = useState({
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    fontFamily: 'Inter, sans-serif',
    layout: 'modern',
    showSocialLinks: true,
    customCSS: ''
  });
  const [showPreview, setShowPreview] = useState(false);

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
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Crear el evento
      const eventData = {
        titulo: data.title,
        descripcion: data.description,
        url_imagen: data.image,
        fecha_evento: data.date,
        hora_evento: data.time,
        ubicacion: data.location,
        categoria: data.category,
        aforo_maximo: data.maxAttendees,
        id_organizador: user.id,
        estado: 'proximo',
        tags: data.tags,
        personalizacion: customization
      };

      const createdEvent = await ServicioEventos.crearEvento(eventData);

      // Crear tipos de entrada
      for (const ticketType of ticketTypes) {
        await ServicioTiposEntrada.crearTipoEntrada({
          id_evento: createdEvent.id,
          nombre_tipo: ticketType.name,
          precio: ticketType.price,
          descripcion: ticketType.description,
          cantidad_maxima: ticketType.maxQuantity
        });
      }

      // Agregar al store local
      addEvent(createdEvent);

      // Notificación de éxito
      addNotification({
        id: Date.now().toString(),
        titulo: 'Evento Creado',
        mensaje: 'Tu evento ha sido creado exitosamente',
        tipo: 'success',
        fecha_creacion: new Date().toISOString(),
        leida: false
      });

      // Navegar al evento creado
      navigate(`/events/${createdEvent.id}`);
    } catch (error) {
      console.error('Error creating event:', error);
      addNotification({
        id: Date.now().toString(),
        titulo: 'Error',
        mensaje: 'No se pudo crear el evento. Inténtalo de nuevo.',
        tipo: 'error',
        fecha_creacion: new Date().toISOString(),
        leida: false
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/organizer/dashboard');
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Evento</h1>
          <p className="text-gray-600 mt-2">Completa la información para crear tu evento</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CreateEventForm
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            ticketTypes={ticketTypes}
            setTicketTypes={setTicketTypes}
            customization={customization}
            setCustomization={setCustomization}
            isSubmitting={isSubmitting}
            showPreview={showPreview}
            setShowPreview={setShowPreview}
            register={register}
            errors={errors}
            watch={watch}
            categories={categories}
            addTicketType={addTicketType}
            removeTicketType={removeTicketType}
            updateTicketType={updateTicketType}
            onBack={handleBack}
            onSubmit={handleSubmit(onSubmit)}
            onPreview={handlePreview}
          />
        </form>
      </div>
    </div>
  );
}