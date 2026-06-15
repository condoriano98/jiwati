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
  | { ok: true; keyId: string; scopes: string[] }
  | { ok: false; response: NextResponse };

// Fixed-window rate limit per key (best-effort; window is per-key in the DB).
const RATE_LIMIT = 120;
const RATE_WINDOW_SECONDS = 60;

/**
 * Authenticates a request against the api_keys table. Accepts the token via
 * `Authorization: Bearer <token>` or the `X-API-Key` header — Shopify-style.
 * Enforces an optional scope and a per-key rate limit.
 */
export async function authenticateApiKey(
  request: Request,
  requiredScope?: string,
): Promise<AuthResult> {
  const header = request.headers.get("authorization");
  let token = request.headers.get("x-api-key") ?? "";
  if (!token && header?.startsWith("Bearer ")) token = header.slice(7).trim();

  if (!token) {
    return { ok: false, response: apiError("Missing API key", 401) };
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("api_keys")
    .select("id, revoked, scopes")
    .eq("token_hash", hashToken(token))
    .maybeSingle();

  if (!data || data.revoked) {
    return { ok: false, response: apiError("Invalid or revoked API key", 401) };
  }

  const scopes: string[] = data.scopes ?? [];

  // Rate limit (atomic fixed window in Postgres).
  const { data: allowed } = await admin.rpc("check_rate_limit", {
    p_key_id: data.id,
    p_limit: RATE_LIMIT,
    p_window: RATE_WINDOW_SECONDS,
  });
  if (allowed === false) {
    return {
      ok: false,
      response: apiError(`Rate limit exceeded (${RATE_LIMIT}/${RATE_WINDOW_SECONDS}s)`, 429),
    };
  }

  // Scope enforcement (keys with "all" pass any check).
  if (requiredScope && !scopes.includes("all") && !scopes.includes(requiredScope)) {
    return {
      ok: false,
      response: apiError(`This key is missing the "${requiredScope}" scope`, 403),
    };
  }

  // Best-effort "last used" timestamp; don't block the request on it.
  void admin
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", data.id);

  return { ok: true, keyId: data.id, scopes };
}

export function apiError(message: string, status: number) {
  return NextResponse.json({ errors: [message] }, { status });
}
