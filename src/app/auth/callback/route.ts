import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const requestedNext = request.nextUrl.searchParams.get("next");
  const next = requestedNext?.startsWith("/") && !requestedNext.startsWith("//")
    ? requestedNext
    : "/app";
  if (!code) return NextResponse.redirect(new URL("/login?error=callback", request.url));

  const supabase = await createSupabaseServerClient();
  const { error } = supabase
    ? await supabase.auth.exchangeCodeForSession(code)
    : { error: new Error("Supabase is not configured") };
  return NextResponse.redirect(new URL(error ? "/login?error=callback" : next, request.url));
}
