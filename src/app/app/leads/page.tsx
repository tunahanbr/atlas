import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { db } from "@/server/db";
import { PageHeader } from "@/components/dashboard/shared";
import { LeadsInbox } from "@/components/dashboard/leads-inbox";

export const metadata = { title: "Leads" };

export default async function LeadsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const leads = await db.lead.findMany({
    where: { userId: session.user.id },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return (
    <>
      <PageHeader
        title="Leads"
        description="Inquiries from your profile's contact form. Reply directly by email — no middleman."
      />
      <LeadsInbox leads={leads} />
    </>
  );
}
