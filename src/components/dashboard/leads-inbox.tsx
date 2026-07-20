"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronDown, ChevronUp, CircleCheck, Loader2, Mail, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  addLeadNote,
  deleteLeadNote,
  updateLeadDetails,
  updateLeadStatus,
} from "@/server/actions/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type LeadStatus = "NEW" | "READ" | "QUALIFIED" | "WON" | "LOST" | "ARCHIVED";

type Lead = {
  id: string;
  name: string;
  email: string;
  budget: string | null;
  message: string;
  status: LeadStatus;
  valueCents: number | null;
  currency: string;
  nextFollowUp: Date | null;
  createdAt: Date;
  notes: Array<{ id: string; body: string; createdAt: Date }>;
};

const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "New",
  READ: "Replied",
  QUALIFIED: "Good fit",
  WON: "Won",
  LOST: "Not a fit",
  ARCHIVED: "Archived",
};

const STATUS_HELP: Record<LeadStatus, string> = {
  NEW: "Needs your first reply",
  READ: "You replied; decide whether it fits",
  QUALIFIED: "Worth pursuing; agree on the next step",
  WON: "The inquiry became paid work",
  LOST: "You decided not to pursue it",
  ARCHIVED: "Hidden from the active workflow",
};

const TABS: Record<string, LeadStatus[]> = {
  pipeline: ["NEW", "READ", "QUALIFIED"],
  won: ["WON"],
  lost: ["LOST"],
  archived: ["ARCHIVED"],
};

