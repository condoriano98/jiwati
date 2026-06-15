import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateApiKey, apiError } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";

const TOPICS = [
  "order.created",
  "order.paid",
  "product.created",
  "product.updated",
  "product.deleted",
] as const;

const updateSchema = z.object({
  url: z.string().url().optional(),
  events: z.array(z.enum(TOPICS)).min(1).optional(),
  active: z.boolean().optional(),
});

// PATCH /api/v1/webhooks/:id
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authenticateApiKey(request, "manage_webhooks");
  if (!auth.ok) return auth.response;

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", 400);
  }
  const payload =
    body && typeof body === "object" && "webhook" in body
      ? (body as { webhook: unknown }).webhook
      : body;

  const parsed = updateSchema.safeParse(payload);
  if (!parsed.success || Object.keys(parsed.data).length === 0) {
    return apiError("Provide at least one field to update", 422);
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("webhook_endpoints")
    .update(parsed.data)
    .eq("id", id)
    .select("id, url, events, active, created_at")
    .maybeSingle();
  if (error) return apiError(error.message, 500);
  if (!data) return apiError("Webhook not found", 404);
  return NextResponse.json({ webhook: data });
}

// DELETE /api/v1/webhooks/:id
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authenticateApiKey(request, "manage_webhooks");
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const admin = createAdminClient();
  const { error } = await admin.from("webhook_endpoints").delete().eq("id", id);
  if (error) return apiError(error.message, 500);
  return NextResponse.json({ deleted: true, id });
}
