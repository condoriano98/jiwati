"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useCart, lineKey } from "@/lib/cart-store";
import { createClient } from "@/lib/supabase/client";
import { formatIDR } from "@/lib/utils";
import {
  IndonesiaAddress,
  type IndonesiaAddressValue,
} from "@/components/checkout/indonesia-address";

const FREE_SHIPPING_THRESHOLD = 300000;
const FLAT_SHIPPING = 20000;
const TAX_RATE = Number(process.env.NEXT_PUBLIC_TAX_RATE) || 0;

export default function CheckoutPage() {
  const router = useRouter();
  const lines = useCart((s) => s.lines);
  const subtotal = lines.reduce((n, l) => n + l.price * l.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;

  const [authChecked, setAuthChecked] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Discount code
  const [codeInput, setCodeInput] = useState("");
  const [applying, setApplying] = useState(false);
  const [discount, setDiscount] = useState<{ code: string; amount: number } | null>(null);
  const [discountMsg, setDiscountMsg] = useState<string | null>(null);
  const discountAmount = discount?.amount ?? 0;

  async function applyCode() {
    setApplying(true);
    setDiscountMsg(null);
    const res = await fetch("/api/discounts/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: codeInput, subtotal }),
    });
    const data = await res.json();
    if (data.valid) {
      setDiscount({ code: data.code, amount: data.amount });
      setDiscountMsg(data.message);
    } else {
      setDiscount(null);
      setDiscountMsg(data.message ?? "Kode tidak valid");
    }
    setApplying(false);
  }
  const [form, setForm] = useState({ recipient: "", phone: "" });
  const [guestEmail, setGuestEmail] = useState("");
  const taxBase = Math.max(0, subtotal - (discountAmount ?? 0));
  const tax = Math.round(taxBase * TAX_RATE);
  const [region, setRegion] = useState<IndonesiaAddressValue>({
    province: "",
    city: "",
    district: "",
    village: "",
    postal_code: "",
    line1: "",
  });
  const handleRegionChange = useCallback(
    (v: IndonesiaAddressValue) => setRegion(v),
    [],
  );

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        setSignedIn(Boolean(data.user));
        setAuthChecked(true);
      });
    // Surface a message when the payment gateway redirects back on failure.
    if (new URLSearchParams(window.location.search).get("gagal") === "1") {
      setError("Pembayaran dibatalkan atau gagal. Silakan coba lagi.");
    }
  }, []);

  function update(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: lines.map((l) => ({
          productId: l.productId,
          variantId: l.variantId ?? null,
          quantity: l.quantity,
        })),
        discountCode: discount?.code,
        guestEmail: signedIn ? undefined : guestEmail,
        address: { ...form, ...region },
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Terjadi kesalahan");
      setSubmitting(false);
      return;
    }
    if (data.redirectUrl?.startsWith("http")) {
      window.location.href = data.redirectUrl;
    } else {
      router.push(data.redirectUrl);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-muted-foreground">Keranjang Anda kosong.</p>
        <Button asChild className="mt-4">
          <Link href="/produk">Mulai Belanja</Link>
        </Button>
      </div>
    );
  }


  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Checkout</h1>
      <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-3">
        <Card className="space-y-4 p-6 lg:col-span-2">
          {authChecked && !signedIn && (
            <div className="space-y-1.5 rounded-lg bg-muted/50 p-3">
              <Label htmlFor="guestEmail">Email (checkout sebagai tamu)</Label>
              <Input
                id="guestEmail"
                type="email"
                required
                placeholder="email@contoh.com"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Sudah punya akun?{" "}
                <Link href="/masuk" className="font-semibold text-brand-700 hover:underline">
                  Masuk
                </Link>{" "}
                untuk menyimpan riwayat pesanan.
              </p>
            </div>
          )}
          <h2 className="font-bold">Alamat Pengiriman</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="recipient">Nama Penerima</Label>
              <Input id="recipient" required value={form.recipient} onChange={update("recipient")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">No. Telepon</Label>
              <Input
                id="phone"
                type="tel"
                required
                placeholder="cth. 08123456789"
                value={form.phone}
                onChange={update("phone")}
              />
            </div>
          </div>
          <IndonesiaAddress onChange={handleRegionChange} />
        </Card>

        <Card className="h-fit p-6">
          <h2 className="mb-4 font-bold">Ringkasan</h2>
          <div className="space-y-2 text-sm">
            {lines.map((l) => (
              <div key={lineKey(l)} className="flex justify-between">
                <span className="text-muted-foreground">
                  {l.quantity} × {l.name}
                  {l.variantTitle ? ` (${l.variantTitle})` : ""}
                </span>
                <span>{formatIDR(l.price * l.quantity)}</span>
              </div>
            ))}

            {/* Discount code */}
            <div className="border-t border-border pt-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Kode diskon"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                  className="h-9"
                />
                <Button type="button" variant="outline" size="sm" onClick={applyCode} disabled={applying || !codeInput}>
                  {applying ? "…" : "Terapkan"}
                </Button>
              </div>
              {discountMsg && (
                <p className={`mt-1 text-xs ${discount ? "text-green-600" : "text-red-600"}`}>
                  {discountMsg}
                </p>
              )}
            </div>

            <div className="flex justify-between border-t border-border pt-2">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatIDR(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Diskon ({discount?.code})</span>
                <span>−{formatIDR(discountAmount)}</span>
              </div>
            )}
            {tax > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">PPN</span>
                <span>{formatIDR(tax)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ongkir</span>
              <span>{shipping === 0 ? "Gratis" : formatIDR(shipping)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
              <span>Total</span>
              <span className="text-brand-700">{formatIDR(taxBase + tax + shipping)}</span>
            </div>
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <Button type="submit" size="lg" className="mt-5 w-full" disabled={submitting}>
            {submitting ? "Memproses…" : "Bayar Sekarang"}
          </Button>
        </Card>
      </form>
    </div>
  );
}
