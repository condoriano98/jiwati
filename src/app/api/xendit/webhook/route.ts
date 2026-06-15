import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { emitEvent } from "@/lib/webhooks";

// Xendit invoice callback. Configure this URL in the Xendit dashboard
// (Settings → Webhooks → Invoices) and set XENDIT_CALLBACK_TOKEN.
export async function POST(request: Request) {
  const expectedToken = process.env.XENDIT_CALLBACK_TOKEN;
  if (!expectedToken) {
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  }

  // Xendit signs callbacks with a static token header.
  const token = request.headers.get("x-callback-token");
  if (token !== expectedToken) {
    return NextResponse.json({ error: "invalid token" }, { status: 403 });
  }

  const body = await request.json();
  const { external_id, status } = body as { external_id?: string; status?: string };
  if (!external_id) {
    return NextResponse.json({ error: "missing external_id" }, { status: 400 });
  }

  let orderStatus: string | null = null;
  let paymentStatus: string | null = null;

  switch (status) {
    case "PAID":
    case "SETTLED":
      orderStatus = "paid";
      paymentStatus = "paid";
      break;
    case "EXPIRED":
      orderStatus = "cancelled";
      paymentStatus = "failed";
      break;
    default:
      // PENDING and others: leave the order untouched.
      break;
  }

  if (orderStatus) {
    const admin = createAdminClient();
    await admin
      .from("orders")
      .update({ status: orderStatus, payment_status: paymentStatus })
      .eq("id", external_id);
    // Decrement inventory once the order is confirmed paid.
    if (paymentStatus === "paid") {
      await admin.rpc("apply_order_stock", { p_order_id: external_id });
      await emitEvent("order.paid", { id: external_id });
    }
  }

  return NextResponse.json({ received: true });
}
