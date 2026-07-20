"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, X } from "lucide-react";
import { toast } from "sonner";

import {
  upsertExperience,
  deleteExperience,
  upsertCertification,
  deleteCertification,
  replaceSkills,
} from "@/server/actions/entities";
import { useUpsert, DeleteButton } from "@/components/dashboard/shared";
import { formatDateRange } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

// ─── Skills ───────────────────────────────────────────────────────────────────

export function SkillsForm({ skills }: { skills: { name: string; category: string | null }[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [items, setItems] = useState(skills.map((skill, index) => ({ ...skill, id: `${index}-${skill.name}` })));
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");

  function addSkill() {
    const cleanName = name.trim();
    const cleanCategory = category.trim();
    if (!cleanName) return;
    if (items.some((item) => item.name.toLowerCase() === cleanName.toLowerCase())) {
      toast.error("This skill is already in your list");
      return;
    }
    if (items.length >= 60) {
      toast.error("You can add up to 60 skills");
      return;
    }
    setItems((current) => [...current, { id: `${Date.now()}-${cleanName}`, name: cleanName, category: cleanCategory || null }]);
    setName("");
  }

  function save() {
    startTransition(async () => {
      const result = await replaceSkills(items.map((item) => item.category ? `${item.category}: ${item.name}` : item.name));
      if (result.ok) {
        toast.success("Skills saved");
        router.refresh();
      } else {
        toast.error(result.error ?? "Could not save");
      }
    });
  }

  return (
    <section className="rounded-md bg-card/45 p-6">
      <h2 className="font-editorial text-lg">Skills & tech stack</h2>
      <p className="mt-1 text-sm text-muted-foreground">Add one skill at a time. Categories keep longer lists easy to scan on your profile.</p>

      <div className="mt-5 grid gap-3 rounded-md border bg-background/40 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,.7fr)_auto] sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="new-skill">Skill or technology</Label>
          <Input
            id="new-skill"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addSkill();
              }
            }}
            maxLength={40}
            placeholder="e.g. React"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="skill-category">Category <span className="font-normal text-muted-foreground">(optional)</span></Label>
          <Input id="skill-category" list="skill-categories" value={category} onChange={(event) => setCategory(event.target.value)} maxLength={40} placeholder="e.g. Frontend" />
          <datalist id="skill-categories">
            {["Frontend", "Backend", "Design", "Strategy", "Tools", "Languages"].map((option) => <option key={option} value={option} />)}
          </datalist>
        </div>
        <Button type="button" onClick={addSkill} disabled={!name.trim()}><Plus className="size-4" />Add</Button>
      </div>

      {items.length ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {items.map((item) => (
            <span key={item.id} className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-sm">
              {item.category ? <span className="text-xs text-muted-foreground">{item.category}</span> : null}
              {item.category ? <span className="text-muted-foreground/50">·</span> : null}
              <span>{item.name}</span>
              <button type="button" onClick={() => setItems((current) => current.filter((skill) => skill.id !== item.id))} className="ml-0.5 rounded-full p-0.5 text-muted-foreground transition hover:bg-muted hover:text-foreground" aria-label={`Remove ${item.name}`}>
                <X className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-md border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">No skills added yet. Start with the tools and capabilities most relevant to your services.</p>
      )}

      <div className="mt-5 flex items-center justify-between border-t pt-4">
        <p className="text-xs text-muted-foreground">{items.length}/60 skills</p>
        <Button onClick={save} disabled={pending} variant="outline">
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          Save skills
        </Button>
      </div>
    </section>
  );
}

// ─── Experience ───────────────────────────────────────────────────────────────

type ExperienceItem = {
  id: string;
  company: string;
  role: string;
  description: string | null;
  startDate: Date;
  endDate: Date | null;
  current: boolean;
};

function toMonthInput(d: Date | null): string {
  if (!d) return "";
  const date = new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function ExperienceManager({ items }: { items: ExperienceItem[] }) {
  const { open, setOpen, pending, submit } = useUpsert(upsertExperience);
  const [editing, setEditing] = useState<ExperienceItem | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    submit(editing?.id ?? null, {
      company: fd.get("company"),
      role: fd.get("role"),
      description: fd.get("description"),
      startDate: fd.get("startDate"),
      endDate: fd.get("current") === "on" ? "" : fd.get("endDate"),
      current: fd.get("current") === "on",
    });
  }

  return (
    <section className="rounded-xl border bg-card p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-medium tracking-tight">Experience</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="size-4" />
          Add
        </Button>
      </div>
      {items.length === 0 ? (
        <div className="mt-4 rounded-md bg-background/35 p-4 text-sm text-muted-foreground">
          Add the roles that explain your point of view today. A complete employment history is not required.
        </div>
      ) : (
        <ul className="mt-4 divide-y">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {item.role} · {item.company}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDateRange(item.startDate, item.endDate, item.current)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Edit"
                onClick={() => {
                  setEditing(item);
                  setOpen(true);
                }}
              >
                <Pencil className="size-4" />
              </Button>
              <DeleteButton id={item.id} action={deleteExperience} label={item.role} />
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit experience" : "Add experience"}</DialogTitle>
          </DialogHeader>
          <form key={editing?.id ?? "new"} onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="role">Role</Label>
                <Input id="role" name="role" defaultValue={editing?.role} required maxLength={100} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company">Company</Label>
                <Input id="company" name="company" defaultValue={editing?.company} required maxLength={100} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea id="description" name="description" rows={3} defaultValue={editing?.description ?? ""} maxLength={2000} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="startDate">Start</Label>
                <Input id="startDate" name="startDate" type="month" defaultValue={toMonthInput(editing?.startDate ?? null)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="endDate">End</Label>
                <Input id="endDate" name="endDate" type="month" defaultValue={toMonthInput(editing?.endDate ?? null)} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Switch name="current" defaultChecked={editing?.current ?? false} />
              I currently work here
            </label>
            <Button type="submit" className="w-full rounded-xl" disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              {editing ? "Save changes" : "Add experience"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}

// ─── Certifications ───────────────────────────────────────────────────────────

type CertificationItem = {
  id: string;
  name: string;
  issuer: string;
  year: number | null;
  url: string | null;
};

export function CertificationsManager({ items }: { items: CertificationItem[] }) {
  const { open, setOpen, pending, submit } = useUpsert(upsertCertification);
  const [editing, setEditing] = useState<CertificationItem | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const year = String(fd.get("year") ?? "").trim();
    submit(editing?.id ?? null, {
      name: fd.get("name"),
      issuer: fd.get("issuer"),
      year: year ? parseInt(year, 10) : null,
      url: fd.get("url"),
    });
  }

  return (
    <section className="rounded-xl border bg-card p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-medium tracking-tight">Certifications</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="size-4" />
          Add
        </Button>
      </div>
      {items.length === 0 ? (
        <div className="mt-4 rounded-md bg-background/35 p-4 text-sm text-muted-foreground">
          Optional. Add credentials only when they materially strengthen trust for the work you offer.
        </div>
      ) : (
        <ul className="mt-4 divide-y">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.issuer}
                  {item.year ? `, ${item.year}` : ""}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Edit"
                onClick={() => {
                  setEditing(item);
                  setOpen(true);
                }}
              >
                <Pencil className="size-4" />
              </Button>
              <DeleteButton id={item.id} action={deleteCertification} label={item.name} />
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit certification" : "Add certification"}</DialogTitle>
          </DialogHeader>
          <form key={editing?.id ?? "new"} onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={editing?.name} required maxLength={120} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="issuer">Issuer</Label>
                <Input id="issuer" name="issuer" defaultValue={editing?.issuer} required maxLength={120} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="year">Year</Label>
                <Input id="year" name="year" type="number" min="1950" max="2100" defaultValue={editing?.year ?? ""} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="url">Credential URL (optional)</Label>
              <Input id="url" name="url" type="url" defaultValue={editing?.url ?? ""} placeholder="https://" />
            </div>
            <Button type="submit" className="w-full rounded-xl" disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              {editing ? "Save changes" : "Add certification"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
