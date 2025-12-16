import { create } from 'zustand';
import { ServicioEventos } from '@shared/lib/api/Supabase.service';

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
  id_evento: string;
  nombre_tipo: string;
  precio: number;
  descripcion: string;
  cantidad_maxima: number;
  cantidad_disponible: number;
  fecha_creacion: string;
}

interface EventState {
  events: Event[];
  filteredEvents: Event[];
  featuredEvents: Event[];
  recommendedEvents: Event[];
  categories: string[];
  searchQuery: string;
  selectedCategory: string;
  selectedLocation: string;
  priceRange: [number, number];
  dateRange: [string, string];
  loading: boolean;
  error: string | null;
  setEvents: (events: Event[]) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedLocation: (location: string) => void;
  setPriceRange: (range: [number, number]) => void;
  setDateRange: (range: [string, string]) => void;
  clearFilters: () => void;
  filterEvents: () => void;
  getEventById: (id: string) => Event | undefined;
  loadEvents: () => Promise<void>;
  loadFeaturedEvents: () => Promise<void>;
  loadRecommendedEvents: (userId: string, userLocation?: string) => Promise<void>;
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
        id_evento: '1',
        nombre_tipo: 'Early Bird',
        precio: 69000,
        descripcion: 'Entrada con descuento por reserva anticipada',
        cantidad_maxima: 5,
        cantidad_disponible: 0,
        fecha_creacion: new Date().toISOString()
      },
      {
        id: '2',
        id_evento: '1',
        nombre_tipo: 'General',
        precio: 89000,
        descripcion: 'Entrada general con acceso completo',
        cantidad_maxima: 10,
        cantidad_disponible: 158,
        fecha_creacion: new Date().toISOString()
      },
      {
        id: '3',
        id_evento: '1',
        nombre_tipo: 'VIP',
        precio: 149000,
        descripcion: 'Acceso VIP con networking exclusivo',
        cantidad_maxima: 3,
        cantidad_disponible: 12,
        fecha_creacion: new Date().toISOString()
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
        id_evento: '2',
        nombre_tipo: 'General',
        precio: 45000,
        descripcion: 'Entrada general',
        cantidad_maxima: 1000,
        cantidad_disponible: 244,
        fecha_creacion: new Date().toISOString()
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
        id_evento: '3',
        nombre_tipo: 'Estudiante',
        precio: 25000,
        descripcion: 'Descuento para estudiantes',
        cantidad_maxima: 20,
        cantidad_disponible: 8,
        fecha_creacion: new Date().toISOString()
      },
      {
        id: '6',
        id_evento: '3',
        nombre_tipo: 'General',
        precio: 35000,
        descripcion: 'Entrada general',
        cantidad_maxima: 30,
        cantidad_disponible: 10,
        fecha_creacion: new Date().toISOString()
      }
    ]
  }
];

