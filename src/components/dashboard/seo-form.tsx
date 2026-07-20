"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { updateSeo } from "@/server/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function SeoForm({
  seoTitle,
  seoDescription,
}: {
  seoTitle: string | null;
  seoDescription: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateSeo({
        seoTitle: String(fd.get("seoTitle") ?? ""),
        seoDescription: String(fd.get("seoDescription") ?? ""),
      });
      if (result.ok) {
        toast.success("SEO settings saved");
        router.refresh();
      } else {
        toast.error("Could not save");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border bg-card p-6">
      <h2 className="font-medium tracking-tight">Search & social</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Overrides the defaults generated from your name and headline.
      </p>
      <div className="mt-4 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="seoTitle">Meta title</Label>
          <Input
            id="seoTitle"
            name="seoTitle"
            defaultValue={seoTitle ?? ""}
            placeholder="Jane Doe — Senior Product Engineer"
            maxLength={120}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="seoDescription">Meta description</Label>
          <Textarea
            id="seoDescription"
            name="seoDescription"
            rows={3}
            defaultValue={seoDescription ?? ""}
            maxLength={300}
          />
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button type="submit" disabled={pending} className="rounded-xl">
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          Save
        </Button>
      </div>
    </form>
  );
}
