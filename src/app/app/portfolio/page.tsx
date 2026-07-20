import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { db } from "@/server/db";
import { PageHeader } from "@/components/dashboard/shared";
import { PortfolioManager } from "@/components/dashboard/portfolio-manager";

export const metadata = { title: "Portfolio" };

export default async function PortfolioPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
    include: { projects: { orderBy: [{ featured: "desc" }, { order: "asc" }] } },
  });
  if (!profile) redirect("/setup");

  return (
    <>
      <PageHeader
        title="Portfolio"
        description="Use outcomes and context to show how you think — not only what you shipped."
      />
      <PortfolioManager projects={profile.projects} />
    </>
  );
}
