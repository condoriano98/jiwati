import { ProductImporter } from "@/components/admin/product-importer";

export const metadata = { title: "Import Produk" };

export default function ImportPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Import Produk</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Unggah file CSV untuk menambahkan atau memperbarui banyak produk sekaligus.
        Produk dicocokkan berdasarkan nama (slug); brand & kategori dibuat otomatis.
      </p>
      <ProductImporter />
    </div>
  );
}
