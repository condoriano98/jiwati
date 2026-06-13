"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

const OPTIONS = [
  { value: "newest", label: "Terbaru" },
  { value: "price-asc", label: "Harga: Termurah" },
  { value: "price-desc", label: "Harga: Termahal" },
  { value: "rating", label: "Rating Tertinggi" },
];

export function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function onChange(value: string) {
    const next = new URLSearchParams(params.toString());
    if (value === "newest") next.delete("sort");
    else next.set("sort", value);
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <select
      value={params.get("sort") ?? "newest"}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 rounded-lg border border-border bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
