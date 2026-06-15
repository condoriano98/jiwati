import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createAdminClient } from "@/lib/supabase/admin";
import { CreateApiKey, RevokeApiKey } from "@/components/admin/api-key-manager";

export const metadata = { title: "API & Integrasi" };

const ENDPOINTS = [
  ["GET", "/api/v1/products", "Daftar produk (limit, page, search, active, updated_since)"],
  ["POST", "/api/v1/products", "Buat produk (+ varian)"],
  ["GET", "/api/v1/products/:id", "Detail produk"],
  ["PATCH", "/api/v1/products/:id", "Perbarui produk"],
  ["DELETE", "/api/v1/products/:id", "Hapus produk"],
  ["GET", "/api/v1/orders", "Daftar pesanan (status, payment_status)"],
  ["GET", "/api/v1/orders/:id", "Detail pesanan"],
  ["PATCH", "/api/v1/orders/:id", "Perbarui status pesanan"],
  ["GET", "/api/v1/discounts", "Daftar kode diskon"],
  ["POST", "/api/v1/discounts", "Buat kode diskon"],
  ["PATCH", "/api/v1/discounts/:id", "Perbarui diskon"],
  ["DELETE", "/api/v1/discounts/:id", "Hapus diskon"],
  ["GET", "/api/v1/webhooks", "Daftar webhook"],
  ["POST", "/api/v1/webhooks", "Daftarkan webhook"],
  ["PATCH", "/api/v1/webhooks/:id", "Perbarui webhook"],
  ["DELETE", "/api/v1/webhooks/:id", "Hapus webhook"],
] as const;

const METHOD_STYLE: Record<string, "success" | "brand" | "warning" | "danger"> = {
  GET: "success",
  POST: "brand",
  PATCH: "warning",
  DELETE: "danger",
};

export default async function AdminApiPage() {
  const admin = createAdminClient();
  const { data: keys } = await admin
    .from("api_keys")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">API & Integrasi</h1>
        <p className="text-sm text-muted-foreground">
          Akses produk, pesanan, diskon & webhook secara programatis melalui
          Admin API — mirip Shopify. Autentikasi memakai API key di header,
          dengan scope per-key dan rate limit 120 permintaan / menit.
        </p>
      </div>

      <Card className="p-6">
        <h2 className="mb-1 font-bold">API Keys</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Kirim key di header <code className="rounded bg-muted px-1">Authorization: Bearer &lt;token&gt;</code>{" "}
          atau <code className="rounded bg-muted px-1">X-API-Key: &lt;token&gt;</code>.
        </p>
        <CreateApiKey />

        <div className="mt-5 divide-y divide-border border-t border-border">
          {(keys ?? []).map((k) => (
            <div key={k.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div>
                <p className="font-medium">
                  {k.name}{" "}
                  {k.revoked && <Badge variant="danger">Dicabut</Badge>}
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  {k.prefix}••••••••  ·  dibuat{" "}
                  {new Date(k.created_at).toLocaleDateString("id-ID")}
                  {k.last_used_at &&
                    `  ·  terakhir dipakai ${new Date(k.last_used_at).toLocaleDateString("id-ID")}`}
                </p>
              </div>
              {!k.revoked && <RevokeApiKey id={k.id} />}
            </div>
          ))}
          {(!keys || keys.length === 0) && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Belum ada API key. Buat satu di atas untuk mulai.
            </p>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-3 font-bold">Endpoint</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-border">
              {ENDPOINTS.map(([method, path, desc]) => (
                <tr key={method + path}>
                  <td className="py-2 pr-3">
                    <Badge variant={METHOD_STYLE[method]}>{method}</Badge>
                  </td>
                  <td className="py-2 pr-3 font-mono text-xs">{path}</td>
                  <td className="py-2 text-muted-foreground">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-3 font-bold">Contoh</h2>
        <pre className="overflow-x-auto rounded-lg bg-brand-900 p-4 text-xs leading-relaxed text-brand-100">
{`# Daftar produk
curl https://<domain>/api/v1/products?limit=10 \\
  -H "Authorization: Bearer jw_live_xxx"

# Buat produk
curl -X POST https://<domain>/api/v1/products \\
  -H "Authorization: Bearer jw_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Vitamin C 1000mg","price":75000,"stock":100,"brand":"VitaForce","category":"Vitamin & Imun"}'

# Perbarui status pesanan
curl -X PATCH https://<domain>/api/v1/orders/<id> \\
  -H "Authorization: Bearer jw_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{"status":"shipped"}'`}
        </pre>
      </Card>
    </div>
  );
}
