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
    select: { username: true, published: true },
  });
  if (!profile) redirect("/setup");

  const newLeads = await db.lead.count({
    where: { userId: session.user.id, status: "NEW" },
  });

  return (
    <div className="min-h-svh lg:flex">
      <Sidebar
        username={profile.username}
        published={profile.published}
        newLeads={newLeads}
        userName={session.user.name ?? ""}
        userEmail={session.user.email ?? ""}
      />
      <main className="px-4 py-7 sm:px-6 lg:flex-1 lg:px-12 lg:py-10">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
