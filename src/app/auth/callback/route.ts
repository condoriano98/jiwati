import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// OAuth (Google) redirect target. Exchanges the auth code for a session
// cookie, then sends the user on to their account.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/akun";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/masuk?error=oauth`);
}
