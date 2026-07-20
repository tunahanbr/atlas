"use client";

import { useState, useTransition } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { uploadImage } from "@/server/actions/media";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function MediaUploadField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [preview, setPreview] = useState(value);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <label htmlFor={id} className="flex min-h-24 cursor-pointer items-center gap-4 rounded-md bg-muted/55 p-3 transition-colors hover:bg-muted">
        {/* User-configured Supabase hosts cannot be enumerated at build time. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {preview ? <img src={preview} alt="" className="size-16 rounded-md object-cover" /> : <span className="grid size-16 place-items-center rounded-md bg-background"><ImagePlus className="size-5 text-muted-foreground" /></span>}
        <span className="text-sm text-muted-foreground">{pending ? "Uploading…" : "Choose JPEG, PNG or WebP · max. 5 MB"}</span>
        {pending ? <Loader2 className="ml-auto size-4 animate-spin" /> : null}
      </label>
      <Input
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        disabled={pending}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          startTransition(async () => {
            const formData = new FormData();
            formData.set("file", file);
            const result = await uploadImage(formData);
            if (!result.ok || !result.url) {
              toast.error(result.error ?? "Upload failed");
              return;
            }
            setPreview(result.url);
            onChange(result.url);
            toast.success("Image uploaded");
          });
        }}
      />
      {value ? <button type="button" className="text-xs text-muted-foreground underline-offset-4 hover:underline" onClick={() => { setPreview(""); onChange(""); }}>Remove image</button> : null}
    </div>
  );
}
