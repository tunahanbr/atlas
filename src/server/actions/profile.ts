"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { db } from "@/server/db";
import { profileSchema } from "@/lib/validations";

export type ActionResult = { ok: boolean; error?: string };

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user;
}

export async function createProfile(input: {
  username: string;
  headline: string;
  location: string;
  availability: "AVAILABLE" | "LIMITED" | "UNAVAILABLE";
}): Promise<ActionResult> {
  const user = await requireUser();

  const parsed = profileSchema
    .pick({ username: true, headline: true, location: true, availability: true })
    .safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existing = await db.profile.findUnique({
    where: { username: parsed.data.username.toLowerCase() },
  });
  if (existing) return { ok: false, error: "This username is taken" };

  await db.profile.create({
    data: {
      userId: user.id,
      username: parsed.data.username.toLowerCase(),
      displayName: user.name?.trim() || null,
      headline: parsed.data.headline || null,
      location: parsed.data.location || null,
      availability: parsed.data.availability,
    },
  });

  redirect("/app?welcome=1");
}

export async function updateProfile(input: unknown): Promise<ActionResult> {
  const user = await requireUser();

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const profile = await db.profile.findUnique({ where: { userId: user.id } });
  if (!profile) return { ok: false, error: "No profile found" };

  const username = parsed.data.username.toLowerCase();
  if (username !== profile.username) {
    const taken = await db.profile.findUnique({ where: { username } });
    if (taken) return { ok: false, error: "This username is taken" };
  }

  const { socials, ...data } = parsed.data;

  await db.$transaction([
    db.profile.update({
      where: { id: profile.id },
      data: {
        ...data,
        username,
        displayName: data.displayName || null,
        profileLabel: data.profileLabel,
        headline: data.headline || null,
        bio: data.bio || null,
        location: data.location || null,
        avatarUrl: data.avatarUrl || null,
        availabilityNote: data.availabilityNote || null,
        bookingUrl: data.bookingUrl || null,
        website: data.website || null,
      },
    }),
    db.socialLink.deleteMany({ where: { profileId: profile.id } }),
    db.socialLink.createMany({
      data: socials.map((s, i) => ({
        profileId: profile.id,
        label: s.label,
        url: s.url,
        order: i,
      })),
    }),
  ]);

  revalidatePath(`/${username}`);
  if (username !== profile.username) revalidatePath(`/${profile.username}`);
  return { ok: true };
}

export async function updateSeo(input: {
  seoTitle: string;
  seoDescription: string;
}): Promise<ActionResult> {
  const user = await requireUser();
  await db.profile.update({
    where: { userId: user.id },
    data: {
      seoTitle: input.seoTitle.slice(0, 120) || null,
      seoDescription: input.seoDescription.slice(0, 300) || null,
    },
  });
  const profile = await db.profile.findUnique({
    where: { userId: user.id },
    select: { username: true },
  });
  if (profile) revalidatePath(`/${profile.username}`);
  return { ok: true };
}

export async function updateTheme(
  theme: "system" | "light" | "dark",
): Promise<ActionResult> {
  const user = await requireUser();
  if (!["system", "light", "dark"].includes(theme)) {
    return { ok: false, error: "Invalid theme" };
  }
  const profile = await db.profile.update({
    where: { userId: user.id },
    data: { theme },
    select: { username: true },
  });
  revalidatePath(`/${profile.username}`);
  return { ok: true };
}

export async function updateProfileVisibility(published: boolean): Promise<ActionResult> {
  const user = await requireUser();
  const profile = await db.profile.update({
    where: { userId: user.id },
    data: { published: Boolean(published) },
    select: { username: true },
  });
  revalidatePath(`/${profile.username}`);
  revalidatePath("/app");
  revalidatePath("/app/settings");
  return { ok: true };
}
