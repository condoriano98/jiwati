import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateApiKey, apiError } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";

const PRODUCT_SELECT =
  "id, name, slug, description, price, compare_at_price, stock, sku, images, rating, is_bestseller, is_active, created_at, brand:brands(id,name,slug)";

// GET /api/v1/products?limit=&page=&search=&active=
export async function GET(request: Request) {
  const auth = await authenticateApiKey(request);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get("limit")) || 20, 100);
  const page = Math.max(Number(url.searchParams.get("page")) || 1, 1);
  const search = url.searchParams.get("search");
  const active = url.searchParams.get("active");

  const admin = createAdminClient();
  let query = admin
    .from("products")
    .select(PRODUCT_SELECT, { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (search) query = query.ilike("name", `%${search}%`);
  if (active === "true") query = query.eq("is_active", true);
  if (active === "false") query = query.eq("is_active", false);

  const { data, count, error } = await query;
  if (error) return apiError(error.message, 500);

  return NextResponse.json({
    products: data ?? [],
    pagination: { page, limit, total: count ?? 0 },
  });
}

const createSchema = z.object({
  name: z.string().min(1),
  price: z.number().nonnegative(),
  compare_at_price: z.number().nonnegative().nullable().optional(),
  stock: z.number().int().nonnegative().default(0),
  sku: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  images: z.array(z.string().url()).optional(),
  brand: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  is_bestseller: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

// POST /api/v1/products
export async function POST(request: Request) {
  const auth = await authenticateApiKey(request);
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", 400);
  }

  // Accept either a bare object or { product: {...} } (Shopify-style).
  const payload =
    body && typeof body === "object" && "product" in body
      ? (body as { product: unknown }).product
      : body;

  const parsed = createSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`) },
      { status: 422 },
    );
  }
  const p = parsed.data;
  const admin = createAdminClient();

  // Resolve brand / category by slug (create if missing).
  let brandId: string | null = null;
  if (p.brand) {
    const slug = slugify(p.brand);
    const { data: b } = await admin.from("brands").select("id").eq("slug", slug).maybeSingle();
    brandId = b?.id ?? (await admin.from("brands").insert({ name: p.brand, slug }).select("id").single()).data!.id;
  }

  const slug = slugify(p.name);
  const { data: existing } = await admin.from("products").select("id").eq("slug", slug).maybeSingle();
  if (existing) {
    return apiError(`A product with slug "${slug}" already exists`, 409);
  }

  const { data: product, error } = await admin
    .from("products")
    .insert({
      name: p.name,
      slug,
      description: p.description ?? null,
      price: p.price,
      compare_at_price: p.compare_at_price ?? null,
      stock: p.stock,
      sku: p.sku ?? null,
      brand_id: brandId,
      images: p.images ?? [],
      is_bestseller: p.is_bestseller ?? false,
      is_active: p.is_active ?? true,
    })
    .select(PRODUCT_SELECT)
    .single();

  if (error) return apiError(error.message, 500);

  if (p.category) {
    const cslug = slugify(p.category);
    const { data: c } = await admin.from("categories").select("id").eq("slug", cslug).maybeSingle();
    const categoryId = c?.id ?? (await admin.from("categories").insert({ name: p.category, slug: cslug }).select("id").single()).data!.id;
    await admin.from("product_categories").upsert({ product_id: product.id, category_id: categoryId });
  }

  return NextResponse.json({ product }, { status: 201 });
}
