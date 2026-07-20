import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getProfileByUsername } from "@/server/queries";
import { serializeJsonLd } from "@/lib/json-ld";
import { ProfileNav } from "@/components/profile/profile-nav";
import { Hero } from "@/components/profile/hero";
import { Services } from "@/components/profile/services";
import { Projects } from "@/components/profile/projects";
import { Testimonials } from "@/components/profile/testimonials";
import { Experience } from "@/components/profile/experience";
import { About } from "@/components/profile/about";
import { Section } from "@/components/profile/section";
import { LeadForm } from "@/components/profile/lead-form";
import { ProfileFooter } from "@/components/profile/profile-footer";
import { ProfileTheme } from "@/components/profile/profile-theme";

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) return { title: "Not found" };

  const name = profile.user.name ?? profile.username;
  const title = profile.seoTitle ?? `${name} — ${profile.headline ?? profile.username}`;
  const description =
    profile.seoDescription ?? profile.headline ?? `Contact ${name} via Atlas.`;

  return {
    title,
    description,
    alternates: { canonical: `/${profile.username}` },
    openGraph: {
      title,
      description,
      type: "profile",
      url: `/${profile.username}`,
      images: profile.avatarUrl ? [{ url: profile.avatarUrl }] : undefined,
    },
    twitter: { card: "summary", title, description },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) notFound();

  const name = profile.user.name ?? profile.username;
  const profileTheme =
    profile.theme === "light" || profile.theme === "dark" ? profile.theme : "system";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name,
      description: profile.headline ?? undefined,
      image: profile.avatarUrl ?? undefined,
      url: `/${profile.username}`,
      sameAs: profile.socials.map((s) => s.url),
      address: profile.location ?? undefined,
    },
  };

  return (
    <>
      <ProfileTheme defaultTheme={profileTheme} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <ProfileNav name={name} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6">
        <Hero profile={profile} />
        <Services services={profile.services} />
        <Projects username={profile.username} projects={profile.projects} />
        <Testimonials testimonials={profile.testimonials} />
        <Experience experiences={profile.experiences} />
        <About profile={profile} />
        <Section id="contact" title="Contact">
          <LeadForm username={profile.username} />
        </Section>
        <ProfileFooter socials={profile.socials} />
      </main>
    </>
  );
}
