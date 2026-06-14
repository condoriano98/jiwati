import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateApiKey, apiError } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";

const updateSchema = z.object({
  value: z.number().positive().optional(),
  min_subtotal: z.number().nonnegative().optional(),
  usage_limit: z.number().int().positive().nullable().optional(),
  ends_at: z.string().nullable().optional(),
  active: z.boolean().optional(),
});

// PATCH /api/v1/discounts/:id
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authenticateApiKey(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;
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

  const parsed = updateSchema.safeParse(payload);
  if (!parsed.success || Object.keys(parsed.data).length === 0) {
    return apiError("Provide at least one field to update", 422);
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("discounts")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) return apiError(error.message, 500);
  if (!data) return apiError("Discount not found", 404);
  return NextResponse.json({ discount: data });
}

// DELETE /api/v1/discounts/:id
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authenticateApiKey(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const admin = createAdminClient();
  const { error } = await admin.from("discounts").delete().eq("id", id);
  if (error) return apiError(error.message, 500);
  return NextResponse.json({ deleted: true, id });
}
