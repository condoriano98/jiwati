import Link from "next/link";
import { Leaf, Search, User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/queries";
import { CartButton } from "./cart-button";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const categories = await getCategories();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur">
      {/* Promo bar */}
      <div className="bg-brand-700 py-1.5 text-center text-xs font-medium text-white">
        Gratis ongkir untuk pembelian di atas Rp300.000 • Belanja sehat setiap hari 🌿
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-brand-700">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Leaf className="h-5 w-5" />
          </span>
          <span className="text-lg tracking-tight">Natural Farm</span>
        </Link>

        {/* Search */}
        <form action="/produk" className="relative hidden flex-1 md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="search"
            placeholder="Cari produk, vitamin, suplemen…"
            className="h-10 w-full rounded-full border border-border bg-muted pl-10 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          />
        </form>

        <nav className="ml-auto flex items-center gap-1">
          <Link
            href={user ? "/akun" : "/masuk"}
            className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-brand-700 hover:bg-brand-50"
          >
            <User className="h-5 w-5" />
            <span className="hidden lg:inline">{user ? "Akun" : "Masuk"}</span>
          </Link>
          <CartButton />
        </nav>
      </div>

      {/* Category nav */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-2 text-sm">
          <Link
            href="/produk"
            className="whitespace-nowrap rounded-full px-3 py-1.5 font-semibold text-brand-700 hover:bg-brand-50"
          >
            Semua Produk
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/kategori/${c.slug}`}
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-muted-foreground hover:bg-brand-50 hover:text-brand-700"
            >
              {c.name}
            </Link>
          ))}
          <Link
            href="/blog"
            className="whitespace-nowrap rounded-full px-3 py-1.5 text-muted-foreground hover:bg-brand-50 hover:text-brand-700"
          >
            Blog
          </Link>
        </div>
      </div>
    </header>
  );
}
