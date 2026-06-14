import Image from "next/image";
import Link from "next/link";
import { Plus, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatIDR } from "@/lib/utils";
import { DeleteProductButton } from "@/components/admin/delete-product-button";

export const metadata = { title: "Kelola Produk" };

export default async function AdminProductsPage() {
  const supabase = createAdminClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, price, stock, images, is_bestseller, brand:brands(name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kelola Produk</h1>
          <p className="text-sm text-muted-foreground">
            {products?.length ?? 0} produk
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/produk/import">
              <Upload className="h-4 w-4" /> Import CSV
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/produk/baru">
              <Plus className="h-4 w-4" /> Tambah
            </Link>
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Produk</th>
                <th className="px-4 py-3 font-medium">Brand</th>
                <th className="px-4 py-3 font-medium">Harga</th>
                <th className="px-4 py-3 font-medium">Stok</th>
                <th className="px-4 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(products ?? []).map((p) => {
                const brand = Array.isArray(p.brand) ? p.brand[0] : p.brand;
                return (
                  <tr key={p.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                          {p.images?.[0] && (
                            <Image src={p.images[0]} alt="" fill sizes="40px" className="object-cover" />
                          )}
                        </div>
                        <span className="font-medium">{p.name}</span>
                        {p.is_bestseller && <Badge variant="accent">Terlaris</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{brand?.name ?? "—"}</td>
                    <td className="px-4 py-3 font-medium">{formatIDR(p.price)}</td>
                    <td className="px-4 py-3">
                      <span className={p.stock > 0 ? "" : "text-red-600"}>{p.stock}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-4">
                        <Link href={`/admin/produk/${p.id}`} className="text-sm font-medium text-brand-700 hover:underline">
                          Edit / Varian
                        </Link>
                        <DeleteProductButton id={p.id} name={p.name} />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {(!products || products.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    Belum ada produk. Mulai dengan{" "}
                    <Link href="/admin/produk/import" className="font-semibold text-brand-700 hover:underline">
                      import CSV
                    </Link>
                    .
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
