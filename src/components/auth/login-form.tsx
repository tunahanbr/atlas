"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";

import { signInWithDevLogin, signInWithGitHub } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export function LoginForm({
  hasGitHub,
  devLoginEnabled,
}: {
  hasGitHub: boolean;
  devLoginEnabled: boolean;
}) {
  const [state, action, pending] = useActionState(signInWithDevLogin, undefined);

  return (
    <div className="space-y-4">
      {hasGitHub ? (
        <form action={signInWithGitHub}>
          <Button type="submit" variant="outline" className="w-full rounded-xl" size="lg">
            <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden>
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.7 5.39-5.26 5.68.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .3.2.66.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
            </svg>
            Continue with GitHub
          </Button>
        </form>
      ) : null}

      {hasGitHub && devLoginEnabled ? (
        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>
      ) : null}

      {devLoginEnabled ? (
        <form action={action} className="space-y-4 rounded-xl border bg-card p-5">
          <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
            Development login — any email creates a local development account.
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" placeholder="Ada Lovelace" autoComplete="name" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>
          {state?.error ? (
            <p className="text-xs text-destructive" role="alert">
              {state.error}
            </p>
          ) : null}
          <Button type="submit" className="w-full rounded-xl" size="lg" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            Continue
          </Button>
        </form>
      ) : null}

      {!hasGitHub && !devLoginEnabled ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-sm">
          <p className="font-medium">Sign-in is not configured</p>
          <p className="mt-1 text-muted-foreground">
            Set AUTH_GITHUB_ID and AUTH_GITHUB_SECRET on this instance, then restart Atlas.
          </p>
        </div>
      ) : null}
    </div>
  );
}
