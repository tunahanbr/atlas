import { after, NextResponse } from "next/server";
import { z } from "zod";

import { ANALYTICS_EVENTS } from "@/lib/analytics";
import { usernameSchema } from "@/lib/validations";
import { isSameOrigin } from "@/lib/http-origin";
import { db } from "@/server/db";
import { recordAnalyticsEvent } from "@/server/analytics";

const eventSchema = z.object({
  username: usernameSchema,
  event: z.enum(ANALYTICS_EVENTS),
  pageKey: z.string().trim().min(1).max(160),
});

function clientAddress(request: Request): string {
  return request.headers.get("cf-connecting-ip")?.trim()
    || request.headers.get("x-real-ip")?.trim()
    || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || `unknown:${request.headers.get("user-agent")?.slice(0, 160) ?? "client"}`;
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > 1024) {
    return NextResponse.json({ ok: false }, { status: 413 });
  }
  const origin = request.headers.get("origin");
  const requestHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!isSameOrigin(origin, requestHost)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  let value: unknown;
  try {
    const body = await request.text();
    if (new TextEncoder().encode(body).byteLength > 1024) {
      return NextResponse.json({ ok: false }, { status: 413 });
    }
    value = JSON.parse(body);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const parsed = eventSchema.safeParse(value);
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  const profile = await db.profile.findUnique({
    where: { username: parsed.data.username },
    select: { id: true },
  });
  if (!profile) return NextResponse.json({ ok: false }, { status: 404 });

  const address = clientAddress(request);
  after(() => recordAnalyticsEvent(profile.id, parsed.data.event, parsed.data.pageKey, address));
  return new NextResponse(null, { status: 202 });
}
