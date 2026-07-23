import Link from "next/link";
import { Leaf, Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-brand-900 text-brand-100">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-bold text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600">
              <Leaf className="h-5 w-5" />
            </span>
            Jiwati
          </div>
          <p className="mt-3 text-sm text-brand-200">
            Toko kesehatan & nutrisi alami terpercaya. Produk pilihan untuk
            hidup yang lebih sehat.
          </p>
        </div>

        <div>
          <h4 className="mb-3 font-semibold text-white">Belanja</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/produk" className="hover:text-white">Semua Produk</Link></li>
            <li><Link href="/kategori/vitamin-imun" className="hover:text-white">Vitamin & Imun</Link></li>
            <li><Link href="/kategori/herbal-alami" className="hover:text-white">Herbal & Alami</Link></li>
            <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-semibold text-white">Perusahaan</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/tentang" className="hover:text-white">Tentang Kami</Link></li>
            <li><Link href="/kontak" className="hover:text-white">Kontak</Link></li>
            <li><Link href="/faq" className="hover:text-white">Bantuan / FAQ</Link></li>
            <li><Link href="/pengembalian" className="hover:text-white">Kebijakan Pengembalian</Link></li>
            <li><Link href="/syarat-ketentuan" className="hover:text-white">Syarat &amp; Ketentuan</Link></li>
            <li><Link href="/privasi" className="hover:text-white">Kebijakan Privasi</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-semibold text-white">Hubungi Kami</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +62 812 3456 7890</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> halo@jiwati.id</li>
            <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4" /> Jakarta, Indonesia</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-brand-800 py-4 text-center text-xs text-brand-300">
        © {new Date().getFullYear()} Jiwati. Demo store dibangun dengan
        Next.js & Supabase.
      </div>
    </footer>
  );
}
