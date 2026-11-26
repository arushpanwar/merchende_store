"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  club: string;
  kitType: string;
  size: string;
  priceInPaise: number;
  imageUrl: string;
  quantity: number;
  trackInventory: boolean;
  maxStock: number | null;
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (variantId: string) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  clear: () => void;
  subtotalPaise: () => number;
  count: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, qty = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.variantId === item.variantId);
          if (existing) {
            const nextQty = existing.quantity + qty;
            const capped =
              item.trackInventory && item.maxStock != null
                ? Math.min(nextQty, item.maxStock)
                : nextQty;
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId ? { ...i, quantity: capped } : i,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                ...item,
                quantity:
                  item.trackInventory && item.maxStock != null
                    ? Math.min(qty, item.maxStock)
                    : qty,
              },
            ],
          };
        });
      },
      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        })),
      setQuantity: (variantId, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) => {
              if (i.variantId !== variantId) return i;
              const capped =
                i.trackInventory && i.maxStock != null
                  ? Math.min(quantity, i.maxStock)
                  : quantity;
              return { ...i, quantity: Math.max(1, capped) };
            })
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [] }),
      subtotalPaise: () =>
        get().items.reduce((sum, i) => sum + i.priceInPaise * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "merchende-cart" },
  ),
);
