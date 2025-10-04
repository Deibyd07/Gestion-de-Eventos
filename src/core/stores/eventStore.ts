import { create } from 'zustand';
import { ServicioEventos } from '../services/supabaseServiceEspanol';

export interface Event {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  time: string;
  location: string;
  category: string;
  price: number;
  maxAttendees: number;
  currentAttendees: number;
  organizerId: string;
  organizerName: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  tags: string[];
  ticketTypes: TicketType[];
}

export interface TicketType {
  id: string;
  name: string;
  price: number;
  description: string;
  maxQuantity: number;
  available: number;
}

interface EventState {
  events: Event[];
  filteredEvents: Event[];
  featuredEvents: Event[];
  categories: string[];
  searchQuery: string;
  selectedCategory: string;
  selectedLocation: string;
  priceRange: [number, number];
  loading: boolean;
  error: string | null;
  setEvents: (events: Event[]) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedLocation: (location: string) => void;
  setPriceRange: (range: [number, number]) => void;
  filterEvents: () => void;
  getEventById: (id: string) => Event | undefined;
  loadEvents: () => Promise<void>;
  loadFeaturedEvents: () => Promise<void>;
}

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Conferencia Tech Madrid 2024',
    description: 'La mayor conferencia de tecnología de España. Descubre las últimas tendencias en IA, blockchain y desarrollo web.',
    image: 'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=800',
    date: '2024-03-15',
    time: '09:00',
    location: 'Madrid, España',
    category: 'Tecnología',
    price: 89000,
    maxAttendees: 500,
    currentAttendees: 342,
    organizerId: '1',
    organizerName: 'TechEvents Spain',
    status: 'upcoming',
    tags: ['tecnología', 'conferencia', 'networking'],
    ticketTypes: [
      {
        id: '1',
        name: 'Early Bird',
        price: 69000,
        description: 'Entrada con descuento por reserva anticipada',
        maxQuantity: 5,
        available: 0
      },
      {
        id: '2',
        name: 'General',
        price: 89000,
        description: 'Entrada general con acceso completo',
        maxQuantity: 10,
        available: 158
      },
      {
        id: '3',
        name: 'VIP',
        price: 149000,
        description: 'Acceso VIP con networking exclusivo',
        maxQuantity: 3,
        available: 12
      }
    ]
  },
  {
    id: '2',
    title: 'Festival de Música Electrónica',
    description: 'Una noche inolvidable con los mejores DJs internacionales. Música, luces y energía en estado puro.',
    image: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=800',
    date: '2024-04-20',
    time: '22:00',
    location: 'Barcelona, España',
    category: 'Música',
    price: 45000,
    maxAttendees: 1000,
    currentAttendees: 756,
    organizerId: '2',
    organizerName: 'Electronic Nights',
    status: 'upcoming',
    tags: ['música', 'electrónica', 'festival', 'dj'],
    ticketTypes: [
      {
        id: '4',
        name: 'General',
        price: 45000,
        description: 'Entrada general',
        maxQuantity: 8,
        available: 244
      }
    ]
  },
  {
    id: '3',
    title: 'Masterclass de Fotografía Digital',
    description: 'Aprende técnicas profesionales de fotografía digital con reconocidos fotógrafos nacionales e internacionales.',
    image: 'https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg?auto=compress&cs=tinysrgb&w=800',
    date: '2024-03-25',
    time: '16:00',
    location: 'Valencia, España',
    category: 'Educación',
    price: 35000,
    maxAttendees: 50,
    currentAttendees: 32,
    organizerId: '3',
    organizerName: 'Photo Academy',
    status: 'upcoming',
    tags: ['fotografía', 'educación', 'masterclass'],
    ticketTypes: [
      {
        id: '5',
        name: 'Estudiante',
        price: 25000,
        description: 'Descuento para estudiantes',
        maxQuantity: 3,
        available: 8
      },
      {
        id: '6',
        name: 'General',
        price: 35000,
        description: 'Entrada general',
        maxQuantity: 5,
        available: 10
      }
    ]
  }
];

