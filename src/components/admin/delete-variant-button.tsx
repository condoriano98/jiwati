"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteVariant } from "@/lib/actions/variants";

export function DeleteVariantButton({
  id,
  productId,
  title,
}: {
  id: string;
  productId: string;
  title: string;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => {
        if (confirm(`Hapus varian "${title}"?`))
          startTransition(() => deleteVariant(id, productId));
      }}
      className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" /> {pending ? "…" : "Hapus"}
    </button>
  );
}
