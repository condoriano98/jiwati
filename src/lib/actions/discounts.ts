"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertAdmin } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  code: z.string().min(1),
  type: z.enum(["percentage", "fixed"]),
  value: z.coerce.number().positive(),
  min_subtotal: z.coerce.number().nonnegative().default(0),
  usage_limit: z.coerce.number().int().positive().optional(),
  ends_at: z.string().optional(),
});

export async function createDiscount(formData: FormData): Promise<void> {
  await assertAdmin();
  const d = schema.parse(Object.fromEntries(formData));
  const admin = createAdminClient();
  await admin.from("discounts").insert({
    code: d.code.trim().toUpperCase(),
    type: d.type,
    value: d.value,
    min_subtotal: d.min_subtotal,
    usage_limit: d.usage_limit ?? null,
    ends_at: d.ends_at ? new Date(d.ends_at).toISOString() : null,
  });
  revalidatePath("/admin/diskon");
}

export async function toggleDiscount(id: string, active: boolean): Promise<void> {
  await assertAdmin();
  const admin = createAdminClient();
  await admin.from("discounts").update({ active }).eq("id", id);
  revalidatePath("/admin/diskon");
}

export async function deleteDiscount(id: string): Promise<void> {
  await assertAdmin();
  const admin = createAdminClient();
  await admin.from("discounts").delete().eq("id", id);
  revalidatePath("/admin/diskon");
}
