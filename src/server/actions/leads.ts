"use server";

import { db } from "@/server/db";
import { leadSchema, type LeadInput } from "@/lib/validations";

export type LeadFormState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; errors: Record<string, string[]> };

export async function submitLead(
  _prev: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
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
