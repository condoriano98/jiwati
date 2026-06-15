"use client";

import { useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { createReview } from "@/lib/actions/reviews";

export function ReviewForm({
  productId,
  slug,
  signedIn,
}: {
  productId: string;
  slug: string;
  signedIn: boolean;
}) {
  const [rating, setRating] = useState(5);
  const [sent, setSent] = useState(false);

  if (!signedIn) {
    return (
      <p className="text-sm text-muted-foreground">
        <Link href="/masuk" className="font-semibold text-brand-700 hover:underline">
          Masuk
        </Link>{" "}
        untuk menulis ulasan.
      </p>
    );
  }

  if (sent) {
    return (
      <p className="rounded-lg bg-brand-50 p-3 text-sm text-brand-700">
        Terima kasih! Ulasan Anda akan tampil setelah disetujui.
      </p>
    );
  }

  return (
    <form
      action={async (fd) => {
        await createReview(fd);
        setSent(true);
      }}
      className="space-y-3"
    >
      <input type="hidden" name="product_id" value={productId} />
      <input type="hidden" name="product_slug" value={slug} />
      <input type="hidden" name="rating" value={rating} />
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            aria-label={`${n} bintang`}
          >
            <Star
              className={`h-6 w-6 ${
                n <= rating ? "fill-accent-400 text-accent-400" : "text-border"
              }`}
            />
          </button>
        ))}
      </div>
      <Input name="title" placeholder="Judul ulasan (opsional)" />
      <Textarea name="body" placeholder="Bagaimana pengalaman Anda dengan produk ini?" rows={3} />
      <Button type="submit">Kirim Ulasan</Button>
    </form>
  );
}
