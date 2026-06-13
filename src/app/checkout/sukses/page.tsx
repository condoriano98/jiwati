import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClearCartOnMount } from "./clear-cart";

export const metadata = { title: "Pesanan Berhasil" };

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <ClearCartOnMount />
      <CheckCircle2 className="h-16 w-16 text-brand-500" />
      <h1 className="mt-4 text-2xl font-bold">Pesanan Berhasil!</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Terima kasih telah berbelanja di Natural Farm. Pesanan Anda sedang kami proses.
      </p>
      {order && (
        <p className="mt-1 font-mono text-xs text-muted-foreground">
          No. Pesanan: #{order.slice(0, 8)}
        </p>
      )}
      <div className="mt-6 flex gap-3">
        <Button asChild variant="outline">
          <Link href="/produk">Lanjut Belanja</Link>
        </Button>
        <Button asChild>
          <Link href="/akun">Lihat Pesanan</Link>
        </Button>
      </div>
    </div>
  );
}
