import { ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Kebijakan Privasi" };

const SECTIONS = [
  {
    title: "1. Pendahuluan",
    body: "Jiwati menghargai privasi Anda. Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi data pribadi Anda saat menggunakan situs dan layanan kami.",
  },
  {
    title: "2. Data yang Kami Kumpulkan",
    body: "Kami mengumpulkan data yang Anda berikan secara langsung — seperti nama, email, nomor telepon, dan alamat pengiriman saat mendaftar atau memesan — serta data teknis (alamat IP, jenis perangkat, dan aktivitas penjelajahan) secara otomatis melalui cookie.",
  },
  {
    title: "3. Cara Kami Menggunakan Data",
    body: "Data Anda digunakan untuk memproses pesanan dan pembayaran, mengirimkan produk, memberi dukungan pelanggan, mengirim konfirmasi dan pembaruan pesanan, serta — jika Anda berlangganan — mengirim informasi promosi. Kami tidak menjual data pribadi Anda kepada pihak ketiga.",
  },
  {
    title: "4. Berbagi Data dengan Pihak Ketiga",
    body: "Kami membagikan data seperlunya kepada mitra tepercaya untuk menjalankan layanan: penyedia pembayaran (mis. Xendit/Midtrans), jasa pengiriman, dan penyedia infrastruktur (mis. Supabase, Vercel). Mereka hanya memproses data sesuai instruksi kami dan wajib menjaga kerahasiaannya.",
  },
  {
    title: "5. Keamanan Data",
    body: "Kami menerapkan langkah keamanan teknis dan organisasi yang wajar, termasuk enkripsi dan kontrol akses berbasis peran, untuk melindungi data Anda. Kata sandi disimpan secara ter-hash dan tidak dapat kami baca.",
  },
  {
    title: "6. Cookie",
    body: "Situs kami menggunakan cookie untuk menjaga sesi login, mengingat isi keranjang, dan menganalisis penggunaan. Anda dapat menonaktifkan cookie melalui pengaturan browser, namun sebagian fitur mungkin tidak berfungsi optimal.",
  },
  {
    title: "7. Hak Anda",
    body: "Anda berhak mengakses, memperbarui, atau meminta penghapusan data pribadi Anda, serta berhenti berlangganan komunikasi promosi kapan saja. Untuk mengajukan permintaan, hubungi kami melalui halaman Kontak.",
  },
  {
    title: "8. Penyimpanan Data",
    body: "Kami menyimpan data pribadi selama diperlukan untuk tujuan yang dijelaskan dalam kebijakan ini atau selama diwajibkan oleh hukum yang berlaku, setelah itu data akan dihapus atau dianonimkan.",
  },
  {
    title: "9. Perubahan Kebijakan",
    body: "Kebijakan ini dapat kami perbarui dari waktu ke waktu. Perubahan penting akan diinformasikan melalui situs. Penggunaan layanan setelah perubahan berarti Anda menyetujui kebijakan yang diperbarui.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Kebijakan Privasi</h1>
          <p className="text-sm text-muted-foreground">Bagaimana kami melindungi data Anda</p>
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
