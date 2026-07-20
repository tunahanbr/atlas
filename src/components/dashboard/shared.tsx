"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { ActionResult } from "@/server/actions/profile";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Wraps an upsert action: shows toasts, closes dialog on success, refreshes.
export function useUpsert(action: (id: string | null, input: unknown) => Promise<ActionResult>) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function submit(id: string | null, input: unknown) {
    startTransition(async () => {
      const result = await action(id, input);
      if (result.ok) {
        toast.success(id ? "Saved changes" : "Created");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Something went wrong");
      }
    });
  }

  return { open, setOpen, pending, submit };
}

export function DeleteButton({
  id,
  action,
  label,
}: {
  id: string;
  action: (id: string) => Promise<ActionResult>;
  label: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="ghost" size="icon" aria-label={`Delete ${label}`} disabled={pending} onClick={() => setOpen(true)}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete “{label}”?</DialogTitle><DialogDescription>This removes it from your dashboard and public profile. This action cannot be undone.</DialogDescription></DialogHeader>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="button" variant="destructive" disabled={pending} onClick={() => startTransition(async () => {
              const result = await action(id);
              if (result.ok) { toast.success("Deleted"); setOpen(false); router.refresh(); }
              else toast.error(result.error ?? "Could not delete");
            })}>{pending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 pb-7 sm:flex-row">
      <div>
        <h1 className="font-editorial text-2xl font-normal tracking-[-0.02em]">{title}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-md bg-card/35 px-6 py-14 text-center">
      <p className="font-editorial text-lg">{title}</p>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
