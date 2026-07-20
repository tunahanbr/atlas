"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bold,
  Code2,
  Eye,
  Heading2,
  Italic,
  Link as LinkIcon,
  List,
  Loader2,
  Pencil,
  Quote,
  Save,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { upsertProject } from "@/server/actions/entities";
import { MarkdownContent } from "@/components/profile/markdown-content";
import { MediaUploadField } from "@/components/dashboard/media-upload-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type AccentColor = "stone" | "sage" | "blue" | "plum" | "amber";
type EditorMode = "write" | "preview";

type Project = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string | null;
  accentColor: string;
  imageUrl: string | null;
  videoUrl: string | null;
  repoUrl: string | null;
  liveUrl: string | null;
  technologies: string[];
  year: number | null;
  featured: boolean;
  published: boolean;
};

const ACCENTS: { value: AccentColor; label: string; className: string }[] = [
  { value: "stone", label: "Stone", className: "bg-stone-500" },
  { value: "sage", label: "Sage", className: "bg-emerald-600" },
  { value: "blue", label: "Blue", className: "bg-sky-600" },
  { value: "plum", label: "Plum", className: "bg-fuchsia-700" },
  { value: "amber", label: "Amber", className: "bg-amber-500" },
];

const CASE_STUDY_TEMPLATE = `## The challenge
What situation, constraint, or opportunity started the project?

## My role
What were you responsible for, and how did you approach the work?

## The outcome
What changed as a result? Add concrete evidence or a useful lesson.`;

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

