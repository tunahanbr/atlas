"use server";

import { redirect } from "next/navigation";

import { auth, legacySignOut } from "@/auth";
import { db } from "@/server/db";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, SUPABASE_MEDIA_BUCKET } from "@/lib/supabase/config";

export async function deleteAccount(
  _previous: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { supabaseId: true, profile: { select: { username: true } } },
  });
  if (!user?.profile) return { error: "Account not found." };
  if (String(formData.get("confirmation") ?? "").trim().toLowerCase() !== user.profile.username) {
    return { error: `Type ${user.profile.username} to confirm.` };
  }

  if (isSupabaseConfigured()) {
    const admin = createSupabaseAdminClient();
    if (!admin || !user.supabaseId) return { error: "Account deletion is not fully configured. Contact the instance administrator." };
    const { data: files } = await admin.storage.from(SUPABASE_MEDIA_BUCKET).list(session.user.id, { limit: 1000 });
    if (files?.length) await admin.storage.from(SUPABASE_MEDIA_BUCKET).remove(files.map((file) => `${session.user.id}/${file.name}`));
    const { error } = await admin.auth.admin.deleteUser(user.supabaseId);
    if (error) return { error: "Authentication account could not be deleted. Nothing else was removed." };
    const supabase = await createSupabaseServerClient();
    await supabase?.auth.signOut();
    await db.user.delete({ where: { id: session.user.id } });
    redirect("/?account=deleted");
  }

  await db.user.delete({ where: { id: session.user.id } });
  await legacySignOut({ redirectTo: "/?account=deleted" });
  return {};
}
