import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, Truck, ShieldCheck, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AddToCart } from "@/components/product/add-to-cart";
import { ProductCard } from "@/components/product/product-card";
import { formatIDR } from "@/lib/utils";
import { getProductBySlug, getProducts } from "@/lib/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product?.name ?? "Produk" };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = (
    await getProducts({ category: product.categories?.[0]?.slug, limit: 5 })
  ).filter((p) => p.id !== product.id).slice(0, 4);

  const discount =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round(
          ((product.compare_at_price - product.price) / product.compare_at_price) * 100,
        )
      : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-brand-700">Beranda</Link>
        {" / "}
        <Link href="/produk" className="hover:text-brand-700">Produk</Link>
        {" / "}
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Tanpa gambar
            </div>
          )}
          {product.is_bestseller && (
            <Badge variant="accent" className="absolute left-3 top-3">Terlaris</Badge>
          )}
        </div>

        <div>
          {product.brand?.name && (
            <Link
              href={`/produk?brand=${product.brand.slug}`}
              className="text-sm font-semibold uppercase tracking-wide text-brand-600"
            >
              {product.brand.name}
            </Link>
          )}
          <h1 className="mt-1 text-3xl font-bold tracking-tight">{product.name}</h1>

          <div className="mt-2 flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-accent-400 text-accent-400" />
              {product.rating.toFixed(1)}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className={product.stock > 0 ? "text-green-600" : "text-red-600"}>
              {product.stock > 0 ? `Stok ${product.stock}` : "Stok habis"}
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-brand-700">
              {formatIDR(product.price)}
            </span>
            {discount > 0 && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {formatIDR(product.compare_at_price!)}
                </span>
                <Badge variant="danger">-{discount}%</Badge>
              </>
            )}
          </div>

          {product.description && (
            <p className="mt-4 text-muted-foreground">{product.description}</p>
          )}

          <div className="mt-6">
            <AddToCart product={product} withQty />
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-6 text-center text-xs">
            <div className="flex flex-col items-center gap-1">
              <Truck className="h-5 w-5 text-brand-600" /> Pengiriman cepat
            </div>
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="h-5 w-5 text-brand-600" /> 100% Original
            </div>
            <div className="flex flex-col items-center gap-1">
              <RefreshCw className="h-5 w-5 text-brand-600" /> Garansi tukar
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-xl font-bold tracking-tight">Produk Terkait</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