export function ProjectEditor({ project }: { project: Project | null }) {
  const router = useRouter();
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [pending, startTransition] = useTransition();
  const [mode, setMode] = useState<EditorMode>("write");
  const [title, setTitle] = useState(project?.title ?? "");
  const [slug, setSlug] = useState(project?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(project));
  const [summary, setSummary] = useState(project?.summary ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [accentColor, setAccentColor] = useState<AccentColor>((project?.accentColor as AccentColor) ?? "stone");
  const [imageUrl, setImageUrl] = useState(project?.imageUrl ?? "");
  const [videoUrl, setVideoUrl] = useState(project?.videoUrl ?? "");
  const [repoUrl, setRepoUrl] = useState(project?.repoUrl ?? "");
  const [liveUrl, setLiveUrl] = useState(project?.liveUrl ?? "");
  const [technologies, setTechnologies] = useState(project?.technologies.join(", ") ?? "");
  const [year, setYear] = useState(project?.year?.toString() ?? "");
  const [featured, setFeatured] = useState(project?.featured ?? false);
  const [published, setPublished] = useState(project?.published ?? true);

  function applyMarkdown(before: string, after = before, placeholder = "text") {
    const textarea = editorRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = description.slice(start, end) || placeholder;
    setDescription(`${description.slice(0, start)}${before}${selected}${after}${description.slice(end)}`);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }

  function prependLines(prefix: string, placeholder: string) {
    const textarea = editorRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = description.slice(start, end) || placeholder;
    const formatted = selected.split("\n").map((line) => `${prefix}${line}`).join("\n");
    setDescription(`${description.slice(0, start)}${formatted}${description.slice(end)}`);
    requestAnimationFrame(() => textarea.focus());
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await upsertProject(project?.id ?? null, {
        title,
        slug,
        summary,
        description,
        accentColor,
        imageUrl,
        videoUrl,
        repoUrl,
        liveUrl,
        technologies: technologies.split(",").map((technology) => technology.trim()).filter(Boolean),
        year: year ? parseInt(year, 10) : null,
        featured,
        published,
      });
      if (result.ok) {
        toast.success(project ? "Project saved" : published ? "Project published" : "Draft saved");
        router.push("/app/portfolio");
        router.refresh();
      } else toast.error(result.error ?? "Could not save project");
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <header className="sticky top-0 z-30 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b bg-background/92 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:rounded-md lg:border lg:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <Button render={<Link href="/app/portfolio" />} nativeButton={false} variant="ghost" size="icon" aria-label="Back to portfolio"><ArrowLeft /></Button>
          <div className="min-w-0"><p className="truncate text-sm font-medium">{title || (project ? "Untitled project" : "New project")}</p><p className="text-xs text-muted-foreground">{published ? "Will be visible on your profile" : "Private draft"}</p></div>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={() => setMode((current) => current === "write" ? "preview" : "write")}>
            {mode === "write" ? <Eye /> : <Pencil />}{mode === "write" ? "Preview" : "Continue editing"}
          </Button>
          <Button type="submit" disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : <Save />}{published ? (project ? "Save changes" : "Publish project") : "Save draft"}</Button>
        </div>
      </header>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <main className="min-w-0">
          {mode === "write" ? (
            <div className="space-y-5">
              <EditorSection step="1" title="Project overview" description="Give visitors enough context to decide whether the case study is relevant to them.">
                <div className="space-y-1.5">
                  <Label htmlFor="project-title">Project title</Label>
                  <Input id="project-title" value={title} onChange={(event) => { setTitle(event.target.value); if (!slugTouched) setSlug(slugify(event.target.value)); }} placeholder="e.g. Rebuilding the checkout experience" required maxLength={100} autoFocus={!project} />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between gap-3"><Label htmlFor="project-summary">Short summary</Label><span className="text-[11px] tabular-nums text-muted-foreground">{summary.length}/280</span></div>
                  <Textarea id="project-summary" value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="In 1–2 sentences: what was the challenge, what did you contribute, and what changed?" required maxLength={280} rows={3} className="resize-none leading-6" />
                  <p className="text-xs text-muted-foreground">This appears in the portfolio list and at the top of the project.</p>
                </div>
              </EditorSection>

              <EditorSection step="2" title="Case study" description="Tell the story in a simple challenge → approach → outcome structure.">
                <div className="overflow-hidden rounded-md border bg-background">
                  <div className="flex flex-wrap items-center gap-1 border-b bg-card/70 p-2" role="toolbar" aria-label="Case study formatting">
                    <EditorTool label="Heading" onClick={() => prependLines("## ", "Section heading")}><Heading2 /></EditorTool>
                    <EditorTool label="Bold" onClick={() => applyMarkdown("**", "**", "bold text")}><Bold /></EditorTool>
                    <EditorTool label="Italic" onClick={() => applyMarkdown("*", "*", "italic text")}><Italic /></EditorTool>
                    <span className="mx-1 h-5 w-px bg-border" />
                    <EditorTool label="Link" onClick={() => applyMarkdown("[", "](https://example.com)", "link text")}><LinkIcon /></EditorTool>
                    <EditorTool label="Bulleted list" onClick={() => prependLines("- ", "List item")}><List /></EditorTool>
                    <EditorTool label="Quote" onClick={() => prependLines("> ", "Key insight or client quote")}><Quote /></EditorTool>
                    <EditorTool label="Code" onClick={() => applyMarkdown("`", "`", "code")}><Code2 /></EditorTool>
                    <div className="ml-auto">
                      <Button type="button" variant="ghost" size="sm" disabled={Boolean(description.trim())} onClick={() => setDescription(CASE_STUDY_TEMPLATE)} title={description.trim() ? "Clear the editor to use the starter" : "Insert a useful case-study structure"}><Sparkles />Use starter</Button>
                    </div>
                  </div>
                  <Label htmlFor="project-body" className="sr-only">Case study content</Label>
                  <Textarea ref={editorRef} id="project-body" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Start writing, or use the starter structure above…" maxLength={10000} className="min-h-[34rem] resize-y rounded-none border-0 bg-transparent px-5 py-5 text-[15px] leading-7 shadow-none focus-visible:ring-0 sm:px-7" />
                  <div className="flex items-center justify-between border-t px-4 py-2 text-[11px] text-muted-foreground"><span>Toolbar formatting is shown in the preview.</span><span className="tabular-nums">{description.length}/10,000</span></div>
                </div>
              </EditorSection>
            </div>
          ) : (
            <ProjectPreview title={title} summary={summary} description={description} imageUrl={imageUrl} year={year} accentColor={accentColor} technologies={technologies} />
          )}
        </main>

        <aside className="min-w-0 space-y-4 lg:sticky lg:top-5 lg:self-start">
          <SettingsPanel title="Publishing">
            <SettingSwitch label="Published" description="Visible on your public profile" checked={published} onCheckedChange={setPublished} />
            <SettingSwitch label="Featured project" description="Place it before other work" checked={featured} onCheckedChange={setFeatured} />
          </SettingsPanel>

          <SettingsPanel title="Project details">
            <div className="space-y-1.5"><Label htmlFor="year">Year</Label><Input id="year" type="number" min="1990" max="2100" placeholder="2026" value={year} onChange={(event) => setYear(event.target.value)} /></div>
            <div className="space-y-1.5"><Label htmlFor="technologies">Skills & technologies</Label><Input id="technologies" placeholder="Research, Next.js, PostgreSQL" value={technologies} onChange={(event) => setTechnologies(event.target.value)} /><p className="text-[11px] text-muted-foreground">Separate tags with commas.</p></div>
            <div className="space-y-1.5"><Label htmlFor="project-slug">Project URL</Label><Input id="project-slug" value={slug} onChange={(event) => { setSlugTouched(true); setSlug(slugify(event.target.value)); }} required maxLength={80} /><p className="break-all text-[11px] text-muted-foreground">/work/{slug || "project-name"}</p></div>
          </SettingsPanel>

          <SettingsPanel title="Cover & accent">
            <MediaUploadField id="project-image" label="Cover image" value={imageUrl} onChange={setImageUrl} />
            <fieldset className="space-y-2"><legend className="text-xs font-medium">Accent color</legend><div className="grid grid-cols-5 gap-2">{ACCENTS.map((accent) => <button key={accent.value} type="button" title={accent.label} aria-label={`${accent.label} accent`} aria-pressed={accentColor === accent.value} onClick={() => setAccentColor(accent.value)} className={cn("grid aspect-square place-items-center rounded-md border transition", accentColor === accent.value ? "border-foreground bg-background" : "border-transparent bg-muted hover:border-border")}><span className={cn("size-4 rounded-full", accent.className)} /></button>)}</div></fieldset>
          </SettingsPanel>

          <SettingsPanel title="Optional links">
            <div className="space-y-1.5"><Label htmlFor="liveUrl">Live project</Label><Input id="liveUrl" type="url" placeholder="https://" value={liveUrl} onChange={(event) => setLiveUrl(event.target.value)} /></div>
            <div className="space-y-1.5"><Label htmlFor="repoUrl">Repository</Label><Input id="repoUrl" type="url" placeholder="https://github.com/…" value={repoUrl} onChange={(event) => setRepoUrl(event.target.value)} /></div>
            <div className="space-y-1.5"><Label htmlFor="videoUrl">Video URL</Label><Input id="videoUrl" type="url" placeholder="https://" value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} /></div>
          </SettingsPanel>
        </aside>
      </div>
    </form>
  );
}

