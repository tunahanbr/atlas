import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { ArrowLeft, ArrowUpRight, FolderGit2, Globe } from "lucide-react";

import { getProjectBySlug } from "@/server/queries";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/profile/reveal";
import { AnalyticsPageView } from "@/components/profile/analytics-tracker";
import { ProfileNav } from "@/components/profile/profile-nav";
import { ProfileTheme } from "@/components/profile/profile-theme";
import { auth } from "@/auth";
import { MarkdownContent } from "@/components/profile/markdown-content";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ username: string; slug: string }>; searchParams: Promise<{ preview?: string }> };

const ACCENT_CLASS: Record<string, string> = {
  stone: "bg-stone-500",
  sage: "bg-emerald-600",
  blue: "bg-sky-600",
  plum: "bg-fuchsia-700",
  amber: "bg-amber-500",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, slug } = await params;
  const project = await getProjectBySlug(username, slug);
  if (!project) return { title: "Not found" };
  const customHost = (await headers()).get("x-atlas-custom-host");
  const projectUrl = customHost
    ? `${process.env.NODE_ENV === "production" ? "https" : "http"}://${customHost}/work/${project.slug}`
    : `/${project.profile.username}/work/${project.slug}`;
  return {
    title: project.title,
    description: project.summary,
    openGraph: {
      title: project.title,
      description: project.summary,
      images: [{ url: `/${project.profile.username}/work/${project.slug}/opengraph-image`, width: 1200, height: 630 }],
      url: projectUrl,
    },
    alternates: { canonical: projectUrl },
  };
}

export default async function ProjectPage({ params, searchParams }: Props) {
  const { username, slug } = await params;
  const previewRequested = (await searchParams).preview === "1";
  const session = previewRequested ? await auth() : null;
  const project = await getProjectBySlug(username, slug, previewRequested);
  if (!project) notFound();
  const isOwnerPreview = previewRequested && session?.user?.id === project.profile.userId;
  if (previewRequested && !isOwnerPreview) notFound();
  const customHost = (await headers()).get("x-atlas-custom-host");
  const profileBasePath = customHost ? "" : `/${project.profile.username}`;

  const ownerName = project.profile.displayName ?? project.profile.user.name ?? project.profile.username;
  const previewQuery = isOwnerPreview ? "?preview=1" : "";
  const contactHref = `${profileBasePath || "/"}${previewQuery}#contact`;
  const workHref = `${profileBasePath || "/"}${previewQuery}#work`;
  const profileTheme =
    project.profile.theme === "light" || project.profile.theme === "dark"
      ? project.profile.theme
      : "system";

  return (
    <>
      <ProfileTheme defaultTheme={profileTheme} />
      {isOwnerPreview ? <div className="fixed inset-x-0 top-0 z-[60] bg-primary px-4 py-2 text-center text-xs text-primary-foreground">Private project preview</div> : null}
      <ProfileNav
        name={ownerName}
        links={[{ href: workHref, label: "All work" }]}
        contactHref={contactHref}
      />
      {!isOwnerPreview ? <AnalyticsPageView
        username={project.profile.username}
        event="PROJECT_VIEW"
        pageKey={`project:${project.id}`}
      /> : null}
      <main className="mx-auto w-full max-w-3xl min-w-0 flex-1 overflow-x-clip px-5 pt-28 pb-16 sm:px-6 sm:pt-32">
        <article className="min-w-0">
          <Reveal>
            <Link
              href={workHref}
              className="group inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
              Back to selected work
            </Link>
          </Reveal>

          <Reveal delay={0.05}>
            <header className="mt-10 grid min-w-0 gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
              <div className="min-w-0">
                <div className={cn("mb-7 h-1 w-12 rounded-full", ACCENT_CLASS[project.accentColor] ?? ACCENT_CLASS.stone)} />
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Case study
                </p>
                <h1 className="font-editorial mt-3 text-[2.35rem] leading-[1.02] tracking-[-0.035em] text-balance [overflow-wrap:anywhere] sm:text-[3rem]">
                  {project.title}
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-[1.75] text-quiet text-pretty [overflow-wrap:anywhere] sm:text-lg">
                  {project.summary}
                </p>
              </div>
              {project.year ? (
                <span className="font-editorial pt-7 text-sm italic tabular-nums text-muted-foreground">
                  {project.year}
                </span>
              ) : null}
            </header>
          </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-8 flex flex-wrap gap-3">
          {project.liveUrl ? (
            <Button
              render={<Link href={project.liveUrl} target="_blank" rel="noopener noreferrer" />}
              nativeButton={false}
              variant="outline"
            >
              <Globe className="size-4" />
              Live demo
              <ArrowUpRight className="size-3.5" />
            </Button>
          ) : null}
          {project.repoUrl ? (
            <Button
              render={<Link href={project.repoUrl} target="_blank" rel="noopener noreferrer" />}
              nativeButton={false}
              variant="outline"
            >
              <FolderGit2 className="size-4" />
              Source
            </Button>
          ) : null}
        </div>
      </Reveal>

      {project.videoUrl ? (
        <Reveal delay={0.15}>
          <div className="mt-12 aspect-video overflow-hidden rounded-md bg-card">
            <video src={project.videoUrl} controls className="size-full object-cover" />
          </div>
        </Reveal>
      ) : null}

      {project.imageUrl ? (
        <Reveal delay={0.15}>
          {/* User-configured hosts cannot be enumerated at build time. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.imageUrl}
            alt={`${project.title} cover`}
            className="mt-12 aspect-[16/9] w-full rounded-md object-cover"
          />
        </Reveal>
      ) : null}

      {project.description ? (
        <Reveal delay={0.15}>
          <MarkdownContent content={project.description} className="mt-12 max-w-2xl" />
        </Reveal>
      ) : null}

      {project.technologies.length > 0 ? (
        <Reveal delay={0.2}>
          <ul className="mt-10 flex flex-wrap gap-x-4 gap-y-2">
            {project.technologies.map((tech) => (
              <li key={tech} className="text-xs text-muted-foreground before:mr-2 before:content-['·']">
                {tech}
              </li>
            ))}
          </ul>
        </Reveal>
      ) : null}

      <Reveal delay={0.25}>
        <div className="mt-16 rounded-md bg-card/50 p-7 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:text-left">
          <div>
            <p className="font-editorial text-xl">Have a similar challenge?</p>
            <p className="mt-1 text-sm text-muted-foreground">Share the context and get a thoughtful first reply.</p>
          </div>
          <Button
            render={<Link href={contactHref} />}
            nativeButton={false}
            className="mt-5 sm:mt-0"
          >
            Talk to {ownerName.split(" ")[0]}
          </Button>
        </div>
      </Reveal>
        </article>
      </main>
    </>
  );
}
