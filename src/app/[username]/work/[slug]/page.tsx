import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { ArrowLeft, FolderGit2, Globe } from "lucide-react";

import { getProjectBySlug } from "@/server/queries";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/profile/reveal";
import { AnalyticsPageView } from "@/components/profile/analytics-tracker";

type Props = { params: Promise<{ username: string; slug: string }> };

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
      images: project.imageUrl ? [{ url: project.imageUrl }] : undefined,
      url: projectUrl,
    },
    alternates: { canonical: projectUrl },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { username, slug } = await params;
  const project = await getProjectBySlug(username, slug);
  if (!project) notFound();
  const customHost = (await headers()).get("x-atlas-custom-host");
  const profileBasePath = customHost ? "" : `/${project.profile.username}`;

  const ownerName = project.profile.user.name ?? project.profile.username;

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <AnalyticsPageView
        username={project.profile.username}
        event="PROJECT_VIEW"
        pageKey={`project:${project.id}`}
      />
      <Reveal>
        <Button
          render={<Link href={`${profileBasePath || "/"}#work`} />}
          nativeButton={false}
          variant="ghost"
          size="sm"
          className="-ml-2 text-muted-foreground"
        >
          <ArrowLeft className="size-4" />
          {ownerName}
        </Button>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-balance">
            {project.title}
          </h1>
          {project.year ? (
            <span className="text-sm tabular-nums text-muted-foreground">{project.year}</span>
          ) : null}
        </div>
        <p className="mt-3 text-lg leading-relaxed text-muted-foreground text-pretty">
          {project.summary}
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-6 flex flex-wrap gap-3">
          {project.liveUrl ? (
            <Button
              render={<Link href={project.liveUrl} target="_blank" rel="noopener noreferrer" />}
              nativeButton={false}
              variant="outline"
              className="rounded-xl"
            >
              <Globe className="size-4" />
              Live demo
            </Button>
          ) : null}
          {project.repoUrl ? (
            <Button
              render={<Link href={project.repoUrl} target="_blank" rel="noopener noreferrer" />}
              nativeButton={false}
              variant="outline"
              className="rounded-xl"
            >
              <FolderGit2 className="size-4" />
              Source
            </Button>
          ) : null}
        </div>
      </Reveal>

      {project.videoUrl ? (
        <Reveal delay={0.15}>
          <div className="mt-10 aspect-video overflow-hidden rounded-xl border">
            <video src={project.videoUrl} controls className="size-full object-cover" />
          </div>
        </Reveal>
      ) : null}

      {project.description ? (
        <Reveal delay={0.15}>
          <div className="mt-10 space-y-4">
            {project.description.split(/\n\s*\n/).map((paragraph, i) => (
              <p key={i} className="leading-relaxed text-muted-foreground text-pretty">
                {paragraph}
              </p>
            ))}
          </div>
        </Reveal>
      ) : null}

      {project.technologies.length > 0 ? (
        <Reveal delay={0.2}>
          <ul className="mt-10 flex flex-wrap gap-1.5">
            {project.technologies.map((tech) => (
              <li key={tech} className="rounded-md bg-secondary px-2.5 py-1 text-xs">
                {tech}
              </li>
            ))}
          </ul>
        </Reveal>
      ) : null}

      <Reveal delay={0.25}>
        <div className="mt-14 rounded-xl border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Interested in work like this?
          </p>
          <Button
            render={<Link href={`${profileBasePath || "/"}#contact`} />}
            nativeButton={false}
            className="mt-3 rounded-xl"
          >
            Work with {ownerName.split(" ")[0]}
          </Button>
        </div>
      </Reveal>
    </main>
  );
}
