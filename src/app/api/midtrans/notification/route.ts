import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { emitEvent } from "@/lib/webhooks";

// Midtrans server-to-server payment notification webhook.
export async function POST(request: Request) {
  const body = await request.json();
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  }

  const { order_id, status_code, gross_amount, signature_key, transaction_status, fraud_status } = body;

  // Verify the signature so we only trust genuine Midtrans callbacks.
  const expected = crypto
    .createHash("sha512")
    .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
    .digest("hex");
  if (expected !== signature_key) {
    return NextResponse.json({ error: "invalid signature" }, { status: 403 });
  }

  let status: string | null = null;
  let paymentStatus: string | null = null;

  if (transaction_status === "capture" || transaction_status === "settlement") {
    if (fraud_status === "challenge") {
      status = "pending";
      paymentStatus = "unpaid";
    } else {
      status = "paid";
      paymentStatus = "paid";
    }
  } else if (["cancel", "deny", "expire"].includes(transaction_status)) {
    status = "cancelled";
    paymentStatus = "failed";
  } else if (transaction_status === "pending") {
    status = "pending";
    paymentStatus = "unpaid";
  }

  if (status) {
    const admin = createAdminClient();
    await admin
      .from("orders")
      .update({ status, payment_status: paymentStatus })
      .eq("id", order_id);
    // Decrement inventory once the order is confirmed paid.
    if (paymentStatus === "paid") {
      await admin.rpc("apply_order_stock", { p_order_id: order_id });
      await emitEvent("order.paid", { id: order_id });
    }
  }

  return NextResponse.json({ received: true });
}
