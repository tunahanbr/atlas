import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

import { processDueLeadNotificationJobs } from "@/server/notification-jobs";

export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization") ?? "";
  const supplied = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!secret || !safeEqual(secret, supplied)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await processDueLeadNotificationJobs());
}

function safeEqual(expected: string, actual: string) {
  const left = Buffer.from(expected);
  const right = Buffer.from(actual);
  return left.length === right.length && timingSafeEqual(left, right);
}
