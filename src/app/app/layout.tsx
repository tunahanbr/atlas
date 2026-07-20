import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { db } from "@/server/db";
import { Sidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
    select: { username: true },
  });
  if (!profile) redirect("/setup");

  const newLeads = await db.lead.count({
    where: { userId: session.user.id, status: "NEW" },
  });

  return (
    <div className="flex min-h-svh">
      <Sidebar
        username={profile.username}
        newLeads={newLeads}
        userName={session.user.name ?? ""}
        userEmail={session.user.email ?? ""}
      />
      <main className="flex-1 px-8 py-8 lg:px-12">
        <div className="mx-auto w-full max-w-4xl">{children}</div>
      </main>
    </div>
  );
}
