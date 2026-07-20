"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { updateProfileVisibility } from "@/server/actions/profile";
import { Switch } from "@/components/ui/switch";

export function ProfileVisibility({ published }: { published: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <section className="rounded-xl border bg-card p-6">
      <div className="flex items-center justify-between gap-5">
        <div>
          <h2 className="font-medium tracking-tight">Public profile</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {published ? "Visible to everyone and eligible for search engines." : "Only you can open the private preview."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pending ? <Loader2 className="size-4 animate-spin text-muted-foreground" /> : null}
          <Switch
            checked={published}
            disabled={pending}
            aria-label="Publish profile"
            onCheckedChange={(checked) => startTransition(async () => {
              const result = await updateProfileVisibility(checked);
              if (result.ok) toast.success(checked ? "Profile published" : "Profile moved to draft");
              else toast.error(result.error);
            })}
          />
        </div>
      </div>
    </section>
  );
}
