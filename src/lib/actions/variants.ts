"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertAdmin } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  id: z.string().uuid().optional(),
  product_id: z.string().uuid(),
  title: z.string().min(1),
  price: z.coerce.number().nonnegative(),
  compare_at_price: z.coerce.number().nonnegative().optional(),
  sku: z.string().optional(),
  stock: z.coerce.number().int().nonnegative(),
  position: z.coerce.number().int().optional(),
});

/** Create or update a single product variant from the admin form. */
export async function saveVariant(formData: FormData): Promise<void> {
  await assertAdmin();
  const d = schema.parse(Object.fromEntries(formData));
  const admin = createAdminClient();
  const payload = {
    product_id: d.product_id,
    title: d.title,
    price: d.price,
    compare_at_price: d.compare_at_price || null,
    sku: d.sku || null,
    stock: d.stock,
    position: d.position ?? 0,
  };
  if (d.id) {
    await admin.from("product_variants").update(payload).eq("id", d.id);
  } else {
    await admin.from("product_variants").insert(payload);
  }
  revalidatePath(`/admin/produk/${d.product_id}`);
}

export async function deleteVariant(id: string, productId: string): Promise<void> {
  await assertAdmin();
  const admin = createAdminClient();
  await admin.from("product_variants").delete().eq("id", id);
  revalidatePath(`/admin/produk/${productId}`);
}
