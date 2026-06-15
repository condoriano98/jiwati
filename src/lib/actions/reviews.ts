"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertAdmin } from "@/lib/auth-guard";

/** Submit a review (pending moderation). Requires an authenticated user. */
export async function createReview(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Silakan masuk untuk menulis ulasan");

  const productId = String(formData.get("product_id"));
  const slug = String(formData.get("product_slug") ?? "");
  const rating = Math.min(5, Math.max(1, Number(formData.get("rating")) || 5));
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  await supabase.from("reviews").insert({
    product_id: productId,
    user_id: user.id,
    author_name: profile?.full_name ?? user.email,
    rating,
    title: title || null,
    body: body || null,
  });

  if (slug) revalidatePath(`/produk/${slug}`);
}

/** Approve or reject a review; recompute the product rating on approval. */
export async function moderateReview(
  id: string,
  status: "approved" | "rejected",
): Promise<void> {
  await assertAdmin();
  const admin = createAdminClient();
  const { data } = await admin
    .from("reviews")
    .update({ status })
    .eq("id", id)
    .select("product_id")
    .maybeSingle();
  if (data?.product_id) {
    await admin.rpc("recompute_product_rating", { p_product: data.product_id });
  }
  revalidatePath("/admin/ulasan");
}
