import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { db } from "@/server/db";
import { PageHeader } from "@/components/dashboard/shared";
import { LeadsInbox } from "@/components/dashboard/leads-inbox";

export const metadata = { title: "Leads" };

export default async function LeadsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [leads, profile] = await Promise.all([
    db.lead.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { notes: { orderBy: { createdAt: "desc" } } },
    }),
    db.profile.findUnique({
      where: { userId: session.user.id },
      select: { username: true },
    }),
  ]);
  if (!profile) redirect("/setup");

  return (
    <>
      <PageHeader
        title="Leads"
        description="Qualify inquiries, schedule follow-ups and keep the full client context in one place."
      />
      <LeadsInbox leads={leads} username={profile.username} />
    </>
  );
}
