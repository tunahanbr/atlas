"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Monitor, Moon, Sun } from "lucide-react";
import { toast } from "sonner";

import { updateTheme } from "@/server/actions/profile";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "system", label: "System", description: "Follows each visitor's OS preference", icon: Monitor },
  { value: "light", label: "Light", description: "Always show your profile in light mode", icon: Sun },
  { value: "dark", label: "Dark", description: "Always show your profile in dark mode", icon: Moon },
] as const;

export function ThemePicker({ current }: { current: string }) {
  const router = useRouter();
  const [selected, setSelected] = useState(current);
  const [pending, startTransition] = useTransition();

  function choose(value: "system" | "light" | "dark") {
    setSelected(value);
    startTransition(async () => {
      const result = await updateTheme(value);
      if (result.ok) {
        toast.success("Appearance saved");
        router.refresh();
      } else {
        toast.error("Could not save");
      }
    });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          disabled={pending}
          onClick={() => choose(option.value)}
          className={cn(
            "flex flex-col items-start gap-3 rounded-xl border bg-card p-5 text-left transition-colors",
            selected === option.value
              ? "border-brand ring-1 ring-brand"
              : "hover:border-foreground/20",
          )}
        >
          <span className="flex items-center gap-2">
            <option.icon className="size-4" />
            <span className="font-medium">{option.label}</span>
            {pending && selected === option.value ? (
              <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
            ) : null}
          </span>
          <span className="text-sm text-muted-foreground">{option.description}</span>
        </button>
      ))}
    </div>
  );
}
