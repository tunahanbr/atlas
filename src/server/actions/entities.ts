"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { db } from "@/server/db";
import {
  serviceSchema,
  projectSchema,
  testimonialSchema,
  experienceSchema,
  certificationSchema,
  skillSchema,
  leadDetailsSchema,
  leadNoteSchema,
  leadStatusSchema,
} from "@/lib/validations";
import type { ActionResult } from "./profile";

async function requireProfile() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) redirect("/setup");
  return profile;
}

function revalidate(username: string) {
  revalidatePath(`/${username}`);
  revalidatePath("/app");
}

function fail(error: unknown): ActionResult {
  return { ok: false, error: error instanceof Error ? error.message : "Invalid input" };
}

// ─── Services ─────────────────────────────────────────────────────────────────

export async function upsertService(id: string | null, input: unknown): Promise<ActionResult> {
  const profile = await requireProfile();
  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  try {
    if (id) {
      await db.service.update({ where: { id, profileId: profile.id }, data: parsed.data });
    } else {
      const count = await db.service.count({ where: { profileId: profile.id } });
      await db.service.create({ data: { ...parsed.data, profileId: profile.id, order: count } });
    }
  } catch (e) {
    return fail(e);
  }
  revalidate(profile.username);
  return { ok: true };
}

export async function deleteService(id: string): Promise<ActionResult> {
  const profile = await requireProfile();
  await db.service.delete({ where: { id, profileId: profile.id } });
  revalidate(profile.username);
  return { ok: true };
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export async function upsertProject(id: string | null, input: unknown): Promise<ActionResult> {
  const profile = await requireProfile();
  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  const data = {
    ...parsed.data,
    description: parsed.data.description || null,
    imageUrl: parsed.data.imageUrl || null,
    videoUrl: parsed.data.videoUrl || null,
    repoUrl: parsed.data.repoUrl || null,
    liveUrl: parsed.data.liveUrl || null,
  };

  const clash = await db.project.findFirst({
    where: { profileId: profile.id, slug: data.slug, ...(id ? { NOT: { id } } : {}) },
  });
  if (clash) return { ok: false, error: "A project with this slug already exists" };

  try {
    if (id) {
      await db.project.update({ where: { id, profileId: profile.id }, data });
    } else {
      const count = await db.project.count({ where: { profileId: profile.id } });
      await db.project.create({ data: { ...data, profileId: profile.id, order: count } });
    }
  } catch (e) {
    return fail(e);
  }
  revalidate(profile.username);
  return { ok: true };
}

export async function deleteProject(id: string): Promise<ActionResult> {
  const profile = await requireProfile();
  await db.project.delete({ where: { id, profileId: profile.id } });
  revalidate(profile.username);
  return { ok: true };
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

export async function upsertTestimonial(id: string | null, input: unknown): Promise<ActionResult> {
  const profile = await requireProfile();
  const parsed = testimonialSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  const data = {
    ...parsed.data,
    authorRole: parsed.data.authorRole || null,
    authorCompany: parsed.data.authorCompany || null,
  };

  if (id) {
    await db.testimonial.update({ where: { id, profileId: profile.id }, data });
  } else {
    const count = await db.testimonial.count({ where: { profileId: profile.id } });
    await db.testimonial.create({ data: { ...data, profileId: profile.id, order: count } });
  }
  revalidate(profile.username);
  return { ok: true };
}

export async function deleteTestimonial(id: string): Promise<ActionResult> {
  const profile = await requireProfile();
  await db.testimonial.delete({ where: { id, profileId: profile.id } });
  revalidate(profile.username);
  return { ok: true };
}

export async function reorderEntities(
  kind: "services" | "projects" | "testimonials",
  ids: string[],
): Promise<ActionResult> {
  const profile = await requireProfile();
  const uniqueIds = [...new Set(ids)];
  if (uniqueIds.length !== ids.length || ids.length > 100) return { ok: false, error: "Invalid order" };
  const model = kind === "services" ? db.service : kind === "projects" ? db.project : db.testimonial;
  // Prisma's generated delegates have different overloads, so ownership is
  // checked with a narrow raw count before the typed per-model transaction.
  const owned = kind === "services"
    ? await db.service.count({ where: { profileId: profile.id, id: { in: ids } } })
    : kind === "projects"
      ? await db.project.count({ where: { profileId: profile.id, id: { in: ids } } })
      : await db.testimonial.count({ where: { profileId: profile.id, id: { in: ids } } });
  if (owned !== ids.length) return { ok: false, error: "Invalid order" };
  void model;
  await db.$transaction(ids.map((id, order) =>
    kind === "services"
      ? db.service.update({ where: { id }, data: { order } })
      : kind === "projects"
        ? db.project.update({ where: { id }, data: { order } })
        : db.testimonial.update({ where: { id }, data: { order } }),
  ));
  revalidate(profile.username);
  return { ok: true };
}

// ─── Experience ───────────────────────────────────────────────────────────────

export async function upsertExperience(id: string | null, input: unknown): Promise<ActionResult> {
  const profile = await requireProfile();
  const parsed = experienceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  const data = {
    company: parsed.data.company,
    role: parsed.data.role,
    description: parsed.data.description || null,
    startDate: new Date(`${parsed.data.startDate}-01`),
    endDate: parsed.data.endDate ? new Date(`${parsed.data.endDate}-01`) : null,
    current: parsed.data.current,
  };

  if (id) {
    await db.experience.update({ where: { id, profileId: profile.id }, data });
  } else {
    const count = await db.experience.count({ where: { profileId: profile.id } });
    await db.experience.create({ data: { ...data, profileId: profile.id, order: count } });
  }
  revalidate(profile.username);
  return { ok: true };
}

export async function deleteExperience(id: string): Promise<ActionResult> {
  const profile = await requireProfile();
  await db.experience.delete({ where: { id, profileId: profile.id } });
  revalidate(profile.username);
  return { ok: true };
}

// ─── Skills ───────────────────────────────────────────────────────────────────

// Skills are edited as a list of "Category: Name" lines for speed.
export async function replaceSkills(lines: string[]): Promise<ActionResult> {
  const profile = await requireProfile();
  const rows = lines
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 60)
    .map((line) => {
      const [maybeCategory, ...rest] = line.split(":");
      const hasCategory = rest.length > 0;
      const parsed = skillSchema.safeParse(
        hasCategory
          ? { category: maybeCategory.trim(), name: rest.join(":").trim() }
          : { name: line },
      );
      return parsed.success ? parsed.data : null;
    })
    .filter((r): r is { name: string; category?: string } => r !== null);

  await db.$transaction([
    db.skill.deleteMany({ where: { profileId: profile.id } }),
    db.skill.createMany({
      data: rows.map((r, i) => ({
        profileId: profile.id,
        name: r.name,
        category: r.category || null,
        order: i,
      })),
    }),
  ]);
  revalidate(profile.username);
  return { ok: true };
}

// ─── Certifications ───────────────────────────────────────────────────────────

export async function upsertCertification(id: string | null, input: unknown): Promise<ActionResult> {
  const profile = await requireProfile();
  const parsed = certificationSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  const data = { ...parsed.data, url: parsed.data.url || null };
  if (id) {
    await db.certification.update({ where: { id, profileId: profile.id }, data });
  } else {
    await db.certification.create({ data: { ...data, profileId: profile.id } });
  }
  revalidate(profile.username);
  return { ok: true };
}

export async function deleteCertification(id: string): Promise<ActionResult> {
  const profile = await requireProfile();
  await db.certification.delete({ where: { id, profileId: profile.id } });
  revalidate(profile.username);
  return { ok: true };
}

// ─── Leads ────────────────────────────────────────────────────────────────────

export async function updateLeadStatus(
  id: string,
  status: "NEW" | "READ" | "QUALIFIED" | "WON" | "LOST" | "ARCHIVED",
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const parsed = leadStatusSchema.safeParse(status);
  if (!parsed.success) return { ok: false, error: "Invalid lead status" };
  await db.lead.update({ where: { id, userId: session.user.id }, data: { status: parsed.data } });
  revalidatePath("/app/leads");
  revalidatePath("/app");
  return { ok: true };
}

export async function updateLeadDetails(id: string, input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const parsed = leadDetailsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  await db.lead.update({
    where: { id, userId: session.user.id },
    data: {
      valueCents: parsed.data.valueCents,
      currency: parsed.data.currency.toUpperCase(),
      nextFollowUp: parsed.data.nextFollowUp
        ? new Date(`${parsed.data.nextFollowUp}T12:00:00.000Z`)
        : null,
    },
  });
  revalidatePath("/app/leads");
  return { ok: true };
}

export async function addLeadNote(leadId: string, body: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const parsed = leadNoteSchema.safeParse(body);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  const lead = await db.lead.findUnique({
    where: { id: leadId, userId: session.user.id },
    select: { id: true },
  });
  if (!lead) return { ok: false, error: "Lead not found" };
  await db.leadNote.create({ data: { leadId: lead.id, body: parsed.data } });
  revalidatePath("/app/leads");
  return { ok: true };
}

export async function deleteLeadNote(noteId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const result = await db.leadNote.deleteMany({
    where: { id: noteId, lead: { userId: session.user.id } },
  });
  if (!result.count) return { ok: false, error: "Note not found" };
  revalidatePath("/app/leads");
  return { ok: true };
}
