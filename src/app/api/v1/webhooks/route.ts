import crypto from "crypto";
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

// GET /api/v1/webhooks
export async function GET(request: Request) {
  const auth = await authenticateApiKey(request, "manage_webhooks");
  if (!auth.ok) return auth.response;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("webhook_endpoints")
    .select("id, url, events, active, created_at")
    .order("created_at", { ascending: false });
  if (error) return apiError(error.message, 500);
  return NextResponse.json({ webhooks: data ?? [] });
}

const createSchema = z.object({
  url: z.string().url(),
  events: z.array(z.enum(TOPICS)).min(1),
  active: z.boolean().optional(),
});

// POST /api/v1/webhooks
export async function POST(request: Request) {
  const auth = await authenticateApiKey(request, "manage_webhooks");
  if (!auth.ok) return auth.response;

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

  const parsed = createSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`) },
      { status: 422 },
    );
  }

  const secret = `whsec_${crypto.randomBytes(24).toString("hex")}`;
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("webhook_endpoints")
    .insert({
      url: parsed.data.url,
      events: parsed.data.events,
      active: parsed.data.active ?? true,
      secret,
    })
    .select("id, url, events, active, secret, created_at")
    .single();

  if (error) return apiError(error.message, 500);
  // Secret returned once so the caller can verify signatures.
  return NextResponse.json({ webhook: data }, { status: 201 });
}
