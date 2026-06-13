"use client";

import { useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import type { Product } from "@/lib/types";

export function AddToCart({
  product,
  withQty = false,
}: {
  product: Product;
  withQty?: boolean;
}) {
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const soldOut = product.stock <= 0;

  function handleAdd() {
    add(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.images?.[0] ?? null,
        stock: product.stock,
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="flex items-center gap-3">
      {withQty && !soldOut && (
        <div className="flex h-10 items-center rounded-lg border border-border">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-3 text-lg text-muted-foreground hover:text-brand-700"
            aria-label="Kurangi"
          >
            −
          </button>
          <span className="w-8 text-center text-sm font-semibold">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
            className="px-3 text-lg text-muted-foreground hover:text-brand-700"
            aria-label="Tambah"
          >
            +
          </button>
        </div>
      )}
      <Button
        onClick={handleAdd}
        disabled={soldOut}
        variant={added ? "accent" : "default"}
        className={withQty ? "flex-1" : "w-full"}
      >
        {soldOut ? (
          "Stok Habis"
        ) : added ? (
          <>
            <Check className="h-4 w-4" /> Ditambahkan
          </>
        ) : (
          <>
            <ShoppingCart className="h-4 w-4" /> Tambah
          </>
        )}
      </Button>
    </div>
  );
}
