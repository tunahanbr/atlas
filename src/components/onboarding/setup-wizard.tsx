"use client";

import { useState, useTransition } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";

import { createProfile } from "@/server/actions/profile";
import { USERNAME_REGEX, RESERVED_USERNAMES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const STEPS = ["Username", "Headline", "Availability"] as const;

export function SetupWizard({ defaultName }: { defaultName: string }) {
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState("");
  const [headline, setHeadline] = useState("");
  const [location, setLocation] = useState("");
  const [availability, setAvailability] = useState<
    "AVAILABLE" | "LIMITED" | "UNAVAILABLE"
  >("AVAILABLE");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const usernameValid =
    USERNAME_REGEX.test(username) && !RESERVED_USERNAMES.has(username);

  function next() {
    setError(null);
    if (step === 0 && !usernameValid) {
      setError(
        RESERVED_USERNAMES.has(username)
          ? "This username is reserved"
          : "3–32 characters: lowercase letters, numbers, hyphens",
      );
      return;
    }
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }
    startTransition(async () => {
      const result = await createProfile({ username, headline, location, availability });
      if (!result.ok) setError(result.error ?? "Something went wrong");
      // On success the action redirects.
    });
  }

  return (
    <div className="rounded-xl border bg-card p-6">
      <ol className="mb-6 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <span
              className={cn(
                "flex size-6 items-center justify-center rounded-full text-xs font-medium",
                i < step
                  ? "bg-success text-white"
                  : i === step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {i < step ? <Check className="size-3.5" /> : i + 1}
            </span>
            <span
              className={cn(
                "text-xs",
                i === step ? "font-medium" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
            {i < STEPS.length - 1 ? (
              <span className="mx-1 h-px w-6 bg-border" aria-hidden />
            ) : null}
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <div className="space-y-1.5">
          <Label htmlFor="username">Your username</Label>
          <div className="flex items-center rounded-lg border bg-background focus-within:border-ring">
            <span className="pl-3 text-sm text-muted-foreground">atlas.rocks/</span>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder={defaultName ? defaultName.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "ada"}
              className="border-0 pl-1 focus-visible:ring-0"
              autoFocus
            />
          </div>
          <p className="text-xs text-muted-foreground">
            This becomes your public URL. You can add a custom domain later.
          </p>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="headline">Headline</Label>
            <Input
              id="headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Senior Product Engineer — I build web products"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="location">Location (optional)</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Berlin, Germany"
            />
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-1.5">
          <Label htmlFor="availability">Availability</Label>
          <Select
            value={availability}
            onValueChange={(v) =>
              setAvailability(v as "AVAILABLE" | "LIMITED" | "UNAVAILABLE")
            }
          >
            <SelectTrigger id="availability" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AVAILABLE">Available for work</SelectItem>
              <SelectItem value="LIMITED">Limited availability</SelectItem>
              <SelectItem value="UNAVAILABLE">Not available</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Shown as a badge on your profile. Clients filter by this.
          </p>
        </div>
      ) : null}

      {error ? <p className="mt-3 text-xs text-destructive">{error}</p> : null}

      <Button
        onClick={next}
        disabled={pending || (step === 0 && !username)}
        className="mt-6 w-full rounded-xl"
        size="lg"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        {step === STEPS.length - 1 ? "Create my profile" : "Continue"}
        {!pending && step < STEPS.length - 1 ? <ArrowRight className="size-4" /> : null}
      </Button>
    </div>
  );
}
