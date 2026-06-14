import crypto from "crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/** Generates a new API token + its stored hash and display prefix. */
export function generateToken(): { token: string; hash: string; prefix: string } {
  const token = `jw_live_${crypto.randomBytes(24).toString("hex")}`;
  return { token, hash: hashToken(token), prefix: token.slice(0, 16) };
}

type AuthResult =
  | { ok: true; keyId: string }
  | { ok: false; response: NextResponse };

/**
 * Authenticates a request against the api_keys table. Accepts the token via
 * `Authorization: Bearer <token>` or the `X-API-Key` header — Shopify-style.
 */
export async function authenticateApiKey(request: Request): Promise<AuthResult> {
  const header = request.headers.get("authorization");
  let token = request.headers.get("x-api-key") ?? "";
  if (!token && header?.startsWith("Bearer ")) token = header.slice(7).trim();

  if (!token) {
    return { ok: false, response: apiError("Missing API key", 401) };
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("api_keys")
    .select("id, revoked")
    .eq("token_hash", hashToken(token))
    .maybeSingle();

  if (!data || data.revoked) {
    return { ok: false, response: apiError("Invalid or revoked API key", 401) };
  }

  // Best-effort "last used" timestamp; don't block the request on it.
  void admin
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", data.id);

  return { ok: true, keyId: data.id };
}

export function apiError(message: string, status: number) {
  return NextResponse.json({ errors: [message] }, { status });
}
