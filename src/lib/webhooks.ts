import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export type WebhookTopic =
  | "order.created"
  | "order.paid"
  | "product.created"
  | "product.updated"
  | "product.deleted";

/**
 * Delivers an event to every active webhook endpoint subscribed to `topic`.
 * Signs the body with the endpoint secret (HMAC-SHA256) — Shopify-style — and
 * logs each delivery. Best-effort: failures are recorded, never thrown.
 */
export async function emitEvent(topic: WebhookTopic, data: unknown): Promise<void> {
  const admin = createAdminClient();
  const { data: endpoints } = await admin
    .from("webhook_endpoints")
    .select("id, url, secret")
    .eq("active", true)
    .contains("events", [topic]);

  if (!endpoints?.length) return;

  const body = JSON.stringify({ topic, data, sent_at: new Date().toISOString() });

  await Promise.all(
    endpoints.map(async (ep) => {
      const signature = crypto.createHmac("sha256", ep.secret).update(body).digest("hex");
      let status: number | null = null;
      let ok = false;
      let error: string | null = null;
      try {
        const res = await fetch(ep.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Jiwati-Topic": topic,
            "X-Jiwati-Hmac-SHA256": signature,
          },
          body,
          signal: AbortSignal.timeout(8000),
        });
        status = res.status;
        ok = res.ok;
      } catch (e) {
        error = e instanceof Error ? e.message : "delivery failed";
      }
      await admin.from("webhook_deliveries").insert({
        endpoint_id: ep.id,
        topic,
        payload: JSON.parse(body),
        status_code: status,
        ok,
        error,
      });
    }),
  );
}
