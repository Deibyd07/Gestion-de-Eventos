import { Event } from '../stores/eventStore';
import { User } from '../stores/authStore';

// Base API configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.eventplatform.com' 
  : 'http://localhost:3000/api';

class ApiService {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options?.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    // Mock implementation - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockResponse = {
      user: {
        id: '1',
        email,
        name: email.split('@')[0],
        role: 'organizer' as const,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
      },
      token: 'mock-jwt-token'
    };
    
    return mockResponse;
  }

  async register(userData: { email: string; password: string; name: string }): Promise<{ user: User; token: string }> {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      user: {
        id: Date.now().toString(),
        email: userData.email,
        name: userData.name,
        role: 'attendee',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`
      },
      token: 'mock-jwt-token'
    };
  }

  // Events endpoints
  async getEvents(): Promise<Event[]> {
    // Mock data - replace with actual API call
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([]);
      }, 500);
    });
  }

  async getEventById(id: string): Promise<Event> {
    return this.request<Event>(`/events/${id}`);
  }

  async createEvent(eventData: Omit<Event, 'id' | 'organizerId'>): Promise<Event> {
    return this.request<Event>('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async updateEvent(id: string, eventData: Partial<Event>): Promise<Event> {
    return this.request<Event>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  }

  async deleteEvent(id: string): Promise<void> {
    return this.request<void>(`/events/${id}`, {
      method: 'DELETE',
    });
  }

  // Ticket endpoints
  async purchaseTickets(purchaseData: {
    eventId: string;
    tickets: { ticketTypeId: string; quantity: number }[];
    paymentMethod: string;
  }): Promise<{ success: boolean; orderId: string; qrCode: string }> {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      success: true,
      orderId: `ORDER-${Date.now()}`,
      qrCode: `QR-${Date.now()}`
    };
  }

  // Analytics endpoints
  async getEventAnalytics(eventId: string): Promise<{
    totalSales: number;
    totalRevenue: number;
    attendees: number;
    conversionRate: number;
  }> {
    // Mock data
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      totalSales: Math.floor(Math.random() * 500) + 100,
      totalRevenue: Math.floor(Math.random() * 50000) + 10000,
      attendees: Math.floor(Math.random() * 400) + 50,
      conversionRate: Math.floor(Math.random() * 30) + 10
    };
  }
}

export const apiService = new ApiService();