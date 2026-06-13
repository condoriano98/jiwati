import { ProductCard } from "@/components/product/product-card";
import { SortSelect } from "@/components/product/sort-select";
import { getProducts } from "@/lib/queries";

export const metadata = { title: "Semua Produk" };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; sort?: string }>;
}) {
  const { search, sort } = await searchParams;
  const products = await getProducts({ search, sort });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {search ? `Hasil untuk “${search}”` : "Semua Produk"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {products.length} produk ditemukan
          </p>
        </div>
        <SortSelect />
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
          Tidak ada produk yang cocok.
        </p>
      )}
    </div>
  );
}
