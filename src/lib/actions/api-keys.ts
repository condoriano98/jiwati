"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateToken } from "@/lib/api-auth";

/**
 * Creates a new API key. Returns the full token ONCE — it is never stored
 * in plaintext, so the caller must surface it to the user immediately.
 */
export async function createApiKey(name: string): Promise<{ token: string }> {
  await assertAdmin();
  const clean = name.trim() || "Untitled key";
  const { token, hash, prefix } = generateToken();

  const admin = createAdminClient();
  const { error } = await admin
    .from("api_keys")
    .insert({ name: clean, token_hash: hash, prefix });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/api");
  return { token };
}

export async function revokeApiKey(id: string): Promise<void> {
  await assertAdmin();
  const admin = createAdminClient();
  await admin.from("api_keys").update({ revoked: true }).eq("id", id);
  revalidatePath("/admin/api");
}
