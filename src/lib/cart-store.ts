"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "@/lib/types";

/** Stable identity for a cart line (a product + a specific variant). */
export function lineKey(l: Pick<CartLine, "productId" | "variantId">): string {
  return `${l.productId}:${l.variantId ?? ""}`;
}

type CartState = {
  lines: CartLine[];
  add: (line: Omit<CartLine, "quantity">, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  count: () => number;
  subtotal: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (line, qty = 1) =>
        set((state) => {
          const key = lineKey(line);
          const existing = state.lines.find((l) => lineKey(l) === key);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                lineKey(l) === key
                  ? { ...l, quantity: Math.min(l.stock, l.quantity + qty) }
                  : l,
              ),
            };
          }
          return {
            lines: [...state.lines, { ...line, quantity: Math.min(line.stock, qty) }],
          };
        }),
      setQty: (key, qty) =>
        set((state) => ({
          lines: state.lines
            .map((l) =>
              lineKey(l) === key
                ? { ...l, quantity: Math.max(0, Math.min(l.stock, qty)) }
                : l,
            )
            .filter((l) => l.quantity > 0),
        })),
      remove: (key) =>
        set((state) => ({
          lines: state.lines.filter((l) => lineKey(l) !== key),
        })),
      clear: () => set({ lines: [] }),
      count: () => get().lines.reduce((n, l) => n + l.quantity, 0),
      subtotal: () => get().lines.reduce((n, l) => n + l.price * l.quantity, 0),
    }),
    { name: "nf-cart" },
  ),
);
