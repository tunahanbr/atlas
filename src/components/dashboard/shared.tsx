"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { ActionResult } from "@/server/actions/profile";
import { Button } from "@/components/ui/button";

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
  const confirmed = useRef(false);

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={`Delete ${label}`}
      disabled={pending}
      onClick={() => {
        if (!confirmed.current) {
          confirmed.current = true;
          toast(`Click again to delete ${label}`, { icon: "⚠️" });
          setTimeout(() => (confirmed.current = false), 3000);
          return;
        }
        startTransition(async () => {
          const result = await action(id);
          if (result.ok) {
            toast.success("Deleted");
            router.refresh();
          } else {
            toast.error(result.error ?? "Could not delete");
          }
        });
      }}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
    </Button>
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
    <div className="flex items-start justify-between gap-4 pb-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
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
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center">
      <p className="font-medium">{title}</p>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
