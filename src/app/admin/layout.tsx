import Link from "next/link";
import { LayoutDashboard, Package, Upload, ShoppingBag, Store, Leaf, KeyRound, Tag, Webhook } from "lucide-react";
import { requireAdmin } from "@/lib/auth-guard";

const NAV = [
  { href: "/admin", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/admin/produk", label: "Produk", icon: Package },
  { href: "/admin/produk/import", label: "Import Produk", icon: Upload },
  { href: "/admin/pesanan", label: "Pesanan", icon: ShoppingBag },
  { href: "/admin/diskon", label: "Diskon", icon: Tag },
  { href: "/admin/api", label: "API & Integrasi", icon: KeyRound },
  { href: "/admin/webhook", label: "Webhook", icon: Webhook },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
      <aside className="hidden w-56 shrink-0 md:block">
        <div className="sticky top-24 space-y-1">
          <div className="mb-4 flex items-center gap-2 px-3 font-bold text-brand-700">
            <Leaf className="h-5 w-5" /> Admin Panel
          </div>
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-brand-50 hover:text-brand-700"
            >
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          ))}
          <Link
            href="/"
            className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
          >
            <Store className="h-4 w-4" /> Lihat Toko
          </Link>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="flex-1">
        <div className="mb-4 flex gap-1 overflow-x-auto md:hidden">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="flex items-center gap-2 whitespace-nowrap rounded-lg border border-border px-3 py-2 text-sm"
            >
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          ))}
        </div>
        {children}
      </div>
    </div>
  );
}
