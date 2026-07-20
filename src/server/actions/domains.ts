"use server";

import { randomBytes } from "node:crypto";
import { resolveTxt } from "node:dns/promises";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { normalizeHostname, platformHostname } from "@/lib/domains";
import { db } from "@/server/db";
import type { ActionResult } from "./profile";

async function requireProfile() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const profile = await db.profile.findUnique({ where: { userId: session.user.id } });
  if (!profile) redirect("/setup");
  return profile;
}

export async function addCustomDomain(value: string): Promise<ActionResult> {
  const profile = await requireProfile();
  const hostname = normalizeHostname(value);
  if (!hostname) return { ok: false, error: "Enter a valid public hostname without a protocol" };
  if (hostname === platformHostname()) {
    return { ok: false, error: "This is the Atlas application hostname" };
  }
  const count = await db.customDomain.count({ where: { profileId: profile.id } });
  if (count >= 5) return { ok: false, error: "A profile can use up to five domains" };

  try {
    await db.customDomain.create({
      data: {
        profileId: profile.id,
        hostname,
        verificationToken: randomBytes(24).toString("hex"),
      },
    });
  } catch {
    return { ok: false, error: "This domain is already connected to Atlas" };
  }
  revalidatePath("/app/settings");
  return { ok: true };
}

export async function verifyCustomDomain(id: string): Promise<ActionResult> {
  const profile = await requireProfile();
  const domain = await db.customDomain.findUnique({
    where: { id, profileId: profile.id },
  });
  if (!domain) return { ok: false, error: "Domain not found" };

  const expected = `atlas-verification=${domain.verificationToken}`;
  let verified =
    process.env.NODE_ENV !== "production" &&
    (domain.hostname.endsWith(".test") || domain.hostname.endsWith(".example"));

  if (!verified) {
    try {
      const records = await resolveTxt(`_atlas-challenge.${domain.hostname}`);
      verified = records.some((parts) => parts.join("") === expected);
    } catch {
      verified = false;
    }
  }
  if (!verified) {
    return { ok: false, error: "Verification TXT record was not found yet" };
  }

  await db.customDomain.update({
    where: { id, profileId: profile.id },
    data: { status: "VERIFIED", verifiedAt: new Date() },
  });
  revalidatePath("/app/settings");
  return { ok: true };
}

export async function deleteCustomDomain(id: string): Promise<ActionResult> {
  const profile = await requireProfile();
  const result = await db.customDomain.deleteMany({ where: { id, profileId: profile.id } });
  if (!result.count) return { ok: false, error: "Domain not found" };
  revalidatePath("/app/settings");
  return { ok: true };
}
