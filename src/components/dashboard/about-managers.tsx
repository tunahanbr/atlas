"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus } from "lucide-react";
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
  const [value, setValue] = useState(
    skills.map((s) => (s.category ? `${s.category}: ${s.name}` : s.name)).join("\n"),
  );

  function save() {
    startTransition(async () => {
      const result = await replaceSkills(value.split("\n"));
      if (result.ok) {
        toast.success("Skills saved");
        router.refresh();
      } else {
        toast.error(result.error ?? "Could not save");
      }
    });
  }

  return (
    <section className="rounded-xl border bg-card p-6">
      <h2 className="font-medium tracking-tight">Skills & tech stack</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        One per line. Group with a prefix, e.g. <code className="text-xs">Frontend: React</code>
      </p>
      <Textarea
        className="mt-4 font-mono text-sm"
        rows={8}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={"Languages: TypeScript\nFrameworks: Next.js\nInfrastructure: PostgreSQL"}
      />
      <div className="mt-4 flex justify-end">
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
        <p className="mt-4 text-sm text-muted-foreground">No experience entries yet.</p>
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
          <form onSubmit={onSubmit} className="space-y-4">
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
        <p className="mt-4 text-sm text-muted-foreground">No certifications yet.</p>
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
          <form onSubmit={onSubmit} className="space-y-4">
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
