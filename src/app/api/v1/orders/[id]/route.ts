import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateApiKey, apiError } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/v1/orders/:id
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authenticateApiKey(request, "read_orders");
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const admin = createAdminClient();
  const { data } = await admin
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("id", id)
    .maybeSingle();
  if (!data) return apiError("Order not found", 404);
  return NextResponse.json({ order: data });
}

const updateSchema = z.object({
  status: z
    .enum(["pending", "paid", "processing", "shipped", "completed", "cancelled"])
    .optional(),
  payment_status: z.enum(["unpaid", "paid", "failed"]).optional(),
});

// PATCH /api/v1/orders/:id — update fulfilment / payment status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authenticateApiKey(request, "write_orders");
  if (!auth.ok) return auth.response;

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", 400);
  }
  const payload =
    body && typeof body === "object" && "order" in body
      ? (body as { order: unknown }).order
      : body;

  const parsed = updateSchema.safeParse(payload);
  if (!parsed.success || Object.keys(parsed.data).length === 0) {
    return apiError("Provide status and/or payment_status", 422);
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .update(parsed.data)
    .eq("id", id)
    .select("*, items:order_items(*)")
    .maybeSingle();

  if (error) return apiError(error.message, 500);
  if (!data) return apiError("Order not found", 404);
  return NextResponse.json({ order: data });
}
