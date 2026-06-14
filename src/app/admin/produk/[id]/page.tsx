import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { createAdminClient } from "@/lib/supabase/admin";
import { saveVariant } from "@/lib/actions/variants";
import { formatIDR } from "@/lib/utils";
import { DeleteVariantButton } from "@/components/admin/delete-variant-button";
import type { Variant } from "@/lib/types";

export const metadata = { title: "Edit Produk" };

export default async function AdminProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();
  const { data: product } = await admin
    .from("products")
    .select("id, name, slug, price, stock")
    .eq("id", id)
    .maybeSingle();
  if (!product) notFound();

  const { data: variants } = await admin
    .from("product_variants")
    .select("*")
    .eq("product_id", id)
    .order("position");

  return (
    <div className="max-w-3xl">
      <Link href="/admin/produk" className="inline-flex items-center gap-1 text-sm text-brand-700 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Kembali ke Produk
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">{product.name}</h1>
      <p className="text-sm text-muted-foreground">
        Harga dasar {formatIDR(product.price)} · Stok dasar {product.stock}
      </p>

      <Card className="mt-6 p-6">
        <h2 className="font-bold">Varian Produk</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Tambahkan varian (mis. rasa atau ukuran) dengan harga & stok masing-masing.
          Saat produk punya varian, pembeli wajib memilih salah satunya.
        </p>

        {variants && variants.length > 0 ? (
          <div className="mb-6 divide-y divide-border border-y border-border">
            {(variants as Variant[]).map((v) => (
              <div key={v.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="font-medium">
                    {v.title}{" "}
                    {!v.is_active && <Badge variant="muted">Nonaktif</Badge>}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatIDR(v.price)} · Stok {v.stock}
                    {v.sku && ` · SKU ${v.sku}`}
                  </p>
                </div>
                <DeleteVariantButton id={v.id} productId={product.id} title={v.title} />
              </div>
            ))}
          </div>
        ) : (
          <p className="mb-6 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Belum ada varian. Produk dijual dengan harga & stok dasar.
          </p>
        )}

        <form action={saveVariant} className="space-y-4 border-t border-border pt-5">
          <input type="hidden" name="product_id" value={product.id} />
          <p className="font-semibold">Tambah Varian</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="title">Nama Varian *</Label>
              <Input id="title" name="title" required placeholder="cth. Cokelat 1kg" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" name="sku" placeholder="cth. WPI-CHO-1K" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price">Harga (Rp) *</Label>
              <Input id="price" name="price" type="number" min="0" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="compare_at_price">Harga Coret (Rp)</Label>
              <Input id="compare_at_price" name="compare_at_price" type="number" min="0" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stock">Stok *</Label>
              <Input id="stock" name="stock" type="number" min="0" defaultValue={0} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="position">Urutan</Label>
              <Input id="position" name="position" type="number" min="0" defaultValue={0} />
            </div>
          </div>
          <Button type="submit">Simpan Varian</Button>
        </form>
      </Card>
    </div>
  );
}
