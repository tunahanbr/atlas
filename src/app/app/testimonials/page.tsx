import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { db } from "@/server/db";
import { PageHeader } from "@/components/dashboard/shared";
import { TestimonialsManager } from "@/components/dashboard/testimonials-manager";

export const metadata = { title: "Testimonials" };

export default async function TestimonialsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
    include: { testimonials: { orderBy: { order: "asc" } } },
  });
  if (!profile) redirect("/setup");

  return (
    <>
      <PageHeader
        title="Testimonials"
        description="What clients say about working with you. Published testimonials appear on your profile."
      />
      <TestimonialsManager testimonials={profile.testimonials} />
    </>
  );
}
