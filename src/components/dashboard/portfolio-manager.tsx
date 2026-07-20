"use client";

import { useState } from "react";
import { Loader2, Pencil, Plus, Star } from "lucide-react";

import { upsertProject, deleteProject } from "@/server/actions/entities";
import { useUpsert, DeleteButton, EmptyState } from "@/components/dashboard/shared";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

type Project = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  repoUrl: string | null;
  liveUrl: string | null;
  technologies: string[];
  year: number | null;
  featured: boolean;
  published: boolean;
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function PortfolioManager({ projects }: { projects: Project[] }) {
  const { open, setOpen, pending, submit } = useUpsert(upsertProject);
  const [editing, setEditing] = useState<Project | null>(null);
  const [slug, setSlug] = useState("");

  function openNew() {
    setEditing(null);
    setSlug("");
    setOpen(true);
  }

  function openEdit(project: Project) {
    setEditing(project);
    setSlug(project.slug);
    setOpen(true);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const year = String(fd.get("year") ?? "").trim();
    submit(editing?.id ?? null, {
      title: fd.get("title"),
      slug: String(fd.get("slug") ?? ""),
      summary: fd.get("summary"),
      description: fd.get("description"),
      imageUrl: fd.get("imageUrl"),
      videoUrl: fd.get("videoUrl"),
      repoUrl: fd.get("repoUrl"),
      liveUrl: fd.get("liveUrl"),
      technologies: String(fd.get("technologies") ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      year: year ? parseInt(year, 10) : null,
      featured: fd.get("featured") === "on",
      published: fd.get("published") === "on",
    });
  }

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={openNew}>
          <Plus className="size-4" />
          New project
        </Button>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Your work is your proof. Add projects with outcomes, not just screenshots."
        >
          <Button onClick={openNew} variant="outline">
            <Plus className="size-4" />
            Add your first project
          </Button>
        </EmptyState>
      ) : (
        <ul className="mt-6 divide-y rounded-xl border bg-card">
          {projects.map((project) => (
            <li key={project.id} className="flex items-center gap-4 px-5 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium tracking-tight">{project.title}</p>
                  {project.featured ? (
                    <Star className="size-3.5 fill-amber-400 text-amber-400" aria-label="Featured" />
                  ) : null}
                  {!project.published ? (
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                      Draft
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  {project.summary}
                </p>
              </div>
              {project.year ? (
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {project.year}
                </span>
              ) : null}
              <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => openEdit(project)}>
                <Pencil className="size-4" />
              </Button>
              <DeleteButton id={project.id} action={deleteProject} label={project.title} />
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit project" : "New project"}</DialogTitle>
            <DialogDescription>
              Lead with the outcome. Clients buy results, not tech stacks.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={editing?.title}
                  required
                  maxLength={100}
                  onChange={(e) => {
                    if (!editing) setSlug(slugify(e.target.value));
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  name="slug"
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  required
                  maxLength={80}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="summary">Summary (one or two sentences)</Label>
              <Textarea id="summary" name="summary" rows={2} defaultValue={editing?.summary} required maxLength={280} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Case study (optional)</Label>
              <Textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Context, what you did, measurable result."
                defaultValue={editing?.description ?? ""}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="liveUrl">Live demo URL</Label>
                <Input id="liveUrl" name="liveUrl" type="url" placeholder="https://" defaultValue={editing?.liveUrl ?? ""} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="repoUrl">Repository URL</Label>
                <Input id="repoUrl" name="repoUrl" type="url" placeholder="https://github.com/…" defaultValue={editing?.repoUrl ?? ""} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input id="imageUrl" name="imageUrl" type="url" placeholder="https://" defaultValue={editing?.imageUrl ?? ""} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input id="videoUrl" name="videoUrl" type="url" placeholder="https://" defaultValue={editing?.videoUrl ?? ""} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="year">Year</Label>
                <Input id="year" name="year" type="number" min="1990" max="2100" placeholder="2025" defaultValue={editing?.year ?? ""} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="technologies">Technologies (comma-separated)</Label>
                <Input
                  id="technologies"
                  name="technologies"
                  placeholder="Next.js, PostgreSQL"
                  defaultValue={editing?.technologies.join(", ")}
                />
              </div>
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm">
                <Switch name="featured" defaultChecked={editing?.featured ?? false} />
                Featured
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch name="published" defaultChecked={editing?.published ?? true} />
                Published
              </label>
            </div>
            <Button type="submit" className="w-full rounded-xl" disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              {editing ? "Save changes" : "Create project"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
