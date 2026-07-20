import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { db } from "@/server/db";
import { PageHeader } from "@/components/dashboard/shared";
import { ServicesManager } from "@/components/dashboard/services-manager";

export const metadata = { title: "Services" };

export default async function ServicesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
    include: { services: { orderBy: { order: "asc" } } },
  });
  if (!profile) redirect("/setup");

  return (
    <>
      <PageHeader
        title="Services"
        description="Productized services with transparent pricing. They appear in the Services section of your profile."
      />
      <ServicesManager services={profile.services} />
    </>
  );
}
