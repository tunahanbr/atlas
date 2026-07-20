import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { platformHostname, requestHostname } from "@/lib/domains";
import { db } from "@/server/db";

export async function proxy(request: NextRequest) {
  const hostname = requestHostname(
    request.headers.get("x-forwarded-host") ?? request.headers.get("host"),
  );
  if (!hostname || hostname === platformHostname() || hostname === "localhost") {
    return refreshAuth(request, nextWithoutCustomHost(request));
  }
  if (request.nextUrl.pathname !== "/" && !request.nextUrl.pathname.startsWith("/work/")) {
    return refreshAuth(request, nextWithoutCustomHost(request));
  }

  const domain = await db.customDomain.findUnique({
    where: { hostname },
    select: { status: true, profile: { select: { username: true } } },
  });
  if (!domain || domain.status !== "VERIFIED") {
    return process.env.NODE_ENV === "production"
      ? new NextResponse("Domain not configured", { status: 404 })
      : refreshAuth(request, nextWithoutCustomHost(request));
  }

  const url = request.nextUrl.clone();
  url.pathname =
    request.nextUrl.pathname === "/"
      ? `/${domain.profile.username}`
      : `/${domain.profile.username}${request.nextUrl.pathname}`;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-atlas-custom-host", hostname);

  return refreshAuth(request, NextResponse.rewrite(url, { request: { headers: requestHeaders } }));
}

async function refreshAuth(request: NextRequest, response: NextResponse) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !key) return response;
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookies) {
        for (const cookie of cookies) {
          request.cookies.set(cookie.name, cookie.value);
          response.cookies.set(cookie.name, cookie.value, cookie.options);
        }
      },
    },
  });
  await supabase.auth.getUser();
  return response;
}

function nextWithoutCustomHost(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete("x-atlas-custom-host");
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
