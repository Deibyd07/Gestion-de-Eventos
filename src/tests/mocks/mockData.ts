import { vi } from 'vitest';

// Mock Supabase client
export const mockSupabaseClient = {
  auth: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    signInWithOAuth: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  })),
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn(),
      getPublicUrl: vi.fn(),
      remove: vi.fn(),
    })),
  },
};

// Mock user data
export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'attendee' as const,
  avatar: null,
};

export const mockOrganizer = {
  id: 'org-123',
  email: 'organizer@example.com',
  name: 'Test Organizer',
  role: 'organizer' as const,
  avatar: null,
};

export const mockAdmin = {
  id: 'admin-123',
  email: 'admin@example.com',
  name: 'Test Admin',
  role: 'admin' as const,
  avatar: null,
};

// Mock event data
export const mockEvent = {
  id: 'event-123',
  title: 'Test Event',
  description: 'Test Description',
  date: '2025-12-20',
  time: '19:00',
  location: 'Test Location',
  category: 'music',
  image: 'https://example.com/image.jpg',
  price: 50000,
  maxAttendees: 100,
  currentAttendees: 25,
  organizerId: 'org-123',
  organizerName: 'Test Organizer',
  status: 'upcoming' as const,
  tags: ['music', 'concert'],
  ticketTypes: [
    {
      id: 'ticket-1',
      name: 'General',
      description: 'General admission',
      price: 50000,
      available: 50,
      sold: 10,
      type: 'general' as const,
      isActive: true,
      features: ['Access to main area'],
      eventId: 'event-123',
    },
    {
      id: 'ticket-2',
      name: 'VIP',
      description: 'VIP access',
      price: 100000,
      available: 20,
      sold: 5,
      type: 'vip' as const,
      isActive: true,
      features: ['Premium seating', 'Meet & greet'],
      eventId: 'event-123',
    },
  ],
};

// Mock promotion data
export const mockPromotion = {
  id: 'promo-123',
  code: 'DESCUENTO20',
  name: 'Descuento 20%',
  description: 'Descuento del 20% en todas las entradas',
  type: 'percentage' as const,
  value: 20,
  usageLimit: 100,
  usedCount: 15,
  isActive: true,
  startDate: '2025-12-01',
  endDate: '2025-12-31',
  applicableEvents: ['event-123'],
  applicableTicketTypes: ['ticket-1', 'ticket-2'],
  isPublic: true,
  createdDate: '2025-12-01',
};

// Mock payment method data
export const mockPaymentMethod = {
  id: 'payment-123',
  nombre: 'Tarjeta de Crédito',
  tipo: 'card' as const,
  proveedor: 'Visa',
  descripcion: 'Pago con tarjeta de crédito',
  activo: true,
  comision_porcentaje: 3.5,
  comision_fija: 2000,
  monto_minimo: 10000,
  monto_maximo: 5000000,
  monedas_soportadas: ['COP'],
  requiere_verificacion: true,
  tiempo_procesamiento: '24 horas',
  configuracion: {
    apiKey: 'test-key',
    merchantId: 'test-merchant',
  },
};

// Mock attendee data
export const mockAttendee = {
  id: 'attendee-123',
  userId: 'user-123',
  name: 'Test User',
  email: 'test@example.com',
  phone: '+57 300 1234567',
  avatar: null,
  userRole: 'attendee',
  eventId: 'event-123',
  eventTitle: 'Test Event',
  ticketType: 'General',
  ticketPrice: 50000,
  purchaseDate: '2025-12-10T10:00:00Z',
  purchaseOrderNumber: 'ORD-123',
  purchaseQuantity: 2,
  purchaseTotalPaid: 100000,
  checkInStatus: 'pending' as const,
  qrCode: 'QR-123-456',
  purchaseId: 'purchase-123',
};

// Mock analytics data
export const mockAnalytics = {
  totalEvents: 15,
  activeEvents: 8,
  totalRevenue: 15000000,
  totalAttendees: 350,
  conversionRate: 12.5,
  avgTicketPrice: 42857,
  upcomingEvents: 5,
  completedEvents: 10,
  ventasHoy: 5,
  ingresosHoy: 250000,
  vistasUnicas: 1200,
  abandonoCarrito: 15.5,
  eventosEnCurso: 2,
  asistenciaPromedio: 85.5,
};
