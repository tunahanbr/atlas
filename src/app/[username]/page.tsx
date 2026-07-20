import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";

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
import { auth } from "@/auth";

type Props = { params: Promise<{ username: string }>; searchParams: Promise<{ preview?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) return { title: "Not found" };
  const customHost = (await headers()).get("x-atlas-custom-host");
  const profileUrl = customHost
    ? `${process.env.NODE_ENV === "production" ? "https" : "http"}://${customHost}`
    : `/${profile.username}`;

  const name = profile.displayName ?? profile.user.name ?? profile.username;
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
      images: [{ url: `/${profile.username}/opengraph-image`, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ProfilePage({ params, searchParams }: Props) {
  const { username } = await params;
  const previewRequested = (await searchParams).preview === "1";
  const session = previewRequested ? await auth() : null;
  const profile = await getProfileByUsername(username, previewRequested);
  if (!profile) notFound();
  const isOwnerPreview = previewRequested && session?.user?.id === profile.user.id;
  if (previewRequested && !isOwnerPreview) notFound();
  const customHost = (await headers()).get("x-atlas-custom-host");
  const profileBasePath = customHost ? "" : `/${profile.username}`;
  const profileUrl = customHost
    ? `${process.env.NODE_ENV === "production" ? "https" : "http"}://${customHost}`
    : `/${profile.username}`;

  const name = profile.displayName ?? profile.user.name ?? profile.username;
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
      {isOwnerPreview ? (
        <div className="fixed inset-x-0 top-0 z-[60] flex items-center justify-center gap-3 bg-primary px-4 py-2 text-xs text-primary-foreground">
          Private preview — visitors cannot see this draft.
          <Link href="/app/settings" className="font-medium underline underline-offset-4">Publishing settings</Link>
        </div>
      ) : null}
      {!isOwnerPreview ? <AnalyticsPageView
        username={profile.username}
        event="PROFILE_VIEW"
        pageKey={`profile:${profile.username}`}
      /> : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <ProfileNav
        name={name}
        links={[
          ...(profile.projects.length > 0 ? [{ href: "#work", label: "Work" }] : []),
          ...(profile.services.length > 0 ? [{ href: "#services", label: "Services" }] : []),
          ...(profile.bio || profile.skills.length > 0 ? [{ href: "#about", label: "About" }] : []),
        ]}
      />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 sm:px-6">
        <Hero profile={profile} />
        <Projects
          username={profile.username}
          basePath={profileBasePath}
          preview={isOwnerPreview}
          projects={profile.projects}
        />
        <Services username={profile.username} services={profile.services} />
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
