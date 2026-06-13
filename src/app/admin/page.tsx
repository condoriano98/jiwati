import Link from "next/link";
import { Package, ShoppingBag, Wallet, Upload, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatIDR } from "@/lib/utils";

export const metadata = { title: "Dashboard Admin" };

export default async function AdminDashboard() {
  const supabase = createAdminClient();
  const [{ count: productCount }, { count: orderCount }, { data: paidOrders }] =
    await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("total").eq("payment_status", "paid"),
    ]);

  const revenue = (paidOrders ?? []).reduce((n, o) => n + Number(o.total), 0);

  const stats = [
    { label: "Total Produk", value: productCount ?? 0, icon: Package },
    { label: "Total Pesanan", value: orderCount ?? 0, icon: ShoppingBag },
    { label: "Pendapatan", value: formatIDR(revenue), icon: Wallet },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Ringkasan</h1>
      <p className="text-sm text-muted-foreground">Selamat datang di dashboard admin.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <s.icon className="h-5 w-5 text-brand-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-brand-700">{s.value}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-6 p-6">
        <h2 className="font-bold">Aksi Cepat</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/admin/produk/import">
              <Upload className="h-4 w-4" /> Import Produk (CSV)
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/produk/baru">
              <Plus className="h-4 w-4" /> Tambah Produk
            </Link>
          </Button>
          <Button asChild variant="subtle">
            <Link href="/admin/produk">
              <Package className="h-4 w-4" /> Kelola Produk
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
