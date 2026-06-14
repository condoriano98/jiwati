"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart, lineKey } from "@/lib/cart-store";
import { formatIDR } from "@/lib/utils";

const FREE_SHIPPING_THRESHOLD = 300000;
const FLAT_SHIPPING = 20000;

export default function CartPage() {
  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const subtotal = lines.reduce((n, l) => n + l.price * l.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <ShoppingBag className="h-16 w-16 text-brand-300" />
        <h1 className="mt-4 text-xl font-bold">Keranjang Anda kosong</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Yuk mulai belanja produk sehat pilihan kami.
        </p>
        <Button asChild className="mt-6">
          <Link href="/produk">Mulai Belanja</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Keranjang Belanja</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {lines.map((l) => (
            <Card key={lineKey(l)} className="flex gap-4 p-3">
              <Link
                href={`/produk/${l.slug}`}
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted"
              >
                {l.image && (
                  <Image src={l.image} alt={l.name} fill sizes="96px" className="object-cover" />
                )}
              </Link>
              <div className="flex flex-1 flex-col">
                <Link href={`/produk/${l.slug}`} className="font-semibold leading-snug hover:text-brand-700">
                  {l.name}
                </Link>
                {l.variantTitle && (
                  <span className="text-xs text-muted-foreground">{l.variantTitle}</span>
                )}
                <span className="text-sm font-bold text-brand-700">{formatIDR(l.price)}</span>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex h-9 items-center rounded-lg border border-border">
                    <button onClick={() => setQty(lineKey(l), l.quantity - 1)} className="px-3 text-muted-foreground hover:text-brand-700">−</button>
                    <span className="w-8 text-center text-sm font-semibold">{l.quantity}</span>
                    <button onClick={() => setQty(lineKey(l), l.quantity + 1)} className="px-3 text-muted-foreground hover:text-brand-700">+</button>
                  </div>
                  <button
                    onClick={() => remove(lineKey(l))}
                    className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" /> Hapus
                  </button>
                </div>
              </div>
              <div className="hidden shrink-0 text-right font-bold sm:block">
                {formatIDR(l.price * l.quantity)}
              </div>
            </Card>
          ))}
        </div>

        <Card className="h-fit p-5">
          <h2 className="mb-4 font-bold">Ringkasan Pesanan</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-medium">{formatIDR(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Ongkos kirim</dt>
              <dd className="font-medium">{shipping === 0 ? "Gratis" : formatIDR(shipping)}</dd>
            </div>
            {subtotal < FREE_SHIPPING_THRESHOLD && (
              <p className="text-xs text-brand-600">
                Belanja {formatIDR(FREE_SHIPPING_THRESHOLD - subtotal)} lagi untuk gratis ongkir!
              </p>
            )}
            <div className="flex justify-between border-t border-border pt-3 text-base font-bold">
              <dt>Total</dt>
              <dd className="text-brand-700">{formatIDR(subtotal + shipping)}</dd>
            </div>
          </dl>
          <Button asChild className="mt-5 w-full" size="lg">
            <Link href="/checkout">
              Lanjut ke Pembayaran <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </Card>
      </div>
    </div>
  );
}
