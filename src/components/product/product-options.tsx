"use client";

import { useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/cart-store";
import { formatIDR } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function ProductOptions({ product }: { product: Product }) {
  const variants = product.variants ?? [];
  const add = useCart((s) => s.add);
  const [variantId, setVariantId] = useState(
    variants.find((v) => v.stock > 0)?.id ?? variants[0]?.id ?? "",
  );
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const variant = variants.find((v) => v.id === variantId) ?? variants[0];
  const soldOut = !variant || variant.stock <= 0;
  const discount =
    variant?.compare_at_price && variant.compare_at_price > variant.price
      ? Math.round(((variant.compare_at_price - variant.price) / variant.compare_at_price) * 100)
      : 0;

  function handleAdd() {
    if (!variant) return;
    add(
      {
        productId: product.id,
        variantId: variant.id,
        variantTitle: variant.title,
        slug: product.slug,
        name: product.name,
        price: variant.price,
        image: product.images?.[0] ?? null,
        stock: variant.stock,
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
    setQty(1);
  }

  return (
    <div>
      {/* Variant options */}
      <div className="mt-4">
        <p className="mb-2 text-sm font-semibold">Pilihan</p>
        <div className="flex flex-wrap gap-2">
          {variants.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setVariantId(v.id)}
              disabled={v.stock <= 0}
              className={`rounded-lg border px-3 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                v.id === variantId
                  ? "border-brand-600 bg-brand-50 font-semibold text-brand-700"
                  : "border-border hover:border-brand-400"
              }`}
            >
              {v.title}
            </button>
          ))}
        </div>
      </div>

      {/* Price for the selected variant */}
      <div className="mt-4 flex items-baseline gap-3">
        <span className="text-3xl font-extrabold text-brand-700">
          {formatIDR(variant?.price ?? 0)}
        </span>
        {discount > 0 && (
          <>
            <span className="text-lg text-muted-foreground line-through">
              {formatIDR(variant!.compare_at_price!)}
            </span>
            <Badge variant="danger">-{discount}%</Badge>
          </>
        )}
      </div>
      <p className={`mt-1 text-sm ${soldOut ? "text-red-600" : "text-green-600"}`}>
        {soldOut ? "Stok habis" : `Stok ${variant!.stock}`}
        {variant?.sku && <span className="text-muted-foreground"> · SKU {variant.sku}</span>}
      </p>

      {/* Quantity + add */}
      <div className="mt-6 flex items-center gap-3">
        {!soldOut && (
          <div className="flex h-10 items-center rounded-lg border border-border">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 text-lg text-muted-foreground hover:text-brand-700" aria-label="Kurangi">−</button>
            <span className="w-8 text-center text-sm font-semibold">{qty}</span>
            <button onClick={() => setQty((q) => Math.min(variant!.stock, q + 1))} className="px-3 text-lg text-muted-foreground hover:text-brand-700" aria-label="Tambah">+</button>
          </div>
        )}
        <Button onClick={handleAdd} disabled={soldOut} variant={added ? "accent" : "default"} className="flex-1">
          {soldOut ? "Stok Habis" : added ? (<><Check className="h-4 w-4" /> Ditambahkan</>) : (<><ShoppingCart className="h-4 w-4" /> Tambah ke Keranjang</>)}
        </Button>
      </div>
    </div>
  );
}
