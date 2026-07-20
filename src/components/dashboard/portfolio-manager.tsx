"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, GripVertical, Pencil, Plus, Star } from "lucide-react";

import { deleteProject } from "@/server/actions/entities";
import { DeleteButton, EmptyState } from "@/components/dashboard/shared";
import { Button } from "@/components/ui/button";
import { useReorder } from "@/components/dashboard/use-reorder";
import { ContentCollectionToolbar, type CollectionFilter } from "@/components/dashboard/content-collection-toolbar";

type Project = {
  id: string;
  title: string;
  summary: string;
  year: number | null;
  featured: boolean;
  published: boolean;
};

export function PortfolioManager({ projects }: { projects: Project[] }) {
  const reorder = useReorder(projects, "projects");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<CollectionFilter>("all");
  const visible = useMemo(() => reorder.items.filter((project) => {
    const matchesQuery = `${project.title} ${project.summary}`.toLowerCase().includes(query.trim().toLowerCase());
    const matchesFilter = filter === "all" || (filter === "published" ? project.published : !project.published);
    return matchesQuery && matchesFilter;
  }), [filter, query, reorder.items]);
  const counts = { all: projects.length, published: projects.filter((project) => project.published).length, draft: projects.filter((project) => !project.published).length };

  const addButton = (
    <Button render={<Link href="/app/portfolio/new" />} nativeButton={false}>
      <Plus className="size-4" />
      Add project
    </Button>
  );

  return (
    <>
      {projects.length === 0 ? (
        <EmptyState
          title="Show the outcome, not only the artifact"
          description="One strong case study is enough to start. Explain the situation, your contribution and what changed because of the work."
        >
          {addButton}
        </EmptyState>
      ) : (
        <>
        <ContentCollectionToolbar query={query} onQueryChange={setQuery} filter={filter} onFilterChange={setFilter} counts={counts}>{addButton}</ContentCollectionToolbar>
        {visible.length ? <ul className="mt-4 divide-y rounded-md border bg-card/45">
          {visible.map((project, index) => (
            <li key={project.id} {...reorder.dragProps(project.id)} className="flex items-center gap-3 px-4 py-4 transition hover:bg-card/80">
              <GripVertical className="size-4 cursor-grab text-muted-foreground" aria-hidden />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium tracking-tight">{project.title}</p>
                  {project.featured ? <Star className="size-3.5 fill-amber-400 text-amber-400" aria-label="Featured" /> : null}
                  {!project.published ? <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">Draft</span> : null}
                  {project.published ? <span className="text-[10px] text-emerald-700 dark:text-emerald-300">Published</span> : null}
                </div>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">{project.summary}</p>
              </div>
              <span className="hidden gap-0.5 sm:flex">
                <Button variant="ghost" size="icon" aria-label={`Move ${project.title} up`} disabled={index === 0 || reorder.pending || filter !== "all" || Boolean(query)} onClick={() => reorder.moveBy(project.id, -1)}><ChevronUp className="size-3.5" /></Button>
                <Button variant="ghost" size="icon" aria-label={`Move ${project.title} down`} disabled={index === visible.length - 1 || reorder.pending || filter !== "all" || Boolean(query)} onClick={() => reorder.moveBy(project.id, 1)}><ChevronDown className="size-3.5" /></Button>
              </span>
              {project.year ? <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{project.year}</span> : null}
              <Button render={<Link href={`/app/portfolio/${project.id}`} />} nativeButton={false} variant="ghost" size="sm" aria-label={`Edit ${project.title}`}>
                <Pencil className="size-4" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
              <DeleteButton id={project.id} action={deleteProject} label={project.title} />
            </li>
          ))}
        </ul> : <div className="mt-4 rounded-md border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">No projects match this view.</div>}
        </>
      )}
    </>
  );
}
