import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateApiKey, apiError } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/v1/discounts
export async function GET(request: Request) {
  const auth = await authenticateApiKey(request, "read_discounts");
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get("limit")) || 50, 100);
  const page = Math.max(Number(url.searchParams.get("page")) || 1, 1);

  const admin = createAdminClient();
  const { data, count, error } = await admin
    .from("discounts")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);
  if (error) return apiError(error.message, 500);

  return NextResponse.json({
    discounts: data ?? [],
    pagination: { page, limit, total: count ?? 0 },
  });
}

const createSchema = z.object({
  code: z.string().min(1),
  type: z.enum(["percentage", "fixed"]),
  value: z.number().positive(),
  min_subtotal: z.number().nonnegative().optional(),
  usage_limit: z.number().int().positive().nullable().optional(),
  starts_at: z.string().nullable().optional(),
  ends_at: z.string().nullable().optional(),
  active: z.boolean().optional(),
});

// POST /api/v1/discounts
export async function POST(request: Request) {
  const auth = await authenticateApiKey(request, "write_discounts");
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", 400);
  }
  const payload =
    body && typeof body === "object" && "discount" in body
      ? (body as { discount: unknown }).discount
      : body;

  const parsed = createSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`) },
      { status: 422 },
    );
  }
  const d = parsed.data;
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("discounts")
    .insert({
      code: d.code.trim().toUpperCase(),
      type: d.type,
      value: d.value,
      min_subtotal: d.min_subtotal ?? 0,
      usage_limit: d.usage_limit ?? null,
      starts_at: d.starts_at ?? null,
      ends_at: d.ends_at ?? null,
      active: d.active ?? true,
    })
    .select()
    .single();

  if (error) return apiError(error.message, error.code === "23505" ? 409 : 500);
  return NextResponse.json({ discount: data }, { status: 201 });
}
