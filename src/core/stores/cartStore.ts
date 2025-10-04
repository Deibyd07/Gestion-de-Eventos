import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  eventId: string;
  ticketTypeId: string;
  quantity: number;
  price: number;
  eventTitle: string;
  ticketTypeName: string;
}

interface CartState {
  items: CartItem[];
  total: number;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (eventId: string, ticketTypeId: string) => void;
  updateQuantity: (eventId: string, ticketTypeId: string, quantity: number) => void;
  clearCart: () => void;
  calculateTotal: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,

      addItem: (item) => {
        const { items } = get();
        const existingItem = items.find(
          i => i.eventId === item.eventId && i.ticketTypeId === item.ticketTypeId
        );

        if (existingItem) {
          get().updateQuantity(
            item.eventId, 
            item.ticketTypeId, 
            existingItem.quantity + (item.quantity || 1)
          );
        } else {
          set({
            items: [...items, { ...item, quantity: item.quantity || 1 }]
          });
        }
        
        get().calculateTotal();
      },

      removeItem: (eventId, ticketTypeId) => {
        const { items } = get();
        set({
          items: items.filter(
            item => !(item.eventId === eventId && item.ticketTypeId === ticketTypeId)
          )
        });
        get().calculateTotal();
      },

      updateQuantity: (eventId, ticketTypeId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(eventId, ticketTypeId);
          return;
        }

        const { items } = get();
        set({
          items: items.map(item =>
            item.eventId === eventId && item.ticketTypeId === ticketTypeId
              ? { ...item, quantity }
              : item
          )
        });
        get().calculateTotal();
      },

      clearCart: () => {
        set({ items: [], total: 0 });
      },

      calculateTotal: () => {
        const { items } = get();
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        set({ total });
      }
    }),
    {
      name: 'cart-storage'
    }
  )
);