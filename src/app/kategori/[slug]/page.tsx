import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product/product-card";
import { SortSelect } from "@/components/product/sort-select";
import { getCategoryBySlug, getProducts } from "@/lib/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  return { title: category?.name ?? "Kategori" };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  const { slug } = await params;
  const { sort } = await searchParams;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const products = await getProducts({ category: slug, sort });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{category.name}</h1>
          {category.description && (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {category.description}
            </p>
          )}
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
          Belum ada produk dalam kategori ini.
        </p>
      )}
    </div>
  );
}
