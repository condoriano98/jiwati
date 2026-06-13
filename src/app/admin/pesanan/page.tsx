import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatIDR } from "@/lib/utils";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import type { Order } from "@/lib/types";

export const metadata = { title: "Pesanan" };

export default async function AdminOrdersPage() {
  const supabase = createAdminClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold tracking-tight">Pesanan</h1>
      <p className="mb-6 text-sm text-muted-foreground">{orders?.length ?? 0} pesanan</p>

      <div className="space-y-3">
        {(orders as Order[] | null)?.map((o) => (
          <Card key={o.id} className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-xs text-muted-foreground">#{o.id.slice(0, 8)}</p>
                <p className="text-sm">
                  {o.shipping_address?.recipient ?? "—"} •{" "}
                  {new Date(o.created_at).toLocaleDateString("id-ID")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={o.payment_status === "paid" ? "success" : "warning"}>
                  {o.payment_status === "paid" ? "Lunas" : "Belum Bayar"}
                </Badge>
                <span className="font-bold text-brand-700">{formatIDR(o.total)}</span>
                <OrderStatusSelect orderId={o.id} status={o.status} />
              </div>
            </div>
            <div className="mt-3 border-t border-border pt-3 text-sm text-muted-foreground">
              {o.items?.map((it) => (
                <span key={it.id} className="mr-3 inline-block">
                  {it.quantity}× {it.name}
                </span>
              ))}
            </div>
          </Card>
        ))}
        {(!orders || orders.length === 0) && (
          <Card className="p-12 text-center text-muted-foreground">Belum ada pesanan.</Card>
        )}
      </div>
    </div>
  );
}
