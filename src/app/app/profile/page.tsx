import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { db } from "@/server/db";
import { PageHeader } from "@/components/dashboard/shared";
import { ProfileForm } from "@/components/dashboard/profile-form";
import {
  SkillsForm,
  ExperienceManager,
  CertificationsManager,
} from "@/components/dashboard/about-managers";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
    include: {
      socials: { orderBy: { order: "asc" } },
      skills: { orderBy: { order: "asc" } },
      experiences: { orderBy: { order: "asc" } },
      certifications: true,
    },
  });
  if (!profile) redirect("/setup");

  return (
    <>
      <PageHeader
        title="Profile story"
        description="Make it easy to understand who you help, how you work and why visitors should trust you."
      />
      <div className="space-y-6">
        <ProfileForm
          profile={{
            username: profile.username,
            headline: profile.headline,
            bio: profile.bio,
            location: profile.location,
            avatarUrl: profile.avatarUrl,
            availability: profile.availability,
            availabilityNote: profile.availabilityNote,
            bookingUrl: profile.bookingUrl,
            website: profile.website,
            theme: profile.theme,
            socials: profile.socials.map((s) => ({ label: s.label, url: s.url })),
          }}
        />
        <SkillsForm skills={profile.skills} />
        <ExperienceManager items={profile.experiences} />
        <CertificationsManager items={profile.certifications} />
      </div>
    </>
  );
}
