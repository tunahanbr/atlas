"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { BadgeCheck, ChevronDown, ChevronUp, Copy, Download, GripVertical, Link2, Loader2, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

import { createTestimonialRequest, upsertTestimonial, deleteTestimonial } from "@/server/actions/entities";
import { useUpsert, DeleteButton, EmptyState } from "@/components/dashboard/shared";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { initials } from "@/lib/format";
import { useReorder } from "@/components/dashboard/use-reorder";
import { ContentCollectionToolbar, type CollectionFilter } from "@/components/dashboard/content-collection-toolbar";

type Testimonial = {
  id: string;
  authorName: string;
  authorRole: string | null;
  authorCompany: string | null;
  content: string;
  verified: boolean;
  published: boolean;
};

export function TestimonialsManager({ testimonials }: { testimonials: Testimonial[] }) {
  const reorder = useReorder(testimonials, "testimonials");
  const { open, setOpen, pending, submit } = useUpsert(upsertTestimonial);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestPending, startRequestTransition] = useTransition();
  const [requestUrl, setRequestUrl] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<CollectionFilter>("all");
  const visible = useMemo(() => reorder.items.filter((testimonial) => {
    const matchesQuery = `${testimonial.authorName} ${testimonial.authorCompany ?? ""} ${testimonial.content}`.toLowerCase().includes(query.trim().toLowerCase());
    const matchesFilter = filter === "all" || (filter === "published" ? testimonial.published : !testimonial.published);
    return matchesQuery && matchesFilter;
  }), [filter, query, reorder.items]);
  const counts = { all: testimonials.length, published: testimonials.filter((testimonial) => testimonial.published).length, draft: testimonials.filter((testimonial) => !testimonial.published).length };

  useEffect(() => {
    if (!requestUrl) return;
    let active = true;
    QRCode.toDataURL(requestUrl, { width: 320, margin: 2, color: { dark: "#27231f", light: "#fffdf8" } }).then((url) => {
      if (active) setQrUrl(url);
    });
    return () => { active = false; };
  }, [requestUrl]);

  function openNew() { setEditing(null); setOpen(true); }
  function openEdit(t: Testimonial) { setEditing(t); setOpen(true); }

  function createRequest() {
    setRequestUrl("");
    setQrUrl("");
    setRequestOpen(true);
    startRequestTransition(async () => {
      const result = await createTestimonialRequest();
      if (result.ok && result.token) setRequestUrl(`${window.location.origin}/testimonial/${result.token}`);
      else toast.error(result.error ?? "Could not create request link");
    });
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    submit(editing?.id ?? null, {
      authorName: fd.get("authorName"), authorRole: fd.get("authorRole"), authorCompany: fd.get("authorCompany"),
      content: fd.get("content"), published: fd.get("published") === "on",
    });
  }

  const actions = (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" onClick={createRequest}><Link2 className="size-4" />Request testimonial</Button>
      <Button type="button" onClick={openNew}><Plus className="size-4" />Add manually</Button>
    </div>
  );

  return (
    <>
      {testimonials.length === 0 ? (
        <EmptyState title="Let a client answer the trust question" description="Send a private request link. Quotes submitted by clients are marked verified and stay in draft until you approve them.">{actions}</EmptyState>
      ) : (
        <>
        <ContentCollectionToolbar query={query} onQueryChange={setQuery} filter={filter} onFilterChange={setFilter} counts={counts}>{actions}</ContentCollectionToolbar>
        {visible.length ? (
        <ul className="mt-6 divide-y rounded-xl border bg-card">
          {visible.map((t, index) => (
            <li key={t.id} {...reorder.dragProps(t.id)} className="flex items-center gap-3 px-4 py-4">
              <GripVertical className="size-4 cursor-grab text-muted-foreground" aria-hidden />
              <Avatar className="size-9 shrink-0 border"><AvatarFallback className="text-xs">{initials(t.authorName)}</AvatarFallback></Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-medium tracking-tight">{t.authorName}</p>
                  {t.verified ? <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-xs text-emerald-700 dark:text-emerald-300"><BadgeCheck className="size-3" />Client submitted</span> : null}
                  {!t.published ? <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">{t.verified ? "Needs review" : "Draft"}</span> : null}
                  {t.published ? <span className="text-[10px] text-emerald-700 dark:text-emerald-300">Published</span> : null}
                </div>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">{[t.authorRole, t.authorCompany].filter(Boolean).join(", ")} — “{t.content}”</p>
              </div>
              <span className="hidden gap-0.5 sm:flex"><Button variant="ghost" size="icon" aria-label={`Move ${t.authorName} up`} disabled={index === 0 || reorder.pending || filter !== "all" || Boolean(query)} onClick={() => reorder.moveBy(t.id, -1)}><ChevronUp className="size-3.5" /></Button><Button variant="ghost" size="icon" aria-label={`Move ${t.authorName} down`} disabled={index === visible.length - 1 || reorder.pending || filter !== "all" || Boolean(query)} onClick={() => reorder.moveBy(t.id, 1)}><ChevronDown className="size-3.5" /></Button></span>
              <Button variant="ghost" size="icon" aria-label={`Edit ${t.authorName}`} onClick={() => openEdit(t)}><Pencil className="size-4" /></Button>
              <DeleteButton id={t.id} action={deleteTestimonial} label={t.authorName} />
            </li>
          ))}
        </ul>
        ) : <div className="mt-4 rounded-md border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">No testimonials match this view.</div>}
        </>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit testimonial" : "New testimonial"}</DialogTitle><DialogDescription>A concrete outcome or observation is more credible than generic praise.</DialogDescription></DialogHeader>
          <form key={editing?.id ?? "new"} onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5"><Label htmlFor="authorName">Name</Label><Input id="authorName" name="authorName" defaultValue={editing?.authorName} required maxLength={80} /></div>
            <div className="grid gap-4 sm:grid-cols-2"><div className="min-w-0 space-y-1.5"><Label htmlFor="authorRole">Role</Label><Input id="authorRole" name="authorRole" placeholder="CTO" defaultValue={editing?.authorRole ?? ""} maxLength={80} /></div><div className="min-w-0 space-y-1.5"><Label htmlFor="authorCompany">Company</Label><Input id="authorCompany" name="authorCompany" placeholder="Acme Inc." defaultValue={editing?.authorCompany ?? ""} maxLength={80} /></div></div>
            <div className="space-y-1.5"><Label htmlFor="content">Quote</Label><Textarea id="content" name="content" rows={5} defaultValue={editing?.content} required maxLength={1000} /></div>
            <label className="flex items-center gap-2 text-sm"><Switch name="published" defaultChecked={editing?.published ?? true} />Published</label>
            <Button type="submit" className="w-full" disabled={pending}>{pending ? <Loader2 className="size-4 animate-spin" /> : null}{editing ? "Save changes" : "Add testimonial"}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Request a verified testimonial</DialogTitle><DialogDescription>Send this single-use link or let your client scan the QR code. Their quote arrives as a draft for your review.</DialogDescription></DialogHeader>
          {requestPending ? <div className="flex min-h-52 items-center justify-center"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div> : requestUrl ? (
            <div className="space-y-4">
              {qrUrl ? <div className="flex justify-center rounded-md bg-[#fffdf8] p-4"><Image src={qrUrl} alt="QR code for testimonial request" width={220} height={220} unoptimized /></div> : null}
              <div className="flex gap-2"><Input value={requestUrl} readOnly aria-label="Testimonial request link" /><Button type="button" size="icon" variant="outline" aria-label="Copy link" onClick={async () => { await navigator.clipboard.writeText(requestUrl); toast.success("Link copied"); }}><Copy className="size-4" /></Button></div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" className="flex-1" onClick={async () => { await navigator.clipboard.writeText(requestUrl); toast.success("Link copied"); }}><Copy className="size-4" />Copy link</Button>
                {qrUrl ? <Button render={<a href={qrUrl} download="testimonial-request-qr.png" />} nativeButton={false} variant="outline"><Download className="size-4" />Download QR</Button> : null}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
