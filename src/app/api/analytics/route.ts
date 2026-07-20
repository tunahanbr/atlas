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
});

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

  after(() => recordAnalyticsEvent(profile.id, parsed.data.event));
  return new NextResponse(null, { status: 202 });
}
