import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createAdminClient } from "@/lib/supabase/admin";
import { CreateWebhook, WebhookActions } from "@/components/admin/webhook-manager";

export const metadata = { title: "Webhook" };

export default async function AdminWebhooksPage() {
  const admin = createAdminClient();
  const [{ data: endpoints }, { data: deliveries }] = await Promise.all([
    admin.from("webhook_endpoints").select("*").order("created_at", { ascending: false }),
    admin
      .from("webhook_deliveries")
      .select("id, topic, status_code, ok, error, created_at")
      .order("created_at", { ascending: false })
      .limit(15),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Webhook</h1>
        <p className="text-sm text-muted-foreground">
          Kirim notifikasi real-time ke sistem lain saat ada event (pesanan, produk).
          Payload ditandatangani HMAC-SHA256 di header{" "}
          <code className="rounded bg-muted px-1 text-xs">X-Jiwati-Hmac-SHA256</code>.
        </p>
      </div>

      <Card className="p-6">
        <h2 className="mb-4 font-bold">Daftarkan Endpoint</h2>
        <CreateWebhook />
      </Card>

      <Card className="p-6">
        <h2 className="mb-3 font-bold">Endpoint Terdaftar</h2>
        <div className="divide-y divide-border border-y border-border">
          {(endpoints ?? []).map((e) => (
            <div key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div className="min-w-0">
                <p className="truncate font-mono text-sm">
                  {e.url}{" "}
                  {!e.active && <Badge variant="muted">Nonaktif</Badge>}
                </p>
                <p className="text-xs text-muted-foreground">{(e.events ?? []).join(", ")}</p>
              </div>
              <WebhookActions id={e.id} active={e.active} />
            </div>
          ))}
          {(!endpoints || endpoints.length === 0) && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Belum ada endpoint webhook.
            </p>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-3 font-bold">Pengiriman Terakhir</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-border">
              {(deliveries ?? []).map((d) => (
                <tr key={d.id}>
                  <td className="py-2 pr-3 font-mono text-xs">{d.topic}</td>
                  <td className="py-2 pr-3">
                    <Badge variant={d.ok ? "success" : "danger"}>
                      {d.ok ? d.status_code ?? "OK" : d.error ? "Gagal" : d.status_code ?? "Err"}
                    </Badge>
                  </td>
                  <td className="py-2 text-xs text-muted-foreground">
                    {new Date(d.created_at).toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
              {(!deliveries || deliveries.length === 0) && (
                <tr>
                  <td className="py-6 text-center text-sm text-muted-foreground">
                    Belum ada pengiriman.
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
