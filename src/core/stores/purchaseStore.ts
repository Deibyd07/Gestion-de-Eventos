import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Purchase {
  id: string;
  userId: string;
  eventId: string;
  eventTitle: string;
  ticketTypeId: string;
  ticketTypeName: string;
  quantity: number;
  price: number;
  total: number;
  purchaseDate: string;
  status: 'pending' | 'completed' | 'cancelled';
  qrCode: string;
  orderId: string;
}

export interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

interface PurchaseState {
  purchases: Purchase[];
  userInfo: UserInfo | null;
  addPurchase: (purchase: Purchase) => void;
  updatePurchase: (id: string, updates: Partial<Purchase>) => void;
  getUserPurchases: (userId: string) => Purchase[];
  setUserInfo: (info: UserInfo) => void;
  clearUserInfo: () => void;
}

export const usePurchaseStore = create<PurchaseState>()(
  persist(
    (set, get) => ({
      purchases: [],
      userInfo: null,

      addPurchase: (purchase) => {
        const { purchases } = get();
        set({ purchases: [...purchases, purchase] });
      },

      updatePurchase: (id, updates) => {
        const { purchases } = get();
        const updatedPurchases = purchases.map(purchase =>
          purchase.id === id ? { ...purchase, ...updates } : purchase
        );
        set({ purchases: updatedPurchases });
      },

      getUserPurchases: (userId) => {
        const { purchases } = get();
        return purchases.filter(purchase => purchase.userId === userId);
      },

      setUserInfo: (info) => {
        set({ userInfo: info });
      },

      clearUserInfo: () => {
        set({ userInfo: null });
      }
    }),
    {
      name: 'purchase-storage'
    }
  )
);


