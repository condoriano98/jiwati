"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-store";

export function CartButton() {
  const count = useCart((s) => s.lines.reduce((n, l) => n + l.quantity, 0));
  // Avoid hydration mismatch: only show the badge after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Link
      href="/keranjang"
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-brand-700 hover:bg-brand-50"
      aria-label="Keranjang"
    >
      <ShoppingCart className="h-5 w-5" />
      {mounted && count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1 text-xs font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
