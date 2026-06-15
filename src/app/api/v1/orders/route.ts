import { NextResponse } from "next/server";
import { authenticateApiKey, apiError } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/v1/orders?limit=&page=&status=&payment_status=
export async function GET(request: Request) {
  const auth = await authenticateApiKey(request, "read_orders");
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get("limit")) || 20, 100);
  const page = Math.max(Number(url.searchParams.get("page")) || 1, 1);
  const status = url.searchParams.get("status");
  const paymentStatus = url.searchParams.get("payment_status");

  const admin = createAdminClient();
  let query = admin
    .from("orders")
    .select("*, items:order_items(*)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (status) query = query.eq("status", status);
  if (paymentStatus) query = query.eq("payment_status", paymentStatus);

  const { data, count, error } = await query;
  if (error) return apiError(error.message, 500);

  return NextResponse.json({
    orders: data ?? [],
    pagination: { page, limit, total: count ?? 0 },
  });
}