function ProjectPreview({ title, summary, description, imageUrl, year, accentColor, technologies }: { title: string; summary: string; description: string; imageUrl: string; year: string; accentColor: AccentColor; technologies: string }) {
  const tags = technologies.split(",").map((tag) => tag.trim()).filter(Boolean);
  return (
    <section className="overflow-hidden rounded-md border bg-background shadow-[0_18px_55px_color-mix(in_oklch,var(--foreground)_7%,transparent)]">
      <div className="flex items-center justify-between border-b bg-card/70 px-4 py-3">
        <div><p className="text-sm font-medium">Project preview</p><p className="text-[11px] text-muted-foreground">Typography and spacing match the public project.</p></div>
        <Eye className="size-4 text-muted-foreground" />
      </div>
      <article className="mx-auto max-w-3xl px-6 py-10 sm:px-10 sm:py-14">
        <header className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <div className={cn("mb-7 h-1 w-12 rounded-full", ACCENTS.find((accent) => accent.value === accentColor)?.className)} />
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Case study</p>
            <h1 className="mt-3 font-editorial text-[2.35rem] leading-[1.02] tracking-[-0.035em] text-balance">{title || "Your project title"}</h1>
            <p className="mt-5 text-base leading-[1.75] text-quiet text-pretty">{summary || "Your short project summary will introduce the challenge and outcome here."}</p>
          </div>
          {year ? <span className="font-editorial pt-7 text-sm italic text-muted-foreground">{year}</span> : null}
        </header>
        {imageUrl ? <PreviewImage src={imageUrl} /> : null}
        <div className="mt-10">{description ? <MarkdownContent content={description} /> : <p className="text-sm italic text-muted-foreground">Your case study will appear here.</p>}</div>
        {tags.length ? <p className="mt-10 text-xs text-muted-foreground">{tags.join("  ·  ")}</p> : null}
        <div className="mt-14 rounded-md bg-card/50 p-6"><p className="font-editorial text-xl">Have a similar challenge?</p><p className="mt-1 text-sm text-muted-foreground">Share the context and get a thoughtful first reply.</p></div>
      </article>
    </section>
  );
}

function PreviewImage({ src }: { src: string }) {
  // User-configured hosts cannot be enumerated at build time.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" className="mt-10 aspect-[16/9] w-full rounded-md object-cover" />;
}

function EditorSection({ step, title, description, children }: { step: string; title: string; description: string; children: React.ReactNode }) {
  return <section className="rounded-md border bg-card/45 p-5 sm:p-6"><div className="flex items-start gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-secondary text-xs font-semibold">{step}</span><div><h2 className="font-medium tracking-tight">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p></div></div><div className="mt-6 space-y-5">{children}</div></section>;
}

function EditorTool({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return <Button type="button" variant="ghost" size="icon-sm" aria-label={label} title={label} onClick={onClick}>{children}</Button>;
}

function SettingsPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="space-y-4 rounded-md border bg-card/45 p-4"><h2 className="text-sm font-medium">{title}</h2>{children}</section>;
}

function SettingSwitch({ label, description, checked, onCheckedChange }: { label: string; description: string; checked: boolean; onCheckedChange: (checked: boolean) => void }) {
  return <div className="flex items-start justify-between gap-3"><div><p className="text-sm">{label}</p><p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">{description}</p></div><Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={label} /></div>;
}