// Función para convertir eventos de Supabase al formato de la aplicación
const convertSupabaseEventToEvent = (supabaseEvent: any): Event => {
  return {
    id: supabaseEvent.id,
    title: supabaseEvent.titulo,
    description: supabaseEvent.descripcion,
    image: supabaseEvent.imagen || 'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=800',
    date: supabaseEvent.fecha_evento,
    time: supabaseEvent.hora_evento,
    location: supabaseEvent.ubicacion,
    category: supabaseEvent.categoria,
    price: supabaseEvent.precio || 0,
    maxAttendees: supabaseEvent.capacidad_maxima || 100,
    currentAttendees: supabaseEvent.asistentes_actuales || 0,
    organizerId: supabaseEvent.organizador_id,
    organizerName: supabaseEvent.nombre_organizador || 'Organizador',
    status: supabaseEvent.estado || 'upcoming',
    tags: supabaseEvent.tags || [],
    ticketTypes: supabaseEvent.tipos_boletas || []
  };
};

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  filteredEvents: [],
  featuredEvents: [],
  categories: ['Todos', 'Agropecuario', 'Cultura', 'Deportes', 'Educación', 'Gastronomía'],
  searchQuery: '',
  selectedCategory: 'Todos',
  selectedLocation: '',
  priceRange: [0, 500000],
  loading: false,
  error: null,

  setEvents: (events) => set({ events }),
  
  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().filterEvents();
  },

  setSelectedCategory: (category) => {
    set({ selectedCategory: category });
    get().filterEvents();
  },

  setSelectedLocation: (location) => {
    set({ selectedLocation: location });
    get().filterEvents();
  },

  setPriceRange: (range) => {
    set({ priceRange: range });
    get().filterEvents();
  },

  filterEvents: () => {
    const { events, searchQuery, selectedCategory, selectedLocation, priceRange } = get();
    
    let filtered = events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'Todos' || event.category === selectedCategory;
      
      const matchesLocation = selectedLocation === '' || 
                             event.location.toLowerCase().includes(selectedLocation.toLowerCase());
      
      const matchesPrice = event.price >= priceRange[0] && event.price <= priceRange[1];
      
      return matchesSearch && matchesCategory && matchesLocation && matchesPrice;
    });
    
    set({ filteredEvents: filtered });
  },

  getEventById: (id) => {
    return get().events.find(event => event.id === id);
  },

  loadEvents: async () => {
    try {
      set({ loading: true, error: null });
      const supabaseEvents = await ServicioEventos.obtenerEventos();
      
      if (supabaseEvents && supabaseEvents.length > 0) {
        const convertedEvents = supabaseEvents.map(convertSupabaseEventToEvent);
        set({ events: convertedEvents, filteredEvents: convertedEvents });
      } else {
        // Fallback a eventos mock si no hay datos en Supabase
        set({ events: mockEvents, filteredEvents: mockEvents });
      }
    } catch (error) {
      console.error('Error loading events:', error);
      set({ error: 'Error al cargar eventos', events: mockEvents, filteredEvents: mockEvents });
    } finally {
      set({ loading: false });
    }
  },

  loadFeaturedEvents: async () => {
    try {
      set({ loading: true, error: null });
      const supabaseEvents = await ServicioEventos.obtenerEventos();
      
      if (supabaseEvents && supabaseEvents.length > 0) {
        const convertedEvents = supabaseEvents.map(convertSupabaseEventToEvent);
        // Tomar los primeros 3 eventos como destacados
        const featured = convertedEvents.slice(0, 3);
        set({ featuredEvents: featured });
      } else {
        // Fallback a eventos mock
        set({ featuredEvents: mockEvents.slice(0, 3) });
      }
    } catch (error) {
      console.error('Error loading featured events:', error);
      set({ error: 'Error al cargar eventos destacados', featuredEvents: mockEvents.slice(0, 3) });
    } finally {
      set({ loading: false });
    }
  }
}));