import { RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Kebijakan Pengembalian" };

const SECTIONS = [
  {
    title: "1. Ketentuan Umum",
    body: "Kami ingin Anda puas berbelanja di Jiwati. Jika produk yang Anda terima rusak, cacat, salah kirim, atau tidak sesuai pesanan, Anda berhak mengajukan pengembalian barang (retur) atau pengembalian dana (refund) sesuai ketentuan di bawah ini.",
  },
  {
    title: "2. Batas Waktu Pengajuan",
    body: "Pengajuan pengembalian harus dilakukan maksimal 3 (tiga) hari kalender sejak pesanan diterima. Pengajuan yang melewati batas waktu ini tidak dapat kami proses.",
  },
  {
    title: "3. Syarat Produk yang Dapat Dikembalikan",
    body: "Produk masih dalam kondisi asli, belum dibuka/digunakan, segel tidak rusak, lengkap dengan kemasan, label, dan bukti pembelian. Produk suplemen dan makanan yang segelnya telah dibuka tidak dapat dikembalikan karena alasan kebersihan dan keamanan, kecuali terbukti cacat produksi.",
  },
  {
    title: "4. Produk yang Tidak Dapat Dikembalikan",
    body: "Produk yang dibeli saat promo/clearance, produk yang telah dibuka atau digunakan sebagian, serta produk yang rusak akibat kelalaian pelanggan tidak memenuhi syarat pengembalian.",
  },
  {
    title: "5. Proses Pengembalian Dana",
    body: "Setelah barang retur kami terima dan lolos pemeriksaan (1–3 hari kerja), dana akan dikembalikan ke metode pembayaran awal Anda. Proses pengembalian dana memakan waktu 3–14 hari kerja tergantung penyedia pembayaran (bank/e-wallet). Ongkos kirim awal tidak dikembalikan kecuali kesalahan berasal dari pihak kami.",
  },
  {
    title: "6. Cara Mengajukan",
    body: "Hubungi tim kami melalui WhatsApp atau email di halaman Kontak dengan menyertakan nomor pesanan, foto produk, dan alasan pengembalian. Tim kami akan memandu langkah selanjutnya.",
  },
];

export default function RefundPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
          <RefreshCw className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Kebijakan Pengembalian</h1>
          <p className="text-sm text-muted-foreground">Retur barang & pengembalian dana</p>
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
        Kebijakan ini dapat berubah sewaktu-waktu. Terakhir diperbarui: {new Date().getFullYear()}.
      </p>
    </div>
  );
}
