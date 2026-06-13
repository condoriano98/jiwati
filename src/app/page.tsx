import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Truck, ShieldCheck, Headphones, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { getCategories, getProducts } from "@/lib/queries";

export default async function HomePage() {
  const [categories, bestsellers] = await Promise.all([
    getCategories(),
    getProducts({ bestseller: true, limit: 8 }),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-50 to-brand-100">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 md:grid-cols-2 md:py-20">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-700 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" /> #1 Toko Nutrisi Alami
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-brand-900 md:text-5xl">
              Hidup Sehat Dimulai dari Nutrisi yang Tepat
            </h1>
            <p className="mt-4 max-w-md text-muted-foreground">
              Temukan vitamin, suplemen, protein, dan produk herbal alami
              pilihan untuk mendukung gaya hidup sehat Anda setiap hari.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/produk">
                  Belanja Sekarang <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/kategori/vitamin-imun">Lihat Vitamin</Link>
              </Button>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-lg">
            <Image
              src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=70"
              alt="Produk sehat alami"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-b border-border bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 md:grid-cols-4">
          {[
            { icon: Truck, title: "Gratis Ongkir", desc: "Min. belanja Rp300rb" },
            { icon: ShieldCheck, title: "100% Original", desc: "Produk terjamin asli" },
            { icon: Headphones, title: "Bantuan 24/7", desc: "Tim siap membantu" },
            { icon: Sparkles, title: "Pilihan Terbaik", desc: "Kurasi ahli nutrisi" },
          ].map((b) => (
            <div key={b.title} className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                <b.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">{b.title}</p>
                <p className="text-xs text-muted-foreground">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Shop by goal */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Belanja per Tujuan</h2>
            <p className="text-sm text-muted-foreground">Pilih sesuai kebutuhan kesehatanmu</p>
          </div>
          <Link href="/produk" className="text-sm font-semibold text-brand-700 hover:underline">
            Lihat semua
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/kategori/${c.slug}`}
              className="group overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-square bg-muted">
                {c.image && (
                  <Image
                    src={c.image}
                    alt={c.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 16vw"
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                )}
              </div>
              <div className="p-3 text-center text-sm font-semibold text-brand-800">
                {c.name}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Bestsellers */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Produk Terlaris</h2>
            <p className="text-sm text-muted-foreground">Paling banyak dibeli pelanggan</p>
          </div>
          <Link href="/produk" className="text-sm font-semibold text-brand-700 hover:underline">
            Lihat semua
          </Link>
        </div>
        {bestsellers.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {bestsellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Belum ada produk. Tambahkan lewat dashboard admin.
          </p>
        )}
      </section>

      {/* Newsletter */}
      <section className="bg-brand-700">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-12 text-center text-white">
          <h2 className="text-2xl font-bold">Dapatkan Tips Sehat & Promo Spesial</h2>
          <p className="max-w-md text-sm text-brand-100">
            Berlangganan newsletter kami dan jadilah yang pertama tahu produk baru
            serta penawaran menarik.
          </p>
          <form className="flex w-full max-w-md gap-2">
            <input
              type="email"
              required
              placeholder="Masukkan email Anda"
              className="h-11 flex-1 rounded-lg px-4 text-sm text-foreground focus-visible:outline-none"
            />
            <Button type="submit" variant="accent" size="lg">
              Langganan
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
