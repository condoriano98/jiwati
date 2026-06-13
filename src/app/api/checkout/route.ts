import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isMidtransConfigured, createSnapTransaction } from "@/lib/midtrans";
import { isXenditConfigured, createInvoice } from "@/lib/xendit";

const FREE_SHIPPING_THRESHOLD = 300000;
const FLAT_SHIPPING = 20000;

const schema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
  address: z.object({
    recipient: z.string().min(1),
    phone: z.string().min(1),
    line1: z.string().min(1),
    city: z.string().min(1),
    province: z.string().min(1),
    postal_code: z.string().min(1),
  }),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Silakan masuk terlebih dahulu" }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }
  const { items, address } = parsed.data;

  // Re-price on the server from the DB — never trust client prices.
  const { data: products } = await supabase
    .from("products")
    .select("id, name, price, stock, images")
    .in("id", items.map((i) => i.productId));

  if (!products || products.length !== items.length) {
    return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 400 });
  }

  let subtotal = 0;
  const orderItems = [];
  for (const i of items) {
    const p = products.find((x) => x.id === i.productId)!;
    if (i.quantity > p.stock) {
      return NextResponse.json(
        { error: `Stok ${p.name} tidak mencukupi` },
        { status: 400 },
      );
    }
    subtotal += p.price * i.quantity;
    orderItems.push({
      product_id: p.id,
      name: p.name,
      price: p.price,
      quantity: i.quantity,
      image: p.images?.[0] ?? null,
    });
  }

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
  const total = subtotal + shipping;

  // Create the order (RLS ensures user_id matches the caller).
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      subtotal,
      shipping_cost: shipping,
      total,
      shipping_address: address,
    })
    .select()
    .single();

  if (orderErr || !order) {
    return NextResponse.json({ error: "Gagal membuat pesanan" }, { status: 500 });
  }

  await supabase
    .from("order_items")
    .insert(orderItems.map((it) => ({ ...it, order_id: order.id })));

  const origin = new URL(request.url).origin;

  // Gateway priority: Xendit → Midtrans → simulated (demo).
  // A configured gateway that errors surfaces a real error rather than
  // faking a paid order.
  if (isXenditConfigured()) {
    try {
      const invoice = await createInvoice({
        externalId: order.id,
        amount: total,
        payerEmail: user.email ?? "",
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
      await supabase
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
          email: user.email ?? "",
          phone: address.phone,
        },
      });
      await supabase
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

  return NextResponse.json({ redirectUrl: `/checkout/sukses?order=${order.id}` });
}
