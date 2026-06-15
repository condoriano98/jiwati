import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isMidtransConfigured, createSnapTransaction } from "@/lib/midtrans";
import { isXenditConfigured, createInvoice } from "@/lib/xendit";
import { validateDiscount } from "@/lib/discounts";
import { emitEvent } from "@/lib/webhooks";
import { sendOrderConfirmation } from "@/lib/email";

const FREE_SHIPPING_THRESHOLD = 300000;
const FLAT_SHIPPING = 20000;
const TAX_RATE = Number(process.env.TAX_RATE) || 0; // e.g. 0.11 for PPN 11%

const schema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        variantId: z.string().uuid().nullable().optional(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
  discountCode: z.string().optional(),
  guestEmail: z.string().email().optional(),
  address: z.object({
    recipient: z.string().min(1),
    phone: z.string().min(1),
    line1: z.string().min(1),
    province: z.string().min(1),
    city: z.string().min(1),
    district: z.string().min(1),
    village: z.string().min(1),
    postal_code: z.string().min(4),
  }),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }
  const { items, address, discountCode: discount, guestEmail } = parsed.data;

  // Either a signed-in user or a guest email is required.
  const email = user?.email ?? guestEmail ?? "";
  if (!user && !guestEmail) {
    return NextResponse.json(
      { error: "Masuk atau masukkan email untuk melanjutkan" },
      { status: 400 },
    );
  }

  // Re-price on the server from the DB — never trust client prices.
  const productIds = [...new Set(items.map((i) => i.productId))];
  const variantIds = items.map((i) => i.variantId).filter(Boolean) as string[];

  const { data: products } = await supabase
    .from("products")
    .select("id, name, price, stock, images")
    .in("id", productIds);
  const productMap = new Map((products ?? []).map((p) => [p.id, p]));

  const variantMap = new Map<string, { id: string; product_id: string; title: string; price: number; stock: number }>();
  if (variantIds.length) {
    const { data: variants } = await supabase
      .from("product_variants")
      .select("id, product_id, title, price, stock")
      .in("id", variantIds);
    for (const v of variants ?? []) variantMap.set(v.id, v);
  }

  let subtotal = 0;
  const orderItems = [];
  for (const i of items) {
    const p = productMap.get(i.productId);
    if (!p) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 400 });
    }
    if (i.variantId) {
      const v = variantMap.get(i.variantId);
      if (!v || v.product_id !== p.id) {
        return NextResponse.json({ error: "Varian tidak ditemukan" }, { status: 400 });
      }
      if (i.quantity > v.stock) {
        return NextResponse.json(
          { error: `Stok ${p.name} (${v.title}) tidak mencukupi` },
          { status: 400 },
        );
      }
      subtotal += v.price * i.quantity;
      orderItems.push({
        product_id: p.id,
        variant_id: v.id,
        variant_title: v.title,
        name: p.name,
        price: v.price,
        quantity: i.quantity,
        image: p.images?.[0] ?? null,
      });
    } else {
      if (i.quantity > p.stock) {
        return NextResponse.json(
          { error: `Stok ${p.name} tidak mencukupi` },
          { status: 400 },
        );
      }
      subtotal += p.price * i.quantity;
      orderItems.push({
        product_id: p.id,
        variant_id: null,
        variant_title: null,
        name: p.name,
        price: p.price,
        quantity: i.quantity,
        image: p.images?.[0] ?? null,
      });
    }
  }

  // Apply a discount code (server-validated against the fresh subtotal).
  let discountAmount = 0;
  let discountCode: string | null = null;
  if (discount) {
    const result = await validateDiscount(discount, subtotal);
    if (!result.valid) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }
    discountAmount = result.amount ?? 0;
    discountCode = result.code ?? null;
  }

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
  const taxBase = Math.max(0, subtotal - discountAmount);
  const tax = Math.round(taxBase * TAX_RATE);
  const total = taxBase + tax + shipping;

  // Create the order via the service role (supports guest orders with no user).
  const orderAdmin = createAdminClient();
  const { data: order, error: orderErr } = await orderAdmin
    .from("orders")
    .insert({
      user_id: user?.id ?? null,
      guest_email: user ? null : guestEmail,
      subtotal,
      discount_code: discountCode,
      discount_amount: discountAmount,
      tax_amount: tax,
      shipping_cost: shipping,
      total,
      shipping_address: address,
    })
    .select()
    .single();

  if (orderErr || !order) {
    return NextResponse.json({ error: "Gagal membuat pesanan" }, { status: 500 });
  }

  await orderAdmin
    .from("order_items")
    .insert(orderItems.map((it) => ({ ...it, order_id: order.id })));

  await emitEvent("order.created", { ...order, items: orderItems });

  const origin = new URL(request.url).origin;

  // Gateway priority: Xendit → Midtrans → simulated (demo).
  // A configured gateway that errors surfaces a real error rather than
  // faking a paid order.
  if (isXenditConfigured()) {
    try {
      const invoice = await createInvoice({
        externalId: order.id,
        amount: total,
        payerEmail: email,
        description: `Pesanan Jiwati #${order.id.slice(0, 8)}`,
        items: [
          ...orderItems.map((it) => ({
            name: it.name,
            quantity: it.quantity,
            price: it.price,
          })),
          ...(shipping > 0
            ? [{ name: "Ongkos Kirim", quantity: 1, price: shipping }]
            : []),
        ],
        successRedirectUrl: `${origin}/checkout/sukses?order=${order.id}`,
        failureRedirectUrl: `${origin}/checkout?gagal=1`,
      });
      await orderAdmin
        .from("orders")
        .update({ midtrans_order_id: invoice.id })
        .eq("id", order.id);
      return NextResponse.json({ redirectUrl: invoice.invoiceUrl });
    } catch {
      return NextResponse.json(
        { error: "Gagal membuat pembayaran. Silakan coba lagi." },
        { status: 502 },
      );
    }
  }

  if (isMidtransConfigured()) {
    try {
      const snap = await createSnapTransaction({
        orderId: order.id,
        grossAmount: total,
        items: [
          ...orderItems.map((it) => ({
            id: it.product_id,
            price: it.price,
            quantity: it.quantity,
            name: it.name.slice(0, 50),
          })),
          { id: "shipping", price: shipping, quantity: 1, name: "Ongkos Kirim" },
        ],
        customer: {
          name: address.recipient,
          email: email,
          phone: address.phone,
        },
      });
      await orderAdmin
        .from("orders")
        .update({ midtrans_order_id: order.id })
        .eq("id", order.id);
      return NextResponse.json({ redirectUrl: snap.redirect_url });
    } catch {
      return NextResponse.json(
        { error: "Gagal membuat pembayaran. Silakan coba lagi." },
        { status: 502 },
      );
    }
  }

  // No gateway configured: simulate a paid order so the demo flow completes.
  const admin = createAdminClient();
  await admin
    .from("orders")
    .update({ status: "paid", payment_status: "paid" })
    .eq("id", order.id);
  await admin.rpc("apply_order_stock", { p_order_id: order.id });
  await sendOrderConfirmation({ to: email, orderId: order.id, total, items: orderItems });

  return NextResponse.json({ redirectUrl: `/checkout/sukses?order=${order.id}` });
}
