import type { Metadata } from "next";
import { headers } from "next/headers";
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
import { AnalyticsPageView } from "@/components/profile/analytics-tracker";

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) return { title: "Not found" };
  const customHost = (await headers()).get("x-atlas-custom-host");
  const profileUrl = customHost
    ? `${process.env.NODE_ENV === "production" ? "https" : "http"}://${customHost}`
    : `/${profile.username}`;

  const name = profile.user.name ?? profile.username;
  const title = profile.seoTitle ?? `${name} — ${profile.headline ?? profile.username}`;
  const description =
    profile.seoDescription ?? profile.headline ?? `Contact ${name} via Atlas.`;

  return {
    title,
    description,
    alternates: { canonical: profileUrl },
    openGraph: {
      title,
      description,
      type: "profile",
      url: profileUrl,
      images: profile.avatarUrl ? [{ url: profile.avatarUrl }] : undefined,
    },
    twitter: { card: "summary", title, description },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) notFound();
  const customHost = (await headers()).get("x-atlas-custom-host");
  const profileBasePath = customHost ? "" : `/${profile.username}`;
  const profileUrl = customHost
    ? `${process.env.NODE_ENV === "production" ? "https" : "http"}://${customHost}`
    : `/${profile.username}`;

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
      url: profileUrl,
      sameAs: profile.socials.map((s) => s.url),
      address: profile.location ?? undefined,
    },
  };

  return (
    <>
      <ProfileTheme defaultTheme={profileTheme} />
      <AnalyticsPageView
        username={profile.username}
        event="PROFILE_VIEW"
        pageKey={`profile:${profile.username}`}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <ProfileNav name={name} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 sm:px-6">
        <Hero profile={profile} />
        <Services username={profile.username} services={profile.services} />
        <Projects
          username={profile.username}
          basePath={profileBasePath}
          projects={profile.projects}
        />
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