// Función para convertir eventos de Supabase al formato de la aplicación
const convertSupabaseEventToEvent = (supabaseEvent: any): Event => {
  // Buscar la entrada general para usar como precio por defecto
  const tiposEntrada = supabaseEvent.tipos_entrada || [];
  console.log(`Convirtiendo evento ${supabaseEvent.titulo}, tipos_entrada:`, tiposEntrada);
  
  // Buscar la entrada general (por defecto)
  const entradaGeneral = tiposEntrada.find((tipo: any) => 
    tipo.nombre_tipo.toLowerCase().includes('general') || 
    tipo.nombre_tipo.toLowerCase().includes('entrada general') ||
    tipo.nombre_tipo.toLowerCase().includes('acceso general')
  );
  
  // Si no hay entrada general, usar la entrada más barata
  const entradaPorDefecto = entradaGeneral || tiposEntrada.reduce((min: any, tipo: any) => 
    (tipo.precio || 0) < (min.precio || 0) ? tipo : min, tiposEntrada[0]
  );
  
  const precioPorDefecto = entradaPorDefecto?.precio || 0;

  return {
    id: supabaseEvent.id,
    title: supabaseEvent.titulo,
    description: supabaseEvent.descripcion,
    image: supabaseEvent.url_imagen || '',
    date: supabaseEvent.fecha_evento,
    time: supabaseEvent.hora_evento,
    location: supabaseEvent.ubicacion,
    category: supabaseEvent.categoria,
    price: precioPorDefecto, // Usar el precio de la entrada general
    maxAttendees: supabaseEvent.maximo_asistentes || 100,
    currentAttendees: supabaseEvent.asistentes_reales ?? supabaseEvent.asistentes_actuales ?? 0,
    organizerId: supabaseEvent.id_organizador,
    organizerName: supabaseEvent.nombre_organizador || 'Organizador',
    status: supabaseEvent.estado || 'upcoming',
    tags: supabaseEvent.tags || [],
    ticketTypes: tiposEntrada
  };
};

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  filteredEvents: [],
  featuredEvents: [],
  recommendedEvents: [],
  categories: ['Todos', 'Agropecuario', 'Cultura', 'Deportes', 'Educación', 'Gastronomía'],
  searchQuery: '',
  selectedCategory: 'Todos',
  selectedLocation: '',
  priceRange: [0, 500000],
  dateRange: ['', ''],
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

  setDateRange: (range) => {
    set({ dateRange: range });
    get().filterEvents();
  },

  clearFilters: () => {
    set({ 
      searchQuery: '',
      selectedCategory: 'Todos',
      selectedLocation: '',
      priceRange: [0, 500000],
      dateRange: ['', '']
    });
    get().filterEvents();
  },

  filterEvents: async () => {
    const { searchQuery, selectedCategory, selectedLocation, priceRange, dateRange } = get();
    
    try {
      set({ loading: true, error: null });
      
      // Construir filtros para la consulta a Supabase
      const filtros: any = {};
      
      // Solo agregar filtros si tienen valores válidos
      if (searchQuery && searchQuery.trim()) {
        filtros.busqueda = searchQuery.trim();
      }
      
      if (selectedCategory && selectedCategory !== 'Todos') {
        filtros.categoria = selectedCategory;
      }
      
      if (selectedLocation && selectedLocation.trim()) {
        filtros.ubicacion = selectedLocation.trim();
      }
      
      // Filtros de precio - aplicar siempre
      // Si el usuario establece un rango, aplicarlo exactamente como lo especifica
      if (priceRange[0] !== undefined) {
        filtros.precioMinimo = priceRange[0];
      }
      if (priceRange[1] !== undefined) {
        filtros.precioMaximo = priceRange[1];
      }
      
      if (dateRange[0] && dateRange[0].trim()) {
        filtros.fechaDesde = dateRange[0];
        console.log('Filtro fecha desde:', dateRange[0]);
      }
      
      if (dateRange[1] && dateRange[1].trim()) {
        filtros.fechaHasta = dateRange[1];
        console.log('Filtro fecha hasta:', dateRange[1]);
      }
      
      // Debug: mostrar filtros aplicados
      console.log('Filtros aplicados:', filtros);
      console.log('Rango de precio actual:', priceRange);
      
    // Obtener eventos filtrados desde Supabase (sin filtros de precio)
    const filtrosSinPrecio = { ...filtros };
    delete filtrosSinPrecio.precioMinimo;
    delete filtrosSinPrecio.precioMaximo;
    
    console.log('Filtros enviados a Supabase:', filtrosSinPrecio);
    const supabaseEvents = await ServicioEventos.obtenerEventos(filtrosSinPrecio);
    console.log('Eventos obtenidos de Supabase:', supabaseEvents);
      
      if (supabaseEvents && supabaseEvents.length > 0) {
        console.log('Convirtiendo eventos...');
        const convertedEvents = supabaseEvents.map(convertSupabaseEventToEvent);
        console.log('Eventos convertidos:', convertedEvents);
        
        // Filtrar por precio en el frontend
        let eventosFiltrados = convertedEvents;
        
        if (filtros.precioMinimo !== undefined || filtros.precioMaximo !== undefined) {
          eventosFiltrados = convertedEvents.filter(evento => {
            // Verificar si el evento tiene tipos de entrada
            if (!evento.ticketTypes || evento.ticketTypes.length === 0) {
              return false; // Si no tiene tipos de entrada, no mostrar
            }
            
            // Buscar la entrada general (por defecto)
            const entradaGeneral = evento.ticketTypes.find(tipo => 
              tipo.nombre_tipo.toLowerCase().includes('general') || 
              tipo.nombre_tipo.toLowerCase().includes('entrada general') ||
              tipo.nombre_tipo.toLowerCase().includes('acceso general')
            );
            
            // Si no hay entrada general, usar la entrada más barata
            const entradaFiltro = entradaGeneral || evento.ticketTypes.reduce((min, tipo) => 
              (tipo.precio || 0) < (min.precio || 0) ? tipo : min
            );
            
            const precioEntradaFiltro = entradaFiltro?.precio || 0;
            
            console.log(`Evento: ${evento.title}, Entrada filtro: ${entradaFiltro?.nombre_tipo}, Precio: ${precioEntradaFiltro}`);
            console.log(`Filtros aplicados - Min: ${filtros.precioMinimo}, Max: ${filtros.precioMaximo}`);
            
            // Caso especial: Solo Gratis (rango [0, 0])
            if (filtros.precioMinimo === 0 && filtros.precioMaximo === 0) {
              const esGratis = precioEntradaFiltro === 0;
              console.log(`Solo Gratis - Es gratis: ${esGratis}`);
              return esGratis;
            }
            
            let cumpleFiltro = true;
            
            // Filtro de precio mínimo: la entrada general debe tener precio >= precioMinimo
            if (filtros.precioMinimo !== undefined) {
              cumpleFiltro = cumpleFiltro && precioEntradaFiltro >= filtros.precioMinimo;
            }
            
            // Filtro de precio máximo: la entrada general debe tener precio <= precioMaximo
            if (filtros.precioMaximo !== undefined) {
              cumpleFiltro = cumpleFiltro && precioEntradaFiltro <= filtros.precioMaximo;
            }
            
            console.log(`Cumple filtro: ${cumpleFiltro}`);
            return cumpleFiltro;
          });
        }
        
        set({ filteredEvents: eventosFiltrados });
      } else {
        // Si no hay resultados, mostrar array vacío
        set({ filteredEvents: [] });
      }
    } catch (error) {
      console.error('Error filtering events:', error);
      set({ error: 'Error al filtrar eventos' });
      // En caso de error, mostrar eventos sin filtrar
      const { events } = get();
      set({ filteredEvents: events });
    } finally {
      set({ loading: false });
    }
  },

  getEventById: (id) => {
    return get().events.find(event => event.id === id);
  },

  loadEvents: async () => {
    try {
      set({ loading: true, error: null });
      
      // Cargar eventos, categorías y ubicaciones en paralelo
      const [supabaseEvents, categoriasDB, ubicacionesDB] = await Promise.all([
        ServicioEventos.obtenerEventos(),
        ServicioEventos.obtenerCategorias().catch(() => []),
        ServicioEventos.obtenerUbicaciones().catch(() => [])
      ]);
      
      if (supabaseEvents && supabaseEvents.length > 0) {
        const convertedEvents = supabaseEvents.map(convertSupabaseEventToEvent);
        set({ 
          events: convertedEvents, 
          filteredEvents: convertedEvents,
          categories: ['Todos', ...categoriasDB]
        });
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
      
      // Obtener los 3 eventos con mayor actividad reciente
      const eventosDestacados = await ServicioEventos.obtenerEventosDestacados(3);
      
      if (eventosDestacados && eventosDestacados.length > 0) {
        const convertedEvents = eventosDestacados.map(convertSupabaseEventToEvent);
        set({ featuredEvents: convertedEvents });
      } else {
        // Fallback a eventos normales si no hay actividad
        const supabaseEvents = await ServicioEventos.obtenerEventos();
        if (supabaseEvents && supabaseEvents.length > 0) {
          const convertedEvents = supabaseEvents.map(convertSupabaseEventToEvent);
          set({ featuredEvents: convertedEvents.slice(0, 3) });
        } else {
          // Fallback final a eventos mock
          set({ featuredEvents: mockEvents.slice(0, 3) });
        }
      }
    } catch (error) {
      console.error('Error loading featured events:', error);
      set({ error: 'Error al cargar eventos destacados', featuredEvents: mockEvents.slice(0, 3) });
    } finally {
      set({ loading: false });
    }
  },

  loadRecommendedEvents: async (userId: string, userLocation?: string) => {
    try {
      set({ loading: true, error: null });
      
      // Importar el servicio de recomendaciones dinámicamente
      const { RecommendationService } = await import('@shared/lib/api/services/Recommendation.service');
      
      // Obtener ubicación del usuario si no se proporciona
      let location = userLocation;
      if (!location) {
        location = await RecommendationService.getUserLocation(userId) || undefined;
      }
      
      // Obtener eventos recomendados
      const recommendedEvents = await RecommendationService.getRecommendedEvents(userId, location);
      
      if (recommendedEvents && recommendedEvents.length > 0) {
        const convertedEvents = recommendedEvents.map(convertSupabaseEventToEvent);
        set({ recommendedEvents: convertedEvents });
      } else {
        // Si no hay recomendaciones personalizadas, dejar array vacío
        // El componente puede decidir mostrar todos los eventos si lo necesita
        set({ recommendedEvents: [] });
      }
    } catch (error) {
      console.error('Error loading recommended events:', error);
      set({ error: 'Error al cargar eventos recomendados', recommendedEvents: [] });
    } finally {
      set({ loading: false });
    }
  }
}));