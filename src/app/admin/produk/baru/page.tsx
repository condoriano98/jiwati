import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { saveProduct } from "@/lib/actions/admin";

export const metadata = { title: "Tambah Produk" };

export default function NewProductPage() {
  async function action(formData: FormData) {
    "use server";
    await saveProduct(formData);
    redirect("/admin/produk");
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Tambah Produk</h1>
      <Card className="p-6">
        <form action={action} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nama Produk *</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="price">Harga (Rp) *</Label>
              <Input id="price" name="price" type="number" min="0" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="compare_at_price">Harga Coret (Rp)</Label>
              <Input id="compare_at_price" name="compare_at_price" type="number" min="0" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="stock">Stok *</Label>
              <Input id="stock" name="stock" type="number" min="0" defaultValue={0} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" name="sku" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" name="brand" placeholder="cth. NutriPro" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category">Kategori</Label>
              <Input id="category" name="category" placeholder="cth. Vitamin & Imun" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="image">URL Gambar</Label>
            <Input id="image" name="image" type="url" placeholder="https://…" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea id="description" name="description" rows={4} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_bestseller" value="true" className="h-4 w-4 rounded border-border" />
            Tandai sebagai produk terlaris
          </label>
          <Button type="submit" size="lg">Simpan Produk</Button>
        </form>
      </Card>
    </div>
  );
}
