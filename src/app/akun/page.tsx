import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, Package, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import { formatIDR } from "@/lib/utils";
import type { Order, OrderStatus, Profile } from "@/lib/types";

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Menunggu Pembayaran",
  paid: "Dibayar",
  processing: "Diproses",
  shipped: "Dikirim",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

export const metadata = { title: "Akun Saya" };

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/masuk");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Halo, {profile?.full_name ?? user.email}
          </h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex gap-2">
          {profile?.role === "admin" && (
            <Button asChild variant="outline">
              <Link href="/admin">
                <ShieldCheck className="h-4 w-4" /> Dashboard Admin
              </Link>
            </Button>
          )}
          <form action={signOut}>
            <Button variant="subtle" type="submit">
              <LogOut className="h-4 w-4" /> Keluar
            </Button>
          </form>
        </div>
      </div>

      <h2 className="mb-3 flex items-center gap-2 font-bold">
        <Package className="h-5 w-5 text-brand-600" /> Riwayat Pesanan
      </h2>

      {orders && orders.length > 0 ? (
        <div className="space-y-3">
          {(orders as Order[]).map((o) => (
            <Card key={o.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-mono text-xs text-muted-foreground">
                    #{o.id.slice(0, 8)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(o.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <Badge variant={o.status === "completed" ? "success" : o.status === "cancelled" ? "danger" : "warning"}>
                  {STATUS_LABEL[o.status]}
                </Badge>
              </div>
              <div className="mt-3 border-t border-border pt-3 text-sm">
                {o.items?.map((it) => (
                  <div key={it.id} className="flex justify-between py-0.5">
                    <span className="text-muted-foreground">
                      {it.quantity} × {it.name}
                    </span>
                    <span>{formatIDR(it.price * it.quantity)}</span>
                  </div>
                ))}
                <div className="mt-2 flex justify-between border-t border-border pt-2 font-bold">
                  <span>Total</span>
                  <span className="text-brand-700">{formatIDR(o.total)}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          Belum ada pesanan.{" "}
          <Link href="/produk" className="font-semibold text-brand-700 hover:underline">
            Mulai belanja
          </Link>
        </Card>
      )}
    </div>
  );
}
