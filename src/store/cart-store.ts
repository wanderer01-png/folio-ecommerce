import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type PurchaseFormat = "EBOOK" | "HARDCOPY";

export interface CartItem {
  bookId: string;
  slug: string;
  title: string;
  coverImage: string;
  price: string;
  format: PurchaseFormat;
  // Only meaningful for HARDCOPY — EBOOK is an unlimited digital good and
  // is always clamped to a quantity of 1 (you don't buy multiple copies of
  // reading access for yourself).
  stock: number;
  quantity: number;
}

function clampQuantity(item: Pick<CartItem, "format" | "stock">, quantity: number) {
  if (item.format === "EBOOK") return 1;
  return Math.min(quantity, item.stock);
}

interface CartState {
  items: CartItem[];
  hasHydratedFromServer: boolean;
  addItem: (
    item: Omit<CartItem, "quantity">,
    quantity?: number,
  ) => void;
  updateQuantity: (
    bookId: string,
    format: PurchaseFormat,
    quantity: number,
  ) => void;
  removeItem: (bookId: string, format: PurchaseFormat) => void;
  hydrateFromServer: (items: CartItem[]) => void;
  clearCart: () => void;
}

function sameLine(item: CartItem, bookId: string, format: PurchaseFormat) {
  return item.bookId === bookId && item.format === format;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      hasHydratedFromServer: false,
      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) =>
            sameLine(i, item.bookId, item.format),
          );

          if (existing) {
            return {
              items: state.items.map((i) =>
                sameLine(i, item.bookId, item.format)
                  ? {
                      ...i,
                      quantity: clampQuantity(i, i.quantity + quantity),
                    }
                  : i,
              ),
            };
          }

          return {
            items: [
              ...state.items,
              { ...item, quantity: clampQuantity(item, quantity) },
            ],
          };
        }),
      updateQuantity: (bookId, format, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => !sameLine(i, bookId, format))
              : state.items.map((i) =>
                  sameLine(i, bookId, format)
                    ? { ...i, quantity: clampQuantity(i, quantity) }
                    : i,
                ),
        })),
      removeItem: (bookId, format) =>
        set((state) => ({
          items: state.items.filter((i) => !sameLine(i, bookId, format)),
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
