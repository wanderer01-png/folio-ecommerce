import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: string;
  stock: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  // True once this cart has been reconciled with the database for the
  // current signed-in session. Persisted so it survives page reloads —
  // without it, a fresh mount can't tell "items just fetched from the DB"
  // apart from "items a guest added locally," and re-merges on every load,
  // double-counting quantities.
  hasHydratedFromServer: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  hydrateFromServer: (items: CartItem[]) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      hasHydratedFromServer: false,
      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId,
          );

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? {
                      ...i,
                      quantity: Math.min(i.quantity + quantity, item.stock),
                    }
                  : i,
              ),
            };
          }

          return {
            items: [
              ...state.items,
              { ...item, quantity: Math.min(quantity, item.stock) },
            ],
          };
        }),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.productId !== productId)
              : state.items.map((i) =>
                  i.productId === productId
                    ? { ...i, quantity: Math.min(quantity, i.stock) }
                    : i,
                ),
        })),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      hydrateFromServer: (items) =>
        set({ items, hasHydratedFromServer: true }),
      clearCart: () => set({ items: [], hasHydratedFromServer: false }),
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
