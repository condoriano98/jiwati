import { FileText } from "lucide-react";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Syarat & Ketentuan" };

const SECTIONS = [
  {
    title: "1. Penerimaan Syarat",
    body: "Dengan mengakses dan menggunakan situs Jiwati serta melakukan pembelian, Anda dianggap telah membaca, memahami, dan menyetujui seluruh syarat dan ketentuan ini. Jika Anda tidak setuju, mohon untuk tidak menggunakan layanan kami.",
  },
  {
    title: "2. Akun Pengguna",
    body: "Anda bertanggung jawab menjaga kerahasiaan data akun dan kata sandi. Setiap aktivitas yang terjadi melalui akun Anda menjadi tanggung jawab Anda. Segera hubungi kami jika Anda mencurigai adanya penggunaan akun tanpa izin.",
  },
  {
    title: "3. Produk & Harga",
    body: "Kami berupaya menampilkan informasi produk, gambar, dan harga seakurat mungkin. Namun kami tidak menjamin bebas dari kesalahan penulisan. Harga dapat berubah sewaktu-waktu tanpa pemberitahuan sebelumnya. Ketersediaan stok bersifat terbatas.",
  },
  {
    title: "4. Produk Kesehatan",
    body: "Produk suplemen dan nutrisi yang kami jual bukan pengganti obat. Informasi pada situs ini bersifat umum dan tidak dimaksudkan sebagai nasihat medis. Konsultasikan dengan dokter atau tenaga kesehatan sebelum mengonsumsi, terutama jika Anda hamil, menyusui, atau memiliki kondisi medis tertentu.",
  },
  {
    title: "5. Pemesanan & Pembayaran",
    body: "Pesanan dianggap sah setelah pembayaran diterima dan terverifikasi melalui gateway pembayaran resmi kami. Kami berhak menolak atau membatalkan pesanan yang mencurigakan, melanggar ketentuan, atau karena kesalahan harga/stok.",
  },
  {
    title: "6. Pengiriman",
    body: "Estimasi waktu pengiriman bersifat perkiraan dan dapat dipengaruhi oleh faktor di luar kendali kami (cuaca, kurir, hari libur). Risiko kehilangan atau kerusakan beralih kepada Anda setelah produk diserahkan ke jasa pengiriman.",
  },
  {
    title: "7. Hak Kekayaan Intelektual",
    body: "Seluruh konten pada situs ini — termasuk logo, teks, gambar, dan desain — adalah milik Jiwati dan dilindungi hukum. Dilarang menggunakan, menyalin, atau mendistribusikan tanpa izin tertulis.",
  },
  {
    title: "8. Batasan Tanggung Jawab",
    body: "Jiwati tidak bertanggung jawab atas kerugian tidak langsung yang timbul dari penggunaan produk atau layanan, sepanjang diizinkan oleh hukum yang berlaku.",
  },
  {
    title: "9. Hukum yang Berlaku",
    body: "Syarat dan ketentuan ini tunduk pada hukum Republik Indonesia. Setiap sengketa akan diselesaikan secara musyawarah, atau melalui jalur hukum yang berlaku apabila diperlukan.",
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
          <FileText className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Syarat & Ketentuan</h1>
          <p className="text-sm text-muted-foreground">Ketentuan penggunaan layanan Jiwati</p>
        </div>
      </div>

      <div className="space-y-4">
        {SECTIONS.map((s) => (
          <Card key={s.title} className="p-5">
            <h2 className="font-bold text-brand-800">{s.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </Card>
        ))}
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Terakhir diperbarui: {new Date().getFullYear()}.
      </p>
    </div>
  );
}
