import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { createAdminClient } from "@/lib/supabase/admin";
import { createDiscount } from "@/lib/actions/discounts";
import { formatIDR } from "@/lib/utils";
import { DiscountActions } from "@/components/admin/discount-actions";

export const metadata = { title: "Diskon" };

export default async function AdminDiscountsPage() {
  const admin = createAdminClient();
  const { data: discounts } = await admin
    .from("discounts")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Kode Diskon</h1>
        <p className="text-sm text-muted-foreground">
          Buat kode promo persentase atau potongan tetap untuk pelanggan.
        </p>
      </div>

      <Card className="p-6">
        <h2 className="mb-4 font-bold">Buat Kode Baru</h2>
        <form action={createDiscount} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="code">Kode *</Label>
            <Input id="code" name="code" required placeholder="cth. HEMAT10" className="uppercase" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="type">Tipe *</Label>
            <select id="type" name="type" required className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400">
              <option value="percentage">Persentase (%)</option>
              <option value="fixed">Potongan Tetap (Rp)</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="value">Nilai *</Label>
            <Input id="value" name="value" type="number" min="1" required placeholder="cth. 10 atau 50000" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="min_subtotal">Min. Belanja (Rp)</Label>
            <Input id="min_subtotal" name="min_subtotal" type="number" min="0" defaultValue={0} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="usage_limit">Batas Pemakaian</Label>
            <Input id="usage_limit" name="usage_limit" type="number" min="1" placeholder="kosong = tak terbatas" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ends_at">Berakhir</Label>
            <Input id="ends_at" name="ends_at" type="date" />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <Button type="submit">Simpan Kode</Button>
          </div>
        </form>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Kode</th>
                <th className="px-4 py-3 font-medium">Nilai</th>
                <th className="px-4 py-3 font-medium">Min. Belanja</th>
                <th className="px-4 py-3 font-medium">Dipakai</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(discounts ?? []).map((d) => (
                <tr key={d.id}>
                  <td className="px-4 py-3 font-mono font-semibold">{d.code}</td>
                  <td className="px-4 py-3">
                    {d.type === "percentage" ? `${d.value}%` : formatIDR(d.value)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatIDR(d.min_subtotal)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {d.used_count}
                    {d.usage_limit ? ` / ${d.usage_limit}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={d.active ? "success" : "muted"}>
                      {d.active ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end">
                      <DiscountActions id={d.id} active={d.active} />
                    </div>
                  </td>
                </tr>
              ))}
              {(!discounts || discounts.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    Belum ada kode diskon.
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
