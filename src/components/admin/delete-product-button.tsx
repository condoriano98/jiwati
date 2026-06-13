"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteProduct } from "@/lib/actions/admin";

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => {
        if (confirm(`Hapus produk "${name}"?`)) {
          startTransition(() => deleteProduct(id));
        }
      }}
      className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" /> {pending ? "…" : "Hapus"}
    </button>
  );
}
