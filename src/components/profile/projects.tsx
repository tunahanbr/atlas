import { ArrowUpRight, FolderGit2, Globe } from "lucide-react";

import type { PublicProfile } from "@/server/queries";
import { Section } from "./section";
import { Reveal } from "./reveal";
import { AnalyticsLink } from "./analytics-tracker";

export function Projects({
  username,
  basePath,
  projects,
  preview = false,
}: {
  username: string;
  basePath: string;
  projects: PublicProfile["projects"];
  preview?: boolean;
}) {
  if (projects.length === 0) return null;

  return (
    <Section id="work" title="Selected Work">
      <ul className="space-y-1">
        {projects.map((project, i) => (
          <Reveal key={project.id} as="li" delay={i * 0.03}>
              <AnalyticsLink
                username={username}
                event="PROJECT_CLICK"
                pageKey={`project:${project.id}`}
                href={`${basePath}/work/${project.slug}${preview ? "?preview=1" : ""}`}
                className="group flex items-start justify-between gap-5 rounded-md px-3 py-5 transition-[background-color,transform] duration-500 hover:translate-x-1 hover:bg-card/55"
              >
                <div className="flex min-w-0 gap-4">
                  <span className="mt-1 hidden font-editorial text-sm italic text-muted-foreground sm:block">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                    <h3 className="font-editorial text-lg tracking-[-0.01em]">{project.title}</h3>
                    {project.repoUrl ? (
                      <FolderGit2 className="size-3.5 text-muted-foreground" aria-label="Has repository" />
                    ) : null}
                    {project.liveUrl ? (
                      <Globe className="size-3.5 text-muted-foreground" aria-label="Has live demo" />
                    ) : null}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-[1.65] text-muted-foreground text-pretty">
                    {project.summary}
                  </p>
                  {project.technologies.length > 0 ? (
                    <p className="mt-3 text-xs text-muted-foreground">
                      {project.technologies.join(" · ")}
                    </p>
                  ) : null}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {project.year ? (
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {project.year}
                    </span>
                  ) : null}
                  <ArrowUpRight className="size-4 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-foreground" />
                </div>
              </AnalyticsLink>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
