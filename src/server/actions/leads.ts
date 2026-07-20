"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";

import { db } from "@/server/db";
import { leadSchema, type LeadInput } from "@/lib/validations";

const CLIENT_LIMIT_PER_HOUR = 5;
const PROFILE_LIMIT_PER_HOUR = 50;
const RATE_LIMIT_RETENTION_MS = 24 * 60 * 60 * 1000;

export type LeadFormState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; errors: Record<string, string[]> };

export async function submitLead(
  _prev: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  // A filled honeypot is treated as success so automated submitters receive no
  // signal that their submission was discarded.
  if (String(formData.get("contact_url") ?? "").trim()) {
    return { status: "success" };
  }

  const raw: LeadInput = {
    username: String(formData.get("username") ?? ""),
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    budget: String(formData.get("budget") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  const parsed = leadSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", errors: parsed.error.flatten().fieldErrors };
  }

  const profile = await db.profile.findUnique({
    where: { username: parsed.data.username.toLowerCase() },
    select: { userId: true },
  });
  if (!profile) return { status: "error", errors: {} };

  try {
    const requestHeaders = await headers();
    const forwardedFor = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
    const clientAddress =
      requestHeaders.get("x-real-ip")?.trim() || forwardedFor || "unknown-client";
    const userAgent = requestHeaders.get("user-agent")?.slice(0, 200) ?? "unknown-agent";

    // A global profile bucket prevents attackers from bypassing the per-client
    // bucket by rotating or spoofing forwarded addresses.
    const profileAllowed = await consumeRateLimit(
      rateLimitKey("profile", profile.userId),
      PROFILE_LIMIT_PER_HOUR,
    );
    if (!profileAllowed) return rateLimitError();

    const clientAllowed = await consumeRateLimit(
      rateLimitKey("client", profile.userId, clientAddress, userAgent),
      CLIENT_LIMIT_PER_HOUR,
    );
    if (!clientAllowed) return rateLimitError();

    await db.leadRateLimit.deleteMany({
      where: { updatedAt: { lt: new Date(Date.now() - RATE_LIMIT_RETENTION_MS) } },
    });
  } catch (error) {
    console.error("Lead rate limiting failed", error);
    return {
      status: "error",
      errors: { _form: ["Could not send your inquiry right now. Please try again later."] },
    };
  }

  await db.lead.create({
    data: {
      userId: profile.userId,
      name: parsed.data.name,
      email: parsed.data.email,
      budget: parsed.data.budget || null,
      message: parsed.data.message,
    },
  });

  return { status: "success" };
}

function rateLimitKey(...parts: string[]): string {
  const salt = process.env.AUTH_SECRET ?? "atlas-development-rate-limit";
  return createHash("sha256").update([salt, ...parts].join(":"), "utf8").digest("hex");
}

async function consumeRateLimit(key: string, maximum: number): Promise<boolean> {
  const rows = await db.$queryRaw<Array<{ count: number }>>`
    INSERT INTO "LeadRateLimit" ("key", "windowStart", "count", "updatedAt")
    VALUES (${key}, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP)
    ON CONFLICT ("key") DO UPDATE SET
      "windowStart" = CASE
        WHEN "LeadRateLimit"."windowStart" <= CURRENT_TIMESTAMP - INTERVAL '1 hour'
          THEN CURRENT_TIMESTAMP
        ELSE "LeadRateLimit"."windowStart"
      END,
      "count" = CASE
        WHEN "LeadRateLimit"."windowStart" <= CURRENT_TIMESTAMP - INTERVAL '1 hour'
          THEN 1
        ELSE "LeadRateLimit"."count" + 1
      END,
      "updatedAt" = CURRENT_TIMESTAMP
    RETURNING "count"
  `;

  return (rows[0]?.count ?? maximum + 1) <= maximum;
}

function rateLimitError(): LeadFormState {
  return {
    status: "error",
    errors: {
      _form: ["Too many inquiries were sent recently. Please try again in about an hour."],
    },
  };
}
