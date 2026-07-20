"use client";

import { useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

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
const STEP_COPY = [
  {
    title: "Choose your public address",
    description: "Short and easy to say out loud works best.",
  },
  {
    title: "Make your work understandable",
    description: "Say what you do and who it helps — without a list of tools.",
  },
  {
    title: "Set the right expectation",
    description: "Visitors should know whether now is a good time to reach out.",
  },
] as const;

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
    <div className="rounded-md bg-card/60 p-6 shadow-[0_20px_60px_color-mix(in_oklch,var(--foreground)_6%,transparent)] sm:p-8">
      <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        <span>Step {step + 1} of {STEPS.length}</span>
        <span>{STEPS[step]}</span>
      </div>
      <div className="mt-3 flex gap-1" aria-hidden="true">
        {STEPS.map((label, i) => (
          <span
            key={label}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-500",
              i <= step ? "bg-brand" : "bg-muted",
            )}
          />
        ))}
      </div>
      <h2 className="font-editorial mt-7 text-2xl tracking-[-0.02em]">
        {STEP_COPY[step].title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {STEP_COPY[step].description}
      </p>

      {step === 0 ? (
        <div className="mt-7 space-y-1.5">
          <Label htmlFor="username">Your username</Label>
          <div className="flex items-center rounded-md border bg-background/50 focus-within:border-ring">
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
        <div className="mt-7 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="headline">Headline</Label>
            <Input
              id="headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Senior Product Engineer — I build web products"
              maxLength={120}
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
        <div className="mt-7 space-y-1.5">
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
            This appears beside your intro and can be changed at any time.
          </p>
        </div>
      ) : null}

      {error ? <p className="mt-3 text-xs text-destructive">{error}</p> : null}

      <div className="mt-7 flex items-center gap-3">
        {step > 0 ? (
          <Button type="button" variant="ghost" size="lg" onClick={() => setStep(step - 1)}>
            <ArrowLeft className="size-4" />
            Back
          </Button>
        ) : null}
        <Button
          onClick={next}
          disabled={pending || (step === 0 && !username)}
          className="flex-1"
          size="lg"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {step === STEPS.length - 1 ? "Publish my profile" : "Continue"}
          {!pending && step < STEPS.length - 1 ? <ArrowRight className="size-4" /> : null}
        </Button>
      </div>
    </div>
  );
}