export function LeadsInbox({ leads, username }: { leads: Lead[]; username: string }) {
  const [tab, setTab] = useState("pipeline");
  const visible = leads.filter((lead) => TABS[tab]?.includes(lead.status));
  const emptyCopy =
    tab === "pipeline"
      ? {
          title: "No conversations yet",
          description: "Your contact form is ready. Open the public profile to check the journey, then share the link where clients already find you.",
        }
      : tab === "won"
        ? { title: "No won work yet", description: "Qualified leads you mark as won will collect here." }
        : tab === "lost"
          ? { title: "Nothing lost", description: "Leads you decide not to pursue will collect here." }
          : { title: "Archive is empty", description: "Old conversations can be moved here without deleting their context." };

  return (
    <>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full max-w-full overflow-hidden sm:w-fit">
          <TabsTrigger value="pipeline">Active</TabsTrigger>
          <TabsTrigger value="won">Won</TabsTrigger>
          <TabsTrigger value="lost">Not a fit</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "pipeline" ? (
        <div className="mt-4 flex flex-col gap-3 rounded-md border bg-card/35 p-4 sm:flex-row sm:items-center sm:gap-2" aria-label="Lead workflow">
          <p className="shrink-0 text-xs font-medium text-muted-foreground">How this works</p>
          {(["NEW", "READ", "QUALIFIED", "WON"] as LeadStatus[]).map((status, index) => (
            <div key={status} className="flex items-center gap-2 text-xs">
              {index > 0 ? <ArrowRight className="hidden size-3 text-muted-foreground sm:block" /> : null}
              <span className="rounded-full bg-background px-2.5 py-1 font-medium">{STATUS_LABELS[status]}</span>
              <span className="text-muted-foreground sm:hidden">{STATUS_HELP[status]}</span>
            </div>
          ))}
          <p className="ml-auto hidden max-w-48 text-right text-[11px] leading-4 text-muted-foreground lg:block">Update the status so every inquiry has a clear next action.</p>
        </div>
      ) : null}

      {visible.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-2 rounded-md bg-card/35 px-6 py-14 text-center">
          <p className="font-editorial text-lg">{emptyCopy.title}</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {emptyCopy.description}
          </p>
          {tab === "pipeline" ? (
            <Button
              render={<Link href={`/${username}#contact`} target="_blank" />}
              nativeButton={false}
              variant="outline"
              className="mt-4"
            >
              Preview the inquiry flow
            </Button>
          ) : null}
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {visible.map((lead) => <LeadCard key={lead.id} lead={lead} />)}
        </ul>
      )}
    </>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<{ ok: boolean; error?: string }>, success?: string) {
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        toast.error(result.error ?? "Could not update lead");
        return;
      }
      if (success) toast.success(success);
      router.refresh();
    });
  }

  const followUp = lead.nextFollowUp
    ? new Date(lead.nextFollowUp).toLocaleDateString("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      })
    : null;

  return (
    <li
      className={cn(
        "rounded-xl border bg-card p-5 transition-opacity",
        lead.status === "NEW" && "border-l-2 border-l-brand",
        pending && "opacity-70",
      )}
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium tracking-tight">{lead.name}</p>
            <StatusBadge status={lead.status} />
            {lead.budget ? (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                {lead.budget}
              </span>
            ) : null}
          </div>
          <a href={`mailto:${lead.email}`} className="mt-0.5 block text-sm text-brand hover:underline">
            {lead.email}
          </a>
          {followUp ? <p className="mt-1 text-xs text-muted-foreground">Follow up {followUp}</p> : null}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            Move to
            <select
              aria-label={`Move ${lead.name} to status`}
              value={lead.status}
              disabled={pending}
              onChange={(event) => run(() => updateLeadStatus(lead.id, event.target.value as LeadStatus), `Moved to ${STATUS_LABELS[event.target.value as LeadStatus]}`)}
              className="h-8 rounded-lg border bg-background px-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <span className="text-xs tabular-nums text-muted-foreground">
            {new Date(lead.createdAt).toLocaleDateString("en", { month: "short", day: "numeric" })}
          </span>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
        {lead.message}
      </p>

      <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <CircleCheck className="size-3.5" />
        {STATUS_HELP[lead.status]}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button render={<a href={`mailto:${lead.email}`} onClick={() => { if (lead.status === "NEW") run(() => updateLeadStatus(lead.id, "READ"), "Marked as replied"); }} />} nativeButton={false} size="sm" className="rounded-lg">
          <Mail className="size-4" /> Reply
        </Button>
        <Button variant="outline" size="sm" className="rounded-lg" onClick={() => setExpanded((value) => !value)}>
          {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          Next steps & notes
          {lead.notes.length > 0 ? ` (${lead.notes.length})` : ""}
        </Button>
      </div>

      {expanded ? (
        <div className="mt-5 grid gap-5 border-t pt-5 lg:grid-cols-2">
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              const value = data.get("value")?.toString().trim();
              const nextFollowUp = data.get("nextFollowUp")?.toString() || null;
              run(
                () => updateLeadDetails(lead.id, {
                  valueCents: value ? Math.round(Number(value) * 100) : null,
                  currency: data.get("currency")?.toString() || lead.currency,
                  nextFollowUp,
                }),
                "Lead details saved",
              );
            }}
          >
            <div>
              <p className="text-sm font-medium">Plan the next step</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Add an estimated value and a follow-up date so promising conversations do not go quiet.</p>
            </div>
            <div className="grid grid-cols-[1fr_6rem] gap-2">
              <div>
                <label htmlFor={`value-${lead.id}`} className="text-xs font-medium">Deal value</label>
                <Input key={`value-${lead.id}-${lead.valueCents ?? "none"}`} id={`value-${lead.id}`} name="value" type="number" min="0" step="0.01" defaultValue={lead.valueCents === null ? "" : lead.valueCents / 100} className="mt-1" />
              </div>
              <div>
                <label htmlFor={`currency-${lead.id}`} className="text-xs font-medium">Currency</label>
                <select key={`currency-${lead.id}-${lead.currency}`} id={`currency-${lead.id}`} name="currency" defaultValue={lead.currency} className="mt-1 h-8 w-full rounded-lg border bg-background px-2 text-sm">
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor={`follow-up-${lead.id}`} className="text-xs font-medium">Next follow-up</label>
              <Input key={`follow-up-${lead.id}-${lead.nextFollowUp ? new Date(lead.nextFollowUp).toISOString() : "none"}`} id={`follow-up-${lead.id}`} name="nextFollowUp" type="date" defaultValue={lead.nextFollowUp ? new Date(lead.nextFollowUp).toISOString().slice(0, 10) : ""} className="mt-1" />
            </div>
            <Button type="submit" size="sm" variant="outline" disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : null} Save details
            </Button>
          </form>

          <div>
            <div className="mb-3">
              <p className="text-sm font-medium">Private notes</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Only you can see these. Capture requirements, call outcomes or what to ask next.</p>
            </div>
            <NoteForm leadId={lead.id} pending={pending} run={run} />
            {lead.notes.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {lead.notes.map((note) => (
                  <li key={note.id} className="rounded-lg bg-muted p-3 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <p className="whitespace-pre-line">{note.body}</p>
                      <button
                        type="button"
                        aria-label="Delete note"
                        disabled={pending}
                        onClick={() => run(() => deleteLeadNote(note.id), "Note deleted")}
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      {new Date(note.createdAt).toLocaleString("en", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      ) : null}
    </li>
  );
}

function NoteForm({
  leadId,
  pending,
  run,
}: {
  leadId: string;
  pending: boolean;
  run: (action: () => Promise<{ ok: boolean; error?: string }>, success?: string) => void;
}) {
  const [note, setNote] = useState("");
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const body = note;
        run(async () => {
          const result = await addLeadNote(leadId, body);
          if (result.ok) setNote("");
          return result;
        }, "Note added");
      }}
    >
      <label htmlFor={`note-${leadId}`} className="text-xs font-medium">Internal note</label>
      <Textarea id={`note-${leadId}`} value={note} onChange={(event) => setNote(event.target.value)} rows={3} maxLength={2000} placeholder="Call outcome, requirements, next step…" className="mt-1" />
      <Button type="submit" size="sm" variant="outline" disabled={pending || !note.trim()} className="mt-2">
        <Plus className="size-4" /> Add note
      </Button>
    </form>
  );
}

function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-medium",
        status === "NEW" && "bg-brand/10 text-brand",
        status === "READ" && "bg-secondary text-secondary-foreground",
        status === "QUALIFIED" && "bg-blue-500/10 text-blue-600 dark:text-blue-400",
        status === "WON" && "bg-success/10 text-success",
        status === "LOST" && "bg-destructive/10 text-destructive",
        status === "ARCHIVED" && "bg-muted text-muted-foreground",
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
