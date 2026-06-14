import { NextResponse } from "next/server";
import { z } from "zod";
import { validateDiscount } from "@/lib/discounts";

const schema = z.object({
  code: z.string().min(1),
  subtotal: z.number().nonnegative(),
});

// Public endpoint used by the checkout UI to preview a discount code.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ valid: false, message: "Permintaan tidak valid" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ valid: false, message: "Permintaan tidak valid" }, { status: 400 });
  }
  const result = await validateDiscount(parsed.data.code, parsed.data.subtotal);
  return NextResponse.json(result);
}
