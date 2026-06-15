import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateApiKey, apiError } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { emitEvent } from "@/lib/webhooks";

const PRODUCT_SELECT =
  "id, name, slug, description, price, compare_at_price, stock, sku, images, rating, is_bestseller, is_active, created_at, brand:brands(id,name,slug), variants:product_variants(id,title,options,price,compare_at_price,sku,stock,position,is_active)";

// GET /api/v1/products/:id
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authenticateApiKey(request, "read_products");
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const admin = createAdminClient();
  const { data } = await admin.from("products").select(PRODUCT_SELECT).eq("id", id).maybeSingle();
  if (!data) return apiError("Product not found", 404);
  return NextResponse.json({ product: data });
}

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  price: z.number().nonnegative().optional(),
  compare_at_price: z.number().nonnegative().nullable().optional(),
  stock: z.number().int().nonnegative().optional(),
  sku: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  images: z.array(z.string().url()).optional(),
  is_bestseller: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

// PATCH /api/v1/products/:id
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authenticateApiKey(request, "write_products");
  if (!auth.ok) return auth.response;

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", 400);
  }
  const payload =
    body && typeof body === "object" && "product" in body
      ? (body as { product: unknown }).product
      : body;

  const parsed = updateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`) },
      { status: 422 },
    );
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("products")
    .update(parsed.data)
    .eq("id", id)
    .select(PRODUCT_SELECT)
    .maybeSingle();

  if (error) return apiError(error.message, 500);
  if (!data) return apiError("Product not found", 404);
  await emitEvent("product.updated", data);
  return NextResponse.json({ product: data });
}

// DELETE /api/v1/products/:id
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authenticateApiKey(request, "write_products");
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const admin = createAdminClient();
  const { error } = await admin.from("products").delete().eq("id", id);
  if (error) return apiError(error.message, 500);
  await emitEvent("product.deleted", { id });
  return NextResponse.json({ deleted: true, id });
}
