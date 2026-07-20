import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { db } from "@/server/db";
import { PageHeader } from "@/components/dashboard/shared";
import { ThemePicker } from "@/components/dashboard/theme-picker";

export const metadata = { title: "Appearance" };

export default async function AppearancePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
    select: { theme: true },
  });
  if (!profile) redirect("/setup");

  return (
    <>
      <PageHeader
        title="Appearance"
        description="The default color scheme visitors see when they open your profile."
      />
      <ThemePicker current={profile.theme} />
      <p className="mt-6 text-sm text-muted-foreground">
        Custom themes and accent colors are on the roadmap — the theme system is
        designed to support them without migration.
      </p>
    </>
  );
}
