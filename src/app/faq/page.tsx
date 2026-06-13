import { Card } from "@/components/ui/card";

export const metadata = { title: "Bantuan / FAQ" };

const FAQS = [
  {
    q: "Bagaimana cara memesan?",
    a: "Pilih produk, tambahkan ke keranjang, lalu lanjutkan ke checkout dan isi alamat pengiriman serta lakukan pembayaran.",
  },
  {
    q: "Metode pembayaran apa saja yang tersedia?",
    a: "Kami menerima pembayaran melalui transfer bank, e-wallet (GoPay, ShopeePay), serta kartu kredit melalui gateway pembayaran yang aman.",
  },
  {
    q: "Berapa lama pengiriman?",
    a: "Pengiriman umumnya memakan waktu 1–3 hari kerja untuk wilayah Jabodetabek dan 3–7 hari untuk luar kota.",
  },
  {
    q: "Apakah ada gratis ongkir?",
    a: "Ya! Gratis ongkir berlaku untuk pembelian di atas Rp300.000.",
  },
  {
    q: "Apakah produk dijamin original?",
    a: "Tentu. Semua produk yang kami jual 100% original dan bersumber dari distributor resmi.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight">Bantuan / FAQ</h1>
      <p className="mt-2 text-muted-foreground">Pertanyaan yang sering diajukan.</p>
      <div className="mt-8 space-y-3">
        {FAQS.map((f) => (
          <Card key={f.q} className="p-5">
            <h2 className="font-semibold">{f.q}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{f.a}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
