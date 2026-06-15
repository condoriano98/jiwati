import { formatIDR } from "@/lib/utils";
import { createAdminClient } from "@/lib/supabase/admin";

type Item = { name: string; quantity: number; price: number };

/**
 * Sends an order-confirmation email via Resend. No-op (returns silently) when
 * RESEND_API_KEY is unset, so the checkout flow never breaks without it.
 */
export async function sendOrderConfirmation(opts: {
  to: string;
  orderId: string;
  total: number;
  items: Item[];
}): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key || !opts.to) return;

  const from = process.env.EMAIL_FROM || "Jiwati <onboarding@resend.dev>";
  const shortId = opts.orderId.slice(0, 8);
  const rows = opts.items
    .map(
      (i) =>
        `<tr><td style="padding:4px 0">${i.quantity}× ${i.name}</td><td align="right">${formatIDR(i.price * i.quantity)}</td></tr>`,
    )
    .join("");
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:auto">
      <h2 style="color:#2c6a37">Terima kasih atas pesanan Anda! 🌿</h2>
      <p>Pesanan <b>#${shortId}</b> telah kami terima dan sedang diproses.</p>
      <table style="width:100%;border-collapse:collapse;margin-top:12px">${rows}
        <tr><td style="border-top:1px solid #ddd;padding-top:8px"><b>Total</b></td>
        <td align="right" style="border-top:1px solid #ddd;padding-top:8px"><b>${formatIDR(opts.total)}</b></td></tr>
      </table>
      <p style="color:#777;font-size:13px;margin-top:20px">Jiwati — Toko Kesehatan & Nutrisi Alami</p>
    </div>`;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: opts.to,
        subject: `Konfirmasi Pesanan Jiwati #${shortId}`,
        html,
      }),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    // Email is best-effort; never block the order.
  }
}

/** Fetches an order and sends its confirmation (used by payment webhooks). */
export async function sendOrderConfirmationById(orderId: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;
  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("*, items:order_items(name, quantity, price)")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return;

  let to: string | null = order.guest_email ?? null;
  if (!to && order.user_id) {
    const { data } = await admin.auth.admin.getUserById(order.user_id);
    to = data.user?.email ?? null;
  }
  if (!to) return;

  await sendOrderConfirmation({
    to,
    orderId,
    total: Number(order.total),
    items: (order.items ?? []).map((it: Item) => ({
      name: it.name,
      quantity: it.quantity,
      price: Number(it.price),
    })),
  });
}
