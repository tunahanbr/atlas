"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, GripVertical, Loader2, Pencil, Plus } from "lucide-react";

import { upsertTestimonial, deleteTestimonial } from "@/server/actions/entities";
import { useUpsert, DeleteButton, EmptyState } from "@/components/dashboard/shared";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { initials } from "@/lib/format";
import { useReorder } from "@/components/dashboard/use-reorder";

type Testimonial = {
  id: string;
  authorName: string;
  authorRole: string | null;
  authorCompany: string | null;
  content: string;
  published: boolean;
};

export function TestimonialsManager({ testimonials }: { testimonials: Testimonial[] }) {
  const reorder = useReorder(testimonials, "testimonials");
  const { open, setOpen, pending, submit } = useUpsert(upsertTestimonial);
  const [editing, setEditing] = useState<Testimonial | null>(null);

  function openNew() {
    setEditing(null);
    setOpen(true);
  }

  function openEdit(t: Testimonial) {
    setEditing(t);
    setOpen(true);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    submit(editing?.id ?? null, {
      authorName: fd.get("authorName"),
      authorRole: fd.get("authorRole"),
      authorCompany: fd.get("authorCompany"),
      content: fd.get("content"),
      published: fd.get("published") === "on",
    });
  }

  return (
    <>
      {testimonials.length > 0 ? (
        <div className="flex justify-end">
          <Button onClick={openNew}>
            <Plus className="size-4" />
            Add testimonial
          </Button>
        </div>
      ) : null}

      {testimonials.length === 0 ? (
        <EmptyState
          title="Let a client answer the trust question"
          description="Ask one recent client what changed, what felt different and why they would work with you again. Specific beats polished."
        >
          <Button onClick={openNew} variant="outline">
            <Plus className="size-4" />
            Add a testimonial
          </Button>
        </EmptyState>
      ) : (
        <ul className="mt-6 divide-y rounded-xl border bg-card">
          {reorder.items.map((t, index) => (
            <li key={t.id} {...reorder.dragProps(t.id)} className="flex items-center gap-3 px-4 py-4">
              <GripVertical className="size-4 cursor-grab text-muted-foreground" aria-hidden />
              <Avatar className="size-9 shrink-0 border">
                <AvatarFallback className="text-xs">{initials(t.authorName)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium tracking-tight">{t.authorName}</p>
                  {!t.published ? (
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                      Draft
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  {[t.authorRole, t.authorCompany].filter(Boolean).join(", ")} — “{t.content}”
                </p>
              </div>
              <span className="hidden gap-0.5 sm:flex"><Button variant="ghost" size="icon" aria-label={`Move ${t.authorName} up`} disabled={index === 0 || reorder.pending} onClick={() => reorder.moveBy(t.id, -1)}><ChevronUp className="size-3.5" /></Button><Button variant="ghost" size="icon" aria-label={`Move ${t.authorName} down`} disabled={index === reorder.items.length - 1 || reorder.pending} onClick={() => reorder.moveBy(t.id, 1)}><ChevronDown className="size-3.5" /></Button></span>
              <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => openEdit(t)}>
                <Pencil className="size-4" />
              </Button>
              <DeleteButton id={t.id} action={deleteTestimonial} label={t.authorName} />
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[calc(100svh-2rem)] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit testimonial" : "New testimonial"}</DialogTitle>
            <DialogDescription>
              A concrete outcome or observation is more credible than generic praise.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="authorName">Name</Label>
              <Input id="authorName" name="authorName" defaultValue={editing?.authorName} required maxLength={80} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="authorRole">Role</Label>
                <Input id="authorRole" name="authorRole" placeholder="CTO" defaultValue={editing?.authorRole ?? ""} maxLength={80} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="authorCompany">Company</Label>
                <Input id="authorCompany" name="authorCompany" placeholder="Acme Inc." defaultValue={editing?.authorCompany ?? ""} maxLength={80} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="content">Quote</Label>
              <Textarea id="content" name="content" rows={4} defaultValue={editing?.content} required maxLength={1000} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Switch name="published" defaultChecked={editing?.published ?? true} />
              Published
            </label>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              {editing ? "Save changes" : "Add testimonial"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
