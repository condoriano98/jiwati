"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toggleDiscount, deleteDiscount } from "@/lib/actions/discounts";

export function DiscountActions({ id, active }: { id: string; active: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex items-center gap-4">
      <button
        disabled={pending}
        onClick={() => startTransition(() => toggleDiscount(id, !active))}
        className="text-sm font-medium text-brand-700 hover:underline disabled:opacity-50"
      >
        {active ? "Nonaktifkan" : "Aktifkan"}
      </button>
      <button
        disabled={pending}
        onClick={() => {
          if (confirm("Hapus kode diskon ini?")) startTransition(() => deleteDiscount(id));
        }}
        className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" /> Hapus
      </button>
    </div>
  );
}
