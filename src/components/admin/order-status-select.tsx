"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "@/lib/actions/admin";
import type { OrderStatus } from "@/lib/types";

const STATUSES: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Menunggu" },
  { value: "paid", label: "Dibayar" },
  { value: "processing", label: "Diproses" },
  { value: "shipped", label: "Dikirim" },
  { value: "completed", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
];

export function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <select
      disabled={pending}
      value={status}
      onChange={(e) =>
        startTransition(() => updateOrderStatus(orderId, e.target.value as OrderStatus))
      }
      className="h-9 rounded-lg border border-border bg-white px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 disabled:opacity-50"
    >
      {STATUSES.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}
