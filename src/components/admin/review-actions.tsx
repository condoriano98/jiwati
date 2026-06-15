"use client";

import { useTransition } from "react";
import { Check, X } from "lucide-react";
import { moderateReview } from "@/lib/actions/reviews";

export function ReviewActions({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex items-center gap-3">
      <button
        disabled={pending}
        onClick={() => startTransition(() => moderateReview(id, "approved"))}
        className="inline-flex items-center gap-1 text-sm font-medium text-green-700 hover:underline disabled:opacity-50"
      >
        <Check className="h-4 w-4" /> Setujui
      </button>
      <button
        disabled={pending}
        onClick={() => startTransition(() => moderateReview(id, "rejected"))}
        className="inline-flex items-center gap-1 text-sm text-red-600 hover:underline disabled:opacity-50"
      >
        <X className="h-4 w-4" /> Tolak
      </button>
    </div>
  );
}
