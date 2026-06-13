"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertAdmin } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";

/** Shape of one row coming from the CSV importer. */
const importRowSchema = z.object({
  name: z.string().min(1),
  price: z.coerce.number().nonnegative(),
  compare_at_price: z.coerce.number().nonnegative().optional().nullable(),
  stock: z.coerce.number().int().nonnegative().default(0),
  sku: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  image: z.string().url().optional().nullable().or(z.literal("")),
  is_bestseller: z.coerce.boolean().optional().default(false),
});

export type ImportRow = z.input<typeof importRowSchema>;

export type ImportResult = {
  inserted: number;
  updated: number;
  errors: { row: number; message: string }[];
};

/**
 * Bulk-imports products from parsed CSV rows. Creates brands/categories
 * on the fly (matched by slug) and upserts products by slug.
 */
export async function importProducts(rows: ImportRow[]): Promise<ImportResult> {
  await assertAdmin();
  const supabase = createAdminClient();
  const result: ImportResult = { inserted: 0, updated: 0, errors: [] };

  // Caches so we don't re-query brands/categories per row.
  const brandCache = new Map<string, string>();
  const categoryCache = new Map<string, string>();

  async function resolveBrand(name: string): Promise<string> {
    const slug = slugify(name);
    if (brandCache.has(slug)) return brandCache.get(slug)!;
    const { data: existing } = await supabase
      .from("brands")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    let id = existing?.id;
    if (!id) {
      const { data } = await supabase
        .from("brands")
        .insert({ name, slug })
        .select("id")
        .single();
      id = data!.id;
    }
    brandCache.set(slug, id!);
    return id!;
  }

  async function resolveCategory(name: string): Promise<string> {
    const slug = slugify(name);
    if (categoryCache.has(slug)) return categoryCache.get(slug)!;
    const { data: existing } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    let id = existing?.id;
    if (!id) {
      const { data } = await supabase
        .from("categories")
        .insert({ name, slug })
        .select("id")
        .single();
      id = data!.id;
    }
    categoryCache.set(slug, id!);
    return id!;
  }

  for (let i = 0; i < rows.length; i++) {
    const parsed = importRowSchema.safeParse(rows[i]);
    if (!parsed.success) {
      result.errors.push({
        row: i + 2, // +2: header row + 1-indexed
        message: parsed.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "),
      });
      continue;
    }
    const row = parsed.data;
    const slug = slugify(row.name);

    try {
      const brandId = row.brand ? await resolveBrand(row.brand) : null;

      const { data: existing } = await supabase
        .from("products")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      const payload = {
        name: row.name,
        slug,
        description: row.description || null,
        price: row.price,
        compare_at_price: row.compare_at_price || null,
        stock: row.stock,
        sku: row.sku || null,
        brand_id: brandId,
        images: row.image ? [row.image] : [],
        is_bestseller: row.is_bestseller ?? false,
        is_active: true,
      };

      let productId: string;
      if (existing) {
        await supabase.from("products").update(payload).eq("id", existing.id);
        productId = existing.id;
        result.updated++;
      } else {
        const { data } = await supabase
          .from("products")
          .insert(payload)
          .select("id")
          .single();
        productId = data!.id;
        result.inserted++;
      }

      if (row.category) {
        const categoryId = await resolveCategory(row.category);
        await supabase
          .from("product_categories")
          .upsert({ product_id: productId, category_id: categoryId });
      }
    } catch (e) {
      result.errors.push({
        row: i + 2,
        message: e instanceof Error ? e.message : "Gagal menyimpan",
      });
    }
  }

  revalidatePath("/admin/produk");
  revalidatePath("/produk");
  return result;
}

const productSchema = z.object({
  name: z.string().min(1),
  price: z.coerce.number().nonnegative(),
  compare_at_price: z.coerce.number().nonnegative().optional(),
  stock: z.coerce.number().int().nonnegative(),
  sku: z.string().optional(),
  brand: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  is_bestseller: z.coerce.boolean().optional(),
});

/** Create or update a single product from the admin form. */
export async function saveProduct(formData: FormData): Promise<void> {
  const parsed = productSchema.parse(Object.fromEntries(formData));
  await importProducts([parsed as ImportRow]);
}

export async function deleteProduct(id: string): Promise<void> {
  await assertAdmin();
  const supabase = createAdminClient();
  await supabase.from("products").delete().eq("id", id);
  revalidatePath("/admin/produk");
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<void> {
  await assertAdmin();
  const supabase = createAdminClient();
  await supabase.from("orders").update({ status }).eq("id", orderId);
  revalidatePath("/admin/pesanan");
}
