import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatIDR } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { AddToCart } from "./add-to-cart";

export function ProductCard({ product }: { product: Product }) {
  const discount =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round(
          ((product.compare_at_price - product.price) /
            product.compare_at_price) *
            100,
        )
      : 0;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/produk/${product.slug}`} className="relative block aspect-square overflow-hidden bg-muted">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Tanpa gambar
          </div>
        )}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.is_bestseller && <Badge variant="accent">Terlaris</Badge>}
          {discount > 0 && <Badge variant="danger">-{discount}%</Badge>}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3">
        {product.brand?.name && (
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {product.brand.name}
          </span>
        )}
        <Link
          href={`/produk/${product.slug}`}
          className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug hover:text-brand-700"
        >
          {product.name}
        </Link>

        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-accent-400 text-accent-400" />
          {product.rating.toFixed(1)}
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-bold text-brand-700">{formatIDR(product.price)}</span>
          {discount > 0 && (
            <span className="text-xs text-muted-foreground line-through">
              {formatIDR(product.compare_at_price!)}
            </span>
          )}
        </div>

        <div className="mt-3">
          <AddToCart product={product} />
        </div>
      </div>
    </div>
  );
}
