import { ArrowUpRight, FolderGit2, Globe } from "lucide-react";

import type { PublicProfile } from "@/server/queries";
import { Section } from "./section";
import { Reveal } from "./reveal";
import { AnalyticsLink } from "./analytics-tracker";

export function Projects({
  username,
  basePath,
  projects,
}: {
  username: string;
  basePath: string;
  projects: PublicProfile["projects"];
}) {
  if (projects.length === 0) return null;

  return (
    <Section id="work" title="Selected Work">
      <ul className="divide-y rounded-xl border">
        {projects.map((project, i) => (
          <Reveal key={project.id} delay={i * 0.03}>
            <li>
              <AnalyticsLink
                username={username}
                event="PROJECT_CLICK"
                href={`${basePath}/work/${project.slug}`}
                className="group flex items-start justify-between gap-4 p-5 transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium tracking-tight">{project.title}</h3>
                    {project.repoUrl ? (
                      <FolderGit2 className="size-3.5 text-muted-foreground" aria-label="Has repository" />
                    ) : null}
                    {project.liveUrl ? (
                      <Globe className="size-3.5 text-muted-foreground" aria-label="Has live demo" />
                    ) : null}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                    {project.summary}
                  </p>
                  {project.technologies.length > 0 ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {project.technologies.join(" · ")}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {project.year ? (
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {project.year}
                    </span>
                  ) : null}
                  <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
              </AnalyticsLink>
            </li>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
