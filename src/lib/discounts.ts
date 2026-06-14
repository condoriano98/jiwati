import { createAdminClient } from "@/lib/supabase/admin";
import { formatIDR } from "@/lib/utils";

export type DiscountResult = {
  valid: boolean;
  message: string;
  code?: string;
  amount?: number;
};

/**
 * Validates a discount code against a subtotal and computes the discount
 * amount. Server-only (reads via service role; discounts are RLS-protected).
 */
export async function validateDiscount(
  rawCode: string,
  subtotal: number,
): Promise<DiscountResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { valid: false, message: "Masukkan kode diskon" };

  const admin = createAdminClient();
  const { data: d } = await admin
    .from("discounts")
    .select("*")
    .ilike("code", code)
    .maybeSingle();

  if (!d || !d.active) return { valid: false, message: "Kode tidak valid" };

  const now = Date.now();
  if (d.starts_at && new Date(d.starts_at).getTime() > now)
    return { valid: false, message: "Kode belum aktif" };
  if (d.ends_at && new Date(d.ends_at).getTime() < now)
    return { valid: false, message: "Kode sudah kedaluwarsa" };
  if (d.usage_limit != null && d.used_count >= d.usage_limit)
    return { valid: false, message: "Kode sudah habis terpakai" };
  if (subtotal < Number(d.min_subtotal))
    return {
      valid: false,
      message: `Minimum belanja ${formatIDR(Number(d.min_subtotal))}`,
    };

  let amount =
    d.type === "percentage"
      ? Math.round((subtotal * Number(d.value)) / 100)
      : Number(d.value);
  amount = Math.min(amount, subtotal);

  return { valid: true, message: "Kode diterapkan", code: d.code, amount };
}
