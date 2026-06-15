import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createAdminClient } from "@/lib/supabase/admin";
import { ReviewActions } from "@/components/admin/review-actions";

export const metadata = { title: "Ulasan" };

const STATUS: Record<string, "warning" | "success" | "danger"> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

export default async function AdminReviewsPage() {
  const admin = createAdminClient();
  const { data: reviews } = await admin
    .from("reviews")
    .select("*, product:products(name, slug)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold tracking-tight">Ulasan Produk</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Setujui ulasan agar tampil di halaman produk. Rating produk dihitung ulang otomatis.
      </p>

      <div className="space-y-3">
        {(reviews ?? []).map((r) => {
          const product = Array.isArray(r.product) ? r.product[0] : r.product;
          return (
            <Card key={r.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} className={`h-4 w-4 ${n <= r.rating ? "fill-accent-400 text-accent-400" : "text-border"}`} />
                      ))}
                    </div>
                    <Badge variant={STATUS[r.status]}>{r.status}</Badge>
                  </div>
                  <p className="mt-1 text-sm font-medium">
                    {r.author_name ?? "Pelanggan"} · {product?.name ?? "—"}
                  </p>
                  {r.title && <p className="mt-1 font-semibold">{r.title}</p>}
                  {r.body && <p className="mt-0.5 text-sm text-muted-foreground">{r.body}</p>}
                </div>
                {r.status === "pending" && <ReviewActions id={r.id} />}
              </div>
            </Card>
          );
        })}
        {(!reviews || reviews.length === 0) && (
          <Card className="p-12 text-center text-muted-foreground">Belum ada ulasan.</Card>
        )}
      </div>
    </div>
  );
}
