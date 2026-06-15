"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";

/** Registers a webhook endpoint. Returns the signing secret ONCE. */
export async function createWebhook(
  url: string,
  events: string[],
): Promise<{ secret: string }> {
  await assertAdmin();
  if (!url || events.length === 0) throw new Error("URL dan minimal satu event diperlukan");
  const secret = `whsec_${crypto.randomBytes(24).toString("hex")}`;
  const admin = createAdminClient();
  const { error } = await admin
    .from("webhook_endpoints")
    .insert({ url, events, secret });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/webhook");
  return { secret };
}

export async function toggleWebhook(id: string, active: boolean): Promise<void> {
  await assertAdmin();
  const admin = createAdminClient();
  await admin.from("webhook_endpoints").update({ active }).eq("id", id);
  revalidatePath("/admin/webhook");
}

export async function deleteWebhook(id: string): Promise<void> {
  await assertAdmin();
  const admin = createAdminClient();
  await admin.from("webhook_endpoints").delete().eq("id", id);
  revalidatePath("/admin/webhook");
}
