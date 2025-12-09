import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PromoCode, PromoCodeService } from '@shared/lib/api/services/PromoCode.service';

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
  promoCode: PromoCode | null;
  discount: number;
  finalTotal: number;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (eventId: string, ticketTypeId: string) => void;
  updateQuantity: (eventId: string, ticketTypeId: string, quantity: number) => void;
  clearCart: () => void;
  calculateTotal: () => void;
  applyPromoCode: (codigo: string, eventId: string) => Promise<{ success: boolean; message: string }>;
  removePromoCode: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      promoCode: null,
      discount: 0,
      finalTotal: 0,

      addItem: (item) => {
        console.log('🛒 CartStore.addItem llamado:', item);
        const { items } = get();
        const existingItem = items.find(
          i => i.eventId === item.eventId && i.ticketTypeId === item.ticketTypeId
        );

        if (existingItem) {
          console.log('✏️ Item ya existe, actualizando cantidad');
          get().updateQuantity(
            item.eventId, 
            item.ticketTypeId, 
            existingItem.quantity + (item.quantity || 1)
          );
        } else {
          console.log('➕ Agregando nuevo item al carrito');
          set({
            items: [...items, { ...item, quantity: item.quantity || 1 }]
          });
        }
        
        get().calculateTotal();
        console.log('📊 Items después de agregar:', get().items);
        console.log('💰 Total después de agregar:', get().total);
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
        set({ items: [], total: 0, promoCode: null, discount: 0, finalTotal: 0 });
      },

      calculateTotal: () => {
        const { items, promoCode } = get();
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        let discount = 0;
        let finalTotal = total;

        if (promoCode) {
          const result = PromoCodeService.calcularDescuento(total, promoCode);
          discount = result.descuento;
          finalTotal = result.precioFinal;
        }

        set({ total, discount, finalTotal });
      },

      applyPromoCode: async (codigo: string, eventId: string) => {
        const resultado = await PromoCodeService.validarCodigo(codigo, eventId);

        if (resultado.valido && resultado.codigo) {
          set({ promoCode: resultado.codigo });
          get().calculateTotal();
          return {
            success: true,
            message: resultado.mensaje || 'Código aplicado correctamente'
          };
        }

        return {
          success: false,
          message: resultado.mensaje || 'Código inválido'
        };
      },

      removePromoCode: () => {
        set({ promoCode: null, discount: 0 });
        get().calculateTotal();
      }
    }),
    {
      name: 'cart-storage'
    }
  )
);