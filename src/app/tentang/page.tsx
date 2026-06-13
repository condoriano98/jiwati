export const metadata = { title: "Tentang Kami" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight">Tentang Jiwati</h1>
      <div className="prose mt-6 space-y-4 text-muted-foreground">
        <p>
          Jiwati adalah toko kesehatan dan nutrisi alami yang berkomitmen
          menghadirkan produk-produk berkualitas untuk mendukung gaya hidup sehat
          masyarakat Indonesia.
        </p>
        <p>
          Sejak awal, kami percaya bahwa kesehatan dimulai dari nutrisi yang tepat.
          Karena itu, kami mengkurasi vitamin, suplemen, protein, dan produk herbal
          alami terbaik dari brand-brand terpercaya.
        </p>
        <p>
          Misi kami sederhana: membuat hidup sehat menjadi lebih mudah dan
          terjangkau untuk semua orang.
        </p>
      </div>
    </div>
  );
}
