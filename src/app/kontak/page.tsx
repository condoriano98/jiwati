import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Kontak" };

export default function ContactPage() {
  const items = [
    { icon: Phone, title: "Telepon", value: "+62 812 3456 7890" },
    { icon: MessageCircle, title: "WhatsApp", value: "+62 812 3456 7890" },
    { icon: Mail, title: "Email", value: "halo@jiwati.id" },
    { icon: MapPin, title: "Alamat", value: "Jakarta, Indonesia" },
  ];
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight">Hubungi Kami</h1>
      <p className="mt-2 text-muted-foreground">
        Tim kami siap membantu Anda setiap hari pukul 08.00–20.00 WIB.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {items.map((it) => (
          <Card key={it.title} className="flex items-center gap-4 p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
              <it.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">{it.title}</p>
              <p className="text-sm text-muted-foreground">{it.value}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
