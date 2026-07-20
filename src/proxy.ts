import { NextResponse, type NextRequest } from "next/server";

import { platformHostname, requestHostname } from "@/lib/domains";
import { db } from "@/server/db";

export async function proxy(request: NextRequest) {
  const hostname = requestHostname(
    request.headers.get("x-forwarded-host") ?? request.headers.get("host"),
  );
  if (!hostname || hostname === platformHostname() || hostname === "localhost") {
    return nextWithoutCustomHost(request);
  }

  const domain = await db.customDomain.findUnique({
    where: { hostname },
    select: { status: true, profile: { select: { username: true } } },
  });
  if (!domain || domain.status !== "VERIFIED") {
    return process.env.NODE_ENV === "production"
      ? new NextResponse("Domain not configured", { status: 404 })
      : nextWithoutCustomHost(request);
  }

  const url = request.nextUrl.clone();
  url.pathname =
    request.nextUrl.pathname === "/"
      ? `/${domain.profile.username}`
      : `/${domain.profile.username}${request.nextUrl.pathname}`;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-atlas-custom-host", hostname);

  return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
}

function nextWithoutCustomHost(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete("x-atlas-custom-host");
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/", "/work/:path*"],
};
