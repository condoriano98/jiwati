// Xendit payment gateway helper (Invoices API).
// Docs: https://docs.xendit.co/api-reference/#create-invoice

export function isXenditConfigured() {
  return Boolean(process.env.XENDIT_SECRET_KEY);
}

type InvoiceItem = { name: string; quantity: number; price: number };

type InvoiceParams = {
  externalId: string;
  amount: number;
  payerEmail: string;
  description: string;
  items: InvoiceItem[];
  successRedirectUrl: string;
  failureRedirectUrl: string;
};

/**
 * Creates a Xendit hosted invoice and returns the URL to redirect the
 * customer to for payment. Throws if Xendit is not configured.
 */
export async function createInvoice(
  params: InvoiceParams,
): Promise<{ id: string; invoiceUrl: string }> {
  const secret = process.env.XENDIT_SECRET_KEY;
  if (!secret) throw new Error("Xendit is not configured");

  const res = await fetch("https://api.xendit.co/v2/invoices", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Basic auth: secret key as username, empty password.
      Authorization: `Basic ${Buffer.from(`${secret}:`).toString("base64")}`,
    },
    body: JSON.stringify({
      external_id: params.externalId,
      amount: params.amount,
      currency: "IDR",
      payer_email: params.payerEmail || undefined,
      description: params.description,
      success_redirect_url: params.successRedirectUrl,
      failure_redirect_url: params.failureRedirectUrl,
      items: params.items.map((i) => ({
        name: i.name.slice(0, 256),
        quantity: i.quantity,
        price: i.price,
      })),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Xendit error ${res.status}: ${body}`);
  }
  const data = await res.json();
  return { id: data.id, invoiceUrl: data.invoice_url };
}
