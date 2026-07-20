import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { db } from "@/server/db";
import { ServiceEditor } from "@/components/dashboard/service-editor";

export const metadata = { title: "Edit service" };

export default async function EditServicePage({ params }: { params: Promise<{ serviceId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { serviceId } = await params;
  const service = await db.service.findFirst({ where: { id: serviceId, profile: { userId: session.user.id } } });
  if (!service) notFound();
  return <ServiceEditor service={service} />;
}
