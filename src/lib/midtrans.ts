// Thin Midtrans Snap helper. Works against the Sandbox by default.
// If credentials are missing, callers should fall back to a simulated flow.

export function isMidtransConfigured() {
  return Boolean(process.env.MIDTRANS_SERVER_KEY);
}

type SnapItem = { id: string; price: number; quantity: number; name: string };

type SnapParams = {
  orderId: string;
  grossAmount: number;
  items: SnapItem[];
  customer: { name: string; email: string; phone: string };
};

/**
 * Creates a Snap transaction and returns the redirect URL the customer
 * should be sent to. Throws if Midtrans is not configured.
 */
export async function createSnapTransaction(
  params: SnapParams,
): Promise<{ token: string; redirect_url: string }> {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) throw new Error("Midtrans is not configured");

  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
  const baseUrl = isProduction
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";

  // Midtrans Snap items must sum exactly to gross_amount; we send line items.
  const res = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`,
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: params.orderId,
        gross_amount: params.grossAmount,
      },
      item_details: params.items,
      customer_details: {
        first_name: params.customer.name,
        email: params.customer.email,
        phone: params.customer.phone,
      },
      credit_card: { secure: true },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Midtrans error ${res.status}: ${body}`);
  }
  return res.json();
}
