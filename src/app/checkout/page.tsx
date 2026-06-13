"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useCart } from "@/lib/cart-store";
import { createClient } from "@/lib/supabase/client";
import { formatIDR } from "@/lib/utils";
import {
  IndonesiaAddress,
  type IndonesiaAddressValue,
} from "@/components/checkout/indonesia-address";

const FREE_SHIPPING_THRESHOLD = 300000;
const FLAT_SHIPPING = 20000;

export default function CheckoutPage() {
  const router = useRouter();
  const lines = useCart((s) => s.lines);
  const subtotal = lines.reduce((n, l) => n + l.price * l.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;

  const [authChecked, setAuthChecked] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ recipient: "", phone: "" });
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
        items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
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

  if (authChecked && !signedIn) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-xl font-bold">Masuk untuk Melanjutkan</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Anda perlu masuk ke akun untuk menyelesaikan pesanan.
        </p>
        <Button asChild className="mt-4">
          <Link href="/masuk">Masuk</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Checkout</h1>
      <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-3">
        <Card className="space-y-4 p-6 lg:col-span-2">
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
              <div key={l.productId} className="flex justify-between">
                <span className="text-muted-foreground">{l.quantity} × {l.name}</span>
                <span>{formatIDR(l.price * l.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-border pt-2">
              <span className="text-muted-foreground">Ongkir</span>
              <span>{shipping === 0 ? "Gratis" : formatIDR(shipping)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
              <span>Total</span>
              <span className="text-brand-700">{formatIDR(subtotal + shipping)}</span>
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
