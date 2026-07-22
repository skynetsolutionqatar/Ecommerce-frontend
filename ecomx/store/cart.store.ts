import { create } from "zustand";
import type { ApiCart } from "@/types/cart.types";

interface CartState {
  cart: ApiCart | null;
  isLoading: boolean;
  setCart: (cart: ApiCart | null) => void;
  setLoading: (loading: boolean) => void;
  itemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isLoading: false,

  setCart: (cart) => set({ cart }),
  setLoading: (isLoading) => set({ isLoading }),

  itemCount: () => {
    const cart = get().cart;
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
